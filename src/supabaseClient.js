import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nydmayrnvnrnmaotkzit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZG1heXJudm5ybm1hb3Rreml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2MjIsImV4cCI6MjA2ODQxNTYyMn0.zwdYRcTnzRD4pRywUbhba-_E47pPsYG_dh51LDYE8K8' // Found in Supabase → Project Settings → API

export const supabase = createClient(supabaseUrl, supabaseKey)
