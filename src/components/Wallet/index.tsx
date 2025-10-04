"use client"

import { Button, Popover, Text } from "@radix-ui/themes"
import Image from "next/image"
import { useContext } from "react"
import type { Connector } from "wagmi"

import WalletConnections from "@src/components/Wallet/WalletConnections"
import { isSupportedByBrowser } from "@src/features/webauthn/lib/webauthnService"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import { useSignInWindowOpenState } from "@src/stores/useSignInWindowOpenState"
import { mapStringToEmojis } from "@src/utils/emoji"
import { TonConnectButton } from "./TonConnectButton"

const ConnectWallet = () => {
  const { isOpen, setIsOpen } = useSignInWindowOpenState()
  const { state, signIn, connectors } = useConnectWallet()
  const { shortAccountId } = useShortAccountId(state.displayAddress ?? "")
  const { whitelabelTemplate } = useContext(FeatureFlagsContext)

  const handleNearWalletSelector = () => {
    return signIn({ id: ChainType.Near })
  }

  const handleWalletConnect = (connector: Connector) => {
    return signIn({ id: ChainType.EVM, connector })
  }

  const handleSolanaWalletSelector = () => {
    return signIn({ id: ChainType.Solana })
  }

  const handlePasskey = () => {
    return signIn({ id: ChainType.WebAuthn })
  }

  if (!state.address) {
    return (
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <Button type={"button"} variant={"solid"} size={"2"} radius={"full"}>
            <Text weight="bold" wrap="nowrap">
              Sign in
            </Text>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          maxWidth={{ initial: "90vw", xs: "480px" }}
          minWidth={{ initial: "300px", xs: "330px" }}
          maxHeight={{ initial: "70vh", sm: "90vh" }}
          className="md:mr-[48px] dark:bg-black-800 rounded-2xl"
        >
          <Text size="1">How do you want to sign in?</Text>
          <div className="w-full grid grid-cols-1 gap-4 mt-4">
            <Text size="1" color="gray">
              Popular options
            </Text>

            {/* {isSupportedByBrowser() && (
              <Button
                onClick={() => handlePasskey()}
                size="4"
                radius="medium"
                variant="soft"
                color="gray"
                className="px-2.5"
              >
                <div className="w-full flex items-center justify-start gap-2">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Text size="2" weight="bold">
                    Passkey
                  </Text>
                </div>
              </Button>
            )} */}

            {whitelabelTemplate === "turboswap" ? (
              <>
                {/* WalletConnect */}
                {connectors
                  .filter((c) => c.id === "walletConnect")
                  .map((connector) => (
                    <Button
                      key={connector.uid}
                      onClick={() => handleWalletConnect(connector)}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <WalletIcon connector={connector} />
                        <Text size="2" weight="bold">
                          {renderWalletName(connector)}
                        </Text>
                      </div>
                    </Button>
                  ))}

                {/* EIP-6963 detected wallets */}
                {connectors
                  .filter((c) => c.type === "injected" && c.id !== "injected")
                  .map((connector) => (
                    <Button
                      key={connector.uid}
                      onClick={() => handleWalletConnect(connector)}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <WalletIcon connector={connector} />
                        <Text size="2" weight="bold">
                          {renderWalletName(connector)}
                        </Text>
                      </div>
                    </Button>
                  ))}

                <TonConnectButton />

                <Text size="1" color="gray">
                  Other options
                </Text>

                <Button
                  onClick={handleNearWalletSelector}
                  size="4"
                  radius="medium"
                  variant="soft"
                  color="gray"
                  className="px-2.5"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/near-wallet-selector.svg"
                      alt="Near Wallet Selector"
                      width={36}
                      height={36}
                    />
                    <Text size="2" weight="bold">
                      NEAR Wallet
                    </Text>
                  </div>
                </Button>

                <Button
                  onClick={handleSolanaWalletSelector}
                  size="4"
                  radius="medium"
                  variant="soft"
                  color="gray"
                  className="px-2.5"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/solana-logo-mark.svg"
                      alt="Solana Wallet Selector"
                      width={36}
                      height={36}
                    />
                    <Text size="2" weight="bold">
                      Solana Wallet
                    </Text>
                  </div>
                </Button>

                {/* Other non-EIP-6963 connectors */}
                {connectors
                  .filter(
                    (c) => c.id !== "walletConnect" && c.type !== "injected"
                  )
                  .map((connector) => (
                    <Button
                      key={connector.uid}
                      onClick={() => handleWalletConnect(connector)}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <WalletIcon connector={connector} />
                        <Text size="2" weight="bold">
                          {renderWalletName(connector)}
                        </Text>
                      </div>
                    </Button>
                  ))}
              </>
            ) : (
              // Original order for other templates
              <>
                <Button
                  onClick={handleSolanaWalletSelector}
                  size="4"
                  radius="medium"
                  variant="soft"
                  color="gray"
                  className="px-2.5"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/solana-logo-mark.svg"
                      alt="Solana Wallet Selector"
                      width={36}
                      height={36}
                    />
                    <Text size="2" weight="bold">
                      Solana Wallet
                    </Text>
                  </div>
                </Button>

                {whitelabelTemplate !== "solswap" && (
                  <>
                    <Button
                      onClick={handleNearWalletSelector}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/wallets/near-wallet-selector.svg"
                          alt="Near Wallet Selector"
                          width={36}
                          height={36}
                        />
                        <Text size="2" weight="bold">
                          NEAR Wallet
                        </Text>
                      </div>
                    </Button>
                    {connectors.slice(0, 1).map((connector) => (
                      <Button
                        key={connector.uid}
                        onClick={() => handleWalletConnect(connector)}
                        size="4"
                        radius="medium"
                        variant="soft"
                        color="gray"
                        className="px-2.5"
                      >
                        <div className="w-full flex items-center justify-start gap-2">
                          <WalletIcon connector={connector} />
                          <Text size="2" weight="bold">
                            {renderWalletName(connector)}
                          </Text>
                        </div>
                      </Button>
                    ))}

                    <TonConnectButton />

                    {/* Stellar connector */}
                    <Button
                      onClick={() => signIn({ id: ChainType.Stellar })}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/network/stellar.svg"
                          alt="Stellar"
                          width={36}
                          height={36}
                        />
                        <Text size="2" weight="bold">
                          Stellar Wallet
                        </Text>
                      </div>
                    </Button>

                    {/* Tron connector */}
                    <Button
                      onClick={() => signIn({ id: ChainType.Tron })}
                      size="4"
                      radius="medium"
                      variant="soft"
                      color="gray"
                      className="px-2.5"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/network/tron.svg"
                          alt="Tron"
                          width={36}
                          height={36}
                        />
                        <Text size="2" weight="bold">
                          Tron Wallet
                        </Text>
                      </div>
                    </Button>

                    <Text size="1" color="gray">
                      Other options
                    </Text>
                    {connectors
                      .slice(1)
                      .filter((connector) => connector.id !== "injected")
                      .map((connector) => (
                        <Button
                          key={connector.uid}
                          onClick={() => handleWalletConnect(connector)}
                          size="4"
                          radius="medium"
                          variant="soft"
                          color="gray"
                          className="px-2.5"
                        >
                          <div className="w-full flex items-center justify-start gap-2">
                            <WalletIcon connector={connector} />
                            <Text size="2" weight="bold">
                              {renderWalletName(connector)}
                            </Text>
                          </div>
                        </Button>
                      ))}
                  </>
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
    )
  }

  return (
    <div className="flex gap-2">
      <Popover.Root>
        <Popover.Trigger>
          <Button
            type={"button"}
            variant={"soft"}
            color={"gray"}
            size={"2"}
            radius={"full"}
            className="font-bold text-gray-12"
          >
            {state.chainType !== "webauthn" ? (
              shortAccountId
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full size-6 bg-[#000]"
                    style={{
                      mask: "radial-gradient(13px at 31px 50%, transparent 99%, rgb(255, 255, 255) 100%)",
                    }}
                  />
                  <div className="-ml-1 rounded-full size-6 bg-white text-black text-base flex items-center justify-center">
                    {mapStringToEmojis(state.address, { count: 1 }).join("")}
                  </div>
                </div>

                <div className="font-bold text-gray-12">passkey</div>
              </div>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content
          minWidth={{ initial: "300px", xs: "330px" }}
          className="mt-1 md:mr-[48px] max-w-xs dark:bg-black-800 rounded-2xl"
        >
          <div className="flex flex-col gap-5">
            <WalletConnections />
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

function WalletIcon({ connector }: { connector: Connector }) {
  switch (connector.id) {
    case "walletConnect":
      return (
        <Image
          src="/static/icons/wallets/wallet-connect.svg"
          alt="Wallet Connect"
          width={36}
          height={36}
        />
      )
    case "coinbaseWalletSDK":
      return (
        <Image
          src="/static/icons/wallets/coinbase-wallet.svg"
          alt="Coinbase Wallet"
          width={36}
          height={36}
        />
      )
    case "metaMaskSDK":
      return (
        <Image
          src="/static/icons/wallets/meta-mask.svg"
          alt="MetaMask"
          width={36}
          height={36}
        />
      )
  }

  if (connector.icon != null) {
    return (
      <Image
        src={connector.icon.trim()}
        alt={connector.name}
        width={36}
        height={36}
      />
    )
  }
}

function renderWalletName(connector: Connector) {
  return connector.name
}

export default ConnectWallet
