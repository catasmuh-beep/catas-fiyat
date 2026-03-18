import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function GET() {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("catas_admin")?.value === "ok";

  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("price_items")
    .select("id, category, brand, model, cash_price, card_price, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}
