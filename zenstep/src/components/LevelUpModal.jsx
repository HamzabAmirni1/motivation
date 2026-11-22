import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function LevelUpModal() {
  const { levelUpData, setLevelUpData } = useAuth()
  const { t, lang, dir } = useLanguage()

  if (!levelUpData) return null

  const levelTitle = (lang === 'ar' || lang === 'darija') 
    ? (levelUpData.titleAr || levelUpData.title)
    : levelUpData.title

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={dir}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLevelUpData(null)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.8, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="glass relative z-10 max-w-sm w-full p-8 text-center rounded-[2.5rem] border border-[#6ee7b7]/30 shadow-[0_0_60px_rgba(110,231,183,0.2)]"
        >
          {/* Glowing Badge */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#6ee7b7]/40"
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #a78bfa)' }}
            >
              {levelUpData.emoji || '🌱'}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 chip">
            <Sparkles size={14} /> LEVEL UP
          </div>

          <h2 className="text-3xl font-black gradient-text mb-1">
            {t('nav_level', 'المستوى')} {levelUpData.level}
          </h2>
          <p className="text-lg font-bold text-white mb-2">
            {levelTitle}
          </p>

          <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--subtle)' }}>
            {t('levelup_congrats', 'تهانينا! خطواتك المستمرة واعتناؤك بنفسك وعقلك يصنعان فارقاً حقيقياً كل يوم.')}
          </p>

          <button
            onClick={() => setLevelUpData(null)}
            className="btn-zen w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-xl"
          >
            <span>{t('levelup_continue', 'واصل المسيرة ✨')}</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
