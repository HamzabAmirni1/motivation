import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Send, Pin, PinOff, Heart, ThumbsUp, Sparkles, Smile,
  Image as ImageIcon, MoreVertical, Edit2, Trash2, Flag,
  Search, ShieldAlert, Check, CheckCheck, Clock, AlertTriangle,
  Lock, X, ChevronUp, ChevronDown, UserCheck, MessageSquare, ArrowLeft, RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { renderAvatarContent } from './Navbar'
import {
  isUserAdmin,
  ADMIN_USER_ID,
  fetchGlobalMessages,
  sendGlobalMessage,
  editGlobalMessage,
  deleteGlobalMessage,
  fetchPinnedMessage,
  pinMessage,
  unpinMessage,
  fetchReactions,
  toggleReaction,
  reportMessage,
  fetchUserPrivateMessages,
  sendPrivateMessage,
  markPrivateMessagesAsRead,
  fetchAdminInbox,
  fetchCommunityReports,
  resolveReport,
  toggleMessageModeration,
  subscribeToCommunityEvents,
  compressChatImage
} from '../services/communityService'

const REACTION_EMOJIS = ['❤️', '👍', '🙏', '🌱', '✨', '👏']
const QUICK_EMOJIS = ['🌱', '🌸', '☕', '🧘', '✨', '❤️', '👏', '🌿', '☀️', '💡', '😌', '💪']

