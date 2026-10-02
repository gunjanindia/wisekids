import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static assets, api routes (except protected ones), images, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "wisekids-super-secret-jwt-key-development-32bytes",
  });

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) || "STUDENT";

  // 1. Redirect generic portal/dashboard route to specific role dashboard
  if (pathname === "/portal" || pathname === "/dashboard") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (userRole === "TEACHER") return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.redirect(new URL("/student", request.url));
  }

  // 2. Redirect logged-in users away from /login or /register
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
      if (userRole === "TEACHER") return NextResponse.redirect(new URL("/teacher", request.url));
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "ADMIN") {
      // Unauthorized: redirect to their own dashboard
      if (userRole === "TEACHER") return NextResponse.redirect(new URL("/teacher", request.url));
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // 4. Protect /teacher routes
  if (pathname.startsWith("/teacher")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
      // Unauthorized: student trying to access teacher
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // 5. Protect /student routes
  if (pathname.startsWith("/student")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Admins and teachers can optionally preview student views, but default check passes for all authenticated users
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/portal",
    "/dashboard",
    "/login",
    "/register",
  ],
};
