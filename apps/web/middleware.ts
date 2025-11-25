import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt")?.value;
  const isProtected = req.nextUrl.pathname.startsWith("/client-user");

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }
  return NextResponse.next();
}
