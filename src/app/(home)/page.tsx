"use client"

import type { MarketCardProps } from "@src/components/MarketCard"
import MarketGrid from "@src/components/MarketGrid"
import sampleMarketsData from "@src/data/sampleMarkets.json"

const sampleMarkets: MarketCardProps[] = sampleMarketsData as MarketCardProps[]

export default function Home() {
  return <MarketGrid markets={sampleMarkets} />
}
