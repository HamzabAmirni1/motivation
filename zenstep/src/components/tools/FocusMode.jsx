import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { playSound, stopCurrentSound } from '../../services/soundEngine'

export default function FocusMode({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const [durationMinutes, setDurationMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [ambientSound, setAmbientSound] = useState('none') // 'rain', 'drone', 'none'

  const timerRef = useRef(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current)
      setIsRunning(false)
      stopCurrentSound()

      if (!isBreak) {
        setCompletedSessions(c => c + 1)
        addXP(25, 'focus')
        recordExerciseSession('focus', durationMinutes * 60, 25, 'جلسة تركيز بومودورو مكتملة')
        onXPEarned?.(25)
        // Switch to break
        setIsBreak(true)
        setTimeLeft(5 * 60)
      } else {
        setIsBreak(false)
        setTimeLeft(durationMinutes * 60)
      }
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning, timeLeft, isBreak, durationMinutes])

  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true)
      if (ambientSound !== 'none') {
        playSound(ambientSound, 0.4)
      }
    } else {
      setIsRunning(false)
      stopCurrentSound()
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    stopCurrentSound()
    setIsBreak(false)
    setTimeLeft(durationMinutes * 60)
  }

  const handleSoundChange = (soundId) => {
    setAmbientSound(soundId)
    if (isRunning) {
      if (soundId === 'none') stopCurrentSound()
      else playSound(soundId, 0.4)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progressPct = (( (isBreak ? 5 * 60 : durationMinutes * 60) - timeLeft) / (isBreak ? 5 * 60 : durationMinutes * 60)) * 100

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6 text-center">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Sparkles size={14} /> Focus Mode (تقنية بومودورو)
        </div>
        <h3 className="text-xl font-bold text-white">
          {isBreak ? '☕ وقت استراحة قصيرة' : '🎯 جلسة تركيز عميق'}
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          {isBreak ? 'قم بتمارين تمدد خفيفة، اشرب ماء، وأرح عينيك' : 'تخلص من المشتتات وركز على مهمة واحدة محددة'}
        </p>
      </div>

      {/* Circular Animated Progress */}
      <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="90"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="112"
            cy="112"
            r="90"
            stroke={isBreak ? '#a78bfa' : '#6ee7b7'}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progressPct / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-black gradient-text">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
          <span className="text-xs text-[var(--muted)] mt-1 font-semibold">
            {isBreak ? 'استراحة' : 'تركيز'}
          </span>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      {!isRunning && !isBreak && (
        <div className="flex justify-center gap-2">
          {[15, 25, 45].map(m => (
            <button
              key={m}
              onClick={() => {
                setDurationMinutes(m)
                setTimeLeft(m * 60)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                durationMinutes === m ? 'bg-[#6ee7b7] text-black shadow-md' : 'glass text-[var(--subtle)]'
              }`}
            >
              {m} دقيقة
            </button>
          ))}
        </div>
      )}

      {/* Ambient Sound Selector */}
      <div className="flex items-center justify-center gap-2 text-xs text-[var(--subtle)]">
        <Volume2 size={16} className="text-[#6ee7b7]" />
        <span>صوت التركيز الخلفي:</span>
        <select
          value={ambientSound}
          onChange={e => handleSoundChange(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-xl px-2 py-1 text-xs text-white outline-none"
        >
          <option value="none">بدون صوت</option>
          <option value="rain">صوت المطر 🌧️</option>
          <option value="drone">تأمل زن 🎵</option>
        </select>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className="btn-zen px-8 py-3.5 font-bold flex items-center gap-2 shadow-xl"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'إيقاف مؤقت' : 'بدء الجلسة'}</span>
        </button>

        <button onClick={resetTimer} className="btn-ghost px-5 py-3.5 flex items-center gap-1.5 text-xs">
          <RotateCcw size={16} />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {completedSessions > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6ee7b7] bg-[#6ee7b7]/10 px-4 py-2 rounded-xl">
          <CheckCircle2 size={16} />
          <span>أنجزت {completedSessions} جلسات تركيز اليوم! (+{completedSessions * 25} XP)</span>
        </div>
      )}
    </div>
  )
}
