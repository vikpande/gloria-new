"use client"

import {
  CalendarOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Divider from "antd/es/divider"
import Tag from "antd/es/tag"
import Tooltip from "antd/es/tooltip"
import Typography from "antd/es/typography"
import Link from "next/link"
import type React from "react"

export type Trend = "up" | "down" | "neutral"

export interface MarketCardProps {
  id: string
  title: string
  description?: string
  category: string
  date: string // keep consistent with page.tsx
  yesPrice: number // 0.73
  noPrice: number // 0.27
  volume: number // 2100000
  probability: number // 73
  trend?: Trend
  isFavorite?: boolean
  disabled?: boolean
  className?: string
  onYes?: (id: string) => void
  onNo?: (id: string) => void
  onToggleFavorite?: (id: string, next: boolean) => void
}

const MarketCard: React.FC<MarketCardProps> = ({
  id,
  title,
  description,
  category,
  date,
  yesPrice,
  noPrice,
  volume,
  probability,
  trend = "neutral",
  isFavorite = false,
  disabled = false,
  className = "",
  onYes,
  onNo,
}) => {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <Card
      tabIndex={0}
      aria-label={`${title} market`}
      className={`border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition bg-white ${className}`}
      bodyStyle={{ padding: 16 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <Tag className="bg-black text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full border-0">
          {category}
        </Tag>

        <div className="flex items-center gap-2">
          {trend === "up" && <CaretUpOutlined className="text-green-600" />}
          {trend === "down" && <CaretDownOutlined className="text-red-500" />}
          <Tooltip
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          />
        </div>
      </div>

      {/* Title & description */}
      <div className="mt-2 space-y-1.5">
        <Link href={`/market/${id}`}>
          <Typography.Title
            level={5}
            className="!mb-0 text-gray-900 leading-snug font-semibold hover:text-blue-600 cursor-pointer transition-colors"
          >
            {title}
          </Typography.Title>
        </Link>
        {description && (
          <Typography.Text className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {description}
          </Typography.Text>
        )}
        <div className="flex items-center gap-1.5 pt-1 text-xs text-gray-500">
          <CalendarOutlined /> {formattedDate}
        </div>
      </div>

      <Divider className="!my-4" />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outlined"
          color="green"
          disabled={disabled}
          onClick={() => onYes?.(id)}
          className="h-10 rounded-md bg-green-500 hover:bg-green-600 text-green-600 font-medium"
        >
          YES ${yesPrice.toFixed(2)}
        </Button>
        <Button
          variant="outlined"
          color="danger"
          disabled={disabled}
          onClick={() => onNo?.(id)}
          className="h-10 rounded-md bg-red-500 hover:bg-red-600 text-red-600 font-medium"
        >
          NO ${noPrice.toFixed(2)}
        </Button>
      </div>

      {/* Meta info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Volume: ${(volume / 1_000_000).toFixed(1)}M</span>
        <span>{probability}% Chance</span>
      </div>
    </Card>
  )
}

export default MarketCard
