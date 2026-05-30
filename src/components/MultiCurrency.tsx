import { useMemo } from 'react'
import { convert, type PriceData } from '../lib/rates'
import { formatAmount } from '../lib/format'
import type { Currency } from '../types'
import CurrencyIcon from './CurrencyIcon'

interface Props {
  base: string
  amount: number
  currencies: Currency[]
  prices: PriceData
}

// A mix of major fiat and crypto for the "at a glance" panel.
const TARGETS = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH']

export default function MultiCurrency({
  base,
  amount,
  currencies,
  prices,
}: Props) {
  const baseCur = useMemo(
    () => currencies.find((c) => c.code === base),
    [currencies, base],
  )

  const rows = useMemo(() => {
    if (!baseCur) return []
    return TARGETS.filter((code) => code !== base)
      .map((code) => currencies.find((c) => c.code === code))
      .filter((c): c is Currency => Boolean(c))
      .map((cur) => ({
        cur,
        value: convert(amount, baseCur, cur, prices),
      }))
  }, [baseCur, base, amount, currencies, prices])

  if (rows.length === 0) return null

  return (
    <section className="card multi-card">
      <h2 className="multi-title">
        {formatAmount(amount)} {base} in other currencies
      </h2>
      <ul className="multi-grid">
        {rows.map(({ cur, value }) => (
          <li key={cur.code} className="multi-item">
            <CurrencyIcon cur={cur} size={22} />
            <div className="multi-info">
              <span className="multi-code">{cur.code}</span>
              <span className="multi-value">
                {value != null ? formatAmount(value) : '—'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
