import { expect, test } from 'claude-code/testing'
import { bar, pct, rowsFor, top, shorten } from './dash'

test('dashboard: a bar always adds up to its width and shows a tiny share', () => {
  const b = bar(0.001, 10)
  expect(b.filled.length + b.rest.length).toBe(10)
  expect(b.filled.length).toBe(1)
  expect(bar(0, 10).filled).toBe('')
  expect(bar(2, 10).filled.length).toBe(10)
})

test('dashboard: percentages and ordering', () => {
  expect(pct(5, 1000)).toBe('<1%')
  expect(pct(500, 1000)).toBe('50%')
  expect(pct(1, 0)).toBe('0%')
  const rows = rowsFor([
    { name: 'a', tokens: 1, color: 'x', kind: 'used' },
    { name: 'deferred', tokens: 9, color: 'x', kind: 'deferred' },
    { name: 'b', tokens: 5, color: 'x', kind: 'used' },
    { name: 'free', tokens: 3, color: 'x', kind: 'free' },
  ])
  expect(rows.map(r => r.name)).toEqual(['b', 'a', 'free'])
})

test('dashboard: top items and shortened paths', () => {
  const t = top([{ name: 'a', detail: '', tokens: 1 }, { name: 'b', detail: '', tokens: 3 }, { name: 'c', detail: '', tokens: 2 }], 2)
  expect(t.shown.map(i => i.name)).toEqual(['b', 'c'])
  expect(t.more).toBe(1)
  expect(shorten('/very/long/path/CLAUDE.md', 12).endsWith('CLAUDE.md')).toBe(true)
})
