# Convertly

**Real rates, instantly.** A currency converter with live and historical exchange rates.

🔗 Live: [convertly.ozanhasdemir.com](https://convertly.ozanhasdemir.com) · Part of the [ozanhasdemir.com](https://ozanhasdemir.com) portfolio.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)

## Features

- **Fiat & crypto conversion** — 30+ fiat currencies plus the top cryptocurrencies, freely cross-converted (fiat↔fiat, fiat↔crypto, crypto↔crypto).
- **Instant results** — every asset is priced through USD on load, so conversions are computed client-side with no per-keystroke network calls.
- **Historical trends** — an interactive area chart over 7D / 1M / 3M / 6M / 1Y for any pair, with the percentage change for the period.
- **At-a-glance panel** showing your amount across major fiat and crypto.
- **Searchable picker** with keyboard navigation, grouped into Crypto / Fiat, with country flags and coin logos.
- **Two-tone design** — indigo for the source, emerald for the target, so the direction of conversion is always obvious.
- Fully responsive, dark-themed, no API key required.

## Data

- **Fiat** rates come from the free, key-less [Frankfurter API](https://frankfurter.dev),
  which republishes **European Central Bank** reference rates (updated on ECB working days).
- **Crypto** prices and history come from the free [CoinGecko API](https://www.coingecko.com/en/api).

Everything is priced relative to USD, then cross-converted: an asset's USD value is
`1 ÷ (USD→fiat rate)` for fiat and the live USD price for crypto.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the build/dev tooling
- [Recharts](https://recharts.org/) for the historical chart
- Plain CSS (custom properties), no UI framework

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  api/
    frankfurter.ts       # typed client for the Frankfurter (fiat) API
    coingecko.ts         # typed client for the CoinGecko (crypto) API
  components/
    Converter.tsx        # main from→to converter card
    CurrencySelect.tsx   # searchable, grouped currency dropdown
    CurrencyIcon.tsx     # flag emoji (fiat) or coin logo (crypto)
    RateChart.tsx        # historical area chart + range tabs
    MultiCurrency.tsx    # "amount in other currencies" panel
  lib/
    rates.ts             # USD-cross conversion engine
    history.ts           # per-asset USD series + cross for the chart
    format.ts            # currency/number formatting + flag emoji
    dates.ts             # range → ISO date helpers
  types.ts               # unified Currency type
  App.tsx                # data loading + state
```
