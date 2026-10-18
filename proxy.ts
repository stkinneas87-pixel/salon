import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_AUDIENCE,
  AUTH_COOKIE_NAME,
  AUTH_ISSUER,
} from "@/lib/auth/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;

  if (!token || !secret) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });
    return NextResponse.next();
  } catch {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
