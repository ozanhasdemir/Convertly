import { currencyToFlag } from '../lib/format'
import type { Currency } from '../types'

interface Props {
  cur: Currency
  size?: number
}

/** A flag emoji for fiat, or the coin logo for crypto. */
export default function CurrencyIcon({ cur, size = 18 }: Props) {
  if (cur.kind === 'crypto' && cur.image) {
    return (
      <img
        className="cur-img"
        src={cur.image}
        alt=""
        width={size}
        height={size}
        loading="lazy"
      />
    )
  }
  return (
    <span className="cur-flag" style={{ fontSize: size }}>
      {currencyToFlag(cur.code)}
    </span>
  )
}
