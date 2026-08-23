import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  parseUserRoleFromCookies,
  isAdminRoute,
  isTraderRoute,
  isCustomerRoute,
  isProtectedRoute,
  PUBLIC_AUTH_ROUTES,
  getDefaultRedirectForRole,
  isRouteAllowedForRole,
} from '@/config/routes.config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth token & user data from cookies
  const token =
    request.cookies.get('tradeslot_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value;

  const rawUserCookie = request.cookies.get('tradeslot_user')?.value;
  const userRole = parseUserRoleFromCookies(rawUserCookie, token);
  const isAuthenticated = Boolean(token && userRole);

  const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);
  const isProtected = isProtectedRoute(pathname);

  // 1. Redirect unauthenticated users attempting to access protected dashboard / feature routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from public auth routes to their role's default dashboard
  if (isAuthRoute && isAuthenticated) {
    const defaultDashboard = getDefaultRedirectForRole(userRole);
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  // 3. Handle explicit role path aliases
  if (isAuthenticated && userRole) {
    if (pathname === '/dashboard/trader' || pathname === '/dashboard/trader/') {
      const target = userRole === 'TRADER' ? '/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname === '/dashboard/customer' || pathname === '/dashboard/customer/') {
      const target = userRole === 'CUSTOMER' ? '/customer/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 4. Role-based Access Control (RBAC Gatekeeper)
  if (isAuthenticated && userRole) {
    // If non-admin attempts to access an ADMIN route -> Redirect immediately to their default dashboard
    if (isAdminRoute(pathname) && userRole !== 'PLATFORM_ADMIN' && userRole !== 'ADMIN') {
      const target = getDefaultRedirectForRole(userRole);
      return NextResponse.redirect(new URL(target, request.url));
    }

    // If CUSTOMER attempts to access a TRADER route -> Redirect immediately to Customer Dashboard
    if (isTraderRoute(pathname) && userRole === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }

    // If TRADER attempts to access a CUSTOMER route -> Redirect immediately to Trader Dashboard
    if (isCustomerRoute(pathname) && userRole === 'TRADER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // General route permission check based on centralized config
    if (!isRouteAllowedForRole(pathname, userRole)) {
      const defaultRedirect = getDefaultRedirectForRole(userRole);
      return NextResponse.redirect(new URL(defaultRedirect, request.url));
    }
  }

  return NextResponse.next();
}

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/customer/:path*',
    '/trader/:path*',
    '/book/:path*',
    '/simulator/:path*',
    '/bookings/:path*',
    '/profile/:path*',
    '/work-area/:path*',
    '/schedule/:path*',
    '/payouts/:path*',
    '/login',
    '/register',
  ],
};
