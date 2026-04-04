import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Supabase auth callback route.
 * Handles the code exchange for email confirmation and password reset.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // next parameter is the destination after code exchange
  const next = searchParams.get('next') ?? '/mis-academias';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Si el destino es mis-academias, añadimos flag para mostrar mensaje de éxito
      const finalNext = next === '/mis-academias' ? '/mis-academias?confirmed=1' : next;
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, '');
      // Use full URL with SITE_URL to avoid relative redirect issues and fix localhost links
      return NextResponse.redirect(`${siteUrl}${finalNext}`);
    } else {
      console.error('Error exchanging code for session:', error.message);
    }
  }

  // Fallback to error landing if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=Invalid%20or%20expired%20code`);
}
