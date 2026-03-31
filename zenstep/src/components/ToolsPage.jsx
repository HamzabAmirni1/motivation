import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BreathSync   from './BreathSync'
import CBTFlip      from './CBTFlip'
import Grounding541 from './Grounding541'

const TOOLS = [
  { id:'breath',    label:'Breathe-Sync',  icon:'💨', desc:'تنفس عميق لتهدي الأعصاب',          color:'#6ee7b7' },
  { id:'cbt',       label:'قلب الأفكار',   icon:'🧠', desc:'حول الأفكار السلبية لإيجابية',      color:'#a78bfa' },
  { id:'grounding', label:'5-4-3-2-1',     icon:'🌍', desc:'تمرين تأريض في لحظات القلق',         color:'#7dd3fc' },
]

export default function ToolsPage() {
  const [open, setOpen] = useState(null)
  const [xpMsg, setXpMsg] = useState('')

  function handleXP(v) {
    setXpMsg(`+${v} XP 🌟`)
    setTimeout(() => setXpMsg(''), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6 text-center">
        <h1 className="text-3xl font-black mb-1 gradient-text">أدوات الصحة النفسية</h1>
        <p style={{ color:'var(--muted)' }} className="text-sm">تقنيات مبنية على علم النفس — مجرّبة ومزيانة</p>
      </motion.div>

      <AnimatePresence>
        {xpMsg && (
          <motion.div initial={{ opacity:0, y:-10, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
            className="mb-4 text-center py-2 px-4 rounded-xl mx-auto w-fit"
            style={{ background:'rgba(110,231,183,0.15)', border:'1px solid rgba(110,231,183,0.3)', color:'#6ee7b7' }}>
            {xpMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TOOLS.map((t, i) => (
          <motion.button key={t.id} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setOpen(open === t.id ? null : t.id)}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
            className="glass p-4 rounded-2xl text-center transition-all duration-200"
            style={{
              border: open === t.id ? `1px solid ${t.color}55` : '1px solid rgba(255,255,255,0.06)',
              background: open === t.id ? `${t.color}11` : 'rgba(22,28,45,0.75)',
            }}>
            <span className="text-3xl block mb-2">{t.icon}</span>
            <p className="text-xs font-bold" style={{ color: open === t.id ? t.color : 'var(--text)' }}>{t.label}</p>
            <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>{t.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Tool panel */}
      <AnimatePresence mode="wait">
        {open === 'breath' && (
          <motion.div key="breath" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <BreathSync onXPEarned={handleXP} />
          </motion.div>
        )}
        {open === 'cbt' && (
          <motion.div key="cbt" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <CBTFlip onXPEarned={handleXP} />
          </motion.div>
        )}
        {open === 'grounding' && (
          <motion.div key="grounding" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <Grounding541 onXPEarned={handleXP} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
