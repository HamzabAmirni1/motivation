import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, TrendingUp, Calendar, Trash2, Edit3, Heart, Sparkles, Filter, Info, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function MoodPage() {
  const { getMoodLogs, addMoodLog, deleteMoodLog } = useAuth()
  const { t, lang, dir } = useLanguage()
  const logs = getMoodLogs()

  const MOOD_TYPES = [
    { id: 'happy',   score: 8, label: t('mood_happy', 'سعيد'),   emoji: '😊', color: '#6ee7b7', desc: 'راحة وتفاؤل' },
    { id: 'calm',    score: 7, label: t('mood_calm', 'هادئ'),   emoji: '😌', color: '#7dd3fc', desc: 'سكينة وطمأنينة' },
    { id: 'excited', score: 6, label: t('mood_excited', 'متحمس'),  emoji: '🤩', color: '#fcd34d', desc: 'طاقة وإقبال' },
    { id: 'neutral', score: 5, label: t('mood_neutral', 'عادي'),   emoji: '😐', color: '#94a3b8', desc: 'استقرار متوازن' },
    { id: 'tired',   score: 4, label: t('mood_tired', 'تعبان'),  emoji: '😴', color: '#a78bfa', desc: 'بحاجة للراحة' },
    { id: 'anxious', score: 3, label: t('mood_anxious', 'قلق'),    emoji: '😟', color: '#fb923c', desc: 'توتر أو حيرة' },
    { id: 'sad',     score: 2, label: t('mood_sad', 'حزين'),   emoji: '😢', color: '#60a5fa', desc: 'ثقل أو ضيق' },
    { id: 'angry',   score: 1, label: t('mood_angry', 'غاضب'),   emoji: '😡', color: '#f87171', desc: 'انفعال أو استياء' },
  ]

  const CAUSES_LIST = [
    { id: 'work', label: t('cause_work', 'العمل / الدراسة') + ' 💼' },
    { id: 'family', label: t('cause_family', 'العائلة') + ' 🏡' },
    { id: 'relations', label: t('cause_relationships', 'العلاقات') + ' 👥' },
    { id: 'health', label: t('cause_health', 'الصحة') + ' 🍎' },
    { id: 'sleep', label: t('cause_sleep', 'النوم') + ' 🛌' },
    { id: 'money', label: t('cause_finance', 'المال') + ' 💳' },
    { id: 'future', label: t('cause_future', 'المستقبل') + ' 🔮' },
    { id: 'alone', label: t('cause_alone', 'الوحدة') + ' 🌀' },
  ]

  const [selectedMood, setSelectedMood] = useState(null)
  const [intensity, setIntensity] = useState(5)
  const [selectedCauses, setSelectedCauses] = useState([])
  const [note, setNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [chartRange, setChartRange] = useState(7)
  const [viewMode, setViewMode] = useState('list')
  
  const [editingLog, setEditingLog] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

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

  const handleUpdateLog = (e) => {
    e.preventDefault()
    if (!editingLog) return
    const all = getMoodLogs()
    const updated = all.map(l => l.id === editingLog.id ? editingLog : l)
    localStorage.setItem('zs_moods', JSON.stringify(updated))
    setEditingLog(null)
  }

  const stats = useMemo(() => {
    if (!logs.length) return null
    const recent = logs.slice(0, chartRange)
    const avgScore = (recent.reduce((sum, l) => sum + (l.score || 5), 0) / recent.length).toFixed(1)
    
    const counts = {}
    logs.forEach(l => {
      counts[l.label] = (counts[l.label] || 0) + 1
    })

    let insight = t('mood_insights_title', 'تظهر سجلاتك استمرارية ممتازة في مراقبة مشاعرك. الاستماع لنفسك هو أول خطوة للعافية.')
    if (avgScore >= 6) {
      insight = lang === 'fr' 
        ? 'Vous avez enregistré des émotions positives et sereines la majorité du temps. Continuez à cultiver cet équilibre !'
        : lang === 'en'
        ? 'You have recorded mostly calm and positive emotions recently. Keep nurturing this healthy mindset!'
        : 'سجلت مشاعر إيجابية وهادئة في أغلب أيامك هذا الأسبوع. واصل تغذية هذه الطاقة الإيجابية!'
    } else if (avgScore <= 3.5) {
      insight = lang === 'fr'
        ? 'Vous avez traversé des moments plus délicats récemment. Rappelez-vous que les émotions passent et soyez doux avec vous-même.'
        : lang === 'en'
        ? 'You may have faced some heavy moments recently. Remember that feelings are temporary, be compassionate with yourself.'
        : 'يبدو أنك مررت ببعض اللحظات الصعبة مؤخراً. تذكر أن المشاعر متغيرة، وعليك أن تكون رفيقاً رحيماً بنفسك.'
    }

    return { avgScore, counts, insight, recent }
  }, [logs, chartRange, lang, t])

  const calendarDays = useMemo(() => {
    const list = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const matchingLog = logs.find(l => l.date && l.date.startsWith(dateStr))
      list.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        log: matchingLog
      })
    }
    return list
  }, [logs])

  const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-MA'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Smile size={14} /> {t('nav_mood', 'متتبع المشاعر اليومي')}
        </div>
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">
          {t('mood_title', 'كيف هو مزاجك اليوم؟')}
        </h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          {t('mood_subtitle', 'سجل مشاعرك بصدق. الوعي بمشاعرك يساعدك على فهم ما يؤثر فيك وبناء توازن نفسي دائم.')}
        </p>
      </motion.div>

      {/* Mood Selector Card */}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <span>{t('mood_title', 'اختر حالتك الشعورية الحالية')}</span>
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
                  <span style={{ color: 'var(--subtle)' }}>{t('mood_intensity', 'شدة هذا الشعور')}</span>
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
                  {t('mood_causes', 'ما الذي ساهم في هذا الشعور؟ (اختياري)')}
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
                  {t('mood_notes_placeholder', 'ملاحظة شخصية عما حدث معك:')}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t('mood_notes_placeholder', 'اكتب بضعة أسطر لتفريغ أفكارك...')}
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
                  <span>{t('mood_save_btn', 'حفظ الحالة الشعورية (+10 XP)')}</span>
                </button>
                <button
                  onClick={() => setSelectedMood(null)}
                  className="btn-ghost px-5 text-xs"
                >
                  {t('common_cancel', 'إلغاء')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSaved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} />
            <span>{t('common_saved', 'تم حفظ الحالة الشعورية بنجاح ✓')}</span>
          </motion.div>
        )}
      </div>

      {/* Analytics & Observations Section */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass p-6 rounded-[2rem] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <TrendingUp size={18} className="text-[#6ee7b7]" />
                <span>{t('dash_mood_chart_title', 'منحنى المزاج')}</span>
              </h3>
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setChartRange(7)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${chartRange === 7 ? 'bg-[#6ee7b7] text-[#0a0f1a]' : 'text-[var(--subtle)]'}`}
                >
                  {t('dash_7_days', '7 أيام')}
                </button>
                <button
                  onClick={() => setChartRange(30)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${chartRange === 30 ? 'bg-[#6ee7b7] text-[#0a0f1a]' : 'text-[var(--subtle)]'}`}
                >
                  {t('dash_30_days', '30 يوم')}
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-1.5 pt-6 pb-2 px-3 relative bg-black/20 rounded-2xl border border-white/5 overflow-x-auto">
              {stats.recent.slice(0, chartRange === 30 ? 20 : 14).reverse().map((item, idx) => {
                const heightPct = Math.max(15, ((item.score || 5) / 8) * 100)
                const moodObj = MOOD_TYPES.find(m => m.label === item.label) || MOOD_TYPES[0]
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative min-w-[24px]">
                    <span className="text-xs transition-transform group-hover:scale-125">{item.emoji || moodObj.emoji}</span>
                    <div
                      className="w-full max-w-[16px] rounded-t-lg transition-all duration-300 relative"
                      style={{
                        height: `${heightPct}%`,
                        background: `linear-gradient(180deg, ${moodObj.color}, ${moodObj.color}44)`
                      }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161b27] px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap border border-white/10 z-10 pointer-events-none">
                        {item.label} ({item.intensity || 5}/10)
                      </div>
                    </div>
                    <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
                      {new Date(item.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Gentle Non-Clinical Observation */}
            <div className="p-4 rounded-2xl flex items-start gap-3 bg-[#6ee7b7]/10 border border-[#6ee7b7]/20">
              <Info size={18} className="text-[#6ee7b7] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#6ee7b7] mb-1">{t('mood_insights_title', 'ملاحظة داعمة')}</p>
                <p className="text-xs leading-relaxed text-white/90">{stats.insight}</p>
              </div>
            </div>
          </div>

          {/* Mood Breakdown (1 col) */}
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-white">توزيع المشاعر</h3>
            <div className="space-y-3">
              {Object.entries(stats.counts).slice(0, 6).map(([label, count]) => {
                const moodObj = MOOD_TYPES.find(m => m.label === label) || MOOD_TYPES[0]
                const pct = Math.round((count / logs.length) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{moodObj.emoji}</span>
                        <span style={{ color: 'var(--text)' }}>{label}</span>
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
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

      {/* History Log Section with List & Calendar View Options */}
      {logs.length > 0 && (
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">{t('mood_history_title', 'سجل المشاعر والتقويم')}</h3>
            <div className="flex gap-1.5 bg-black/20 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-[#6ee7b7] text-black shadow-sm' : 'text-[var(--subtle)]'
                }`}
              >
                {t('mood_list_view', 'القائمة')}
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'calendar' ? 'bg-[#6ee7b7] text-black shadow-sm' : 'text-[var(--subtle)]'
                }`}
              >
                {t('mood_calendar_view', 'التقويم')}
              </button>
            </div>
          </div>

          {/* Calendar View Mode */}
          {viewMode === 'calendar' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {calendarDays.map((d) => (
                  <div
                    key={d.dateStr}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center gap-1 min-h-[60px]"
                  >
                    <span className="text-[10px] text-[var(--muted)]">{d.dayNum}</span>
                    {d.log ? (
                      <span className="text-lg" title={`${d.log.label} (${d.log.intensity || 5}/10)`}>
                        {d.log.emoji}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[var(--muted)] opacity-30">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View Mode */
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
                              {log.intensity}/10
                            </span>
                          )}
                        </div>
                        {log.note && <p className="text-xs text-[var(--subtle)] mb-1 leading-relaxed">{log.note}</p>}
                        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
                          <span>{new Date(log.date).toLocaleDateString(dateLocale, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          {log.causes && log.causes.length > 0 && (
                            <span>• {log.causes.map(c => CAUSES_LIST.find(x => x.id === c)?.label || c).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingLog({ ...log })}
                        className="p-2 rounded-xl text-[var(--subtle)] hover:text-white hover:bg-white/5 transition-all"
                        title={t('common_edit', 'تعديل')}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                        title={t('common_delete', 'حذف')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 md:p-8 rounded-[2rem] max-w-md w-full border border-white/10 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="font-bold text-white text-base">{t('common_edit', 'تعديل')}</h3>
                <button onClick={() => setEditingLog(null)} className="text-[var(--muted)] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-1">
                  {t('mood_notes_placeholder', 'الملاحظة')}
                </label>
                <textarea
                  rows={3}
                  value={editingLog.note || ''}
                  onChange={e => setEditingLog({ ...editingLog, note: e.target.value })}
                  className="zen-input text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-1">
                  {t('mood_intensity', 'الشدة')} ({editingLog.intensity || 5}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingLog.intensity || 5}
                  onChange={e => setEditingLog({ ...editingLog, intensity: Number(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6ee7b7]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateLog} className="btn-zen flex-1 py-2.5 text-xs font-bold">
                  {t('common_save', 'حفظ')}
                </button>
                <button onClick={() => setEditingLog(null)} className="btn-ghost flex-1 py-2.5 text-xs">
                  {t('common_cancel', 'إلغاء')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-3xl max-w-sm w-full text-center border border-white/10"
            >
              <Trash2 size={36} className="mx-auto mb-3 text-red-400" />
              <h3 className="text-lg font-bold text-white mb-2">{t('common_confirm', 'تأكيد الحذف')}</h3>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                هل أنت متأكد من حذف هذا السجل الشعوري؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    deleteMoodLog(deleteConfirmId)
                    setDeleteConfirmId(null)
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold text-white shadow-lg"
                >
                  {t('common_delete', 'حذف')}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-ghost flex-1 py-3 text-xs"
                >
                  {t('common_cancel', 'تراجع')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
