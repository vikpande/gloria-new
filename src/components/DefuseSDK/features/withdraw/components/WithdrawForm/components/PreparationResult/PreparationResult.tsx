import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Button, Callout } from "@radix-ui/themes"
import type { TokenValue } from "@src/components/DefuseSDK/types/base"
import type { ReactNode } from "react"
import type { PreparationOutput } from "../../../../../../services/withdrawService"
import { formatTokenValue } from "../../../../../../utils/format"

export const PreparationResult = ({
  preparationOutput,
  increaseAmount,
  decreaseAmount,
}: {
  preparationOutput: PreparationOutput | null
  increaseAmount: (v: TokenValue) => void
  decreaseAmount: (v: TokenValue) => void
}) => {
  if (preparationOutput?.tag !== "err") return null

  let content: ReactNode = null
  const err = preparationOutput.value
  const val = err.reason

  switch (val) {
    case "ERR_CANNOT_FETCH_POA_BRIDGE_INFO":
      content = "Cannot fetch POA Bridge info"
      break
    case "ERR_BALANCE_INSUFFICIENT":
      // Don't duplicate error messages, this should be handled by input validation
      break
    case "ERR_AMOUNT_TOO_LOW":
      content = (
        <>
          Need add{" "}
          <Button
            onClick={() => {
              increaseAmount(err.shortfall)
            }}
            variant="ghost"
            className="underline"
          >
            {formatTokenValue(err.shortfall.amount, err.shortfall.decimals)}{" "}
            {err.token.symbol}
          </Button>{" "}
          more to withdraw
        </>
      )
      break
    case "ERR_NO_QUOTES":
    case "ERR_NO_QUOTES_1CS":
    case "ERR_INSUFFICIENT_AMOUNT":
      // Don't duplicate error messages, message should be displayed in the submit button
      break
    case "ERR_CANNOT_FETCH_QUOTE":
      content = "Cannot fetch quote"
      break
    case "ERR_BALANCE_FETCH":
    case "ERR_BALANCE_MISSING":
      content = "Cannot fetch balance"
      break
    case "ERR_UNFULFILLABLE_AMOUNT":
      content = (
        <>
          Specified amount cannot be withdrawn. Please,{" "}
          <Button
            onClick={() => {
              decreaseAmount(err.shortfall)
            }}
            variant="ghost"
            className="underline"
          >
            decrease
          </Button>
          {" or "}
          <Button
            onClick={() => {
              if (err.overage != null) {
                increaseAmount(err.overage)
              }
            }}
            variant="ghost"
            className="underline"
          >
            increase
          </Button>
          {" for slight amount."}
        </>
      )
      break
    case "ERR_WITHDRAWAL_FEE_FETCH":
      content = "Cannot fetch withdrawal fee"
      break
    case "ERR_STELLAR_NO_TRUSTLINE":
      content = `Recipient must have at least some ${err.token.symbol} on Stellar to be able to withdraw it.`
      break
    case "ERR_CANNOT_MAKE_WITHDRAWAL_INTENT":
      content = "Operation could not be completed. Please try again."
      break
    default:
      val satisfies never
      content = val
  }

  if (content == null) return null

  return (
    <Callout.Root size="1" color="red">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>{content}</Callout.Text>
    </Callout.Root>
  )
}
