import { useEffect, useMemo, useState } from 'react'
import { fetchCurrencies, fetchLatest } from './api/frankfurter'
import { fetchTopCoins } from './api/coingecko'
import { rate as computeRate, type PriceData } from './lib/rates'
import type { Currency } from './types'
import Converter from './components/Converter'
import RateChart from './components/RateChart'
import MultiCurrency from './components/MultiCurrency'

const CRYPTO_COUNT = 20

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [prices, setPrices] = useState<PriceData>({ fiatUsd: {}, cryptoUsd: {} })
  const [rateDate, setRateDate] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [cryptoOffline, setCryptoOffline] = useState(false)

  const [from, setFrom] = useState('BTC')
  const [to, setTo] = useState('USD')
  const [amount, setAmount] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      // Fiat list + USD-based rates are required; crypto is best-effort so a
      // CoinGecko hiccup (rate limit) still leaves a working fiat converter.
      const [fiatList, usdBase, coins] = await Promise.allSettled([
        fetchCurrencies(signal),
        fetchLatest('USD', [], 1, signal),
        fetchTopCoins(CRYPTO_COUNT, signal),
      ])

      if (signal.aborted) return

      if (fiatList.status === 'rejected' || usdBase.status === 'rejected') {
        setLoadError('Could not reach the rates service. Please retry.')
        return
      }

      const registry: Currency[] = Object.entries(fiatList.value).map(
        ([code, name]) => ({ code, name, kind: 'fiat' as const }),
      )
      const taken = new Set(registry.map((c) => c.code))
      const cryptoUsd: Record<string, number> = {}

      if (coins.status === 'fulfilled') {
        for (const coin of coins.value) {
          const code = coin.symbol.toUpperCase()
          if (taken.has(code)) continue // avoid clashing with a fiat code
          taken.add(code)
          registry.push({
            code,
            name: coin.name,
            kind: 'crypto',
            id: coin.id,
            image: coin.image,
          })
          cryptoUsd[code] = coin.current_price
        }
      } else {
        setCryptoOffline(true)
      }

      setCurrencies(registry)
      setPrices({ fiatUsd: usdBase.value.rates, cryptoUsd })
      setRateDate(usdBase.value.date)

      // If our preferred defaults aren't available (e.g. crypto offline),
      // fall back to a guaranteed fiat pair.
      if (!taken.has('BTC')) {
        setFrom('USD')
        setTo('EUR')
      }
      setReady(true)
    }

    load().catch((err: unknown) => {
      if ((err as Error).name !== 'AbortError') {
        setLoadError('Something went wrong loading Convertly. Please retry.')
      }
    })
    return () => controller.abort()
  }, [])

  const fromCur = useMemo(
    () => currencies.find((c) => c.code === from),
    [currencies, from],
  )
  const toCur = useMemo(
    () => currencies.find((c) => c.code === to),
    [currencies, to],
  )

  const liveRate = useMemo(() => {
    if (!fromCur || !toCur) return null
    return computeRate(fromCur, toCur, prices)
  }, [fromCur, toCur, prices])

  const involvesCrypto = fromCur?.kind === 'crypto' || toCur?.kind === 'crypto'

  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="app">
      <header className="masthead">
        <a className="brand" href="/">
          <img src="/convertly.svg" width={36} height={36} alt="" />
          <span className="brand-name">Convertly</span>
        </a>
        <p className="tagline">Fiat &amp; crypto, converted.</p>
      </header>

      <main className="content">
        {loadError ? (
          <div className="card boot-error">
            <p>{loadError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : !ready ? (
          <div className="card boot-loading">Loading rates…</div>
        ) : (
          <>
            {cryptoOffline && (
              <div className="card notice">
                Crypto prices are temporarily unavailable (rate limited) — fiat
                conversion is still live.
              </div>
            )}
            <Converter
              currencies={currencies}
              fromCur={fromCur}
              toCur={toCur}
              from={from}
              to={to}
              amount={amount}
              rate={liveRate}
              rateDate={rateDate}
              live={involvesCrypto}
              onAmountChange={setAmount}
              onFromChange={setFrom}
              onToChange={setTo}
              onSwap={handleSwap}
            />
            {fromCur && toCur && (
              <RateChart fromCur={fromCur} toCur={toCur} />
            )}
            <MultiCurrency
              base={from}
              amount={Number.isNaN(amount) ? 0 : amount}
              currencies={currencies}
              prices={prices}
            />
          </>
        )}
      </main>

      <footer className="site-footer">
        <span>
          Fiat rates from{' '}
          <a href="https://frankfurter.dev" target="_blank" rel="noreferrer">
            Frankfurter
          </a>{' '}
          (ECB) · crypto from{' '}
          <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
            CoinGecko
          </a>
        </span>
        <span className="footer-by">
          A{' '}
          <a href="https://ozanhasdemir.com" target="_blank" rel="noreferrer">
            ozanhasdemir.com
          </a>{' '}
          project
        </span>
      </footer>
    </div>
  )
}
