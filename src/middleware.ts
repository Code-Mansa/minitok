import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/create-post", "/profile", "/message"] as const;

const AUTH_PATHS = new Set(["/login", "/register"]);

// Simple in-memory rate limiter (for global requests)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // max 100 requests per IP
const ipMap = new Map<string, { count: number; firstRequest: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // -------------------------------
  // Global Rate Limiter (per IP)
  // -------------------------------
  const now = Date.now();
  const entry = ipMap.get(ip) || { count: 0, firstRequest: now };
  if (now - entry.firstRequest < RATE_LIMIT_WINDOW) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    entry.count += 1;
  } else {
    entry.count = 1;
    entry.firstRequest = now;
  }
  ipMap.set(ip, entry);

  // -------------------------------
  // Auth Logic
  // -------------------------------
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = AUTH_PATHS.has(pathname);

  if (isProtectedPath && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
