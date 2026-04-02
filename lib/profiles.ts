import { createAdminClient } from './supabase/admin';

/**
 * Ensures that a profile exists for a given user.
 * If it doesn't exist, it creates one with the provided full_name.
 */
export async function ensureProfileExists(userId: string, fullName: string | null = null) {
  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching profile in ensureProfileExists:', fetchError);
    return;
  }

  if (!existing) {
    const { error: insertError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        avatar_url: null,
      });

    if (insertError) {
      console.error('Error creating profile in ensureProfileExists:', insertError);
    }
  }
}
