import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

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
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const prompt = `You are a Moroccan psychologist and positive life coach. Reply ENTIRELY in Moroccan Darija.
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
        messages: [
          { role: "system", content: prompt },
          ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
          { role: "user", content: userMsg }
        ],
        model: "openai",
        jsonMode: true,
        code: "hamza-amirni-bot",
        seed: Math.floor(Math.random() * 1000)
      }

      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      let textResponse;
      if (!res.ok) {
        // Fallback GET
        const getUrl = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&system=${encodeURIComponent(prompt)}&seed=${Math.floor(Math.random() * 1000)}&jsonMode=true`
        const getRes = await fetch(getUrl)
        if (!getRes.ok) throw new Error('API Error')
        textResponse = await getRes.text()
      } else {
        textResponse = await res.text()
      }
      
      // Clean up markdown syntax if Pollinations wraps it
      let cleanResp = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
      
      const aiResponse = JSON.parse(cleanResp)

      setMessages(prev => [...prev, { role: 'model', text: aiResponse.message }])

      if (aiResponse.quests && aiResponse.quests.length > 0) {
        const customQuests = aiResponse.quests.map((q, i) => ({ ...q, id: `ai_quest_${Date.now()}_${i}` }))
        const today = new Date().toISOString().split('T')[0]
        
        // Save to local storage
        localStorage.setItem('zs_custom_quests', JSON.stringify({ date: today, quests: customQuests }))
        syncToDatabase()
        
        // Notify the app about the new quests
        window.dispatchEvent(new CustomEvent('ai_quests_updated'))
        
        // Schedule browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          setTimeout(() => {
            new Notification("تذكير من المرشد الذكي 🤖", {
              body: "قاديت ليك برنامج مخصص، سير شوفو وبدا أول مهمة باش تحس براسك أحسن!",
              vibrate: [200, 100, 200]
            })
          }, 5000) // Send notification reminder in 5 seconds
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
        <h1 className="text-3xl font-black mb-1 gradient-text">المرشد الذكي AI</h1>
        <p style={{ color:'var(--muted)' }} className="text-sm">غنجاوبك ونصاوب ليك برنامج مناسب لحالتك</p>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto glass p-4 mb-4 flex flex-col gap-4 rounded-2xl relative">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} 
            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'model' ? 'self-start' : 'self-end bg-[rgba(110,231,183,0.15)] text-[#6ee7b7] border border-[rgba(110,231,183,0.3)]'}`}
            style={m.role === 'model' ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
          >
            {m.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="self-start text-[var(--muted)] text-xs p-2">
            كيفكر المرجو الانتظار... ⏳
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <AnimatePresence>
        {hasGenerated && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="mb-4 text-center py-3 px-4 rounded-xl"
            style={{ background:'rgba(110,231,183,0.15)', border:'1px solid rgba(110,231,183,0.3)' }}>
            <p className="font-bold text-[#6ee7b7] mb-1">🎉 قادينا ليك البرنامج السحري ديالك!</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button onClick={() => setPage('dashboard')} className="btn-zen text-xs py-1.5 px-4 text-[#0a0f1a]">
                 سير للرئيسية باش تشوفو 🔥
              </button>
              <button onClick={resetChat} className="btn-ghost text-xs py-1.5 px-4">
                 محادثة جديدة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="كيفاش كتحس اليوم؟ كتب ليا..." 
          className="zen-input"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-zen px-6 disabled:opacity-50">
          صيفط
        </button>
      </div>
    </div>
  )
}

