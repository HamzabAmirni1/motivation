import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BreathSync from './BreathSync'
import CBTFlip from './CBTFlip'
import Grounding541 from './Grounding541'
import FocusMode from './tools/FocusMode'
import StressRelief from './tools/StressRelief'
import SleepRoutine from './tools/SleepRoutine'

const TOOLS = [
  { id: 'breath',    label: 'Breathe-Sync', icon: '🌬️', desc: 'تمارين تنفس عميق مهدئة', color: '#6ee7b7' },
  { id: 'grounding', label: '5-4-3-2-1',    icon: '🌍', desc: 'تمرين التأريض الحسي في لحظات القلق', color: '#7dd3fc' },
  { id: 'cbt',       label: 'قلب الأفكار',   icon: '🧠', desc: 'إعادة صياغة الأفكار السلبية بواقعية', color: '#a78bfa' },
  { id: 'focus',     label: 'Focus Mode',   icon: '🎯', desc: 'جلسات تركيز بومودورو مع أصوات خلفية', color: '#fcd34d' },
  { id: 'stress',    label: 'تفريغ التوتر', icon: '💆', desc: 'استرخاء العضلات التدريجي (PMR)', color: '#fda4af' },
  { id: 'sleep',     label: 'روتين النوم',  icon: '🌙', desc: 'طقوس الاستعداد لنوم هادئ ومريح', color: '#c084fc' },
];

export default function ToolsPage() {
  const [open, setOpen] = useState('breath')
  const [xpMsg, setXpMsg] = useState('')

  function handleXP(v) {
    setXpMsg(`+${v} XP 🌟 كسبت`)
    setTimeout(() => setXpMsg(''), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">أدوات العافية النفسية</h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          تمارين عملية وتقنيات مبنية على علم النفس لتنظيم الجهاز العصبي وصفاء الذهن.
        </p>
      </motion.div>

      <AnimatePresence>
        {xpMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-2 px-5 rounded-2xl mx-auto w-fit font-bold text-xs"
            style={{ background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.3)', color: '#6ee7b7' }}
          >
            {xpMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tools Grid Selector */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
        {TOOLS.map((t) => {
          const isActive = open === t.id
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(t.id)}
              className="p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center"
              style={{
                border: isActive ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.06)',
                background: isActive ? `${t.color}15` : 'rgba(22,28,45,0.7)',
                boxShadow: isActive ? `0 0 20px ${t.color}22` : 'none'
              }}
            >
              <span className="text-2xl mb-1.5 block">{t.icon}</span>
              <p className="text-xs font-bold block" style={{ color: isActive ? t.color : 'var(--text)' }}>
                {t.label}
              </p>
              <p className="text-[10px] text-[var(--muted)] truncate max-w-full mt-0.5 hidden md:block">
                {t.desc}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Tool Component View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={open}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {open === 'breath' && <BreathSync onXPEarned={handleXP} />}
          {open === 'grounding' && <Grounding541 onXPEarned={handleXP} />}
          {open === 'cbt' && <CBTFlip onXPEarned={handleXP} />}
          {open === 'focus' && <FocusMode onXPEarned={handleXP} />}
          {open === 'stress' && <StressRelief onXPEarned={handleXP} />}
          {open === 'sleep' && <SleepRoutine onXPEarned={handleXP} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
