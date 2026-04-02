'use server';

import { createClient } from '@/lib/supabase/server';

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'El correo electrónico es obligatorio' };
  }

  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña pronto.' };
}
