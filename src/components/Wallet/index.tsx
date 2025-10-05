"use client"

import { Popover, Text } from "@radix-ui/themes"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import type { Connector } from "wagmi"

import { WalletOutlined } from "@ant-design/icons"
import WalletConnections from "@src/components/Wallet/WalletConnections"
import { isSupportedByBrowser } from "@src/features/webauthn/lib/webauthnService"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import { useSignInWindowOpenState } from "@src/stores/useSignInWindowOpenState"
import { mapStringToEmojis } from "@src/utils/emoji"
import { Button } from "antd"
import { TonConnectButton } from "./TonConnectButton"

const ConnectWallet = () => {
  const { isOpen, setIsOpen } = useSignInWindowOpenState()
  const { state, signIn, connectors } = useConnectWallet()
  const { shortAccountId } = useShortAccountId(state.displayAddress ?? "")
  const { whitelabelTemplate } = useContext(FeatureFlagsContext)
  const router = useRouter()

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
          <Button
            type="primary"
            className="bg-black text-white hover:bg-gray-900"
          >
            Sign in
          </Button>
        </Popover.Trigger>
        <Popover.Content
          maxWidth={{ initial: "90vw", xs: "480px" }}
          minWidth={{ initial: "300px", xs: "330px" }}
          maxHeight={{ initial: "70vh", sm: "90vh" }}
          className="md:mr-[48px] bg-white border border-gray-200 rounded-xl shadow-lg"
        >
          <div className="w-full grid grid-cols-1 gap-4">
            <Text size="2" className="text-black">
              Popular options
            </Text>

            {isSupportedByBrowser() && (
              <Button
                type="default"
                variant="outlined"
                onClick={() => handlePasskey()}
                className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
              >
                <div className="w-full flex items-center justify-start gap-2">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={28}
                    height={28}
                  />
                  <Text size="2" weight="bold">
                    Passkey
                  </Text>
                </div>
              </Button>
            )}

            {whitelabelTemplate === "turboswap" ? (
              <>
                {/* WalletConnect */}
                {connectors
                  .filter((c) => c.id === "walletConnect")
                  .map((connector) => (
                    <Button
                      key={connector.uid}
                      type="default"
                      variant="outlined"
                      onClick={() => handleWalletConnect(connector)}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
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
                      type="default"
                      variant="outlined"
                      onClick={() => handleWalletConnect(connector)}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
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
                  type="default"
                  variant="outlined"
                  onClick={handleNearWalletSelector}
                  className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/near-wallet-selector.svg"
                      alt="Near Wallet Selector"
                      width={28}
                      height={28}
                    />
                    <Text size="2" weight="bold">
                      NEAR Wallet
                    </Text>
                  </div>
                </Button>

                <Button
                  type="default"
                  variant="outlined"
                  onClick={handleSolanaWalletSelector}
                  className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/solana-logo-mark.svg"
                      alt="Solana Wallet Selector"
                      width={28}
                      height={28}
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
                      type="default"
                      variant="outlined"
                      onClick={() => handleWalletConnect(connector)}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
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
                  type="default"
                  variant="outlined"
                  onClick={handleSolanaWalletSelector}
                  className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                >
                  <div className="w-full flex items-center justify-start gap-2">
                    <Image
                      src="/static/icons/wallets/solana-logo-mark.svg"
                      alt="Solana Wallet Selector"
                      width={28}
                      height={28}
                    />
                    <Text size="2" weight="bold">
                      Solana Wallet
                    </Text>
                  </div>
                </Button>

                {whitelabelTemplate !== "solswap" && (
                  <>
                    <Button
                      type="default"
                      variant="outlined"
                      onClick={handleNearWalletSelector}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/wallets/near-wallet-selector.svg"
                          alt="Near Wallet Selector"
                          width={28}
                          height={28}
                        />
                        <Text size="2" weight="bold">
                          NEAR Wallet
                        </Text>
                      </div>
                    </Button>
                    {connectors.slice(0, 1).map((connector) => (
                      <Button
                        key={connector.uid}
                        type="default"
                        variant="outlined"
                        onClick={() => handleWalletConnect(connector)}
                        className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
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
                      type="default"
                      variant="outlined"
                      onClick={() => signIn({ id: ChainType.Stellar })}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/network/stellar.svg"
                          alt="Stellar"
                          width={28}
                          height={28}
                        />
                        <Text size="2" weight="bold">
                          Stellar Wallet
                        </Text>
                      </div>
                    </Button>

                    {/* Tron connector */}
                    <Button
                      type="default"
                      variant="outlined"
                      onClick={() => signIn({ id: ChainType.Tron })}
                      className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <Image
                          src="/static/icons/network/tron.svg"
                          alt="Tron"
                          width={28}
                          height={28}
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
                          type="default"
                          variant="outlined"
                          onClick={() => handleWalletConnect(connector)}
                          className="w-full px-4 py-2 shadow-sm h-auto custom-wallet-button"
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
        <>
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <WalletOutlined className="text-gray-600" />
            <Text className="text-sm font-medium text-gray-900">$4,000</Text>
          </div>

          <Button
            className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 shadow-sm"
            onClick={() => router.push("/swap")}
          >
            Swap
          </Button>
          <Button
            className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 shadow-sm"
            onClick={() => router.push("/deposit")}
          >
            Deposit
          </Button>
          <Button
            className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 shadow-sm"
            onClick={() => router.push("/account")}
          >
            Account
          </Button>
        </>
        <Popover.Trigger>
          <Button
            htmlType="submit"
            type="primary"
            className="bg-gray-900 hover:bg-black text-white border-gray-900 hover:border-black shadow-sm font-medium"
          >
            {state.chainType !== "webauthn" ? (
              shortAccountId
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={28}
                    height={28}
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
          className="mt-1 md:mr-[48px] max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg"
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
          width={28}
          height={28}
        />
      )
    case "coinbaseWalletSDK":
      return (
        <Image
          src="/static/icons/wallets/coinbase-wallet.svg"
          alt="Coinbase Wallet"
          width={28}
          height={28}
        />
      )
    case "metaMaskSDK":
      return (
        <Image
          src="/static/icons/wallets/meta-mask.svg"
          alt="MetaMask"
          width={28}
          height={28}
        />
      )
  }

  if (connector.icon != null) {
    return (
      <Image
        src={connector.icon.trim()}
        alt={connector.name}
        width={28}
        height={28}
      />
    )
  }
}

function renderWalletName(connector: Connector) {
  return connector.name
}

export default ConnectWallet
