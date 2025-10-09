"use client"

import Layout from "antd/es/layout"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import type { PropsWithChildren } from "react"

import AssistantPanel from "@src/components/AssistantPanel"
import GloriaHeader from "@src/components/Layout/GloriaHeader"
import { useMixpanelBus } from "@src/hooks/useMixpanelBus"
import { usePathLogging } from "@src/hooks/usePathLogging"
import { WalletVerificationProvider } from "@src/providers/WalletVerificationProvider"

const { Content, Sider } = Layout
const HEADER_PX = 64

const GloriaLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  usePathLogging()
  useMixpanelBus()

  const [isAssistantVisible, setIsAssistantVisible] = useState(true)

  const onMenuClick = (key: string) => {
    router.push(`/${key}`)
  }

  const onHideAssistant = () => setIsAssistantVisible((v) => !v)

  const [isMobile, _setIsMobile] = useState(false)
  const [drawerOpen, _setDrawerOpen] = useState(false)

  return (
    <Layout className="min-h-screen w-full bg-white">
      <GloriaHeader
        onMenuClick={onMenuClick}
        onHideAssistant={() => setIsAssistantVisible((v) => !v)}
        isAssistantVisible={isMobile ? drawerOpen : isAssistantVisible}
      />

      <Layout
        className="w-full"
        style={{ height: `calc(100vh - ${HEADER_PX}px)` }}
      >
        {!isMobile && isAssistantVisible && (
          <Sider
            width={350}
            collapsedWidth={0}
            className="bg-gray-50 border-r border-gray-200"
          >
            <div
              className="sticky"
              style={{
                top: 0,
                height: `calc(100vh - ${HEADER_PX}px)`,
              }}
            >
              <AssistantPanel className="h-full" onCollapse={onHideAssistant} />
            </div>
          </Sider>
        )}
        <Content className="bg-white p-6 overflow-y-auto">{children}</Content>
        {/* <Footer />
      <NavbarMobile />
      <PageBackground /> */}
        <WalletVerificationProvider />
      </Layout>
    </Layout>
  )
}

export default GloriaLayout
