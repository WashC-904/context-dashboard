import type { DashCategory, DashItem } from '../types'

export function fmt(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

/** A bar `width` cells wide, `share` (0 to 1) of it filled; a non-zero share always shows at least one cell. */
export function bar(share: number, width: number): { filled: string; rest: string } {
  const clamped = Math.max(0, Math.min(1, share))
  const cells = clamped > 0 ? Math.max(1, Math.round(clamped * width)) : 0
  const n = Math.min(cells, width)
  return { filled: '█'.repeat(n), rest: '░'.repeat(width - n) }
}

export function pct(part: number, whole: number): string {
  if (whole <= 0) return '0%'
  const p = (part / whole) * 100
  return p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`
}

/** The categories worth a row, biggest first within the used ones; free space and the buffer follow, deferred tools are left out. */
export function rowsFor(categories: readonly DashCategory[]): DashCategory[] {
  const used = categories.filter(c => c.kind === 'used' && c.tokens > 0).sort((a, b) => b.tokens - a.tokens)
  const rest = categories.filter(c => (c.kind === 'free' || c.kind === 'buffer') && c.tokens > 0)
  return [...used, ...rest]
}

export function top(items: readonly DashItem[], n: number): { shown: DashItem[]; more: number } {
  const sorted = [...items].sort((a, b) => b.tokens - a.tokens)
  return { shown: sorted.slice(0, n), more: Math.max(0, sorted.length - n) }
}

export function shorten(s: string, max: number): string {
  return s.length <= max ? s : '…' + s.slice(s.length - (max - 1))
}
