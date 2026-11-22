import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, CheckCircle, Flame, Calendar, Trash2, Sparkles, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getDailyQuests } from '../lib/quests'

const ICONS = ['💧', '🌬️', '📖', '🚶', '🧘', '🥦', '🛌', '✍️', '🎨', '☀️'];
const COLORS = ['#6ee7b7', '#7dd3fc', '#a78bfa', '#fcd34d', '#fda4af', '#f87171'];

export default function HabitsPage() {
  const { getHabits, toggleHabitCompletion, addHabit, deleteHabit, getCompletedQuests, markQuestDone } = useAuth()
  const habits = getHabits()
  const quests = getDailyQuests()
  const completedQuests = getCompletedQuests()

  const [isAdding, setIsAdding] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [habitDesc, setHabitDesc] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('🌱')
  const [selectedColor, setSelectedColor] = useState('#6ee7b7')

  // Last 7 days dates
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('ar-MA', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: i === 6
    }
  })

  const handleCreateHabit = (e) => {
    e.preventDefault()
    if (!habitName.trim()) return
    addHabit({
      name: habitName.trim(),
      description: habitDesc.trim(),
      icon: selectedIcon,
      color: selectedColor,
      frequency: 'daily'
    })
    setHabitName('')
    setHabitDesc('')
    setIsAdding(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
            <Target size={14} /> بناء العادات والتحديات
          </div>
          <h1 className="text-3xl font-black gradient-text">العادات اليومية والتحديات</h1>
          <p style={{ color: 'var(--subtle)' }} className="text-sm mt-1">
            العادات الصغيرة المستمرة تبني فارقاً هائلاً في صحتك النفسية وطاقتك اليومية.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-zen flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-xl shrink-0"
          >
            <Plus size={18} />
            <span>إضافة عادة جديدة</span>
          </button>
        )}
      </motion.div>

      {/* Add Habit Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-6 md:p-8 rounded-[2rem] border border-[#6ee7b7]/30 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">عادة صحية جديدة</h2>
              <button onClick={() => setIsAdding(false)} className="text-[var(--muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-1">اسم العادة</label>
                <input
                  type="text"
                  placeholder="مثال: شرب 2 لتر ماء، المشي 15 دقيقة..."
                  value={habitName}
                  onChange={e => setHabitName(e.target.value)}
                  className="zen-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-1">وصف العادة أو الفائدة</label>
                <input
                  type="text"
                  placeholder="مثال: للمحافظة على النشاط وتقليل الصداع..."
                  value={habitDesc}
                  onChange={e => setHabitDesc(e.target.value)}
                  className="zen-input"
                />
              </div>
            </div>

            {/* Icon & Color Pickers */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-2">أيقونة العادة</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSelectedIcon(ic)}
                      className={`text-xl p-2 rounded-xl border transition-all ${selectedIcon === ic ? 'bg-white/15 border-[#6ee7b7]' : 'border-white/5 hover:bg-white/5'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--subtle)] mb-2">اللون المميز</label>
                <div className="flex gap-3 items-center">
                  {COLORS.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${selectedColor === col ? 'scale-125 border-white shadow-lg' : 'border-transparent'}`}
                      style={{ background: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCreateHabit} className="btn-zen flex-1 py-3 font-bold">
                حفظ العادة
              </button>
              <button onClick={() => setIsAdding(false)} className="btn-ghost px-6 text-xs">
                إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Challenges Section */}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#fcd34d]" />
            <span>تحديات اليوم المقترحة</span>
          </h2>
          <span className="chip text-xs">
            {quests.filter(q => completedQuests.includes(q.id)).length} / {quests.length} مكتملة
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {quests.map(quest => {
            const isDone = completedQuests.includes(quest.id)
            return (
              <div
                key={quest.id}
                className="p-5 rounded-2xl border transition-all flex flex-col justify-between"
                style={{
                  background: isDone ? 'rgba(110,231,183,0.08)' : 'rgba(255,255,255,0.03)',
                  borderColor: isDone ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.06)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{quest.icon || '🎯'}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(110,231,183,0.15)', color: '#6ee7b7' }}>
                      +{quest.xp || 20} XP
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{quest.title}</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{quest.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  {isDone ? (
                    <div className="text-center font-bold text-xs text-[#6ee7b7] flex items-center justify-center gap-1">
                      <CheckCircle size={14} /> <span>تم الإنجاز بنجاح</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => markQuestDone(quest.id, quest.xp || 20)}
                      className="btn-zen w-full py-2 text-xs font-bold"
                    >
                      أكملت التحدي ✓
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Habits Weekly Tracker */}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-[#6ee7b7]" />
            <span>متتبع العادات الأسبوعي</span>
          </h2>
          <span className="text-xs text-[var(--muted)]">اضغط على الدائرة لتسجيل الإنجاز</span>
        </div>

        {habits.length === 0 ? (
          <p className="text-center py-8 text-xs text-[var(--muted)]">لا توجد عادات مسجلة بعد. أضف أول عادة لتبدأ المتابعة.</p>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => {
              const completions = Array.isArray(habit.completions) ? habit.completions : []
              // Calculate streak
              let currentStreak = 0
              for (let i = weekDays.length - 1; i >= 0; i--) {
                if (completions.includes(weekDays[i].dateStr)) currentStreak++
                else break
              }

              return (
                <div
                  key={habit.id}
                  className="p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${habit.color}15`, border: `1px solid ${habit.color}33` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{habit.name}</h3>
                        {currentStreak > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#fcd34d] px-2 py-0.5 rounded-full bg-[#fcd34d]/10">
                            <Flame size={12} /> {currentStreak} أيام
                          </span>
                        )}
                      </div>
                      {habit.description && <p className="text-xs text-[var(--muted)]">{habit.description}</p>}
                    </div>
                  </div>

                  {/* 7 Days Circles */}
                  <div className="flex items-center gap-2 justify-between md:justify-end">
                    {weekDays.map(day => {
                      const done = completions.includes(day.dateStr)
                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => toggleHabitCompletion(habit.id, day.dateStr)}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <span className="text-[10px] text-[var(--muted)]">{day.dayName}</span>
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                              done
                                ? 'text-black shadow-md'
                                : 'bg-white/5 text-[var(--subtle)] hover:bg-white/10'
                            }`}
                            style={{
                              background: done ? habit.color : undefined,
                              border: day.isToday && !done ? `1px dashed ${habit.color}` : '1px solid rgba(255,255,255,0.06)'
                            }}
                          >
                            {done ? '✓' : day.dayNumber}
                          </div>
                        </button>
                      )
                    })}

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 ml-2 text-[var(--muted)] hover:text-red-400 rounded-lg transition-colors"
                      title="حذف العادة"
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
    </div>
  )
}
