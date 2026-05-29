import type { CurrencyMap } from '../api/frankfurter'
import { formatAmount } from '../lib/format'
import CurrencySelect from './CurrencySelect'

interface Props {
  currencies: CurrencyMap
  from: string
  to: string
  amount: number
  rate: number | null
  rateDate: string | null
  loading: boolean
  error: string | null
  onAmountChange: (amount: number) => void
  onFromChange: (code: string) => void
  onToChange: (code: string) => void
  onSwap: () => void
}

export default function Converter({
  currencies,
  from,
  to,
  amount,
  rate,
  rateDate,
  loading,
  error,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
}: Props) {
  const result = rate != null ? amount * rate : null

  return (
    <section className="card converter">
      <div className="conv-grid">
        {/* FROM side */}
        <div className="conv-side from">
          <label className="conv-label" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            className="conv-amount"
            type="number"
            inputMode="decimal"
            min={0}
            value={Number.isNaN(amount) ? '' : amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value))}
          />
          <CurrencySelect
            variant="from"
            value={from}
            currencies={currencies}
            onChange={onFromChange}
            disabledCode={to}
          />
        </div>

        {/* SWAP */}
        <button
          type="button"
          className="conv-swap"
          onClick={onSwap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 4L4 7l3 3M4 7h13M17 20l3-3-3-3m3 3H7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* TO side */}
        <div className="conv-side to">
          <span className="conv-label">Converted to</span>
          <div className={'conv-result' + (loading ? ' loading' : '')}>
            {error ? (
              <span className="conv-error">—</span>
            ) : result != null ? (
              formatAmount(result)
            ) : (
              '…'
            )}
          </div>
          <CurrencySelect
            variant="to"
            value={to}
            currencies={currencies}
            onChange={onToChange}
            disabledCode={from}
          />
        </div>
      </div>

      <div className="conv-footer">
        {error ? (
          <span className="conv-error">{error}</span>
        ) : rate != null ? (
          <span className="conv-rate">
            1 {from} = {rate.toFixed(4)} {to}
            {rateDate && <span className="conv-asof"> · as of {rateDate}</span>}
          </span>
        ) : (
          <span className="conv-rate">Fetching rate…</span>
        )}
      </div>
    </section>
  )
}
