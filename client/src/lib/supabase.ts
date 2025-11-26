import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ojqpusrqleqnlbugsqeq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcXB1c3JxbGVxbmxidWdzcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjkwODksImV4cCI6MjA3OTc0NTA4OX0.NvJ6QI-oiXNoMyS8eFe_iqZs2BicgPJxFTgqZRc7Ay8';

export const supabase = createClient(supabaseUrl, supabaseKey);
