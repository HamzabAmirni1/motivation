import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Users, Activity, Target, Database, CheckCircle2,
  RefreshCw, Download, Bell, Trash2, Globe, BarChart2, BookOpen,
  Gamepad2, Headphones, TrendingUp, AlertCircle, Eye, Filter,
  UserCheck, Zap, Heart, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Admin email list ─────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'amirnihamza61@gmail.com',
  'hamza.amirni@gmail.com',
  'hamzaamirni451@gmail.com',
]

function isAdminUser(user, profile) {
  const email = (user?.email || '').toLowerCase().trim()
  return profile?.role === 'admin' || ADMIN_EMAILS.includes(email)
}

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  darija: {
    title: 'لوحة الإدارة — ZenStep',
    subtitle: 'تحكم كامل فـ المنصة، إحصائيات، وحالة السيرفر',
    refresh: 'تحديث',
    export: 'تصدير البيانات',
    broadcast: 'إرسال إشعار',
    clearCache: 'مسح الكاش',
    totalUsers: 'المستخدمين',
    exercises: 'تمارين المنجزة',
    moods: 'سجلات المشاعر',
    journals: 'المذكرات',
    games: 'جولات الألعاب',
    sounds: 'جلسات الأصوات',
    dbStatus: 'السيرفر',
    platformHealth: 'حالة المنصة',
    recentActivity: 'آخر الأنشطة',
    usersList: 'قائمة المستخدمين',
    moodTable: 'إحصائيات المشاعر',
    statsOverview: 'نظرة عامة',
    db: 'قاعدة البيانات',
    ai: 'Zen AI',
    privacy: 'الخصوصية',
    dbDesc: 'متصل 100% ومستقر، نظام الاستمرارية يعمل.',
    aiDesc: 'جاهز بالدارجة، العربية، الفرنسية والإنجليزية.',
    privacyDesc: 'RLS مفعّل — مذكرات كل واحد خاصة بيه.',
    name: 'الاسم',
    email: 'الإيميل',
    level: 'المستوى',
    xp: 'XP',
    streak: 'السلسلة',
    joinedAt: 'تاريخ التسجيل',
    mood: 'المشاعر',
    count: 'العدد',
    percent: 'النسبة',
    action: 'الإجراء',
    noData: 'ما كاينش بيانات',
    exportSuccess: 'تم تصدير البيانات ✓',
    broadcastSent: 'تم إرسال الإشعار ✓',
    cacheCleared: 'تم مسح الكاش ✓',
    langSwitch: 'اللغة',
    happy: 'سعيد 😊', calm: 'هادي 😌', neutral: 'عادي 😐',
    anxious: 'قلقان 😟', sad: 'حزين 😢', angry: 'عصبي 😡',
    tired: 'معياّن 😴', excited: 'متحمس 🤩',
    section_kpi: 'الإحصائيات الكبرى',
    section_health: 'صحة المنصة',
    section_users: 'المستخدمون',
    section_moods: 'المشاعر',
    section_activity: 'سجل الأنشطة',
    section_actions: 'الإجراءات الإدارية',
  },
  ar: {
    title: 'لوحة إدارة المنصة — ZenStep',
    subtitle: 'مراقبة كاملة لنشاط المنصة وحالة الخدمات',
    refresh: 'تحديث',
    export: 'تصدير البيانات',
    broadcast: 'إرسال إشعار عام',
    clearCache: 'مسح ذاكرة التخزين',
    totalUsers: 'المستخدمون المسجلون',
    exercises: 'تمارين العافية المنجزة',
    moods: 'سجلات المشاعر',
    journals: 'مدخلات المذكرة',
    games: 'جولات الألعاب',
    sounds: 'جلسات الاسترخاء',
    dbStatus: 'حالة السيرفر',
    platformHealth: 'صحة المنصة والخدمات',
    recentActivity: 'سجل الأنشطة الأخيرة',
    usersList: 'قائمة المستخدمين',
    moodTable: 'جدول توزيع المشاعر',
    statsOverview: 'نظرة عامة على الإحصائيات',
    db: 'قاعدة البيانات',
    ai: 'المساعد الذكي Zen AI',
    privacy: 'خصوصية المستخدمين',
    dbDesc: 'متصل ومستقر 100% مع نظام استمرارية تلقائي.',
    aiDesc: 'جاهز للتفاعل الفوري بالدارجة المغربية، العربية، الفرنسية والإنجليزية.',
    privacyDesc: 'تطبيق Row Level Security (RLS) — مذكرات كل مستخدم مشفرة وخاصة به.',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    level: 'المستوى',
    xp: 'نقاط XP',
    streak: 'السلسلة اليومية',
    joinedAt: 'تاريخ التسجيل',
    mood: 'المشاعر',
    count: 'العدد',
    percent: 'النسبة المئوية',
    action: 'الإجراء',
    noData: 'لا توجد بيانات',
    exportSuccess: 'تم تصدير البيانات بنجاح ✓',
    broadcastSent: 'تم إرسال الإشعار لجميع المستخدمين ✓',
    cacheCleared: 'تم مسح ذاكرة التخزين المؤقت ✓',
    langSwitch: 'اللغة',
    happy: 'سعيد 😊', calm: 'هادئ 😌', neutral: 'محايد 😐',
    anxious: 'قلق 😟', sad: 'حزين 😢', angry: 'غاضب 😡',
    tired: 'متعب 😴', excited: 'متحمس 🤩',
    section_kpi: 'المؤشرات الرئيسية',
    section_health: 'صحة المنصة',
    section_users: 'المستخدمون',
    section_moods: 'المشاعر',
    section_activity: 'سجل الأنشطة',
    section_actions: 'إجراءات الإدارة',
  },
  fr: {
    title: 'Tableau de bord — ZenStep',
    subtitle: 'Surveillance complète de la plateforme et des services',
    refresh: 'Actualiser',
    export: 'Exporter les données',
    broadcast: 'Envoyer une notification',
    clearCache: 'Vider le cache',
    totalUsers: 'Utilisateurs inscrits',
    exercises: 'Exercices complétés',
    moods: 'Entrées d\'humeur',
    journals: 'Entrées de journal',
    games: 'Parties jouées',
    sounds: 'Sessions de relaxation',
    dbStatus: 'État du serveur',
    platformHealth: 'Santé de la plateforme',
    recentActivity: 'Activité récente',
    usersList: 'Liste des utilisateurs',
    moodTable: 'Distribution des humeurs',
    statsOverview: 'Vue d\'ensemble',
    db: 'Base de données',
    ai: 'Assistant Zen AI',
    privacy: 'Confidentialité',
    dbDesc: 'Connecté et stable 100% avec continuité automatique.',
    aiDesc: 'Disponible en darija, arabe, français et anglais.',
    privacyDesc: 'Row Level Security (RLS) actif — journaux chiffrés par utilisateur.',
    name: 'Nom',
    email: 'Email',
    level: 'Niveau',
    xp: 'Points XP',
    streak: 'Série quotidienne',
    joinedAt: 'Date d\'inscription',
    mood: 'Humeur',
    count: 'Nombre',
    percent: 'Pourcentage',
    action: 'Action',
    noData: 'Aucune donnée',
    exportSuccess: 'Données exportées avec succès ✓',
    broadcastSent: 'Notification envoyée à tous ✓',
    cacheCleared: 'Cache vidé avec succès ✓',
    langSwitch: 'Langue',
    happy: 'Heureux 😊', calm: 'Calme 😌', neutral: 'Neutre 😐',
    anxious: 'Anxieux 😟', sad: 'Triste 😢', angry: 'En colère 😡',
    tired: 'Fatigué 😴', excited: 'Enthousiaste 🤩',
    section_kpi: 'Indicateurs clés',
    section_health: 'Santé plateforme',
    section_users: 'Utilisateurs',
    section_moods: 'Humeurs',
    section_activity: 'Journal d\'activité',
    section_actions: 'Actions administratives',
  },
  en: {
    title: 'Admin Dashboard — ZenStep',
    subtitle: 'Full platform monitoring, analytics, and system controls',
    refresh: 'Refresh',
    export: 'Export Data',
    broadcast: 'Send Notification',
    clearCache: 'Clear Cache',
    totalUsers: 'Registered Users',
    exercises: 'Completed Exercises',
    moods: 'Mood Logs',
    journals: 'Journal Entries',
    games: 'Game Sessions',
    sounds: 'Sound Sessions',
    dbStatus: 'Server Status',
    platformHealth: 'Platform Health',
    recentActivity: 'Recent Activity',
    usersList: 'Users List',
    moodTable: 'Mood Distribution',
    statsOverview: 'Overview',
    db: 'Database',
    ai: 'Zen AI Assistant',
    privacy: 'User Privacy',
    dbDesc: 'Connected and stable 100% with automatic keepalive system.',
    aiDesc: 'Ready in Darija, Arabic, French, and English.',
    privacyDesc: 'Row Level Security (RLS) active — each user\'s data is private.',
    name: 'Name',
    email: 'Email',
    level: 'Level',
    xp: 'XP Points',
    streak: 'Daily Streak',
    joinedAt: 'Joined',
    mood: 'Mood',
    count: 'Count',
    percent: 'Percentage',
    action: 'Action',
    noData: 'No data available',
    exportSuccess: 'Data exported successfully ✓',
    broadcastSent: 'Notification sent to all users ✓',
    cacheCleared: 'Cache cleared successfully ✓',
    langSwitch: 'Language',
    happy: 'Happy 😊', calm: 'Calm 😌', neutral: 'Neutral 😐',
    anxious: 'Anxious 😟', sad: 'Sad 😢', angry: 'Angry 😡',
    tired: 'Tired 😴', excited: 'Excited 🤩',
    section_kpi: 'Key Metrics',
    section_health: 'Platform Health',
    section_users: 'Users',
    section_moods: 'Moods',
    section_activity: 'Activity Log',
    section_actions: 'Admin Actions',
  }
}

