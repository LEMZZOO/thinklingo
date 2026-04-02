'use server';

import { createClient } from '@/lib/supabase/server';
import { ensureProfileExists } from '@/lib/profiles';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const fullName = formData.get('full_name') as string;

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos son obligatorios' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const supabase = await createClient();

  // 1. Sign up
  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/mis-academias`
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Detect duplicate user if identities is empty (Supabase enumeration protection)
  if (user && (!user.identities || user.identities.length === 0)) {
    return { error: 'Este correo electrónico ya está registrado' };
  }

  // 2. Ensure profile
  if (user) {
    await ensureProfileExists(user.id, fullName);
  }

  // If email confirmation is required, Supabase returns a user but session is null
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { success: 'Cuenta creada. Por favor, revisa tu correo electrónico para confirmar tu cuenta.' };
  }

  redirect('/mis-academias');
}
