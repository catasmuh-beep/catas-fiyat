import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];

const BRAND_ORDER_BY_CATEGORY = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Şofben": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Elektrikli Kombi": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
};

function sortProducts(products = []) {
  return [...products].sort((a, b) => {
    const c1 = CATEGORY_ORDER.indexOf(a.category);
    const c2 = CATEGORY_ORDER.indexOf(b.category);
    const ci1 = c1 === -1 ? 999 : c1;
    const ci2 = c2 === -1 ? 999 : c2;

    if (ci1 !== ci2) return ci1 - ci2;

    const brands = BRAND_ORDER_BY_CATEGORY[a.category] || [];
    const b1 = brands.indexOf(a.brand);
    const b2 = brands.indexOf(b.brand);
    const bi1 = b1 === -1 ? 999 : b1;
    const bi2 = b2 === -1 ? 999 : b2;

    if (bi1 !== bi2) return bi1 - bi2;

    return (a.model || "").localeCompare(b.model || "", "tr");
  });
}

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
