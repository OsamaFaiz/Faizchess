import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from 'lucide-react'
import { lessonById } from '../app/lessons'
import { moveSound } from '../app/feedback'
import { useStore } from '../app/store'
import { Board } from '../components/Board'
import { Btn, IconBtn, TopBar, cx } from '../components/ui'

export function Lesson() {
  const { screen, back, settings } = useStore()
  const lesson = lessonById(screen.params?.id)
  const [si, setSi] = useState(0)
  const step = lesson.steps[si]
  const chess = useRef(new Chess(step.fen))
  const [fen, setFen] = useState(step.fen)
  const [ply, setPly] = useState(0)
  const [last, setLast] = useState<{ from: string; to: string } | null>(null)
  const [state, setState] = useState<'play' | 'wrong' | 'done'>('play')
  const [showHint, setShowHint] = useState(false)
  const sol = step.solution ?? []
  const player = new Chess(step.fen).turn()

  const load = (i: number) => {
    const s = lesson.steps[i]
    chess.current = new Chess(s.fen)
    setSi(i); setFen(s.fen); setPly(0); setLast(null); setShowHint(false)
    setState(s.solution ? 'play' : 'done')
  }
  useEffect(() => load(0), [lesson.id])

  const onMove = (from: string, to: string, promotion?: string) => {
    const c = chess.current
    let mv
    try { mv = c.move({ from, to, promotion }) } catch { return false }
    if (mv.san !== sol[ply]) {
      c.undo()
      setState('wrong'); settings.sound && moveSound('capture')
      setTimeout(() => setState('play'), 900)
      return false
    }
    settings.sound && moveSound('move')
    setFen(c.fen()); setLast({ from: mv.from, to: mv.to }); setShowHint(false)
    const p = ply + 1
    const finish = () => {
      setState('done')
      if (si === lesson.steps.length - 1) {
        const done = new Set(JSON.parse(localStorage.getItem('cm:lessons') || '[]'))
        done.add(lesson.id)
        localStorage.setItem('cm:lessons', JSON.stringify([...done]))
      }
    }
    setPly(p)
    if (p < sol.length) {
      setTimeout(() => {
        const r = c.move(sol[p])
        setFen(c.fen()); setLast({ from: r.from, to: r.to }); setPly(p + 1)
        settings.sound && moveSound('move')
        if (p + 1 >= sol.length) finish()
      }, 550)
    } else finish()
    return true
  }

  const hintMove = (() => {
    if (!showHint || ply >= sol.length) return null
    try { const m = new Chess(fen).move(sol[ply]); return { from: m.from, to: m.to } } catch { return null }
  })()
  const isLast = si === lesson.steps.length - 1

  return (
    <div className="flex h-full flex-col">
      <TopBar title={lesson.title} subtitle={`${lesson.category} · Step ${si + 1} of ${lesson.steps.length}`} right={<IconBtn label="Restart step" onClick={() => load(si)}><RotateCcw size={19} /></IconBtn>} />
      <div className="mx-5 mb-3 flex gap-1.5">{lesson.steps.map((_, i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full', i <= si ? 'bg-gold' : 'bg-surface2')} />)}</div>
      <div className={cx('px-2', state === 'wrong' && 'anim-shake')}>
        <Board fen={fen} orientation={player} movable={state === 'play' && ply % 2 === 0 ? [player] : []} onMove={onMove} lastMove={last} hint={hintMove} highlight={ply === 0 && state !== 'done' ? step.highlight : []} />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className={cx('rounded-3xl p-4 transition-colors', state === 'done' && sol.length ? 'bg-win/12 ring-1 ring-win/30' : state === 'wrong' ? 'bg-loss/12 ring-1 ring-loss/30' : 'bg-surface')}>
          {state === 'done' && sol.length > 0 && <p className="mb-1 flex items-center gap-1.5 font-extrabold text-win"><CheckCircle2 size={18} />Excellent!</p>}
          {state === 'wrong' && <p className="mb-1 flex items-center gap-1.5 font-extrabold text-loss"><XCircle size={18} />Not quite — try again</p>}
          <p className="text-[15px] leading-relaxed">{step.text}</p>
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          {state !== 'done' && <Btn variant="surface" icon={<Lightbulb size={18} />} onClick={() => setShowHint(true)}>Hint</Btn>}
          <Btn className="flex-1" disabled={state !== 'done'} onClick={() => (isLast ? back() : load(si + 1))}>{isLast ? 'Finish lesson' : 'Next step'}</Btn>
        </div>
      </div>
    </div>
  )
}
