import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth      from './components/Auth'
import Navbar    from './components/Navbar'
import Dashboard from './components/Dashboard'
import ToolsPage from './components/ToolsPage'
import GamesPage from './components/GamesPage'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
}

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage]   = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌱</div>
          <p className="gradient-text font-bold text-xl">ZenStep</p>
          <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">كنحمّلو...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient background blobs */}
      <div className="blob w-[700px] h-[700px]" style={{ top:'-20%', left:'-15%', background:'rgba(110,231,183,0.05)' }} />
      <div className="blob w-[600px] h-[600px]" style={{ animationDelay:'3s', bottom:'-15%', right:'-15%', background:'rgba(167,139,250,0.05)' }} />
      <div className="blob w-[400px] h-[400px]" style={{ animationDelay:'1.5s', top:'50%', left:'40%', background:'rgba(125,211,252,0.04)' }} />

      <Navbar page={page} setPage={setPage} />

      <main className="relative z-10 pt-20 pb-16 px-4">
        <AnimatePresence mode="wait">
          {page === 'dashboard' && (
            <motion.div key="dash" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard />
            </motion.div>
          )}
          {page === 'tools' && (
            <motion.div key="tools" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ToolsPage />
            </motion.div>
          )}
          {page === 'games' && (
            <motion.div key="games" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <GamesPage />
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
