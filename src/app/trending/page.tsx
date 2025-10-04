"use client";

import React from "react";
import TrendingGrid from "@/components/TrendingGrid";
import { MarketCardProps } from "@/components/MarketCard";
import trendingMarketsData from "@/data/trendingMarkets.json";

const trendingSample: MarketCardProps[] =
  trendingMarketsData as MarketCardProps[];

export default function TrendingPage() {
  return <TrendingGrid markets={trendingSample} />;
}
