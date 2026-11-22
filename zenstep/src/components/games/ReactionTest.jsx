import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Zap, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ReactionTest({ onXPEarned }) {
  const { addXP, recordGameScore } = useAuth()
  const [state, setState] = useState('idle') // 'idle' | 'waiting' | 'ready' | 'result' | 'early'
  const [reactionTime, setReactionTime] = useState(null)
  const [bestTime, setBestTime] = useState(() => {
    return Number(localStorage.getItem('zs_best_reaction')) || null
  })

  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const startTest = () => {
    setState('waiting')
    setReactionTime(null)
    const delay = Math.floor(Math.random() * 3000) + 1500 // 1.5s to 4.5s
    timerRef.current = setTimeout(() => {
      setState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timerRef.current)
      setState('early')
    } else if (state === 'ready') {
      const elapsed = Date.now() - startTimeRef.current
      setReactionTime(elapsed)
      setState('result')
      
      const newBest = bestTime ? Math.min(bestTime, elapsed) : elapsed
      setBestTime(newBest)
      localStorage.setItem('zs_best_reaction', newBest.toString())

      addXP(15, 'game')
      recordGameScore('reaction', Math.max(10, 1000 - elapsed), 'normal')
      onXPEarned?.(15)
    }
  }

  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚡ اختبار سرعة رد الفعل</span>
          </h3>
          <p className="text-xs text-[var(--muted)]">عندما يتحول المربع للأخضر، اضغط بأقصى سرعة ممكنة</p>
        </div>

        {bestTime && (
          <div className="px-3 py-1.5 rounded-xl bg-white/5 text-xs font-bold text-[#fcd34d] flex items-center gap-1.5 border border-white/5">
            <Trophy size={14} />
            <span>الأفضل: {bestTime} ms</span>
          </div>
        )}
      </div>

      {/* Main Click Box */}
      <div
        onClick={state === 'waiting' || state === 'ready' ? handleClick : undefined}
        className="h-56 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors shadow-inner select-none"
        style={{
          background:
            state === 'waiting' ? '#f59e0b22' :
            state === 'ready' ? '#10b981' :
            state === 'early' ? '#ef444422' :
            state === 'result' ? '#6ee7b722' : 'rgba(255,255,255,0.03)',
          border:
            state === 'waiting' ? '2px solid #f59e0b' :
            state === 'ready' ? '2px solid #10b981' :
            state === 'early' ? '2px solid #ef4444' :
            state === 'result' ? '2px solid #6ee7b7' : '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {state === 'idle' && (
          <div>
            <Zap size={36} className="mx-auto mb-2 text-[#7dd3fc]" />
            <p className="font-bold text-base text-white">اضغط للبدء</p>
            <p className="text-xs text-[var(--muted)] mt-1">انتظر اللون الأخضر ولا تضغط قبله!</p>
          </div>
        )}

        {state === 'waiting' && (
          <div>
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] animate-ping mx-auto mb-3" />
            <p className="font-bold text-lg text-[#fcd34d]">استعد...</p>
            <p className="text-xs text-[#fcd34d]/80 mt-1">لا تضغط بعد!</p>
          </div>
        )}

        {state === 'ready' && (
          <div>
            <p className="font-black text-4xl text-black">اضغط الآن!</p>
          </div>
        )}

        {state === 'early' && (
          <div>
            <p className="font-bold text-lg text-red-400">تسرعت! ضغطت قبل الوقت 😅</p>
            <p className="text-xs text-[var(--muted)] mt-1">اضغط بالأسفل للمحاولة مجدداً</p>
          </div>
        )}

        {state === 'result' && (
          <div>
            <p className="text-5xl font-black text-[#6ee7b7] mb-1">{reactionTime} ms</p>
            <p className="text-xs text-[var(--subtle)]">
              {reactionTime < 250 ? '⚡ سرعة خارقة!' : reactionTime < 350 ? '👏 سرعة ممتازة!' : '👍 أداء جيد، كرر التمرين'}
            </p>
            <p className="text-[10px] text-[#6ee7b7] font-bold mt-2">+15 XP كسبت</p>
          </div>
        )}
      </div>

      {state !== 'waiting' && state !== 'ready' && (
        <button onClick={startTest} className="btn-zen w-full py-3.5 font-bold text-sm">
          {state === 'idle' ? 'ابدأ الاختبار' : 'محاولة جديدة'}
        </button>
      )}
    </div>
  )
}
