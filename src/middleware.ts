import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For client-side authentication, we'll let the client handle redirects
  // This middleware will only handle static file serving
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isChangePasswordPage = request.nextUrl.pathname === '/change-password'
  const isPublicPath = isLoginPage || isChangePasswordPage

  // Allow all requests to pass through - authentication will be handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
