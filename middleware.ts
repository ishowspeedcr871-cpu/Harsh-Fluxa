import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const MASTER_DEVELOPER_COOKIE = "fluxa_master_developer";
import { SESSION_COOKIE_NAME } from "@/services/auth/constants";

const protectedRoutes = [
  "/dashboard",
  "/organization",
  "/onboarding/organization",
  "/printers",
  "/analytics",
  "/reports",
  "/settings",
  "/profile",
  "/invitations",
  "/customer",
  "/employee",
];

function isProtected(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/developer/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/developer")) {
    const masterCookie = request.cookies.get(MASTER_DEVELOPER_COOKIE)?.value;
    if (masterCookie) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/developer/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!isProtected(pathname)) return NextResponse.next();

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  loginUrl.searchParams.set("portal", "customer");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
