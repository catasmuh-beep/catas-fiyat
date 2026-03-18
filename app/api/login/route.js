
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD ortam değişkeni eksik." }, { status: 500 });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }
  cookies().set("catas_admin", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return NextResponse.json({ ok: true });
}
