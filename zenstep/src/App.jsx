import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import MoodPage from './components/MoodPage'
import JournalPage from './components/JournalPage'
import GeneralAI from './components/GeneralAI'
import ToolsPage from './components/ToolsPage'
import SoundsPage from './components/SoundsPage'
import HabitsPage from './components/HabitsPage'
import GamesPage from './components/GamesPage'
import ProfilePage from './components/ProfilePage'
import AdminDashboard from './components/AdminDashboard'
import CommunityPage from './components/CommunityPage'
import Developer from './components/Developer'
import NotificationTracker from './components/NotificationTracker'
import LevelUpModal from './components/LevelUpModal'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
}

const ADMIN_EMAILS = [
  'amirnihamza61@gmail.com',
  'hamza.amirni@gmail.com',
  'hamzaamirni451@gmail.com'
]

const VALID_PAGES = [
  'dashboard', 'mood', 'journal', 'tools', 'zenbot',
  'community', 'sounds', 'habits', 'games', 'profile', 'admin', 'developer'
]

function getInitialPage() {
  if (typeof window === 'undefined') return 'dashboard'
  // 1. Try URL hash first (e.g. #community, #zenbot)
  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  if (hash && VALID_PAGES.includes(hash)) {
    return hash
  }
  // 2. Try localStorage
  try {
    const saved = localStorage.getItem('zs_active_page')
    if (saved && VALID_PAGES.includes(saved)) {
      return saved
    }
  } catch (e) {}
  return 'dashboard'
}

function isAdminUser(user, profile) {
  const email = (user?.email || '').toLowerCase().trim()
  return profile?.role === 'admin' || ADMIN_EMAILS.includes(email)
}

function AppContent() {
  const { user, profile, loading } = useAuth()
  const { dir, t } = useLanguage()
  const [page, setPage] = useState(getInitialPage)

  useEffect(() => {
    localStorage.setItem('zs_active_page', page)
    if (window.location.hash !== `#${page}`) {
      window.history.replaceState(null, '', `#${page}`)
    }
  }, [page])

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim()
      if (hash && VALID_PAGES.includes(hash) && hash !== page) {
        setPage(hash)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [page])

  useEffect(() => {
    // If a non-admin is trying to access the admin page, redirect safely to dashboard
    if (page === 'admin' && !isAdminUser(user, profile)) {
      setPage('dashboard')
    }
  }, [page, user, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌱</div>
          <p className="gradient-text font-bold text-xl">ZenStep</p>
          <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">{t('common_loading', 'كنحمّلو بياناتك...')}</p>
        </div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: 'var(--bg)' }} dir={dir}>
      {/* Ambient background glowing blobs */}
      <div className="blob w-[700px] h-[700px]" style={{ top: '-20%', left: '-15%', background: 'rgba(110,231,183,0.05)' }} />
      <div className="blob w-[600px] h-[600px]" style={{ animationDelay: '3s', bottom: '-15%', right: '-15%', background: 'rgba(167,139,250,0.05)' }} />
      <div className="blob w-[400px] h-[400px]" style={{ animationDelay: '1.5s', top: '50%', left: '40%', background: 'rgba(125,211,252,0.04)' }} />

      <Navbar page={page} setPage={setPage} />
      <NotificationTracker />
      <LevelUpModal />

      <main className="relative z-10 pt-20 pb-16 px-4">
        <AnimatePresence mode="wait">
          {page === 'dashboard' && (
            <motion.div key="dash" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard setPage={setPage} />
            </motion.div>
          )}
          {page === 'mood' && (
            <motion.div key="mood" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <MoodPage />
            </motion.div>
          )}
          {page === 'journal' && (
            <motion.div key="journal" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <JournalPage />
            </motion.div>
          )}
          {page === 'zenbot' && (
            <motion.div key="zenbot" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <GeneralAI setPage={setPage} />
            </motion.div>
          )}
          {page === 'tools' && (
            <motion.div key="tools" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ToolsPage />
            </motion.div>
          )}
          {page === 'sounds' && (
            <motion.div key="sounds" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <SoundsPage />
            </motion.div>
          )}
          {page === 'habits' && (
            <motion.div key="habits" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <HabitsPage />
            </motion.div>
          )}
          {page === 'games' && (
            <motion.div key="games" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <GamesPage />
            </motion.div>
          )}
          {page === 'profile' && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ProfilePage />
            </motion.div>
          )}
          {page === 'community' && (
            <motion.div key="community" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <CommunityPage />
            </motion.div>
          )}
          {page === 'admin' && (
            <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminDashboard />
            </motion.div>
          )}
          {page === 'developer' && (
            <motion.div key="dev" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Developer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  )
}
