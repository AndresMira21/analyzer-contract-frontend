import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && /^(https?:)\/\//.test(supabaseUrl);

export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
export const profileTable = process.env.REACT_APP_SUPABASE_PROFILE_TABLE || 'profiles';
export { supabaseConfigured, supabaseUrl, supabaseAnonKey };