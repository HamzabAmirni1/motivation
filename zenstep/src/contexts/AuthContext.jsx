import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, sendHeartbeat } from '../lib/supabase'
import { calculateLevel, ACHIEVEMENTS, getXPReward } from '../lib/gamification'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

const LS_PROFILE      = 'zs_profile'
const LS_QUESTS       = 'zs_quests'
const LS_MOODS        = 'zs_moods'
const LS_JOURNAL      = 'zs_journal'
const LS_HABITS       = 'zs_habits'
const LS_ACHIEVEMENTS = 'zs_achievements'
const LS_NOTIFICATIONS = 'zs_notifications'
const LS_STATS        = 'zs_stats'
const LS_AI           = 'zs_custom_quests'
const LS_CHAT         = 'zs_chat'

function makeDefault(user) {
  return {
    id: user?.id || 'guest',
    username: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'صاحبي',
    avatar_url: user?.user_metadata?.avatar_url || null,
    xp: 0,
    level: 1,
    streak_count: 0,
    last_quest_date: null,
    role: 'user',
    language: 'ar',
    settings: { notifications: true, sounds: true, theme: 'dark' }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [levelUpData, setLevelUpData] = useState(null)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_NOTIFICATIONS)
      return saved ? JSON.parse(saved) : [
        { id: 'welcome', title: 'مرحباً بك في ZenStep 🌱', message: 'بدا رحلتك اليومية نحو راحة البال والعافية النفسية.', type: 'system', read: false, created_at: new Date().toISOString() }
      ]
    } catch { return [] }
  })

  // Synchronize state to Supabase
  const syncToDatabase = async (p) => {
    let targetProfile = p
    if (!targetProfile) {
      try {
        const raw = localStorage.getItem(LS_PROFILE)
        if (raw) targetProfile = JSON.parse(raw)
      } catch {}
    }
    if (!targetProfile) targetProfile = profile
    if (!targetProfile || targetProfile.id === 'guest') return

    try {
      const quests_data = JSON.parse(localStorage.getItem(LS_QUESTS) || '{}')
      const mood_data = JSON.parse(localStorage.getItem(LS_MOODS) || '[]')
      const custom_ai_quests = JSON.parse(localStorage.getItem(LS_AI) || 'null')
      const chat_data = JSON.parse(localStorage.getItem(LS_CHAT) || '[]')

      // Build payload with ONLY the columns confirmed to exist in public.profiles:
      // (id, username, avatar_url, xp, level, streak_count, last_quest_date, quests_data, mood_data, custom_ai_quests, chat_data, updated_at)
      const payload = { 
        id: targetProfile.id, 
        username: targetProfile.username, 
        avatar_url: targetProfile.avatar_url, 
        xp: targetProfile.xp || 0, 
        level: targetProfile.level || 1, 
        streak_count: targetProfile.streak_count || 0, 
        last_quest_date: targetProfile.last_quest_date || null,
        quests_data,
        mood_data,
        custom_ai_quests,
        chat_data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase.from('profiles').upsert([payload])
      if (error) {
        console.warn('Sync to Supabase profile warning:', error)
      } else {
        console.log('Profile successfully synced to Supabase ✓')
      }

      // Also update auth user metadata in Supabase Auth so session and token stay aligned
      if (targetProfile.username || targetProfile.avatar_url) {
        supabase.auth.updateUser({
          data: {
            full_name: targetProfile.username,
            avatar_url: targetProfile.avatar_url
          }
        }).then(() => {}).catch(() => {})
      }
    } catch (e) {
      console.warn('Sync to Supabase profile exception:', e)
    }
  }

  // Check achievements after state updates
  const checkAchievements = useCallback((currentProfile, currentStats = null) => {
    try {
      const stats = currentStats || JSON.parse(localStorage.getItem(LS_STATS) || '{}')
      const unlocked = JSON.parse(localStorage.getItem(LS_ACHIEVEMENTS) || '[]')
      const userLevel = calculateLevel(currentProfile?.xp || 0).level

      const combinedStats = {
        ...stats,
        xp: currentProfile?.xp || 0,
        level: userLevel,
        streak: currentProfile?.streak_count || 0
      }

      ACHIEVEMENTS.forEach(ach => {
        if (!unlocked.includes(ach.id) && ach.check(combinedStats)) {
          unlocked.push(ach.id)
          localStorage.setItem(LS_ACHIEVEMENTS, JSON.stringify(unlocked))
          
          // Add notification
          const newNotif = {
            id: `ach_${ach.id}_${Date.now()}`,
            title: `🏆 وسام جديد: ${ach.title}`,
            message: `${ach.description} (+${ach.xpReward} XP)`,
            type: 'achievement',
            read: false,
            created_at: new Date().toISOString()
          }
          setNotifications(prev => [newNotif, ...prev])

          // Save to Supabase user_achievements
          if (currentProfile?.id && currentProfile.id !== 'guest') {
            supabase.from('user_achievements').upsert([{
              user_id: currentProfile.id,
              achievement_id: ach.id,
              title: ach.title,
              description: ach.description,
              icon: ach.icon
            }]).then(() => {}).catch(() => {})
          }
        }
      })
    } catch (err) {
      console.error('Error checking achievements:', err)
    }
  }, [])

  // Load Profile
  const loadProfile = useCallback(async (u) => {
    try {
      let localProfile = null
      try {
        const raw = localStorage.getItem(LS_PROFILE)
        if (raw) localProfile = JSON.parse(raw)
      } catch {}

      if (u) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', u.id).single()
        if (data && !error) {
          // If localProfile has a customized username or avatar, prefer it over null/empty database fields
          const finalUsername = data.username || localProfile?.username || u.user_metadata?.full_name || u.email?.split('@')[0] || 'صاحبي'
          const finalAvatar = data.avatar_url || localProfile?.avatar_url || u.user_metadata?.avatar_url || '🌱'

          const newProfile = {
            id: u.id,
            username: finalUsername,
            avatar_url: finalAvatar,
            xp: Math.max(data.xp || 0, localProfile?.xp || 0),
            level: Math.max(data.level || 1, localProfile?.level || 1),
            streak_count: Math.max(data.streak_count || 0, localProfile?.streak_count || 0),
            last_quest_date: data.last_quest_date || localProfile?.last_quest_date || null,
            role: localProfile?.role || 'user',
            language: localProfile?.language || localStorage.getItem('zs_lang') || 'ar',
            settings: localProfile?.settings || { notifications: true, sounds: true, theme: 'dark' }
          }
          setProfile(newProfile)
          localStorage.setItem(LS_PROFILE, JSON.stringify(newProfile))
          
          if (data.quests_data) localStorage.setItem(LS_QUESTS, JSON.stringify(data.quests_data))
          if (data.mood_data && Array.isArray(data.mood_data)) localStorage.setItem(LS_MOODS, JSON.stringify(data.mood_data))
          if (data.custom_ai_quests) localStorage.setItem(LS_AI, JSON.stringify(data.custom_ai_quests))
          if (data.chat_data) localStorage.setItem(LS_CHAT, JSON.stringify(data.chat_data))
          
          window.dispatchEvent(new CustomEvent('ai_quests_updated'))
          checkAchievements(newProfile)
          return
        }
      }
      
      const p = localProfile || makeDefault(u)
      const verified = { ...p, level: calculateLevel(p.xp || 0).level }
      setProfile(verified)
      checkAchievements(verified)
    } catch {
      setProfile(makeDefault(u))
    }
  }, [checkAchievements])

  const saveProfile = useCallback((p) => {
    const oldLevel = calculateLevel(profile?.xp || 0).level
    const newLevelObj = calculateLevel(p.xp || 0)
    const updated = { ...p, level: newLevelObj.level }
    
    // Check level up celebration
    if (newLevelObj.level > oldLevel) {
      setLevelUpData(newLevelObj)
      setNotifications(prev => [{
        id: `lvl_${newLevelObj.level}_${Date.now()}`,
        title: `🎉 ترقية جديدة: المستوى ${newLevelObj.level}!`,
        message: `مبروك! ارتقيت إلى مرتبة "${newLevelObj.titleAr || newLevelObj.title}". استمر في التقدم!`,
        type: 'level_up',
        read: false,
        created_at: new Date().toISOString()
      }, ...prev])
    }

    setProfile(updated)
    localStorage.setItem(LS_PROFILE, JSON.stringify(updated))
    syncToDatabase(updated)
    checkAchievements(updated)
    return updated
  }, [profile, checkAchievements])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u)
      else { setProfile(null); localStorage.removeItem(LS_PROFILE) }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [loadProfile])

  // Auth operations
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signInWithEmail = (email, pw) =>
    supabase.auth.signInWithPassword({ email, password: pw })

  const signUpWithEmail = (email, pw) =>
    supabase.auth.signUp({ email, password: pw })

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    localStorage.removeItem(LS_PROFILE)
  }

  // XP & Stats
  const addXP = useCallback((amount, activityType = 'general') => {
    setProfile(prev => {
      if (!prev) return prev
      const newXP = (prev.xp || 0) + amount
      const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}')
      stats.totalXpEarned = (stats.totalXpEarned || 0) + amount
      stats.completedExercises = (stats.completedExercises || 0) + 1
      if (activityType === 'breathing') stats.breathingCount = (stats.breathingCount || 0) + 1
      if (activityType === 'focus') stats.focusSessions = (stats.focusSessions || 0) + 1
      if (activityType === 'tools') stats.toolsUsedCount = (stats.toolsUsedCount || 0) + 1
      if (activityType === 'game') stats.gamesPlayed = (stats.gamesPlayed || 0) + 1
      localStorage.setItem(LS_STATS, JSON.stringify(stats))
      return saveProfile({ ...prev, xp: newXP })
    })
  }, [saveProfile])

  const updateStreak = useCallback(() => {
    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    setProfile(prev => {
      if (!prev) return prev
      const last = prev.last_quest_date
      const newStreak = last === yesterday ? (prev.streak_count || 0) + 1
                      : last === today     ? prev.streak_count
                      : 1
      return saveProfile({ ...prev, streak_count: newStreak, last_quest_date: today })
    })
  }, [saveProfile])

  // Quests
  const getCompletedQuests = useCallback(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const all = JSON.parse(localStorage.getItem(LS_QUESTS) || '{}')
      return all[today] || []
    } catch { return [] }
  }, [])

  const markQuestDone = useCallback((questId, xpReward = 20) => {
    const today = new Date().toISOString().split('T')[0]
    const all = JSON.parse(localStorage.getItem(LS_QUESTS) || '{}')
    if (!all[today]) all[today] = []
    if (!all[today].includes(questId)) {
      all[today].push(questId)
      localStorage.setItem(LS_QUESTS, JSON.stringify(all))
      addXP(xpReward, 'quest')
      updateStreak()
      syncToDatabase()
    }
  }, [addXP, updateStreak])

  // Mood Tracker CRUD
  const getMoodLogs = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(LS_MOODS) || '[]') } catch { return [] }
  }, [])

  const addMoodLog = useCallback(async (entryData) => {
    // entryData: { score, label, emoji, note, intensity, causes }
    const logs = getMoodLogs()
    const id = `mood_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const entry = {
      id,
      score: entryData.score,
      label: entryData.label,
      emoji: entryData.emoji || '😊',
      intensity: entryData.intensity || 5,
      causes: entryData.causes || [],
      note: entryData.note || '',
      date: new Date().toISOString()
    }
    const updated = [entry, ...logs].slice(0, 100)
    localStorage.setItem(LS_MOODS, JSON.stringify(updated))
    addXP(10, 'mood')
    syncToDatabase()

    // Sync to Supabase mood_entries table
    if (user && user.id !== 'guest') {
      try {
        await supabase.from('mood_entries').insert([{
          user_id: user.id,
          score: entry.score,
          mood_label: entry.label,
          emoji: entry.emoji,
          intensity: entry.intensity,
          causes: entry.causes,
          note: entry.note
        }])
      } catch (err) {
        console.warn('Supabase mood insert:', err)
      }
    }
    return entry
  }, [getMoodLogs, addXP, user])

  const deleteMoodLog = useCallback(async (id) => {
    const logs = getMoodLogs()
    const filtered = logs.filter(l => l.id !== id)
    localStorage.setItem(LS_MOODS, JSON.stringify(filtered))
    syncToDatabase()
  }, [getMoodLogs])

  // Journal CRUD
  const getJournalEntries = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(LS_JOURNAL) || '[]') } catch { return [] }
  }, [])

  const addJournalEntry = useCallback(async (entry) => {
    const current = getJournalEntries()
    const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const newEntry = {
      id,
      title: entry.title || 'تدوينة بدون عنوان',
      content: entry.content || '',
      mood: entry.mood || '🌿',
      tags: entry.tags || [],
      created_at: new Date().toISOString()
    }
    const updated = [newEntry, ...current]
    localStorage.setItem(LS_JOURNAL, JSON.stringify(updated))
    
    // Stats & XP
    const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}')
    stats.journalCount = (stats.journalCount || 0) + 1
    localStorage.setItem(LS_STATS, JSON.stringify(stats))
    addXP(15, 'journal')

    // Supabase
    if (user && user.id !== 'guest') {
      try {
        await supabase.from('journal_entries').insert([{
          user_id: user.id,
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags
        }])
      } catch (err) {
        console.warn('Supabase journal insert:', err)
      }
    }
    return newEntry
  }, [getJournalEntries, addXP, user])

  const updateJournalEntry = useCallback(async (id, data) => {
    const entries = getJournalEntries()
    const updated = entries.map(e => e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e)
    localStorage.setItem(LS_JOURNAL, JSON.stringify(updated))
  }, [getJournalEntries])

  const deleteJournalEntry = useCallback(async (id) => {
    const entries = getJournalEntries()
    const filtered = entries.filter(e => e.id !== id)
    localStorage.setItem(LS_JOURNAL, JSON.stringify(filtered))
  }, [getJournalEntries])

  // Habits CRUD
  const getHabits = useCallback(() => {
    try {
      const saved = localStorage.getItem(LS_HABITS)
      if (saved) return JSON.parse(saved)
      const defaults = [
        { id: 'h1', name: 'شرب 2 لتر ماء', description: 'ترطيب الجسم وتنشيط العقل', icon: '💧', color: '#7dd3fc', frequency: 'daily', completions: [] },
        { id: 'h2', name: 'تمرين تنفس 5 دقائق', description: 'تهدئة الجهاز العصبي', icon: '🌬️', color: '#6ee7b7', frequency: 'daily', completions: [] },
        { id: 'h3', name: 'قراءة 10 دقائق', description: 'تغذية الفكر والهدوء', icon: '📖', color: '#a78bfa', frequency: 'daily', completions: [] }
      ]
      localStorage.setItem(LS_HABITS, JSON.stringify(defaults))
      return defaults
    } catch { return [] }
  }, [])

  const toggleHabitCompletion = useCallback((habitId, dateStr) => {
    const habits = getHabits()
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const comps = Array.isArray(h.completions) ? [...h.completions] : []
        const exists = comps.includes(dateStr)
        const newComps = exists ? comps.filter(d => d !== dateStr) : [...comps, dateStr]
        if (!exists) addXP(10, 'habit')
        return { ...h, completions: newComps }
      }
      return h
    })
    localStorage.setItem(LS_HABITS, JSON.stringify(updated))
    return updated
  }, [getHabits, addXP])

  const addHabit = useCallback((habit) => {
    const habits = getHabits()
    const newH = {
      id: `habit_${Date.now()}`,
      name: habit.name,
      description: habit.description || '',
      icon: habit.icon || '🌱',
      color: habit.color || '#6ee7b7',
      frequency: habit.frequency || 'daily',
      completions: []
    }
    const updated = [newH, ...habits]
    localStorage.setItem(LS_HABITS, JSON.stringify(updated))
    return updated
  }, [getHabits])

  const deleteHabit = useCallback((habitId) => {
    const habits = getHabits()
    const filtered = habits.filter(h => h.id !== habitId)
    localStorage.setItem(LS_HABITS, JSON.stringify(filtered))
    return filtered
  }, [getHabits])

  // Notifications
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Exercise and Game recording
  const recordExerciseSession = useCallback(async (type, durationSeconds, xpEarned, notes = '') => {
    addXP(xpEarned, 'tools')
    if (user && user.id !== 'guest') {
      try {
        await supabase.from('exercise_sessions').insert([{
          user_id: user.id,
          exercise_type: type,
          duration_seconds: durationSeconds,
          xp_earned: xpEarned,
          notes
        }])
      } catch (e) {}
    }
  }, [addXP, user])

  const recordGameScore = useCallback(async (gameId, score, difficulty = 'normal') => {
    addXP(Math.max(5, Math.min(score, 30)), 'game')
    if (user && user.id !== 'guest') {
      try {
        await supabase.from('game_scores').insert([{
          user_id: user.id,
          game_id: gameId,
          score,
          difficulty
        }])
      } catch (e) {}
    }
  }, [addXP, user])

  return (
    <AuthContext.Provider value={{
      user, profile, loading, syncToDatabase, saveProfile,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signOut,
      addXP, updateStreak,
      getCompletedQuests, markQuestDone,
      getMoodLogs, addMoodLog, deleteMoodLog,
      getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry,
      getHabits, toggleHabitCompletion, addHabit, deleteHabit,
      notifications, markNotificationRead, markAllNotificationsRead,
      levelUpData, setLevelUpData,
      recordExerciseSession, recordGameScore
    }}>
      {children}
    </AuthContext.Provider>
  )
}
