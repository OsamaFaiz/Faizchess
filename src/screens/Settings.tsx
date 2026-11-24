import type { ReactNode } from 'react'
import { Bell, Bluetooth, ChevronRight, Eye, Globe, Grid3x3, Info, Moon, Music, RefreshCw, Shield, Smartphone, Sun, Timer, Volume2, Vibrate, Wand2 } from 'lucide-react'
import { BOARD_THEMES, PIECE_STYLES, TIME_CONTROLS } from '../app/data'
import { useStore, type Settings as S } from '../app/store'
import { Piece } from '../components/Piece'
import { Card, Section, Toggle, TopBar, cx } from '../components/ui'

function Row({ icon: I, title, sub, children, onClick }: { icon: typeof Bell; title: string; sub?: string; children?: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 py-2 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface2 text-gold"><I size={19} /></span>
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span>{sub && <span className="block text-xs text-muted">{sub}</span>}</span>
      {children ?? (onClick && <ChevronRight size={18} className="text-muted" />)}
    </Tag>
  )
}

export function Settings() {
  const { settings: s, set, notify } = useStore()
  const T = (k: keyof S, label: string) => <Toggle label={label} on={s[k] as boolean} onChange={(v) => set(k, v as any)} />
  const langs = ['English', 'हिन्दी', 'Español', 'Français', 'Deutsch']
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Settings" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
        <Section title="Appearance" className="mt-1">
          <Card className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface2 p-1">
              {([['dark', Moon, 'Dark'], ['light', Sun, 'Light']] as const).map(([v, I, l]) => (
                <button key={v} onClick={() => set('theme', v)} className={cx('flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition', s.theme === v ? 'bg-gold text-[#171A21] shadow' : 'text-muted')}><I size={17} />{l}</button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Board theme</p>
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {BOARD_THEMES.map((b) => (
                  <button key={b.id} onClick={() => set('board', b.id)} className="shrink-0 text-center">
                    <span className={cx('grid h-16 w-16 grid-cols-4 grid-rows-4 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-surface transition', s.board === b.id ? 'ring-gold' : 'ring-transparent')}>
                      {Array.from({ length: 16 }, (_, i) => <span key={i} style={{ background: (i + Math.floor(i / 4)) % 2 ? b.dark : b.light }} />)}
                    </span>
                    <span className={cx('mt-1.5 block text-[11px] font-bold', s.board === b.id ? 'text-gold' : 'text-muted')}>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Piece style</p>
              <div className="grid grid-cols-3 gap-2">
                {PIECE_STYLES.map((p) => (
                  <button key={p.id} onClick={() => set('pieces', p.id)} className={cx('rounded-2xl py-2 transition ring-1', s.pieces === p.id ? 'bg-gold-soft ring-2 ring-gold' : 'bg-surface2 ring-line')}>
                    <span className="flex justify-center text-[30px]" style={{ background: BOARD_THEMES[0].light, borderRadius: 10, margin: '0 8px' }}><Piece type="q" color="w" style={p.id} /><Piece type="n" color="b" style={p.id} /></span>
                    <span className="mt-1 block text-xs font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <Row icon={Grid3x3} title="Board coordinates">{T('showCoords', 'Board coordinates')}</Row>
          </Card>
        </Section>

        <Section title="Sound & Feel">
          <Card className="divide-y divide-line py-1">
            <Row icon={Volume2} title="Sound effects">{T('sound', 'Sound effects')}</Row>
            <Row icon={Music} title="Background music">{T('music', 'Background music')}</Row>
            <Row icon={Vibrate} title="Vibration" sub="Haptic feedback on moves">{T('vibration', 'Vibration')}</Row>
          </Card>
        </Section>

        <Section title="Gameplay">
          <Card className="divide-y divide-line py-1">
            <Row icon={Eye} title="Show legal moves">{T('showLegal', 'Show legal moves')}</Row>
            <Row icon={Wand2} title="Auto-promote to Queen">{T('autoQueen', 'Auto-promote to Queen')}</Row>
            <div className="py-3">
              <p className="mb-2 flex items-center gap-2 text-[15px] font-semibold"><Timer size={17} className="text-gold" />Default timer</p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">{TIME_CONTROLS.map((t) => <button key={t.id} onClick={() => set('defaultTime', t.id)} className={cx('h-9 shrink-0 rounded-xl px-3 text-xs font-bold', s.defaultTime === t.id ? 'bg-gold text-[#171A21]' : 'bg-surface2')}>{t.id === '∞' ? 'No clock' : t.id}</button>)}</div>
            </div>
          </Card>
        </Section>

        <Section title="Offline play">
          <Card className="divide-y divide-line py-1">
            <Row icon={Smartphone} title="On-device AI" sub="Engine runs locally — no data used">{T('offlineAI', 'On-device AI')}</Row>
            <Row icon={RefreshCw} title="Auto-reconnect nearby games">{T('autoReconnect', 'Auto-reconnect')}</Row>
            <Row icon={Bluetooth} title="Preferred link" sub={s.preferredLink === 'bluetooth' ? 'Bluetooth' : 'Wi-Fi Direct'} onClick={() => set('preferredLink', s.preferredLink === 'bluetooth' ? 'wifi' : 'bluetooth')} />
            <Row icon={Sun} title="Keep screen awake during games">{T('keepAwake', 'Keep screen awake')}</Row>
          </Card>
        </Section>

        <Section title="General">
          <Card className="divide-y divide-line py-1">
            <Row icon={Globe} title="Language" sub={s.language} onClick={() => set('language', langs[(langs.indexOf(s.language) + 1) % langs.length])} />
            <Row icon={Shield} title="Privacy Policy" onClick={() => notify('Chess Mate stores your games only on this device')} />
            <Row icon={Info} title="About Chess Mate" sub="Version 1.0.0 · Build 2025.11" onClick={() => notify('Chess Mate 1.0 — made for offline play')} />
          </Card>
        </Section>
      </div>
    </div>
  )
}
