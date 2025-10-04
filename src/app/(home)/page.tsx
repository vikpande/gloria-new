"use client";

import React from "react";
import MarketGrid from "@src/components/MarketGrid";
import { MarketCardProps } from "@src/components/MarketCard";
import sampleMarketsData from "@src/data/sampleMarkets.json";

const sampleMarkets: MarketCardProps[] = sampleMarketsData as MarketCardProps[];

export default function Home() {
  return <MarketGrid markets={sampleMarkets} />;
}
