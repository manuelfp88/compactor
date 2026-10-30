export type Percent = number | null
export type Tokens = { used: number; window: number } | null

declare module 'claude-code' {
  interface PluginState {
    'compactor': { percent: Percent; tokens: Tokens; isCompacting: boolean; isWorking: boolean }
  }
}
