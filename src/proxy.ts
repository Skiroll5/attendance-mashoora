import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
    // @ts-ignore
    const isAdmin = !!req.auth?.user?.isAdmin;
    
    if (!isLoggedIn || !isAdmin) {
      const loginUrl = new URL(`/admin/login`, req.nextUrl.origin);
      return Response.redirect(loginUrl);
    }
  }
  
  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames and skip internal paths
  matcher: ['/', '/(ar|it)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
