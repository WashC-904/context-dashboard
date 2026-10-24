export type DashCategory = { name: string; tokens: number; color: string; kind: 'used' | 'free' | 'buffer' | 'deferred' }
export type DashItem = { name: string; detail: string; tokens: number }
export type DashData = {
  model: string
  max: number
  used: number
  percent: number
  isAutoCompact: boolean
  categories: DashCategory[]
  memory: DashItem[]
  mcp: DashItem[]
  skills: { total: number; included: number; tokens: number } | null
  updatedAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'context-dashboard': { data: DashData | null }
  }
}
