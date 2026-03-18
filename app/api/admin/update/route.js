import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function POST(request) {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("catas_admin")?.value === "ok";

  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await request.json();
  const { id, cash_price, card_price } = body;

  if (!id) {
    return NextResponse.json({ error: "Kayıt id zorunlu." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("price_items")
    .update({
      cash_price: cash_price === "" ? null : Number(cash_price),
      card_price: card_price === "" ? null : Number(card_price)
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
