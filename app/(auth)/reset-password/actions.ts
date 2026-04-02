'use server';

import { createClient } from '@/lib/supabase/server';

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { error: 'Ambos campos son obligatorios' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const supabase = await createClient();

  // Supabase update user (password) uses the recovery session automatically 
  // if the user arrived via a recovery link handled by exchangeCodeForSession.
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...' };
}
