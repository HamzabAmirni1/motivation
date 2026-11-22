import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, X, LogOut, User, Sparkles, Trophy, ShieldAlert } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { calculateLevel } from '../lib/gamification'
import NotificationsCenter from './NotificationsCenter'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
  { id: 'mood',      label: 'المزاج',   icon: '😊' },
  { id: 'journal',   label: 'المذكرة',  icon: '📖' },
  { id: 'zenbot',    label: 'Zen AI',   icon: '🤖' },
  { id: 'tools',     label: 'الأدوات',  icon: '🧠' },
  { id: 'sounds',    label: 'الأصوات',  icon: '🎵' },
  { id: 'habits',    label: 'العادات',  icon: '🎯' },
  { id: 'games',     label: 'الألعاب',  icon: '🎮' },
  { id: 'profile',   label: 'حسابي',    icon: '👤' },
  { id: 'developer', label: 'المطور',   icon: '👨‍💻' },
];

function isImageUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

export default function Navbar({ page, setPage }) {
  const { profile, signOut, notifications } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const lv = calculateLevel(profile?.xp || 0)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => setPage('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="text-2xl animate-float">🌱</span>
            <span className="font-black text-xl gradient-text tracking-tight">ZenStep</span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className="relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{ color: isActive ? '#6ee7b7' : 'var(--subtle)' }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(110,231,183,0.1)',
                        border: '1px solid rgba(110,231,183,0.25)'
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* User Section & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-xl glass hover:bg-white/10 text-[var(--subtle)] hover:text-white transition-all"
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

            {/* Level & XP Badge */}
            {profile && (
              <div
                onClick={() => setPage('profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass cursor-pointer hover:border-[#6ee7b7]/30 transition-all"
              >
                <span className="text-sm">{lv.emoji}</span>
                <span className="text-xs font-bold text-[var(--subtle)]">
                  Lv.{lv.level} • <strong className="text-[#6ee7b7]">{profile.xp || 0} XP</strong>
                </span>
              </div>
            )}

            {/* User Avatar */}
            <button
              onClick={() => setPage('profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white/10 hover:ring-[#6ee7b7]/50 transition-all overflow-hidden shrink-0"
              style={{
                background: 'linear-gradient(135deg,#6ee7b7,#a78bfa)',
                color: '#0d1117'
              }}
            >
              {isImageUrl(profile?.avatar_url) ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{profile?.avatar_url || (profile?.username?.[0] || '🌱').toUpperCase()}</span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl glass text-[var(--subtle)] hover:text-white"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-3 glass rounded-2xl p-4 border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                {NAV_ITEMS.map(item => {
                  const isActive = page === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPage(item.id)
                        setMenuOpen(false)
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all text-right"
                      style={{
                        background: isActive ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.03)',
                        color: isActive ? '#6ee7b7' : 'var(--text)',
                        border: isActive ? '1px solid rgba(110,231,183,0.3)' : '1px solid rgba(255,255,255,0.04)'
                      }}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => {
                    setPage('admin')
                    setMenuOpen(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold glass text-[var(--subtle)] flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert size={14} />
                  <span>لوحة المسؤول</span>
                </button>
                <button
                  onClick={signOut}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>خروج</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Notifications Center Modal */}
      <NotificationsCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
