import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sortProducts } from "../../../lib/catalog";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase env eksik.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((item) => ({
      id: item.id,
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
      updated_at: item.updated_at || null,
      created_at: item.created_at || null,
    }));

    return NextResponse.json({
      products: sortProducts(normalized),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = getSupabase();

    const payload = {
      active: body.active ?? true,
      category: body.category || "",
      brand: body.brand || "",
      model: body.model || "",
      purchase_price: Number(body.purchase_price || 0),
      net_price: Number(body.net_price || 0),
      cash_price: Number(body.cash_price || 0),
      card_price: Number(body.card_price || 0),
      installation_cost: Number(body.installation_cost || 0),
      benefit: Number(body.benefit || 0),
      score: Number(body.score || 0),
      cash_multiplier: Number(body.cash_multiplier || 0),
      card_commission: Number(body.card_commission || 0),
    };

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Kayıt sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
