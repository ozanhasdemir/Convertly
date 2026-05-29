import { useEffect, useMemo, useRef, useState } from 'react'
import type { CurrencyMap } from '../api/frankfurter'
import { currencyToFlag } from '../lib/format'

interface Props {
  /** Which side this selector represents — drives the accent colour. */
  variant: 'from' | 'to'
  value: string
  currencies: CurrencyMap
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

  const codes = useMemo(() => Object.keys(currencies).sort(), [currencies])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return codes
    return codes.filter(
      (code) =>
        code.toLowerCase().includes(q) ||
        currencies[code].toLowerCase().includes(q),
    )
  }, [codes, currencies, query])

  // Close on outside click.
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

  // Focus the search box when opening; reset the active row.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // Defer so the input exists in the DOM.
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
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const code = filtered[active]
      if (code) choose(code)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
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
        <span className="cur-flag">{currencyToFlag(value)}</span>
        <span className="cur-code">{value}</span>
        <svg className="cur-caret" width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="cur-popover" role="listbox">
          <input
            ref={inputRef}
            className="cur-search"
            placeholder="Search currency…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
          <ul className="cur-list">
            {filtered.length === 0 && (
              <li className="cur-empty">No matches</li>
            )}
            {filtered.map((code, i) => (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === value}
                  className={
                    'cur-option' +
                    (i === active ? ' active' : '') +
                    (code === value ? ' selected' : '') +
                    (code === disabledCode ? ' disabled' : '')
                  }
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(code)}
                  disabled={code === disabledCode}
                >
                  <span className="cur-flag">{currencyToFlag(code)}</span>
                  <span className="cur-code">{code}</span>
                  <span className="cur-name">{currencies[code]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
