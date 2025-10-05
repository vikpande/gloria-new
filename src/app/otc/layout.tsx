import type React from "react"
import type { PropsWithChildren } from "react"

import Layout from "@src/components/Layout"
import { PreloadFeatureFlags } from "@src/components/PreloadFeatureFlags"
import GloriaLayout from "@src/components/Layout/Gloria"

const OtcDeskLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PreloadFeatureFlags>
      <GloriaLayout>{children}</GloriaLayout>
    </PreloadFeatureFlags>
  )
}

export default OtcDeskLayout
