"use client"

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MailOutlined,
  RightOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons"
import Avatar from "antd/es/avatar"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Input from "antd/es/input"
import List from "antd/es/list"
import Tag from "antd/es/tag"
import type React from "react"

/* ---------------- Sparkline (no extra libs) ---------------- */
function Sparkline({
  points,
  trend = "up",
  className = "",
}: {
  points: number[] // values 0..100
  trend?: "up" | "down"
  className?: string
}) {
  if (!points.length) return null
  const w = 120
  const h = 30
  const max = Math.max(...points)
  const min = Math.min(...points)
  const norm = (v: number) => h - ((v - min) / (max - min || 1)) * h

  const step = w / (points.length - 1 || 1)
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step},${norm(v)}`)
    .join(" ")

  const stroke = trend === "up" ? "#16a34a" : "#ef4444"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      <title>Price trend chart</title>
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  )
}

/* ---------------- Row item ---------------- */
type Row = {
  id: string
  rank: number
  icon?: string
  title: string
  percent: number // 0..100
  changePct: number // +/- delta
  trend: "up" | "down"
  spark: number[]
  tag?: string
}

function NewsRow({ item }: { item: Row }) {
  const TrendIcon = item.trend === "up" ? ArrowUpOutlined : ArrowDownOutlined
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="w-6 text-gray-400 text-sm text-right">{item.rank}</div>

        <Avatar
          size={44}
          src={item.icon}
          className={!item.icon ? "bg-black" : ""}
        >
          {!item.icon ? item.title.slice(0, 1) : null}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-gray-900">
              {item.title}
            </div>
            {item.tag && (
              <Tag className="border-0 bg-gray-100 text-gray-700 rounded-full">
                {item.tag}
              </Tag>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="text-lg font-semibold text-gray-900">
              {item.percent}%
            </div>
            <div
              className={`inline-flex items-center gap-1 text-sm ${item.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
            >
              <TrendIcon /> {Math.abs(item.changePct)}%
            </div>
          </div>
        </div>

        <Sparkline
          points={item.spark}
          trend={item.trend}
          className="hidden sm:block"
        />

        <RightOutlined className="text-gray-400" />
      </div>
      <div className="h-px bg-gray-200" />
    </div>
  )
}

/* ---------------- Sample data ---------------- */
const ITEMS: Row[] = [
  {
    id: "1",
    rank: 1,
    title: "Will PAS win by greater than >16% of the vote?",
    percent: 100,
    changePct: 72,
    trend: "up",
    spark: [10, 18, 25, 40, 42, 55, 70, 100],
    tag: "Politics",
  },
  {
    id: "2",
    rank: 2,
    title: "Will PAS win a majority of seats in Moldova elections?",
    percent: 99,
    changePct: 66,
    trend: "up",
    spark: [22, 28, 30, 50, 55, 70, 85, 99],
    tag: "Elections",
  },
  {
    id: "3",
    rank: 3,
    title: "Will Bad Bunny perform during the Super Bowl halftime show?",
    percent: 98,
    changePct: 38,
    trend: "up",
    spark: [15, 12, 18, 20, 40, 65, 72, 98],
    tag: "Entertainment",
  },
  {
    id: "4",
    rank: 4,
    title: "Will Eric Adams endorse Cuomo?",
    percent: 41,
    changePct: 20,
    trend: "up",
    spark: [5, 12, 9, 20, 28, 33, 38, 41],
    tag: "Politics",
  },
  {
    id: "5",
    rank: 5,
    title: "Will Elon tweet between 850 and 899 times this month?",
    percent: 0,
    changePct: 16,
    trend: "down",
    spark: [20, 18, 16, 14, 10, 8, 3, 0],
    tag: "Tech",
  },
]

const LIVE = [
  {
    id: "l1",
    title: "Eric Adams drops out of NYC Mayoral Race.",
    time: "Sep 28, 11:32 PM",
  },
  {
    id: "l2",
    title: "Eric Trump says Bitcoin will surpass $1,000,000.",
    time: "Sep 27, 5:38 AM",
  },
  {
    id: "l3",
    title: "SCOTUS to consider birthright citizenship case.",
    time: "Sep 27, 5:06 AM",
  },
  {
    id: "l4",
    title: "DoD planning strikes on Venezuelan drug cartels.",
    time: "Sep 27, 4:07 AM",
  },
]

/* ---------------- Page ---------------- */
const NewsPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Top hero + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Hero */}
        <Card
          className="xl:col-span-8 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="flex items-center justify-between p-6 sm:p-8 rounded-2xl bg-black text-white relative overflow-hidden">
            <div>
              <div className="text-sm opacity-80">Sep 29, 2025</div>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Breaking News
              </h2>
              <p className="opacity-80 mt-1">
                Markets that moved the most in the last 24 hours
              </p>
              <div className="mt-4 flex gap-2">
                <Button className="bg-white text-black border-none h-9 px-4">
                  Top Gainers
                </Button>
                <Button className="bg-white/10 text-white hover:!bg-white/20 border-white/20 h-9 px-4">
                  Top Losers
                </Button>
              </div>
            </div>
            <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
              <ThunderboltOutlined style={{ fontSize: 96 }} />
            </div>
          </div>

          {/* Ranked list */}
          <div className="px-3 sm:px-4">
            {ITEMS.map((it) => (
              <NewsRow key={it.id} item={it} />
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Subscribe card */}
          <Card
            className="border border-gray-200 rounded-2xl"
            bodyStyle={{ padding: 16 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                <MailOutlined />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Get daily updates
                </div>
                <div className="text-sm text-gray-500">
                  One email a day with what’s moving on the markets.
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Input placeholder="Enter your email" className="h-10" />
              <Button
                type="primary"
                className="h-10 bg-black hover:bg-gray-900"
              >
                Get updates
              </Button>
            </div>
          </Card>

          {/* Live feed */}
          <Card
            className="border border-gray-200 rounded-2xl"
            bodyStyle={{ padding: 16 }}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">Live from @markets</div>
              <Button className="h-8">Follow</Button>
            </div>

            <List
              className="mt-3"
              split={false}
              dataSource={LIVE}
              renderItem={(it) => (
                <List.Item className="!px-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-900">{it.title}</div>
                      <div className="text-xs text-gray-500">{it.time}</div>
                    </div>
                    <div className="h-px bg-gray-200 mt-3" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewsPage
