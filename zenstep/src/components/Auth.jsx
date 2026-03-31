import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const TABS = [
  { id: 'login',  label: 'دخول' },
  { id: 'signup', label: 'تسجيل' },
]

export default function Auth() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [tab,      setTab]      = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [msg,      setMsg]      = useState('')
  const [busy,     setBusy]     = useState(false)

  async function handleGoogle() {
    setBusy(true)
    const { error } = await signInWithGoogle()
    if (error) setMsg('وقع شي مشكل مع Google. حاول مرة أخرى.')
    setBusy(false)
  }

  async function handleEmail(e) {
    e.preventDefault()
    if (!email || !password) return setMsg('عمر email و كلمة السر من فضلك.')
    setBusy(true)
    setMsg('')
    const fn = tab === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    if (error) setMsg(error.message)
    else if (tab === 'signup') setMsg('شوف صندوق البريد ديالك باش تأكد.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* blobs */}
      <div className="blob w-[500px] h-[500px]" style={{ top:'-20%', left:'-20%', background:'rgba(110,231,183,0.08)' }} />
      <div className="blob w-[400px] h-[400px]" style={{ animationDelay:'2s', bottom:'-15%', right:'-15%', background:'rgba(167,139,250,0.08)' }} />

      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        className="glass w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float inline-block">🌱</div>
          <h1 className="text-3xl font-black gradient-text mb-1">ZenStep</h1>
          <p style={{ color:'var(--subtle)' }} className="text-sm">رفيقك اليومي للصحة النفسية</p>
        </div>

        {/* Google button */}
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.98 }}
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm mb-6 transition-all duration-200"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'var(--text)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {busy ? 'كنحملو...' : 'دخول بـ Google'}
        </motion.button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
          <span style={{ color:'var(--muted)' }} className="text-xs">أو</span>
          <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: tab === t.id ? 'rgba(110,231,183,0.15)' : 'transparent', color: tab === t.id ? '#6ee7b7' : 'var(--muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input className="zen-input" type="email" placeholder="البريد الإلكتروني"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input className="zen-input" type="password" placeholder="كلمة السر"
            value={password} onChange={e => setPassword(e.target.value)} />

          <AnimatePresence>
            {msg && (
              <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="text-xs text-center py-2 px-3 rounded-lg"
                style={{ background:'rgba(253,164,175,0.1)', color:'#fda4af', border:'1px solid rgba(253,164,175,0.2)' }}>
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
            type="submit" disabled={busy} className="btn-zen w-full mt-1">
            {busy ? 'كنحملو...' : tab === 'login' ? 'دخول 🚪' : 'إنشاء حساب 🌱'}
          </motion.button>
        </form>

        <p className="text-center mt-4 text-xs" style={{ color:'var(--muted)' }}>
          راك فآمان — ما كنبيعوش بياناتك لحد 🔒
        </p>
      </motion.div>
    </div>
  )
}
