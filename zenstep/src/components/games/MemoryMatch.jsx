import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy, Clock, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const EMOJIS = ['🌸', '🌿', '🌊', '🌙', '⭐', '🌻', '🍃', '☀️'];

export default function MemoryMatch({ onXPEarned }) {
  const { addXP, recordGameScore } = useAuth()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [isWon, setIsWon] = useState(false)

  const initGame = () => {
    const pairEmojis = EMOJIS.slice(0, 6) // 6 pairs = 12 cards
    const deck = [...pairEmojis, ...pairEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTimer(0)
    setGameStarted(true)
    setIsWon(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    let interval
    if (gameStarted && !isWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, isWon])

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(prev => {
          const next = [...prev, first, second]
          if (next.length === cards.length) {
            setIsWon(true)
            const score = Math.max(10, 100 - moves * 2 - timer)
            addXP(20, 'game')
            recordGameScore('memory', score, 'normal')
            onXPEarned?.(20)
          }
          return next
        })
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🃏 لعبة مطابقة الذاكرة</span>
          </h3>
          <p className="text-xs text-[var(--muted)]">اعثر على أزواج البطاقات المتطابقة في أقل وقت وحركات</p>
        </div>

        <button onClick={initGame} className="btn-ghost p-2.5 rounded-xl text-xs flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>إعادة</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-between bg-black/20 p-3 rounded-2xl border border-white/5 text-center">
        <div className="flex-1">
          <p className="text-xl font-black gradient-text">{moves}</p>
          <p className="text-[10px] text-[var(--muted)]">الحركات</p>
        </div>
        <div className="flex-1">
          <p className="text-xl font-black text-[#fcd34d]">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] text-[var(--muted)]">الوقت</p>
        </div>
        <div className="flex-1">
          <p className="text-xl font-black text-[#a78bfa]">{matched.length / 2} / 6</p>
          <p className="text-[10px] text-[var(--muted)]">الأزواج</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx)
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(idx)}
              className="h-20 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all relative overflow-hidden"
              style={{
                background: isFlipped ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.04)',
                border: isFlipped ? '2px solid #6ee7b7' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isFlipped ? '0 0 15px rgba(110,231,183,0.2)' : 'none'
              }}
            >
              {isFlipped ? card.emoji : '🌿'}
            </motion.button>
          )
        })}
      </div>

      {isWon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30"
        >
          <Trophy size={32} className="mx-auto mb-1 text-[#fcd34d]" />
          <h4 className="font-bold text-[#6ee7b7] text-base">مبروك! أنهيت اللعبة بنجاح!</h4>
          <p className="text-xs text-[var(--muted)] mt-1">كسبت +20 XP لإتقانك مطابقة الذاكرة 🎉</p>
        </motion.div>
      )}
    </div>
  )
}
