import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getDailyQuests } from '../lib/quests'

const CAT_LABELS = {
  movement:    'حركة',
  mindfulness: 'ذهن',
  'self-care': 'عناية',
  social:      'اجتماعي',
  mental:      'عقل',
  creative:    'إبداع',
}

export default function DailyQuest({ onXP }) {
  const { getCompletedQuests, markQuestDone, addXP, updateStreak } = useAuth()
  const quests    = getDailyQuests()
  const completed = getCompletedQuests()
  const [justDone, setJustDone] = useState(null)

  const handleComplete = useCallback((quest) => {
    if (completed.includes(quest.id)) return
    markQuestDone(quest.id)
    addXP(quest.xp)
    updateStreak()
    setJustDone(quest.id)
    onXP?.(quest.xp)
    setTimeout(() => setJustDone(null), 2000)
  }, [completed, markQuestDone, addXP, updateStreak, onXP])

  const doneCount = quests.filter(q => completed.includes(q.id)).length
  const allDone   = doneCount === quests.length

  return (
    <div className="glass p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg" style={{ color:'var(--text)' }}>🎯 مهام اليوم</h2>
        <span className="chip">{doneCount}/{quests.length} كملتي</span>
      </div>

      {allDone && (
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="mb-4 p-4 rounded-xl text-center"
          style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.25)' }}>
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold" style={{ color:'#6ee7b7' }}>مزيان عليك! كملتي كل مهام اليوم</p>
          <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>رجع غدا على مهام جديدة</p>
        </motion.div>
      )}

      <div className="space-y-3">
        {quests.map((quest, i) => {
          const done = completed.includes(quest.id)
          return (
            <motion.div key={quest.id}
              initial={{ opacity:0, x:-16 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
              style={{
                background: done ? 'rgba(110,231,183,0.08)' : 'rgba(255,255,255,0.03)',
                border: done ? '1px solid rgba(110,231,183,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              <span className="text-2xl">{quest.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: done ? '#6ee7b7' : 'var(--text)' }}>{quest.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color:'var(--muted)' }}>{quest.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold cat-${quest.category}`}>
                    {CAT_LABELS[quest.category] || quest.category}
                  </span>
                  <span className="text-xs" style={{ color:'var(--muted)' }}>+{quest.xp} XP</span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {justDone === quest.id ? (
                  <motion.span key="pop" initial={{ scale:0 }} animate={{ scale:1.3 }} exit={{ scale:0 }} className="text-2xl">⭐</motion.span>
                ) : done ? (
                  <motion.div key="done" initial={{ scale:0 }} animate={{ scale:1 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background:'rgba(110,231,183,0.2)' }}>
                    <span className="text-sm">✓</span>
                  </motion.div>
                ) : (
                  <motion.button key="btn" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                    onClick={() => handleComplete(quest)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background:'linear-gradient(135deg,#6ee7b7,#34d399)', color:'#0a0f1a' }}>
                    كملت ✓
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
