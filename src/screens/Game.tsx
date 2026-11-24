import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Move } from 'chess.js'
import { Bluetooth, Flag, Handshake, History, Lightbulb, Loader2, LogOut, Pause, Play, RefreshCw, RotateCcw, Settings2, Undo2, Unplug, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { BOARD_THEMES, PIECE_STYLES, tc, type Color, type Player } from '../app/data'
import { evaluate, pickMove } from '../app/ai'
import { buzz, moveSound } from '../app/feedback'
import { useStore, type GameConfig, type GameResult } from '../app/store'
import { Board } from '../components/Board'
import { Piece } from '../components/Piece'
import { Avatar, Btn, Dialog, IconBtn, Sheet, cx, fmtClock } from '../components/ui'

const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
type Over = { winner: Color | 'draw'; reason: string }

function PlayerBar({ p, color, clock, active, captured, diff, running, status, flipped }: { p: Player; color: Color; clock: number | null; active: boolean; captured: string[]; diff: number; running: boolean; status?: string; flipped?: boolean }) {
  const low = clock !== null && clock < 20000
  return (
    <div className={cx('flex items-center gap-3 px-3 py-2', flipped && 'rotate-180')}>
      <div className="relative">
        <Avatar initials={p.initials} hue={p.hue} size={42} className={cx(active && 'ring-2 ring-gold ring-offset-2 ring-offset-bg')} />
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-panel text-[15px] ring-1 ring-line"><Piece type="k" color={color} /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-bold">{p.name}{p.rating && <span className="text-xs font-semibold text-muted">({p.rating})</span>}</p>
        <div className="flex h-5 items-center">
          {status ? <span className="flex items-center gap-1 text-xs font-semibold text-gold"><Loader2 size={12} className="animate-spin" />{status}</span> : (
            <>
              <span className="flex -space-x-1 text-[17px]">{captured.map((t, i) => <Piece key={i} type={t} color={color === 'w' ? 'b' : 'w'} />)}</span>
              {diff > 0 && <span className="ml-1.5 text-xs font-bold text-muted">+{diff}</span>}
            </>
          )}
        </div>
      </div>
      {clock !== null && (
        <div className={cx('min-w-[88px] rounded-xl px-3 py-2 text-right font-mono text-[22px] font-bold tnum transition-colors', active ? (low ? 'bg-loss text-white' : 'bg-ink text-bg') : 'bg-surface text-muted', active && running && 'pulse-ring')}>
          {fmtClock(clock)}
        </div>
      )}
    </div>
  )
}

export function Game() {
  const { game, reset } = useStore()
  useEffect(() => { if (!game) reset('home') }, [game, reset])
  return game ? <GameView cfg={game} /> : null
}

function GameView({ cfg }: { cfg: GameConfig }) {
  const { settings, set, finishGame, reset, notify } = useStore()
  const chess = useRef(new Chess())
  const [fen, setFen] = useState(chess.current.fen())
  const [hist, setHist] = useState<Move[]>([])
  const t = tc(cfg.time)
  const [clocks, setClocks] = useState({ w: (t.base ?? 0) * 60000, b: (t.base ?? 0) * 60000 })
  const [over, setOver] = useState<Over | null>(null)
  const [thinking, setThinking] = useState(false)
  const [hint, setHint] = useState<{ from: string; to: string } | null>(null)
  const [hints, setHints] = useState(3)
  const [flip, setFlip] = useState(false)
  const [paused, setPaused] = useState(false)
  const [sheet, setSheet] = useState<'pause' | 'history' | null>(null)
  const [dialog, setDialog] = useState<'resign' | 'draw' | 'exit' | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [lost, setLost] = useState<'lost' | 'trying' | null>(null)
  const started = useRef(Date.now())
  const stripRef = useRef<HTMLDivElement>(null)

  const mode = cfg.mode
  const turn = chess.current.turn()
  const inCheck = chess.current.inCheck()
  const player = (c: Color) => (c === 'w' ? cfg.white : cfg.black)
  const timed = t.base !== null
  const halted = !!over || paused || !!sheet || !!lost || !!dialog
  const orientation: Color = mode === 'local' ? (cfg.autoFlip ? turn : flip ? 'b' : 'w') : flip ? (cfg.myColor === 'w' ? 'b' : 'w') : cfg.myColor
  const movable: Color[] = over || paused || lost ? [] : mode === 'local' ? [turn] : turn === cfg.myColor && !thinking ? [cfg.myColor] : []
  const last = hist[hist.length - 1]

  const captured = useMemo(() => {
    const c: Record<Color, string[]> = { w: [], b: [] }
    hist.forEach((m) => m.captured && c[m.color].push(m.captured))
    ;(['w', 'b'] as const).forEach((k) => c[k].sort((a, b) => VAL[a] - VAL[b]))
    return c
  }, [hist])
  const mat = (c: Color) => captured[c].reduce((s, x) => s + VAL[x], 0)

  const sync = () => { setFen(chess.current.fen()); setHist(chess.current.history({ verbose: true })) }

  const checkEnd = (mover: Color) => {
    const c = chess.current
    let o: Over | null = null
    if (c.isCheckmate()) o = { winner: mover, reason: 'Checkmate' }
    else if (c.isStalemate()) o = { winner: 'draw', reason: 'Stalemate' }
    else if (c.isInsufficientMaterial()) o = { winner: 'draw', reason: 'Insufficient material' }
    else if (c.isThreefoldRepetition()) o = { winner: 'draw', reason: 'Threefold repetition' }
    else if (c.isDraw()) o = { winner: 'draw', reason: '50-move rule' }
    if (o) { setOver(o); settings.sound && moveSound('end'); buzz(60) }
    return o
  }

  const apply = (from: string, to: string, promotion?: string) => {
    try {
      const m = chess.current.move({ from, to, promotion })
      if (settings.sound) moveSound(m.san.includes('+') ? 'check' : m.captured ? 'capture' : 'move')
      if (settings.vibration) buzz(m.captured ? 25 : 12)
      if (timed && t.inc) setClocks((cl) => ({ ...cl, [m.color]: cl[m.color] + t.inc * 1000 }))
      setHint(null)
      sync()
      const ended = checkEnd(m.color)
      if (!ended && mode === 'local') {
        const nx = player(m.color === 'w' ? 'b' : 'w')
        setBanner(`${nx.name.split(' ')[0]}’s turn · ${m.color === 'w' ? 'Black' : 'White'}`)
      }
      return true
    } catch { return false }
  }

  // Opponent (AI or simulated nearby player)
  useEffect(() => {
    if (mode === 'local' || over || paused || lost || turn === cfg.myColor) return
    setThinking(true)
    const delay = mode === 'ai' ? 450 + Math.random() * 500 : 1100 + Math.random() * 1600
    const id = setTimeout(() => {
      const m = pickMove(chess.current.fen(), mode === 'ai' ? cfg.level : 'medium')
      setThinking(false)
      if (m) apply(m.from, m.to, m.promotion)
    }, delay)
    return () => { clearTimeout(id); setThinking(false) }
  }, [fen, over, paused, lost])

  // Clock
  useEffect(() => {
    if (!timed || halted || hist.length === 0) return
    let prev = performance.now()
    const id = setInterval(() => {
      const now = performance.now(), d = now - prev
      prev = now
      setClocks((cl) => {
        const v = cl[turn] - d
        if (v <= 0 && !over) setTimeout(() => { setOver({ winner: turn === 'w' ? 'b' : 'w', reason: 'Time out' }); settings.sound && moveSound('end') })
        return { ...cl, [turn]: Math.max(0, v) }
      })
    }, 100)
    return () => clearInterval(id)
  }, [timed, halted, turn, hist.length])

  useEffect(() => { if (!banner) return; const id = setTimeout(() => setBanner(null), 1300); return () => clearTimeout(id) }, [banner])
  useEffect(() => { stripRef.current?.scrollTo({ left: 99999, behavior: 'smooth' }) }, [hist.length])
  useEffect(() => {
    if (lost !== 'trying') return
    const id = setTimeout(() => { setLost(null); notify(`Reconnected to ${player(cfg.myColor === 'w' ? 'b' : 'w').name}`) }, 2200)
    return () => clearTimeout(id)
  }, [lost])

  const undo = () => {
    if (mode === 'nearby') return notify('Takebacks are disabled in nearby matches')
    if (!hist.length || over) return
    chess.current.undo()
    if (mode === 'ai' && chess.current.turn() !== cfg.myColor && chess.current.history().length) chess.current.undo()
    setHint(null); sync()
  }
  const askHint = () => {
    if (!hints) return notify('No hints left this game')
    const m = pickMove(chess.current.fen(), 'hard')
    if (m) { setHint({ from: m.from, to: m.to }); setHints(hints - 1) }
  }
  const offerDraw = () => {
    if (mode === 'local') return setDialog('draw')
    const opp = player(cfg.myColor === 'w' ? 'b' : 'w').name.split(' ')[0]
    if (mode === 'ai') {
      const e = Math.abs(evaluate(chess.current))
      if (hist.length >= 20 && e < 150) setOver({ winner: 'draw', reason: 'Agreement' })
      else notify(`${opp} declined the draw offer`)
      return
    }
    notify(`Draw offer sent to ${opp}…`)
    setTimeout(() => notify(`${opp} declined — play on!`), 1800)
  }
  const resign = () => {
    const loser = mode === 'local' ? turn : cfg.myColor
    setDialog(null)
    setOver({ winner: loser === 'w' ? 'b' : 'w', reason: 'Resignation' })
  }

  const toResult = () => {
    if (!over) return
    const my = cfg.myColor
    const oppC: Color = my === 'w' ? 'b' : 'w'
    const opp = player(oppC)
    const res = over.winner === 'draw' ? 'draw' : over.winner === my ? 'win' : 'loss'
    let delta: number | null = null
    if (mode !== 'local' && opp.rating && player(my).rating) {
      const E = 1 / (1 + 10 ** ((opp.rating - player(my).rating!) / 400))
      delta = Math.round(20 * ((res === 'win' ? 1 : res === 'draw' ? 0.5 : 0) - E))
    }
    const r: GameResult = {
      id: 'g' + Date.now(), mode, opponent: opp.name, oppRating: opp.rating, myColor: my, result: res, reason: over.reason,
      moves: Math.ceil(hist.length / 2), duration: Math.round((Date.now() - started.current) / 1000), delta, date: 'Today', time: cfg.time,
      sans: hist.map((m) => m.san), config: cfg, winner: over.winner, captures: { w: captured.w.length, b: captured.b.length }, checks: hist.filter((m) => m.san.includes('+')).length,
    }
    finishGame(r)
  }

  const top: Color = orientation === 'w' ? 'b' : 'w'
  const bottom: Color = orientation
  const faceToFace = mode === 'local' && !cfg.autoFlip
  const LinkI = cfg.link === 'wifi' ? Wifi : Bluetooth
  const pairs: [number, Move, Move | undefined][] = []
  for (let i = 0; i < hist.length; i += 2) pairs.push([i / 2 + 1, hist[i], hist[i + 1]])

  const actions = [
    { label: 'Undo', icon: Undo2, on: undo, show: mode === 'local' || (mode === 'ai' && cfg.allowUndo), disabled: !hist.length },
    { label: `Hint${mode === 'ai' ? ` (${hints})` : ''}`, icon: Lightbulb, on: askHint, show: mode === 'ai' && cfg.allowHints, disabled: !movable.length },
    { label: 'Flip', icon: RotateCcw, on: () => setFlip(!flip), show: !(mode === 'local' && cfg.autoFlip) },
    { label: 'Draw', icon: Handshake, on: offerDraw, show: true, disabled: !!over },
    { label: 'Resign', icon: Flag, on: () => setDialog('resign'), show: true, disabled: !!over },
  ].filter((a) => a.show)

  return (
    <div className="relative flex h-full flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center px-2">
        <IconBtn label="Pause" onClick={() => { setPaused(true); setSheet('pause') }}><Pause size={20} /></IconBtn>
        <div className="flex flex-1 flex-col items-center">
          <span className={cx('flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-extrabold transition-colors', inCheck && !over ? 'bg-loss text-white' : 'bg-surface')}>
            <span className={cx('h-2.5 w-2.5 rounded-full ring-1 ring-black/30', turn === 'w' ? 'bg-white' : 'bg-[#1b1d22] ring-white/40')} />
            {over ? over.reason : inCheck ? `Check! ${turn === 'w' ? 'White' : 'Black'} to move` : `${turn === 'w' ? 'White' : 'Black'} to move`}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            {mode === 'nearby' ? <><LinkI size={11} className="text-win" />{cfg.link === 'wifi' ? 'Wi-Fi Direct' : 'Bluetooth'} · offline</> : mode === 'ai' ? 'vs Computer · on-device' : 'Pass & Play'} · {cfg.time === '∞' ? 'No clock' : cfg.time}
          </span>
        </div>
        <IconBtn label="Move list" onClick={() => setSheet('history')}><History size={20} /></IconBtn>
      </header>

      <div className="flex flex-1 flex-col justify-center">
        <PlayerBar p={player(top)} color={top} clock={timed ? clocks[top] : null} active={turn === top && !over} captured={captured[top]} diff={mat(top) - mat(bottom)} running={hist.length > 0 && !halted} status={thinking && turn === top ? (mode === 'ai' ? 'Thinking…' : 'Opponent is moving…') : undefined} flipped={faceToFace} />
        <div className="relative px-1.5">
          <div className="rounded-[18px] bg-[#0c0e12] p-1 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
            <Board fen={fen} orientation={orientation} movable={movable} onMove={apply} lastMove={last ? { from: last.from, to: last.to } : null} hint={hint} />
          </div>
          {banner && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="anim-pop rounded-2xl bg-panel/95 px-5 py-3 text-center shadow-2xl ring-1 ring-gold/40">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Pass the device</p>
                <p className="text-lg font-extrabold">{banner}</p>
              </div>
            </div>
          )}
          {over && (
            <div className="absolute inset-0 grid place-items-center p-6">
              <div className="anim-pop w-full max-w-[300px] rounded-3xl bg-panel/95 p-6 text-center shadow-2xl ring-1 ring-gold/40 backdrop-blur">
                <div className="mx-auto mb-2 text-[56px] leading-none"><Piece type="k" color={over.winner === 'draw' ? 'w' : over.winner} style="gilded" /></div>
                <p className="font-display text-[28px] font-bold">{over.reason === 'Checkmate' ? 'Checkmate!' : over.winner === 'draw' ? 'Draw' : over.reason}</p>
                <p className="mt-1 text-sm text-muted">{over.winner === 'draw' ? `${over.reason} · ½–½` : `${player(over.winner).name} wins · ${over.winner === 'w' ? '1–0' : '0–1'}`}</p>
                <Btn className="mt-5 w-full" onClick={toResult}>View Result</Btn>
              </div>
            </div>
          )}
        </div>
        <PlayerBar p={player(bottom)} color={bottom} clock={timed ? clocks[bottom] : null} active={turn === bottom && !over} captured={captured[bottom]} diff={mat(bottom) - mat(top)} running={hist.length > 0 && !halted} />
      </div>

      <button onClick={() => setSheet('history')} className="mx-3 mb-2 flex h-10 shrink-0 items-center rounded-xl bg-surface px-1" aria-label="Open move history">
        <div ref={stripRef} className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap px-2 font-mono text-[13px]">
          {pairs.length === 0 && <span className="font-sans text-xs text-muted">Moves will appear here</span>}
          {pairs.map(([n, a, b]) => (
            <span key={n} className="flex items-center gap-1">
              <span className="text-muted">{n}.</span>
              <span className={cx('rounded px-1 font-bold', a === last && 'bg-gold text-[#171A21]')}>{a.san}</span>
              {b && <span className={cx('rounded px-1 font-bold', b === last && 'bg-gold text-[#171A21]')}>{b.san}</span>}
            </span>
          ))}
        </div>
      </button>

      <nav className="flex h-[72px] shrink-0 items-center justify-around border-t border-line bg-panel px-2 pb-1">
        {actions.map((a) => (
          <button key={a.label} onClick={a.on} disabled={a.disabled} className="flex h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-muted transition hover:text-ink active:scale-95 disabled:opacity-35">
            <a.icon size={21} /><span className="text-[11px] font-bold">{a.label}</span>
          </button>
        ))}
      </nav>

      <Sheet open={sheet === 'pause'} onClose={() => { setSheet(null); setPaused(false) }} title="Game paused">
        <p className="-mt-2 mb-4 text-sm text-muted">{mode === 'nearby' ? 'Clocks are paused for both players.' : 'Clocks are stopped while this menu is open.'}</p>
        <Btn className="w-full" icon={<Play size={18} />} onClick={() => { setSheet(null); setPaused(false) }}>Resume</Btn>
        <p className="mb-2 mt-5 text-xs font-extrabold uppercase tracking-wider text-muted">Board</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {BOARD_THEMES.map((b) => (
            <button key={b.id} onClick={() => set('board', b.id)} className={cx('shrink-0 rounded-xl p-1 ring-2', settings.board === b.id ? 'ring-gold' : 'ring-transparent')} aria-label={b.name}>
              <span className="grid h-10 w-10 grid-cols-2 overflow-hidden rounded-lg">{[0, 1, 1, 0].map((d, i) => <span key={i} style={{ background: d ? b.dark : b.light }} />)}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {PIECE_STYLES.map((p) => <button key={p.id} onClick={() => set('pieces', p.id)} className={cx('flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[26px] ring-1', settings.pieces === p.id ? 'bg-gold-soft ring-gold' : 'bg-surface ring-line')}><Piece type="n" color="w" style={p.id} /><Piece type="n" color="b" style={p.id} /></button>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Btn variant="surface" icon={settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} onClick={() => set('sound', !settings.sound)}>Sound {settings.sound ? 'on' : 'off'}</Btn>
          <Btn variant="surface" icon={<Settings2 size={18} />} onClick={() => set('showLegal', !settings.showLegal)}>Hints {settings.showLegal ? 'on' : 'off'}</Btn>
        </div>
        {mode === 'nearby' && <Btn variant="outline" className="mt-2 w-full" icon={<Unplug size={18} />} onClick={() => { setSheet(null); setPaused(false); setLost('lost') }}>Simulate connection loss</Btn>}
        <Btn variant="danger" className="mt-2 w-full" icon={<LogOut size={18} />} onClick={() => { setSheet(null); setDialog('exit') }}>Exit game</Btn>
      </Sheet>

      <Sheet open={sheet === 'history'} onClose={() => setSheet(null)} title="Move history">
        {pairs.length === 0 ? <p className="py-6 text-center text-sm text-muted">No moves yet.</p> : (
          <div className="grid grid-cols-[40px_1fr_1fr] gap-y-1 font-mono text-sm">
            {pairs.map(([n, a, b]) => (
              <div key={n} className="contents">
                <span className="py-1.5 text-muted">{n}.</span>
                <span className="rounded-lg px-2 py-1.5 font-bold odd:bg-surface">{a.san}</span>
                <span className="rounded-lg px-2 py-1.5 font-bold">{b?.san ?? ''}</span>
              </div>
            ))}
          </div>
        )}
      </Sheet>

      <Dialog open={dialog === 'resign'}>
        <Flag className="mx-auto text-loss" size={36} />
        <h3 className="mt-3 text-lg font-bold">{mode === 'local' ? `${player(turn).name.split(' ')[0]}, resign?` : 'Resign this game?'}</h3>
        <p className="mt-1 text-sm text-muted">Your opponent will be awarded the win.</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Btn variant="surface" onClick={() => setDialog(null)}>Keep playing</Btn><Btn variant="danger" onClick={resign}>Resign</Btn></div>
      </Dialog>
      <Dialog open={dialog === 'draw'}>
        <Handshake className="mx-auto text-gold" size={36} />
        <h3 className="mt-3 text-lg font-bold">{player(turn).name.split(' ')[0]} offers a draw</h3>
        <p className="mt-1 text-sm text-muted">{player(turn === 'w' ? 'b' : 'w').name.split(' ')[0]}, do you accept?</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Btn variant="surface" onClick={() => setDialog(null)}>Decline</Btn><Btn onClick={() => { setDialog(null); setOver({ winner: 'draw', reason: 'Agreement' }) }}>Accept</Btn></div>
      </Dialog>
      <Dialog open={dialog === 'exit'}>
        <LogOut className="mx-auto text-muted" size={34} />
        <h3 className="mt-3 text-lg font-bold">Leave this game?</h3>
        <p className="mt-1 text-sm text-muted">Progress in this match won’t be saved.</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Btn variant="surface" onClick={() => setDialog(null)}>Stay</Btn><Btn variant="danger" onClick={() => reset('home')}>Exit</Btn></div>
      </Dialog>

      {lost && (
        <div className="anim-fade absolute inset-0 z-50 flex flex-col items-center bg-bg/97 px-6 pb-8 pt-20 text-center backdrop-blur">
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-loss/12">
            {lost === 'trying' ? <RefreshCw size={44} className="animate-spin text-gold" /> : <Unplug size={44} className="text-loss" />}
          </div>
          <h2 className="mt-8 font-display text-[28px] font-bold">{lost === 'trying' ? 'Reconnecting…' : 'Connection lost'}</h2>
          <p className="mt-2 max-w-[290px] text-sm text-muted">{player(cfg.myColor === 'w' ? 'b' : 'w').name}’s {player(cfg.myColor === 'w' ? 'b' : 'w').device ?? 'device'} is out of range. Move closer and keep {cfg.link === 'wifi' ? 'Wi-Fi Direct' : 'Bluetooth'} on.</p>
          <div className="mt-6 w-full rounded-2xl bg-surface p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-muted">Game state</span><span className="font-bold text-win">Saved on device</span></div>
            <div className="mt-2 flex justify-between"><span className="text-muted">Clocks</span><span className="font-bold">Paused</span></div>
            <div className="mt-2 flex justify-between"><span className="text-muted">Internet</span><span className="flex items-center gap-1 font-bold"><WifiOff size={13} />Not needed</span></div>
          </div>
          <div className="mt-auto w-full space-y-2">
            <Btn size="lg" className="w-full" disabled={lost === 'trying'} icon={<RefreshCw size={18} />} onClick={() => setLost('trying')}>Reconnect</Btn>
            <Btn variant="surface" className="w-full" onClick={() => { setLost(null); setOver({ winner: 'draw', reason: 'Disconnected' }) }}>End match as draw</Btn>
          </div>
        </div>
      )}
    </div>
  )
}
