import type { Metadata } from "next"
import type React from "react"
import type { PropsWithChildren } from "react"

import { PreloadFeatureFlags } from "@src/components/PreloadFeatureFlags"
import { whitelabelTemplateFlag } from "@src/config/featureFlags"
import { settings } from "@src/config/settings"
import GloriaLayout from "@src/components/Layout/Gloria"

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