export default function CommunityPage() {
  const { user, profile } = useAuth()
  const { t, lang, dir } = useLanguage()
  const isAdmin = isUserAdmin(user, profile)

  // Active Tab: 'global' | 'private' | 'mod'
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('zs_comm_tab') || 'global')

  useEffect(() => {
    localStorage.setItem('zs_comm_tab', activeTab)
  }, [activeTab])

  // ─────────────────────────────────────────────────────────────
  // GLOBAL CHAT STATE
  // ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMoreOlder, setHasMoreOlder] = useState(true)
  const [pinnedMessage, setPinnedMessage] = useState(null)
  const [reactionsMap, setReactionsMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  // Composer
  const [inputContent, setInputContent] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingMsg, setEditingMsg] = useState(null)
  const [editContent, setEditContent] = useState('')

  // Report Modal
  const [reportingMsgId, setReportingMsgId] = useState(null)
  const [reportReason, setReportReason] = useState('محتوى غير لائق')
  const [reportSuccessMsg, setReportSuccessMsg] = useState('')

  // Delete & Unpin Confirmation Modals
  const [deletingMsgId, setDeletingMsgId] = useState(null)
  const [showUnpinModal, setShowUnpinModal] = useState(false)

  // Enlarged Image Modal
  const [expandedImage, setExpandedImage] = useState(null)

  // ─────────────────────────────────────────────────────────────
  // PRIVATE CHAT STATE
  // ─────────────────────────────────────────────────────────────
  const [privateMessages, setPrivateMessages] = useState([])
  const [privateInput, setPrivateInput] = useState('')
  const [privateImagePreview, setPrivateImagePreview] = useState(null)
  const [adminInbox, setAdminInbox] = useState([])
  const [selectedUserThread, setSelectedUserThread] = useState(null)
  const [inboxSearch, setInboxSearch] = useState('')

  // ─────────────────────────────────────────────────────────────
  // MODERATION STATE (ADMIN ONLY)
  // ─────────────────────────────────────────────────────────────
  const [pendingReports, setPendingReports] = useState([])
  const [customAnnouncement, setCustomAnnouncement] = useState('')

  // Refs
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const privateFileInputRef = useRef(null)
  const isNearBottomRef = useRef(true)

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)

  // Track scroll position so we know if user is reading older messages
  const handleScroll = (e) => {
    const el = e.currentTarget
    // If user is within 140px of bottom, treat as "at bottom"
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 140
    isNearBottomRef.current = atBottom
    setShowScrollBottomBtn(!atBottom)
  }

  // Auto-scroll to bottom of global chat
  const scrollToBottom = (smooth = true, force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INITIAL DATA LOADING
  // ─────────────────────────────────────────────────────────────
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [msgs, pinned] = await Promise.all([
        fetchGlobalMessages({ limit: 30 }),
        fetchPinnedMessage()
      ])
      setMessages(msgs || [])
      setPinnedMessage(pinned)

      if (msgs && msgs.length > 0) {
        const reactions = await fetchReactions(msgs.map(m => m.id))
        setReactionsMap(reactions)
      }
    } catch (err) {
      console.warn('Community load error:', err)
    } finally {
      setLoading(false)
      setTimeout(() => scrollToBottom(false, true), 200)
    }
  }

  // Load older messages
  const loadOlderMessages = async () => {
    if (messages.length === 0 || loadingOlder) return
    const container = messagesContainerRef.current
    const prevScrollHeight = container ? container.scrollHeight : 0
    const prevScrollTop = container ? container.scrollTop : 0
    setLoadingOlder(true)
    const oldest = messages[0]
    try {
      const older = await fetchGlobalMessages({ limit: 25, before: oldest.created_at })
      if (!older || older.length === 0) {
        setHasMoreOlder(false)
      } else {
        const combined = [...older, ...messages]
        setMessages(combined)
        const newReactions = await fetchReactions(older.map(m => m.id))
        setReactionsMap(prev => ({ ...prev, ...newReactions }))

        // Preserve exact scroll position so user doesn't jump
        requestAnimationFrame(() => {
          if (container) {
            const heightDiff = container.scrollHeight - prevScrollHeight
            container.scrollTop = prevScrollTop + heightDiff
          }
        })
      }
    } finally {
      setLoadingOlder(false)
    }
  }

  // Load Private Chat
  const loadPrivateChat = async () => {
    if (isAdmin) {
      const inbox = await fetchAdminInbox(user?.id)
      setAdminInbox(inbox)
      if (inbox.length > 0 && !selectedUserThread) {
        setSelectedUserThread(inbox[0])
      }
    } else {
      const pMsgs = await fetchUserPrivateMessages(user?.id)
      setPrivateMessages(pMsgs)
    }
  }

  // Load Admin reports
  const loadReports = async () => {
    if (!isAdmin) return
    const reps = await fetchCommunityReports()
    setPendingReports(reps.filter(r => r.status === 'pending'))
  }

  useEffect(() => {
    loadInitialData()
    loadPrivateChat()
    if (isAdmin) loadReports()

    // Realtime events subscription
    const unsubscribe = subscribeToCommunityEvents((event) => {
      if (event.type === 'new_global_message') {
        setMessages(prev => {
          if (prev.some(m => m.id === event.payload.id)) return prev
          return [...prev, event.payload]
        })
        // Only scroll if already at bottom, don't interrupt reading
        scrollToBottom(true, false)
      } else if (event.type === 'sync_messages') {
        setMessages(prev => {
          const payload = event.payload || []
          const payloadIds = new Set(payload.map(m => m.id))

          // Avoid re-rendering if data is identical
          const currentNonLocal = prev.filter(m => !m.id.startsWith('local_'))
          if (
            currentNonLocal.length === payload.length &&
            currentNonLocal.every((m, i) => m.id === payload[i]?.id && m.content === payload[i]?.content && m.moderation_status === payload[i]?.moderation_status)
          ) {
            return prev
          }

          // Keep optimistic local messages not yet in payload
          const localOnly = prev.filter(m => m.id.startsWith('local_') && !payloadIds.has(m.id))
          return [...payload, ...localOnly]
        })
      } else if (event.type === 'message_updated') {
        setMessages(prev => prev.map(m => m.id === event.payload.id ? { ...m, ...event.payload } : m))
      } else if (event.type === 'message_deleted') {
        setMessages(prev => prev.filter(m => m.id !== event.payload.id))
      } else if (event.type === 'pinned_changed') {
        setPinnedMessage(event.payload)
      } else if (event.type === 'reaction_updated') {
        setReactionsMap(prev => ({ ...prev, [event.payload.messageId]: event.payload.reactions }))
      } else if (event.type === 'new_private_message') {
        loadPrivateChat()
      } else if (event.type === 'moderation_changed') {
        setMessages(prev => prev.map(m => m.id === event.payload.messageId ? { ...m, moderation_status: event.payload.status } : m))
      }
    })

    return () => unsubscribe()
  }, [isAdmin, user?.id])

  // When selected user thread changes in Admin view
  useEffect(() => {
    if (isAdmin && selectedUserThread) {
      fetchUserPrivateMessages(selectedUserThread.userId, user?.id).then(msgs => {
        setPrivateMessages(msgs)
        markPrivateMessagesAsRead(selectedUserThread.userId, user?.id)
      })
    }
  }, [isAdmin, selectedUserThread, user?.id])

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: GLOBAL CHAT
  // ─────────────────────────────────────────────────────────────
  const handleSendGlobal = async (e) => {
    e?.preventDefault()
    if (!inputContent.trim() && !imagePreview) return

    const content = inputContent
    const img = imagePreview
    setInputContent('')
    setImagePreview(null)
    setShowEmojiPicker(false)

    await sendGlobalMessage({
      content,
      imageUrl: img,
      user,
      profile
    })
    // Force auto-scroll to the bottom because user explicitly sent a message
    setTimeout(() => {
      isNearBottomRef.current = true
      scrollToBottom(true, true)
    }, 60)
  }

  const handleImageSelect = async (e, isPrivate = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const compressed = await compressChatImage(file, 640, 0.8)
      if (isPrivate) {
        setPrivateImagePreview(compressed)
      } else {
        setImagePreview(compressed)
      }
    } catch (err) {
      alert('خطأ في تحميل الصورة: ' + (err.message || 'الملف غير صالح'))
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleToggleReaction = async (messageId, reaction) => {
    const username = profile?.username || user?.email?.split('@')[0] || 'عضو'
    const updated = await toggleReaction({
      messageId,
      reaction,
      userId: user?.id,
      username
    })
    setReactionsMap(prev => ({ ...prev, [messageId]: updated }))
  }

  const handleSaveEdit = async () => {
    if (!editingMsg || !editContent.trim()) return
    await editGlobalMessage(editingMsg.id, editContent)
    setEditingMsg(null)
    setEditContent('')
  }

  const handleDeleteMsg = (msgId) => {
    setDeletingMsgId(msgId)
  }

  const confirmDeleteMsg = async () => {
    if (!deletingMsgId) return
    const idToDelete = deletingMsgId
    setDeletingMsgId(null)
    await deleteGlobalMessage(idToDelete)
  }

  const handlePinMsg = async (msg) => {
    if (!isAdmin) return
    const authorAvatar = msg.avatar_url || '🌱'
    await pinMessage({
      messageId: msg.id,
      content: msg.content,
      authorName: msg.username,
      authorAvatar,
      adminUser: user
    })
  }

  const handleUnpin = () => {
    if (!isAdmin || !pinnedMessage) return
    setShowUnpinModal(true)
  }

  const confirmUnpin = async () => {
    if (!isAdmin || !pinnedMessage) return
    setShowUnpinModal(false)
    await unpinMessage(pinnedMessage.id)
    setPinnedMessage(null)
  }

  const handleSubmitReport = async () => {
    if (!reportingMsgId) return
    await reportMessage({
      messageId: reportingMsgId,
      reporterId: user?.id,
      reason: reportReason
    })
    setReportSuccessMsg(t('comm_report_success', 'تم استلام بلاغك وسيقوم المشرف بمراجعته فوراً.'))
    setTimeout(() => {
      setReportingMsgId(null)
      setReportSuccessMsg('')
    }, 2000)
  }

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: PRIVATE CHAT
  // ─────────────────────────────────────────────────────────────
  const handleSendPrivate = async (e) => {
    e?.preventDefault()
    if (!privateInput.trim() && !privateImagePreview) return

    const recipientId = isAdmin ? selectedUserThread?.userId : ADMIN_USER_ID
    if (!recipientId) return

    const content = privateInput
    const img = privateImagePreview
    setPrivateInput('')
    setPrivateImagePreview(null)

    const sent = await sendPrivateMessage({
      senderId: user?.id,
      recipientId,
      content,
      imageUrl: img,
      senderName: profile?.username || user?.email?.split('@')[0] || 'مستخدم',
      senderAvatar: profile?.avatar_url || '🌱'
    })

    setPrivateMessages(prev => [...prev, sent])
    if (isAdmin) loadPrivateChat()
  }

  // ─────────────────────────────────────────────────────────────
  // HANDLERS: MODERATION
  // ─────────────────────────────────────────────────────────────
  const handleResolveReport = async (reportId, action) => {
    await resolveReport(reportId, action)
    setPendingReports(prev => prev.filter(r => r.id !== reportId))
  }

  const handleHideMessage = async (messageId) => {
    await toggleMessageModeration(messageId, 'hidden')
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    if (!customAnnouncement.trim()) return
    await pinMessage({
      messageId: null,
      content: customAnnouncement.trim(),
      authorName: `${profile?.username || 'Hamza Amirni'} (Admin)`,
      authorAvatar: '📢',
      adminUser: user
    })
    setCustomAnnouncement('')
    setActiveTab('global')
  }

  // Filtered Messages
  const visibleMessages = useMemo(() => {
    let list = messages.filter(m => m.moderation_status === 'visible' || isAdmin || m.user_id === user?.id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(m => 
        m.content?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q)
      )
    }
    return list
  }, [messages, searchQuery, isAdmin, user?.id])

  // Inbox search filter
  const filteredInbox = useMemo(() => {
    if (!inboxSearch.trim()) return adminInbox
    const q = inboxSearch.toLowerCase().trim()
    return adminInbox.filter(t => t.userName?.toLowerCase().includes(q) || t.lastMessage?.toLowerCase().includes(q))
  }, [adminInbox, inboxSearch])

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12" dir={dir}>
      {/* ─────────────────────────────────────────────────────────────
          HEADER & TAB SELECTOR
      ────────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold chip">
          <Users size={14} className="text-[#6ee7b7]" />
          <span>{t('nav_community', 'المجتمع العام')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black gradient-text">
          {t('comm_title', 'مجتمع ZenStep العام')}
        </h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-xl mx-auto">
          {t('comm_subtitle', 'مجموعة واحدة موحدة لجميع الأعضاء لتبادل الدعم والتشجيع الإيجابي 🌱')}
        </p>

        {/* Tab Switcher Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="glass p-1 rounded-2xl border border-white/5 inline-flex items-center gap-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'global' ? 'bg-[#6ee7b7] text-black shadow-md' : 'text-[var(--subtle)] hover:text-white'
              }`}
            >
              <Users size={15} />
              <span>{t('comm_tab_global', 'المحادثة العامة')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab('private')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'private' ? 'bg-[#a78bfa] text-black shadow-md' : 'text-[var(--subtle)] hover:text-white'
              }`}
            >
              <MessageSquare size={15} />
              <span>{isAdmin ? t('comm_inbox_title', 'بريد الإدارة') : t('comm_tab_private', 'مراسلة الإدارة')}</span>
              {isAdmin && adminInbox.some(t => t.unreadCount > 0) && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white animate-bounce">
                  {adminInbox.reduce((sum, t) => sum + t.unreadCount, 0)}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('mod')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'mod' ? 'bg-[#fcd34d] text-black shadow-md' : 'text-[var(--subtle)] hover:text-white'
                }`}
              >
                <ShieldAlert size={15} />
                <span>{t('comm_tab_mod', 'إشراف المجتمع')}</span>
                {pendingReports.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white">
                    {pendingReports.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: GLOBAL COMMUNITY CHAT
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'global' && (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden flex flex-col h-[75vh] shadow-2xl relative">
          
          {/* Top Pinned Banner (Only one active message at all times) */}
          {pinnedMessage && pinnedMessage.active && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-20 p-3.5 px-4 bg-gradient-to-r from-[#6ee7b7]/15 via-[#a78bfa]/10 to-[#6ee7b7]/15 border-b border-[#6ee7b7]/30 backdrop-blur-md flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#6ee7b7]/20 border border-[#6ee7b7]/40 flex items-center justify-center shrink-0 text-amber-300">
                  <Pin size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-[#6ee7b7] flex items-center gap-1">
                      {t('comm_pinned_title', 'رسالة مثبتة من الإدارة')}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] truncate">
                      • {pinnedMessage.author_name}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white truncate max-w-xl">
                    {pinnedMessage.content}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={handleUnpin}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title={t('comm_unpin', 'إلغاء التثبيت')}
                >
                  <PinOff size={16} />
                </button>
              )}
            </motion.div>
          )}

          {/* Subheader: Info & Live Search Filter */}
          <div className="p-3 px-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-black/20">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('comm_online_members', 'مباشر ومتصل')}
              </span>
              <span className="text-[11px] text-[var(--muted)] hidden sm:inline">
                {t('comm_guidelines', 'فضاء إيجابي محترم ومحمي')}
              </span>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('comm_search_placeholder', 'ابحث في رسائل المجتمع...')}
                className="w-full pl-3 pr-8 py-1.5 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[#6ee7b7]/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
          >
            {/* Load older button */}
            {hasMoreOlder && messages.length >= 25 && (
              <div className="text-center pt-1 pb-3">
                <button
                  onClick={loadOlderMessages}
                  disabled={loadingOlder}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-[#6ee7b7] bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-all inline-flex items-center gap-1.5"
                >
                  <ChevronUp size={14} className={loadingOlder ? 'animate-spin' : ''} />
                  <span>{loadingOlder ? t('common_loading', 'جاري التحميل...') : t('comm_load_older', 'تحميل الرسائل السابقة')}</span>
                </button>
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center space-y-2">
                <RefreshCw size={24} className="mx-auto text-[#6ee7b7] animate-spin" />
                <p className="text-xs text-[var(--muted)]">{t('common_loading', 'كنحمّلو بياناتك...')}</p>
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="py-20 text-center max-w-sm mx-auto space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-[#6ee7b7]/15 border border-[#6ee7b7]/30 flex items-center justify-center mx-auto text-3xl">
                  🌱
                </div>
                <h3 className="font-bold text-white text-base">
                  {t('comm_empty_title', 'كن أول من يشارك في المحادثة!')}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {t('comm_empty_desc', 'شارك فكرة إيجابية أو كلمة طيبة تدعم بها غيرك في رحلة العافية.')}
                </p>
              </div>
            ) : (
              visibleMessages.map(msg => {
                const isMe = msg.user_id === user?.id
                const isMsgAdmin = msg.user_id === ADMIN_USER_ID || msg.username?.includes('Admin')
                const reactions = reactionsMap[msg.id] || []
                const isHidden = msg.moderation_status === 'hidden'

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 group relative ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* User Avatar */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm overflow-hidden select-none"
                      style={{
                        background: isMsgAdmin
                          ? 'linear-gradient(135deg, #6ee7b7, #a78bfa)'
                          : 'rgba(255,255,255,0.06)',
                        border: isMsgAdmin ? '1.5px solid #6ee7b7' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {renderAvatarContent({ username: msg.username, avatar_url: msg.avatar_url }, '🌱')}
                    </div>

                    {/* Bubble Container */}
                    <div className={`max-w-[82%] sm:max-w-md md:max-w-lg space-y-1 ${isMe ? 'items-end text-left' : 'items-start text-right'}`}>
                      {/* Name & Badges */}
                      <div className={`flex items-center gap-2 text-xs ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-white/90 truncate">{msg.username}</span>
                        {isMsgAdmin && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-[#6ee7b7]/20 border border-[#6ee7b7]/40 text-[#6ee7b7]">
                            {t('comm_admin_badge', 'الإدارة')}
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--muted)]">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.is_edited && (
                          <span className="text-[9px] text-[var(--muted)] italic">
                            {t('comm_edited', '(معدلة)')}
                          </span>
                        )}
                      </div>

                      {/* Bubble Text */}
                      <div
                        className={`p-3.5 rounded-2xl relative shadow-md transition-all ${
                          isHidden
                            ? 'bg-red-500/10 border border-red-500/30 text-red-200 italic text-xs'
                            : isMe
                            ? 'bg-[#6ee7b7]/15 border border-[#6ee7b7]/30 text-white rounded-tr-sm'
                            : 'bg-white/[0.04] border border-white/10 text-white/95 rounded-tl-sm'
                        }`}
                      >
                        {isHidden ? (
                          <p className="flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span>تم حجب هذه الرسالة لمخالفتها إرشادات المجتمع.</span>
                          </p>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                              {msg.content}
                            </p>

                            {/* Attached Image */}
                            {msg.image_url && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-white/10 cursor-pointer max-h-60">
                                <img
                                  src={msg.image_url}
                                  alt="attachment"
                                  onClick={() => setExpandedImage(msg.image_url)}
                                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Reactions Chips Bar */}
                      <div className={`flex flex-wrap items-center gap-1 pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {REACTION_EMOJIS.map(emoji => {
                          const matching = reactions.filter(r => r.reaction === emoji)
                          const hasReacted = matching.some(r => r.user_id === user?.id)
                          if (matching.length === 0) return null

                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                                hasReacted
                                  ? 'bg-[#6ee7b7]/20 border border-[#6ee7b7]/50 text-[#6ee7b7] shadow-xs'
                                  : 'bg-white/[0.03] border border-white/5 text-[var(--subtle)] hover:bg-white/[0.08]'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{matching.length}</span>
                            </button>
                          )
                        })}

                        {/* Quick Reaction Picker Pill on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10">
                          {REACTION_EMOJIS.slice(0, 4).map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="text-xs hover:scale-125 transition-transform px-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Actions Menu */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {isAdmin && (
                            <button
                              onClick={() => handlePinMsg(msg)}
                              className="p-1 text-[var(--muted)] hover:text-[#6ee7b7] transition-colors"
                              title={t('comm_pin', 'تثبيت الرسالة')}
                            >
                              <Pin size={12} />
                            </button>
                          )}

                          {isMe && (
                            <button
                              onClick={() => {
                                setEditingMsg(msg)
                                setEditContent(msg.content)
                              }}
                              className="p-1 text-[var(--muted)] hover:text-[#a78bfa] transition-colors"
                              title={t('common_edit', 'تعديل')}
                            >
                              <Edit2 size={12} />
                            </button>
                          )}

                          {(isMe || isAdmin) && (
                            <button
                              onClick={() => handleDeleteMsg(msg.id)}
                              className="p-1 text-[var(--muted)] hover:text-red-400 transition-colors"
                              title={t('common_delete', 'حذف')}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}

                          {!isMe && (
                            <button
                              onClick={() => setReportingMsgId(msg.id)}
                              className="p-1 text-[var(--muted)] hover:text-amber-400 transition-colors"
                              title={t('comm_report_title', 'إبلاغ')}
                            >
                              <Flag size={12} />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleHideMessage(msg.id)}
                              className="p-1 text-[var(--muted)] hover:text-orange-400 transition-colors"
                              title={t('comm_hide_msg', 'حجب')}
                            >
                              <ShieldAlert size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll to Bottom Button (WhatsApp style) */}
          <AnimatePresence>
            {showScrollBottomBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={() => {
                  isNearBottomRef.current = true
                  scrollToBottom(true, true)
                  setShowScrollBottomBtn(false)
                }}
                className="absolute bottom-20 start-6 z-30 p-2 rounded-full bg-[#6ee7b7] text-slate-900 shadow-xl border border-white/20 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                title="النزول لآخر الرسائل"
              >
                <ChevronDown size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Quick Emojis Bar (When toggled) */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 px-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center gap-1.5"
              >
                {QUICK_EMOJIS.map(em => (
                  <button
                    key={em}
                    onClick={() => setInputContent(prev => prev + ' ' + em)}
                    className="p-1.5 hover:bg-white/10 rounded-xl text-lg transition-transform hover:scale-125"
                  >
                    {em}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Upload Thumbnail Preview */}
          {imagePreview && (
            <div className="p-2 px-4 bg-black/30 border-t border-white/5 flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#6ee7b7]">
                <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="text-xs text-[#6ee7b7] font-bold">صورة جاهزة للإرسال ✓</span>
            </div>
          )}

          {/* Message Composer Bar (Mobile-friendly WhatsApp layout) */}
          <form
            onSubmit={handleSendGlobal}
            className="p-2 sm:p-3 md:p-4 bg-black/40 border-t border-white/5 flex items-center gap-1.5 sm:gap-2 relative z-10"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => handleImageSelect(e, false)}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(v => !v)}
              className="p-2 sm:p-2.5 rounded-xl text-[var(--muted)] hover:text-[#fcd34d] hover:bg-white/[0.04] transition-colors shrink-0"
              title="إيموجي"
            >
              <Smile size={19} />
            </button>

            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 rounded-xl text-[var(--muted)] hover:text-[#7dd3fc] hover:bg-white/[0.04] transition-colors shrink-0"
              title="إرفاق صورة"
            >
              <ImageIcon size={19} />
            </button>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                placeholder={t('comm_write_placeholder', 'اكتب رسالتك للمجتمع بكل احترام ولطف...')}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[#6ee7b7]/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!inputContent.trim() && !imagePreview}
              className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
                color: '#0d1117'
              }}
              title={t('comm_send', 'إرسال')}
            >
              <Send size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
              <span className="hidden sm:inline">{t('comm_send', 'إرسال')}</span>
            </button>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: PRIVATE CHAT WITH ADMIN ONLY
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'private' && (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl h-[75vh] flex flex-col md:flex-row">
          
          {/* ADMIN VIEW: TWO-PANE INBOX */}
          {isAdmin ? (
            <>
              {/* Left Column: Conversations List */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-white/5 flex flex-col bg-black/20">
                <div className="p-3.5 border-b border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Lock size={15} className="text-[#a78bfa]" />
                      <span>{t('comm_inbox_title', 'صندوق رسائل الإدارة')}</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] font-bold">
                      {adminInbox.length} محادثة
                    </span>
                  </div>

                  <input
                    type="text"
                    value={inboxSearch}
                    onChange={e => setInboxSearch(e.target.value)}
                    placeholder="ابحث عن عضو..."
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-[var(--muted)] focus:outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredInbox.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[var(--muted)]">
                      {t('comm_inbox_empty', 'لا توجد رسائل خاصة جديدة')}
                    </div>
                  ) : (
                    filteredInbox.map(thread => {
                      const isSelected = selectedUserThread?.userId === thread.userId
                      return (
                        <button
                          key={thread.userId}
                          onClick={() => setSelectedUserThread(thread)}
                          className={`w-full p-3 rounded-2xl text-right transition-all flex items-center gap-3 ${
                            isSelected ? 'bg-[#a78bfa]/15 border border-[#a78bfa]/30' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-lg shrink-0">
                            {renderAvatarContent({ username: thread.userName, avatar_url: thread.userAvatar }, '🌱')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-white truncate">{thread.userName}</h4>
                              <span className="text-[10px] text-[var(--muted)]">
                                {new Date(thread.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                              {thread.lastMessage}
                            </p>
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#6ee7b7] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                              {thread.unreadCount}
                            </span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Selected Thread Messages */}
              <div className="flex-1 flex flex-col bg-black/10">
                {selectedUserThread ? (
                  <>
                    {/* Thread Header */}
                    <div className="p-3 px-5 border-b border-white/5 flex items-center justify-between bg-black/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-base">
                          {renderAvatarContent({ username: selectedUserThread.userName, avatar_url: selectedUserThread.userAvatar }, '🌱')}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{selectedUserThread.userName}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold">محادثة خاصة مؤمنة 🔒</span>
                        </div>
                      </div>
                    </div>

                    {/* Thread Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {privateMessages.map(msg => {
                        const isMe = msg.sender_id === user?.id
                        return (
                          <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="max-w-[78%] space-y-1">
                              <div
                                className={`p-3 rounded-2xl text-xs whitespace-pre-wrap ${
                                  isMe
                                    ? 'bg-[#a78bfa]/20 border border-[#a78bfa]/40 text-white rounded-tr-sm'
                                    : 'bg-white/[0.05] border border-white/10 text-white rounded-tl-sm'
                                }`}
                              >
                                <p>{msg.content}</p>
                                {msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt="attachment"
                                    onClick={() => setExpandedImage(msg.image_url)}
                                    className="mt-2 rounded-lg max-h-48 cursor-pointer"
                                  />
                                )}
                              </div>
                              <div className={`flex items-center gap-1 text-[9px] text-[var(--muted)] ${isMe ? 'justify-end' : ''}`}>
                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isMe && (msg.read_at ? <CheckCheck size={12} className="text-[#6ee7b7]" /> : <Check size={12} />)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Admin Reply Composer */}
                    <form onSubmit={handleSendPrivate} className="p-2 sm:p-3 border-t border-white/5 flex items-center gap-1.5 sm:gap-2 bg-black/40">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={privateInput}
                          onChange={e => setPrivateInput(e.target.value)}
                          placeholder="الرد على هذا العضو بسرية..."
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a78bfa] transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold rounded-2xl bg-[#a78bfa] text-[#0d1117] hover:bg-[#c4b5fd] flex items-center gap-1 shrink-0 shadow-md transition-all active:scale-95"
                      >
                        <Send size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                        <span>رد</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-[var(--muted)]">
                    اختر محادثة للرد عليها
                  </div>
                )}
              </div>
            </>
          ) : (
            /* USER VIEW: DIRECT PRIVATE THREAD WITH ADMIN */
            <div className="flex-1 flex flex-col bg-black/10">
              {/* Security Privacy Notice */}
              <div className="p-3.5 px-4 bg-[#a78bfa]/10 border-b border-[#a78bfa]/20 flex items-center gap-3">
                <Lock size={18} className="text-[#a78bfa] shrink-0" />
                <p className="text-xs text-[#a78bfa] leading-relaxed font-medium">
                  {t('comm_private_notice', 'هذه المحادثة خاصة وسرية بالكامل بينك وبين إدارة ZenStep فقط.')}
                </p>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                {privateMessages.length === 0 ? (
                  <div className="py-20 text-center max-w-sm mx-auto space-y-2">
                    <span className="text-4xl block">💬</span>
                    <h4 className="font-bold text-sm text-white">تواصل مباشرة مع المشرف</h4>
                    <p className="text-xs text-[var(--muted)]">
                      يمكنك مشاركة استفساراتك، مشاعرك، أو طلب المساعدة النفسية الخاصة بكل سرية وأمان.
                    </p>
                  </div>
                ) : (
                  privateMessages.map(msg => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="max-w-[75%] space-y-1">
                          <div
                            className={`p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                              isMe
                                ? 'bg-[#6ee7b7]/15 border border-[#6ee7b7]/30 text-white rounded-tr-sm'
                                : 'bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-white rounded-tl-sm'
                            }`}
                          >
                            <p>{msg.content}</p>
                            {msg.image_url && (
                              <img
                                src={msg.image_url}
                                alt="attachment"
                                onClick={() => setExpandedImage(msg.image_url)}
                                className="mt-2 rounded-xl max-h-56 cursor-pointer"
                              />
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] text-[var(--muted)] ${isMe ? 'justify-end' : ''}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (msg.read_at ? <CheckCheck size={12} className="text-[#6ee7b7]" /> : <Check size={12} />)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Image Preview for private chat */}
              {privateImagePreview && (
                <div className="p-2 px-4 bg-black/40 border-t border-white/5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#a78bfa]">
                    <img src={privateImagePreview} alt="upload" className="w-full h-full object-cover" />
                    <button onClick={() => setPrivateImagePreview(null)} className="absolute top-0 right-0 bg-black text-white p-0.5">
                      <X size={10} />
                    </button>
                  </div>
                  <span className="text-xs text-[#a78bfa] font-bold">صورة خاصة جاهزة للإرسال</span>
                </div>
              )}

              {/* Composer */}
              <form onSubmit={handleSendPrivate} className="p-2 sm:p-3 md:p-4 bg-black/40 border-t border-white/5 flex items-center gap-1.5 sm:gap-2">
                <input
                  type="file"
                  ref={privateFileInputRef}
                  onChange={e => handleImageSelect(e, true)}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => privateFileInputRef.current?.click()}
                  className="p-2 sm:p-2.5 rounded-xl text-[var(--muted)] hover:text-[#a78bfa] transition-colors shrink-0"
                  title="إرفاق صورة خاصة"
                >
                  <ImageIcon size={19} />
                </button>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={privateInput}
                    onChange={e => setPrivateInput(e.target.value)}
                    placeholder={t('comm_private_placeholder', 'اكتب رسالتك الخاصة للإدارة...')}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-[var(--muted)] focus:outline-none focus:border-[#a78bfa] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!privateInput.trim() && !privateImagePreview}
                  className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                    color: '#0d1117'
                  }}
                  title={t('comm_send', 'إرسال')}
                >
                  <Send size={15} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  <span className="hidden sm:inline">إرسال</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: COMMUNITY MODERATION (ADMIN ONLY)
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'mod' && isAdmin && (
        <div className="space-y-6">
          {/* Quick Pinned Announcement Creator */}
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Pin size={16} className="text-[#6ee7b7]" />
              <span>نشر وتثبيت إعلان رسمي للمجتمع (Pinned Announcement)</span>
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <textarea
                rows={3}
                value={customAnnouncement}
                onChange={e => setCustomAnnouncement(e.target.value)}
                placeholder="اكتب الإعلان أو الإرشاد الذي ترغب بتثبيته في أعلى المحادثة لجميع المستخدمين..."
                className="zen-input text-xs"
              />
              <button
                type="submit"
                disabled={!customAnnouncement.trim()}
                className="btn-zen px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Pin size={14} />
                <span>تثبيت هذا الإعلان الآن</span>
              </button>
            </form>
          </div>

          {/* User Reports Queue */}
          <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#fcd34d]" />
                <span>{t('comm_reports_title', 'بلاغات الأعضاء')}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#fcd34d]/20 text-[#fcd34d]">
                {pendingReports.length} بلاغات معلقة
              </span>
            </div>

            {pendingReports.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--muted)]">
                {t('comm_no_reports', 'لا توجد بلاغات معلقة حالياً ✓')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingReports.map(rep => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-400 font-bold">سبب البلاغ: {rep.reason}</span>
                        <span className="text-[10px] text-[var(--muted)]">• معرف الرسالة: {rep.message_id}</span>
                      </div>
                      <p className="text-[10px] text-[var(--muted)]">
                        تاريخ البلاغ: {new Date(rep.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleHideMessage(rep.message_id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        حجب الرسالة
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.04] border border-white/10 text-[var(--subtle)] hover:text-white transition-all"
                      >
                        تجاهل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT MESSAGE
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 rounded-[2rem] border border-white/10 max-w-md w-full space-y-4"
            >
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit2 size={16} className="text-[#a78bfa]" />
                <span>تعديل رسالتك</span>
              </h3>

              <textarea
                rows={3}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="zen-input text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingMsg(null)}
                  className="btn-ghost px-4 py-2 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-zen px-5 py-2 text-xs font-bold"
                >
                  حفظ التعديل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: REPORT MESSAGE
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reportingMsgId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 rounded-[2rem] border border-white/10 max-w-sm w-full space-y-4"
            >
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flag size={16} className="text-amber-400" />
                <span>{t('comm_report_title', 'الإبلاغ عن رسالة غير لائقة')}</span>
              </h3>

              {reportSuccessMsg ? (
                <p className="text-xs text-emerald-400 font-bold p-3 bg-emerald-500/10 rounded-xl">
                  {reportSuccessMsg}
                </p>
              ) : (
                <>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    نحن ملتزمون بالحفاظ على بيئة آمنة وداعمة للجميع. يرجى اختيار سبب الإبلاغ:
                  </p>

                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="zen-input text-xs"
                  >
                    <option value="محتوى غير لائق أو مسيء">محتوى غير لائق أو مسيء</option>
                    <option value="تنمر أو تحرش">تنمر أو تحرش</option>
                    <option value="سبام أو ترويج تجاري">سبام أو ترويج تجاري</option>
                    <option value="محتوى يضر بالسلامة النفسية">محتوى يضر بالسلامة النفسية</option>
                    <option value="سبب آخر">سبب آخر</option>
                  </select>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setReportingMsgId(null)}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      className="btn-zen px-4 py-2 text-xs font-bold text-red-300 bg-red-500/20 border-red-500/30"
                    >
                      {t('comm_report_submit', 'إرسال البلاغ')}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: BEAUTIFUL ZEN DELETE CONFIRMATION
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deletingMsgId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="glass p-6 md:p-8 rounded-[2.5rem] border border-red-500/25 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden"
              style={{
                background: 'rgba(18, 22, 34, 0.92)'
              }}
            >
              {/* Glowing Ambient Pill */}
              <div
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-red-400 shadow-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.2)'
                }}
              >
                <Trash2 size={28} />
              </div>

              <div>
                <h3 className="font-black text-lg text-white mb-1.5">
                  {lang === 'fr' ? 'Supprimer le message ?' : lang === 'en' ? 'Delete this message?' : 'حذف هذه الرسالة؟'}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {lang === 'fr'
                    ? 'Êtes-vous sûr de vouloir supprimer définitivement ce message ?'
                    : lang === 'en'
                    ? 'Are you sure you want to permanently delete this message?'
                    : 'واش متأكد باغي تمسح هاد الرسالة نهائياً؟ ما غاديش تقدر ترجعها من بعد.'}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingMsgId(null)}
                  className="btn-ghost flex-1 py-3 text-xs font-bold rounded-2xl border-white/10 hover:bg-white/[0.06] transition-all"
                >
                  {t('common_cancel', 'إلغاء')}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMsg}
                  className="flex-1 py-3 text-xs font-black rounded-2xl text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <Trash2 size={15} />
                  <span>{lang === 'fr' ? 'Supprimer' : lang === 'en' ? 'Delete' : 'نعم، حذف'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: BEAUTIFUL UNPIN CONFIRMATION
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUnpinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="glass p-6 md:p-8 rounded-[2.5rem] border border-amber-500/25 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden"
              style={{
                background: 'rgba(18, 22, 34, 0.92)'
              }}
            >
              <div
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-amber-400 shadow-xl"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid rgba(245, 158, 11, 0.35)',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)'
                }}
              >
                <PinOff size={28} />
              </div>

              <div>
                <h3 className="font-black text-lg text-white mb-1.5">
                  {lang === 'fr' ? 'Désépingler le message ?' : lang === 'en' ? 'Unpin message?' : 'إلغاء تثبيت الرسالة؟'}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {lang === 'fr'
                    ? 'Le message ne sera plus affiché en haut de la conversation.'
                    : lang === 'en'
                    ? 'The message will no longer appear at the top of the chat.'
                    : 'الرسالة ما غاديش تبقى مثبتة فـ الشريط العلوي للمجتمع.'}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnpinModal(false)}
                  className="btn-ghost flex-1 py-3 text-xs font-bold rounded-2xl border-white/10 hover:bg-white/[0.06] transition-all"
                >
                  {t('common_cancel', 'إلغاء')}
                </button>
                <button
                  type="button"
                  onClick={confirmUnpin}
                  className="flex-1 py-3 text-xs font-black rounded-2xl text-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)'
                  }}
                >
                  <PinOff size={15} />
                  <span>{lang === 'fr' ? 'Désépingler' : lang === 'en' ? 'Unpin' : 'إلغاء التثبيت'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EXPANDED IMAGE PREVIEW
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedImage && (
          <div
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={expandedImage}
              alt="enlarged preview"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
