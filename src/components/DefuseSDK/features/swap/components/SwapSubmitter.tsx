import type { authHandle } from "@defuse-protocol/internal-utils"
import { logger } from "@src/utils/logger"
import { type ReactNode, createContext } from "react"
import { nearClient } from "../../../constants/nearClient"
import { SwapUIMachineContext } from "./SwapUIMachineProvider"

export const SwapSubmitterContext = createContext<{
  onSubmit: () => void
}>({
  onSubmit: () => {},
})

export function SwapSubmitterProvider({
  children,
  userAddress,
  userChainType,
}: {
  children: ReactNode
  userAddress: authHandle.AuthHandle["identifier"] | undefined
  userChainType: authHandle.AuthHandle["method"] | undefined
}) {
  const actorRef = SwapUIMachineContext.useActorRef()

  const onSubmit = () => {
    if (userAddress == null || userChainType == null) {
      logger.warn("No user address provided")
      return
    }

    actorRef.send({
      type: "submit",
      params: {
        userAddress,
        userChainType,
        nearClient,
      },
    })
  }

  return (
    <SwapSubmitterContext.Provider value={{ onSubmit }}>
      {children}
    </SwapSubmitterContext.Provider>
  )
}
