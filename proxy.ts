import { NextResponse } from "next/server";
import { auth } from "@/auth";

function loginUrl(request: Parameters<Parameters<typeof auth>[0]>[0]) {
  const url = new URL("/admin/login", request.url);
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (callbackUrl !== "/admin/login") {
    url.searchParams.set("callbackUrl", callbackUrl);
  }

  return url;
}

export const proxy = auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isAdmin = request.auth?.user?.role === "ADMIN";

  if (isAdmin) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(loginUrl(request));
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
