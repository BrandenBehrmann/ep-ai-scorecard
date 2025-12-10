import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Lazy-initialized clients to avoid build-time errors
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Server-side client with service role (creates new instance each call for isolation)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are not configured');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

// Legacy export for backwards compatibility
export const supabase = {
  get client() {
    return getSupabase();
  }
};
