import { useEffect } from 'react'
import splash from '../assets/splash.png'
import { useStore } from '../app/store'
import { Logo } from '../components/ui'

export function Splash() {
  const { reset } = useStore()
  useEffect(() => {
    const t = setTimeout(() => reset(localStorage.getItem('cm:onboarded') ? 'home' : 'onboarding'), 2600)
    return () => clearTimeout(t)
  }, [reset])
  return (
    <button onClick={() => reset(localStorage.getItem('cm:onboarded') ? 'home' : 'onboarding')} className="relative flex h-full w-full flex-col items-center overflow-hidden bg-[#0b0d11] text-white">
      <img src={splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d11] via-[#0b0d11]/30 to-[#0b0d11]" />
      <div className="anim-pop relative mt-[30%] flex flex-col items-center">
        <Logo size={84} />
        <h1 className="mt-6 font-display text-[40px] font-bold tracking-[0.18em]">CHESS MATE</h1>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.35em] text-[#D6A85F]">Think · Play · Conquer</p>
      </div>
      <div className="relative mt-auto mb-16 flex flex-col items-center gap-3">
        <div className="h-[3px] w-36 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-[#D6A85F]" style={{ animation: 'bar-load 1.1s ease-in-out infinite' }} />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-white/50">Setting up the board…</span>
      </div>
    </button>
  )
}
