import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Trash2, Send, Bot, User, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function GeneralAI() {
  const { syncToDatabase } = useAuth()
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('zs_chat')
    return saved ? JSON.parse(saved) : [
      { id: '1', role: 'model', text: 'أهلاً! أنا المساعد الذكي ديالك. تقدر تسولني على أي حاجة بغيتي، أنا هنا باش نعاونك ونقصر معاك. 😊' }
    ]
  })
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    localStorage.setItem('zs_chat', JSON.stringify(messages))
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    
    const msgId = Date.now().toString()
    const newMessages = [...messages, { id: msgId, role: 'user', text: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const systemPrompt = "Mochida. Friendly Darija AI."
      let aiText = ''

      try {
        const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMsg,
            messages: newMessages.slice(-5).map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
            model: "GPT-4",
            markdown: true
          })
        })
        const data = await res.json()
        if (data.gpt) aiText = data.gpt
        else if (data.result) aiText = data.result
      } catch (e) { console.warn("Nexra failed") }

      if (!aiText) {
        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&system=${encodeURIComponent(systemPrompt)}`)
          if (res.ok) aiText = await res.text()
        } catch (e) { console.error("All providers failed") }
      }

      if (!aiText) throw new Error('Providers busy. Try again.')
      
      const aiMsgId = Date.now().toString() + "_ai"
      const updatedMessages = [...newMessages, { id: aiMsgId, role: 'model', text: aiText.trim() }]
      setMessages(updatedMessages)
      syncToDatabase()
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err_'+Date.now(), role: 'model', text: `⚠️ **Error:** ${error.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    syncToDatabase()
  }

  const doClearChat = () => {
    const reset = [{ id: '1', role: 'model', text: 'أهلاً! أنا هنا باش نعاونك من جديد. 😊' }]
    setMessages(reset)
    syncToDatabase()
    setShowConfirm(false)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[85vh] relative text-[rgba(255,255,255,0.9)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6ee7b7] to-[#a78bfa] flex items-center justify-center shadow-2xl rotate-3 border border-white/20">
            <Bot size={28} className="text-[#0a1424]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight gradient-text">ZenBot AI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Active Neural Cloud</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowConfirm(true)} 
          className="flex items-center gap-2 text-[11px] font-bold opacity-40 hover:opacity-100 transition-all hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-tighter"
        >
          <Trash2 size={14} /> مسح الكل
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto glass p-6 mb-4 flex flex-col gap-6 rounded-[2.5rem] relative shadow-inner scrollbar-hide border border-white/5">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, y: 30, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className={`group relative max-w-[85%] p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-xl ${
                m.role === 'model' 
                  ? 'self-start bg-[rgba(255,255,255,0.04)] border border-white/[0.08] rounded-tl-none' 
                  : 'self-end bg-gradient-to-br from-[#34d399] to-[#10b981] text-[#0a1b35] font-semibold rounded-tr-none'
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-0">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              
              <button 
                onClick={() => deleteMessage(m.id)}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-2xl border border-white/10 scale-90"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex gap-2 p-4 glass rounded-3xl border border-white/5">
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="relative pt-2 group">
        <input 
          type="text" 
          placeholder="كتب شي حاجة هنا..." 
          className="zen-input pr-36 py-5 h-auto text-lg shadow-2xl rounded-3xl border-white/5 bg-white/[0.03] focus:bg-white/[0.05] transition-all"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="absolute left-3 top-1/2 -translate-y-[40%] btn-zen px-8 py-3 shadow-2xl hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2"
        >
          {loading ? '...' : <><Send size={18} /> إرسال</>}
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[2.5rem] max-w-sm w-full text-center border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <AlertCircle size={48} className="mx-auto mb-6 text-red-400" />
              <h2 className="text-xl font-black mb-2">واش بصح؟</h2>
              <p className="text-sm opacity-60 mb-8 leading-relaxed">بصي، غا يتمسح كاع تاريخ المحادثة ديالك وما غيبقاش ف Supabase.</p>
              
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity">تراجع</button>
                <button onClick={doClearChat} className="flex-1 py-4 bg-red-500 rounded-2xl text-sm font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 text-white">مسح المحادثة</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-[10px] text-center mt-4 opacity-20 uppercase tracking-widest font-black">
        Cloud Synced AI • v2.0
      </p>
    </div>
  )
}
