import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatternMatch from './PatternMatch'
import MemoryMatch from './games/MemoryMatch'
import FocusChallenge from './games/FocusChallenge'
import NumberPuzzle from './games/NumberPuzzle'
import ColorMatch from './games/ColorMatch'
import ReactionTest from './games/ReactionTest'

const GAMES = [
  { id: 'pattern', label: 'Pattern Match', icon: '🎮', color: '#6ee7b7', desc: 'حفظ تتابع الألوان' },
  { id: 'memory', label: 'Memory Cards', icon: '🃏', color: '#7dd3fc', desc: 'مطابقة أزواج البطاقات' },
  { id: 'focus', label: 'Focus Sprint', icon: '🎯', color: '#a78bfa', desc: 'سرعة الانتباه البصري' },
  { id: 'puzzle', label: 'Number Puzzle', icon: '🔢', color: '#fcd34d', desc: 'لغز ترتيب الأرقام' },
  { id: 'color', label: 'Color Match', icon: '🎨', color: '#fda4af', desc: 'تحدي تضارب الألوان' },
  { id: 'reaction', label: 'Reaction Test', icon: '⚡', color: '#34d399', desc: 'قياس سرعة رد الفعل' },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState('pattern')
  const [xpMsg, setXpMsg] = useState('')

  function handleXP(v) {
    setXpMsg(`+${v} XP 🎉 كسبت`)
    setTimeout(() => setXpMsg(''), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">الألعاب الذهنية لصفاء العقل</h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          تمارين وألعاب تفاعلية لتحفيز الذاكرة والتركيز وتشتيت الانتباه بعيداً عن التوتر والضغط.
        </p>
      </motion.div>

      <AnimatePresence>
        {xpMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-2 px-5 rounded-2xl mx-auto w-fit font-bold text-xs"
            style={{ background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.3)', color: '#6ee7b7' }}
          >
            {xpMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
        {GAMES.map(g => {
          const isActive = activeGame === g.id
          return (
            <motion.button
              key={g.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(g.id)}
              className="p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center"
              style={{
                background: isActive ? `${g.color}18` : 'rgba(22,28,45,0.7)',
                border: isActive ? `1.5px solid ${g.color}` : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isActive ? `0 0 20px ${g.color}22` : 'none'
              }}
            >
              <span className="text-2xl mb-1.5 block">{g.icon}</span>
              <span className="text-xs font-bold block" style={{ color: isActive ? g.color : 'var(--text)' }}>
                {g.label}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate max-w-full mt-0.5 hidden md:block">
                {g.desc}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Active Game Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeGame === 'pattern' && <PatternMatch onXPEarned={handleXP} />}
          {activeGame === 'memory' && <MemoryMatch onXPEarned={handleXP} />}
          {activeGame === 'focus' && <FocusChallenge onXPEarned={handleXP} />}
          {activeGame === 'puzzle' && <NumberPuzzle onXPEarned={handleXP} />}
          {activeGame === 'color' && <ColorMatch onXPEarned={handleXP} />}
          {activeGame === 'reaction' && <ReactionTest onXPEarned={handleXP} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
