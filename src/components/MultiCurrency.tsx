import { useEffect, useState } from 'react'
import { fetchLatest } from '../api/frankfurter'
import { currencyToFlag, formatAmount } from '../lib/format'
import type { CurrencyMap } from '../api/frankfurter'

interface Props {
  base: string
  amount: number
  currencies: CurrencyMap
}

// A compact set of widely-traded currencies for the "at a glance" panel.
const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY']

export default function MultiCurrency({ base, amount, currencies }: Props) {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const symbols = POPULAR.filter((c) => c !== base && c in currencies)

  useEffect(() => {
    if (symbols.length === 0) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchLatest(base, symbols, 1, controller.signal)
      .then((res) => setRates(res.rates))
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not load rates.')
        }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
    // symbols is derived from base+currencies; base is the meaningful dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, currencies])

  return (
    <section className="card multi-card">
      <h2 className="multi-title">
        {formatAmount(amount)} {base} in other currencies
      </h2>
      {error ? (
        <p className="chart-msg error">{error}</p>
      ) : (
        <ul className={'multi-grid' + (loading ? ' loading' : '')}>
          {symbols.map((code) => {
            const value = rates[code] != null ? rates[code] * amount : null
            return (
              <li key={code} className="multi-item">
                <span className="multi-flag">{currencyToFlag(code)}</span>
                <div className="multi-info">
                  <span className="multi-code">{code}</span>
                  <span className="multi-value">
                    {value != null ? formatAmount(value) : '—'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
