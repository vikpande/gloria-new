"use client";

import React, { useMemo, useState } from "react";
import { Segmented } from "antd";
import { FireOutlined } from "@ant-design/icons";
import MarketCard, { MarketCardProps } from "@/components/MarketCard";

type SortKey = "gainers" | "volume" | "ending";
type WindowKey = "24h" | "7d";

// Extended interface for trending markets that includes all possible properties
interface TrendingMarket extends MarketCardProps {
  volumeUSD?: number;
  probabilityPct?: number;
  dateISO?: string;
}

// If your MarketCard uses date like "31/12/2024", this parses it safely.
function parseDMY(d: string | undefined) {
  if (!d) return Number.POSITIVE_INFINITY;
  // supports "DD/MM/YYYY" and "YYYY-MM-DD"
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [dd, mm, yy] = d.split("/").map(Number);
    return new Date(yy, mm - 1, dd).getTime();
  }
  const t = new Date(d as string).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

interface TrendingGridProps {
  markets: TrendingMarket[];
  className?: string;
}

const TrendingGrid: React.FC<TrendingGridProps> = ({
  markets,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState<SortKey>("gainers");
  const [win, setWin] = useState<WindowKey>("24h");

  // Basic “trending” signal:
  // - Up-trending OR high probability OR high volume
  const trendingPool = useMemo(() => {
    return markets.filter((m) => {
      const v = m.volume ?? m.volumeUSD ?? 0;
      const p = m.probability ?? m.probabilityPct ?? 0;
      const up = m.trend === "up";
      return up || p >= 60 || v >= 1_000_000;
    });
  }, [markets]);

  const sorted = useMemo(() => {
    const list = [...trendingPool];
    switch (sortBy) {
      case "volume": {
        return list.sort((a, b) => {
          const av = a.volume ?? a.volumeUSD ?? 0;
          const bv = b.volume ?? b.volumeUSD ?? 0;
          return bv - av;
        });
      }
      case "ending": {
        return list.sort(
          (a, b) =>
            parseDMY(a.date ?? a.dateISO) - parseDMY(b.date ?? b.dateISO)
        );
      }
      default: // "gainers"
        return list.sort((a, b) => {
          const ap = a.probability ?? a.probabilityPct ?? 0;
          const bp = b.probability ?? b.probabilityPct ?? 0;
          const at = a.trend === "up" ? 1 : 0;
          const bt = b.trend === "up" ? 1 : 0;
          return bt - at || bp - ap;
        });
    }
  }, [trendingPool, sortBy]);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center">
            <FireOutlined />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 m-0">
              Trending Markets
            </h2>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              Top trending markets
            </div>
          </div>
        </div>

        {/* Compact controls (no search/category) */}
        <div className="flex items-center gap-2">
          <Segmented
            options={[
              { label: "Top gainers", value: "gainers" },
              { label: "Most volume", value: "volume" },
              { label: "Ending soon", value: "ending" },
            ]}
            size="small"
            value={sortBy}
            onChange={(v) => setSortBy(v as SortKey)}
          />
          <Segmented
            options={["24h", "7d"]}
            size="small"
            value={win}
            onChange={(v) => setWin(v as WindowKey)}
          />
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((m) => (
            <div key={m.id} className="relative group">
              <MarketCard
                {...m}
                className="h-full transition-transform group-hover:-translate-y-0.5"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 text-sm">
          No trending markets right now.
        </div>
      )}
    </div>
  );
};

export default TrendingGrid;
