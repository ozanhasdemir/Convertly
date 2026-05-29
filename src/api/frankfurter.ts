// Thin client for the Frankfurter API (https://frankfurter.dev).
// Free, no API key, CORS-enabled. Rates are published by the European
// Central Bank on working days only (no weekends/holidays).

const BASE_URL = 'https://api.frankfurter.dev/v1'

export type CurrencyMap = Record<string, string>

export interface LatestResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export interface TimeSeriesResponse {
  amount: number
  base: string
  start_date: string
  end_date: string
  rates: Record<string, Record<string, number>>
}

export interface RatePoint {
  date: string
  rate: number
}

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal })
  if (!res.ok) {
    throw new Error(`Frankfurter request failed (${res.status}) for ${path}`)
  }
  return res.json() as Promise<T>
}

/** List of supported currencies as { CODE: "Full Name" }. */
export function fetchCurrencies(signal?: AbortSignal): Promise<CurrencyMap> {
  return getJSON<CurrencyMap>('/currencies', signal)
}

/**
 * Latest rates for `base` against the given `symbols`.
 * Pass `amount` to have the API scale the result for you.
 */
export function fetchLatest(
  base: string,
  symbols: string[],
  amount = 1,
  signal?: AbortSignal,
): Promise<LatestResponse> {
  const params = new URLSearchParams({ base, amount: String(amount) })
  if (symbols.length) params.set('symbols', symbols.join(','))
  return getJSON<LatestResponse>(`/latest?${params}`, signal)
}

/**
 * Historical daily rates for a single `base`->`symbol` pair between two
 * ISO dates (inclusive). Returns a sorted, flattened series ready to chart.
 */
export async function fetchTimeSeries(
  base: string,
  symbol: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<RatePoint[]> {
  const params = new URLSearchParams({ base, symbols: symbol })
  const data = await getJSON<TimeSeriesResponse>(
    `/${startDate}..${endDate}?${params}`,
    signal,
  )
  return Object.entries(data.rates)
    .map(([date, rates]) => ({ date, rate: rates[symbol] }))
    .filter((p) => typeof p.rate === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
}
