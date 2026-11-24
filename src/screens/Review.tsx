import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MatchRecord } from '../app/data'
import { useStore } from '../app/store'
import { Board } from '../components/Board'
import { IconBtn, TopBar, cx } from '../components/ui'

export function Review() {
  const { screen } = useStore()
  const m = screen.params?.match as MatchRecord
  const frames = useMemo(() => {
    const c = new Chess()
    const out = [{ fen: c.fen(), last: null as null | { from: string; to: string }, san: '' }]
    for (const s of m.sans) {
      try { const mv = c.move(s); out.push({ fen: c.fen(), last: { from: mv.from, to: mv.to }, san: mv.san }) } catch { break }
    }
    return out
  }, [m])
  const [i, setI] = useState(frames.length - 1)
  const f = frames[i]
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Game Review" subtitle={`vs ${m.opponent} · ${m.result.toUpperCase()} · ${m.reason}`} />
      <div className="px-2"><Board fen={f.fen} orientation={m.myColor} lastMove={f.last} /></div>
      <div className="flex items-center justify-center gap-2 py-3">
        <IconBtn label="First move" onClick={() => setI(0)} className="bg-surface"><ChevronFirst /></IconBtn>
        <IconBtn label="Previous move" onClick={() => setI(Math.max(0, i - 1))} className="bg-surface"><ChevronLeft /></IconBtn>
        <span className="w-24 text-center font-mono text-sm font-bold">{i === 0 ? 'Start' : `${Math.ceil(i / 2)}${i % 2 ? '.' : '…'} ${f.san}`}</span>
        <IconBtn label="Next move" onClick={() => setI(Math.min(frames.length - 1, i + 1))} className="bg-surface"><ChevronRight /></IconBtn>
        <IconBtn label="Last move" onClick={() => setI(frames.length - 1)} className="bg-surface"><ChevronLast /></IconBtn>
      </div>
      <div className="no-scrollbar mx-3 mb-4 flex-1 overflow-y-auto rounded-2xl bg-surface p-3">
        <div className="grid grid-cols-[36px_1fr_1fr] gap-y-0.5 font-mono text-sm">
          {Array.from({ length: Math.ceil((frames.length - 1) / 2) }, (_, k) => (
            <div key={k} className="contents">
              <span className="py-1.5 text-muted">{k + 1}.</span>
              {[1, 2].map((d) => {
                const idx = k * 2 + d
                const fr = frames[idx]
                return fr ? <button key={d} onClick={() => setI(idx)} className={cx('rounded-lg px-2 py-1.5 text-left font-bold', idx === i ? 'bg-gold text-[#171A21]' : 'hover:bg-surface2')}>{fr.san}{fr.san.includes('x') && <span className="ml-1 text-[10px] opacity-60">capture</span>}</button> : <span key={d} />
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
