import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth token from cookies
  const token =
    request.cookies.get("tradeslot_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  const isAuthenticated = Boolean(token);

  // Protected route patterns
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trader") ||
    pathname.startsWith("/settings");

  // Auth route patterns (login/register)
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // 1. Unauthenticated user trying to access protected route -> Redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access auth pages -> Redirect to /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trader/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
