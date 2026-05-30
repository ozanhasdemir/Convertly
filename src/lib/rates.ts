// The conversion engine. Everything is priced through USD:
//   - fiatUsd[code]   = how many units of that fiat currency 1 USD buys
//                       (i.e. the Frankfurter `base=USD` rate)
//   - cryptoUsd[code] = USD price of one unit of that crypto
// From those we derive each asset's USD value and cross any two of them.

import type { Currency } from '../types'

export interface PriceData {
  /** USD -> fiat rates (1 USD = fiatUsd[code] units). */
  fiatUsd: Record<string, number>
  /** USD price of one unit of each crypto, keyed by code. */
  cryptoUsd: Record<string, number>
}

/** USD value of one unit of `cur`, or null if we don't have its price. */
export function usdValue(cur: Currency, prices: PriceData): number | null {
  if (cur.kind === 'crypto') {
    return prices.cryptoUsd[cur.code] ?? null
  }
  if (cur.code === 'USD') return 1
  const rate = prices.fiatUsd[cur.code]
  return rate ? 1 / rate : null
}

/** Units of `to` for `amount` units of `from`, or null if a price is missing. */
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  prices: PriceData,
): number | null {
  const uf = usdValue(from, prices)
  const ut = usdValue(to, prices)
  if (uf == null || ut == null || ut === 0) return null
  return (amount * uf) / ut
}

/** Exchange rate: units of `to` per 1 unit of `from`. */
export function rate(
  from: Currency,
  to: Currency,
  prices: PriceData,
): number | null {
  return convert(1, from, to, prices)
}
