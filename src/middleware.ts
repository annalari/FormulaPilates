import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get auth data from cookies
  const authData = request.cookies.get('auth')?.value
  if (!authData) {
    // If no auth data, only allow access to login page
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  try {
    const { user } = JSON.parse(authData)

    // If user is in first login or inactive, only allow access to change-password
    if (user.isFirstLogin || !user.isActive) {
      if (request.nextUrl.pathname !== '/change-password' && request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/change-password', request.url))
      }
    }

    // If user is active and tries to access change-password, redirect to home
    if (!user.isFirstLogin && user.isActive && request.nextUrl.pathname === '/change-password') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If auth data is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
