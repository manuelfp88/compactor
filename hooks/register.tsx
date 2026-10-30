import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// A partir de este porcentaje de contexto se puede compactar.
const UMBRAL = 75
// Un torno de apretar: comprimir.
const ICONO = '🗜️'

const percent = atom({ plugin: 'compactor', key: 'percent' } as const, null)
const tokens = atom({ plugin: 'compactor', key: 'tokens' } as const, null)
const isCompacting = atom({ plugin: 'compactor', key: 'isCompacting' } as const, false)
// El pie no dice si Claude trabaja: va de enviar un mensaje a acabar el turno.
const isWorking = atom({ plugin: 'compactor', key: 'isWorking' } as const, false)

const refresh = async ($: EngineInterface) => {
  const { context } = await $.session.usage()
  await update($, percent, () => context.percent ?? null)
  await update($, tokens, () => context.tokens === undefined ? null : { used: context.tokens, window: context.window })
}

// 120300 → «120.3k», 1000000 → «1M».
const short = (n: number) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : `${n}`

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    // Borra la línea de estado que dejó el diagnóstico de una versión anterior.
    $.ui.status(undefined)
    await refresh($)
    return result
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, isWorking, () => true)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      await update($, isWorking, () => false)
      await refresh($)
    }
    return result
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  // En el pie del cuadro de texto, junto a los modos de la sesión.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const pct = await read($, percent)
    const busy = await read($, isCompacting)
    const tok = await read($, tokens)
    const isEnabled = !(await read($, isWorking)) && !busy && pct !== null && pct >= UMBRAL
    const shown = busy ? '…' : pct === null ? '–' : `${Math.round(pct)} %`

    const compact = async () => {
      if (!isEnabled) return
      await update($, isCompacting, () => true)
      try {
        const out = await $.session.compact()
        if ('skip' in out && out.skip) $.ui.toast(`No se compactó: ${out.skip}`)
      } catch {
        $.ui.toast('No se puede compactar mientras Claude trabaja')
      } finally {
        await update($, isCompacting, () => false)
        await refresh($)
      }
    }

    return (
      <Box>
        {e.props.modes.length > 0 && <Text dimColor>{e.props.modes.join(' & ')}{'  '}</Text>}
        <Button key="compactar" plain dimColor={!isEnabled} onPress={compact}>
          {ICONO}{' '}
          <Text color={isEnabled ? 'claude' : 'inactive'} bold={isEnabled}>{shown}</Text>
        </Button>
        {tok && <Text dimColor>{'  '}{short(tok.used)} / {short(tok.window)}</Text>}
      </Box>
    )
  })
}
