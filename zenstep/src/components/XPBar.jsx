import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { calculateLevel, getXPProgress } from '../lib/gamification'

export default function XPBar() {
  const { profile } = useAuth()
  const xp      = profile?.xp || 0
  const lv      = calculateLevel(xp)
  const prog    = getXPProgress(xp)
  const streak  = profile?.streak_count || 0

  return (
    <div className="glass p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{lv.emoji}</span>
          <div>
            <p className="font-bold text-base" style={{ color:'var(--text)' }}>{lv.title}</p>
            <p className="text-xs" style={{ color:'var(--muted)' }}>المستوى {lv.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black gradient-text">{xp}</p>
            <p className="text-xs" style={{ color:'var(--muted)' }}>نقاط XP</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-xl">🔥</span>
              <p className="text-2xl font-black" style={{ color:'#fcd34d' }}>{streak}</p>
            </div>
            <p className="text-xs" style={{ color:'var(--muted)' }}>يوم متتابع</p>
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="relative">
        <div className="flex justify-between text-xs mb-1.5" style={{ color:'var(--muted)' }}>
          <span>{prog.current} XP</span>
          {prog.nextLevel
            ? <span>المستوى {prog.nextLevel.level}: {prog.total} XP</span>
            : <span>أقصى مستوى 🏆</span>
          }
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${prog.percent}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ background: 'linear-gradient(90deg, #6ee7b7, #a78bfa)' }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs font-semibold" style={{ color:'#6ee7b7' }}>{prog.percent}%</span>
        </div>
      </div>
    </div>
  )
}
