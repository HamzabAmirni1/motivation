import { motion } from 'framer-motion'

const LINKS = [
  { label: 'الموقع الشخصي (Portfolio)', url: 'https://hamzaamirni.netlify.app', icon: '🌐', color: '#6ee7b7' },
  { label: 'قناة الواتساب الرسمية', url: 'https://whatsapp.com/channel/0029ValXRoHCnA7yKopcrn1p', icon: '💬', color: '#25D366' },
  { label: 'انستغرام (الحساب الأول)', url: 'https://instagram.com/hamza_amirni_01', icon: '📸', color: '#E1306C' },
  { label: 'انستغرام (الحساب الثاني)', url: 'https://instagram.com/hamza_amirni_02', icon: '📸', color: '#C13584' },
  { label: 'قناة الانستغرام', url: 'https://www.instagram.com/channel/AbbqrMVbExH_EZLD/', icon: '📢', color: '#F77737' },
  { label: 'فيسبوك (الحساب الشخصي)', url: 'https://www.facebook.com/6kqzuj3y4e', icon: '👤', color: '#1877F2' },
  { label: 'صفحة الفيسبوك الرسمية', url: 'https://www.facebook.com/profile.php?id=61564527797752', icon: '📄', color: '#0866FF' },
  { label: 'قناة اليوتيوب', url: 'https://www.youtube.com/@Hamzaamirni01', icon: '🎥', color: '#FF0000' },
  { label: 'تيليغرام', url: 'https://t.me/hamzaamirni', icon: '✈️', color: '#0088cc' },
  { label: 'مجموعات الواتساب', url: 'https://chat.whatsapp.com/DDb3fGPuZPB1flLc1BV9gJ', icon: '👥', color: '#128C7E' },
]

export default function Developer() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 p-1 overflow-hidden" 
          style={{ background: 'linear-gradient(45deg, #6ee7b7, #a78bfa, #f472b6)' }}>
          <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center text-4xl overflow-hidden">
             👨‍💻
          </div>
        </div>
        <h1 className="text-3xl font-black gradient-text mb-2">Hamza Amirni</h1>
        <p style={{ color: 'var(--muted)' }} className="text-sm">Developer & Creator of ZenStep</p>
      </motion.div>

      <div className="grid gap-4">
        {LINKS.map((link, i) => (
          <motion.a 
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="glass flex items-center gap-4 p-4 rounded-2xl transition-all border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:rotate-12" 
              style={{ background: `${link.color}15`, color: link.color }}>
              {link.icon}
            </div>
            <div className="flex-1 text-right">
              <span className="font-bold text-sm block" style={{ color: 'var(--text)' }}>{link.label}</span>
              <span className="text-[10px] opacity-50 block truncate" dir="ltr">{link.url}</span>
            </div>
            <span className="text-[var(--muted)] opacity-30">←</span>
          </motion.a>
        ))}
      </div>

      <p className="text-center text-xs mt-10" style={{ color: 'var(--muted)' }}>
        Made with 💚 by Hamza Amirni
      </p>
    </div>
  )
}
