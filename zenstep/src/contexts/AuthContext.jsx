import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateLevel } from '../lib/gamification'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

const LS_PROFILE = 'zs_profile'
const LS_QUESTS  = 'zs_quests'
const LS_MOODS   = 'zs_moods'

function makeDefault(user) {
  return {
    id: user?.id || 'guest',
    username: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'صاحبي',
    avatar_url: user?.user_metadata?.avatar_url || null,
    xp: 0, level: 1, streak_count: 0, last_quest_date: null,
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback((u) => {
    try {
      const raw = localStorage.getItem(LS_PROFILE)
      const p   = raw ? JSON.parse(raw) : makeDefault(u)
      setProfile({ ...p, level: calculateLevel(p.xp || 0).level })
    } catch {
      setProfile(makeDefault(u))
    }
  }, [])

  const saveProfile = useCallback((p) => {
    const updated = { ...p, level: calculateLevel(p.xp || 0).level }
    setProfile(updated)
    localStorage.setItem(LS_PROFILE, JSON.stringify(updated))
    return updated
  }, [])

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
    setUser(null); setProfile(null)
    localStorage.removeItem(LS_PROFILE)
  }

  const addXP = useCallback((amount) => {
    setProfile(prev => {
      if (!prev) return prev
      return saveProfile({ ...prev, xp: (prev.xp || 0) + amount })
    })
  }, [saveProfile])

  const updateStreak = useCallback(() => {
    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    setProfile(prev => {
      if (!prev) return prev
      const last    = prev.last_quest_date
      const newStreak = last === yesterday ? (prev.streak_count || 0) + 1
                      : last === today     ? prev.streak_count
                      : 1
      return saveProfile({ ...prev, streak_count: newStreak, last_quest_date: today })
    })
  }, [saveProfile])

  const getCompletedQuests = useCallback(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const all   = JSON.parse(localStorage.getItem(LS_QUESTS) || '{}')
      return all[today] || []
    } catch { return [] }
  }, [])

  const markQuestDone = useCallback((questId) => {
    const today = new Date().toISOString().split('T')[0]
    const all   = JSON.parse(localStorage.getItem(LS_QUESTS) || '{}')
    if (!all[today]) all[today] = []
    if (!all[today].includes(questId)) all[today].push(questId)
    localStorage.setItem(LS_QUESTS, JSON.stringify(all))
  }, [])

  const getMoodLogs = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(LS_MOODS) || '[]') } catch { return [] }
  }, [])

  const addMoodLog = useCallback((score, label, note = '') => {
    const logs  = getMoodLogs()
    const entry = { score, label, note, date: new Date().toISOString() }
    const updated = [entry, ...logs].slice(0, 30)
    localStorage.setItem(LS_MOODS, JSON.stringify(updated))
    return entry
  }, [getMoodLogs])

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signOut,
      addXP, updateStreak,
      getCompletedQuests, markQuestDone,
      getMoodLogs, addMoodLog,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
