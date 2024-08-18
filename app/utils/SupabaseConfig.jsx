import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    'https://zuezfzxkuhrczoskpupl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZXpmenhrdWhyY3pvc2twdXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM3MjAzMzEsImV4cCI6MjAzOTI5NjMzMX0.coa1kL-ZJv7AIuo715SweXV_eD7viSACJm3Aw5L0poQ')
