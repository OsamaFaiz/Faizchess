import { BookOpen, Bluetooth, Crown, Flame, Pencil, Settings, Shield, Swords, Target, Zap } from 'lucide-react'
import { ACHIEVEMENTS, BASE_STATS, ME, RATING_HISTORY } from '../app/data'
import { useStore } from '../app/store'
import { LineChart } from '../components/Chart'
import { MatchRow } from '../components/MatchRow'
import { Avatar, BottomNav, Card, IconBtn, Section, cx } from '../components/ui'

const ICONS: Record<string, typeof Crown> = { swords: Swords, flame: Flame, target: Target, bluetooth: Bluetooth, zap: Zap, crown: Crown, shield: Shield, book: BookOpen }

export function useTotals() {
  const { matches } = useStore()
  const extra = matches.filter((m) => !m.id.startsWith('s'))
  const wins = BASE_STATS.wins + extra.filter((m) => m.result === 'win').length
  const losses = BASE_STATS.losses + extra.filter((m) => m.result === 'loss').length
  const draws = BASE_STATS.draws + extra.filter((m) => m.result === 'draw').length
  const total = wins + losses + draws
  return { wins, losses, draws, total, pct: Math.round((wins / total) * 100) }
}

export function Profile() {
  const { go, rating, best, matches } = useStore()
  const t = useTotals()
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <div className="relative bg-gradient-to-b from-gold/20 to-transparent px-5 pb-2 pt-3">
          <div className="flex justify-end gap-1">
            <IconBtn label="Edit profile"><Pencil size={19} /></IconBtn>
            <IconBtn label="Settings" onClick={() => go('settings')}><Settings size={20} /></IconBtn>
          </div>
          <div className="flex flex-col items-center text-center">
            <Avatar initials={ME.initials} hue={ME.hue} size={96} ring />
            <h1 className="mt-4 text-[24px] font-extrabold">{ME.name}</h1>
            <p className="text-sm text-muted">{ME.handle} · Member since {ME.since}</p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-[#171A21]">Rating {rating}</span>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold ring-1 ring-line">Best {best}</span>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold ring-1 ring-line">Club Player</span>
            </div>
          </div>
        </div>
        <div className="px-5">
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[['Matches', t.total, ''], ['Wins', t.wins, 'text-win'], ['Losses', t.losses, 'text-loss'], ['Draws', t.draws, '']].map(([k, v, c]) => (
              <Card key={k as string} className="p-3 text-center"><p className={cx('text-lg font-extrabold tnum', c as string)}>{v}</p><p className="text-[11px] text-muted">{k}</p></Card>
            ))}
          </div>
          <Card className="mt-3">
            <div className="flex items-end justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-muted">Performance · 6 months</p><p className="mt-1 text-2xl font-extrabold tnum">{t.pct}% <span className="text-sm font-semibold text-muted">win rate</span></p></div>
              <button onClick={() => go('stats')} className="text-xs font-bold text-gold">Details</button>
            </div>
            <div className="mt-3"><LineChart data={[...RATING_HISTORY, rating]} height={100} showAxis /></div>
          </Card>

          <Section title="Achievements" action={<span className="text-xs font-bold text-muted">{ACHIEVEMENTS.filter((a) => a.got).length}/{ACHIEVEMENTS.length}</span>}>
            <div className="grid grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const I = ICONS[a.icon]
                return (
                  <div key={a.id} className={cx('flex flex-col items-center text-center', !a.got && 'opacity-40')} title={a.desc}>
                    <span className={cx('grid h-14 w-14 place-items-center rounded-2xl', a.got ? 'gold-grad text-[#171A21] shadow-card' : 'bg-surface text-muted ring-1 ring-line')}><I size={24} /></span>
                    <span className="mt-1.5 text-[11px] font-bold leading-tight">{a.name}</span>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Match History"><Card className="p-2">{matches.slice(0, 5).map((m) => <MatchRow key={m.id} m={m} />)}</Card></Section>
        </div>
      </div>
      <BottomNav active="profile" />
    </div>
  )
}
