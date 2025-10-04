import { type SnapshotFromStore, createStore } from "@xstate/store"
import type { BaseTokenInfo, TokenInfo, TokenValue } from "../../../types/base"
import { parseUnits } from "../../../utils/parse"
import {
  getAnyBaseTokenInfo,
  getTokenMaxDecimals,
} from "../../../utils/tokenUtils"
import { type Expiry, parseExpiry } from "../utils/expiryUtils"
import type { OTCMarkerFormValuesState } from "./otcMakerFormValuesStore"

type State = {
  tokenIn: null | TokenInfo
  tokenOut: null | BaseTokenInfo
  amountIn: null | TokenValue
  amountOut: null | TokenValue
  expiry: null | Expiry
}

export const createOTCMakerFormParsedValuesStore = () =>
  createStore({
    context: {
      amountIn: null,
      amountOut: null,
      tokenIn: null,
      tokenOut: null,
      expiry: null,
    } as State,
    emits: {
      valuesParsed: (_: { context: State }) => {},
    },
    on: {
      parseValues: (
        context,
        { formValues }: { formValues: OTCMarkerFormValuesState },
        enqueue
      ) => {
        const tokenOut =
          formValues.tokenOut != null
            ? getAnyBaseTokenInfo(formValues.tokenOut)
            : null

        const newContext = {
          ...context,
          amountIn: parseTokenValue(formValues.tokenIn, formValues.amountIn),
          amountOut: parseTokenValue(tokenOut, formValues.amountOut),
          tokenIn: formValues.tokenIn,
          tokenOut,
          expiry: parseExpiry(formValues.expiry),
        }
        enqueue.emit.valuesParsed({ context: newContext })
        return newContext
      },
    },
  })

function parseTokenValue(
  token: null | TokenInfo,
  value: string
): TokenValue | null {
  if (token == null) return null
  const decimals = getTokenMaxDecimals(token)
  try {
    return {
      amount: parseUnits(value, decimals),
      decimals,
    }
  } catch {
    return null
  }
}

export function allSetSelector(
  s: SnapshotFromStore<ReturnType<typeof createOTCMakerFormParsedValuesStore>>
) {
  return (
    s.context.tokenIn != null &&
    s.context.tokenOut != null &&
    s.context.amountIn != null &&
    s.context.amountOut != null
  )
}
