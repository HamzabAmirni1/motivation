import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Zap, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function FocusChallenge({ onXPEarned }) {
  const { addXP, recordGameScore } = useAuth()
  const [targetNumber, setTargetNumber] = useState(1)
  const [numbers, setNumbers] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const generateRound = (nextTarget) => {
    const list = []
    list.push(nextTarget)
    while (list.length < 9) {
      const rand = Math.floor(Math.random() * 50) + 1
      if (!list.includes(rand)) list.push(rand)
    }
    setNumbers(list.sort(() => Math.random() - 0.5))
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setTargetNumber(1)
    generateRound(1)
    setIsPlaying(true)
    setIsGameOver(false)
  }

  useEffect(() => {
    let timer
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      setIsGameOver(true)
      const earnedXP = Math.max(10, score * 3)
      addXP(earnedXP, 'game')
      recordGameScore('focus', score, 'normal')
      onXPEarned?.(earnedXP)
    }
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  const handleClick = (num) => {
    if (!isPlaying) return
    if (num === targetNumber) {
      const next = targetNumber + 1
      setScore(s => s + 1)
      setTargetNumber(next)
      generateRound(next)
    }
  }

  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯 تحدي سرعة التركيز</span>
          </h3>
          <p className="text-xs text-[var(--muted)]">ابحث عن الرقم المستهدف واضغط عليه بأقصى سرعة ممكنة</p>
        </div>

        <button onClick={startGame} className="btn-ghost p-2.5 rounded-xl text-xs flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>{isPlaying ? 'إعادة' : 'بدء اللعب'}</span>
        </button>
      </div>

      {/* Target & Timer */}
      <div className="flex gap-4 justify-between bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
        <div className="flex-1">
          <p className="text-xs text-[var(--muted)] mb-1">الرقم المطلوب</p>
          <div className="text-3xl font-black text-[#6ee7b7] animate-pulse">
            {isPlaying ? targetNumber : '-'}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--muted)] mb-1">الوقت المتبقي</p>
          <p className="text-3xl font-black text-[#fcd34d]">{timeLeft}s</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--muted)] mb-1">النقاط</p>
          <p className="text-3xl font-black text-[#a78bfa]">{score}</p>
        </div>
      </div>

      {/* 3x3 Numbers Grid */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleClick(num)}
            disabled={!isPlaying}
            className="h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all bg-white/[0.03] border border-white/10 hover:border-[#6ee7b7]/40 active:bg-[#6ee7b7]/20"
          >
            {isPlaying ? num : '?'}
          </motion.button>
        ))}
      </div>

      {!isPlaying && !isGameOver && (
        <button onClick={startGame} className="btn-zen w-full py-3.5 font-bold text-sm">
          ابدأ التحدي الآن
        </button>
      )}

      {isGameOver && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl text-center bg-[#a78bfa]/10 border border-[#a78bfa]/30">
          <Trophy size={28} className="mx-auto mb-1 text-[#fcd34d]" />
          <h4 className="font-bold text-white text-base">انتهى الوقت! مجموع نقاطك: {score}</h4>
          <p className="text-xs text-[var(--muted)] mt-1">كسبت +{Math.max(10, score * 3)} XP لسرعة انتباهك ⚡</p>
        </motion.div>
      )}
    </div>
  )
}
