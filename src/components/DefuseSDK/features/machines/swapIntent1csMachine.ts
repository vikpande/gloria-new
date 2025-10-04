import {
  errors,
  solverRelay,
  withTimeout,
} from "@defuse-protocol/internal-utils"
import type { walletMessage } from "@defuse-protocol/internal-utils"
import type { AuthMethod } from "@defuse-protocol/internal-utils"
import { retry } from "@lifeomic/attempt"
import { getQuote as get1csQuoteApi } from "@src/components/DefuseSDK/features/machines/1cs"
import { submitTxHash } from "@src/components/DefuseSDK/features/machines/1cs"
import type { ParentEvents as Background1csQuoterParentEvents } from "@src/components/DefuseSDK/features/machines/background1csQuoterMachine"
import { logger } from "@src/utils/logger"
import type { providers } from "near-api-js"
import { assign, fromPromise, setup } from "xstate"
import { createTransferMessage } from "../../core/messages"
import { convertPublishIntentToLegacyFormat } from "../../sdk/solverRelay/utils/parseFailedPublishError"
import type { BaseTokenInfo } from "../../types/base"
import type { IntentsUserId } from "../../types/intentsUserId"
import { assert } from "../../utils/assert"
import { verifyWalletSignature } from "../../utils/verifyWalletSignature"
import {
  type WalletErrorCode,
  extractWalletErrorCode,
} from "../../utils/walletErrorExtractor"
import type { Quote1csInput } from "./background1csQuoterMachine"
import {
  type ErrorCodes as PublicKeyVerifierErrorCodes,
  publicKeyVerifierMachine,
} from "./publicKeyVerifierMachine"
import type { IntentDescription } from "./swapIntentMachine"

type Context = {
  input: Input
  userAddress: string
  userChainType: AuthMethod
  nearClient: providers.Provider
  quote1csResult:
    | {
        ok: {
          quote: {
            amountIn: string
            amountOut: string
            deadline?: string
            depositAddress?: string
          }
          appFee: [string, bigint][]
        }
      }
    | { err: string }
    | null
  walletMessage: walletMessage.WalletMessage | null
  signature: walletMessage.WalletSignatureResult | null
  intentHash: string | null
  error: null | {
    tag: "err"
    value:
      | {
          reason:
            | "ERR_1CS_QUOTE_FAILED"
            | "ERR_NO_DEPOSIT_ADDRESS"
            | "ERR_TRANSFER_MESSAGE_FAILED"
            | "ERR_USER_DIDNT_SIGN"
            | "ERR_CANNOT_VERIFY_SIGNATURE"
            | "ERR_SIGNED_DIFFERENT_ACCOUNT"
            | "ERR_PUBKEY_EXCEPTION"
            | "ERR_CANNOT_PUBLISH_INTENT"
            | WalletErrorCode
            | PublicKeyVerifierErrorCodes
          error: Error | null
        }
      | {
          reason: "ERR_CANNOT_PUBLISH_INTENT"
          server_reason: string
        }
  }
}

type Input = Quote1csInput & {
  userAddress: string
  userChainType: AuthMethod
  nearClient: providers.Provider
  previousAmountOut?: { amount: bigint; decimals: number }
  parentRef?: {
    send: (
      event:
        | Background1csQuoterParentEvents
        | {
            type: "PRICE_CHANGE_CONFIRMATION_REQUEST"
            params: {
              newAmountOut: { amount: bigint; decimals: number }
              previousAmountOut?: { amount: bigint; decimals: number }
            }
          }
    ) => void
  }
}

export type Output =
  | NonNullable<Context["error"]>
  | {
      tag: "ok"
      value: {
        intentHash: string
        depositAddress: string
        intentDescription: IntentDescription
      }
    }

