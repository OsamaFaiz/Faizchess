let ctx: AudioContext | null = null
export function moveSound(kind: 'move' | 'capture' | 'check' | 'end') {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(), g = ctx.createGain()
    const f = { move: 520, capture: 330, check: 760, end: 440 }[kind]
    o.type = kind === 'capture' ? 'triangle' : 'sine'
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === 'end' ? 0.5 : 0.12))
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.55)
  } catch { /* audio unavailable */ }
}
export const buzz = (ms = 15) => { try { navigator.vibrate?.(ms) } catch { /* noop */ } }
