import { useState } from 'react'
import { Check, Lightbulb, Shuffle, Undo2 } from 'lucide-react'
import { LEVELS, ME, type Color, type LevelId } from '../app/data'
import { useStore } from '../app/store'
import { Piece } from '../components/Piece'
import { TimePicker } from '../components/TimePicker'
import { Btn, Card, Section, Toggle, TopBar, cx } from '../components/ui'

const ICONS = ['p', 'n', 'b', 'r', 'q', 'k']

export function AISetup() {
  const { settings, startGame, rating } = useStore()
  const [level, setLevel] = useState<LevelId>('medium')
  const [time, setTime] = useState(settings.defaultTime)
  const [side, setSide] = useState<Color | 'r'>('w')
  const [hints, setHints] = useState(true)
  const [undo, setUndo] = useState(true)
  const L = LEVELS.find((l) => l.id === level)!

  const start = () => {
    const my: Color = side === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : side
    const me = { name: ME.name, rating, hue: ME.hue, initials: ME.initials }
    const bot = { name: `${L.bot} · ${L.name}`, rating: L.rating, hue: 220, initials: L.bot.slice(0, 2).toUpperCase() }
    startGame({ mode: 'ai', white: my === 'w' ? me : bot, black: my === 'b' ? me : bot, time, level, myColor: my, allowHints: hints, allowUndo: undo })
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Play vs Computer" subtitle="Runs fully on-device" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <Section title="Difficulty" className="mt-2">
          <div className="space-y-2">
            {LEVELS.map((l, i) => {
              const on = l.id === level
              return (
                <button key={l.id} onClick={() => setLevel(l.id)} className={cx('flex w-full items-center gap-3 rounded-2xl p-3 text-left transition active:scale-[0.99]', on ? 'bg-gold-soft ring-2 ring-gold' : 'bg-surface ring-1 ring-line')}>
                  <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[34px]', on ? 'bg-gold/20' : 'bg-surface2')}><Piece type={ICONS[i]} color={on ? 'w' : 'b'} style="gilded" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="font-bold">{l.name}</span><span className="text-xs font-bold text-muted tnum">≈ {l.rating}</span></span>
                    <span className="block text-[13px] leading-snug text-muted">{l.desc}</span>
                  </span>
                  <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', on ? 'bg-gold text-[#171A21]' : 'ring-2 ring-line')}>{on && <Check size={15} strokeWidth={3} />}</span>
                </button>
              )
            })}
          </div>
        </Section>

        <Section title="Time Control"><Card><TimePicker value={time} onChange={setTime} /></Card></Section>

        <Section title="Play as">
          <div className="grid grid-cols-3 gap-2">
            {([['w', 'White'], ['r', 'Random'], ['b', 'Black']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setSide(v)} className={cx('flex flex-col items-center gap-1 rounded-2xl py-3 transition', side === v ? 'bg-gold-soft ring-2 ring-gold' : 'bg-surface ring-1 ring-line')}>
                <span className="grid h-10 place-items-center text-[36px]">{v === 'r' ? <Shuffle size={26} className="text-gold" /> : <Piece type="k" color={v} />}</span>
                <span className="text-[13px] font-bold">{label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Practice aids">
          <Card className="space-y-4">
            <label className="flex items-center gap-3"><Lightbulb size={20} className="text-gold" /><span className="flex-1 text-sm font-semibold">Allow hints</span><Toggle label="Allow hints" on={hints} onChange={setHints} /></label>
            <label className="flex items-center gap-3"><Undo2 size={20} className="text-gold" /><span className="flex-1 text-sm font-semibold">Allow takebacks</span><Toggle label="Allow takebacks" on={undo} onChange={setUndo} /></label>
          </Card>
        </Section>
      </div>
      <div className="border-t border-line bg-panel/80 px-5 py-4 backdrop-blur">
        <Btn size="lg" className="w-full" onClick={start}>Start vs {L.bot} · {time === '∞' ? 'No clock' : time}</Btn>
      </div>
    </div>
  )
}
