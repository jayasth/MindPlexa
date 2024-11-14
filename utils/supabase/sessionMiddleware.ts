// File: /utils/supabase/sessionMiddleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './supabaseClientMiddleware';

// Define allowed paths for deactivated users
const DEACTIVATED_ALLOWED_PATHS = [
  '/workspace/account',
  '/signin',
  '/'
  // Add any other paths that should be accessible
];

// Define public paths that don't need auth
const PUBLIC_PATHS = ['/signin', '/', '/signup'];

export async function middleware(request: NextRequest) {
  console.log(`🔥 MIDDLEWARE RUNNING at ${new Date().toISOString()} 🔥`);
  console.log('Request URL:', request.url);
  console.log('Request path:', request.nextUrl.pathname);

  const { supabase, response } = createClient(request);

  // Get current path
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Log all request headers to check for any issues
  console.log('Request headers:', Object.fromEntries(request.headers));

  console.log('Middleware processing path:', path);

  // Check if it's a public path
  if (PUBLIC_PATHS.includes(path)) {
    console.log('Public path accessed:', path);
    return response;
  }

  // Check authentication
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('Unauthenticated user redirected to signin');
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  // Check if user is deactivated
  const { data: userDetails } = await supabase
    .from('users')
    .select('is_deactivated')
    .eq('id', user.id)
    .single();

  const isDeactivated = userDetails?.is_deactivated;

  console.log('User deactivation status:', isDeactivated);
  console.log('Current path:', path);
  console.log('Is allowed path:', DEACTIVATED_ALLOWED_PATHS.includes(path));

  // If deactivated, only allow access to specific paths
  if (isDeactivated) {
    const isAllowedPath = DEACTIVATED_ALLOWED_PATHS.some(
      (allowedPath) =>
        path === allowedPath || path.startsWith(allowedPath + '/')
    );

    if (!isAllowedPath) {
      console.log(`🚫 Access denied to ${path} - redirecting to account page`);
      url.pathname = '/workspace/account';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths starting with /workspace or /canvasEditor
    '/workspace/:path*',
    '/canvasEditor/:path*',
    // Match the workspace root
    '/workspace',
    // Match the canvasEditor root
    '/canvasEditor'
  ]
};
