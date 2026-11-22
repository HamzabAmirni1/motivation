import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, TrendingUp, Calendar, Trash2, Heart, Sparkles, Filter, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const MOOD_TYPES = [
  { id: 'happy',   score: 8, label: 'سعيد',   emoji: '😊', color: '#6ee7b7', desc: 'راحة وتفاؤل' },
  { id: 'calm',    score: 7, label: 'هادئ',   emoji: '😌', color: '#7dd3fc', desc: 'سكينة وطمأنينة' },
  { id: 'excited', score: 6, label: 'متحمس',  emoji: '🤩', color: '#fcd34d', desc: 'طاقة وإقبال' },
  { id: 'neutral', score: 5, label: 'عادي',   emoji: '😐', color: '#94a3b8', desc: 'استقرار متوازن' },
  { id: 'tired',   score: 4, label: 'تعبان',  emoji: '😴', color: '#a78bfa', desc: 'بحاجة للراحة' },
  { id: 'anxious', score: 3, label: 'قلق',    emoji: '😟', color: '#fb923c', desc: 'توتر أو حيرة' },
  { id: 'sad',     score: 2, label: 'حزين',   emoji: '😢', color: '#60a5fa', desc: 'ثقل أو ضيق' },
  { id: 'angry',   score: 1, label: 'غاضب',   emoji: '😡', color: '#f87171', desc: 'انفعال أو استياء' },
];

export const CAUSES_LIST = [
  { id: 'work', label: 'العمل 💼' },
  { id: 'study', label: 'الدراسة 📚' },
  { id: 'sleep', label: 'النوم 🛌' },
  { id: 'relations', label: 'العلاقات 👥' },
  { id: 'health', label: 'الصحة 🍎' },
  { id: 'family', label: 'العائلة 🏡' },
  { id: 'money', label: 'المال 💳' },
  { id: 'social', label: 'السوشيال ميديا 📱' },
  { id: 'weather', label: 'الطقس ☀️' },
  { id: 'other', label: 'أخرى 🌀' },
];

