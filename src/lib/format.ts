// Formatting + small presentation helpers.

/** Format a number as a currency string using the Intl API. */
export function formatCurrency(value: number, code: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    // Fall back for codes Intl doesn't recognise.
    return `${value.toFixed(2)} ${code}`
  }
}

/** A plain, high-precision number (used for the big result figure). */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value < 1 ? 6 : 4,
    minimumFractionDigits: 2,
  }).format(value)
}

// A few currencies aren't tied to a single ISO country code, so map them
// explicitly. Everything else derives its flag from the first two letters
// of the currency code (e.g. "USD" -> "US" -> 🇺🇸).
const FLAG_OVERRIDES: Record<string, string> = {
  EUR: '🇪🇺',
  XDR: '🏳️',
}

/** Convert an ISO 4217 currency code to a flag emoji. */
export function currencyToFlag(code: string): string {
  if (FLAG_OVERRIDES[code]) return FLAG_OVERRIDES[code]
  const country = code.slice(0, 2).toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) return '🏳️'
  const A = 0x1f1e6
  const base = 'A'.charCodeAt(0)
  return String.fromCodePoint(
    A + (country.charCodeAt(0) - base),
    A + (country.charCodeAt(1) - base),
  )
}
