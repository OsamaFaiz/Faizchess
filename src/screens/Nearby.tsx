import { useEffect, useState, type ReactNode } from 'react'
import { Bluetooth, Check, ChevronRight, Loader2, Radio, Shield, Signal, Smartphone, Wifi, WifiOff, X } from 'lucide-react'
import { ME, NEARBY_DEVICES, type Color } from '../app/data'
import { useStore } from '../app/store'
import { Piece } from '../components/Piece'
import { TimePicker } from '../components/TimePicker'
import { Avatar, Btn, Card, Dialog, OfflineBadge, Section, TopBar, cx } from '../components/ui'

type Step = 'hub' | 'host' | 'hosting' | 'scan' | 'requesting' | 'match' | 'ready'
type Dev = (typeof NEARBY_DEVICES)[number]

export function Radar({ children, size = 240 }: { children?: ReactNode; size?: number }) {
  return (
    <div className="relative mx-auto grid place-items-center" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => <span key={i} className="absolute inset-0 rounded-full border-2 border-gold/50" style={{ animation: `radar 2.7s ${i * 0.9}s ease-out infinite` }} />)}
      <span className="absolute inset-[22%] rounded-full border border-line" />
      <span className="absolute inset-[6%] rounded-full border border-line" />
      {children}
    </div>
  )
}

const Bars = ({ n }: { n: number }) => (
  <span className="flex h-4 items-end gap-[2px]" aria-label={`Signal ${n} of 4`}>
    {[1, 2, 3, 4].map((i) => <span key={i} className={cx('w-[3px] rounded-sm', i <= n ? 'bg-win' : 'bg-muted/30')} style={{ height: i * 4 }} />)}
  </span>
)

