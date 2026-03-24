import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase ortam değişkenleri eksik.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function num(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function enrichProduct(row) {
  const alis = num(row.alis_fiyati);
  const montaj = num(row.montaj_maliyeti);
  const puan = num(row.puan);
  const fayda = num(row.fayda);

  const net_bedel =
    row.net_bedel !== null && row.net_bedel !== undefined && row.net_bedel !== ""
      ? num(row.net_bedel)
      : alis + montaj;

  const nakit_carpani = num(row.nakit_carpani);
  const kart_komisyon = num(row.kart_komisyon);

  const nakit =
    row.nakit !== null && row.nakit !== undefined && row.nakit !== ""
      ? num(row.nakit)
      : Math.round(net_bedel * (1 + nakit_carpani / 100));

  const kart =
    row.kart !== null && row.kart !== undefined && row.kart !== ""
      ? num(row.kart)
      : Math.round(nakit * (1 + kart_komisyon / 100));

  const kar =
    row.kar !== null && row.kar !== undefined && row.kar !== ""
      ? num(row.kar)
      : Math.max(0, nakit - net_bedel + puan + fayda);

  const kampanya =
    row.kampanya !== null && row.kampanya !== undefined && row.kampanya !== ""
      ? num(row.kampanya)
      : 0;

  return {
    ...row,
    alt_model_guc: row.alt_model_guc || row.alt_model || "",
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    net_bedel,
    nakit_carpani,
    kart_komisyon,
    nakit,
    kart,
    kar,
    kampanya,
    aktif: Boolean(row.aktif),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("aktif", true)
      .order("kategori", { ascending: true })
      .order("marka", { ascending: true })
      .order("model", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(enrichProduct), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Ürünler alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    if (body?.action !== "create" || !body?.product) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const p = body.product;

    const payload = enrichProduct({
      kategori: (p.kategori || "").trim(),
      marka: (p.marka || "").trim(),
      model: (p.model || "").trim(),
      alt_model_guc: (p.alt_model_guc || "").trim(),
      alis_fiyati: num(p.alis_fiyati),
      montaj_maliyeti: num(p.montaj_maliyeti),
      puan: num(p.puan),
      fayda: num(p.fayda),
      aktif: p.aktif ?? true,
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, product: enrichProduct(data) },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Yeni ürün eklenemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const products = Array.isArray(body?.products) ? body.products : [];

    if (!products.length) {
      return NextResponse.json({ error: "Kaydedilecek ürün bulunamadı." }, { status: 400 });
    }

    const payload = products.map((item) =>
      enrichProduct({
        id: item.id,
        kategori: item.kategori || "",
        marka: item.marka || "",
        model: item.model || "",
        alt_model_guc: item.alt_model_guc || "",
        alis_fiyati: num(item.alis_fiyati),
        montaj_maliyeti: num(item.montaj_maliyeti),
        puan: num(item.puan),
        fayda: num(item.fayda),
        net_bedel: num(item.net_bedel),
        nakit_carpani: num(item.nakit_carpani),
        kart_komisyon: num(item.kart_komisyon),
        nakit: num(item.nakit),
        kart: num(item.kart),
        kar: num(item.kar),
        kampanya: num(item.kampanya),
        aktif: Boolean(item.aktif),
        updated_at: new Date().toISOString(),
      })
    );

    const { data, error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, products: (data || []).map(enrichProduct) },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Ürünler kaydedilemedi." },
      { status: 500 }
    );
  }
}
