import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { RATING_HISTORY } from '../app/data'
import { useStore } from '../app/store'
import { LineChart } from '../components/Chart'
import { MatchRow } from '../components/MatchRow'
import { BottomNav, Card, Chip, Section } from '../components/ui'
import { useTotals } from './Profile'

export function Stats() {
  const { rating, best, matches } = useStore()
  const t = useTotals()
  const [range, setRange] = useState('3M')
  const data = range === '1M' ? RATING_HISTORY.slice(-8) : range === '3M' ? RATING_HISTORY.slice(-16) : RATING_HISTORY
  const seg = [[t.wins, '#5CC48A', 'Wins'], [t.draws, 'var(--muted)', 'Draws'], [t.losses, '#E46B6B', 'Losses']] as const
  const modes = [['vs Computer', 112, 61], ['Pass & Play', 74, 52], ['Nearby', 49, 63], ['Puzzles', 13, 85]] as const
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <header className="pb-1 pt-5"><h1 className="font-display text-[30px] font-bold">Statistics</h1><p className="text-sm text-muted">Your progress across every mode</p></header>
        <Card className="mt-4">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-muted">Current rating</p><p className="font-display text-[40px] font-bold leading-tight tnum">{rating}</p></div>
            <div className="text-right"><p className="flex items-center justify-end gap-1 text-xs font-bold text-gold"><Trophy size={13} />Peak</p><p className="text-lg font-extrabold tnum">{best}</p></div>
          </div>
          <div className="mt-2"><LineChart data={[...data, rating]} height={130} showAxis /></div>
          <div className="mt-3 flex gap-2">{['1M', '3M', '6M'].map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)} className="h-8 flex-1 text-xs">{r}</Chip>)}</div>
        </Card>

        <Section title="Results">
          <Card>
            <div className="flex h-3 overflow-hidden rounded-full">{seg.map(([v, c]) => <span key={c} style={{ width: `${(v / t.total) * 100}%`, background: c }} />)}</div>
            <div className="mt-4 grid grid-cols-3">
              {seg.map(([v, c, k]) => (
                <div key={k}><p className="flex items-center gap-1.5 text-xs text-muted"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{k}</p><p className="text-lg font-extrabold tnum">{v} <span className="text-xs font-semibold text-muted">{Math.round((v / t.total) * 100)}%</span></p></div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="Win rate by mode">
          <Card className="space-y-4">
            {modes.map(([k, n, p]) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{k}</span><span className="text-muted"><b className="text-ink">{p}%</b> · {n} games</span></div>
                <div className="mt-1.5 h-2 rounded-full bg-surface2"><div className="gold-grad h-full rounded-full" style={{ width: `${p}%` }} /></div>
              </div>
            ))}
          </Card>
        </Section>

        <Section title="As White vs Black">
          <div className="grid grid-cols-2 gap-3">
            {[['White', 61, '#f3efe6'], ['Black', 53, '#22252c']].map(([k, v, c]) => (
              <Card key={k as string} className="p-4"><span className="block h-6 w-6 rounded-md ring-1 ring-line" style={{ background: c as string }} /><p className="mt-3 text-2xl font-extrabold">{v}%</p><p className="text-xs text-muted">Win rate as {k}</p></Card>
            ))}
          </div>
        </Section>

        <Section title="All matches"><Card className="p-2">{matches.map((m) => <MatchRow key={m.id} m={m} />)}</Card></Section>
      </div>
      <BottomNav active="stats" />
    </div>
  )
}
