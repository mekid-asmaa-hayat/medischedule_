// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardPath } from "@/lib/utils/permissions";
import type { Role } from "@/lib/prisma-enums";

const PUBLIC_PATHS = ["/", "/doctors", "/specialties", "/contact", "/book"];
const AUTH_PATHS = ["/login", "/register"];

// Role → allowed path prefixes
const ROLE_PATHS: Record<Role, string[]> = {
  ADMIN: ["/admin", "/dashboard", "/settings"],
  DOCTOR: ["/doctor", "/dashboard", "/settings"],
  STAFF: ["/staff", "/dashboard", "/settings"],
  PATIENT: ["/patient", "/dashboard", "/settings"],
};

export default auth((req: NextRequest & { auth: { user?: { role?: Role } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = !!(session?.user);

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.includes(pathname)) {
    if (isAuthenticated && session?.user?.role) {
      const dashPath = getDashboardPath(session.user!.role as Role);
      return NextResponse.redirect(new URL(dashPath, req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session!.user?.role ?? "PATIENT") as Role;

  // /dashboard → redirect to role-specific dashboard
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  // Check role-based path access
  const allowedPaths = ROLE_PATHS[role] ?? [];
  const hasAccess = allowedPaths.some((p) => pathname.startsWith(p));

  if (!hasAccess) {
    // Redirect to their own dashboard instead of 403
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
