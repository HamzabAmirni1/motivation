import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Trash2, Send, Bot, User, X, AlertCircle, Sparkles,
  Copy, Check, BookPlus, Table, ArrowRight, ExternalLink,
  Flame, Wind, Headphones, Gamepad2, Heart, RotateCcw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { askZenAI } from '../services/aiService'

// Detect if text is predominantly Arabic/Darija (RTL) or Latin/French/English (LTR)
export function detectTextDir(text) {
  if (!text || typeof text !== 'string') return 'rtl'
  // Remove markdown formatting, digits, spaces, emojis, punctuation
  const clean = text.replace(/[\p{Emoji}\p{Symbol}\p{Punctuation}\d\s#*_`~>|[\]()\-:]/gu, '')
  if (!clean) return 'rtl'
  const arabicMatch = clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []
  const latinMatch = clean.match(/[A-Za-z\u00C0-\u024F]/g) || []
  return arabicMatch.length >= latinMatch.length ? 'rtl' : 'ltr'
}

// Split text into pure markdown prose and table blocks
function parseMarkdownTables(text) {
  if (!text || typeof text !== 'string') return []
  // Matches markdown tables: | a | b |\n|---|---|\n| c | d |
  const tableRegex = /(?:(?:^|\n)(?:\|[^\n]+\|\r?\n)(?:\|(?:\s*[:-]+[-| :]*\s*)\|\r?\n)(?:\|[^\n]+\|\r?\n?)+)/g

  const segments = []
  let lastIndex = 0
  let match

  while ((match = tableRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    segments.push({ type: 'table', content: match[0].trim() })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

// Render custom responsive high-end Markdown Table
function renderCustomTable(tableText, tableDir = 'rtl') {
  const lines = tableText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return <pre className="text-xs">{tableText}</pre>

  const parseCells = (line) => {
    return line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(c => c.trim())
  }

  const headers = parseCells(lines[0])
  const rows = lines.slice(2).map(parseCells)

  return (
    <div className="my-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 shadow-xl" dir={tableDir}>
      <table className="w-full text-xs border-collapse min-w-[280px]">
        <thead>
          <tr className="bg-[#6ee7b7]/15 text-[#6ee7b7] font-bold border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-3 text-start border-x border-white/5 font-black whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.04] transition-colors"
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2.5 border-x border-white/5 text-[var(--text)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Parse [ACTION:TYPE:LABEL] tags from AI text
function parseActionsFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return { cleanText: '', actions: [] }
  const actionRegex = /\[ACTION:([A-Z_]+)(?::([^\]]+))?\]/g
  const actions = []
  let match
  while ((match = actionRegex.exec(rawText)) !== null) {
    actions.push({
      type: match[1],
      label: match[2] || match[1]
    })
  }
  const cleanText = rawText.replace(actionRegex, '').trim()
  return { cleanText, actions }
}

export default function GeneralAI({ setPage }) {
  const { profile, getMoodLogs, syncToDatabase } = useAuth()
  const { t, lang, dir } = useLanguage()
  const moodLogs = getMoodLogs ? getMoodLogs() : []
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
  const [copiedId, setCopiedId] = useState(null)
  const [savedJournalId, setSavedJournalId] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const endRef = useRef(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    localStorage.setItem('zs_chat', JSON.stringify(messages))
  }, [messages, loading])

  // Suggested Prompts with quick table & button generation
  const suggestedPrompts = [
    { label: '📊 جدول تنظيم اليوم ومحاربة التوتر', prompt: 'صاوب ليا جدول زمني منظم بـ Markdown Table (جدول فيه أعمدة: الوقت | النشاط | الفائدة) لتنظيم اليوم وتخفيف التوتر مع تمارين الراحة' },
    { label: '📋 جدول تفكيك الأفكار السلبية (CBT)', prompt: 'قاد ليا جدول 4 أعمدة منسق بـ Markdown Table بتقنية CBT لتفكيك الأفكار المشوهة (الموقف | الفكرة التلقائية | الفحص الواقعي | الفكرة المتوازنة)' },
    { label: '🌬️ تمرين تنفس مهدئ دابا', prompt: 'عطيني تمرين تنفس مهدئ دابا مع الخطوات بدقة' },
    { label: '🎯 جدول العادات اليومية الإيجابية', prompt: 'اقترح ليا جدول عادات يومية أسبوعي منسق بـ Markdown Table لتعزيز طاقتي وراحتي النفسية' },
    { label: '🌙 المساعدة على النعاس والراحة', prompt: 'حاس بالأرق وصعوبة النعاس، شنو الخطوات اللي ندير دابا باش نرتاح؟' },
  ]

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
        xp: profile?.xp || 0,
        language: lang
      }

      const { text } = await askZenAI(userMsg, newMessages, userContext)

      const aiMsgId = Date.now().toString() + "_ai"
      const updatedMessages = [...newMessages, { id: aiMsgId, role: 'model', text }]
      setMessages(updatedMessages)
      if (syncToDatabase) syncToDatabase()
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'model',
          text: 'أنا هنا معاك دايماً 💚 خود نفس عميق، وقول ليا كيفاش نقدر نعاونك دابا بكلماتك البسيطة. [ACTION:BREATHE:🌬️ تمرين تنفس مهدئ]'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (action) => {
    if (!setPage) return
    switch (action.type) {
      case 'BREATHE':
      case 'GROUNDING':
      case 'CBT':
        setPage('tools')
        break
      case 'SOUNDS':
        setPage('sounds')
        break
      case 'JOURNAL':
        setPage('journal')
        break
      case 'GAMES':
        setPage('games')
        break
      default:
        setPage('tools')
    }
  }

  const handleCopyMessage = (id, text) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    showToast(t('common_copied', 'تم النسخ بنجاح ✓'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveToJournal = (id, text) => {
    try {
      const existing = JSON.parse(localStorage.getItem('zs_journal') || '[]')
      const newEntry = {
        id: Date.now().toString(),
        title: 'فكرة من Zen AI 🌱',
        body: text,
        mood: 'calm',
        tags: ['Zen AI', 'إلهام'],
        created_at: new Date().toISOString()
      }
      existing.unshift(newEntry)
      localStorage.setItem('zs_journal', JSON.stringify(existing))
      setSavedJournalId(id)
      showToast('تم الحفظ في المذكرة الخاصة بنجاح ✓')
      setTimeout(() => setSavedJournalId(null), 2500)
    } catch (err) {
      console.warn('Save to journal failed:', err)
    }
  }

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    if (syncToDatabase) syncToDatabase()
  }

  const doClearChat = () => {
    const reset = [{
      id: '1',
      role: 'model',
      text: 'أهلاً بك من جديد! 🌿 كيف أقدر أساعدك اليوم في صفاء ذهنك وراحتك؟'
    }]
    setMessages(reset)
    if (syncToDatabase) syncToDatabase()
    setShowConfirm(false)
    showToast('تمت إعادة ضبط المحادثة ✓')
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[82vh] relative text-[rgba(255,255,255,0.9)] pb-2" dir={dir}>
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#6ee7b7] text-black text-xs font-bold shadow-2xl flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #6ee7b7, #10b981)' }}>
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{t('ai_title', 'Zen AI Assistant')}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30">
                AI Wellness
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">{t('ai_subtitle', 'استماع تعاطفي، تقنيات استرخاء، وتوجيه نفسي إيجابي')}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowConfirm(true)} 
          className="text-xs text-[var(--muted)] hover:text-red-400 flex items-center gap-1.5 glass hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-colors"
          title={t('ai_clear_chat', 'مسح المحادثة')}
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">{t('ai_clear_chat', 'مسح المحادثة')}</span>
        </button>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none px-1">
        {suggestedPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q.prompt)}
            disabled={loading}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full glass hover:bg-white/10 text-[var(--subtle)] hover:text-white border border-white/5 transition-all shrink-0 hover:border-[#6ee7b7]/30"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto glass p-3 md:p-6 mb-3 flex flex-col gap-4 rounded-[2rem] relative shadow-inner border border-white/5">
        <AnimatePresence>
          {messages.map((m) => {
            const isModel = m.role === 'model' || m.role === 'assistant'
            const { cleanText, actions } = isModel ? parseActionsFromText(m.text || m.content || '') : { cleanText: m.text || '', actions: [] }
            const messageDir = detectTextDir(cleanText)
            const segments = parseMarkdownTables(cleanText)

            return (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, scale: 0.96, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                dir={messageDir}
                className={`group relative max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-md ${
                  messageDir === 'rtl' ? 'text-right' : 'text-left'
                } ${
                  isModel
                    ? 'self-start bg-[rgba(255,255,255,0.03)] border border-white/[0.08] rounded-tl-none text-white' 
                    : 'self-end bg-gradient-to-br from-[#34d399] to-[#059669] text-[#0a1424] font-medium rounded-tr-none shadow-lg'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2 text-[10px] font-bold opacity-75">
                  <div className="flex items-center gap-1.5">
                    {isModel ? (
                      <>
                        <Bot size={13} className="text-[#6ee7b7]" />
                        <span>Zen AI</span>
                      </>
                    ) : (
                      <>
                        <User size={13} />
                        <span>{profile?.username || 'أنت'}</span>
                      </>
                    )}
                  </div>

                  {/* Actions on AI Message: Copy + Save to Journal */}
                  {isModel && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyMessage(m.id, cleanText)}
                        className="p-1 rounded-lg hover:bg-white/10 text-[var(--muted)] hover:text-white transition-colors"
                        title={t('common_copy', 'نسخ')}
                      >
                        {copiedId === m.id ? <Check size={12} className="text-[#6ee7b7]" /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => handleSaveToJournal(m.id, cleanText)}
                        className="p-1 rounded-lg hover:bg-white/10 text-[var(--muted)] hover:text-[#6ee7b7] transition-colors"
                        title={t('ai_save_to_journal', 'حفظ كفكرة في المذكرة')}
                      >
                        {savedJournalId === m.id ? <Check size={12} className="text-[#6ee7b7]" /> : <BookPlus size={12} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Content with Custom Table & Markdown Renderers */}
                <div className="prose prose-invert prose-sm max-w-none text-xs md:text-sm leading-relaxed overflow-x-auto space-y-2">
                  {segments.map((seg, sIdx) => {
                    if (seg.type === 'table') {
                      return <div key={sIdx}>{renderCustomTable(seg.content, messageDir)}</div>
                    }
                    return (
                      <ReactMarkdown key={sIdx}>
                        {seg.content}
                      </ReactMarkdown>
                    )
                  })}
                </div>

                {/* Interactive Action Buttons Generated by AI */}
                {actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <p className="text-[10px] font-bold text-[#6ee7b7] flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>{t('ai_actions_header', 'إجراءات وأدوات مقترحة:')}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6ee7b7]/20 hover:bg-[#6ee7b7]/30 text-[#6ee7b7] border border-[#6ee7b7]/40 flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                        >
                          <span>{act.label}</span>
                          <ExternalLink size={11} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Delete Message Button */}
                <button 
                  onClick={() => deleteMessage(m.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#161b27] text-[var(--muted)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-white/10 shadow-lg"
                  title="حذف الرسالة"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex items-center gap-2 p-3 glass rounded-2xl border border-white/5">
            <Bot size={16} className="text-[#6ee7b7] animate-pulse" />
            <span className="text-xs text-[var(--subtle)]">{t('ai_typing', 'Zen AI يكتب الرد...')}</span>
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
          placeholder={t('ai_placeholder', 'اكتب رسالتك لـ Zen AI (دارجة، عربية، إنجليزية، فرنسية)...')} 
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
          {loading ? '...' : <><Send size={14} /> <span>{t('common_send', 'إرسال')}</span></>}
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
              <h2 className="text-xl font-bold mb-2 text-white">{t('ai_clear_chat', 'مسح المحادثة؟')}</h2>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                سيتم مسح سجل المحادثة بالكامل وإعادة ضبطها من البداية.
              </p>
              
              <div className="flex gap-3">
                <button onClick={doClearChat} className="flex-1 py-3 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-lg">
                  {t('common_clear', 'مسح الكل')}
                </button>
                <button onClick={() => setShowConfirm(false)} className="btn-ghost flex-1 py-3 text-xs">
                  {t('common_cancel', 'تراجع')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
