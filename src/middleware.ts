import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Protected paths that require an active session
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/timeline") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/prescriptions") ||
    (pathname.startsWith("/emergency") && !pathname.startsWith("/emergency/info")) ||
    pathname.startsWith("/hospitals") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/ambulance") ||
    pathname.startsWith("/ambulances") ||
    pathname.startsWith("/family") ||
    pathname.startsWith("/doctor");

  if (isProtected && !refreshToken) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reports/:path*",
    "/timeline/:path*",
    "/appointments/:path*",
    "/prescriptions/:path*",
    "/hospitals/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/family",
    "/family/:path*",
    "/emergency",
    "/emergency/((?!info).*)",
    "/ambulance",
    "/ambulance/:path*",
    "/ambulances",
    "/ambulances/:path*",
    "/doctor",
    "/doctor/:path*",
  ],
};
