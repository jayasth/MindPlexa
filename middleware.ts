import { middleware } from './utils/supabase/sessionMiddleware';
export { middleware };

// Re-export the config
export const config = {
  matcher: [
    '/workspace/:path*',
    '/canvasEditor/:path*',
    '/workspace',
    '/canvasEditor'
  ]
};
