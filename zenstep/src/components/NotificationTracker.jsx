import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getDailyQuests } from '../lib/quests'

export default function NotificationTracker() {
  const { getCompletedQuests } = useAuth()

  useEffect(() => {
    if (!("Notification" in window)) return

    const checkReminders = () => {
      // يلا وافق على الإشعارات
      if (Notification.permission === "granted") {
        const quests = getDailyQuests()
        const completed = getCompletedQuests()
        const uncompleted = quests.filter(q => !completed.includes(q.id))

        // يلا بقاو عندو مهام مازال ما دارهم
        if (uncompleted.length > 0) {
          const quest = uncompleted[Math.floor(Math.random() * uncompleted.length)]
          new Notification("🌱 ZenStep - وقت الإنجاز!", {
            body: `عندك مهمة مازال ما كملتيهاش: ${quest.title}\nنوض ديرها دابا باش تزيد فـ XP!`,
            vibrate: [200, 100, 200, 100, 200]
          })
        } else {
          // يلا كمل كلشي نقدرو نشجعوه
          new Notification("🎉 بطل!", {
            body: "كملتي ڭاع المهام ديال اليوم! ارتاح مع راسك دابا.",
            vibrate: [100, 50, 100]
          })
        }
      }
    }

    // غادي نديرو تذكير كل ساعتين (2 سوايع = 7200000 ميلي ثانية)
    // وحدة تجريبية مورا دقيقة باش يجربوها بصح
    const timeout = setTimeout(checkReminders, 60 * 1000) 
    const interval = setInterval(checkReminders, 2 * 60 * 60 * 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [getCompletedQuests])

  return null
}
