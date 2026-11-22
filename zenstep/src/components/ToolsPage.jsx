import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import BreathSync from './BreathSync'
import CBTFlip from './CBTFlip'
import Grounding541 from './Grounding541'
import FocusMode from './tools/FocusMode'
import StressRelief from './tools/StressRelief'
import SleepRoutine from './tools/SleepRoutine'

export default function ToolsPage() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(() => localStorage.getItem('zs_active_tool') || 'breath')
  const [xpMsg, setXpMsg] = useState('')

  useEffect(() => {
    localStorage.setItem('zs_active_tool', open)
  }, [open])

  const tools = [
    { id: 'breath',    label: t('tool_breath_title', 'Breathe-Sync'), icon: '🌬️', desc: t('tool_breath_desc'), color: '#6ee7b7' },
    { id: 'grounding', label: t('tool_grounding_title', '5-4-3-2-1'), icon: '🌍', desc: t('tool_grounding_desc'), color: '#7dd3fc' },
    { id: 'cbt',       label: t('tool_cbt_title', 'CBT Flip'),        icon: '🧠', desc: t('tool_cbt_desc'), color: '#a78bfa' },
    { id: 'focus',     label: t('tool_focus_title', 'Focus Mode'),    icon: '🎯', desc: t('tool_focus_desc'), color: '#fcd34d' },
    { id: 'stress',    label: t('tool_stress_title', 'PMR'),          icon: '💆', desc: t('tool_stress_desc'), color: '#fda4af' },
    { id: 'sleep',     label: t('tool_sleep_title', 'Sleep Routine'), icon: '🌙', desc: t('tool_sleep_desc'), color: '#c084fc' },
  ]

  function handleXP(v) {
    setXpMsg(`+${v} XP 🌟`)
    setTimeout(() => setXpMsg(''), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">{t('tools_title', 'أدوات العافية النفسية')}</h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          {t('tools_subtitle', 'تمارين عملية وتقنيات مبنية على علم النفس لتنظيم الجهاز العصبي وصفاء الذهن.')}
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
        {tools.map((tItem) => {
          const isActive = open === tItem.id
          return (
            <motion.button
              key={tItem.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(tItem.id)}
              className="p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center"
              style={{
                border: isActive ? `1.5px solid ${tItem.color}` : '1px solid rgba(255,255,255,0.06)',
                background: isActive ? `${tItem.color}15` : 'rgba(22,28,45,0.7)',
                boxShadow: isActive ? `0 0 20px ${tItem.color}22` : 'none'
              }}
            >
              <span className="text-2xl mb-1.5 block">{tItem.icon}</span>
              <p className="text-xs font-bold block" style={{ color: isActive ? tItem.color : 'var(--text)' }}>
                {tItem.label}
              </p>
              <p className="text-[10px] text-[var(--muted)] truncate max-w-full mt-0.5 hidden md:block">
                {tItem.desc}
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
