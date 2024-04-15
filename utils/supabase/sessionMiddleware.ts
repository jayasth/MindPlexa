// File: /utils/supabase/sessionMiddleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './supabaseClientMiddleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Get current path from the request
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Example redirect logic
  // Redirect to dashboard if authenticated and on the landing page
  const isAuthenticated = request.cookies.has('sb:token'); // Check for authentication-related cookie

  if (isAuthenticated && (path === '/' || path === '/login')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect to login if not authenticated and trying to access a protected route
  if (!isAuthenticated && !['/', '/login'].includes(path)) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response; // Continue with the original or updated response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
