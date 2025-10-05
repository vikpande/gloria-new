import type { AIInsightsData } from "@/components/MarketDetailPage"
import aiInsightsData from "@/data/aiInsights.json"

const insights: AIInsightsData = aiInsightsData as AIInsightsData

export const getAIInsights = (): AIInsightsData => {
  return insights
}

export const getAIInsightSummary = () => {
  return insights.summary
}

export const getAIInsightHistorical = () => {
  return insights.historical
}

export const getAIInsightExperts = () => {
  return insights.experts
}

export const getAIInsightNews = () => {
  return insights.news
}

// Default export for backward compatibility
export default insights
