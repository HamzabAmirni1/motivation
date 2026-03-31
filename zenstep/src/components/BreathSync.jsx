import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const PHASES = [
  { label:'شهيق',  duration:4000, scale:1.35 },
  { label:'احتفظ', duration:4000, scale:1.35 },
  { label:'زفير',  duration:4000, scale:1.0  },
  { label:'استرح', duration:2000, scale:1.0  },
]

export default function BreathSync({ onXPEarned }) {
  const { addXP } = useAuth()
  const [running,  setRunning]  = useState(false)
  const [phase,    setPhase]    = useState(0)
  const [seconds,  setSeconds]  = useState(PHASES[0].duration / 1000)
  const [rounds,   setRounds]   = useState(0)
  const [done,     setDone]     = useState(false)
  const timerRef   = useRef(null)
  const phaseRef   = useRef(0)

  function start() { setRunning(true); setPhase(0); phaseRef.current = 0; setSeconds(PHASES[0].duration / 1000); setDone(false) }

  function stop() {
    setRunning(false)
    clearTimeout(timerRef.current)
  }

  useEffect(() => {
    if (!running) return
    const tick = () => {
      const p = phaseRef.current
      let remaining = PHASES[p].duration / 1000
      const interval = setInterval(() => {
        remaining -= 1
        setSeconds(remaining)
        if (remaining <= 0) {
          clearInterval(interval)
          const next = (p + 1) % PHASES.length
          phaseRef.current = next
          setPhase(next)
          setSeconds(PHASES[next].duration / 1000)
          if (next === 0) {
            setRounds(r => {
              const nr = r + 1
              if (nr >= 3) {
                setRunning(false)
                setDone(true)
                addXP(15)
                onXPEarned?.(15)
              }
              return nr
            })
          }
          tick()
        }
      }, 1000)
      timerRef.current = interval
    }
    tick()
    return () => clearInterval(timerRef.current)
  }, [running])

  const current = PHASES[phase]
  const colors  = ['#6ee7b7','#a78bfa','#7dd3fc','#94a3b8']

  return (
    <div className="glass p-6 flex flex-col items-center">
      <h3 className="font-bold text-lg mb-1" style={{ color:'var(--text)' }}>💨 Breathe-Sync</h3>
      <p className="text-xs mb-6" style={{ color:'var(--muted)' }}>تبع الدائرة: تكبر = شهيق، تصغر = زفير</p>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center mb-6" style={{ width:180, height:180 }}>
        {/* Outer glow ring */}
        <motion.div className="absolute rounded-full"
          style={{ width:180, height:180, background:`radial-gradient(circle, ${colors[phase]}22, transparent)` }}
          animate={{ scale: current.scale, opacity:[0.4,0.8,0.4] }}
          transition={{ duration: current.duration/1000, ease:'easeInOut', repeat:Infinity }}
        />
        {/* Main circle */}
        <motion.div className="absolute rounded-full flex flex-col items-center justify-center"
          style={{ width:120, height:120, background:`radial-gradient(circle at 35% 35%, ${colors[phase]}, ${colors[phase]}88)`, boxShadow:`0 0 30px ${colors[phase]}55` }}
          animate={{ scale: current.scale }}
          transition={{ duration: current.duration/1000, ease:'easeInOut' }}>
          <p className="text-2xl font-black" style={{ color:'#0a0f1a' }}>{seconds}</p>
          <p className="text-xs font-bold" style={{ color:'#0a0f1a' }}>{current.label}</p>
        </motion.div>
      </div>

      <div className="flex gap-2 mb-5">
        {PHASES.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === phase && running ? colors[phase] : 'rgba(255,255,255,0.15)' }} />
            <span className="text-xs" style={{ color: i === phase ? colors[phase] : 'var(--muted)' }}>{p.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-4 text-center p-3 rounded-xl w-full"
            style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)' }}>
            <p className="font-bold" style={{ color:'#6ee7b7' }}>مزيان عليك! 🎉 +15 XP</p>
            <p className="text-xs" style={{ color:'var(--muted)' }}>كملتي 3 دورات تنفس — راك أهدى الآن</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 w-full">
        {!running ? (
          <motion.button whileTap={{ scale:0.97 }} onClick={start} className="btn-zen flex-1">
            {done ? '🔄 مرة أخرى' : '▶ بدا التنفس'}
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale:0.97 }} onClick={stop}
            className="btn-ghost flex-1">
            ⏹ توقف
          </motion.button>
        )}
      </div>
      {rounds > 0 && <p className="text-xs mt-2" style={{ color:'var(--muted)' }}>{rounds}/3 دورات</p>}
    </div>
  )
}
