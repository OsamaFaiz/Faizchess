import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowLeft, BarChart3, GraduationCap, Home, Swords, User, WifiOff } from 'lucide-react'
import { useStore, type ScreenName } from '../app/store'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Avatar({ initials, hue, size = 44, ring, className }: { initials: string; hue: number; size?: number; ring?: boolean; className?: string }) {
  return (
    <div
      className={cx('grid shrink-0 place-items-center rounded-full font-bold text-white', ring && 'ring-2 ring-gold ring-offset-2 ring-offset-bg', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(140deg, hsl(${hue} 55% 58%), hsl(${hue + 25} 50% 32%))` }}
    >
      {initials}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'surface' | 'ghost' | 'outline' | 'danger'; size?: 'md' | 'lg' | 'sm'; icon?: ReactNode }
export function Btn({ variant = 'gold', size = 'md', icon, className, children, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        size === 'lg' && 'h-14 px-6 text-[15px]',
        size === 'md' && 'h-12 px-5 text-sm',
        size === 'sm' && 'h-9 rounded-xl px-3.5 text-[13px]',
        variant === 'gold' && 'gold-grad text-[#171A21] shadow-[0_8px_24px_-10px_rgba(214,168,95,0.8)]',
        variant === 'surface' && 'bg-surface text-ink',
        variant === 'ghost' && 'text-muted hover:text-ink',
        variant === 'outline' && 'border border-line bg-transparent text-ink',
        variant === 'danger' && 'bg-loss/15 text-loss',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconBtn({ children, label, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} {...p} className={cx('grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-surface active:scale-95', className)}>
      {children}
    </button>
  )
}

export function TopBar({ title, subtitle, right, onBack }: { title: string; subtitle?: string; right?: ReactNode; onBack?: () => void }) {
  const { back } = useStore()
  return (
    <header className="flex h-16 shrink-0 items-center gap-1 px-2">
      <IconBtn label="Back" onClick={onBack ?? back}><ArrowLeft size={22} /></IconBtn>
      <div className="min-w-0 flex-1 pl-1">
        <h1 className="truncate text-[19px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={cx('block w-full rounded-3xl bg-surface p-4 text-left shadow-card', onClick && 'transition active:scale-[0.985]', className)}>
      {children}
    </Tag>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx('relative h-8 w-[52px] shrink-0 rounded-full transition-colors', on ? 'bg-gold' : 'bg-surface2 ring-1 ring-line')}>
      <span className={cx('absolute top-1 h-6 w-6 rounded-full shadow transition-all', on ? 'left-[24px] bg-[#171A21]' : 'left-1 bg-muted')} />
    </button>
  )
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cx('h-10 rounded-xl px-4 text-sm font-bold transition active:scale-95', active ? 'bg-gold text-[#171A21]' : 'bg-surface text-ink ring-1 ring-line', className)}>
      {children}
    </button>
  )
}

export const Section = ({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cx('mt-6', className)}>
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

export function OfflineBadge({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full bg-win/12 px-2.5 py-1 text-[11px] font-bold text-win', className)}>
      <WifiOff size={12} /> No internet needed
    </span>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <button aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-sheet relative max-h-[85%] w-full overflow-y-auto rounded-t-[28px] bg-panel px-5 pb-8 pt-3 shadow-2xl ring-1 ring-line">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted/40" />
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur-[2px]">
      <div className="anim-pop w-full rounded-[28px] bg-panel p-6 text-center shadow-2xl ring-1 ring-line">{children}</div>
    </div>
  )
}

const TABS: { id: ScreenName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'play', label: 'Play', icon: Swords },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
]
export function BottomNav({ active }: { active: ScreenName }) {
  const { reset } = useStore()
  return (
    <nav className="flex h-[76px] shrink-0 items-stretch border-t border-line bg-panel/95 px-2 pb-2 backdrop-blur">
      {TABS.map((t) => {
        const on = t.id === active
        return (
          <button key={t.id} onClick={() => !on && reset(t.id)} className="flex flex-1 flex-col items-center justify-center gap-1">
            <span className={cx('grid h-8 w-16 place-items-center rounded-full transition-all', on ? 'bg-gold-soft text-gold' : 'text-muted')}>
              <t.icon size={21} strokeWidth={on ? 2.4 : 1.9} />
            </span>
            <span className={cx('text-[11px] font-bold', on ? 'text-ink' : 'text-muted')}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <div className="gold-grad relative grid place-items-center rounded-[30%] shadow-[0_20px_50px_-15px_rgba(214,168,95,0.7)]" style={{ width: size, height: size }}>
      <span className="font-piece leading-none text-[#171A21]" style={{ fontSize: size * 0.66, marginTop: -size * 0.04 }}>{'\u265E\uFE0E'}</span>
    </div>
  )
}

export function fmtClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (ms < 10000 && ms > 0) return `0:${(ms / 1000).toFixed(1).padStart(4, '0')}`
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
export const fmtDur = (s: number) => `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, '0')}s`
