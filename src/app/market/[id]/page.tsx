"use client"

import MarketDetailPage from "@src/components/MarketDetailPage"
import sampleMarketsData from "@src/data/sampleMarkets.json"

export default function MarketDetail() {
  // Get Bitcoin market data (ID: "1")
  const bitcoinMarket = sampleMarketsData.find((market) => market.id === "1")

  if (!bitcoinMarket) {
    return <div>Market not found</div>
  }

  return (
    <MarketDetailPage
      title={bitcoinMarket.title}
      category={bitcoinMarket.category}
      imageUrl="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=400&auto=format&fit=crop"
      chancePct={bitcoinMarket.probability}
      changePct={15}
      volumeUSD={bitcoinMarket.volume}
      lastUpdated="Jan 15, 2025"
      yesPrice={bitcoinMarket.yesPrice / 100}
      noPrice={bitcoinMarket.noPrice / 100}
      chart={[
        { t: "Jan 1", p: 0.45 },
        { t: "Jan 4", p: 0.52 },
        { t: "Jan 7", p: 0.48 },
        { t: "Jan 10", p: 0.55 },
        { t: "Jan 12", p: 0.61 },
        { t: "Jan 14", p: 0.58 },
        { t: "Jan 15", p: 0.68 },
      ]}
      orderBook={{
        bids: [
          { price: 0.67, size: 250.5 },
          { price: 0.65, size: 180.0 },
          { price: 0.63, size: 145.2 },
        ],
        asks: [
          { price: 0.69, size: 210.1 },
          { price: 0.71, size: 162.0 },
          { price: 0.73, size: 98.6 },
        ],
      }}
      context={bitcoinMarket.description}
      tags={["All", bitcoinMarket.category, "2025"]}
      related={[
        { id: "6", title: "Will Ethereum reach $8,000 in 2025?", chance: 61 },
        { id: "2", title: "Will AI replace 20% of jobs by 2025?", chance: 42 },
        {
          id: "7",
          title: "Will NVIDIA stock reach $1,200 by end of 2025?",
          chance: 58,
        },
      ]}
      aiInsight={bitcoinMarket.aiInsight}
    />
  )
}
