
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().set("catas_admin", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
