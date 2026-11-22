import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PATTERNS = [
  {
    id: 'box',
    name: 'تنفس المربع (4-4-4-4)',
    desc: 'للتركيز وتهدئة القلق الفوري',
    phases: [
      { label: 'شهيق', duration: 4, scale: 1.35, color: '#6ee7b7' },
      { label: 'احتفظ', duration: 4, scale: 1.35, color: '#7dd3fc' },
      { label: 'زفير', duration: 4, scale: 1.0, color: '#a78bfa' },
      { label: 'استرح', duration: 4, scale: 1.0, color: '#94a3b8' },
    ]
  },
  {
    id: 'relax',
    name: 'استرخاء عميق (4-7-8)',
    desc: 'لتفريغ التوتر والمساعدة على النوم',
    phases: [
      { label: 'شهيق', duration: 4, scale: 1.35, color: '#6ee7b7' },
      { label: 'احتفظ', duration: 7, scale: 1.35, color: '#fcd34d' },
      { label: 'زفير', duration: 8, scale: 1.0, color: '#a78bfa' },
    ]
  },
  {
    id: 'calm',
    name: 'توازن وهدوء (5-5)',
    desc: 'لتنظيم ضربات القلب والتوازن النفسي',
    phases: [
      { label: 'شهيق', duration: 5, scale: 1.35, color: '#6ee7b7' },
      { label: 'زفير', duration: 5, scale: 1.0, color: '#7dd3fc' },
    ]
  }
];

function playBellSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(528, ctx.currentTime) // 528Hz love/miracle frequency
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.2)
  } catch (e) {}
}

export default function BreathSync({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const [activePatternIndex, setActivePatternIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(PATTERNS[0].phases[0].duration)
  const [rounds, setRounds] = useState(0)
  const [done, setDone] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const timerRef = useRef(null)
  const currentPattern = PATTERNS[activePatternIndex]
  const currentPhase = currentPattern.phases[phaseIndex]

  function start() {
    setRunning(true)
    setPhaseIndex(0)
    setSeconds(currentPattern.phases[0].duration)
    setDone(false)
    if (soundEnabled) playBellSound()
  }

  function pause() {
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function reset() {
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setPhaseIndex(0)
    setSeconds(currentPattern.phases[0].duration)
    setRounds(0)
    setDone(false)
  }

  useEffect(() => {
    if (!running) return

    timerRef.current = setInterval(() => {
      setSeconds(prevSec => {
        if (prevSec <= 1) {
          // Switch phase
          const nextP = (phaseIndex + 1) % currentPattern.phases.length
          setPhaseIndex(nextP)
          if (soundEnabled) playBellSound()

          if (nextP === 0) {
            setRounds(r => {
              const newR = r + 1
              if (newR >= 3) {
                setRunning(false)
                setDone(true)
                addXP(20, 'breathing')
                recordExerciseSession('breathing', 120, 20, `جلسة ${currentPattern.name} مكتملة`)
                onXPEarned?.(20)
              }
              return newR
            })
          }
          return currentPattern.phases[nextP].duration
        }
        return prevSec - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [running, phaseIndex, currentPattern, soundEnabled, addXP, onXPEarned, recordExerciseSession])

  const handlePatternChange = (idx) => {
    reset()
    setActivePatternIndex(idx)
    setSeconds(PATTERNS[idx].phases[0].duration)
  }

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 flex flex-col items-center space-y-6">
      <div className="text-center">
        <h3 className="font-bold text-xl text-white mb-1">🌬️ Breathe-Sync (مزامنة التنفس)</h3>
        <p className="text-xs text-[var(--muted)]">اتبع الدائرة المتحركة: اتساع = شهيق، انكماش = زفير</p>
      </div>

      {/* Pattern Selector */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/5 max-w-full overflow-x-auto">
        {PATTERNS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => handlePatternChange(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activePatternIndex === idx
                ? 'bg-[#6ee7b7] text-[#0a0f1a] shadow-md'
                : 'text-[var(--subtle)] hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center my-4" style={{ width: 220, height: 220 }}>
        {/* Glow halo */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            background: `radial-gradient(circle, ${currentPhase.color}22, transparent)`
          }}
          animate={{
            scale: currentPhase.scale,
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: currentPhase.duration,
            ease: 'easeInOut'
          }}
        />

        {/* Core animated circle */}
        <motion.div
          className="absolute rounded-full flex flex-col items-center justify-center shadow-2xl"
          style={{
            width: 140,
            height: 140,
            background: `radial-gradient(circle at 35% 35%, ${currentPhase.color}, ${currentPhase.color}88)`,
            boxShadow: `0 0 40px ${currentPhase.color}55`
          }}
          animate={{ scale: currentPhase.scale }}
          transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
        >
          <p className="text-3xl font-black text-[#0a0f1a]">{seconds}</p>
          <p className="text-xs font-bold text-[#0a0f1a] tracking-wide mt-0.5">{currentPhase.label}</p>
        </motion.div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-4">
        {currentPattern.phases.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === phaseIndex && running ? p.color : 'rgba(255,255,255,0.15)',
                transform: i === phaseIndex && running ? 'scale(1.4)' : 'scale(1)'
              }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: i === phaseIndex && running ? p.color : 'var(--muted)' }}
            >
              {p.label} ({p.duration}s)
            </span>
          </div>
        ))}
      </div>

      {/* Sound toggle & Rounds count */}
      <div className="flex items-center justify-between w-full max-w-xs text-xs text-[var(--muted)]">
        <button
          onClick={() => setSoundEnabled(s => !s)}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Volume2 size={14} className={soundEnabled ? 'text-[#6ee7b7]' : 'text-[var(--muted)]'} />
          <span>نغمة الإشعار: {soundEnabled ? 'مفعلة' : 'صامت'}</span>
        </button>
        <span>{rounds}/3 دورات مكتملة</span>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center w-full bg-[#6ee7b7]/10 border border-[#6ee7b7]/30"
        >
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#6ee7b7]" />
          <h4 className="font-bold text-[#6ee7b7] text-sm">ممتاز جداً! أكملت 3 دورات تنفس بنجاح</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">كسبت +20 XP وجسمك الآن في حالة هدوء واسترخاء 🌱</p>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {!running ? (
          <button onClick={start} className="btn-zen flex-1 py-3 font-bold flex items-center justify-center gap-2">
            <Play size={16} />
            <span>{done ? 'تكرار الجلسة' : 'بدء التنفس'}</span>
          </button>
        ) : (
          <button onClick={pause} className="btn-ghost flex-1 py-3 font-bold flex items-center justify-center gap-2">
            <Pause size={16} />
            <span>إيقاف مؤقت</span>
          </button>
        )}

        <button onClick={reset} className="btn-ghost px-4 py-3" title="إعادة ضبط">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}
