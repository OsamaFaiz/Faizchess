import { Timer } from 'lucide-react'
import { TIME_CONTROLS } from '../app/data'
import { Chip } from './ui'

export function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const groups = [...new Set(TIME_CONTROLS.map((t) => t.group))]
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g} className="flex items-center gap-3">
          <span className="flex w-[88px] shrink-0 items-center gap-1.5 text-[13px] font-bold text-muted"><Timer size={14} />{g}</span>
          <div className="flex flex-wrap gap-2">
            {TIME_CONTROLS.filter((t) => t.group === g).map((t) => <Chip key={t.id} active={value === t.id} onClick={() => onChange(t.id)} className="min-w-[60px]">{t.id === '∞' ? 'No clock' : t.id}</Chip>)}
          </div>
        </div>
      ))}
    </div>
  )
}
