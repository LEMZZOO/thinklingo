import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Use the project's actual environment variables
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT remove getUser() call for security and session refreshing
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. PUBLIC AUTH ROUTES
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/mis-academias', request.url))
    }
    return supabaseResponse
  }

  // 2. PRIVATE ROUTES (Require session)
  const privatePrefixes = ['/mis-academias', '/a/', '/admin', '/perfil']
  const isPrivate = privatePrefixes.some(prefix => pathname.startsWith(prefix))

  if (isPrivate) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Special protection for /admin
    if (pathname.startsWith('/admin')) {
      const isSuperadmin = user.app_metadata?.is_superadmin === true
      if (!isSuperadmin) {
        return NextResponse.redirect(new URL('/mis-academias', request.url))
      }
    }
    
    return supabaseResponse
  }

  // 3. LEGACY ROUTES (Redirect to login or private home)
  const legacyRoutes = ['/vocabulario', '/flashcards', '/quiz', '/favoritos', '/progreso', '/lista', '/modo', '/logros']
  if (legacyRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(user ? '/mis-academias' : '/login', request.url))
  }

  // Root path handling
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/mis-academias' : '/login', request.url))
  }

  return supabaseResponse
}

// Config matcher standard for Next.js to ensure it intercepts necessary routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