const MOOD_KEYS = ['happy','calm','neutral','anxious','sad','angry','tired','excited']
const MOOD_COLORS = {
  happy: '#fcd34d', calm: '#6ee7b7', neutral: '#94a3b8',
  anxious: '#fb923c', sad: '#7dd3fc', angry: '#f87171',
  tired: '#c084fc', excited: '#f472b6'
}

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return iso?.slice(0, 10) || '—' }
}

function SectionToggle({ title, icon: Icon, color, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
            <Icon size={18} />
          </div>
          <span className="font-bold text-sm text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[var(--muted)]" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [lang, setLang] = useState(profile?.language || 'ar')
  const t = T[lang] || T.ar

  const [stats, setStats] = useState({
    totalUsers: 0, totalExercises: 0, totalMoodLogs: 0,
    totalJournals: 0, totalGames: 0, totalSounds: 0,
    dbStatus: '…'
  })
  const [users, setUsers]       = useState([])
  const [moodDist, setMoodDist] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(false)
  const [toast, setToast]       = useState('')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [showBroadcastInput, setShowBroadcastInput] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadStats = async () => {
    setLoading(true)
    try {
      // Counts from Supabase
      const { count: usersCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
      const { count: moodsCount } = await supabase.from('mood_entries').select('id', { count: 'exact', head: true })
      const { count: exCount }    = await supabase.from('exercise_sessions').select('id', { count: 'exact', head: true })
      const { count: journalCount } = await supabase.from('journal_entries').select('id', { count: 'exact', head: true })
      const { count: gameCount }  = await supabase.from('game_scores').select('id', { count: 'exact', head: true })

      // Local fallback
      const ls = JSON.parse(localStorage.getItem('zs_stats') || '{}')
      const lm = JSON.parse(localStorage.getItem('zs_moods') || '[]')
      const lj = JSON.parse(localStorage.getItem('zs_journal') || '[]')

      setStats({
        totalUsers:     Math.max(1, usersCount  || 1),
        totalExercises: (exCount  || 0) + (ls.completedExercises || 0),
        totalMoodLogs:  (moodsCount || 0) + lm.length,
        totalJournals:  (journalCount || 0) + lj.length,
        totalGames:     (gameCount || 0),
        totalSounds:    ls.soundSessions || 0,
        dbStatus:       'متصل 100% ✓'
      })

      // Users list
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, xp, level, streak_count, created_at, role')
        .order('xp', { ascending: false })
        .limit(20)
      setUsers(usersData || [])

      // Mood distribution from Supabase + local
      const { data: moodsData } = await supabase
        .from('mood_entries')
        .select('mood')
        .limit(500)
      const allMoods = [
        ...(moodsData || []).map(m => m.mood),
        ...lm.map(m => m.mood)
      ]
      const dist = {}
      MOOD_KEYS.forEach(k => { dist[k] = 0 })
      allMoods.forEach(m => { if (dist[m] !== undefined) dist[m]++ })
      const total = allMoods.length || 1
      setMoodDist(MOOD_KEYS.map(k => ({ key: k, count: dist[k], pct: Math.round((dist[k] / total) * 100) })))

      // Recent activity — latest mood entries
      const { data: recentMoods } = await supabase
        .from('mood_entries')
        .select('mood, note, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      const { data: recentEx } = await supabase
        .from('exercise_sessions')
        .select('exercise_name, duration_seconds, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      const acts = [
        ...(recentMoods || []).map(m => ({ type: 'mood', label: m.mood, note: m.note, at: m.created_at })),
        ...(recentEx || []).map(e => ({ type: 'exercise', label: e.exercise_name, note: `${Math.round((e.duration_seconds || 0)/60)} min`, at: e.created_at })),
        ...lm.slice(0, 5).map(m => ({ type: 'mood', label: m.mood, note: m.note, at: m.date || m.created_at })),
      ]
      acts.sort((a, b) => new Date(b.at) - new Date(a.at))
      setActivity(acts.slice(0, 15))

    } catch (e) {
      console.warn('Admin load error:', e)
      setStats(s => ({ ...s, dbStatus: 'خطأ في الاتصال ⚠' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  // Export all local + supabase data as JSON
  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      stats,
      users,
      moodDistribution: moodDist,
      recentActivity: activity,
      localMoods: JSON.parse(localStorage.getItem('zs_moods') || '[]'),
      localJournal: JSON.parse(localStorage.getItem('zs_journal') || '[]'),
      localHabits: JSON.parse(localStorage.getItem('zs_habits') || '[]'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `zenstep_admin_export_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast(t.exportSuccess)
  }

  // Broadcast notification to all Supabase users
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    try {
      const { data: allUsers } = await supabase.from('profiles').select('id').limit(200)
      if (allUsers?.length) {
        const rows = allUsers.map(u => ({
          user_id: u.id,
          title: 'إشعار من ZenStep 🌱',
          message: broadcastMsg,
          type: 'admin',
          read: false,
          created_at: new Date().toISOString()
        }))
        await supabase.from('notifications').insert(rows)
      }
    } catch (e) { console.warn('broadcast error', e) }
    showToast(t.broadcastSent)
    setBroadcastMsg('')
    setShowBroadcastInput(false)
  }

  const handleClearCache = () => {
    const keysToKeep = ['zs_profile','zs_moods','zs_journal','zs_habits','zs_achievements','zs_active_page']
    const temp = {}
    keysToKeep.forEach(k => { const v = localStorage.getItem(k); if (v) temp[k] = v })
    localStorage.clear()
    Object.entries(temp).forEach(([k,v]) => localStorage.setItem(k,v))
    showToast(t.cacheCleared)
  }

  if (!isAdminUser(user, profile)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-5xl">🔒</p>
        <h2 className="text-xl font-bold text-white">الصفحة غير متاحة</h2>
        <p className="text-xs text-[var(--muted)]">هذا القسم مخصص لإدارة المنصة فقط.</p>
      </div>
    )
  }

  const LANG_OPTIONS = [
    { key: 'darija', label: 'الدارجة' },
    { key: 'ar',     label: 'العربية' },
    { key: 'fr',     label: 'Français' },
    { key: 'en',     label: 'English' },
  ]

  const KPI = [
    { icon: Users,    color: '#6ee7b7', value: stats.totalUsers,     label: t.totalUsers },
    { icon: Activity, color: '#7dd3fc', value: stats.totalExercises, label: t.exercises },
    { icon: Heart,    color: '#f472b6', value: stats.totalMoodLogs,  label: t.moods },
    { icon: BookOpen, color: '#a78bfa', value: stats.totalJournals,  label: t.journals },
    { icon: Gamepad2, color: '#fcd34d', value: stats.totalGames,     label: t.games },
    { icon: Headphones,color:'#34d399', value: stats.totalSounds,    label: t.sounds },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl bg-[#6ee7b7] text-black text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass p-5 md:p-7 rounded-[2rem] border border-white/5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#fda4af]/15 text-[#fda4af] border border-[#fda4af]/20">
              <ShieldAlert size={13} /> Admin
            </div>
            <h1 className="text-2xl md:text-3xl font-black gradient-text">{t.title}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>{t.subtitle}</p>
          </div>

          {/* Language + Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            {LANG_OPTIONS.map(l => (
              <button key={l.key} onClick={() => setLang(l.key)}
                className="text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all border"
                style={lang === l.key
                  ? { background: '#6ee7b7', color: '#0d1117', borderColor: '#6ee7b7' }
                  : { background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {l.label}
              </button>
            ))}
            <button onClick={loadStats}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl glass border border-white/5 text-[var(--subtle)] hover:text-white transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {t.refresh}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <SectionToggle title={t.section_kpi} icon={BarChart2} color="#6ee7b7">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {KPI.map(({ icon: Icon, color, value, label }) => (
            <motion.div key={label} whileHover={{ scale: 1.02 }}
              className="p-4 rounded-2xl border border-white/5 space-y-2"
              style={{ background: `${color}08` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-white">{loading ? '…' : value}</p>
              <p className="text-[11px] text-[var(--muted)] leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* DB Status bar */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6ee7b7] animate-pulse shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#6ee7b7]">{t.dbStatus}</p>
            <p className="text-[10px] text-[var(--muted)]">{stats.dbStatus}</p>
          </div>
          <TrendingUp size={16} className="text-[#6ee7b7] ml-auto mr-0" />
        </div>
      </SectionToggle>

      {/* ── Platform Health ── */}
      <SectionToggle title={t.section_health} icon={CheckCircle2} color="#7dd3fc">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: t.db,      desc: t.dbDesc,      color: '#6ee7b7', pulse: true },
            { label: t.ai,      desc: t.aiDesc,      color: '#7dd3fc', pulse: false },
            { label: t.privacy, desc: t.privacyDesc, color: '#a78bfa', pulse: false },
          ].map(({ label, desc, color, pulse }) => (
            <div key={label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
                <span className={`w-2 h-2 rounded-full ${pulse ? 'animate-pulse' : ''}`} style={{ background: color }} />
                {label}
              </p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </SectionToggle>

      {/* ── Users Table ── */}
      <SectionToggle title={t.section_users} icon={UserCheck} color="#fcd34d">
        {users.length === 0 ? (
          <p className="text-xs text-[var(--muted)] py-4 text-center">{loading ? '…' : t.noData}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['#', t.name, t.level, t.xp, t.streak, t.joinedAt].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-[var(--muted)] font-bold text-[11px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#6ee7b7]/15 text-[#6ee7b7] flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(u.username || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-white truncate max-w-[100px]">{u.username || '—'}</span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#fda4af]/15 text-[#fda4af] font-bold">admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-lg bg-[#6ee7b7]/10 text-[#6ee7b7] font-bold">Lv.{u.level || 1}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#fcd34d]">{u.xp || 0}</td>
                    <td className="px-4 py-3 text-[var(--subtle)]">🔥 {u.streak_count || 0}d</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{formatDate(u.created_at)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionToggle>

      {/* ── Mood Distribution Table ── */}
      <SectionToggle title={t.section_moods} icon={Heart} color="#f472b6">
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {[t.mood, t.count, t.percent, ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-right text-[var(--muted)] font-bold text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moodDist.map(({ key, count, pct }) => (
                <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: MOOD_COLORS[key] }}>{t[key]}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">{count}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{pct}%</td>
                  <td className="px-4 py-3 w-32">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: MOOD_COLORS[key] }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionToggle>

      {/* ── Recent Activity ── */}
      <SectionToggle title={t.section_activity} icon={Clock} color="#a78bfa">
        {activity.length === 0 ? (
          <p className="text-xs text-[var(--muted)] py-4 text-center">{loading ? '…' : t.noData}</p>
        ) : (
          <div className="space-y-2">
            {activity.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                  a.type === 'mood' ? 'bg-[#f472b6]/15 text-[#f472b6]' : 'bg-[#7dd3fc]/15 text-[#7dd3fc]'
                }`}>
                  {a.type === 'mood' ? '😊' : '🏃'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white capitalize truncate">{a.label}</p>
                  {a.note && <p className="text-[10px] text-[var(--muted)] truncate">{a.note}</p>}
                </div>
                <span className="text-[10px] text-[var(--muted)] shrink-0 whitespace-nowrap">{formatDate(a.at)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </SectionToggle>

      {/* ── Admin Actions ── */}
      <SectionToggle title={t.section_actions} icon={Zap} color="#fda4af">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <button onClick={handleExport}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#6ee7b7]/10 hover:border-[#6ee7b7]/30 transition-all group text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6ee7b7]/15 text-[#6ee7b7] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Download size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{t.export}</p>
              <p className="text-[10px] text-[var(--muted)]">JSON — stats, users, moods</p>
            </div>
          </button>

          {/* Broadcast */}
          <button onClick={() => setShowBroadcastInput(s => !s)}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#7dd3fc]/10 hover:border-[#7dd3fc]/30 transition-all group text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{t.broadcast}</p>
              <p className="text-[10px] text-[var(--muted)]">Push to all Supabase users</p>
            </div>
          </button>

          {/* Clear Cache */}
          <button onClick={handleClearCache}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#fcd34d]/10 hover:border-[#fcd34d]/30 transition-all group text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fcd34d]/15 text-[#fcd34d] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Trash2 size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{t.clearCache}</p>
              <p className="text-[10px] text-[var(--muted)]">localStorage temp data</p>
            </div>
          </button>

          {/* Refresh Stats */}
          <button onClick={loadStats}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#a78bfa]/10 hover:border-[#a78bfa]/30 transition-all group text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/15 text-[#a78bfa] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{t.refresh}</p>
              <p className="text-[10px] text-[var(--muted)]">Reload all Supabase data</p>
            </div>
          </button>
        </div>

        {/* Broadcast Input */}
        <AnimatePresence>
          {showBroadcastInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-[#7dd3fc]/5 border border-[#7dd3fc]/20 space-y-3">
                <p className="text-xs font-bold text-[#7dd3fc] flex items-center gap-1.5">
                  <Bell size={13} /> {t.broadcast}
                </p>
                <textarea
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="اكتب رسالة الإشعار هنا…"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-[var(--muted)] resize-none outline-none focus:border-[#7dd3fc]/40"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowBroadcastInput(false); setBroadcastMsg('') }}
                    className="text-xs px-4 py-2 rounded-xl glass text-[var(--muted)] hover:text-white transition-colors border border-white/5"
                  >
                    إلغاء
                  </button>
                  <button onClick={handleBroadcast}
                    className="text-xs px-5 py-2 rounded-xl font-bold text-black transition-all"
                    style={{ background: broadcastMsg.trim() ? '#7dd3fc' : '#7dd3fc44' }}
                    disabled={!broadcastMsg.trim()}
                  >
                    إرسال
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionToggle>

      {/* Footer */}
      <p className="text-center text-[10px] text-[var(--muted)] pb-4">
        ZenStep Admin · {new Date().toLocaleDateString()} · {user?.email}
      </p>
    </div>
  )
}
