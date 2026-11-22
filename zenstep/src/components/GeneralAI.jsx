import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Trash2, Send, Bot, User, X, AlertCircle, Sparkles, MessageCircle, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { askZenAI } from '../services/aiService'

const SUGGESTED_QUESTIONS = [
  'حاس بالضغط والتوتر اليوم 😟',
  'عطيني تمرين تنفس مهدئ دابا 🌬️',
  'كيفاش نرتب أفكاري ونركز؟ 🎯',
  'شي فكرة إيجابية تبدل ليا المود ✨',
  'Je me sens fatigué et stressé 🌿',
  'Help me calm down before sleep 🌙'
];

export default function GeneralAI() {
  const { profile, getMoodLogs, syncToDatabase } = useAuth()
  const moodLogs = getMoodLogs()
  const recentMood = moodLogs[0]?.label || null

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('zs_chat')
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        role: 'model',
        text: 'أهلاً بك في Zen AI 💚 أنا رفيقك الذكي للعافية النفسية وراحة البال. كيفاش كتحس اليوم؟ شاركني شنو شاغلك وأنا هنا باش نسمعك ونعاونك خطوة بخطوة.'
      }
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

  const handleSend = async (textToSend = null) => {
    const userMsg = (textToSend || input).trim()
    if (!userMsg || loading) return
    setInput('')
    
    const msgId = Date.now().toString()
    const newMessages = [...messages, { id: msgId, role: 'user', text: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const userContext = {
        mood: recentMood,
        streak: profile?.streak_count || 0,
        xp: profile?.xp || 0
      }

      const { text } = await askZenAI(userMsg, newMessages, userContext)

      const aiMsgId = Date.now().toString() + "_ai"
      const updatedMessages = [...newMessages, { id: aiMsgId, role: 'model', text }]
      setMessages(updatedMessages)
      syncToDatabase()
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'model',
          text: 'أنا هنا معاك دايماً. خود نفس عميق، وقول ليا كيفاش نقدر نعاونك دابا بكلماتك البسيطة. 🌱'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    syncToDatabase()
  }

  const doClearChat = () => {
    const reset = [{
      id: '1',
      role: 'model',
      text: 'أهلاً بك من جديد! 🌿 كيف أقدر أساعدك اليوم في صفاء ذهنك وراحتك؟'
    }]
    setMessages(reset)
    syncToDatabase()
    setShowConfirm(false)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[82vh] relative text-[rgba(255,255,255,0.9)] pb-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6ee7b7, #10b981)' }}>
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Zen AI Assistant</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30">
                مساعد العافية الذكي
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">استماع تعاطفي، تقنيات استرخاء، وتوجيه نفسي إيجابي</p>
          </div>
        </div>

        <button 
          onClick={() => setShowConfirm(true)} 
          className="text-xs text-[var(--muted)] hover:text-red-400 flex items-center gap-1.5 glass hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-colors"
        >
          <Trash2 size={13} /> <span>مسح المحادثة</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none px-1">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full glass hover:bg-white/10 text-[var(--subtle)] hover:text-white border border-white/5 transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto glass p-4 md:p-6 mb-3 flex flex-col gap-4 rounded-[2rem] relative shadow-inner border border-white/5">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, scale: 0.96, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative max-w-[85%] p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-md ${
                m.role === 'model' || m.role === 'assistant'
                  ? 'self-start bg-[rgba(255,255,255,0.03)] border border-white/[0.08] rounded-tl-none text-white' 
                  : 'self-end bg-gradient-to-br from-[#34d399] to-[#059669] text-[#0a1424] font-medium rounded-tr-none shadow-lg'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold opacity-60">
                {m.role === 'model' || m.role === 'assistant' ? (
                  <>
                    <Bot size={12} className="text-[#6ee7b7]" />
                    <span>Zen AI</span>
                  </>
                ) : (
                  <>
                    <User size={12} />
                    <span>{profile?.username || 'أنت'}</span>
                  </>
                )}
              </div>

              <ReactMarkdown className="prose prose-invert prose-sm max-w-none text-xs md:text-sm leading-relaxed">
                {m.text || m.content || ''}
              </ReactMarkdown>
              
              <button 
                onClick={() => deleteMessage(m.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#161b27] text-[var(--muted)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-white/10 shadow-lg"
                title="حذف الرسالة"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex items-center gap-2 p-3 glass rounded-2xl border border-white/5">
            <Bot size={16} className="text-[#6ee7b7] animate-pulse" />
            <span className="text-xs text-[var(--subtle)]">Zen AI يكتب الرد...</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-[#6ee7b7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="اكتب رسالتك لـ Zen AI (دارجة، عربية، إنجليزية، فرنسية)..." 
          className="zen-input pr-4 pl-32 py-4 text-sm shadow-xl rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.06] transition-all"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={() => handleSend()} 
          disabled={loading || !input.trim()} 
          className="absolute left-2 top-1/2 -translate-y-1/2 btn-zen px-5 py-2.5 shadow-lg font-bold text-xs disabled:opacity-20 transition-all flex items-center gap-1.5"
        >
          {loading ? '...' : <><Send size={14} /> <span>إرسال</span></>}
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 rounded-3xl max-w-sm w-full text-center border border-white/10 shadow-2xl"
            >
              <AlertCircle size={40} className="mx-auto mb-3 text-red-400" />
              <h2 className="text-xl font-bold mb-2 text-white">مسح المحادثة؟</h2>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                سيتم مسح سجل المحادثة بالكامل وإعادة ضبطها من البداية.
              </p>
              
              <div className="flex gap-3">
                <button onClick={doClearChat} className="flex-1 py-3 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-lg">
                  مسح الكل
                </button>
                <button onClick={() => setShowConfirm(false)} className="btn-ghost flex-1 py-3 text-xs">
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
