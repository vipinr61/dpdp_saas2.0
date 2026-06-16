import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/auth', '/debug', '/test-auth'];
const PROTECTED_ROUTES = ['/dashboard', '/customers', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/';

  // Supabase sets cookies as `sb-<project-ref>-auth-token`, not `sb-auth-token`
  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  if (isProtectedRoute && !hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
