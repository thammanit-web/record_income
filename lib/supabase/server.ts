import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for server components
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

