import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Trash2, Send, Bot, User, X, AlertCircle, Sparkles } from 'lucide-react'
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
      const systemPrompt = "Mochida. Friendly Darija AI by Hamza Amirni."
      let aiText = ''

      // 1. Try Stable AI (GPT-4o-mini) - From Hamza's script logic
      try {
        const res = await fetch(`https://all-in-1-ais.officialhectormanuel.workers.dev/?query=${encodeURIComponent(systemPrompt + " " + userMsg)}&model=gpt-4o-mini`)
        if (res.ok) {
          const data = await res.json()
          aiText = data?.choices?.[0]?.message?.content || data?.reply || data?.message
        }
      } catch (e) { console.warn("Stable AI failed") }

      // 2. Try LuminAI - From Hamza's script
      if (!aiText) {
        try {
          const res = await fetch("https://luminai.my.id/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: userMsg, user: msgId, prompt: systemPrompt })
          })
          const data = await res.json()
          aiText = data.result || data.response
        } catch (e) { console.warn("LuminAI failed") }
      }

      // 3. Try Vreden GPT/Blackbox - From Hamza's script
      if (!aiText) {
        try {
          const res = await fetch(`https://api.vreden.my.id/api/ai/gpt?query=${encodeURIComponent(userMsg)}`)
          const data = await res.json()
          aiText = data.result || data.response
        } catch (e) { console.warn("Vreden GPT failed") }
      }

      // 4. Final Pollinations Fallback (Direct GET)
      if (!aiText) {
        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userMsg)}?model=openai&cache=${Date.now()}`)
          if (res.ok) aiText = await res.text()
        } catch (e) { console.error("All fallbacks failed") }
      }

      if (!aiText) throw new Error('Providers busy. Try again.')
      
      const aiMsgId = Date.now().toString() + "_ai"
      const updatedMessages = [...newMessages, { id: aiMsgId, role: 'model', text: aiText.trim() }]
      setMessages(updatedMessages)
      syncToDatabase()
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err_'+Date.now(), role: 'model', text: `⚠️ **System Error:** ${error.message}` }])
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#34d399] to-[#10b981] shadow-[0_0_20px_rgba(52,211,153,0.3)] rotate-3">
            <Sparkles size={24} className="text-[#0a1424]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight gradient-text">ZenBot AI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 italic">Hamza Hybrid Intelligence</span>
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

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto glass p-6 mb-4 flex flex-col gap-6 rounded-[2.5rem] relative shadow-inner scrollbar-hide border border-white/5">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative max-w-[88%] p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-xl ${
                m.role === 'model' 
                  ? 'self-start bg-[rgba(255,255,255,0.03)] border border-white/[0.08] rounded-tl-none' 
                  : 'self-end bg-gradient-to-br from-[#34d399] to-[#10b981] text-[#0a1424] font-semibold rounded-tr-none'
              }`}
            >
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{m.text}</ReactMarkdown>
              
              <button 
                onClick={() => deleteMessage(m.id)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-2xl border border-white/10"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex gap-1.5 p-4 glass rounded-2xl border border-white/5">
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
          className="zen-input pr-36 py-5 h-auto text-lg shadow-2xl rounded-3xl border-white/5 bg-white/[0.02] focus:bg-white/[0.05] transition-all"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="absolute left-3 top-1/2 -translate-y-1/2 btn-zen px-8 py-3.5 shadow-2xl hover:brightness-110 active:scale-95 disabled:opacity-20 transition-all flex items-center gap-2"
        >
          {loading ? '...' : <><Send size={18} /> إرسال</>}
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[3rem] max-w-sm w-full text-center border border-white/10 shadow-2xl"
            >
              <AlertCircle size={48} className="mx-auto mb-6 text-red-400" />
              <h2 className="text-2xl font-black mb-3 text-white">متأكد؟</h2>
              <p className="text-sm opacity-50 mb-10 leading-relaxed">غا يتمسح كاع تاريخ المحادثة ديالك وما غيبقاش ف Supabase.</p>
              
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 text-sm font-bold opacity-30 hover:opacity-100 text-white">تراجع</button>
                <button onClick={doClearChat} className="flex-1 py-4 bg-red-500 rounded-2xl text-sm font-black hover:bg-red-600 transition-colors text-white shadow-lg">مسح الكل</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-[10px] text-center mt-5 opacity-10 uppercase tracking-[0.3em] font-black">
        Hybrid AI Integration • Neural v3.0
      </p>
    </div>
  )
}
