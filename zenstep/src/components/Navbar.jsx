import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Smile, BookOpen, Sparkles, Bot, Compass,
  Headphones, Target, Gamepad2, User, ShieldAlert,
  Code2, LogOut, Bell, Menu, X, Flame, ChevronLeft
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { calculateLevel } from '../lib/gamification'
import NotificationsCenter from './NotificationsCenter'

// Core primary links (spacious and clean on top bar)
const PRIMARY_NAV = [
  { id: 'dashboard', label: 'الرئيسية', icon: Home },
  { id: 'mood',      label: 'المزاج',   icon: Smile },
  { id: 'journal',   label: 'المذكرة',  icon: BookOpen },
  { id: 'tools',     label: 'الأدوات',  icon: Sparkles },
  { id: 'zenbot',    label: 'Zen AI',   icon: Bot },
];

// Secondary / activities menu items in the side drawer
const getDrawerSections = (isAdmin) => [
  {
    category: 'الاسترخاء والأنشطة',
    items: [
      { id: 'sounds',  label: 'أصوات الاسترخاء', desc: 'مطر، أمواج، نسيم وتأمل', icon: Headphones, color: '#7dd3fc' },
      { id: 'habits',  label: 'العادات والتحديات', desc: 'متابعة أسبوعية وستريك', icon: Target,     color: '#6ee7b7' },
      { id: 'games',   label: 'الألعاب الذهنية', desc: '6 ألعاب لتصفية العقل',  icon: Gamepad2,   color: '#a78bfa' },
    ]
  },
  {
    category: 'الحساب والمشروع',
    items: [
      { id: 'profile',   label: 'حسابي والإعدادات', desc: 'الملف الشخصي، الأوسمة، واللغة', icon: User, color: '#fcd34d' },
      ...(isAdmin ? [{ id: 'admin', label: 'لوحة الإدارة', desc: 'إحصائيات المنصة', icon: ShieldAlert, color: '#fda4af' }] : []),
      { id: 'developer', label: 'عن المطور ZenStep', desc: 'معلومات التواصل والمشروع',    icon: Code2, color: '#94a3b8' },
    ]
  }
];

export function renderAvatarContent(profile, fallbackEmoji = '🌱') {
  const url = profile?.avatar_url
  if (typeof url === 'string') {
    const trimmed = url.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image')) {
      return <img src={trimmed} alt="Avatar" className="w-full h-full object-cover" />
    }
    // Only accept if it is a genuine short emoji or avatar symbol (1-4 chars)
    if (trimmed.length > 0 && trimmed.length <= 4) {
      return <span>{trimmed}</span>
    }
  }
  // Otherwise use first letter of username or fallback
  const uname = profile?.username?.trim()
  if (uname && uname.length > 0) {
    return <span className="font-bold select-none">{uname[0].toUpperCase()}</span>
  }
  return <span className="select-none">{fallbackEmoji}</span>
}

function checkIsAdmin(user, profile) {
  const email = (user?.email || '').toLowerCase()
  return (
    profile?.role === 'admin' ||
    email === 'amirnihamza61@gmail.com' ||
    email === 'hamza.amirni@gmail.com'
  )
}

