import { Eye, Gift, PaperPlaneRight, Plus } from "@phosphor-icons/react"
import { Button, Skeleton } from "@radix-ui/themes"
import { useState } from "react"
import { AuthGate } from "../../../components/AuthGate"
import { Island } from "../../../components/Island"
import { IslandHeader } from "../../../components/IslandHeader"
import type { RenderHostAppLink } from "../../../types/hostAppLink"
import { RevealAddressDialog } from "./RevealAddressDialog"
import { FormattedCurrency } from "./shared/FormattedCurrency"
import { IntentsIcon } from "./shared/IntentsIcon"
import { NavButton } from "./shared/NavButton"

export function SummaryIsland({
  isLoggedIn,
  valueUsd,
  renderHostAppLink,
  internalUserAddress,
}: {
  isLoggedIn: boolean
  valueUsd: number | undefined
  renderHostAppLink: RenderHostAppLink
  internalUserAddress: string | null
}) {
  valueUsd = isLoggedIn ? valueUsd : 0
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <Island className="flex flex-col gap-8">
      <IslandHeader
        heading="Account"
        rightSlot={
          isLoggedIn ? (
            <Button
              variant="soft"
              color="gray"
              radius="full"
              className="font-bold text-gray-12"
              onClick={() => setIsRevealed(true)}
            >
              <IntentsIcon className="rounded-full" />
              Reveal address <Eye weight="bold" />
            </Button>
          ) : null
        }
      />

      {isRevealed && internalUserAddress != null && (
        <RevealAddressDialog
          internalUserAddress={internalUserAddress}
          onClose={() => setIsRevealed(false)}
        />
      )}

      <div className="flex flex-col gap-2">
        {valueUsd != null ? (
          <FormattedCurrency
            value={valueUsd}
            formatOptions={{ currency: "USD" }}
            className="text-[40px] leading-none tracking-tight font-black"
            centsClassName="text-[32px]"
          />
        ) : (
          <div>
            <Skeleton className="text-[40px] leading-none">$1000.00</Skeleton>
          </div>
        )}
        <div className="text-sm font-medium text-gray-11">
          Deposited balance
        </div>
      </div>

      <AuthGate renderHostAppLink={renderHostAppLink} shouldRender={isLoggedIn}>
        <div className="flex gap-4">
          <NavButton
            routeName="deposit"
            renderHostAppLink={renderHostAppLink}
            className="flex-1"
            variant="primary"
            label="Deposit"
            icon={<Plus weight="bold" className="size-5" />}
          />
          <NavButton
            routeName="withdraw"
            renderHostAppLink={renderHostAppLink}
            className="flex-1"
            variant="secondary"
            label="Withdraw"
            icon={<PaperPlaneRight weight="bold" className="size-5" />}
          />
          <NavButton
            routeName="gift"
            renderHostAppLink={renderHostAppLink}
            className="flex-1"
            variant="secondary"
            label="Gift"
            icon={<Gift weight="bold" className="size-5" />}
          />
        </div>
      </AuthGate>
    </Island>
  )
}
