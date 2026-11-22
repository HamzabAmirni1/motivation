import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function NumberPuzzle({ onXPEarned }) {
  const { addXP, recordGameScore } = useAuth()
  const [board, setBoard] = useState([1, 2, 3, 4, 5, 6, 7, 8, null])
  const [moves, setMoves] = useState(0)
  const [isWon, setIsWon] = useState(false)

  const shuffle = () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, null]
    // Perform 30 random valid moves to guarantee solvability
    for (let k = 0; k < 40; k++) {
      const emptyIdx = arr.indexOf(null)
      const valid = []
      const row = Math.floor(emptyIdx / 3)
      const col = emptyIdx % 3
      if (row > 0) valid.push(emptyIdx - 3)
      if (row < 2) valid.push(emptyIdx + 3)
      if (col > 0) valid.push(emptyIdx - 1)
      if (col < 2) valid.push(emptyIdx + 1)
      const pick = valid[Math.floor(Math.random() * valid.length)]
      arr[emptyIdx] = arr[pick]
      arr[pick] = null
    }
    setBoard(arr)
    setMoves(0)
    setIsWon(false)
  }

  useEffect(() => {
    shuffle()
  }, [])

  const moveTile = (index) => {
    if (isWon) return
    const emptyIdx = board.indexOf(null)
    const row = Math.floor(index / 3)
    const col = index % 3
    const emptyRow = Math.floor(emptyIdx / 3)
    const emptyCol = emptyIdx % 3

    const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1
    if (isAdjacent) {
      const newBoard = [...board]
      newBoard[emptyIdx] = newBoard[index]
      newBoard[index] = null
      setBoard(newBoard)
      setMoves(m => m + 1)

      // Check win
      const won = newBoard.slice(0, 8).every((val, i) => val === i + 1)
      if (won) {
        setIsWon(true)
        addXP(25, 'game')
        recordGameScore('number_puzzle', 100, 'normal')
        onXPEarned?.(25)
      }
    }
  }

  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🔢 لغز ترتيب الأرقام (1 - 8)</span>
          </h3>
          <p className="text-xs text-[var(--muted)]">رتب الأرقام بالتسلسل بالضغط على الرقم المجاور للمربع الفارغ</p>
        </div>

        <button onClick={shuffle} className="btn-ghost p-2.5 rounded-xl text-xs flex items-center gap-1.5">
          <RotateCcw size={14} />
          <span>إعادة الخلط</span>
        </button>
      </div>

      <div className="flex justify-between items-center bg-black/20 px-4 py-2 rounded-xl text-xs font-bold text-[var(--subtle)]">
        <span>عدد الحركات: <strong className="text-[#6ee7b7]">{moves}</strong></span>
        <span>الهدف: 1 2 3 4 5 6 7 8</span>
      </div>

      {/* 3x3 Board */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {board.map((tile, idx) => (
          <motion.button
            key={idx}
            whileTap={tile ? { scale: 0.94 } : {}}
            onClick={() => tile && moveTile(idx)}
            className={`h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
              tile
                ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white shadow-md hover:border-[#6ee7b7]/40 cursor-pointer'
                : 'bg-transparent border border-dashed border-white/5 cursor-default'
            }`}
          >
            {tile}
          </motion.button>
        ))}
      </div>

      {isWon && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30">
          <Trophy size={28} className="mx-auto mb-1 text-[#fcd34d]" />
          <h4 className="font-bold text-[#6ee7b7] text-base">رائع جداً! حللت اللغز في {moves} حركة!</h4>
          <p className="text-xs text-[var(--muted)] mt-1">كسبت +25 XP لتفكيرك المنطقي 🌟</p>
        </motion.div>
      )}
    </div>
  )
}