export function Nearby() {
  const { back, settings, set, startGame, rating } = useStore()
  const [steps, setSteps] = useState<Step[]>(['hub'])
  const step = steps[steps.length - 1]
  const to = (s: Step) => setSteps((x) => [...x, s])
  const goBack = () => (steps.length > 1 ? setSteps((x) => x.slice(0, -1)) : back())
  const link = settings.preferredLink
  const LinkIcon = link === 'bluetooth' ? Bluetooth : Wifi
  const linkName = link === 'bluetooth' ? 'Bluetooth' : 'Wi-Fi Direct'

  const [time, setTime] = useState('10+0')
  const [hostColor, setHostColor] = useState<Color>('w')
  const [opp, setOpp] = useState<Dev>(NEARBY_DEVICES[0])
  const [found, setFound] = useState(0)
  const [incoming, setIncoming] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [ready, setReady] = useState({ me: false, them: false })
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (step === 'scan') {
      setFound(0)
      const ts = NEARBY_DEVICES.map((_, i) => setTimeout(() => setFound(i + 1), 900 + i * 1100))
      return () => ts.forEach(clearTimeout)
    }
    if (step === 'hosting') {
      const t = setTimeout(() => setIncoming(true), 3200)
      return () => clearTimeout(t)
    }
    if (step === 'requesting') {
      const t = setTimeout(() => setSteps((x) => [...x.slice(0, -1), 'match']), 2600)
      return () => clearTimeout(t)
    }
    if (step === 'ready') {
      setReady({ me: false, them: false }); setCount(null)
      const t = setTimeout(() => setReady((r) => ({ ...r, them: true })), 1600)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    if (ready.me && ready.them && count === null) setCount(3)
  }, [ready, count])
  useEffect(() => {
    if (count === null) return
    if (count === 0) {
      const my: Color = isHost ? hostColor : 'b'
      const me = { name: ME.name, rating, hue: ME.hue, initials: ME.initials }
      const them = { name: opp.name, rating: opp.rating, hue: opp.hue, initials: opp.initials, device: opp.device }
      startGame({ mode: 'nearby', white: my === 'w' ? me : them, black: my === 'w' ? them : me, time, myColor: my, link })
      return
    }
    const t = setTimeout(() => setCount(count - 1), 800)
    return () => clearTimeout(t)
  }, [count])

  const titles: Record<Step, [string, string]> = {
    hub: ['Nearby Multiplayer', 'Device to device · offline'],
    host: ['Host a Game', 'Set up your table'],
    hosting: ['Waiting for opponent', `Visible over ${linkName}`],
    scan: ['Join a Game', `Scanning via ${linkName}`],
    requesting: ['Connection request', 'Waiting for host'],
    match: ['Match found', 'Connected'],
    ready: ['Ready to play', 'Both players must confirm'],
  }

  return (
    <div className="relative flex h-full flex-col">
      <TopBar title={titles[step][0]} subtitle={titles[step][1]} onBack={goBack} right={<span className="mr-3 grid h-9 w-9 place-items-center rounded-full bg-win/12 text-win" title="No internet required"><WifiOff size={17} /></span>} />
      <div key={step} className="anim-in no-scrollbar flex flex-1 flex-col overflow-y-auto px-5 pb-6">
        {step === 'hub' && (
          <>
            <Card className="mt-1 flex items-center gap-3 bg-win/10 shadow-none ring-1 ring-win/25">
              <WifiOff className="shrink-0 text-win" size={22} />
              <p className="text-[13px] leading-snug"><b>No internet required.</b> Phones talk directly to each other. Keep devices within ~10 m.</p>
            </Card>
            <Section title="Connection type">
              <div className="grid grid-cols-2 gap-3">
                {([['bluetooth', Bluetooth, 'Bluetooth', 'Low power · ~10 m'], ['wifi', Wifi, 'Wi-Fi Direct', 'Faster · ~50 m']] as const).map(([id, I, name, sub]) => (
                  <button key={id} onClick={() => set('preferredLink', id)} className={cx('rounded-3xl p-4 text-left transition', link === id ? 'bg-gold-soft ring-2 ring-gold' : 'bg-surface ring-1 ring-line')}>
                    <span className="flex items-center justify-between"><I size={26} className="text-gold" />{link === id && <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-[#171A21]"><Check size={13} strokeWidth={3} /></span>}</span>
                    <span className="mt-3 block font-bold">{name}</span>
                    <span className="block text-xs text-muted">{sub}</span>
                  </button>
                ))}
              </div>
            </Section>
            <Section title="Start">
              <div className="space-y-3">
                <Card onClick={() => { setIsHost(true); to('host') }} className="flex items-center gap-4">
                  <span className="gold-grad grid h-14 w-14 place-items-center rounded-2xl text-[#171A21]"><Radio size={26} /></span>
                  <span className="flex-1"><span className="block text-[16px] font-bold">Host a Game</span><span className="block text-[13px] text-muted">Create a table and let a friend join</span></span>
                  <ChevronRight className="text-muted" />
                </Card>
                <Card onClick={() => { setIsHost(false); to('scan') }} className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface2 text-gold"><Smartphone size={26} /></span>
                  <span className="flex-1"><span className="block text-[16px] font-bold">Join a Game</span><span className="block text-[13px] text-muted">Find tables hosted nearby</span></span>
                  <ChevronRight className="text-muted" />
                </Card>
              </div>
            </Section>
            <p className="mt-6 flex items-center gap-2 px-1 text-xs text-muted"><Shield size={14} />Only players you accept can connect to your device.</p>
          </>
        )}

        {step === 'host' && (
          <>
            <Card className="mt-1 flex items-center gap-3">
              <Avatar initials={ME.initials} hue={ME.hue} />
              <div className="flex-1"><p className="text-xs text-muted">Table name</p><p className="font-bold">Arjun’s Table</p></div>
              <span className="flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5 text-xs font-bold"><LinkIcon size={14} className="text-gold" />{linkName}</span>
            </Card>
            <Section title="Time Control"><Card><TimePicker value={time} onChange={setTime} /></Card></Section>
            <Section title="Your colour">
              <div className="grid grid-cols-2 gap-3">
                {(['w', 'b'] as const).map((c) => (
                  <button key={c} onClick={() => setHostColor(c)} className={cx('flex items-center gap-3 rounded-2xl p-3 transition', hostColor === c ? 'bg-gold-soft ring-2 ring-gold' : 'bg-surface ring-1 ring-line')}>
                    <span className="text-[34px]"><Piece type="k" color={c} /></span><span className="font-bold">{c === 'w' ? 'White' : 'Black'}</span>
                  </button>
                ))}
              </div>
            </Section>
            <div className="mt-auto pt-6"><Btn size="lg" className="w-full" icon={<Radio size={18} />} onClick={() => to('hosting')}>Open Table</Btn></div>
          </>
        )}

        {step === 'hosting' && (
          <div className="flex flex-1 flex-col items-center pt-6 text-center">
            <Radar><Avatar initials={ME.initials} hue={ME.hue} size={76} ring /></Radar>
            <h2 className="mt-8 text-xl font-bold">Waiting for an opponent…</h2>
            <p className="mt-2 max-w-[280px] text-sm text-muted">Ask your friend to open Chess Mate → Nearby → Join a Game.</p>
            <div className="mt-6 flex gap-2">
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold ring-1 ring-line">Code <span className="text-gold tracking-widest">K7-Q2</span></span>
              <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold ring-1 ring-line">{time === '∞' ? 'No clock' : time}</span>
              <span className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-bold ring-1 ring-line"><LinkIcon size={12} />{linkName}</span>
            </div>
            <OfflineBadge className="mt-4" />
            <Btn variant="outline" className="mt-auto w-full" onClick={goBack}>Close Table</Btn>
          </div>
        )}

        {step === 'scan' && (
          <>
            <Radar size={190}>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-[#171A21]"><LinkIcon size={24} /></span>
              {NEARBY_DEVICES.slice(0, found).map((d, i) => (
                <span key={d.id} className="anim-pop absolute" style={{ transform: `rotate(${i * 95 + 30}deg) translateY(-${60 + i * 8}px) rotate(-${i * 95 + 30}deg)` }}><Avatar initials={d.initials} hue={d.hue} size={30} /></span>
              ))}
            </Radar>
            <div className="mb-2 mt-4 flex items-center justify-between px-1">
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">Available players · {found}</h2>
              {found < NEARBY_DEVICES.length && <Loader2 size={16} className="animate-spin text-gold" />}
            </div>
            <div className="space-y-2">
              {NEARBY_DEVICES.slice(0, found).map((d) => (
                <Card key={d.id} onClick={() => { setOpp(d); to('requesting') }} className="anim-fade flex items-center gap-3 p-3">
                  <Avatar initials={d.initials} hue={d.hue} />
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold">{d.name}’s Table</span><span className="block truncate text-xs text-muted">{d.device} · {d.rating} · {d.dist}</span></span>
                  <Bars n={d.signal} />
                  <span className="rounded-xl bg-gold px-3 py-2 text-xs font-extrabold text-[#171A21]">Join</span>
                </Card>
              ))}
              {found === 0 && <p className="py-6 text-center text-sm text-muted">Looking for nearby tables…</p>}
            </div>
          </>
        )}

        {step === 'requesting' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex items-center gap-4">
              <Avatar initials={ME.initials} hue={ME.hue} size={64} />
              <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-gold" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
              <Avatar initials={opp.initials} hue={opp.hue} size={64} />
            </div>
            <h2 className="mt-8 text-xl font-bold">Request sent to {opp.name.split(' ')[0]}</h2>
            <p className="mt-2 text-sm text-muted">Waiting for them to accept on their {opp.device}…</p>
            <Btn variant="outline" className="mt-10" icon={<X size={16} />} onClick={goBack}>Cancel request</Btn>
          </div>
        )}

        {step === 'match' && (
          <div className="flex flex-1 flex-col items-center text-center">
            <p className="anim-pop mt-6 font-display text-[34px] font-bold text-gold">Match Found!</p>
            <div className="relative mt-8 flex w-full items-start justify-around">
              <span className="absolute left-1/2 top-7 -translate-x-1/2 font-display text-2xl font-bold text-muted">VS</span>
              {[{ n: ME.name, r: rating, h: ME.hue, i: ME.initials, d: 'This device', c: isHost ? hostColor : 'b' }, { n: opp.name, r: opp.rating, h: opp.hue, i: opp.initials, d: opp.device, c: isHost ? (hostColor === 'w' ? 'b' : 'w') : 'w' }].map((p, k) => (
                <div key={k} className="anim-fade flex w-32 flex-col items-center" style={{ animationDelay: `${k * 120}ms` }}>
                  <div className="relative"><Avatar initials={p.i} hue={p.h} size={84} ring={k === 0} /><span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-panel text-[26px] ring-2 ring-bg"><Piece type="k" color={p.c as Color} /></span></div>
                  <p className="mt-3 font-bold">{p.n.split(' ')[0]}</p>
                  <p className="text-xs text-muted">{p.r} · {p.d}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 w-full space-y-3 text-left">
              {[['Connection', <span key="c" className="flex items-center gap-1.5 text-win"><LinkIcon size={14} />{linkName} · 14 ms</span>], ['Time control', time === '∞' ? 'No clock' : time], ['Internet', <span key="i" className="flex items-center gap-1.5 text-win"><WifiOff size={14} />Not required</span>]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-sm"><span className="text-muted">{k}</span><span className="font-bold">{v}</span></div>
              ))}
            </Card>
            <Btn size="lg" className="mt-auto w-full" onClick={() => to('ready')}>Continue</Btn>
          </div>
        )}

        {step === 'ready' && (
          <div className="flex flex-1 flex-col items-center text-center">
            {count !== null ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted">Game starts in</p>
                <p key={count} className="anim-pop mt-2 font-display text-[110px] font-bold leading-none text-gold">{count || 'Go'}</p>
              </div>
            ) : (
              <>
                <div className="mt-6 w-full space-y-3">
                  {[{ n: 'You', i: ME.initials, h: ME.hue, ok: ready.me }, { n: opp.name, i: opp.initials, h: opp.hue, ok: ready.them }].map((p) => (
                    <Card key={p.n} className="flex items-center gap-3">
                      <Avatar initials={p.i} hue={p.h} />
                      <span className="flex-1 text-left font-bold">{p.n}</span>
                      {p.ok ? <span className="flex items-center gap-1 rounded-full bg-win/15 px-3 py-1 text-xs font-extrabold text-win"><Check size={14} />Ready</span> : <span className="flex items-center gap-1.5 text-xs font-bold text-muted"><Loader2 size={14} className="animate-spin" />Not ready</span>}
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted"><Signal size={14} className="text-win" />Stable link · moves sync instantly</div>
                <Btn size="lg" className="mt-auto w-full" disabled={ready.me} onClick={() => setReady((r) => ({ ...r, me: true }))}>{ready.me ? 'Waiting for opponent…' : "I'm Ready"}</Btn>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={incoming}>
        <Avatar initials={opp.initials} hue={opp.hue} size={72} className="mx-auto" />
        <h3 className="mt-4 text-lg font-bold">{opp.name} wants to join</h3>
        <p className="mt-1 text-sm text-muted">{opp.device} · Rating {opp.rating} · {opp.dist} away</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Btn variant="surface" onClick={() => { setIncoming(false); setOpp(NEARBY_DEVICES[1]); setTimeout(() => setIncoming(true), 2500) }}>Decline</Btn>
          <Btn onClick={() => { setIncoming(false); to('match') }}>Accept</Btn>
        </div>
      </Dialog>
    </div>
  )
}
