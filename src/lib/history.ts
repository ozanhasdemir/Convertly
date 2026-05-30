// Builds a date -> "USD value of one unit" series for any asset, so the chart
// can cross two assets of any kind (fiat or crypto) over time.

import { fetchCoinUsdHistory } from '../api/coingecko'
import { fetchTimeSeries } from '../api/frankfurter'
import type { Currency } from '../types'

export interface HistoryPoint {
  date: string
  rate: number
}

/**
 * USD value per unit of `cur` for each day in the range, as a Map keyed by ISO
 * date. Returns `null` for USD itself (its value is a constant 1 — the caller
 * treats a null series as "1 on every date the other side has").
 */
export async function fetchUsdSeries(
  cur: Currency,
  range: { start: string; end: string; days: number },
  signal?: AbortSignal,
): Promise<Map<string, number> | null> {
  if (cur.kind === 'fiat' && cur.code === 'USD') return null

  if (cur.kind === 'crypto') {
    const points = await fetchCoinUsdHistory(cur.id!, range.days, signal)
    return new Map(points.map((p) => [p.date, p.rate]))
  }

  // Fiat: Frankfurter gives USD -> fiat; invert to USD value of one unit.
  const points = await fetchTimeSeries(
    'USD',
    cur.code,
    range.start,
    range.end,
    signal,
  )
  return new Map(points.map((p) => [p.date, p.rate ? 1 / p.rate : 0]))
}

/**
 * Cross two USD series into a `from -> to` rate series. A `null` series means
 * USD (constant 1). Dates present in both sides are used, sorted ascending.
 */
export function crossSeries(
  fromSeries: Map<string, number> | null,
  toSeries: Map<string, number> | null,
): HistoryPoint[] {
  // Pick the date axis: the non-USD side(s). If both are non-USD, intersect.
  let dates: string[]
  if (fromSeries && toSeries) {
    dates = [...fromSeries.keys()].filter((d) => toSeries.has(d))
  } else if (fromSeries) {
    dates = [...fromSeries.keys()]
  } else if (toSeries) {
    dates = [...toSeries.keys()]
  } else {
    return []
  }

  return dates
    .map((date) => {
      const uf = fromSeries ? fromSeries.get(date)! : 1
      const ut = toSeries ? toSeries.get(date)! : 1
      return { date, rate: ut === 0 ? 0 : uf / ut }
    })
    .filter((p) => p.rate > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}
