import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Superadmin-level Supabase client for server-side operations only.
 * This client uses the SERVICE_ROLE key to bypass RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key missing in environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
