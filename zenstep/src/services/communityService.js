import { supabase } from '../lib/supabase'

export const ADMIN_EMAILS = [
  'amirnihamza61@gmail.com',
  'hamza.amirni@gmail.com',
  'hamzaamirni451@gmail.com'
]

export const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001'

export function isUserAdmin(user, profile) {
  const email = (user?.email || '').toLowerCase().trim()
  return profile?.role === 'admin' || ADMIN_EMAILS.includes(email)
}

// Local storage fallback keys
const LS_GLOBAL = 'zs_community_global_v2'
const LS_PINNED = 'zs_community_pinned_v2'
const LS_PRIVATE = 'zs_community_private_v2'
const LS_REACTIONS = 'zs_community_reactions_v2'
const LS_REPORTS = 'zs_community_reports_v2'

// Initial seed pinned message
const DEFAULT_PINNED = {
  id: 'pinned_welcome_01',
  content: 'مرحباً بالجميع في مجتمع ZenStep الرسمي 🌱 هذا الفضاء مخصص للدعم المتبادل، تبادل الطاقة الإيجابية وخطوات التعافي. نرجو من الجميع التحلي بالاحترام والكلمة الطيبة.',
  author_name: 'Hamza Amirni (Admin)',
  author_avatar: '🌱',
  active: true,
  created_at: new Date(Date.now() - 3600000 * 24).toISOString()
}