export default function MoodPage() {
  const { getMoodLogs, addMoodLog, deleteMoodLog } = useAuth()
  const logs = getMoodLogs()

  const [selectedMood, setSelectedMood] = useState(null)
  const [intensity, setIntensity] = useState(5)
  const [selectedCauses, setSelectedCauses] = useState([])
  const [note, setNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [chartRange, setChartRange] = useState(7) // 7 or 30 days

  const toggleCause = (causeId) => {
    setSelectedCauses(prev =>
      prev.includes(causeId) ? prev.filter(c => c !== causeId) : [...prev, causeId]
    )
  }

  const handleSave = async () => {
    if (!selectedMood) return
    await addMoodLog({
      score: selectedMood.score,
      label: selectedMood.label,
      emoji: selectedMood.emoji,
      intensity,
      causes: selectedCauses,
      note: note.trim()
    })
    setIsSaved(true)
    setSelectedMood(null)
    setNote('')
    setSelectedCauses([])
    setIntensity(5)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Statistics & Observations
  const stats = useMemo(() => {
    if (!logs.length) return null
    const recent = logs.slice(0, chartRange)
    const avgScore = (recent.reduce((sum, l) => sum + (l.score || 5), 0) / recent.length).toFixed(1)
    
    // Distribution
    const counts = {}
    logs.forEach(l => {
      counts[l.label] = (counts[l.label] || 0) + 1
    })

    // Gentle insights
    let insight = 'تظهر سجلاتك استمرارية ممتازة في مراقبة مشاعرك. الاستماع لنفسك هو أول خطوة للعافية.'
    if (avgScore >= 6) {
      insight = 'سجلت مشاعر إيجابية وهادئة في أغلب أيامك هذا الأسبوع. واصل تغذية هذه الطاقة الإيجابية!'
    } else if (avgScore <= 3.5) {
      insight = 'يبدو أنك مررت ببعض اللحظات الصعبة مؤخراً. تذكر أن المشاعر متغيرة، وعليك أن تكون رفيقاً رحيماً بنفسك.'
    }

    return { avgScore, counts, insight, recent }
  }, [logs, chartRange])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Smile size={14} /> متتبع المشاعر اليومي
        </div>
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">كيف هو مزاجك اليوم؟</h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          سجل مشاعرك بصدق. الوعي بمشاعرك يساعدك على فهم ما يؤثر فيك وبناء توازن نفسي دائم.
        </p>
      </motion.div>

      {/* Mood Selector Card */}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <span>اختر حالتك الشعورية الحالية</span>
        </h2>

        {/* 8 Mood options */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          {MOOD_TYPES.map(m => {
            const isSelected = selectedMood?.id === m.id
            return (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(m)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative"
                style={{
                  background: isSelected ? `${m.color}22` : 'rgba(255,255,255,0.03)',
                  border: isSelected ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isSelected ? `0 0 20px ${m.color}33` : 'none'
                }}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-bold" style={{ color: isSelected ? m.color : 'var(--text)' }}>
                  {m.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Detailed inputs when mood is selected */}
        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-4 border-t border-white/5"
            >
              {/* Intensity slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span style={{ color: 'var(--subtle)' }}>شدة هذا الشعور</span>
                  <span className="px-2.5 py-0.5 rounded-full font-black text-sm" style={{ background: `${selectedMood.color}22`, color: selectedMood.color }}>
                    {intensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6ee7b7]"
                />
              </div>

              {/* Causes tags */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--subtle)' }}>
                  ما الذي ساهم في هذا الشعور؟ (اختياري)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CAUSES_LIST.map(cause => {
                    const active = selectedCauses.includes(cause.id)
                    return (
                      <button
                        key={cause.id}
                        type="button"
                        onClick={() => toggleCause(cause.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: active ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#6ee7b7' : 'var(--subtle)',
                          border: active ? '1px solid rgba(110,231,183,0.4)' : '1px solid rgba(255,255,255,0.06)'
                        }}
                      >
                        {cause.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Personal Note */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--subtle)' }}>
                  ملاحظة شخصية عما حدث معك:
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="اكتب بضعة أسطر لتفريغ أفكارك..."
                  className="zen-input resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="btn-zen flex-1 py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Heart size={16} />
                  <span>حفظ الحالة الشعورية (+10 XP)</span>
                </button>
                <button
                  onClick={() => setSelectedMood(null)}
                  className="btn-ghost px-5 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl text-center font-bold text-sm"
            style={{ background: 'rgba(110,231,183,0.15)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.3)' }}
          >
            ✓ تم تسجيل حالتك بنجاح وكسبت +10 XP! 🌱
          </motion.div>
        )}
      </div>

      {/* Analytics & History Grid */}
      {logs.length > 0 && stats && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Chart & Insights (2 cols) */}
          <div className="md:col-span-2 glass p-6 rounded-[2rem] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <TrendingUp size={18} className="text-[#6ee7b7]" />
                <span>منحنى المزاج</span>
              </h3>
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setChartRange(7)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${chartRange === 7 ? 'bg-[#6ee7b7] text-[#0a0f1a]' : 'text-[var(--subtle)]'}`}
                >
                  7 أيام
                </button>
                <button
                  onClick={() => setChartRange(30)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${chartRange === 30 ? 'bg-[#6ee7b7] text-[#0a0f1a]' : 'text-[var(--subtle)]'}`}
                >
                  30 يوم
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-3 relative bg-black/20 rounded-2xl border border-white/5">
              {stats.recent.slice(0, 14).reverse().map((item, idx) => {
                const heightPct = Math.max(15, ((item.score || 5) / 8) * 100)
                const moodObj = MOOD_TYPES.find(m => m.label === item.label) || MOOD_TYPES[0]
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <span className="text-sm transition-transform group-hover:scale-125">{item.emoji || moodObj.emoji}</span>
                    <div
                      className="w-full max-w-[20px] rounded-t-lg transition-all duration-300 relative"
                      style={{
                        height: `${heightPct}%`,
                        background: `linear-gradient(180deg, ${moodObj.color}, ${moodObj.color}44)`
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161b27] px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap border border-white/10 z-10 pointer-events-none">
                        {item.label} ({item.intensity || 5}/10)
                      </div>
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {new Date(item.date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Gentle Non-Clinical Observation */}
            <div className="p-4 rounded-2xl flex items-start gap-3 bg-[#6ee7b7]/10 border border-[#6ee7b7]/20">
              <Info size={18} className="text-[#6ee7b7] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#6ee7b7] mb-1">ملاحظة داعمة</p>
                <p className="text-xs leading-relaxed text-white/90">{stats.insight}</p>
              </div>
            </div>
          </div>

          {/* Mood Breakdown (1 col) */}
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white">توزيع المشاعر</h3>
            <div className="space-y-3">
              {Object.entries(stats.counts).slice(0, 5).map(([label, count]) => {
                const moodObj = MOOD_TYPES.find(m => m.label === label) || MOOD_TYPES[0]
                const pct = Math.round((count / logs.length) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{moodObj.emoji}</span>
                        <span style={{ color: 'var(--text)' }}>{label}</span>
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{count} مرات ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: moodObj.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* History Log Table */}
      {logs.length > 0 && (
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5">
          <h3 className="font-bold text-lg mb-4 text-white">سجل المشاعر السابقة</h3>
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const moodObj = MOOD_TYPES.find(m => m.label === log.label) || MOOD_TYPES[0]
              return (
                <div key={log.id || log.date} className="py-4 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                      style={{ background: `${moodObj.color}15`, border: `1px solid ${moodObj.color}33` }}
                    >
                      {log.emoji || moodObj.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{log.label}</span>
                        {log.intensity && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 text-[var(--subtle)]">
                            الشدة {log.intensity}/10
                          </span>
                        )}
                      </div>
                      {log.note && <p className="text-xs text-[var(--subtle)] mb-1 leading-relaxed">{log.note}</p>}
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
                        <span>{new Date(log.date).toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        {log.causes && log.causes.length > 0 && (
                          <span>• {log.causes.map(c => CAUSES_LIST.find(x => x.id === c)?.label || c).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMoodLog(log.id)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="حذف السجل"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
