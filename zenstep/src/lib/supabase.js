import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://tqmpphasiqzacuzrvtny.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qv4PgnVzgCHC_z0HN8ATJQ_Lvg67qE7'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

// Automated keep-alive ping on application launch (generates continuous traffic so Supabase never pauses)
export async function sendHeartbeat(source = 'client_app') {
  try {
    const timestamp = new Date().toISOString()
    // 1. Light read
    await supabase.from('profiles').select('id').limit(1)
    
    // 2. Light upsert to heartbeat if table is reachable
    await supabase.from('heartbeat').upsert([{
      id: 'web_client_ping',
      pinged_at: timestamp,
      source
    }])
  } catch (err) {
    // Graceful silent ignore
  }
}

// Trigger once per session
if (typeof window !== 'undefined') {
  setTimeout(() => sendHeartbeat(), 3000)
}
