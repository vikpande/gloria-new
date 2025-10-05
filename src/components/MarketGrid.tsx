"use client"

import { SearchOutlined } from "@ant-design/icons"
import MarketCard, { type MarketCardProps } from "@src/components/MarketCard"
import { getCategoryWithAll } from "@src/utils/categories"
import type React from "react"
import { useDeferredValue, useMemo, useState } from "react"

interface MarketGridProps {
  markets: MarketCardProps[]
  className?: string
}

const CATEGORIES = getCategoryWithAll().map((cat) => cat.value)

const MarketGrid: React.FC<MarketGridProps> = ({ markets, className = "" }) => {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    return markets.filter((m) => {
      const inCat = activeTab === "all" || m.category === activeTab
      if (!q) return inCat
      const t = m.title.toLowerCase()
      const d = (m.description ?? "").toLowerCase()
      return inCat && (t.includes(q) || d.includes(q))
    })
  }, [markets, activeTab, deferredQuery])

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-1 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Prediction Markets
        </h2>
        <p className="text-gray-500 text-sm">
          Trade on the outcomes of future events
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-md bg-gray-100 border border-gray-200 
                       focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 h-9 rounded-md text-sm font-medium transition ${
                activeTab === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            xl:grid-cols-4 
            2xl:grid-cols-5 
            gap-5
          "
        >
          {filtered.map((m) => (
            <MarketCard key={m.id} {...m} className="w-full h-full" />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500 text-sm">
          {query || activeTab !== "all"
            ? "No markets found matching your filters"
            : "No markets available at the moment"}
        </div>
      )}
    </div>
  )
}

export default MarketGrid
