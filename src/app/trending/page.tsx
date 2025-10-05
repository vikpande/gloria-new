"use client"

import type { MarketCardProps } from "@src/components/MarketCard"
import TrendingGrid from "@src/components/TrendingGrid"
import trendingMarketsData from "@src/data/trendingMarkets.json"

const trendingSample: MarketCardProps[] =
  trendingMarketsData as MarketCardProps[]

export default function TrendingPage() {
  return <TrendingGrid markets={trendingSample} />
}
