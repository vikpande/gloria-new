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
    <div className={`market-grid-container ${className}`}>
      <div className="search-section ">
        <div className="search-content pb-4">
          <div className="text-center mb-4 mt-6">
            <h1 className="text-3xl font-normal text-gray-900 mb-1">
              Prediction Markets
            </h1>
            <p className="text-sm text-gray-600">
              Trade on the outcomes of future events
            </p>
          </div>

          <div className="search-bar-wrapper">
            <div className="search-bar-container">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prediction markets..."
                className="search-input"
              />
            </div>
          </div>

          <div className="categories-container">
            <div className="categories-wrapper">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`category-button ${activeTab === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-content">
          {filtered.length > 0 ? (
            <div className="markets-grid">
              {filtered.map((m) => (
                <MarketCard key={m.id} {...m} className="market-card-item" />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-card">
                <SearchOutlined className="empty-state-icon" />
                <h3 className="empty-state-title">
                  {query || activeTab !== "all"
                    ? "No Markets Found"
                    : "No Markets Available"}
                </h3>
                <p className="empty-state-description">
                  {query || activeTab !== "all"
                    ? "We couldn't find any markets matching your search. Try different keywords or create your own market."
                    : "Don't see what you're looking for? Create a prediction market on any topic and start trading."}
                </p>
                <button
                  type="button"
                  className="create-market-btn"
                  onClick={() => console.log('Create market clicked')}
                >
                  <span className="create-market-btn-icon">+</span>
                  Create New Market
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketGrid
