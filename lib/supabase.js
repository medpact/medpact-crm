import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uthhxuhispnsemhjajor.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aGh4dWhpc3Buc2VtaGpham9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDc2OTcsImV4cCI6MjA4ODc4MzY5N30.UnRptPYEySDvL06_Rijslcek6f37EpytDXgMJ_I1G1k'

export const supabase = createClient(supabaseUrl, supabaseKey)