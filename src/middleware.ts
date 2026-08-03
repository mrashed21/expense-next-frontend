import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get("accessToken")?.value || request.cookies.get("refreshToken")?.value;

  const isAuthRoute = [
    "/login", 
    "/register", 
    "/admin-login", 
    "/forgot-password", 
    "/reset-password", 
    "/verify-otp"
  ].some(route => pathname === route || pathname.startsWith(route + "/"));
  
  const dashboardRoutes = [
    "/dashboard", 
    "/transactions", 
    "/accounts", 
    "/transfers", 
    "/categories", 
    "/budgets", 
    "/goals", 
    "/bills", 
    "/analytics", 
    "/reports", 
    "/calendar", 
    "/notifications", 
    "/profile", 
    "/settings"
  ];
  
  const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin-login");

  if (!token) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
