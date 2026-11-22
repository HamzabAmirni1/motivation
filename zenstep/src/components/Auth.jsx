import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Auth() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const { t, lang, setLang, dir, languages } = useLanguage()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const TABS = [
    { id: 'login',  label: t('auth_login', 'دخول') },
    { id: 'signup', label: t('auth_signup', 'تسجيل') },
  ]

  async function handleGoogle() {
    setBusy(true)
    const { error } = await signInWithGoogle()
    if (error) setMsg('Google Error: ' + error.message)
    setBusy(false)
  }

  async function handleEmail(e) {
    e.preventDefault()
    if (!email || !password) return setMsg('يرجى ملء جميع الحقول')
    setBusy(true)
    setMsg('')
    const fn = tab === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    if (error) setMsg(error.message)
    else if (tab === 'signup') setMsg('يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" style={{ background: 'var(--bg)' }} dir={dir}>
      {/* Language Switcher in Top Corner */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 glass p-1 rounded-2xl border border-white/5">
        <Globe size={14} className="text-[#6ee7b7] mx-1.5" />
        {languages.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              lang === l.code ? 'bg-[#6ee7b7] text-black shadow-xs' : 'text-[var(--subtle)] hover:text-white'
            }`}
          >
            {l.flag} {l.code.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Blobs */}
      <div className="blob w-[500px] h-[500px]" style={{ top:'-20%', left:'-20%', background:'rgba(110,231,183,0.08)' }} />
      <div className="blob w-[400px] h-[400px]" style={{ animationDelay:'2s', bottom:'-15%', right:'-15%', background:'rgba(167,139,250,0.08)' }} />

      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        className="glass w-full max-w-md p-8 relative z-10 rounded-[2.5rem] border border-white/5 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float inline-block">🌱</div>
          <h1 className="text-3xl font-black gradient-text mb-1">ZenStep</h1>
          <p style={{ color:'var(--subtle)' }} className="text-sm">
            {t('auth_tagline', 'رفيقك اليومي للعافية النفسية والصفاء')}
          </p>
        </div>

        {/* Google button */}
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.98 }}
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm mb-6 transition-all duration-200"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'var(--text)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {busy ? t('common_loading', 'كنحملو...') : t('auth_google', 'المتابعة عبر Google')}
        </motion.button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
          <span style={{ color:'var(--muted)' }} className="text-xs">
            {t('auth_or', 'أو عبر البريد الإلكتروني')}
          </span>
          <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>
          {TABS.map(tTab => (
            <button
              key={tTab.id}
              onClick={() => setTab(tTab.id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: tab === tTab.id ? 'rgba(110,231,183,0.15)' : 'transparent',
                color: tab === tTab.id ? '#6ee7b7' : 'var(--muted)'
              }}
            >
              {tTab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            className="zen-input text-xs"
            type="email"
            placeholder={t('auth_email', 'البريد الإلكتروني')}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="zen-input text-xs"
            type="password"
            placeholder={t('auth_pwd', 'كلمة السر')}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <AnimatePresence>
            {msg && (
              <motion.p
                initial={{ opacity:0, y:-4 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0 }}
                className="text-xs text-center py-2 px-3 rounded-xl"
                style={{ background:'rgba(253,164,175,0.1)', color:'#fda4af', border:'1px solid rgba(253,164,175,0.2)' }}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale:1.01 }}
            whileTap={{ scale:0.98 }}
            type="submit"
            disabled={busy}
            className="btn-zen w-full py-3.5 rounded-2xl font-bold text-sm mt-1"
          >
            {busy ? t('common_loading', 'كنحملو...') : tab === 'login' ? t('auth_login', 'دخول') : t('auth_signup', 'إنشاء حساب جديد')}
          </motion.button>
        </form>

        <p className="text-center mt-5 text-[11px]" style={{ color:'var(--muted)' }}>
          🔒 مساحة آمنة ومحمية بتشفير تام — خصوصيتك أولويتنا
        </p>
      </motion.div>
    </div>
  )
}
