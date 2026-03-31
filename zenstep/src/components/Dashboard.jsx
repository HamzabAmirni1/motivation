import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import XPBar      from './XPBar'
import DailyQuest from './DailyQuest'
import MoodLog    from './MoodLog'
import GrowthTree from './GrowthTree'

export default function Dashboard() {
  const { profile } = useAuth()
  const hour  = new Date().getHours()
  const greet = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header greeting */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="mb-6 text-center">
        <p className="text-3xl font-black mb-1">
          {greet}، <span className="gradient-text">{profile?.username || 'صاحبي'}</span> 👋
        </p>
        <p style={{ color:'var(--muted)' }} className="text-sm">
          راك قادر — خطوة صغيرة اليوم تصنع فرقًا كبيرًا غدًا 💚
        </p>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <XPBar />
      </motion.div>

      {/* Two-column on md+ */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <DailyQuest />
          </motion.div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
            <MoodLog />
          </motion.div>
        </div>
        <div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
            <GrowthTree />
          </motion.div>
          {/* Quick tip */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
            className="glass p-4 text-center">
            <p className="text-2xl mb-2">💡</p>
            <p className="text-sm font-semibold mb-1" style={{ color:'var(--subtle)' }}>نصيحة اليوم</p>
            <p className="text-xs leading-relaxed" style={{ color:'var(--muted)' }}>
              "ما كاين حتى واحد فاشل — كاين غير واحد توقف. خد خطوة صغيرة اليوم."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
