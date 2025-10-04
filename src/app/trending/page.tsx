"use client";

import React from "react";
import TrendingGrid from "@src/components/TrendingGrid";
import { MarketCardProps } from "@src/components/MarketCard";
import trendingMarketsData from "@src/data/trendingMarkets.json";

const trendingSample: MarketCardProps[] =
  trendingMarketsData as MarketCardProps[];

export default function TrendingPage() {
  return <TrendingGrid markets={trendingSample} />;
}
