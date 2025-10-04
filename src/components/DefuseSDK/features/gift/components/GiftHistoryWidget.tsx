"use client"
import { authIdentity } from "@defuse-protocol/internal-utils"
import type { AuthMethod } from "@defuse-protocol/internal-utils"
import { useMemo } from "react"
import { WidgetRoot } from "../../../components/WidgetRoot"
import type { SignerCredentials } from "../../../core/formatters"
import { SwapWidgetProvider } from "../../../providers/SwapWidgetProvider"
import type { TokenInfo } from "../../../types/base"
import { useGiftMakerHistory } from "../stores/giftMakerHistory"
import type { GenerateLink } from "../types/sharedTypes"

import { GiftHistory } from "./shared/GiftHistory"

export type GiftHistoryWidgetProps = {
  userAddress: string | null | undefined
  userChainType: AuthMethod | null | undefined
  generateLink: GenerateLink
  tokenList: TokenInfo[]
}

export function GiftHistoryWidget({
  generateLink,
  userAddress,
  userChainType,
  tokenList,
}: GiftHistoryWidgetProps) {
  const signerCredentials: SignerCredentials | null = useMemo(() => {
    return userAddress && userChainType
      ? {
          credential: userAddress,
          credentialType: userChainType,
        }
      : null
  }, [userChainType, userAddress])

  const gifts = useGiftMakerHistory((s) => {
    if (!signerCredentials) {
      return undefined
    }
    const userId = authIdentity.authHandleToIntentsUserId(
      signerCredentials.credential,
      signerCredentials.credentialType
    )
    return s.gifts[userId]
  })

  return (
    <WidgetRoot>
      <div className="widget-container flex flex-col gap-5">
        <SwapWidgetProvider>
          <GiftHistory
            signerCredentials={signerCredentials}
            tokenList={tokenList}
            generateLink={generateLink}
            gifts={gifts}
          />
        </SwapWidgetProvider>
      </div>
    </WidgetRoot>
  )
}
