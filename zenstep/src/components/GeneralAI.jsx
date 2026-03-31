import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function GeneralAI() {
  const { syncToDatabase } = useAuth()
  
  // Load initial messages from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('zs_chat')
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'أهلاً! أنا المساعد الذكي ديالك. تقدر تسولني على أي حاجة بغيتي، أنا هنا باش نعاونك ونقصر معاك. 😊' }
    ]
  })
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Persistence
    localStorage.setItem('zs_chat', JSON.stringify(messages))
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    
    const newMessages = [...messages, { role: 'user', text: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const systemPrompt = "ZenBot. Friendly. Darija assistant created by Hamza Amirni."
      let aiText = ''

      // 1. Try Nexra (GPT-4) - High stability
      try {
        const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.slice(-5).map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
            prompt: userMsg,
            model: "GPT-4",
            markdown: false
          })
        })
        const data = await res.json()
        if (data.gpt) aiText = data.gpt
      } catch (e) { console.warn("Nexra failed") }

      // 2. Pollinations Fallback
      if (!aiText) {
        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&cache=${Date.now()}`)
          if (res.ok) aiText = await res.text()
        } catch (e) { console.warn("Pollinations failed") }
      }

      if (!aiText) throw new Error('Providers unavailable. Check internet/adblock.')
      
      const updatedMessages = [...newMessages, { role: 'model', text: aiText.trim() }]
      setMessages(updatedMessages)
      syncToDatabase() // Push to Supabase
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error: ${error.message}. جرب تعاود تصيفط دابا نيت.` }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    if (window.confirm('واش بصح بغيتي تمسح كاع الميساجات؟')) {
      const reset = [{ role: 'model', text: 'أهلاً! أنا هنا باش نعاونك من جديد. 😊' }]
      setMessages(reset)
      localStorage.setItem('zs_chat', JSON.stringify(reset))
      syncToDatabase()
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6ee7b7] to-[#a78bfa] flex items-center justify-center text-xl shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-black gradient-text">ZenBot AI</h1>
            <p style={{ color: 'var(--muted)' }} className="text-[10px]">مساعدك الذكي الشخصي</p>
          </div>
        </div>
        
        <button onClick={clearChat} className="text-xs opacity-50 hover:opacity-100 transition-opacity bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)]">
          🗑️ مسح المحادثة
        </button>
      </div>

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
    </div>
  )
}
