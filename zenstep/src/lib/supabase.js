import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL   || 'https://tqmpphasiqzacuzrvtny.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qv4PgnVzgCHC_z0HN8ATJQ_Lvg67qE7'

export const supabase = createClient(url, key)
