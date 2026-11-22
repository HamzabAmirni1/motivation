import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Flame, Trophy, Smile, BookOpen, Target, ArrowRight, Heart, Wind, Compass } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import XPBar from './XPBar'
import DailyQuest from './DailyQuest'
import MoodLog from './MoodLog'
import GrowthTree from './GrowthTree'
import { calculateLevel, ACHIEVEMENTS } from '../lib/gamification'

export default function Dashboard({ setPage }) {
  const { profile, getMoodLogs, getJournalEntries, getCompletedQuests } = useAuth()
  const moodLogs = getMoodLogs()
  const journalEntries = getJournalEntries()
  const completedQuests = getCompletedQuests()

  const xp = profile?.xp || 0
  const lv = calculateLevel(xp)
  const streak = profile?.streak_count || 0
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'صباح الخير والسكينة' : hour < 18 ? 'مساء النور والراحة' : 'ليلة هادئة ومباركة'

  // Last 7 days mood trend for chart
  const recentMoods = useMemo(() => moodLogs.slice(0, 7).reverse(), [moodLogs])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold chip">
            <Sparkles size={14} /> رحلتك نحو العافية النفسية
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {greet}، <span className="gradient-text">{profile?.username || 'صاحبي'}</span> 👋
          </h1>
          <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-lg leading-relaxed">
            خطوة صغيرة اليوم تصنع فرقاً كبيراً غداً. كيف تشعر الآن وما الذي تحب أن تبدأ به؟
          </p>
        </div>

        {/* Quick Quick Actions */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setPage('mood')}
            className="btn-zen px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Smile size={16} />
            <span>سجل مزاجك</span>
          </button>
          <button
            onClick={() => setPage('zenbot')}
            className="btn-ghost px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Sparkles size={16} className="text-[#6ee7b7]" />
            <span>تحدث مع Zen AI</span>
          </button>
        </div>
      </motion.div>

      {/* Level & XP Progression Bar */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <XPBar />
      </motion.div>

      {/* Grid: 2 Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on md) */}
        <div className="md:col-span-2 space-y-6">
          {/* Daily Quests / Goals */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DailyQuest />
          </motion.div>

          {/* Quick Mood Logger Widget */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <MoodLog />
          </motion.div>

          {/* 7-Day Mood Trend Overview */}
          {recentMoods.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass p-6 rounded-[2rem] border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Smile size={16} className="text-[#6ee7b7]" />
                  <span>تطور المزاج خلال الأيام الأخيرة</span>
                </h3>
                <button onClick={() => setPage('mood')} className="text-xs text-[#6ee7b7] hover:underline flex items-center gap-1">
                  <span>كل السجلات</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="flex items-end justify-between gap-2 h-28 bg-black/20 p-3 rounded-2xl border border-white/5">
                {recentMoods.map((m, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-sm">{m.emoji || '😊'}</span>
                    <div
                      className="w-full max-w-[16px] rounded-t-lg bg-gradient-to-t from-[#6ee7b7] to-[#a78bfa]"
                      style={{ height: `${Math.max(20, ((m.score || 5) / 8) * 100)}%` }}
                    />
                    <span className="text-[9px] text-[var(--muted)]">
                      {new Date(m.date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Journal Preview */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass p-6 rounded-[2rem] border border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BookOpen size={16} className="text-[#a78bfa]" />
                <span>آخر الخواطر والمذكرات</span>
              </h3>
              <button onClick={() => setPage('journal')} className="text-xs text-[#6ee7b7] hover:underline flex items-center gap-1">
                <span>فتح المذكرة</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {journalEntries.length === 0 ? (
              <p className="text-xs text-[var(--muted)] py-4 text-center">لا توجد خواطر مسجلة بعد. اكتب أول تدوينة اليوم.</p>
            ) : (
              <div className="space-y-2">
                {journalEntries.slice(0, 2).map(entry => (
                  <div key={entry.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.mood || '🌿'}</span>
                      <div>
                        <h4 className="font-bold text-xs text-white truncate">{entry.title}</h4>
                        <p className="text-[11px] text-[var(--muted)] line-clamp-1">{entry.content}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--muted)] shrink-0">
                      {new Date(entry.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column (1 Col on md) */}
        <div className="space-y-6">
          {/* Evolving Growth Tree */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GrowthTree />
          </motion.div>

          {/* Recommended Exercises Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass p-6 rounded-[2rem] border border-white/5 space-y-4"
          >
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Compass size={16} className="text-[#7dd3fc]" />
              <span>تمارين مقترحة لك اليوم</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => setPage('tools')}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#6ee7b7]/30 text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌬️</span>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#6ee7b7] transition-colors">Breathe-Sync</h4>
                    <p className="text-[10px] text-[var(--muted)]">تهدئة فورية في 3 دقائق</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#6ee7b7]">+20 XP</span>
              </button>

              <button
                onClick={() => setPage('sounds')}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#7dd3fc]/30 text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌧️</span>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#7dd3fc] transition-colors">أصوات الاسترخاء</h4>
                    <p className="text-[10px] text-[var(--muted)]">أجواء مطر وأمواج طبيعية</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--subtle)]">هدوء تام</span>
              </button>

              <button
                onClick={() => setPage('games')}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#a78bfa]/30 text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🃏</span>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#a78bfa] transition-colors">ألعاب الذاكرة</h4>
                    <p className="text-[10px] text-[var(--muted)]">تشتيت الانتباه وتصفية العقل</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#a78bfa]">+20 XP</span>
              </button>
            </div>
          </motion.div>

          {/* Daily Thought / Wisdom */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass p-5 rounded-2xl border border-white/5 text-center space-y-2"
          >
            <span className="text-3xl">💡</span>
            <p className="text-xs font-bold text-[#6ee7b7]">حكمة اليوم</p>
            <p className="text-xs text-[var(--subtle)] leading-relaxed italic">
              "الراحة النفسية ليست غياب الصعوبات، بل هي قدرتك على التعامل معها بهدوء وسلام داخلي."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
