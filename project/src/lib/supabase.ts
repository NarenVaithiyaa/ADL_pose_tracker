import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Exercise = {
  id: string;
  name: string;
  youtube_url: string | null;
  is_predefined: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutLog = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  duration_seconds: number | null;
  completed_at: string;
  notes: string | null;
};

export type UserPreferences = {
  id: string;
  theme_mode: 'light' | 'dark';
  last_quote_refresh: string | null;
  updated_at: string;
};