// Initial seed messages
const DEFAULT_GLOBAL_MESSAGES = [
  {
    id: 'msg_seed_01',
    user_id: ADMIN_USER_ID,
    username: 'Hamza Amirni (Admin)',
    avatar_url: '🌱',
    content: 'السلام عليكم ورحمة الله 🌱 مرحباً بكم في مجتمع ZenStep. نرجو لكم رحلة موفقة نحو السلام الداخلي وصفاء الذهن.',
    image_url: null,
    moderation_status: 'visible',
    is_edited: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'msg_seed_02',
    user_id: 'seed_user_02',
    username: 'أمينة',
    avatar_url: '🌸',
    content: 'صباح الخير جميعاً ☕ تمرين التنفس اليوم ساعدني بزاف نتخلص من التوتر قبل الامتحان. شكراً على التطبيق الرائع!',
    image_url: null,
    moderation_status: 'visible',
    is_edited: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'msg_seed_03',
    user_id: 'seed_user_03',
    username: 'يوسف',
    avatar_url: '🌿',
    content: 'أصوات المطر والزن 432Hz مع المود بومودورو خلّاوني نركز 3 سوايع بلا تشتت 🎯',
    image_url: null,
    moderation_status: 'visible',
    is_edited: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
]

// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE IMAGE COMPRESSION (Fast & Lightweight)
// ─────────────────────────────────────────────────────────────
export function compressChatImage(file, maxSize = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('الملف المختار ليس صورة صالحة'))
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─────────────────────────────────────────────────────────────
// 1. GLOBAL CHAT MESSAGES
// ─────────────────────────────────────────────────────────────
export async function fetchGlobalMessages({ limit = 30, before = null } = {}) {
  try {
    let query = supabase
      .from('global_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) throw error

    if (data && data.length > 0) {
      // Save recent into local cache
      const cached = getLocalGlobalMessages()
      const mergedMap = new Map()
      cached.forEach(m => mergedMap.set(m.id, m))
      data.forEach(m => mergedMap.set(m.id, m))
      localStorage.setItem(LS_GLOBAL, JSON.stringify(Array.from(mergedMap.values())))
      return data.reverse()
    }
  } catch (err) {
    // Graceful fallback to local cache
  }

  const local = getLocalGlobalMessages()
  let filtered = local.filter(m => m.moderation_status !== 'hidden')
  if (before) {
    filtered = filtered.filter(m => new Date(m.created_at) < new Date(before))
  }
  return filtered.slice(-limit)
}

function getLocalGlobalMessages() {
  try {
    const saved = localStorage.getItem(LS_GLOBAL)
    if (!saved) {
      localStorage.setItem(LS_GLOBAL, JSON.stringify(DEFAULT_GLOBAL_MESSAGES))
      return DEFAULT_GLOBAL_MESSAGES
    }
    return JSON.parse(saved)
  } catch {
    return DEFAULT_GLOBAL_MESSAGES
  }
}

export async function sendGlobalMessage({ content, imageUrl = null, user, profile }) {
  if (!content?.trim() && !imageUrl) return null

  const msgPayload = {
    user_id: user?.id || 'anon_user',
    username: profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'عضو ZenStep',
    avatar_url: profile?.avatar_url || '🌱',
    content: content.trim(),
    image_url: imageUrl,
    moderation_status: 'visible',
    is_edited: false,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('global_chat_messages')
      .insert([msgPayload])
      .select()
      .single()

    if (!error && data) {
      saveLocalGlobalMessage(data)
      broadcastCommunityEvent('new_global_message', data)
      return data
    }
  } catch (err) {
    // Continue with optimistic local save
  }

  // Fallback local save
  const localMsg = {
    ...msgPayload,
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  }
  saveLocalGlobalMessage(localMsg)
  broadcastCommunityEvent('new_global_message', localMsg)
  return localMsg
}

function saveLocalGlobalMessage(msg) {
  const all = getLocalGlobalMessages()
  const updated = [...all.filter(m => m.id !== msg.id), msg]
  localStorage.setItem(LS_GLOBAL, JSON.stringify(updated))
}

export async function editGlobalMessage(messageId, newContent) {
  if (!newContent?.trim()) return false

  try {
    const { error } = await supabase
      .from('global_chat_messages')
      .update({
        content: newContent.trim(),
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (error) throw error
  } catch (err) {
    // fallback
  }

  const all = getLocalGlobalMessages()
  const updated = all.map(m => m.id === messageId ? { ...m, content: newContent.trim(), is_edited: true } : m)
  localStorage.setItem(LS_GLOBAL, JSON.stringify(updated))
  broadcastCommunityEvent('message_updated', { id: messageId, content: newContent.trim() })
  return true
}

export async function deleteGlobalMessage(messageId) {
  try {
    await supabase.from('global_chat_messages').delete().eq('id', messageId)
  } catch (err) {
    // fallback
  }

  const all = getLocalGlobalMessages()
  const updated = all.filter(m => m.id !== messageId)
  localStorage.setItem(LS_GLOBAL, JSON.stringify(updated))
  broadcastCommunityEvent('message_deleted', { id: messageId })
  return true
}

// ─────────────────────────────────────────────────────────────
// 2. ADMIN PINNED MESSAGE
// ─────────────────────────────────────────────────────────────
export async function fetchPinnedMessage() {
  try {
    const { data, error } = await supabase
      .from('admin_pinned_messages')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      localStorage.setItem(LS_PINNED, JSON.stringify(data[0]))
      return data[0]
    }
  } catch (err) {
    // fallback
  }

  try {
    const saved = localStorage.getItem(LS_PINNED)
    return saved ? JSON.parse(saved) : DEFAULT_PINNED
  } catch {
    return DEFAULT_PINNED
  }
}

export async function pinMessage({ messageId, content, authorName, authorAvatar, adminUser }) {
  const newPinned = {
    message_id: messageId,
    admin_id: adminUser?.id || ADMIN_USER_ID,
    content,
    author_name: authorName,
    author_avatar: authorAvatar,
    active: true,
    created_at: new Date().toISOString()
  }

  try {
    // 1. Deactivate old pinned
    await supabase.from('admin_pinned_messages').update({ active: false }).eq('active', true)

    // 2. Insert new pinned
    const { data, error } = await supabase
      .from('admin_pinned_messages')
      .insert([newPinned])
      .select()
      .single()

    if (!error && data) {
      localStorage.setItem(LS_PINNED, JSON.stringify(data))
      broadcastCommunityEvent('pinned_changed', data)
      return data
    }
  } catch (err) {
    // fallback
  }

  const fallbackPinned = {
    ...newPinned,
    id: 'pinned_' + Date.now()
  }
  localStorage.setItem(LS_PINNED, JSON.stringify(fallbackPinned))
  broadcastCommunityEvent('pinned_changed', fallbackPinned)
  return fallbackPinned
}

export async function unpinMessage(pinnedId) {
  try {
    await supabase.from('admin_pinned_messages').update({ active: false }).eq('id', pinnedId)
  } catch (err) {
    // fallback
  }

  localStorage.removeItem(LS_PINNED)
  broadcastCommunityEvent('pinned_changed', null)
  return true
}

// ─────────────────────────────────────────────────────────────
// 3. REACTIONS
// ─────────────────────────────────────────────────────────────
export async function fetchReactions(messageIds) {
  if (!messageIds || messageIds.length === 0) return {}

  try {
    const { data, error } = await supabase
      .from('global_chat_reactions')
      .select('*')
      .in('message_id', messageIds)

    if (!error && data) {
      const grouped = {}
      data.forEach(r => {
        if (!grouped[r.message_id]) grouped[r.message_id] = []
        grouped[r.message_id].push(r)
      })
      return grouped
    }
  } catch (err) {
    // fallback
  }

  try {
    const saved = localStorage.getItem(LS_REACTIONS)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export async function toggleReaction({ messageId, reaction, userId, username }) {
  try {
    const { data: existing } = await supabase
      .from('global_chat_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction', reaction)
      .maybeSingle()

    if (existing) {
      await supabase.from('global_chat_reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('global_chat_reactions').insert([{
        message_id: messageId,
        user_id: userId,
        reaction
      }])
    }
  } catch (err) {
    // local fallback
  }

  const saved = JSON.parse(localStorage.getItem(LS_REACTIONS) || '{}')
  if (!saved[messageId]) saved[messageId] = []

  const idx = saved[messageId].findIndex(r => r.user_id === userId && r.reaction === reaction)
  if (idx > -1) {
    saved[messageId].splice(idx, 1)
  } else {
    saved[messageId].push({ message_id: messageId, user_id: userId, username, reaction })
  }
  localStorage.setItem(LS_REACTIONS, JSON.stringify(saved))
  broadcastCommunityEvent('reaction_updated', { messageId, reactions: saved[messageId] })
  return saved[messageId]
}

// ─────────────────────────────────────────────────────────────
// 4. PRIVATE CHAT WITH ADMIN ONLY
// ─────────────────────────────────────────────────────────────
export async function fetchUserPrivateMessages(userId, adminId = ADMIN_USER_ID) {
  if (!userId) return []

  try {
    const { data, error } = await supabase
      .from('admin_private_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${adminId}),and(sender_id.eq.${adminId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return data
    }
  } catch (err) {
    // fallback
  }

  const all = getLocalPrivateMessages()
  return all.filter(m => 
    (m.sender_id === userId && m.recipient_id === adminId) ||
    (m.sender_id === adminId && m.recipient_id === userId)
  )
}

export async function sendPrivateMessage({ senderId, recipientId, content, imageUrl = null, senderName = '', senderAvatar = '' }) {
  if (!content?.trim() && !imageUrl) return null

  const payload = {
    sender_id: senderId,
    recipient_id: recipientId,
    content: content.trim(),
    image_url: imageUrl,
    read_at: null,
    created_at: new Date().toISOString(),
    sender_name: senderName,
    sender_avatar: senderAvatar
  }

  try {
    const { data, error } = await supabase
      .from('admin_private_messages')
      .insert([payload])
      .select()
      .single()

    if (!error && data) {
      saveLocalPrivateMessage(data)
      broadcastCommunityEvent('new_private_message', data)
      return data
    }
  } catch (err) {
    // fallback
  }

  const localMsg = {
    ...payload,
    id: 'priv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  }
  saveLocalPrivateMessage(localMsg)
  broadcastCommunityEvent('new_private_message', localMsg)
  return localMsg
}

export async function markPrivateMessagesAsRead(senderId, recipientId) {
  try {
    await supabase
      .from('admin_private_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', senderId)
      .eq('recipient_id', recipientId)
      .is('read_at', null)
  } catch (err) {
    // fallback
  }

  const all = getLocalPrivateMessages()
  const updated = all.map(m => {
    if (m.sender_id === senderId && m.recipient_id === recipientId && !m.read_at) {
      return { ...m, read_at: new Date().toISOString() }
    }
    return m
  })
  localStorage.setItem(LS_PRIVATE, JSON.stringify(updated))
}

export async function fetchAdminInbox(adminId = ADMIN_USER_ID) {
  try {
    const { data, error } = await supabase
      .from('admin_private_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return groupMessagesIntoInbox(data, adminId)
    }
  } catch (err) {
    // fallback
  }

  const local = getLocalPrivateMessages()
  return groupMessagesIntoInbox(local, adminId)
}

function groupMessagesIntoInbox(messages, adminId) {
  const threads = new Map()

  messages.forEach(msg => {
    const otherUserId = msg.sender_id === adminId ? msg.recipient_id : msg.sender_id
    if (!otherUserId) return

    if (!threads.has(otherUserId)) {
      threads.set(otherUserId, {
        userId: otherUserId,
        userName: msg.sender_id !== adminId ? (msg.sender_name || 'مستخدم') : 'مستخدم',
        userAvatar: msg.sender_id !== adminId ? (msg.sender_avatar || '🌱') : '🌱',
        lastMessage: msg.content,
        lastDate: msg.created_at,
        unreadCount: (msg.recipient_id === adminId && !msg.read_at) ? 1 : 0
      })
    } else {
      const thread = threads.get(otherUserId)
      if (msg.recipient_id === adminId && !msg.read_at) {
        thread.unreadCount += 1
      }
      if (msg.sender_id !== adminId && msg.sender_name) {
        thread.userName = msg.sender_name
        thread.userAvatar = msg.sender_avatar || thread.userAvatar
      }
    }
  })

  return Array.from(threads.values()).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate))
}

function getLocalPrivateMessages() {
  try {
    const saved = localStorage.getItem(LS_PRIVATE)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveLocalPrivateMessage(msg) {
  const all = getLocalPrivateMessages()
  all.push(msg)
  localStorage.setItem(LS_PRIVATE, JSON.stringify(all))
}

// ─────────────────────────────────────────────────────────────
// 5. COMMUNITY REPORTS & MODERATION
// ─────────────────────────────────────────────────────────────
export async function reportMessage({ messageId, reporterId, reason }) {
  const reportPayload = {
    message_id: messageId,
    reporter_id: reporterId,
    reason,
    status: 'pending',
    created_at: new Date().toISOString()
  }

  try {
    await supabase.from('community_reports').insert([reportPayload])
  } catch (err) {
    // fallback
  }

  const reports = JSON.parse(localStorage.getItem(LS_REPORTS) || '[]')
  reports.push({ ...reportPayload, id: 'rep_' + Date.now() })
  localStorage.setItem(LS_REPORTS, JSON.stringify(reports))
  return true
}

export async function fetchCommunityReports() {
  try {
    const { data, error } = await supabase
      .from('community_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) return data
  } catch (err) {
    // fallback
  }

  return JSON.parse(localStorage.getItem(LS_REPORTS) || '[]')
}

export async function resolveReport(reportId, status = 'reviewed') {
  try {
    await supabase.from('community_reports').update({ status }).eq('id', reportId)
  } catch (err) {
    // fallback
  }

  const reports = JSON.parse(localStorage.getItem(LS_REPORTS) || '[]')
  const updated = reports.map(r => r.id === reportId ? { ...r, status } : r)
  localStorage.setItem(LS_REPORTS, JSON.stringify(updated))
  return true
}

export async function toggleMessageModeration(messageId, status = 'hidden') {
  try {
    await supabase.from('global_chat_messages').update({ moderation_status: status }).eq('id', messageId)
  } catch (err) {
    // fallback
  }

  const all = getLocalGlobalMessages()
  const updated = all.map(m => m.id === messageId ? { ...m, moderation_status: status } : m)
  localStorage.setItem(LS_GLOBAL, JSON.stringify(updated))
  broadcastCommunityEvent('moderation_changed', { messageId, status })
  return true
}

// ─────────────────────────────────────────────────────────────
// 6. REALTIME SUBSCRIPTIONS & EVENT BROADCASTING
// ─────────────────────────────────────────────────────────────
function broadcastCommunityEvent(name, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zenstep_community_' + name, { detail }))
  }
}

export function subscribeToCommunityEvents(callback) {
  if (typeof window === 'undefined') return () => {}

  // 1. Supabase Realtime Channel
  const channel = supabase
    .channel('zenstep-community-global')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'global_chat_messages' }, payload => {
      callback({ type: 'global_chat_change', payload })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_pinned_messages' }, payload => {
      callback({ type: 'pinned_message_change', payload })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_private_messages' }, payload => {
      callback({ type: 'private_message_change', payload })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'global_chat_reactions' }, payload => {
      callback({ type: 'reactions_change', payload })
    })
    .subscribe()

  // 2. Custom local window events (instant cross-component reactivity)
  const handleLocal = (e) => {
    callback({ type: e.type.replace('zenstep_community_', ''), payload: e.detail })
  }

  const events = [
    'zenstep_community_new_global_message',
    'zenstep_community_message_updated',
    'zenstep_community_message_deleted',
    'zenstep_community_pinned_changed',
    'zenstep_community_new_private_message',
    'zenstep_community_reaction_updated',
    'zenstep_community_moderation_changed'
  ]

  events.forEach(evt => window.addEventListener(evt, handleLocal))

  return () => {
    supabase.removeChannel(channel)
    events.forEach(evt => window.removeEventListener(evt, handleLocal))
  }
}