export const swapIntent1csMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    output: {} as Output,
  },
  actions: {
    setError: assign({
      error: (_, error: NonNullable<Context["error"]>["value"]) => ({
        tag: "err" as const,
        value: error,
      }),
    }),
    logError: (_, params: { error: unknown }) => {
      logger.error(params.error)
    },
    set1csQuoteResult: assign({
      quote1csResult: (_, result: NonNullable<Context["quote1csResult"]>) =>
        result,
    }),
    setWalletMessage: assign({
      walletMessage: (_, walletMessage: walletMessage.WalletMessage) =>
        walletMessage,
    }),
    setSignature: assign({
      signature: (_, signature: walletMessage.WalletSignatureResult | null) =>
        signature,
    }),
    setIntentHash: assign({
      intentHash: (_, intentHash: string) => intentHash,
    }),

    notifyQuoteResult: ({ context }) => {
      if (context.quote1csResult) {
        const tokenInAssetId = context.input.tokenIn.defuseAssetId
        const tokenOutAssetId = context.input.tokenOut.defuseAssetId

        context.input.parentRef?.send({
          type: "NEW_1CS_QUOTE",
          params: {
            result: context.quote1csResult,
            quoteInput: context.input,
            tokenInAssetId,
            tokenOutAssetId,
          },
        })
      }
    },
  },
  actors: {
    fetch1csQuoteActor: fromPromise(
      async ({
        input,
      }: { input: Quote1csInput & { userChainType: AuthMethod } }) => {
        const tokenInAssetId = input.tokenIn.defuseAssetId
        const tokenOutAssetId = input.tokenOut.defuseAssetId

        return get1csQuoteApiWithRetry({
          dry: false,
          slippageTolerance: Math.round(input.slippageBasisPoints / 100),
          originAsset: tokenInAssetId,
          destinationAsset: tokenOutAssetId,
          amount: input.amountIn.amount.toString(),
          deadline: input.deadline,
          userAddress: input.userAddress,
          authMethod: input.userChainType,
        })
      }
    ),
    createTransferMessageActor: fromPromise(
      async ({
        input,
      }: {
        input: {
          tokenIn: BaseTokenInfo
          amountIn: { amount: bigint; decimals: number }
          depositAddress: string
          defuseUserId: string
          deadline: string
        }
      }): Promise<walletMessage.WalletMessage> => {
        // Create the transfer message using createTransferMessage
        const tokenInAssetId = input.tokenIn.defuseAssetId

        const walletMessage = createTransferMessage(
          [[tokenInAssetId, input.amountIn.amount]], // tokenDeltas
          {
            signerId: input.defuseUserId as IntentsUserId, // signer
            receiverId: input.depositAddress, // receiver (deposit address from 1CS)
            deadlineTimestamp: new Date(input.deadline).getTime(),
          }
        )

        return walletMessage
      }
    ),
    verifySignatureActor: fromPromise(
      ({
        input,
      }: {
        input: {
          signature: walletMessage.WalletSignatureResult
          userAddress: string
        }
      }) => {
        return verifyWalletSignature(input.signature, input.userAddress)
      }
    ),
    publicKeyVerifierActor: publicKeyVerifierMachine,
    signMessage: fromPromise(
      async (_: {
        input: walletMessage.WalletMessage
      }): Promise<walletMessage.WalletSignatureResult | null> => {
        throw new Error("signMessage actor must be provided by the parent")
      }
    ),
    broadcastMessage: fromPromise(
      async ({
        input,
      }: {
        input: {
          signatureData: walletMessage.WalletSignatureResult
          userInfo: { userAddress: string; userChainType: AuthMethod }
        }
      }) =>
        solverRelay
          .publishIntent(input.signatureData, input.userInfo, [])
          .then(convertPublishIntentToLegacyFormat)
    ),
    submitTxHashActor: fromPromise(
      async ({
        input,
      }: {
        input: { depositAddress: string; txHash: string }
      }) => {
        return await submitTxHash({
          depositAddress: input.depositAddress,
          txHash: input.txHash,
        })
      }
    ),
  },
  guards: {
    isSigned: (_, params: walletMessage.WalletSignatureResult | null) =>
      params != null,
    isTrue: (_, params: boolean) => params,
    isOk: (_, params: { tag: "ok" } | { tag: "err" }) => params.tag === "ok",
    isQuoteSuccess: ({ context }) => {
      return (
        context.quote1csResult != null &&
        "ok" in context.quote1csResult &&
        context.quote1csResult.ok.quote.depositAddress != null
      )
    },
    isWorseThanPrevious: ({ context }) => {
      const prev = context.input.previousAmountOut
      if (
        context.quote1csResult == null ||
        !("ok" in context.quote1csResult) ||
        context.quote1csResult.ok.quote.amountOut == null ||
        prev == null
      ) {
        return false
      }

      return BigInt(context.quote1csResult.ok.quote.amountOut) < prev.amount
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwO4EMAOBaAlgOwBcxCsBGAY1gDoAxMA8gC3ygtgEUBXAeyIGII3PGCr4AbtwDWI1JlyFiBMpVr0mLNl15gE47uTQEcQgNoAGALrmLiUBm6wcRobZAAPRACYAnAFYqACzewQAcIQDMZt4hZgBssQA0IACeXuGeVOG+pAEA7OEhpLmkwQGxAL7lSbLY+EQkbKoMzHislFr8YABOXdxdVBgANoYAZn0AtlQ18vVKjXTNGu08RLp4EgbOeNbWrvaOW64eCD7+QaERUTHxSakIhYGhsblhvrkBnr6+ldXotQoNFQANTQgxwEEMLA6YD4uyQIH2TmMeCOiFyZhCVDMZlyLxeZlInk+uVuiACRSopF8sVIsTM2Q+sWpPxA0zqimU1BBYIhRla0NhpBs8MRh3hx3RmOxuJC+MJxNJCGeUs+3lihR8uW8tJZbIBc2BoPBkP5KxhJk8wrsDiRLnFaIxWJxeJi8reis84ViVHRPgCIX9ZkisXCur+Mw5jQAgugka0AApdHDkMAAYUYaFaaaEIxwXXGkKEfHjACUAJKpgCiAH1UwAJKMAOQA4jXUwB5Rs0MslgCylYAInDrQdkaiEISAuFAqRwt5PHTSFTYgEAoqvv4zAuoivvFqAr4QmG5OzAdQY2g41BE8m0xms6mc3mC1ti+Wq7WGy2202qwAZP9B2HBEbTFUBjknadyTnbcl2pVdFXCXEqHnPxch8WJPAJT0AmPf5Zk5KhUy6MATSgAAVLpM1gEZul7OBYDQGABCEEQ9GkKZw1PA1qGI0i+Qoqi8BouiGKYnQ9E2ZEdksPZQLHe0JxCTxcioGJV3VbwPipdDFXRAIsRCOl4M8IIvW8PCIzPIiSLIyjqNorp6NgRjmO6Xp+iGUYJk4k99UIvi7KEkSnLEmA1g2QttksYDRQU8DEFIZTVPUsoQi0zwdM8ddMsCOIsO1alZ2iSzuMIgBlHAoDwFgWOEUR1ikGQqrwZzXLAWL5LtBKTg+DJMpCXwFyJIlikVQbpyS3J1VyN5wg+XxcKqVkuP8xpKuq2r3L6AZhgIMZ8ymFq2vEzrR269wvD6qgBqGzCRrGlJEGeb06W8GD8hxQpSrW4FuhwEZkhYDa8EMTgSLqtjGo4vUCMaIF-sB4GWrBkiIv0KKZKtEDzpRRTPDCMw1KnQ9-Uw9JfHCRUlxDQIiQJJLPWKDEfrhv6kyR1oQdRmFBHq9iZFWtmuURoGuZRghwYkxqpNMGKhTk3HxwJmJiayAMjM9T4qae+5wlINTCTeEN6T6zxWcjdmAbFqBucliHts8vaDsmWHLZFjmbbtqX0dl6KrFkkUurxnqVaJgN1bJrXKcVecDOmw9wkiXE4PN5a3eshHPZYeNOAAIzBcgAGkwGSRM4GIFNIYaiQOIwfPC5L5Is4BnBuhLMARjO20Q8uhAvS9H0g1nMw8nQ2lqdnVSMOCXw9x8DFvnToX3aoFvOevBvkyb8vYEr3nWJrpqBi34vS-Xtuug7ruFaDpXFIH710X1yIx8yxJdZyebMnpWk55eXw2JQzLz8sLNeosc6nx3iRPeeAq6O12t5Q69cC7b3PojS+19u5gT7o-IeL9R64nftTIa09SajUASUeaFtrIACFehoAgAYWAAkyz6mrgLXy+FV70O4Iw5hrD9S+0xjFQOI4e7jgWhkOI8R3joSMjrO4hI-DE28FuRaRJCi4hoTxKgvD+FoBYSwNhswOHQ0FqAnhDCmGGMEbMYRWwdi33ETg44Hwpw3SZAebIlN6a+EnsETIs0CYYgKjSYBvxLF0OsQI4x7CEFeX2j5DOuj9E2KMa0ExigHHSVEdjOKF03GmWnAuRaXwqTpCwv4z+OJvAoU0rOZ4tIXhHhAdw6y5V87jCcAJcibg6yGMYGY2uFj2m6M6XnbpBBen9MGTkuWAd8nB0kdEAymt8iegDDkamSEDZBCCMbQBKlR46Iql0npLA+kDNgEMhJztkkrw6ec6ZlzZk3Pmf7bB8U+5BADGpTCGyCjkjXJ-T40iwhahXDSHIKlKjLTwNwCAcBXApM5IrCRiksAfzuFip0BJVyrkGibbUpz5hqBaG0DgZp0WuLJNlGp08tx7iKPBF+pLDQ8jItCGl3zjh3RQgnL0ykYj6xBXcBcqlX5zypPKGkS1IljMIheK8N4UzpkzDAR8eBcz5iijywpiB3pSmdKPaIsoY66znAbNRNJoikHpG8IkESVpRN0YFXpwVHInRgPq3uEFsiqWCHuV4fh0ovHXHkSkUQCi0hiJlLI7LqAgxYL65WcEqCHmpJUmkuImR6S3JkI2TJPj+kWrkRN4Ds7i2qjzVN+MaQZEhbEbUq53iEkUYgQaeycglBXEGea+sK3rxtrnVBZ8y4wP3nWnq6RIj4KiItNUpk8iTx8HTLCMb3oBEIRWtJsTMn6mnbg6I049zxFNvSJdHaJxLkbcy7dhKpzOtRetZ5MzrmMCPW4jZalF3ZB7XI6mKlVJaiKHuLILL5UusVY0R84whj0EgF+xAQ0cjE30jEdK716VKJ8FBTNspsSfHiFBl9KhKw9D6MhhAZQ53zmpCKw8RkxWJSXJNdCl6kpMnSEtSoQA */
  id: "swap-intent-1cs",

  context: ({ input }) => ({
    input,
    userAddress: input.userAddress,
    userChainType: input.userChainType,
    nearClient: input.nearClient,
    quote1csResult: null,
    walletMessage: null,
    signature: null,
    intentHash: null,
    error: null,
  }),

  initial: "Fetching1csQuote",

  output: ({ context }): Output => {
    if (context.intentHash != null) {
      assert(
        context.quote1csResult != null &&
          "ok" in context.quote1csResult &&
          context.quote1csResult.ok.quote.depositAddress != null,
        "Deposit address must be set when intent hash is available"
      )

      return {
        tag: "ok",
        value: {
          intentHash: context.intentHash,
          depositAddress: context.quote1csResult.ok.quote.depositAddress,
          intentDescription: {
            type: "swap",
            totalAmountIn: context.input.amountIn,
            totalAmountOut: {
              amount: BigInt(context.quote1csResult.ok.quote.amountOut ?? "0"),
              decimals: context.input.tokenOut.decimals,
            },
            depositAddress: context.quote1csResult.ok.quote.depositAddress,
          },
        },
      }
    }

    if (context.error != null) {
      return context.error
    }

    throw new Error("Unexpected output state")
  },

  states: {
    Fetching1csQuote: {
      invoke: {
        src: "fetch1csQuoteActor",
        input: ({ context }) => context.input,
        onDone: {
          target: "ValidatingQuote",
          actions: [
            {
              type: "set1csQuoteResult",
              params: ({ event }) => event.output,
            },
            "notifyQuoteResult",
          ],
        },
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => {
                return {
                  reason: "ERR_1CS_QUOTE_FAILED",
                  error:
                    event.error instanceof Error
                      ? event.error
                      : new Error(String(event.error)),
                }
              },
            },
          ],
        },
      },
    },

    ValidatingQuote: {
      always: [
        {
          target: "AwaitingPriceChangeConfirmation",
          guard: {
            type: "isWorseThanPrevious",
          },
        },
        {
          target: "CreatingTransferMessage",
          guard: {
            type: "isQuoteSuccess",
          },
        },
        {
          target: "Error",
          actions: {
            type: "setError",
            params: ({ context }) => {
              if (!context.quote1csResult || "err" in context.quote1csResult) {
                return {
                  reason: "ERR_1CS_QUOTE_FAILED",
                  error: new Error(
                    context.quote1csResult && "err" in context.quote1csResult
                      ? context.quote1csResult.err
                      : "Unknown quote error"
                  ),
                }
              }
              return {
                reason: "ERR_NO_DEPOSIT_ADDRESS",
                error: new Error(
                  "1CS quote succeeded but no deposit address provided"
                ),
              }
            },
          },
        },
      ],
    },

    AwaitingPriceChangeConfirmation: {
      entry: ({ context }) => {
        if (context.quote1csResult && "ok" in context.quote1csResult) {
          const amountOut = BigInt(context.quote1csResult.ok.quote.amountOut)
          context.input.parentRef?.send({
            type: "PRICE_CHANGE_CONFIRMATION_REQUEST",
            params: {
              newAmountOut: {
                amount: amountOut,
                decimals: context.input.tokenOut.decimals,
              },
              previousAmountOut: context.input.previousAmountOut,
            },
          })
        }
      },
      on: {
        PRICE_CHANGE_CONFIRMED: {
          target: "CreatingTransferMessage",
        },
        PRICE_CHANGE_CANCELLED: {
          target: "Error",
          actions: {
            type: "setError",
            params: {
              reason: "ERR_WALLET_CANCEL_ACTION",
              error: null,
            },
          },
        },
      },
    },

    CreatingTransferMessage: {
      invoke: {
        src: "createTransferMessageActor",
        input: ({ context }) => {
          assert(
            context.quote1csResult != null && "ok" in context.quote1csResult
          )
          assert(context.quote1csResult.ok.quote.depositAddress != null)

          return {
            tokenIn: context.input.tokenIn,
            amountIn: context.input.amountIn,
            depositAddress: context.quote1csResult.ok.quote.depositAddress,
            defuseUserId: context.input.defuseUserId,
            deadline: context.input.deadline,
          }
        },
        onDone: {
          target: "Signing",
          actions: {
            type: "setWalletMessage",
            params: ({ event }) => event.output,
          },
        },
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => ({
                reason: "ERR_TRANSFER_MESSAGE_FAILED",
                error:
                  event.error instanceof Error
                    ? event.error
                    : new Error(String(event.error)),
              }),
            },
          ],
        },
      },
    },

    Signing: {
      invoke: {
        id: "signMessage",
        src: "signMessage",
        input: ({ context }) => {
          assert(context.walletMessage != null, "Wallet message is not set")
          return context.walletMessage
        },
        onDone: {
          target: "VerifyingSignature",
          actions: {
            type: "setSignature",
            params: ({ event }) => event.output,
          },
        },
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => ({
                reason: extractWalletErrorCode(
                  event.error,
                  "ERR_USER_DIDNT_SIGN"
                ),
                error: errors.toError(event.error),
              }),
            },
          ],
        },
      },
    },

    VerifyingSignature: {
      invoke: {
        src: "verifySignatureActor",
        input: ({ context }) => {
          assert(context.signature != null, "Signature is not set")
          return {
            signature: context.signature,
            userAddress: context.userAddress,
          }
        },
        onDone: [
          {
            target: "VerifyingPublicKeyPresence",
            guard: {
              type: "isTrue",
              params: ({ event }) => event.output,
            },
          },
          {
            target: "Error",
            actions: {
              type: "setError",
              params: {
                reason: "ERR_SIGNED_DIFFERENT_ACCOUNT",
                error: null,
              },
            },
          },
        ],
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => ({
                reason: "ERR_CANNOT_VERIFY_SIGNATURE",
                error: errors.toError(event.error),
              }),
            },
          ],
        },
      },
    },

    VerifyingPublicKeyPresence: {
      invoke: {
        id: "publicKeyVerifierRef",
        src: "publicKeyVerifierActor",
        input: ({ context }) => {
          assert(context.signature != null, "Signature is not set")

          return {
            nearAccount:
              context.signature.type === "NEP413"
                ? context.signature.signatureData
                : null,
            nearClient: context.nearClient,
          }
        },
        onDone: [
          {
            target: "BroadcastingIntent",
            guard: {
              type: "isOk",
              params: ({ event }) => event.output,
            },
          },
          {
            target: "Error",
            actions: {
              type: "setError",
              params: ({ event }) => {
                assert(event.output.tag === "err", "Expected error")
                return {
                  reason: event.output.value,
                  error: null,
                }
              },
            },
          },
        ],
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => ({
                reason: "ERR_PUBKEY_EXCEPTION",
                error: errors.toError(event.error),
              }),
            },
          ],
        },
      },
    },

    BroadcastingIntent: {
      invoke: {
        src: "broadcastMessage",
        input: ({ context }) => {
          assert(context.signature != null, "Signature is not set")

          return {
            signatureData: context.signature,
            userInfo: {
              userAddress: context.userAddress,
              userChainType: context.userChainType,
            },
          }
        },
        onDone: [
          {
            target: "SubmittingTxHash",
            guard: {
              type: "isOk",
              params: ({ event }) => event.output,
            },
            actions: {
              type: "setIntentHash",
              params: ({ event }) => {
                assert(event.output.tag === "ok")
                return event.output.value
              },
            },
          },
          {
            target: "Error",
            actions: {
              type: "setError",
              params: ({ event }) => {
                assert(event.output.tag === "err")
                return {
                  reason: "ERR_CANNOT_PUBLISH_INTENT",
                  server_reason: event.output.value.reason,
                }
              },
            },
          },
        ],
        onError: {
          target: "Error",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
            {
              type: "setError",
              params: ({ event }) => ({
                reason: "ERR_CANNOT_PUBLISH_INTENT",
                error: errors.toError(event.error),
              }),
            },
          ],
        },
      },
    },

    SubmittingTxHash: {
      invoke: {
        src: "submitTxHashActor",
        input: ({ context }) => {
          assert(
            context.quote1csResult != null && "ok" in context.quote1csResult
          )
          assert(context.quote1csResult.ok.quote.depositAddress != null)
          assert(context.intentHash != null)

          return {
            depositAddress: context.quote1csResult.ok.quote.depositAddress,
            txHash: context.intentHash,
          }
        },
        onDone: {
          target: "Completed",
        },
        onError: {
          target: "Completed",
          actions: [
            {
              type: "logError",
              params: ({ event }) => event,
            },
          ],
        },
      },
    },

    Completed: {
      type: "final",
    },

    Error: {
      type: "final",
    },
  },
})

const get1csQuoteApiWithRetry: typeof get1csQuoteApi = (...args) => {
  return retry(
    () =>
      withTimeout(
        () => get1csQuoteApi(...args),
        { timeout: 15000 } // Quote takes 10s in the worst scenario
      ),
    { maxAttempts: 3, delay: 500 }
  )
}
