import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Flame, Trophy, Smile, BookOpen, Target, ArrowRight, Heart, Wind, Compass, Activity, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import XPBar from './XPBar'
import DailyQuest from './DailyQuest'
import MoodLog from './MoodLog'
import GrowthTree from './GrowthTree'
import { calculateLevel, ACHIEVEMENTS } from '../lib/gamification'

export default function Dashboard({ setPage }) {
  const { profile, getMoodLogs, getJournalEntries, getCompletedQuests } = useAuth()
  const { t, lang } = useLanguage()
  const moodLogs = getMoodLogs()
  const journalEntries = getJournalEntries()
  const completedQuests = getCompletedQuests()

  const [moodRange, setMoodRange] = useState(7) // 7 or 30 days

  const xp = profile?.xp || 0
  const lv = calculateLevel(xp)
  const streak = profile?.streak_count || 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (lang === 'fr') {
      return hour < 18 ? 'Bonjour' : 'Bonsoir'
    }
    if (lang === 'en') {
      return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    }
    if (lang === 'darija') {
      return hour < 12 ? 'صباح الخير والراحة' : hour < 18 ? 'مساء الخير والسكينة' : 'ليلة هادئة ومريحة'
    }
    return hour < 12 ? 'صباح الخير والسكينة' : hour < 18 ? 'مساء النور والراحة' : 'ليلة هادئة ومباركة'
  }

  const greet = getGreeting()

  // User stats from storage
  const stats = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('zs_stats') || '{}')
    } catch { return {} }
  }, [])

  const unlockedAchievements = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('zs_achievements') || '[]')
    } catch { return [] }
  }, [])

  // Mood trend for chart
  const recentMoods = useMemo(() => {
    return moodLogs.slice(0, moodRange).reverse()
  }, [moodLogs, moodRange])

  const totalExercises = (stats.completedExercises || 0) + completedQuests.length

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
            <Sparkles size={14} /> {t('dash_badge_wellness', 'رحلتك نحو العافية النفسية')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {greet}، <span className="gradient-text">{profile?.username || t('dash_friend', 'صاحبي')}</span> 👋
          </h1>
          <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-lg leading-relaxed">
            {t('dash_greeting_sub2', 'خطوة صغيرة اليوم تصنع فرقاً كبيراً غداً. كيف تشعر الآن وما الذي تحب أن تبدأ به؟')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2.5 flex-wrap justify-center">
          <button
            onClick={() => setPage('mood')}
            className="btn-zen px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Smile size={16} />
            <span>{t('nav_mood')}</span>
          </button>
          <button
            onClick={() => setPage('zenbot')}
            className="btn-ghost px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Sparkles size={16} className="text-[#6ee7b7]" />
            <span>{t('nav_zenbot')}</span>
          </button>
        </div>
      </motion.div>

      {/* Level & XP Progression Bar */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <XPBar />
      </motion.div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6ee7b7]/15 text-[#6ee7b7] flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-white">{totalExercises}</p>
            <p className="text-[10px] text-[var(--muted)]">{t('dash_exercises_done', 'تمارين منجزة')}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fcd34d]/15 text-[#fcd34d] flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-white">{streak}</p>
            <p className="text-[10px] text-[var(--muted)]">{t('dash_streak', 'سلسلة متواصلة')}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/15 text-[#a78bfa] flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-white">{unlockedAchievements.length} / {ACHIEVEMENTS.length}</p>
            <p className="text-[10px] text-[var(--muted)]">{t('profile_achievements', 'الأوسمة المكتسبة')}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc] flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-white">{journalEntries.length}</p>
            <p className="text-[10px] text-[var(--muted)]">{t('nav_journal', 'تدوينات المذكرة')}</p>
          </div>
        </div>
      </div>

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

          {/* 7-Day & 30-Day Mood Trend Overview */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass p-6 rounded-[2rem] border border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Smile size={16} className="text-[#6ee7b7]" />
                <span>{t('dash_mood_chart_title', 'منحنى تطور المزاج')}</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-black/20 p-1 rounded-xl">
                  <button
                    onClick={() => setMoodRange(7)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      moodRange === 7 ? 'bg-[#6ee7b7] text-black shadow-sm' : 'text-[var(--subtle)]'
                    }`}
                  >
                    {t('dash_7_days', '7 أيام')}
                  </button>
                  <button
                    onClick={() => setMoodRange(30)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      moodRange === 30 ? 'bg-[#6ee7b7] text-black shadow-sm' : 'text-[var(--subtle)]'
                    }`}
                  >
                    {t('dash_30_days', '30 يوم')}
                  </button>
                </div>
                
                <button onClick={() => setPage('mood')} className="text-xs text-[#6ee7b7] hover:underline flex items-center gap-0.5">
                  <span>{t('dash_details', 'التفاصيل')}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {recentMoods.length === 0 ? (
              <div className="py-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-2">
                <Smile size={28} className="mx-auto text-[var(--muted)] opacity-50" />
                <p className="text-xs text-[var(--muted)]">{t('dash_no_mood', 'لم تسجل حالتك الشعورية بعد. سجل أول حالة الآن لكسب +10 XP.')}</p>
                <button onClick={() => setPage('mood')} className="btn-zen px-4 py-1.5 text-xs font-bold">
                  {t('dash_log_mood_now', 'سجل مزاجك الآن')}
                </button>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-1.5 h-32 bg-black/20 p-3 rounded-2xl border border-white/5 overflow-x-auto">
                {recentMoods.map((m, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-[24px]">
                    <span className="text-xs">{m.emoji || '😊'}</span>
                    <div
                      className="w-full max-w-[14px] rounded-t-lg bg-gradient-to-t from-[#6ee7b7] to-[#a78bfa] transition-all"
                      style={{ height: `${Math.max(15, ((m.score || 5) / 8) * 100)}%` }}
                    />
                    <span className="text-[9px] text-[var(--muted)]">
                      {new Date(m.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-MA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Journal Preview */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass p-6 rounded-[2rem] border border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BookOpen size={16} className="text-[#a78bfa]" />
                <span>{t('dash_recent_journals_title', 'آخر الخواطر والمذكرات')}</span>
              </h3>
              <button onClick={() => setPage('journal')} className="text-xs text-[#6ee7b7] hover:underline flex items-center gap-1">
                <span>{t('dash_open_journal', 'فتح المذكرة')}</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {journalEntries.length === 0 ? (
              <div className="p-6 text-center bg-black/20 rounded-2xl border border-white/5 space-y-2">
                <p className="text-xs text-[var(--muted)]">{t('dash_no_journals', 'مذكرتك الخاصة فارغة حالياً. التدوين يساعد على تفريغ الشحنات السلبية وتصفية الذهن.')}</p>
                <button onClick={() => setPage('journal')} className="btn-zen px-4 py-1.5 text-xs font-bold">
                  {t('dash_write_first', 'اكتب أول خاطرة (+15 XP)')}
                </button>
              </div>
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
              <span>{t('dash_recommended_today', 'تمارين مقترحة لك اليوم')}</span>
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
                    <p className="text-[10px] text-[var(--muted)]">{t('dash_breathe_desc', 'تهدئة فورية في 3 دقائق')}</p>
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
                    <h4 className="font-bold text-xs text-white group-hover:text-[#7dd3fc] transition-colors">{t('dash_sounds_title', 'أصوات الاسترخاء')}</h4>
                    <p className="text-[10px] text-[var(--muted)]">{t('dash_sounds_desc', 'أجواء مطر وأمواج طبيعية')}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--subtle)]">{t('dash_sounds_badge', 'هدوء تام')}</span>
              </button>

              <button
                onClick={() => setPage('games')}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#a78bfa]/30 text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🃏</span>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#a78bfa] transition-colors">{t('dash_games_title', 'ألعاب الذاكرة')}</h4>
                    <p className="text-[10px] text-[var(--muted)]">{t('dash_games_desc', 'تشتيت الانتباه وتصفية العقل')}</p>
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
            <p className="text-xs font-bold text-[#6ee7b7]">{t('dash_wisdom_title', 'حكمة اليوم')}</p>
            <p className="text-xs text-[var(--subtle)] leading-relaxed italic">
              {t('dash_wisdom_quote', '"الراحة النفسية ليست غياب الصعوبات، بل هي قدرتك على التعامل معها بهدوء وسلام داخلي."')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
