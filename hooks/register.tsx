import type { Register, SessionUsage } from 'claude-code'

import type { DashData } from '../types'
import { bar, fmt, pct, rowsFor, shorten, top } from './dash'

const PANE = 'context-dashboard'

function toData(usage: SessionUsage, now: number): DashData | null {
  const b = usage.context.breakdown
  if (!b) return null
  return {
    model: b.model,
    max: b.rawMaxTokens,
    used: b.totalTokens,
    percent: b.percentage,
    isAutoCompact: b.isAutoCompactEnabled,
    categories: b.categories.map(c => ({ name: c.name, tokens: c.tokens, color: c.color, kind: c.kind })),
    memory: b.memoryFiles.map(f => ({ name: f.path, detail: f.type, tokens: f.tokens })),
    mcp: b.mcpTools.map(t => ({ name: t.name, detail: t.serverName + (t.isLoaded ? '' : ' (on demand)'), tokens: t.tokens })),
    skills: b.skills ? { total: b.skills.totalSkills, included: b.skills.includedSkills, tokens: b.skills.tokens } : null,
    updatedAt: now,
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'context-dashboard', description: 'Open the Context Dashboard pane' })
    const fresh = toData(await $.session.usage({ breakdown: 'summary' }), await $.clock.now())
    if (fresh) await $.state.set({ plugin: 'context-dashboard', key: 'data' } as const, fresh)
    return next(e)
  })

  on('command.run', { command: 'context-dashboard' }, async $ => {
    const fresh = toData(await $.session.usage({ breakdown: 'summary' }), await $.clock.now())
    if (fresh) await $.state.set({ plugin: 'context-dashboard', key: 'data' } as const, fresh)
    await $.ui.open({ id: PANE, title: 'Context' })
    return { text: 'Context Dashboard opened.' }
  })

  on('turn.complete', async ($, e, next) => {
    const fresh = toData(await $.session.usage({ breakdown: 'summary' }), await $.clock.now())
    if (fresh) await $.state.set({ plugin: 'context-dashboard', key: 'data' } as const, fresh)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const { value: d = null } = await $.state.get({ plugin: 'context-dashboard', key: 'data' } as const)
    if (d === null) return <Text dimColor>Measuring the context window…</Text>

    const cols = Math.max(30, e.props.bodyColumns)
    const wide = cols - 2
    const total = bar(d.max > 0 ? d.used / d.max : 0, wide)
    const catBar = Math.max(8, Math.min(24, cols - 46))
    const mcp = top(d.mcp, 5)
    const mem = top(d.memory, 5)

    return (
      <Box flexDirection="column">
        <Text bold>
          Context window <Text dimColor>{d.model}</Text>
        </Text>
        <Text>
          <Text color="promptBorder">{total.filled}</Text>
          <Text dimColor>{total.rest}</Text>
        </Text>
        <Text>
          {fmt(d.used)} of {fmt(d.max)} used ({Math.round(d.percent)}%)
          <Text dimColor> {d.isAutoCompact ? 'auto-compact on' : 'auto-compact off'}</Text>
        </Text>
        <Text> </Text>
        <Text bold>By category</Text>
        {rowsFor(d.categories).map(c => {
          const b = bar(d.max > 0 ? c.tokens / d.max : 0, catBar)
          const isUsed = c.kind === 'used'
          return (
            <Text key={c.name}>
              <Text color={c.color}>{isUsed ? '●' : '○'} </Text>
              {c.name.padEnd(22)}
              <Text color={c.color} dimColor={!isUsed}>{b.filled}</Text>
              <Text dimColor>{b.rest} {fmt(c.tokens).padStart(6)} {pct(c.tokens, d.max).padStart(4)}</Text>
            </Text>
          )
        })}
        {mem.shown.length > 0 && (
          <Box flexDirection="column">
            <Text> </Text>
            <Text bold>Memory files</Text>
            {mem.shown.map(m => (
              <Text key={m.name} dimColor>
                {fmt(m.tokens).padStart(6)}  {shorten(m.name, cols - 12)}
              </Text>
            ))}
            {mem.more > 0 && <Text dimColor>        and {mem.more} more</Text>}
          </Box>
        )}
        {mcp.shown.length > 0 && (
          <Box flexDirection="column">
            <Text> </Text>
            <Text bold>Largest MCP tools</Text>
            {mcp.shown.map(t => (
              <Text key={t.name + t.detail} dimColor>
                {fmt(t.tokens).padStart(6)}  {shorten(t.name, 28)} <Text dimColor>{shorten(t.detail, cols - 40)}</Text>
              </Text>
            ))}
            {mcp.more > 0 && <Text dimColor>        and {mcp.more} more</Text>}
          </Box>
        )}
        {d.skills !== null && (
          <Box flexDirection="column">
            <Text> </Text>
            <Text bold>Skills</Text>
            <Text dimColor>
              {d.skills.included} of {d.skills.total} listed, {fmt(d.skills.tokens)} tokens
            </Text>
          </Box>
        )}
      </Box>
    )
  })
}
