'use server';

import { createClient } from '@/lib/supabase/server';
import { smartLoginRedirect } from '@/lib/auth/redirects';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Tu cuenta existe, pero aún no has confirmado tu correo electrónico.' };
    }
    return { error: 'Credenciales inválidas' };
  }

  if (user) {
    await smartLoginRedirect(user.id, user.app_metadata?.is_superadmin === true);
  }

  redirect('/');
}