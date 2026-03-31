import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { calculateLevel } from '../lib/gamification'

const NAV_ITEMS = [
  { id:'dashboard', label:'الرئيسية', icon:'🏠' },
  { id:'tools',     label:'الأدوات',   icon:'🧠' },
  { id:'games',     label:'الألعاب',   icon:'🎮' },
  { id:'developer', label:'المطور',   icon:'👨‍💻' },
]

export default function Navbar({ page, setPage }) {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const lv = calculateLevel(profile?.xp || 0)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{ background:'rgba(13,17,23,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-black text-lg gradient-text">ZenStep</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: page === item.id ? '#6ee7b7' : 'var(--subtle)' }}>
              {page === item.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl"
                  style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)' }} />
              )}
              <span className="relative">{item.icon} {item.label}</span>
            </button>
          ))}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
              <span className="text-sm">{lv.emoji}</span>
              <span className="text-xs font-semibold" style={{ color:'var(--subtle)' }}>
                Lv.{lv.level} · {profile.xp || 0} XP
              </span>
            </div>
          )}
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2" style={{ ringColor:'#6ee7b7' }} />
            : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background:'linear-gradient(135deg,#6ee7b7,#a78bfa)', color:'#0d1117' }}>
                {(profile?.username?.[0] || '?').toUpperCase()}
              </div>
          }
          <button onClick={signOut} className="btn-ghost text-xs hidden md:block">خروج</button>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg" style={{ color:'var(--subtle)' }} onClick={() => setMenuOpen(o => !o)}>
            <div className="w-5 h-0.5 mb-1 rounded" style={{ background:'var(--subtle)' }} />
            <div className="w-5 h-0.5 mb-1 rounded" style={{ background:'var(--subtle)' }} />
            <div className="w-5 h-0.5 rounded" style={{ background:'var(--subtle)' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="md:hidden mt-2 glass rounded-xl p-3" onClick={() => setMenuOpen(false)}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-colors"
                style={{ color: page === item.id ? '#6ee7b7' : 'var(--text)', background: page === item.id ? 'rgba(110,231,183,0.1)' : 'transparent' }}>
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={signOut} className="w-full text-right px-4 py-3 rounded-xl text-sm" style={{ color:'var(--muted)' }}>🚪 خروج</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
