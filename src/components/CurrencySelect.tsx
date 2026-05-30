import { useEffect, useMemo, useRef, useState } from 'react'
import type { Currency } from '../types'
import CurrencyIcon from './CurrencyIcon'

interface Props {
  /** Which side this selector represents — drives the accent colour. */
  variant: 'from' | 'to'
  value: string
  currencies: Currency[]
  onChange: (code: string) => void
  /** A code to visually disable (e.g. the opposite side's selection). */
  disabledCode?: string
}

export default function CurrencySelect({
  variant,
  value,
  currencies,
  onChange,
  disabledCode,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => currencies.find((c) => c.code === value),
    [currencies, value],
  )

  // Crypto first (registry/market-cap order), then fiat alphabetically.
  const ordered = useMemo(() => {
    const crypto = currencies.filter((c) => c.kind === 'crypto')
    const fiat = currencies
      .filter((c) => c.kind === 'fiat')
      .sort((a, b) => a.code.localeCompare(b.code))
    return [...crypto, ...fiat]
  }, [currencies])

  const display = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ordered
    return ordered.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    )
  }, [ordered, query])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function choose(code: string) {
    if (code === disabledCode) return
    onChange(code)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, display.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const c = display[active]
      if (c) choose(c.code)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const groupLabel: Record<string, string> = {
    crypto: 'Crypto',
    fiat: 'Fiat currencies',
  }

  return (
    <div className={`cur-select ${variant}`} ref={rootRef}>
      <button
        type="button"
        className="cur-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected && <CurrencyIcon cur={selected} />}
        <span className="cur-code">{value}</span>
        <svg className="cur-caret" width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="cur-popover" role="listbox">
          <input
            ref={inputRef}
            className="cur-search"
            placeholder="Search currency or coin…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
          <ul className="cur-list">
            {display.length === 0 && <li className="cur-empty">No matches</li>}
            {display.map((c, i) => {
              const newGroup = i === 0 || display[i - 1].kind !== c.kind
              return (
                <li key={c.code}>
                  {newGroup && (
                    <div className="cur-group">{groupLabel[c.kind]}</div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === value}
                    className={
                      'cur-option' +
                      (i === active ? ' active' : '') +
                      (c.code === value ? ' selected' : '') +
                      (c.code === disabledCode ? ' disabled' : '')
                    }
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(c.code)}
                    disabled={c.code === disabledCode}
                  >
                    <CurrencyIcon cur={c} />
                    <span className="cur-code">{c.code}</span>
                    <span className="cur-name">{c.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
