import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, CheckCircle2, Volume2, Sparkles, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { playSound, stopCurrentSound } from '../../services/soundEngine'

const SLEEP_CHECKLIST = [
  { id: 'screens', label: 'إيقاف الشاشات والإضاءة القوية قبل النوم بـ 30 دقيقة', emoji: '📱' },
  { id: 'water', label: 'شرب رشفة ماء معتدلة أو مشروب عشبي دافئ', emoji: '🍵' },
  { id: 'breathe', label: 'القيام بـ 4 دورات تنفس مهدئة (شهيق 4 - زفير 7)', emoji: '🌬️' },
  { id: 'gratitude', label: 'تذكر نعمة واحدة أو أمر جميل حدث اليوم', emoji: '✨' },
  { id: 'release', label: 'إرخاء الكتفين والفك وترك أفكار الغد للغد', emoji: '🛌' },
];

export default function SleepRoutine({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const [checkedItems, setCheckedItems] = useState([])
  const [isPlayingNightSound, setIsPlayingNightSound] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState(false)

  const toggleCheck = (id) => {
    setCheckedItems(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (next.length === SLEEP_CHECKLIST.length && !rewardClaimed) {
        setRewardClaimed(true)
        addXP(20, 'sleep')
        recordExerciseSession('sleep', 180, 20, 'روتين الاستعداد للنوم المريح')
        onXPEarned?.(20)
      }
      return next
    })
  }

  const toggleSound = () => {
    if (!isPlayingNightSound) {
      playSound('night', 0.4)
      setIsPlayingNightSound(true)
    } else {
      stopCurrentSound()
      setIsPlayingNightSound(false)
    }
  }

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip-purple">
          <Moon size={14} /> طقوس النوم الهادئ
        </div>
        <h3 className="text-xl font-bold text-white">روتين الاستعداد لنوم عميق</h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          خطوات بسيطة وفعالة لتهيئة عقلك وجسمك لنوم مريح وتجديد حيويتك
        </p>
      </div>

      {/* Sound Toggle Box */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div>
            <p className="font-bold text-sm text-white">أصوات الليل الهادئة (التهويدة)</p>
            <p className="text-[10px] text-[var(--muted)]">صوت خافت ومهدئ يرافقك حتى تغفو</p>
          </div>
        </div>

        <button
          onClick={toggleSound}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            isPlayingNightSound ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'btn-zen'
          }`}
        >
          <Volume2 size={14} />
          <span>{isPlayingNightSound ? 'إيقاف الصوت' : 'تشغيل الصوت'}</span>
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {SLEEP_CHECKLIST.map(item => {
          const isDone = checkedItems.includes(item.id)
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCheck(item.id)}
              className="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3"
              style={{
                background: isDone ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
                borderColor: isDone ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)'
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-xs font-medium leading-relaxed ${isDone ? 'line-through text-[var(--muted)]' : 'text-white'}`}>
                  {item.label}
                </span>
              </div>

              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isDone ? 'bg-[#a78bfa] text-white shadow-md' : 'border border-white/20'
                }`}
              >
                {isDone && '✓'}
              </div>
            </motion.div>
          )
        })}
      </div>

      {checkedItems.length === SLEEP_CHECKLIST.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center bg-[#a78bfa]/15 border border-[#a78bfa]/30"
        >
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#a78bfa]" />
          <h4 className="font-bold text-white text-sm">أتممت روتين النوم بنجاح!</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">ليلة هادئة ونوماً هنيئاً وأحلاماً جميلة. كسبت +20 XP 🌙</p>
        </motion.div>
      )}
    </div>
  )
}
