import {
  CLICKHOUSE_API_KEY,
  CLICKHOUSE_SERVICE_URL,
} from "@src/utils/environment"
import { logger } from "@src/utils/logger"
import { NextResponse } from "next/server"
import * as v from "valibot"

// revalidate every 3 hours
export const revalidate = 10_800

export async function GET() {
  if (
    typeof CLICKHOUSE_SERVICE_URL !== "string" ||
    typeof CLICKHOUSE_API_KEY !== "string"
  ) {
    logger.error("CLICKHOUSE_SERVICE_URL or CLICKHOUSE_API_KEY are not defined")
    return NextResponse.error()
  }

  const query = `
    SELECT
        date_at as DATE,
        sum(volume_amount_usd) as GROSS_AMOUNT_USD
    FROM near_intents_metrics.intents_external_metrics
    WHERE date_at >= '2024-12-10' -- previous dates have no data
    GROUP BY date_at
    ORDER BY date_at ASC
  `

  const res = await fetch(
    new URL("query?format=JSON", CLICKHOUSE_SERVICE_URL),
    {
      method: "POST",
      body: JSON.stringify({ sql: query }),
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${btoa(CLICKHOUSE_API_KEY)}`,
      },
    }
  )

  if (!res.ok) {
    return NextResponse.error()
  }

  try {
    const { data } = v.parse(tradingVolumeSchema, await res.json())
    return NextResponse.json(data)
  } catch (err) {
    logger.error(err)
    return NextResponse.error()
  }
}

const tradingVolumeSchema = v.object({
  data: v.array(v.looseObject({})),
})
