import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import GloriaLayout from "@src/components/Layout/Gloria"
import { PreloadFeatureFlags } from "@src/components/PreloadFeatureFlags"
import { whitelabelTemplateFlag } from "@src/config/featureFlags"
import { settings } from "@src/config/settings"

export async function generateMetadata(): Promise<Metadata> {
  const templ = await whitelabelTemplateFlag()

  if (templ !== "dogecoinswap") {
    return settings.metadata.withdraw
  }

  return {}
}

const WithdrawLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PreloadFeatureFlags>
      <GloriaLayout>{children}</GloriaLayout>
    </PreloadFeatureFlags>
  )
}

export default WithdrawLayout
