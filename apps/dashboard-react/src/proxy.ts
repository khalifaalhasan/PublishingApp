import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const SESSION_URL = `${API_BASE}/auth/get-session`;
const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie");
  const loginUrl = new URL("/login", request.url);

  // tanpa cookie, tidak perlu menghubungi backend
  if (!cookieHeader) return NextResponse.redirect(loginUrl);

  try {
    const authRes = await fetch(SESSION_URL, {
      headers: { Cookie: cookieHeader, Origin: APP_ORIGIN },
      cache: "no-store",
    });

    if (!authRes.ok) return NextResponse.redirect(loginUrl);

    // get-session membalas 200 + null kalau sesi tidak valid
    const data: { user?: User } | null = await authRes.json().catch(() => null);
    const user = data?.user;
    if (!user) return NextResponse.redirect(loginUrl);

    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-user-id", user.id);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.error("Proxy auth error:", error);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
