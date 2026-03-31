import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GeneralAI() {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'أهلاً! أنا المساعد الذكي ديالك. تقدر تسولني على أي حاجة بغيتي، أنا هنا باش نعاونك ونقصر معاك. 😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      const systemPrompt = "Friendly AI assistant. Reply in Moroccan Darija."
      
      const payload = {
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-3).map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
          { role: "user", content: userMsg }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 1000)
      }

      // 1. Try POST (Pollinations)
      let aiText = ''
      try {
        const res = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000)
        })
        if (res.ok) aiText = await res.text()
      } catch (e) { console.error("Pollinations POST failed") }

      // 2. Try GET (Pollinations) - Simple version
      if (!aiText) {
        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&seed=${Date.now()}`, {
            signal: AbortSignal.timeout(10000)
          })
          if (res.ok) aiText = await res.text()
        } catch (e) { console.error("Pollinations GET failed") }
      }

      // 3. Try LuminAI (Fallback from chatbot script)
      if (!aiText) {
        try {
          const res = await fetch('https://luminai.my.id/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: userMsg, user: "zenbot_user" }),
            signal: AbortSignal.timeout(10000)
          })
          if (res.ok) {
            const data = await res.json()
            aiText = data.result
          }
        } catch (e) { console.error("LuminAI failed") }
      }

      if (!aiText) throw new Error('All AI providers failed')
      setMessages(prev => [...prev, { role: 'model', text: aiText.trim() }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'model', text: 'سمح ليا، كاين دابا ضغط كبير. عاود صيفط الميساج دابا نيت، أنا معاك. 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6ee7b7] to-[#a78bfa] flex items-center justify-center text-2xl shadow-lg">
          🤖
        </div>
        <div>
          <h1 className="text-2xl font-black gradient-text">ZenBot AI</h1>
          <p style={{ color: 'var(--muted)' }} className="text-xs">مساعدك الذكي الشخصي</p>
        </div>
      </motion.div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto glass p-6 mb-4 flex flex-col gap-4 rounded-3xl relative shadow-inner">
        {messages.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'model' 
                ? 'self-start bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]' 
                : 'self-end bg-gradient-to-br from-[#34d399] to-[#10b981] text-[#0a0f1a] font-medium'
            }`}
          >
            {m.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex gap-1 p-2">
            <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="relative group">
        <input 
          type="text" 
          placeholder="كتب شي حاجة هنا..." 
          className="zen-input pr-24 py-4 h-auto text-base shadow-xl"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="absolute left-2 top-1/2 -translate-y-1/2 btn-zen px-6 py-2 shadow-lg disabled:opacity-30 disabled:grayscale"
        >
          {loading ? '...' : 'إرسال'}
        </button>
      </div>
      
      <p className="text-[10px] text-center mt-4 opacity-30">
        الذكاء الاصطناعي يمكن أن يخطئ. تأكد من المعلومات المهمة.
      </p>
    </div>
  )
}
