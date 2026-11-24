import { BatteryFull, Signal, WifiOff } from 'lucide-react'
import { useEffect, useState, type ComponentType } from 'react'
import { StoreProvider, useStore, type ScreenName } from './app/store'
import { Logo, cx } from './components/ui'
import { AISetup } from './screens/AISetup'
import { Game } from './screens/Game'
import { Home } from './screens/Home'
import { Learn } from './screens/Learn'
import { Lesson } from './screens/Lesson'
import { LocalSetup } from './screens/LocalSetup'
import { Nearby } from './screens/Nearby'
import { Onboarding } from './screens/Onboarding'
import { PlayModes } from './screens/PlayModes'
import { Profile } from './screens/Profile'
import { Result } from './screens/Result'
import { Review } from './screens/Review'
import { Settings } from './screens/Settings'
import { Splash } from './screens/Splash'
import { Stats } from './screens/Stats'

const SCREENS: Record<ScreenName, ComponentType> = {
  splash: Splash, onboarding: Onboarding, home: Home, play: PlayModes, 'ai-setup': AISetup, 'local-setup': LocalSetup,
  nearby: Nearby, game: Game, result: Result, review: Review, profile: Profile, stats: Stats, learn: Learn, lesson: Lesson, settings: Settings,
}

function StatusBar({ dark }: { dark: boolean }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id) }, [])
  return (
    <div className={cx('flex h-8 shrink-0 items-center justify-between px-6 text-[13px] font-bold', dark ? 'text-white' : 'text-ink')}>
      <span className="tnum">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
      <span className="flex items-center gap-1.5"><WifiOff size={14} /><Signal size={14} /><BatteryFull size={17} /></span>
    </div>
  )
}

function Phone() {
  const { screen, dir, stack, settings, toast } = useStore()
  const C = SCREENS[screen.name]
  const immersive = screen.name === 'splash'
  return (
    <div data-theme={settings.theme} className="relative flex h-full w-full flex-col overflow-hidden bg-bg text-ink">
      {!immersive && <StatusBar dark={settings.theme === 'dark'} />}
      {immersive && <div className="absolute inset-x-0 top-0 z-10"><StatusBar dark /></div>}
      <div key={`${screen.name}-${stack.length}-${screen.params?.key ?? ''}`} className={cx('relative min-h-0 flex-1', dir === 'fwd' ? 'anim-in' : 'anim-back')}>
        <C />
      </div>
      {toast && <div className="anim-pop absolute inset-x-6 bottom-24 z-[60] rounded-2xl bg-ink px-4 py-3 text-center text-sm font-bold text-bg shadow-2xl">{toast}</div>}
      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-[70] flex justify-center"><span className="h-1 w-28 rounded-full bg-ink/40" /></div>
    </div>
  )
}

const FLOWS: [string, [string, ScreenName, Record<string, any>?][]][] = [
  ['Entry', [['Splash', 'splash'], ['Onboarding', 'onboarding'], ['Home', 'home']]],
  ['Play', [['Game modes', 'play'], ['vs Computer', 'ai-setup'], ['Pass & Play', 'local-setup'], ['Nearby · Host / Join', 'nearby']]],
  ['Learn', [['Learn hub', 'learn'], ['Castling lesson', 'lesson', { id: 'castling' }], ['En passant', 'lesson', { id: 'enpassant' }], ['Promotion', 'lesson', { id: 'promotion' }], ['Daily challenge', 'lesson', { id: 'daily' }]]],
  ['You', [['Statistics', 'stats'], ['Profile', 'profile'], ['Settings', 'settings']]],
]

function FlowPanel() {
  const { reset, go, screen } = useStore()
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col text-white lg:flex">
      <div className="flex items-center gap-3"><Logo size={44} /><div><p className="font-display text-xl font-bold tracking-[0.12em]">CHESS MATE</p><p className="text-xs text-white/50">Android · Material 3 prototype</p></div></div>
      <p className="mt-8 text-sm leading-relaxed text-white/60">A fully connected, playable prototype. Jump into any flow, or tap through the app as a player would.</p>
      <div className="mt-6 space-y-5">
        {FLOWS.map(([g, items]) => (
          <div key={g}>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D6A85F]">{g}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map(([label, name, params]) => (
                <button key={label} onClick={() => (['home', 'splash', 'onboarding', 'play', 'learn', 'stats', 'profile'].includes(name) ? reset(name, params) : (reset('home'), setTimeout(() => go(name, params))))} className={cx('rounded-lg px-2.5 py-1.5 text-xs font-bold transition', screen.name === name && !params ? 'bg-[#D6A85F] text-[#171A21]' : 'bg-white/[0.06] text-white/80 hover:bg-white/10')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex gap-1.5 pt-8">
        {['#171A21', '#252B36', '#202631', '#D6A85F', '#AAB2BF', '#F5F3EF'].map((c) => <span key={c} title={c} className="h-7 flex-1 rounded-md ring-1 ring-white/10" style={{ background: c }} />)}
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-full items-center justify-center gap-14 bg-[radial-gradient(ellipse_at_top,#1d222c,#0b0d11_70%)] sm:p-6">
        <FlowPanel />
        <div className="h-[100dvh] w-full sm:h-[880px] sm:max-h-[calc(100dvh-48px)] sm:w-[408px] sm:rounded-[48px] sm:bg-[#05060a] sm:p-[10px] sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),inset_0_0_0_2px_#2a2f3a]">
          <div className="h-full w-full overflow-hidden sm:rounded-[38px]"><Phone /></div>
        </div>
      </div>
    </StoreProvider>
  )
}
