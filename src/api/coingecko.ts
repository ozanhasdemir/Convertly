// Thin client for the CoinGecko public API (https://www.coingecko.com/en/api).
// Free, no API key, CORS-enabled. Rate-limited (~5-15 calls/min on the public
// tier), so we batch where possible and fetch on demand only for charts.

import type { RatePoint } from './frankfurter'

const BASE_URL = 'https://api.coingecko.com/api/v3'

export interface CoinMarket {
  id: string
  symbol: string
  name: string
  current_price: number
  image: string
}

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal })
  if (!res.ok) {
    throw new Error(`CoinGecko request failed (${res.status}) for ${path}`)
  }
  return res.json() as Promise<T>
}

/**
 * Top `count` coins by market cap, priced in USD. A single call gives us the
 * coin list (id/symbol/name/logo) AND their live USD prices.
 */
export function fetchTopCoins(
  count: number,
  signal?: AbortSignal,
): Promise<CoinMarket[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(count),
    page: '1',
  })
  return getJSON<CoinMarket[]>(`/coins/markets?${params}`, signal)
}

interface MarketChartResponse {
  prices: [number, number][] // [timestampMs, priceUsd]
}

/**
 * Daily USD price history for a coin over the last `days` days, flattened to
 * one point per calendar day (UTC) and sorted ascending.
 */
export async function fetchCoinUsdHistory(
  id: string,
  days: number,
  signal?: AbortSignal,
): Promise<RatePoint[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: String(days),
    interval: 'daily',
  })
  const data = await getJSON<MarketChartResponse>(
    `/coins/${id}/market_chart?${params}`,
    signal,
  )
  // Collapse to one entry per day (last price wins), keyed by ISO date.
  const byDate = new Map<string, number>()
  for (const [ts, price] of data.prices) {
    const date = new Date(ts).toISOString().slice(0, 10)
    byDate.set(date, price)
  }
  return Array.from(byDate, ([date, rate]) => ({ date, rate })).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}
