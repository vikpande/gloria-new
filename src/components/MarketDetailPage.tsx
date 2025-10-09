"use client"

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import {
  Avatar,
  Button,
  Card,
  Collapse,
  Divider,
  InputNumber,
  List,
  Segmented,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from "antd"
import { useRouter } from "next/navigation"
import type React from "react"
import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

/* ---------- Types ---------- */
export type MarketSide = "Buy" | "Sell"
export type Outcome = "Yes" | "No"

export interface HistoricalInsight {
  label: string
  value: string
  note: string
  conf: string
}

export interface ExpertInsight {
  source: string
  stance: string
  weight: number
  take: string
}

export interface NewsInsight {
  title: string
  sentiment: string
  impact: string
  time: string
}

export interface AIInsightsData {
  summary: {
    modelProb: number
    deltaPct: number
  }
  historical: HistoricalInsight[]
  experts: ExpertInsight[]
  news: NewsInsight[]
}

export interface AIInsight {
  summary: string
  keyFactors: string[]
  riskFactors: string[]
  confidence: number
}

export interface MarketDetailProps {
  title: string
  category: string
  imageUrl?: string
  chancePct: number // 0-100
  changePct?: number // +/- since period
  volumeUSD: number // total volume
  lastUpdated?: string // e.g. "Sep 27, 2025"
  yesPrice: number // 0-1 e.g. 0.73
  noPrice: number // 0-1 e.g. 0.27
  chart: Array<{ t: string; p: number }>
  orderBook?: {
    bids: Array<{ price: number; size: number }>
    asks: Array<{ price: number; size: number }>
  }
  context?: string
  tags?: string[]
  related?: Array<{
    id: string
    title: string
    chance: number
    imageUrl?: string
  }>
  aiInsight?: AIInsight
}

import aiInsightsData from "@src/data/aiInsights.json"

const aiInsights = aiInsightsData

/* ---------- Helper ---------- */
const formatUSD = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `$${(v / 1_000).toFixed(1)}K`
      : `$${v.toFixed(0)}`

/* ---------- Component ---------- */
const MarketDetailPage: React.FC<MarketDetailProps> = ({
  title,
  category,
  imageUrl,
  chancePct,
  changePct = 0,
  volumeUSD,
  lastUpdated,
  yesPrice,
  noPrice,
  chart,
  orderBook,
  tags = [],
  related = [],
}) => {
  const router = useRouter()
  const [side, setSide] = useState<MarketSide>("Buy")
  const [outcome, setOutcome] = useState<Outcome>("Yes")
  const [amount, setAmount] = useState<number>(0)

  const activePrice = outcome === "Yes" ? yesPrice : noPrice // 0..1
  const priceLabel = `${outcome} ${(activePrice * 100).toFixed(0)}¢`
  const isUp = changePct >= 0

  const timeButtons = ["1H", "6H", "1D", "1W", "1M", "ALL"]
  const [timeIdx, setTimeIdx] = useState(timeButtons.length - 1)

  const chartData = useMemo(() => chart, [chart])

  const maxBidSize = orderBook
    ? Math.max(1, ...orderBook.bids.map((b) => b.size))
    : 1
  const maxAskSize = orderBook
    ? Math.max(1, ...orderBook.asks.map((a) => a.size))
    : 1

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            size={52}
            src={imageUrl}
            className={!imageUrl ? "bg-black" : ""}
          >
            {!imageUrl ? title.slice(0, 1) : null}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Typography.Title level={3} className="!mb-0 text-gray-900">
                {title}
              </Typography.Title>
              <Tag className="bg-gray-100 text-gray-700 border-0">
                {category}
              </Tag>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>
                <Typography.Text strong className="text-gray-900">
                  {chancePct.toFixed(0)}% chance
                </Typography.Text>{" "}
                {isUp ? (
                  <span className="text-green-600 inline-flex items-center gap-1">
                    <ArrowUpOutlined /> {Math.abs(changePct).toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-red-600 inline-flex items-center gap-1">
                    <ArrowDownOutlined /> {Math.abs(changePct).toFixed(0)}%
                  </span>
                )}
              </span>
              <span>•</span>
              <span>{formatUSD(volumeUSD)} Vol.</span>
              {lastUpdated && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarOutlined /> Updated {lastUpdated}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT (main) */}
        <div className="xl:col-span-2">
          <Card
            className="border border-gray-200 rounded-2xl"
            bodyStyle={{ padding: 16 }}
          >
            {/* chart header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Price over time</span>
                <Tooltip title="Historical price for the YES outcome">
                  <InfoCircleOutlined />
                </Tooltip>
              </div>
              {/* time range buttons */}
              <div className="flex items-center gap-2">
                {timeButtons.map((t, i) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTimeIdx(i)}
                    className={`h-8 px-3 rounded-md text-sm ${timeIdx === i
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-[300px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#eee" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <RTooltip
                    labelFormatter={(label: string) => `Time: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="p"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="mt-4">
            <Collapse
              bordered={false}
              defaultActiveKey={["orderbook", "ai"]}
              className="bg-white"
              expandIconPosition="end"
            >
              {/* ---------- ORDER BOOK ---------- */}
              <Collapse.Panel
                key="orderbook"
                header={
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Order Book</span>
                    <Tag className="bg-black text-white border-0 rounded-md">
                      Live
                    </Tag>
                  </div>
                }
                className="rounded-xl"
              >
                {orderBook ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bids */}
                    <Card
                      size="small"
                      className="border border-gray-200 rounded-xl"
                      bodyStyle={{ padding: 12 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">Bids</div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">
                          Price • Size
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {orderBook.bids.map((b, idx) => {
                          const w = Math.max(
                            6,
                            Math.round((b.size / maxBidSize) * 100)
                          ) // min 6% for visibility
                          return (
                            <div
                              key={`bid-${b.price}-${b.size}-${idx}`}
                              className="relative overflow-hidden rounded-md"
                            >
                              <div
                                className="absolute inset-y-0 right-0 bg-green-50"
                                style={{ width: `${w}%` }}
                              />
                              <div className="relative flex items-center justify-between px-2 py-1 text-sm">
                                <span className="font-mono text-green-700">
                                  {(b.price * 100).toFixed(0)}¢
                                </span>
                                <span className="font-mono text-gray-700">
                                  {b.size.toFixed(2)} sh
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>

                    {/* Asks */}
                    <Card
                      size="small"
                      className="border border-gray-200 rounded-xl"
                      bodyStyle={{ padding: 12 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">Asks</div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">
                          Price • Size
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {orderBook.asks.map((a, idx) => {
                          const w = Math.max(
                            6,
                            Math.round((a.size / maxAskSize) * 100)
                          )
                          return (
                            <div
                              key={`ask-${a.price}-${a.size}-${idx}`}
                              className="relative overflow-hidden rounded-md"
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-red-50"
                                style={{ width: `${w}%` }}
                              />
                              <div className="relative flex items-center justify-between px-2 py-1 text-sm">
                                <span className="font-mono text-red-700">
                                  {(a.price * 100).toFixed(0)}¢
                                </span>
                                <span className="font-mono text-gray-700">
                                  {a.size.toFixed(2)} sh
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No order book data.
                  </div>
                )}
              </Collapse.Panel>

              {/* ---------- AI INSIGHTS ---------- */}
              <Collapse.Panel
                key="ai"
                header={<span className="font-medium">AI Insights</span>}
                className="rounded-xl"
              >
                {/* Summary strip */}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2">
                    <Tag className="bg-black text-white border-0 rounded-md">
                      Model view
                    </Tag>
                    <span className="text-sm text-gray-700 font-medium">
                      {Math.round(aiInsights.summary.modelProb * 100)}%
                      probability
                    </span>
                  </div>
                  <div
                    className={`text-sm inline-flex items-center gap-1 ${aiInsights.summary.deltaPct >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    <RiseOutlined />
                    {aiInsights.summary.deltaPct >= 0 ? "+" : ""}
                    {aiInsights.summary.deltaPct}% today
                  </div>
                </div>

                {/* Three insight cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Historical */}
                  <Card
                    size="small"
                    className="border border-gray-200 rounded-xl"
                    bodyStyle={{ padding: 12 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center">
                        <LineChartOutlined />
                      </div>
                      <div className="font-semibold">Historical</div>
                    </div>
                    <ul className="space-y-2">
                      {aiInsights.historical.map(
                        (h: HistoricalInsight, i: number) => (
                          <li
                            key={`historical-${h.label}-${i}`}
                            className="text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">{h.label}</span>
                              <span className="font-medium text-gray-900">
                                {h.value}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{h.note}</span>
                              <span className="uppercase">{h.conf}</span>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </Card>

                  {/* Experts Review */}
                  <Card
                    size="small"
                    className="border border-gray-200 rounded-xl"
                    bodyStyle={{ padding: 12 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center">
                        <TeamOutlined />
                      </div>
                      <div className="font-semibold">Experts Review</div>
                    </div>
                    <ul className="space-y-3">
                      {aiInsights.experts.map((e: ExpertInsight, i: number) => (
                        <li key={`expert-${i}`} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {e.source}
                            </span>
                            <Tag
                              className={`border-0 rounded-md ${e.stance === "Bullish"
                                ? "bg-green-100 text-green-800"
                                : e.stance === "Bearish"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {e.stance}
                            </Tag>
                          </div>
                          <div className="text-gray-600">{e.take}</div>
                          <div className="text-xs text-gray-500">
                            Weight {Math.round(e.weight * 100)}%
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* News / Social */}
                  <Card
                    size="small"
                    className="border border-gray-200 rounded-xl"
                    bodyStyle={{ padding: 12 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center">
                        <CommentOutlined />
                      </div>
                      <div className="font-semibold">News / Social</div>
                    </div>
                    <ul className="space-y-3">
                      {aiInsights.news.map((n: NewsInsight, i: number) => (
                        <li key={`news-${n.title}-${i}`} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{n.title}</span>
                            <span className="text-xs text-gray-500">
                              {n.time}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <Tag
                              className={`border-0 rounded-md ${n.sentiment === "Positive"
                                ? "bg-green-100 text-green-800"
                                : n.sentiment === "Negative"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {n.sentiment}
                            </Tag>
                            <span className="text-xs text-gray-600">
                              Impact {n.impact}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>

        {/* RIGHT (trade panel) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* Sticky wrapper keeps the trade panel fixed; sibling won't slide under it */}
          <div className="sticky top-0">
            <Card
              className="border border-gray-200 rounded-2xl"
              bodyStyle={{ padding: 16 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Segmented
                  options={["Buy", "Sell"]}
                  value={side}
                  onChange={(v) => setSide(v as MarketSide)}
                />
                <div className="ml-auto text-xs text-gray-500">Market</div>
              </div>

              <div className="mb-3">
                <Segmented
                  block
                  options={[
                    {
                      label: `Yes ${(yesPrice * 100).toFixed(0)}¢`,
                      value: "Yes",
                    },
                    { label: `No ${(noPrice * 100).toFixed(0)}¢`, value: "No" },
                  ]}
                  value={outcome}
                  onChange={(v) => setOutcome(v as Outcome)}
                />
              </div>

              <div className="mb-3">
                <div className="mb-1 text-sm font-medium text-gray-900">
                  Amount
                </div>
                <InputNumber
                  min={0}
                  value={amount}
                  onChange={(v) => setAmount(Number(v) || 0)}
                  prefix="$"
                  className="w-full"
                  controls={false}
                  placeholder="0"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 20, 100].map((n) => (
                    <Button
                      key={n}
                      size="small"
                      onClick={() => setAmount((a) => (a || 0) + n)}
                      className="border-gray-300"
                    >
                      +${n}
                    </Button>
                  ))}
                  <Button
                    size="small"
                    onClick={() => setAmount(0)}
                    className="border-gray-300"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Divider className="!my-3" />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <Statistic
                  title="Selected"
                  value={priceLabel}
                  valueStyle={{ fontSize: 16 }}
                />
                <Statistic
                  title="Cost"
                  value={`$${(amount || 0).toFixed(2)}`}
                  valueStyle={{ fontSize: 16 }}
                />
              </div>

              <Button
                type="primary"
                className="w-full h-10 bg-black hover:bg-gray-900"
                disabled={!amount}
                onClick={() => {
                  router.push("/account")
                }}
              >
                {side === "Buy" ? "Trade" : "Place Sell Order"}
              </Button>

              <div className="mt-2 text-xs text-gray-500">
                By trading, you agree to the{" "}
                <a
                  className="underline hover:text-gray-700"
                  href="/terms-of-service"
                >
                  Terms of Use
                </a>
                .
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <>
                  <Divider className="!my-4" />
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Tag
                        key={t}
                        className="bg-gray-100 text-gray-700 border-0"
                      >
                        {t}
                      </Tag>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
          {/* Related markets */}
          {related.length > 0 && (
            <Card
              className="mt-4 border border-gray-200 rounded-2xl"
              bodyStyle={{ padding: 16 }}
            >
              <div className="mb-2 font-semibold">Related Markets</div>
              <List
                split={false}
                dataSource={related}
                renderItem={(item) => (
                  <List.Item className="!px-0">
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={40}
                          src={item.imageUrl}
                          className={!item.imageUrl ? "bg-black" : ""}
                        >
                          {!item.imageUrl ? item.title.slice(0, 1) : null}
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 line-clamp-2">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {item.chance}%
                        </div>
                        <Typography.Text type="secondary" className="text-xs">
                          chance
                        </Typography.Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketDetailPage
