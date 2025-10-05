import type React from "react"
import type { PropsWithChildren } from "react"

import GloriaLayout from "@src/components/Layout/Gloria"
import { PreloadFeatureFlags } from "@src/components/PreloadFeatureFlags"

const OtcDeskLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PreloadFeatureFlags>
      <GloriaLayout>{children}</GloriaLayout>
    </PreloadFeatureFlags>
  )
}

export default OtcDeskLayout
