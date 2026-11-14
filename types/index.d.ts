export type Percent = number | null
export type Weekly = number | null
export type Tokens = { used: number; window: number } | null

declare module 'claude-code' {
  interface PluginState {
    'compactor': { percent: Percent; tokens: Tokens; weekly: Weekly; isCompacting: boolean; isWorking: boolean }
  }
}
