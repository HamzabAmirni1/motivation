import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import XPBar      from './XPBar'
import DailyQuest from './DailyQuest'
import MoodLog    from './MoodLog'
import GrowthTree from './GrowthTree'

export default function Dashboard() {
  const { profile } = useAuth()
  const [notifPerm, setNotifPerm] = useState("default")

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPerm(Notification.permission)
    } else {
      setNotifPerm("denied")
    }
  }, [])

  function requestNotif() {
    if (!("Notification" in window)) return
    Notification.requestPermission().then(p => {
      setNotifPerm(p)
      if (p === 'granted') {
        new Notification("✅ الإشعارات خدامين", { 
          body: "غادي نبقاو نفكروك بالبرنامج ديالك باش تبقى غادي مزيان!",
          vibrate: [200, 100, 200]
        })
      }
    })
  }

  const hour  = new Date().getHours()
  const greet = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header greeting */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="mb-6 text-center">
        <p className="text-3xl font-black mb-1">
          {greet}، <span className="gradient-text">{profile?.username || 'صاحبي'}</span> 👋
        </p>
        <p style={{ color:'var(--muted)' }} className="text-sm">
          راك قادر — خطوة صغيرة اليوم تصنع فرقًا كبيرًا غدًا 💚
        </p>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <XPBar />
      </motion.div>

      {/* Two-column on md+ */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <DailyQuest />
          </motion.div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
            <MoodLog />
          </motion.div>
        </div>
        <div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
            <GrowthTree />
          </motion.div>

          {/* Notifications Card */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="glass p-5 mb-5 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2" style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa' }}>
              🔔
            </div>
            <h3 className="font-bold mb-1" style={{ color:'var(--text)' }}>تفعيل الإشعارات</h3>
            <p className="text-xs mb-3" style={{ color:'var(--muted)' }}>
              شعل الإشعارات باش نفكروك يلا نسيتي شي مهمة من البرنامج.
            </p>
            {notifPerm === 'granted' ? (
              <span className="chip text-xs">✅ الإشعارات مفعلة</span>
            ) : notifPerm === 'denied' ? (
              <span className="text-xs" style={{ color:'#f87171' }}>❌ راك رافض الإشعارات فالمتصفح</span>
            ) : (
              <button onClick={requestNotif} className="btn-zen w-full text-xs py-2">
                شعل الإشعارات دابا
              </button>
            )}
          </motion.div>

          {/* Quick tip */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
            className="glass p-4 text-center">
            <p className="text-2xl mb-2">💡</p>
            <p className="text-sm font-semibold mb-1" style={{ color:'var(--subtle)' }}>نصيحة اليوم</p>
            <p className="text-xs leading-relaxed" style={{ color:'var(--muted)' }}>
              "ما كاين حتى واحد فاشل — كاين غير واحد توقف. خد خطوة صغيرة اليوم."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