export default function Navbar({ page, setPage }) {
  const { user, profile, signOut, notifications } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isAdmin = checkIsAdmin(user, profile)
  const drawerSections = getDrawerSections(isAdmin)

  const lv = calculateLevel(profile?.xp || 0)
  const unreadCount = notifications.filter(n => !n.read).length
  const streak = profile?.streak_count || 0

  const handleNavClick = (id) => {
    setPage(id)
    setDrawerOpen(false)
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-4 py-2.5 transition-all"
        style={{
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-[#6ee7b7]/15 border border-[#6ee7b7]/30 flex items-center justify-center text-lg shadow-sm">
              🌱
            </div>
            <span className="font-black text-xl gradient-text tracking-tight">ZenStep</span>
          </div>

          {/* Clean Desktop Navigation (Only 5 core links + Side Drawer Trigger) */}
          <div className="hidden md:flex items-center gap-1.5">
            {PRIMARY_NAV.map(item => {
              const Icon = item.icon
              const isActive = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2"
                  style={{ color: isActive ? '#6ee7b7' : 'var(--subtle)' }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(110,231,183,0.1)',
                        border: '1px solid rgba(110,231,183,0.25)',
                        boxShadow: '0 0 15px rgba(110,231,183,0.1)'
                      }}
                    />
                  )}
                  <Icon size={16} className={isActive ? 'text-[#6ee7b7]' : 'text-[var(--muted)]'} />
                  <span className="relative">{item.label}</span>
                </button>
              )
            })}

            {/* Quick Access Menu Trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                ['sounds', 'habits', 'games', 'profile', 'admin', 'developer'].includes(page)
                  ? 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/30'
                  : 'glass text-[var(--subtle)] hover:text-white border-white/5'
              }`}
            >
              <Compass size={16} className="text-[#a78bfa]" />
              <span>الأنشطة والمزيد</span>
            </button>
          </div>

          {/* Right Header Controls (Notifications, Level, Avatar, Menu toggle) */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2.5 rounded-xl glass hover:bg-white/10 text-[var(--subtle)] hover:text-white transition-all shrink-0"
              title="الإشعارات"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ee7b7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#6ee7b7] text-black text-[9px] font-black items-center justify-center">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Level & Streak Chip (Hidden on mobile) */}
            {profile && (
              <div
                onClick={() => handleNavClick('profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass cursor-pointer hover:border-[#6ee7b7]/30 transition-all shrink-0"
              >
                <span className="text-xs font-bold text-[#6ee7b7]">Lv.{lv.level}</span>
                <span className="text-[11px] text-[var(--muted)]">|</span>
                <span className="text-xs font-bold text-[#fcd34d] flex items-center gap-0.5">
                  <Flame size={13} /> {streak}d
                </span>
              </div>
            )}

            {/* User Avatar */}
            <button
              onClick={() => handleNavClick('profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white/10 hover:ring-[#6ee7b7]/50 transition-all overflow-hidden shrink-0 select-none"
              style={{
                background: 'linear-gradient(135deg,#6ee7b7,#a78bfa)',
                color: '#0d1117'
              }}
              title="حسابي"
            >
              {renderAvatarContent(profile, '🌱')}
            </button>

            {/* Side Drawer Toggle Button (Always visible on mobile, quick access on desktop) */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2.5 rounded-xl glass text-[var(--subtle)] hover:text-white transition-all shrink-0"
              title="القائمة الجانبية"
            >
              {drawerOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Side Quick-Access Drawer & Quick Menu (Desktop & Mobile) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="glass relative z-10 w-full max-w-sm h-full flex flex-col justify-between p-6 border-l border-white/10 shadow-2xl bg-[#0f141f]/95 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl overflow-hidden shrink-0 shadow-md select-none"
                      style={{ background: 'linear-gradient(135deg,#6ee7b7,#a78bfa)', color: '#0d1117' }}
                    >
                      {renderAvatarContent(profile, lv.emoji)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white truncate max-w-[170px]">{profile?.username || 'صاحبي'}</h3>
                      <p className="text-[11px] text-[#6ee7b7] font-semibold">
                        Lv.{lv.level} • {lv.titleAr || lv.title} ({profile?.xp || 0} XP)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl glass text-[var(--muted)] hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile-only primary nav items */}
                <div className="md:hidden space-y-1">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider px-2 mb-2">
                    الأقسام الرئيسية
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIMARY_NAV.map(item => {
                      const Icon = item.icon
                      const isActive = page === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-right"
                          style={{
                            background: isActive ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.03)',
                            color: isActive ? '#6ee7b7' : 'var(--text)',
                            border: isActive ? '1px solid rgba(110,231,183,0.3)' : '1px solid rgba(255,255,255,0.05)'
                          }}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Categorized Drawer Items */}
                {drawerSections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider px-2">
                      {sec.category}
                    </p>
                    <div className="space-y-1.5">
                      {sec.items.map(item => {
                        const Icon = item.icon
                        const isActive = page === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl transition-all text-right group"
                            style={{
                              background: isActive ? `${item.color}18` : 'rgba(255,255,255,0.02)',
                              border: isActive ? `1.5px solid ${item.color}55` : '1px solid rgba(255,255,255,0.04)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ background: `${item.color}15`, color: item.color }}
                              >
                                <Icon size={18} />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-white" style={{ color: isActive ? item.color : undefined }}>
                                  {item.label}
                                </h4>
                                <p className="text-[10px] text-[var(--muted)]">{item.desc}</p>
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-[var(--muted)] opacity-40 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer (Logout) */}
              <div className="pt-6 border-t border-white/5 mt-6">
                <button
                  onClick={() => {
                    setDrawerOpen(false)
                    signOut()
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 flex items-center justify-center gap-2 transition-colors border border-red-400/20"
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Center Modal */}
      <NotificationsCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
