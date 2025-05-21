import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const username = request.cookies.get("username")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtectedPage = pathname === "/" || pathname === "/dashboard";

  // ✅ If user is on login/signup and is already logged in, redirect to home
  if (isAuthPage && username) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ If user is visiting protected page without being logged in, redirect to login
  if (isProtectedPage && !username) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/login", "/signup"],
};
