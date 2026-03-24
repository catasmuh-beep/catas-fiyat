import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase env eksik.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products : [];

    const supabase = getSupabase();

    const payload = products.map((item) => ({
      id: item.id || undefined,
      active: item.active ?? true,
      category: item.category || "",
      brand: item.brand || "",
      model: item.model || "",
      purchase_price: Number(item.purchase_price || 0),
      net_price: Number(item.net_price || 0),
      cash_price: Number(item.cash_price || 0),
      card_price: Number(item.card_price || 0),
      installation_cost: Number(item.installation_cost || 0),
      benefit: Number(item.benefit || 0),
      score: Number(item.score || 0),
      cash_multiplier: Number(item.cash_multiplier || 0),
      card_commission: Number(item.card_commission || 0),
    }));

    const { error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Toplu kayıt sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
