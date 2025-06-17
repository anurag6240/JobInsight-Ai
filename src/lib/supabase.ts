import { createClient } from '@supabase/supabase-js';

// Using environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase configuration is missing. Please check your .env file");
}

// Create the Supabase client with the URL and key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
