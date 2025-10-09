"use client"

import { Text } from "@radix-ui/themes"
import { useTonConnectUI } from "@tonconnect/ui-react"
import Button from "antd/es/button"
import Image from "next/image"

export function TonConnectButton() {
  const [tonConnectUI] = useTonConnectUI()

  return (
    <Button
      type="default"
      variant="outlined"
      onClick={() => {
        void tonConnectUI.openModal()
      }}
      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
    >
      <div className="w-full flex items-center justify-start gap-2">
        <Image
          src="/static/icons/wallets/ton.svg"
          alt=""
          width={28}
          height={28}
        />
        <Text size="2" weight="bold">
          TON
        </Text>
      </div>
    </Button>
  )
}
