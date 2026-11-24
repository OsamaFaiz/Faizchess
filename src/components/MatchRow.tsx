import { Bluetooth, Cpu, Users } from 'lucide-react'
import type { MatchRecord } from '../app/data'
import { useStore } from '../app/store'
import { cx } from './ui'

const ICON = { ai: Cpu, local: Users, nearby: Bluetooth, puzzle: Cpu }
export function MatchRow({ m }: { m: MatchRecord }) {
  const { go } = useStore()
  const I = ICON[m.mode]
  return (
    <button onClick={() => go('review', { match: m })} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-surface2/60 active:scale-[0.99]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface2 text-muted"><I size={19} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{m.opponent}</span>
        <span className="block truncate text-xs text-muted">{m.reason} · {m.moves} moves · {m.time} · {m.date}</span>
      </span>
      <span className="text-right">
        <span className={cx('block rounded-lg px-2 py-0.5 text-xs font-extrabold', m.result === 'win' ? 'bg-win/15 text-win' : m.result === 'loss' ? 'bg-loss/15 text-loss' : 'bg-surface2 text-muted')}>
          {m.result === 'win' ? 'WIN' : m.result === 'loss' ? 'LOSS' : 'DRAW'}
        </span>
        {m.delta != null && <span className={cx('mt-1 block text-xs font-bold', m.delta >= 0 ? 'text-win' : 'text-loss')}>{m.delta >= 0 ? '+' : ''}{m.delta}</span>}
      </span>
    </button>
  )
}
