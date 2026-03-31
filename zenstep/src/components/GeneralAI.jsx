import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function GeneralAI() {
  const { syncToDatabase } = useAuth()
  
  // Load initial messages from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('zs_chat')
    return saved ? JSON.parse(saved) : [
      { id: '1', role: 'model', text: 'أهلاً! أنا المساعد الذكي ديالك. تقدر تسولني على أي حاجة بغيتي، أنا هنا باش نعاونك ونقصر معاك. 😊' }
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
    
    // Use stable ID for each message
    const msgId = Date.now().toString()
    const newMessages = [...messages, { id: msgId, role: 'user', text: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const systemPrompt = "Mochida. Friendly Darija AI."
      let aiText = ''

      // 1. Try Nexra (Fastest & Most stable for free)
      try {
        const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMsg,
            messages: newMessages.slice(-4).map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
            model: "GPT-4", // Stick to GPT-4 but handle failures better
            markdown: false
          })
        })
        const data = await res.json()
        if (data.gpt) aiText = data.gpt
        else if (data.result) aiText = data.result
      } catch (e) { 
        console.warn("Nexra GPT-4 failed, trying fallback...")
      }

      // 2. Pollinations Fallback (Direct GET is very stable)
      if (!aiText) {
        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&system=${encodeURIComponent(systemPrompt)}`)
          if (res.ok) aiText = await res.text()
        } catch (e) {
          console.error("All AI providers failed")
        }
      }

      if (!aiText) throw new Error('Providers busy. Wait 5s and try again.')
      
      const aiMsgId = Date.now().toString() + "_ai"
      const updatedMessages = [...newMessages, { id: aiMsgId, role: 'model', text: aiText.trim() }]
      setMessages(updatedMessages)
      syncToDatabase()
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { id: 'err_'+Date.now(), role: 'model', text: `⚠️ Error: ${error.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = (id) => {
    const filtered = messages.filter(m => m.id !== id)
    setMessages(filtered)
    syncToDatabase()
  }

  const clearChat = () => {
    if (window.confirm('واش بصح بغيتي تمسح كاع الميساجات؟')) {
      const reset = [{ id: '1', role: 'model', text: 'أهلاً! أنا هنا باش نعاونك من جديد. 😊' }]
      setMessages(reset)
      syncToDatabase()
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh]">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6ee7b7] to-[#a78bfa] flex items-center justify-center text-2xl shadow-xl rotate-3">
            🤖
          </div>
          <div>
            <h1 className="text-2xl font-black gradient-text">ZenBot AI</h1>
            <p className="text-[10px] opacity-40 uppercase tracking-widest">Active Intelligence</p>
          </div>
        </div>
        
        <button onClick={clearChat} className="text-[10px] font-bold opacity-40 hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-300 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-tighter">
          🗑️ مسح الكل
        </button>
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto glass p-6 mb-4 flex flex-col gap-6 rounded-[2.5rem] relative shadow-inner scrollbar-hide">
        {messages.map((m, i) => (
          <motion.div 
            key={m.id || i} 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className={`group relative max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${
              m.role === 'model' 
                ? 'self-start bg-white/[0.03] border border-white/[0.08] rounded-tl-none' 
                : 'self-end bg-gradient-to-br from-[#34d399] to-[#10b981] text-[#0a1424] font-semibold rounded-tr-none'
            }`}
          >
            {m.text}
            
            {/* Delete Single Message Button */}
            <button 
              onClick={() => deleteMessage(m.id)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 shadow-lg border border-white/20"
            >
              ×
            </button>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex gap-1.5 p-3 glass rounded-2xl">
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="relative pt-2">
        <input 
          type="text" 
          placeholder="كتب شي حاجة هنا..." 
          className="zen-input pr-32 py-5 h-auto text-lg shadow-2xl rounded-3xl border-white/5 bg-white/[0.02] focus:bg-white/[0.04]"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="absolute left-3 top-1/2 -translate-y-[40%] btn-zen px-8 py-3 shadow-2xl disabled:opacity-20 disabled:grayscale transition-all active:scale-95"
        >
          {loading ? '...' : 'إرسال'}
        </button>
      </div>
      <p className="text-[9px] text-center mt-3 opacity-20 uppercase tracking-[0.2em] font-medium">
        Syncing with Supabase Cloud
      </p>
    </div>
  )
}
