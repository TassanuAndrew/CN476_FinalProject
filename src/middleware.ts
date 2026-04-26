import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // protect /admin and /api/admin (except login + logout)
  const needsAuth =
    (path.startsWith("/admin") && path !== "/admin/login") ||
    (path.startsWith("/api/admin") &&
      !path.startsWith("/api/admin/login") &&
      !path.startsWith("/api/admin/logout"));

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminToken(token);
  if (!session) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
