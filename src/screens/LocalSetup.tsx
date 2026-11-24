import { useState } from 'react'
import { ArrowUpDown, Eye, RotateCcw, Smartphone } from 'lucide-react'
import { ME } from '../app/data'
import { useStore } from '../app/store'
import { Piece } from '../components/Piece'
import { TimePicker } from '../components/TimePicker'
import { Btn, Card, IconBtn, OfflineBadge, Section, Toggle, TopBar } from '../components/ui'

export function LocalSetup() {
  const { settings, set, startGame } = useStore()
  const [p1, setP1] = useState(ME.name)
  const [p2, setP2] = useState('Dev Mehta')
  const [time, setTime] = useState(settings.defaultTime)
  const [flip, setFlip] = useState(true)
  const mk = (name: string, hue: number) => ({ name: name.trim() || 'Player', rating: null, hue, initials: (name.trim() || 'P').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() })
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Pass & Play" subtitle="Two players · one device" right={<OfflineBadge className="mr-3" />} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <Card className="relative mt-2 space-y-3">
          {[[p1, setP1, 'w', 'Player 1 · White'], [p2, setP2, 'b', 'Player 2 · Black']].map(([v, setV, c, label]: any) => (
            <label key={c} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-panel text-[36px]"><Piece type="k" color={c} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{label}</span>
                <input value={v} onChange={(e) => setV(e.target.value)} maxLength={20} className="w-full bg-transparent text-[16px] font-bold outline-none placeholder:text-muted" placeholder="Enter name" />
              </span>
            </label>
          ))}
          <IconBtn label="Swap colours" onClick={() => { setP1(p2); setP2(p1) }} className="absolute right-7 top-1/2 -translate-y-1/2 bg-gold text-[#171A21] hover:bg-gold"><ArrowUpDown size={18} /></IconBtn>
        </Card>

        <Section title="Time Control"><Card><TimePicker value={time} onChange={setTime} /></Card></Section>

        <Section title="Table options">
          <Card className="space-y-4">
            <label className="flex items-center gap-3"><RotateCcw size={20} className="text-gold" /><span className="flex-1"><span className="block text-sm font-semibold">Auto-flip board</span><span className="block text-xs text-muted">Rotate to face the player whose turn it is</span></span><Toggle label="Auto-flip" on={flip} onChange={setFlip} /></label>
            <label className="flex items-center gap-3"><Eye size={20} className="text-gold" /><span className="flex-1 text-sm font-semibold">Show legal moves</span><Toggle label="Show legal moves" on={settings.showLegal} onChange={(v) => set('showLegal', v)} /></label>
          </Card>
        </Section>
        <p className="mt-5 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted"><Smartphone size={16} className="shrink-0" />Place the phone between you. After each move, a turn banner tells you who plays next.</p>
      </div>
      <div className="border-t border-line bg-panel/80 px-5 py-4 backdrop-blur">
        <Btn size="lg" className="w-full" onClick={() => startGame({ mode: 'local', white: mk(p1, 38), black: mk(p2, 200), time, myColor: 'w', autoFlip: flip, allowUndo: true })}>Start Game</Btn>
      </div>
    </div>
  )
}
