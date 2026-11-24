import { Bluetooth, ChevronRight, Cpu, Globe, GraduationCap, Puzzle, Users } from 'lucide-react'
import { useStore, type ScreenName } from '../app/store'
import { BottomNav, Card, OfflineBadge, cx } from '../components/ui'

const MODES: { title: string; desc: string; icon: typeof Cpu; to?: ScreenName; params?: any; offline: boolean; tag?: string }[] = [
  { title: 'Play vs Computer', desc: 'Six difficulty levels, hints and takebacks for practice.', icon: Cpu, to: 'ai-setup', offline: true },
  { title: 'Local Multiplayer', desc: 'Pass & Play with a friend on this device.', icon: Users, to: 'local-setup', offline: true, tag: 'Popular' },
  { title: 'Nearby Multiplayer', desc: 'Connect two phones over Bluetooth or Wi-Fi Direct.', icon: Bluetooth, to: 'nearby', offline: true, tag: 'New' },
  { title: 'Online Multiplayer', desc: 'Ranked matchmaking with players worldwide.', icon: Globe, offline: false, tag: 'Coming soon' },
  { title: 'Chess Puzzles', desc: 'Sharpen tactics with forks, pins and mates.', icon: Puzzle, to: 'lesson', params: { id: 'fork' }, offline: true },
  { title: 'Learn Chess', desc: 'Rules, piece moves, openings and patterns.', icon: GraduationCap, to: 'learn', offline: true },
]

export function PlayModes() {
  const { go, notify } = useStore()
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <header className="pb-2 pt-5">
          <h1 className="font-display text-[30px] font-bold">Choose a mode</h1>
          <p className="mt-1 text-sm text-muted">Everything marked offline works without a connection.</p>
        </header>
        <div className="mt-4 space-y-3">
          {MODES.map((m, i) => (
            <Card key={m.title} onClick={() => (m.to ? go(m.to, m.params) : notify('Online play is coming in a future update'))} className={cx('anim-fade flex items-center gap-4', !m.to && 'opacity-60')}>
              <span style={{ animationDelay: `${i * 40}ms` }} className={cx('grid h-14 w-14 shrink-0 place-items-center rounded-2xl', i < 3 ? 'gold-grad text-[#171A21]' : 'bg-surface2 text-gold')}><m.icon size={26} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[16px] font-bold">{m.title}</span>
                  {m.tag && <span className={cx('rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase', m.to ? 'bg-gold-soft text-gold' : 'bg-surface2 text-muted')}>{m.tag}</span>}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">{m.desc}</span>
                {m.offline && i > 0 && i < 3 && <OfflineBadge className="mt-2" />}
              </span>
              <ChevronRight size={20} className="text-muted" />
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="play" />
    </div>
  )
}
