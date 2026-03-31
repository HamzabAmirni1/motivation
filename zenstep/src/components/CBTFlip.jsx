import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const REFRAMES = [
  { pattern:/لا نقدر|ما نقدرش|عاجز|مستحيل|can't|cannot/i,
    reframe:'راك قادر تتعلم وتكبر. كل حاجة صعيبة في البداية — هذا شي طبيعي تماماً.' },
  { pattern:/فاشل|فاشلة|خايب|خايبة|فشلت|loser|failure/i,
    reframe:'الغلط هو باب التعلم. كل إنسان كيغلط — المهم هو الوقوف مجددًا وهذا ما كتديرو.' },
  { pattern:/ما حد كيحبنيش|وحيد|وحيدة|lonely|alone|nobody/i,
    reframe:'الوحدة مؤقتة. كاينين ناس تستاهل تعرفهم. راك إنسان يستاهل الحب والاهتمام.' },
  { pattern:/ما كانش فايدة|بلا معنى|hopeless|pointless/i,
    reframe:'الأمل موجود دايما. حتى أصعب اللحظات كتفوت. خطوة صغيرة اليوم تفرق بزاف غدا.' },
  { pattern:/غلطتي|غلطت|خطئي|my fault|blame/i,
    reframe:'الإنسان مش مسؤول على كل شي. تعلم من التجربة وامشي للقدام بثقة.' },
  { pattern:/دايما|دائما|أبدا|always|never/i,
    reframe:'الأمور مش دايما كيف كترى دابا. هذا الوقت ديالك صعيب، لكن مش كيبقى هكذاك.' },
]

function reframe(thought) {
  for (const r of REFRAMES) {
    if (r.pattern.test(thought)) return r.reframe
  }
  return 'راك إنسان قوي وقيم. هاد الأفكار السلبية مؤقتة. ركز على خطوة صغيرة واحدة تقدر تدير دابا — راك قادر!'
}

export default function CBTFlip({ onXPEarned }) {
  const { addXP } = useAuth()
  const [thought,  setThought]  = useState('')
  const [flipped,  setFlipped]  = useState(false)
  const [positive, setPositive] = useState('')
  const [earned,   setEarned]   = useState(false)

  function handleFlip() {
    if (!thought.trim()) return
    setPositive(reframe(thought))
    setFlipped(true)
    if (!earned) { addXP(25); onXPEarned?.(25); setEarned(true) }
  }

  function handleReset() {
    setFlipped(false); setThought(''); setPositive(''); setEarned(false)
  }

  return (
    <div className="glass p-6">
      <h3 className="font-bold text-lg mb-1" style={{ color:'var(--text)' }}>🧠 CBT — قلب الأفكار</h3>
      <p className="text-xs mb-5" style={{ color:'var(--muted)' }}>اكتب فكرة سلبية — كنقلبوها لك إيجابية</p>

      <div style={{ perspective: 1000 }}>
        <motion.div style={{ transformStyle:'preserve-3d', position:'relative', height: 200 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration:0.7, ease:'easeInOut' }}>

          {/* Front — negative thought input */}
          <div className="absolute inset-0 rounded-2xl p-5 flex flex-col" style={{ backfaceVisibility:'hidden', background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color:'#fda4af' }}>💭 الفكرة السلبية</p>
            <textarea className="zen-input flex-1 resize-none text-sm" rows={3}
              placeholder="مثلاً: ما نقدرش نوصل لهدفي..."
              value={thought} onChange={e => setThought(e.target.value)} />
          </div>

          {/* Back — positive reframe */}
          <div className="absolute inset-0 rounded-2xl p-5 flex flex-col" style={{ backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.25)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color:'#6ee7b7' }}>✨ الفكرة الإيجابية (CBT)</p>
            <p className="text-sm leading-relaxed flex-1 flex items-center" style={{ color:'var(--text)' }}>
              {positive}
            </p>
            {earned && <span className="chip text-xs mt-2 self-start">+25 XP 🎉</span>}
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3 mt-4">
        {!flipped ? (
          <motion.button whileTap={{ scale:0.97 }} onClick={handleFlip}
            disabled={!thought.trim()} className="btn-zen flex-1 disabled:opacity-40">
            🔄 اقلب الفكرة
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale:0.97 }} onClick={handleReset} className="btn-ghost flex-1">
            ← فكرة جديدة
          </motion.button>
        )}
      </div>
    </div>
  )
}
