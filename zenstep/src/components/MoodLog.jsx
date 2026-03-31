import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const MOODS = [
  { score:1, label:'كارطة',    emoji:'😞', color:'#f87171' },
  { score:2, label:'مش مزيان', emoji:'😔', color:'#fbbf24' },
  { score:3, label:'عادي',     emoji:'😐', color:'#94a3b8' },
  { score:4, label:'مزيان',    emoji:'😊', color:'#6ee7b7' },
  { score:5, label:'رائع!',    emoji:'🤩', color:'#a78bfa' },
]

export default function MoodLog() {
  const { getMoodLogs, addMoodLog, addXP } = useAuth()
  const [selected, setSelected]  = useState(null)
  const [note,     setNote]      = useState('')
  const [saved,    setSaved]     = useState(false)
  const logs = getMoodLogs().slice(0, 5)

  const today = new Date().toISOString().split('T')[0]
  const todayLogged = logs.some(l => l.date.startsWith(today))

  function handleSave() {
    if (!selected) return
    addMoodLog(selected.score, selected.label, note)
    addXP(5)
    setSaved(true)
    setNote('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="glass p-5 mb-5">
      <h2 className="font-bold text-lg mb-4" style={{ color:'var(--text)' }}>💫 كيف داير هاد النهار؟</h2>

      {todayLogged && !saved ? (
        <div className="p-3 rounded-xl text-center mb-4" style={{ background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.15)' }}>
          <p className="text-sm" style={{ color:'#6ee7b7' }}>سجلتي حالتك اليوم ✓  رجع غدا!</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between gap-2 mb-4">
            {MOODS.map(m => (
              <motion.button key={m.score} whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
                onClick={() => setSelected(m)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: selected?.score === m.score ? `rgba(${hexToRgb(m.color)},0.15)` : 'rgba(255,255,255,0.03)',
                  border: selected?.score === m.score ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.06)',
                }}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-medium" style={{ color: selected?.score === m.score ? m.color : 'var(--muted)' }}>{m.label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                <textarea className="zen-input resize-none mb-3" rows={2}
                  placeholder="شي ملاحظة؟ (اختياري)" value={note} onChange={e => setNote(e.target.value)} />
                <motion.button whileTap={{ scale:0.97 }} onClick={handleSave} className="btn-zen w-full text-sm">
                  {saved ? '✓ تسجيل' : 'سجل الحالة +5 XP'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Recent mood log */}
      {logs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>السجل الأخير</p>
          <div className="flex gap-2 flex-wrap">
            {logs.slice(0, 7).map((l, i) => {
              const m = MOODS.find(x => x.score === l.score) || MOODS[2]
              return (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <span>{m.emoji}</span>
                  <span style={{ color:'var(--muted)' }}>{new Date(l.date).toLocaleDateString('ar-MA',{month:'short',day:'numeric'})}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
