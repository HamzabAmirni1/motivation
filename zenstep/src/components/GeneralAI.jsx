import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Trash2, Send, Bot, User, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Real Direct Gemini Key from user script
const GEMINI_KEY = "AIzaSyBKKEI-q1qM7mRz0cHA9Qs5KA2hM2ElR8U"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

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
      const systemPrompt = "You are ZenBot, a friendly mental wellness assistant specialized in Darija (Moroccan Arabic). You are created by Hamza Amirni. Keep your responses empathetic and helpful."
      let aiText = ''

      // 1. Try Direct Gemini (Stable & Professional)
      try {
        const payload = {
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...newMessages.slice(-6).map(m => ({
              role: m.role === 'model' ? "model" : "user",
              parts: [{ text: m.text }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }

        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          aiText = data.candidates[0].content.parts[0].text
          console.log("Success with Direct Gemini")
        }
      } catch (e) {
        console.warn("Direct Gemini failed, trying Nexra fallback...")
      }

      // 2. Nexra Fallback
      if (!aiText) {
        try {
          const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userMsg,
              messages: newMessages.slice(-5).map(m => ({ role: m.role === 'model' ? "assistant" : "user", content: m.text })),
              model: "CHATGPT",
              markdown: true
            })
          })
          const data = await res.json()
          aiText = data.gpt || data.result
        } catch (e) { console.warn("Nexra Fallback failed") }
      }

      if (!aiText) throw new Error('AI systems currently unavailable. Try again in 30s.')
      
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6ee7b7] to-[#a78bfa] flex items-center justify-center shadow-2xl rotate-3 border border-white/20">
            <Bot size={28} className="text-[#0a1424]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight gradient-text">ZenBot AI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-pulse shadow-[0_0_8px_#6ee7b7]" />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Direct Gemini Engine</span>
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
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              className={`group relative max-w-[88%] p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-xl ${
                m.role === 'model' 
                  ? 'self-start bg-[rgba(255,255,255,0.03)] border border-white/[0.06] rounded-tl-none text-[rgba(255,255,255,0.85)]' 
                  : 'self-end bg-gradient-to-br from-[#34d399] to-[#059669] text-white font-medium rounded-tr-none shadow-[#059669]/10'
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-0 prose-headings:text-white prose-strong:text-[#6ee7b7]">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              
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
          className="zen-input pr-36 py-5 h-auto text-lg shadow-2xl rounded-3xl border-white/5 bg-white/[0.02] focus:bg-white/[0.05] transition-all placeholder:opacity-30"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="absolute left-3 top-1/2 -translate-y-1/2 btn-zen px-8 py-3.5 shadow-2xl hover:brightness-110 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all flex items-center gap-2 group"
        >
          {loading ? '...' : <><Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> إرسال</>}
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass p-10 rounded-[3rem] max-w-sm w-full text-center border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.6)]"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle size={40} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-black mb-3">متأكد؟</h2>
              <p className="text-sm opacity-50 mb-10 leading-relaxed font-medium">غا يتمسح كاع تاريخ المحادثة ديالك وما غيبقاش ف Supabase نهائياً.</p>
              
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 text-sm font-bold opacity-30 hover:opacity-100 transition-opacity">تراجع</button>
                <button onClick={doClearChat} className="flex-1 py-4 bg-red-500 rounded-2xl text-sm font-black hover:bg-red-600 transition-colors shadow-[0_10px_30px_rgba(239,68,68,0.3)] text-white">مسح دائم</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-[10px] text-center mt-5 opacity-10 uppercase tracking-[0.3em] font-black">
        Encrypted Sync • Neural v2.5
      </p>
    </div>
  )
}
