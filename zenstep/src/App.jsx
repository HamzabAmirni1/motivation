import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import Developer from './components/Developer'
import NotificationTracker from './components/NotificationTracker'
import LevelUpModal from './components/LevelUpModal'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
}

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(() => localStorage.getItem('zs_active_page') || 'dashboard')

  useEffect(() => {
    localStorage.setItem('zs_active_page', page)
  }, [page])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌱</div>
          <p className="gradient-text font-bold text-xl">ZenStep</p>
          <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">كنحمّلو بياناتك...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
              <GeneralAI />
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
      <AppContent />
    </AuthProvider>
  )
}
