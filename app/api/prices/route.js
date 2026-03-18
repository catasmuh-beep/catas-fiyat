import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { defaultItems } from "@/lib/default-data";
import { recalcItem } from "@/lib/utils";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ mode: "local", items: defaultItems.map(recalcItem) });
  }

  const { data, error } = await supabase
    .from("price_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { mode: "local", items: defaultItems.map(recalcItem), error: error.message },
      { status: 200 }
    );
  }

  const items = (data || []).map((row) => ({
    id: row.item_id,
    brand: row.brand,
    category: row.category,
    model: row.model,
    alisFiyat: row.alis_fiyat,
    puan: row.puan,
    fayda: row.fayda,
    montajMaliyet: row.montaj_maliyet,
    kampanyaMaliyet: row.kampanya_maliyet,
    netBedel: row.net_bedel,
    kar: row.kar,
    nakitSatis: row.nakit_satis,
    kartSatis: row.kart_satis
  }));

  return NextResponse.json({ mode: "supabase", items: items.map(recalcItem) });
}

export async function POST(request) {
  const adminPassword = process.env.ADMIN_PASSWORD || "catas123";
  const supabase = getSupabase();

  const body = await request.json();
  const requestPassword = request.headers.get("x-admin-password") || body?.password;

  if (requestPassword !== adminPassword) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const items = Array.isArray(body?.items) ? body.items.map(recalcItem) : [];
  if (!items.length) {
    return NextResponse.json({ error: "Kaydedilecek veri bulunamadı" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ mode: "local" });
  }

  const rows = items.map((item, index) => ({
    item_id: item.id,
    sort_order: index + 1,
    brand: item.brand,
    category: item.category,
    model: item.model,
    alis_fiyat: item.alisFiyat,
    puan: item.puan,
    fayda: item.fayda,
    kampanya_maliyet: item.kampanyaMaliyet,
    montaj_maliyet: item.montajMaliyet,
    net_bedel: item.netBedel,
    kar: item.kar,
    nakit_satis: item.nakitSatis,
    kart_satis: item.kartSatis
  }));

  const { error } = await supabase.from("price_items").upsert(rows, { onConflict: "item_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mode: "supabase", ok: true });
}