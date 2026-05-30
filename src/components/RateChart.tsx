import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { crossSeries, fetchUsdSeries, type HistoryPoint } from '../lib/history'
import { formatAmount } from '../lib/format'
import { RANGES, rangeToDates, shortLabel, type RangeKey } from '../lib/dates'
import type { Currency } from '../types'

interface Props {
  fromCur: Currency
  toCur: Currency
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  from: string
  to: string
}

/** Compact y-axis label: no decimals for big numbers, precision for small. */
function formatAxis(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (abs >= 1) return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (abs === 0) return '0'
  return Number(v.toPrecision(3)).toString()
}

function ChartTooltip({ active, payload, label, from, to }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <span className="chart-tip-date">{label && shortLabel(label)}</span>
      <span className="chart-tip-rate">
        1 {from} = {formatAmount(payload[0].value)} {to}
      </span>
    </div>
  )
}

export default function RateChart({ fromCur, toCur }: Props) {
  const [range, setRange] = useState<RangeKey>('1M')
  const [data, setData] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const from = fromCur.code
  const to = toCur.code

  useEffect(() => {
    if (from === to) {
      setData([])
      setLoading(false)
      return
    }
    const days = RANGES.find((r) => r.key === range)!.days
    const [start, end] = rangeToDates(days)
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    Promise.all([
      fetchUsdSeries(fromCur, { start, end, days }, controller.signal),
      fetchUsdSeries(toCur, { start, end, days }, controller.signal),
    ])
      .then(([fromSeries, toSeries]) => {
        setData(crossSeries(fromSeries, toSeries))
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not load historical rates.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [fromCur, toCur, from, to, range])

  const { min, max, change } = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, change: 0 }
    const rates = data.map((d) => d.rate)
    const first = rates[0]
    const last = rates[rates.length - 1]
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      change: first ? ((last - first) / first) * 100 : 0,
    }
  }, [data])

  const trendUp = change >= 0

  return (
    <section className="card chart-card">
      <header className="chart-head">
        <div>
          <h2 className="chart-title">
            {from} → {to} history
          </h2>
          {!loading && !error && data.length > 0 && (
            <span className={`chart-change ${trendUp ? 'up' : 'down'}`}>
              {trendUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              <span className="chart-change-sub"> over {range}</span>
            </span>
          )}
        </div>
        <div className="range-tabs" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={r.key === range}
              className={'range-tab' + (r.key === range ? ' active' : '')}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="chart-body">
        {from === to ? (
          <p className="chart-msg">Pick two different currencies to see a trend.</p>
        ) : loading ? (
          <p className="chart-msg">Loading…</p>
        ) : error ? (
          <p className="chart-msg error">{error}</p>
        ) : data.length === 0 ? (
          <p className="chart-msg">No data for this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={trendUp ? '#10b981' : '#f43f5e'}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={trendUp ? '#10b981' : '#f43f5e'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={shortLabel}
                tick={{ fill: '#8b90b5', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={[min * 0.998, max * 1.002]}
                tick={{ fill: '#8b90b5', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={formatAxis}
              />
              <Tooltip
                content={<ChartTooltip from={from} to={to} />}
                cursor={{ stroke: '#3a3f63', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={trendUp ? '#10b981' : '#f43f5e'}
                strokeWidth={2}
                fill="url(#rateFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
