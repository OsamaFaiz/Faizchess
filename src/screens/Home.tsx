import { Bell, Bluetooth, ChevronRight, Cpu, Flame, GraduationCap, Puzzle, Settings, TrendingUp, Users } from 'lucide-react'
import { BASE_STATS, ME, RATING_HISTORY } from '../app/data'
import { lessonById } from '../app/lessons'
import { useStore } from '../app/store'
import { Board } from '../components/Board'
import { LineChart, Ring } from '../components/Chart'
import { MatchRow } from '../components/MatchRow'
import { Avatar, BottomNav, Card, IconBtn, OfflineBadge, Section } from '../components/ui'

export function Home() {
  const { go, rating, matches } = useStore()
  const extra = matches.filter((m) => !m.id.startsWith('s'))
  const wins = BASE_STATS.wins + extra.filter((m) => m.result === 'win').length
  const total = BASE_STATS.total + extra.length
  const daily = lessonById('daily')
  const tiles = [
    { label: 'Play with AI', sub: '6 levels', icon: Cpu, to: 'ai-setup' as const },
    { label: 'Play with Friend', sub: 'Pass & Play', icon: Users, to: 'local-setup' as const },
    { label: 'Play Offline', sub: 'Bluetooth · Wi-Fi', icon: Bluetooth, to: 'nearby' as const },
    { label: 'Learn Chess', sub: '18 lessons', icon: GraduationCap, to: 'learn' as const },
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <header className="flex items-center gap-3 pt-3">
          <button onClick={() => go('profile')} aria-label="Profile"><Avatar initials={ME.initials} hue={ME.hue} size={46} ring /></button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted">Good evening</p>
            <p className="truncate text-[17px] font-extrabold">{ME.name}</p>
          </div>
          <IconBtn label="Notifications"><Bell size={21} /></IconBtn>
          <IconBtn label="Settings" onClick={() => go('settings')}><Settings size={21} /></IconBtn>
        </header>

        <Card className="relative mt-5 overflow-hidden bg-gradient-to-br from-surface to-panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Rapid rating</p>
              <p className="mt-1 font-display text-[44px] font-bold leading-none tnum">{rating}</p>
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-win"><TrendingUp size={14} />+84 this month</p>
            </div>
            <OfflineBadge />
          </div>
          <div className="-mx-1 mt-2"><LineChart data={[...RATING_HISTORY.slice(-14), rating]} height={64} /></div>
        </Card>

        <button onClick={() => go('play')} className="gold-grad group relative mt-4 flex h-[92px] w-full items-center overflow-hidden rounded-3xl px-6 text-left text-[#171A21] shadow-[0_18px_40px_-16px_rgba(214,168,95,0.9)] transition active:scale-[0.98]">
          <span className="relative z-10">
            <span className="block text-[22px] font-extrabold">Play Chess</span>
            <span className="block text-[13px] font-semibold opacity-75">Pick a mode and start a new game</span>
          </span>
          <span className="absolute -right-2 -top-4 font-piece text-[120px] leading-none opacity-25 transition group-hover:rotate-6">{'\u265A\uFE0E'}</span>
          <ChevronRight className="relative z-10 ml-auto" size={26} />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <Card key={t.label} onClick={() => go(t.to)} className="p-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft text-gold"><t.icon size={21} /></span>
              <span className="mt-3 block text-[15px] font-bold">{t.label}</span>
              <span className="block text-xs text-muted">{t.sub}</span>
            </Card>
          ))}
        </div>

        <Section title="Daily Challenge" action={<span className="flex items-center gap-1 text-xs font-bold text-gold"><Flame size={14} />12-day streak</span>}>
          <Card onClick={() => go('lesson', { id: 'daily' })} className="flex items-center gap-4 p-3">
            <div className="pointer-events-none w-28 shrink-0 overflow-hidden rounded-xl"><Board fen={daily.steps[0].fen} /></div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-gold-soft px-2 py-0.5 text-[11px] font-extrabold text-gold"><Puzzle size={12} />MATE IN 2</span>
              <p className="mt-2 text-[15px] font-bold leading-snug">Doubled rooks on the open file</p>
              <p className="mt-1 text-xs text-muted">White to move · 1,240 solvers today</p>
            </div>
            <ChevronRight className="text-muted" size={20} />
          </Card>
        </Section>

        <Section title="Your Stats">
          <Card className="flex items-center gap-4">
            <Ring value={(wins / total) * 100} size={72} />
            <div className="grid flex-1 grid-cols-3 text-center">
              {[['Games', total], ['Wins', wins], ['Streak', 3]].map(([k, v]) => (
                <div key={k}><p className="text-xl font-extrabold tnum">{v}</p><p className="text-[11px] font-semibold text-muted">{k}</p></div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="Recent Matches" action={<button onClick={() => go('stats')} className="text-xs font-bold text-gold">See all</button>}>
          <Card className="p-2">{matches.slice(0, 3).map((m) => <MatchRow key={m.id} m={m} />)}</Card>
        </Section>
      </div>
      <BottomNav active="home" />
    </div>
  )
}
