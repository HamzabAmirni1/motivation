import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const STEPS = [
  { n:5, sense:'شوف',   verb:'كتشوف',  color:'#6ee7b7', emoji:'👀', hint:'دور حداك وشوف 5 حوايج مختلفة' },
  { n:4, sense:'لمس',   verb:'كتلمس',  color:'#7dd3fc', emoji:'✋', hint:'لمس 4 سطوح مختلفة هدرتك' },
  { n:3, sense:'سمع',   verb:'كتسمع',  color:'#a78bfa', emoji:'👂', hint:'صفي نيتك واسمع 3 أصوات' },
  { n:2, sense:'شم',    verb:'كتشم',   color:'#fcd34d', emoji:'👃', hint:'لاحظ 2 ديال الروائح' },
  { n:1, sense:'دوق',   verb:'كتدوق',  color:'#fda4af', emoji:'👅', hint:'فكر في طعم حاجة واحدة' },
]

export default function Grounding541({ onXPEarned }) {
  const { addXP } = useAuth()
  const [step,    setStep]    = useState(0)
  const [inputs,  setInputs]  = useState(Array(5).fill().map(() => []))
  const [current, setCurrent] = useState('')
  const [done,    setDone]    = useState(false)
  const [earned,  setEarned]  = useState(false)

  const s = STEPS[step]

  function addItem() {
    if (!current.trim()) return
    const updated = inputs.map((arr,i) => i === step ? [...arr, current.trim()] : arr)
    setInputs(updated)
    setCurrent('')
  }

  function nextStep() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setDone(true)
      if (!earned) { addXP(20); onXPEarned?.(20); setEarned(true) }
    }
  }

  function reset() {
    setStep(0); setInputs(Array(5).fill().map(() => [])); setCurrent(''); setDone(false); setEarned(false)
  }

  if (done) {
    return (
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="glass p-6 text-center">
        <div className="text-5xl mb-3">🌿</div>
        <h3 className="font-bold text-xl mb-2 gradient-text">مزيان عليك!</h3>
        <p style={{ color:'var(--subtle)' }} className="text-sm mb-4">كملتي تمرين 5-4-3-2-1. راك أكثر هدوءاً الآن إن شاء الله.</p>
        {earned && <div className="chip mb-4 mx-auto w-fit">+20 XP 🎉</div>}
        <button onClick={reset} className="btn-ghost">← مرة أخرى</button>
      </motion.div>
    )
  }

  return (
    <div className="glass p-6">
      <h3 className="font-bold text-lg mb-1" style={{ color:'var(--text)' }}>🌍 تمرين 5-4-3-2-1</h3>
      <p className="text-xs mb-4" style={{ color:'var(--muted)' }}>يساعدك تهدى وترجع للحظة الحالية</p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-5 justify-center">
        {STEPS.map((st, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              animate={{ scale: i === step ? 1.2 : 1 }}
              style={{ background: i < step ? `${st.color}33` : i === step ? st.color : 'rgba(255,255,255,0.06)', color: i === step ? '#0a0f1a' : i < step ? st.color : 'var(--muted)', border: i === step ? `2px solid ${st.color}` : 'none' }}>
              {i < step ? '✓' : st.n}
            </motion.div>
            <span className="text-xs" style={{ color: i === step ? st.color : 'var(--muted)' }}>{st.sense}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
          <div className="p-4 rounded-xl mb-4 text-center" style={{ background:`${s.color}11`, border:`1px solid ${s.color}33` }}>
            <span className="text-4xl">{s.emoji}</span>
            <p className="font-bold mt-2" style={{ color: s.color }}>{s.n} حوايج {s.verb}</p>
            <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>{s.hint}</p>
          </div>

          {/* Items entered */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
            {inputs[step].map((item, i) => (
              <motion.span key={i} initial={{ scale:0 }} animate={{ scale:1 }}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background:`${s.color}22`, color: s.color, border:`1px solid ${s.color}44` }}>
                {item}
              </motion.span>
            ))}
          </div>

          {inputs[step].length < s.n && (
            <div className="flex gap-2 mb-4">
              <input className="zen-input" placeholder={`${s.verb} شي... (${inputs[step].length + 1}/${s.n})`}
                value={current} onChange={e => setCurrent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()} />
              <button onClick={addItem} className="btn-zen px-4">+</button>
            </div>
          )}

          <button onClick={nextStep}
            disabled={inputs[step].length < s.n}
            className="btn-zen w-full disabled:opacity-40">
            {step === STEPS.length - 1 ? 'كملت التمرين ✓' : 'التالي ←'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
