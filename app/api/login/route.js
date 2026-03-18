import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD tanımlı değil." }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("catas_admin", "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
