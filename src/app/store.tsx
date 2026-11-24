import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ME, SAMPLE_MATCHES, type BoardThemeId, type Color, type LevelId, type MatchRecord, type PieceStyleId, type Player } from './data'

export type ScreenName =
  | 'splash' | 'onboarding' | 'home' | 'play' | 'ai-setup' | 'local-setup' | 'nearby'
  | 'game' | 'result' | 'review' | 'profile' | 'stats' | 'learn' | 'lesson' | 'settings'
export type Screen = { name: ScreenName; params?: Record<string, any> }

export type Settings = {
  sound: boolean; music: boolean; vibration: boolean
  theme: 'dark' | 'light'; board: BoardThemeId; pieces: PieceStyleId
  language: string; defaultTime: string
  showLegal: boolean; showCoords: boolean; autoQueen: boolean
  offlineAI: boolean; autoReconnect: boolean; keepAwake: boolean; preferredLink: 'bluetooth' | 'wifi'
}

export type GameConfig = {
  mode: 'ai' | 'local' | 'nearby'
  white: Player; black: Player
  time: string
  level?: LevelId
  myColor: Color
  autoFlip?: boolean
  allowUndo?: boolean
  allowHints?: boolean
  link?: 'bluetooth' | 'wifi'
}

export type GameResult = MatchRecord & { config: GameConfig; winner: Color | 'draw'; captures: { w: number; b: number }; checks: number }

const DEFAULT_SETTINGS: Settings = {
  sound: true, music: false, vibration: true, theme: 'dark', board: 'walnut', pieces: 'classic',
  language: 'English', defaultTime: '10+0', showLegal: true, showCoords: true, autoQueen: false,
  offlineAI: true, autoReconnect: true, keepAwake: true, preferredLink: 'bluetooth',
}

type Store = {
  screen: Screen; dir: 'fwd' | 'back'; stack: Screen[]
  go: (name: ScreenName, params?: Record<string, any>) => void
  back: () => void
  reset: (name: ScreenName, params?: Record<string, any>) => void
  settings: Settings; set: <K extends keyof Settings>(k: K, v: Settings[K]) => void
  rating: number; best: number
  matches: MatchRecord[]
  game: GameConfig | null; startGame: (c: GameConfig) => void
  result: GameResult | null; finishGame: (r: GameResult) => void
  toast: string | null; notify: (m: string) => void
}

const Ctx = createContext<Store | null>(null)
const load = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem('cm:' + k); return v ? { ...d, ...JSON.parse(v) } : d } catch { return d }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: 'splash' }])
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [settings, setSettings] = useState<Settings>(() => load('settings', DEFAULT_SETTINGS))
  const [prog, setProg] = useState(() => load('progress', { rating: ME.rating, best: ME.best, matches: [] as MatchRecord[] }))
  const [game, setGame] = useState<GameConfig | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { localStorage.setItem('cm:settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem('cm:progress', JSON.stringify(prog)) }, [prog])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const go = useCallback((name: ScreenName, params?: Record<string, any>) => { setDir('fwd'); setStack((s) => [...s, { name, params }]) }, [])
  const back = useCallback(() => { setDir('back'); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)) }, [])
  const reset = useCallback((name: ScreenName, params?: Record<string, any>) => { setDir('fwd'); setStack([{ name, params }]) }, [])
  const set = useCallback(<K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v })), [])

  const value = useMemo<Store>(() => ({
    screen: stack[stack.length - 1], dir, stack, go, back, reset, settings, set,
    rating: prog.rating, best: prog.best,
    matches: [...prog.matches, ...SAMPLE_MATCHES],
    game, startGame: (c) => { setGame(c); setDir('fwd'); setStack((s) => [...s.filter((x) => x.name !== 'game' && x.name !== 'result'), { name: 'game', params: { key: Date.now() } }]) },
    result,
    finishGame: (r) => {
      setResult(r)
      setProg((p) => {
        const rating = p.rating + (r.delta ?? 0)
        return { rating, best: Math.max(p.best, rating), matches: [r, ...p.matches].slice(0, 30).map(({ config, winner, captures, checks, ...m }: any) => m) }
      })
      setDir('fwd')
      setStack((s) => [...s.filter((x) => x.name !== 'game'), { name: 'result' }])
    },
    toast, notify: setToast,
  }), [stack, dir, go, back, reset, settings, set, prog, game, result, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}
