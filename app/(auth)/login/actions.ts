'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { smartLoginRedirect } from '@/lib/auth/redirects';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await smartLoginRedirect(user.id);
  }

  // Fallback genérico
  redirect('/');
}
