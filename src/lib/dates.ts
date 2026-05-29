// Date helpers for the historical chart's range selector.

export type RangeKey = '7D' | '1M' | '3M' | '6M' | '1Y'

export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7D', label: '7D', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '6M', label: '6M', days: 182 },
  { key: '1Y', label: '1Y', days: 365 },
]

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Returns [startDate, endDate] as ISO strings for the given range. */
export function rangeToDates(days: number): [string, string] {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  return [toISODate(start), toISODate(end)]
}

/** "2026-05-29" -> "May 29" for compact axis ticks. */
export function shortLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
