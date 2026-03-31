import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Logic to protect /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Not authenticated, redirect to /login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const isSuperadmin = user.app_metadata?.is_superadmin === true
    
    if (!isSuperadmin) {
      // Authenticated but not superadmin, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If user is already logged in, don't show login page
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
