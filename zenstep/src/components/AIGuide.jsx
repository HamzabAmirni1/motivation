import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

// Real Direct Gemini Key from user script
const GEMINI_KEY = "AIzaSyBKKEI-q1qM7mRz0cHA9Qs5KA2hM2ElR8U"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`

export default function AIGuide({ setPage }) {
  const { syncToDatabase } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'model', text: 'أهلا بك! أنا المرشد الذكي ديالك 🤖. عاود ليا كيفاش كتحس اليوم وشنو اللي شاغلك باش نفهم مزيان ونقاد ليك برنامج ديال مهام يومية يخرجك من هاد الحالة.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const systemPrompt = `You are a Moroccan psychologist and positive life coach. Reply ENTIRELY in Moroccan Darija.
The user needs help. Give them a highly empathetic small response, and then create a 3-task program specifically tailored to what they said to help them feel better today.

Respond strictly in JSON format matching this schema AND NOTHING ELSE:
{
  "message": "Your empathetic response in Darija...",
  "quests": [
    { "title": "short task in Darija", "desc": "short description", "category": "mental", "xp": 25, "icon": "🧠" }
  ]
}
Available categories string: movement, mindfulness, self-care, social, mental, creative. Choose a matching emoji for icon. Always provide exactly 3 quests.`

      const payload = {
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'model' ? "model" : "user",
            parts: [{ text: m.text }]
          })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7,
        }
      }

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Gemini API Error')
      
      const data = await res.json()
      const textResponse = data.candidates[0].content.parts[0].text
      const aiResponse = JSON.parse(textResponse)

      setMessages(prev => [...prev, { role: 'model', text: aiResponse.message }])

      if (aiResponse.quests && aiResponse.quests.length > 0) {
        const customQuests = aiResponse.quests.map((q, i) => ({ ...q, id: `ai_quest_${Date.now()}_${i}` }))
        const today = new Date().toISOString().split('T')[0]
        
        localStorage.setItem('zs_custom_quests', JSON.stringify({ date: today, quests: customQuests }))
        syncToDatabase()
        window.dispatchEvent(new CustomEvent('ai_quests_updated'))
        
        if ("Notification" in window && Notification.permission === "granted") {
          setTimeout(() => {
            new Notification("تذكير من المرشد الذكي 🤖", {
              body: "قاديت ليك برنامج مخصص، سير شوفو وبدا أول مهمة باش تحس براسك أحسن!",
              vibrate: [200, 100, 200]
            })
          }, 5000)
        }
        setHasGenerated(true)
      }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'model', text: 'سمح ليا كاين شي ضغط دابا، عاود جرب مرة خرى. 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  const resetChat = () => {
    setMessages([{ role: 'model', text: 'عاود ليا شنو كاين، أنا هنا باش نعاونك! 🌿' }])
    setHasGenerated(false)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[75vh]">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-4 text-center">
        <h1 className="text-3xl font-black mb-1 gradient-text font-serif">المرشد الذكي AI</h1>
        <p style={{ color:'var(--muted)' }} className="text-sm opacity-60 uppercase tracking-widest font-bold">Zen Personal Guide</p>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto glass p-6 mb-4 flex flex-col gap-6 rounded-3xl relative shadow-inner">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} 
            className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'model' ? 'self-start bg-white/5 border border-white/5' : 'self-end bg-gradient-to-br from-[#34d399] to-[#059669] text-white font-medium border border-white/10 shadow-lg'}`}
          >
            {m.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="self-start text-[var(--muted)] text-xs p-2 glass rounded-xl">
            الذكاء الاصطناعي يفكر... ⏳
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <AnimatePresence>
        {hasGenerated && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="mb-4 text-center py-5 px-6 rounded-[2rem] glass border-[#34d399]/30 shadow-[0_0_40px_rgba(52,211,153,0.1)]">
            <p className="font-bold text-[#6ee7b7] mb-2 text-xl">🎉 قاديت ليك البرنامج ديالك!</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={() => setPage('dashboard')} className="btn-zen py-3 px-8 text-[#0a0f1a] font-bold shadow-xl">
                 سير شوفو 🔥
              </button>
              <button onClick={resetChat} className="btn-ghost text-xs py-3 px-6 opacity-40 hover:opacity-100 transition-opacity">
                 محادثة جديدة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <input 
          type="text" 
          placeholder="كيفاش كتحس اليوم؟ كتب ليا..." 
          className="zen-input py-4 pr-6"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-zen px-8 shadow-xl font-bold disabled:opacity-20 flex items-center gap-2">
          {loading ? '...' : 'صيفط'}
        </button>
      </div>
    </div>
  )
}
