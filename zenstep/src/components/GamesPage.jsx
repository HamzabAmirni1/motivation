import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatternMatch from './PatternMatch'

export default function GamesPage() {
  const [xpMsg, setXpMsg] = useState('')

  function handleXP(v) {
    setXpMsg(`+${v} XP 🎉`)
    setTimeout(() => setXpMsg(''), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6 text-center">
        <h1 className="text-3xl font-black mb-1 gradient-text">الألعاب الذهنية</h1>
        <p style={{ color:'var(--muted)' }} className="text-sm">شد انتباهك بعيدًا عن الأفكار السلبية</p>
      </motion.div>

      <AnimatePresence>
        {xpMsg && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="mb-4 text-center py-2 px-4 rounded-xl mx-auto w-fit"
            style={{ background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.3)', color:'#a78bfa' }}>
            {xpMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <PatternMatch onXPEarned={handleXP} />
      </motion.div>

      {/* Coming soon */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
        className="glass mt-5 p-6 text-center" style={{ opacity:0.6 }}>
        <p className="text-3xl mb-2">🧩</p>
        <p className="font-bold" style={{ color:'var(--subtle)' }}>ألعاب جديدة قريبًا...</p>
        <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>Zen Puzzle · Word Flow · Focus Timer</p>
      </motion.div>
    </div>
  )
}
