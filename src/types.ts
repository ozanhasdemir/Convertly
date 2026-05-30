export type CurrencyKind = 'fiat' | 'crypto'

/** A currency the app can convert between — either fiat or crypto. */
export interface Currency {
  /** Display code, e.g. "USD" or "BTC". Unique across the registry. */
  code: string
  name: string
  kind: CurrencyKind
  /** CoinGecko id (crypto only), e.g. "bitcoin". */
  id?: string
  /** Logo URL (crypto only). */
  image?: string
}
