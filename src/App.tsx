import { useEffect, useState } from 'react'
import {
  fetchCurrencies,
  fetchLatest,
  type CurrencyMap,
} from './api/frankfurter'
import Converter from './components/Converter'
import RateChart from './components/RateChart'
import MultiCurrency from './components/MultiCurrency'

export default function App() {
  const [currencies, setCurrencies] = useState<CurrencyMap>({})
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [amount, setAmount] = useState(1)

  const [rate, setRate] = useState<number | null>(null)
  const [rateDate, setRateDate] = useState<string | null>(null)
  const [rateLoading, setRateLoading] = useState(true)
  const [rateError, setRateError] = useState<string | null>(null)

  // Load the currency list once on mount.
  useEffect(() => {
    const controller = new AbortController()
    fetchCurrencies(controller.signal)
      .then((map) => {
        setCurrencies(map)
        setReady(true)
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          setLoadError('Could not reach the rates service. Please retry.')
        }
      })
    return () => controller.abort()
  }, [])

  // Refresh the live rate whenever the pair changes.
  useEffect(() => {
    if (!ready) return
    if (from === to) {
      setRate(1)
      setRateDate(null)
      setRateLoading(false)
      setRateError(null)
      return
    }
    const controller = new AbortController()
    setRateLoading(true)
    setRateError(null)
    fetchLatest(from, [to], 1, controller.signal)
      .then((res) => {
        setRate(res.rates[to])
        setRateDate(res.date)
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          setRateError('Could not load the rate.')
          setRate(null)
        }
      })
      .finally(() => setRateLoading(false))
    return () => controller.abort()
  }, [from, to, ready])

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
        <p className="tagline">Real rates, instantly.</p>
      </header>

      <main className="content">
        {loadError ? (
          <div className="card boot-error">
            <p>{loadError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : !ready ? (
          <div className="card boot-loading">Loading currencies…</div>
        ) : (
          <>
            <Converter
              currencies={currencies}
              from={from}
              to={to}
              amount={amount}
              rate={rate}
              rateDate={rateDate}
              loading={rateLoading}
              error={rateError}
              onAmountChange={setAmount}
              onFromChange={setFrom}
              onToChange={setTo}
              onSwap={handleSwap}
            />
            <RateChart from={from} to={to} />
            <MultiCurrency
              base={from}
              amount={Number.isNaN(amount) ? 0 : amount}
              currencies={currencies}
            />
          </>
        )}
      </main>

      <footer className="site-footer">
        <span>
          Rates from{' '}
          <a href="https://frankfurter.dev" target="_blank" rel="noreferrer">
            Frankfurter
          </a>{' '}
          · published by the European Central Bank
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
