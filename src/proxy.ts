import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("admin_session")?.value;
    const role = request.cookies.get("admin_role")?.value;

    const adminToken = process.env.ADMIN_SESSION_TOKEN;
    const driverToken = process.env.DRIVER_SESSION_TOKEN;

    const isAdmin = adminToken ? session === adminToken && role === "admin" : session === "authenticated";
    const isDriver = driverToken ? session === driverToken && role === "driver" : false;

    if (!isAdmin && !isDriver) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Fahrer darf nur /admin/fahrer sehen
    if (isDriver && !pathname.startsWith("/admin/fahrer")) {
      return NextResponse.redirect(new URL("/admin/fahrer", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
