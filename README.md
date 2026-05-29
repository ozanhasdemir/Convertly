# Convertly

**Real rates, instantly.** A currency converter with live and historical exchange rates.

🔗 Live: [convertly.ozanhasdemir.com](https://convertly.ozanhasdemir.com) · Part of the [ozanhasdemir.com](https://ozanhasdemir.com) portfolio.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)

## Features

- **Live conversion** between 30+ currencies with an instant, client-side result.
- **Historical trends** — an interactive area chart over 7D / 1M / 3M / 6M / 1Y, with the percentage change for the period.
- **At-a-glance panel** showing your amount across the major world currencies.
- **Searchable currency picker** with keyboard navigation and country flags.
- **Two-tone design** — indigo for the source currency, emerald for the target, so the direction of conversion is always obvious.
- Fully responsive, dark-themed, no API key required.

## Data

Exchange rates come from the free, key-less [Frankfurter API](https://frankfurter.dev),
which republishes reference rates from the **European Central Bank**. Rates update on
ECB working days (no weekends or public holidays).

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
  api/frankfurter.ts     # typed client for the Frankfurter API
  components/
    Converter.tsx        # main from→to converter card
    CurrencySelect.tsx   # searchable currency dropdown
    RateChart.tsx        # historical area chart + range tabs
    MultiCurrency.tsx    # "amount in other currencies" panel
  lib/
    format.ts            # currency/number formatting + flag emoji
    dates.ts             # range → ISO date helpers
  App.tsx                # state + data fetching
```
