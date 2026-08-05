import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/admin-login");

  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute =
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/);

  if (isPublicRoute || isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // Check for the HttpOnly access token set by the backend
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    // Prevent redirect loops
    if (pathname !== "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except api, _next, and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
