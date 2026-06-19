import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

function loginUrl(request: NextRequest) {
  const url = new URL("/admin/login", request.url);
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (callbackUrl !== "/admin/login") {
    url.searchParams.set("callbackUrl", callbackUrl);
  }

  return url;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const isAdmin = token?.role === "ADMIN";

  if (isAdmin) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(loginUrl(request));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
