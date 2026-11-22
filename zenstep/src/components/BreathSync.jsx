import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

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
  const { t } = useLanguage()

  const patterns = [
    {
      id: 'box',
      name: t('breath_box_name', 'تنفس المربع (4-4-4-4)'),
      desc: t('breath_box_desc', 'للتركيز وتهدئة القلق الفوري'),
      phases: [
        { label: t('breath_phase_inhale', 'شهيق'), duration: 4, scale: 1.35, color: '#6ee7b7' },
        { label: t('breath_phase_hold', 'احتفظ'), duration: 4, scale: 1.35, color: '#7dd3fc' },
        { label: t('breath_phase_exhale', 'زفير'), duration: 4, scale: 1.0, color: '#a78bfa' },
        { label: t('breath_phase_rest', 'استرح'), duration: 4, scale: 1.0, color: '#94a3b8' },
      ]
    },
    {
      id: 'relax',
      name: t('breath_relax_name', 'استرخاء عميق (4-7-8)'),
      desc: t('breath_relax_desc', 'لتفريغ التوتر والمساعدة على النوم'),
      phases: [
        { label: t('breath_phase_inhale', 'شهيق'), duration: 4, scale: 1.35, color: '#6ee7b7' },
        { label: t('breath_phase_hold', 'احتفظ'), duration: 7, scale: 1.35, color: '#fcd34d' },
        { label: t('breath_phase_exhale', 'زفير'), duration: 8, scale: 1.0, color: '#a78bfa' },
      ]
    },
    {
      id: 'calm',
      name: t('breath_calm_name', 'توازن وهدوء (5-5)'),
      desc: t('breath_calm_desc', 'لتنظيم ضربات القلب والتوازن النفسي'),
      phases: [
        { label: t('breath_phase_inhale', 'شهيق'), duration: 5, scale: 1.35, color: '#6ee7b7' },
        { label: t('breath_phase_exhale', 'زفير'), duration: 5, scale: 1.0, color: '#7dd3fc' },
      ]
    }
  ]

  const [activePatternIndex, setActivePatternIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(patterns[0].phases[0].duration)
  const [rounds, setRounds] = useState(0)
  const [done, setDone] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const timerRef = useRef(null)
  const currentPattern = patterns[activePatternIndex]
  const currentPhase = currentPattern.phases[phaseIndex] || currentPattern.phases[0]

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

          // If completed one full round
          if (nextP === 0) {
            setRounds(r => {
              const newR = r + 1
              if (newR >= 3) {
                setDone(true)
                setRunning(false)
                clearInterval(timerRef.current)
                addXP(20, 'breathing')
                recordExerciseSession('breathing', 120, 20, `${currentPattern.name} - 3 rounds`)
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
    setSeconds(patterns[idx].phases[0].duration)
  }

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 flex flex-col items-center space-y-6">
      <div className="text-center">
        <h3 className="font-bold text-xl text-white mb-1">{t('breath_title', '🌬️ Breathe-Sync (مزامنة التنفس)')}</h3>
        <p className="text-xs text-[var(--muted)]">{t('breath_subtitle', 'اتبع الدائرة المتحركة: اتساع = شهيق، انكماش = زفير')}</p>
      </div>

      {/* Pattern Selector */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/5 max-w-full overflow-x-auto">
        {patterns.map((p, idx) => (
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
      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
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
          <span>{t('breath_bell_sound', 'نغمة الإشعار')}: {soundEnabled ? t('breath_sound_active', 'مفعلة') : t('breath_sound_muted', 'صامت')}</span>
        </button>
        <span>{rounds}/3 {t('breath_cycles_done', 'دورات مكتملة')}</span>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center w-full bg-[#6ee7b7]/10 border border-[#6ee7b7]/30"
        >
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#6ee7b7]" />
          <h4 className="font-bold text-[#6ee7b7] text-sm">{t('breath_done_title', 'ممتاز جداً! أكملت 3 دورات تنفس بنجاح')}</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">{t('breath_done_sub', 'كسبت +20 XP وجسمك الآن في حالة هدوء واسترخاء 🌱')}</p>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {!running ? (
          <button onClick={start} className="btn-zen flex-1 py-3 font-bold flex items-center justify-center gap-2">
            <Play size={16} />
            <span>{done ? t('breath_restart', 'تكرار الجلسة') : t('breath_start', 'بدء التنفس')}</span>
          </button>
        ) : (
          <button onClick={pause} className="btn-ghost flex-1 py-3 font-bold flex items-center justify-center gap-2">
            <Pause size={16} />
            <span>{t('breath_pause', 'إيقاف مؤقت')}</span>
          </button>
        )}

        <button onClick={reset} className="btn-ghost px-4 py-3" title={t('breath_reset', 'إعادة ضبط')}>
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}
