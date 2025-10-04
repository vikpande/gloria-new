import type { BlockchainEnum } from "@defuse-protocol/internal-utils"
import { resolveTokenOut } from "@src/components/DefuseSDK/features/machines/withdrawFormReducer"
import { reverseAssetNetworkAdapter } from "@src/components/DefuseSDK/utils/adapters"
import { assert } from "@src/components/DefuseSDK/utils/assert"
import { parseUnits } from "@src/components/DefuseSDK/utils/parse"
import { LIST_TOKENS_FLATTEN, tokenFamilies } from "@src/constants/tokens"
import { type ActorRef, type Snapshot, fromTransition } from "xstate"
import type {
  BaseTokenInfo,
  SupportedChainName,
  TokenDeployment,
} from "../../types/base"
import type { TokenInfo } from "../../types/base"
import { isBaseToken } from "../../utils"

export type Fields = Array<Exclude<keyof State, "parentRef">>
const fields: Fields = ["token", "blockchain", "parsedAmount", "amount"]

export type ParentEvents = {
  type: "DEPOSIT_FORM_FIELDS_CHANGED"
  fields: Fields
}
type ParentActor = ActorRef<Snapshot<unknown>, ParentEvents>

export type Events =
  | {
      type: "DEPOSIT_FORM.UPDATE_TOKEN"
      params: {
        token: TokenInfo
      }
    }
  | {
      type: "DEPOSIT_FORM.UPDATE_BLOCKCHAIN"
      params: {
        network: BlockchainEnum | null
      }
    }
  | {
      type: "DEPOSIT_FORM.UPDATE_AMOUNT"
      params: {
        amount: string
      }
    }

export type State = {
  parentRef: ParentActor
  token: TokenInfo | null
  derivedToken: BaseTokenInfo | null
  tokenDeployment: TokenDeployment | null
  blockchain: SupportedChainName | null
  parsedAmount: bigint | null
  amount: string
}

export const depositFormReducer = fromTransition(
  (state, event: Events) => {
    let newState = state
    const eventType = event.type
    switch (eventType) {
      case "DEPOSIT_FORM.UPDATE_TOKEN": {
        newState = {
          ...state,
          token: event.params.token,
          derivedToken: null,
          tokenDeployment: null,
          blockchain: null,
          parsedAmount: null,
          amount: "",
        }
        break
      }
      case "DEPOSIT_FORM.UPDATE_BLOCKCHAIN": {
        if (event.params.network == null || state.token == null) {
          newState = {
            ...state,
            blockchain: null,
            derivedToken: null,
            tokenDeployment: null,
            parsedAmount: null,
            amount: "",
          }
          break
        }
        const blockchain = reverseAssetNetworkAdapter[event.params.network]

        const [derivedToken, tokenDeployment] = resolveTokenOut(
          blockchain,
          state.token,
          tokenFamilies,
          LIST_TOKENS_FLATTEN
        )

        // This isn't possible assertion, if this happens then we need to check the token list
        assert(derivedToken != null, "Token not found")
        newState = {
          ...state,
          blockchain,
          derivedToken,
          tokenDeployment,
          parsedAmount: null,
          amount: "",
        }
        break
      }
      case "DEPOSIT_FORM.UPDATE_AMOUNT": {
        const token = state.tokenDeployment
        // Use catch to prevent invalid amount as not numberish string from stopping the deposit UI machine
        try {
          assert(token != null, "Token not found")
          const amount = event.params.amount

          const parsedAmount = amount
            ? parseUnits(amount, token.decimals)
            : null
          newState = {
            ...state,
            parsedAmount,
            amount,
          }
        } catch {
          newState = {
            ...state,
            parsedAmount: null,
            amount: "",
          }
        }
        break
      }
      default:
        event satisfies never
        return state
    }

    const changedFields: Fields = []
    for (const key of fields) {
      if (newState[key] !== state[key]) {
        changedFields.push(key)
      }
    }
    if (changedFields.length > 0) {
      state.parentRef.send({
        type: "DEPOSIT_FORM_FIELDS_CHANGED",
        fields: changedFields,
      })
    }

    return newState
  },
  ({
    input,
  }: {
    input: { parentRef: ParentActor; token: TokenInfo }
  }): State => {
    let blockchain: SupportedChainName | null = null
    let tokenDeployment: TokenDeployment | null = null
    let derivedToken: BaseTokenInfo | null = null

    if (isBaseToken(input.token)) {
      derivedToken = input.token
      tokenDeployment = input.token.deployments[0]
      blockchain = tokenDeployment.chainName
    }

    return {
      parentRef: input.parentRef,
      token: input.token,
      derivedToken,
      tokenDeployment,
      blockchain,
      parsedAmount: null,
      amount: "",
    }
  }
)
