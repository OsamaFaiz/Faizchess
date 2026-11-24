import { useState } from 'react'
import { Bluetooth, Brain, Crown, WifiOff } from 'lucide-react'
import { useStore } from '../app/store'
import { Btn, cx } from '../components/ui'
import { Piece } from '../components/Piece'

const SLIDES = [
  { title: 'Master the Game', body: 'Play, review and improve with guided lessons, puzzles and in-depth game analysis.', art: 'master' },
  { title: 'Play Anywhere', body: 'Pass & Play on one phone, or connect nearby over Bluetooth and Wi-Fi Direct — fully offline.', art: 'anywhere' },
  { title: 'Challenge Yourself', body: 'Six AI levels from Beginner to Master. Climb at your own pace and watch your rating grow.', art: 'ai' },
]

function Art({ kind }: { kind: string }) {
  if (kind === 'master')
    return (
      <div className="relative grid h-64 w-64 place-items-center">
        <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
        <div className="grid grid-cols-4 overflow-hidden rounded-3xl shadow-card ring-1 ring-line">
          {Array.from({ length: 16 }, (_, i) => <div key={i} className="h-14 w-14" style={{ background: (i + Math.floor(i / 4)) % 2 ? '#a9784f' : '#ecd7b4' }} />)}
        </div>
        <div className="absolute text-[110px] drop-shadow-2xl"><Piece type="k" color="w" style="gilded" /></div>
        <Crown className="absolute -top-2 text-gold" size={34} />
      </div>
    )
  if (kind === 'anywhere')
    return (
      <div className="relative flex h-64 w-72 items-center justify-between">
        {[0, 1].map((i) => (
          <div key={i} className={cx('relative h-48 w-24 rounded-[22px] bg-surface p-2 shadow-card ring-1 ring-line', i ? 'rotate-6' : '-rotate-6')}>
            <div className="grid h-full grid-cols-4 grid-rows-8 overflow-hidden rounded-2xl">
              {Array.from({ length: 32 }, (_, k) => <div key={k} style={{ background: (k + Math.floor(k / 4)) % 2 ? '#3b404c' : '#d9c08f' }} />)}
            </div>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <div className="pulse-ring grid h-14 w-14 place-items-center rounded-full bg-gold text-[#171A21]"><Bluetooth size={26} /></div>
          <span className="flex items-center gap-1 rounded-full bg-panel px-2.5 py-1 text-[10px] font-bold text-win ring-1 ring-line"><WifiOff size={11} />Offline</span>
        </div>
      </div>
    )
  return (
    <div className="relative grid h-64 w-64 place-items-center">
      <div className="absolute inset-4 rounded-full border border-dashed border-gold/40" style={{ animation: 'spin-slow 24s linear infinite' }} />
      <div className="grid h-28 w-28 place-items-center rounded-[32px] bg-surface shadow-card ring-1 ring-line"><Brain size={56} className="text-gold" /></div>
      {['Beginner', 'Medium', 'Expert', 'Master'].map((l, i) => (
        <span key={l} className="absolute rounded-full bg-panel px-3 py-1 text-[11px] font-bold ring-1 ring-line" style={{ transform: `rotate(${i * 90 - 45}deg) translateY(-118px) rotate(${-(i * 90 - 45)}deg)` }}>{l}</span>
      ))}
    </div>
  )
}

export function Onboarding() {
  const { reset } = useStore()
  const [i, setI] = useState(0)
  const done = () => { localStorage.setItem('cm:onboarded', '1'); reset('home') }
  const s = SLIDES[i]
  return (
    <div className="flex h-full flex-col bg-bg px-6 pb-8 pt-4">
      <div className="flex h-12 items-center justify-between">
        <span className="text-xs font-bold text-muted">{i + 1} / 3</span>
        {i < 2 && <button onClick={done} className="h-10 px-2 text-sm font-bold text-muted hover:text-ink">Skip</button>}
      </div>
      <div key={i} className="anim-fade flex flex-1 flex-col items-center justify-center text-center">
        <Art kind={s.art} />
        <h2 className="mt-10 font-display text-[32px] font-bold leading-tight">{s.title}</h2>
        <p className="mt-3 max-w-[300px] text-[15px] leading-relaxed text-muted">{s.body}</p>
      </div>
      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, k) => <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={cx('h-2 rounded-full transition-all', k === i ? 'w-7 bg-gold' : 'w-2 bg-muted/40')} />)}
      </div>
      {i < 2 ? <Btn size="lg" onClick={() => setI(i + 1)}>Next</Btn> : <Btn size="lg" onClick={done}>Get Started</Btn>}
    </div>
  )
}
