import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const COLORS = [
  { name: 'أحمر', color: '#f87171' },
  { name: 'أخضر', color: '#6ee7b7' },
  { name: 'أزرق', color: '#7dd3fc' },
  { name: 'أصفر', color: '#fcd34d' },
  { name: 'بنفسجي', color: '#a78bfa' },
];

export default function ColorMatch({ onXPEarned }) {
  const { addXP, recordGameScore } = useAuth()
  const [currentText, setCurrentText] = useState(COLORS[0])
  const [currentColor, setCurrentColor] = useState(COLORS[1])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(25)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const nextQuestion = () => {
    const isMatch = Math.random() > 0.5
    const textObj = COLORS[Math.floor(Math.random() * COLORS.length)]
    let colorObj
    if (isMatch) {
      colorObj = textObj
    } else {
      const others = COLORS.filter(c => c.name !== textObj.name)
      colorObj = others[Math.floor(Math.random() * others.length)]
    }
    setCurrentText(textObj)
    setCurrentColor(colorObj)
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(25)
    setIsPlaying(true)
    setIsGameOver(false)
    nextQuestion()
  }

  useEffect(() => {
    let t
    if (isPlaying && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      setIsGameOver(true)
      const earnedXP = Math.max(10, score * 2)
      addXP(earnedXP, 'game')
      recordGameScore('color_match', score, 'normal')
      onXPEarned?.(earnedXP)
    }
    return () => clearInterval(t)
  }, [isPlaying, timeLeft])

  const handleAnswer = (userSaysMatch) => {
    if (!isPlaying) return
    const actualMatch = currentText.name === currentColor.name
    if (userSaysMatch === actualMatch) {
      setScore(s => s + 1)
    } else {
      setScore(s => Math.max(0, s - 1))
    }
    nextQuestion()
  }

  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎨 تحدي الألوان (Stroop Challenge)</span>
          </h3>
          <p className="text-xs text-[var(--muted)]">هل معنى الكلمة يطابق لون الخط الذي كتبت به؟</p>
        </div>

        <button onClick={startGame} className="btn-ghost p-2.5 rounded-xl text-xs flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>{isPlaying ? 'إعادة' : 'بدء'}</span>
        </button>
      </div>

      <div className="flex justify-between bg-black/20 p-3 rounded-xl text-center">
        <div className="flex-1">
          <p className="text-xs text-[var(--muted)]">الوقت</p>
          <p className="text-2xl font-black text-[#fcd34d]">{timeLeft}s</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--muted)]">النقاط</p>
          <p className="text-2xl font-black text-[#6ee7b7]">{score}</p>
        </div>
      </div>

      {/* Target Word */}
      <div className="h-40 rounded-3xl bg-black/30 border border-white/10 flex items-center justify-center">
        {isPlaying ? (
          <motion.span
            key={currentText.name + currentColor.name}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black"
            style={{ color: currentColor.color }}
          >
            {currentText.name}
          </motion.span>
        ) : (
          <span className="text-sm text-[var(--muted)]">اضغط ابدأ لبدء التحدي</span>
        )}
      </div>

      {/* Decision Buttons */}
      {isPlaying ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            className="py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-lg hover:bg-emerald-500/30 active:scale-95 transition-all"
          >
            ✓ يطابق
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="py-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-lg hover:bg-rose-500/30 active:scale-95 transition-all"
          >
            ✕ لا يطابق
          </button>
        </div>
      ) : (
        <button onClick={startGame} className="btn-zen w-full py-3.5 font-bold text-sm">
          ابدأ التحدي
        </button>
      )}

      {isGameOver && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30">
          <Trophy size={28} className="mx-auto mb-1 text-[#fcd34d]" />
          <h4 className="font-bold text-[#6ee7b7] text-base">أحسنت! نتيجتك: {score} نقطة</h4>
          <p className="text-xs text-[var(--muted)] mt-1">كسبت +{Math.max(10, score * 2)} XP 🧠</p>
        </motion.div>
      )}
    </div>
  )
}
