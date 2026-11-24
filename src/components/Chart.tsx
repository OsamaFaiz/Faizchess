export function LineChart({ data, height = 120, showAxis = false }: { data: number[]; height?: number; showAxis?: boolean }) {
  const w = 320, h = height, pad = 6
  const min = Math.min(...data) - 10, max = Math.max(...data) + 10
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / (max - min)) * (h - pad * 2)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Rating over time">
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {showAxis && [0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--line)" strokeDasharray="3 5" />)}
      <path d={`${d} L${last[0]},${h} L${pts[0][0]},${h} Z`} fill="url(#lg)" />
      <path d={d} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--gold)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}

export function Ring({ value, size = 64, stroke = 7, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--gold)" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-extrabold">{label ?? `${Math.round(value)}%`}</span>
    </div>
  )
}
