import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/betterauth/auth";

const PROTECTED = ["/mail", "/calendar", "/agent", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mail/:path*", "/calendar/:path*", "/agent/:path*", "/settings/:path*"],
  runtime: "nodejs",
};
