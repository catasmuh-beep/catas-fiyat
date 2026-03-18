import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const cookie = request.cookies.get("catas_admin")?.value;
    if (cookie !== "ok") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"]
};
