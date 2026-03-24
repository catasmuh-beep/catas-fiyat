import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Supabase env eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function num(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(row) {
  const alis = num(row.alis_fiyati);
  const montaj = num(row.montaj_maliyeti);
  const puan = num(row.puan);
  const fayda = num(row.fayda);

  const netBedel = row.net_bedel !== null && row.net_bedel !== undefined
    ? num(row.net_bedel)
    : alis + montaj;

  const nakitCarpani = num(row.nakit_carpani);
  const kartKomisyon = num(row.kart_komisyon);

  const nakit = row.nakit !== null && row.nakit !== undefined
    ? num(row.nakit)
    : Math.round(netBedel * (1 + nakitCarpani / 100));

  const kart = row.kart !== null && row.kart !== undefined
    ? num(row.kart)
    : Math.round(nakit * (1 + kartKomisyon / 100));

  const kar = row.kar !== null && row.kar !== undefined
    ? num(row.kar)
    : Math.max(0, nakit - netBedel + fayda + puan);

  const kampanya = row.kampanya !== null && row.kampanya !== undefined
    ? num(row.kampanya)
    : nakit;

  return {
    id: row.id,
    kategori: row.kategori || "",
    marka: row.marka || "",
    model: row.model || "",
    alt_model_guc: row.alt_model_guc || "",
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    net_bedel: netBedel,
    nakit_carpani: nakitCarpani,
    kart_komisyon: kartKomisyon,
    nakit,
    kart,
    kar,
    kampanya,
    aktif: Boolean(row.aktif),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("kategori", { ascending: true })
      .order("marka", { ascending: true })
      .order("model", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map(normalizeProduct);

    return NextResponse.json(normalized, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "GET products hatası." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const products = Array.isArray(body?.products) ? body.products : [];

    if (!products.length) {
      return NextResponse.json({ error: "Kaydedilecek ürün bulunamadı." }, { status: 400 });
    }

    const payload = products.map((p) => {
      const alis = num(p.alis_fiyati);
      const montaj = num(p.montaj_maliyeti);
      const puan = num(p.puan);
      const fayda = num(p.fayda);

      const netBedel =
        p.net_bedel !== null && p.net_bedel !== undefined && p.net_bedel !== ""
          ? num(p.net_bedel)
          : alis + montaj;

      const nakitCarpani = num(p.nakit_carpani);
      const kartKomisyon = num(p.kart_komisyon);

      const nakit =
        p.nakit !== null && p.nakit !== undefined && p.nakit !== ""
          ? num(p.nakit)
          : Math.round(netBedel * (1 + nakitCarpani / 100));

      const kart =
        p.kart !== null && p.kart !== undefined && p.kart !== ""
          ? num(p.kart)
          : Math.round(nakit * (1 + kartKomisyon / 100));

      const kar =
        p.kar !== null && p.kar !== undefined && p.kar !== ""
          ? num(p.kar)
          : Math.max(0, nakit - netBedel + fayda + puan);

      const kampanya =
        p.kampanya !== null && p.kampanya !== undefined && p.kampanya !== ""
          ? num(p.kampanya)
          : nakit;

      return {
        id: p.id || undefined,
        kategori: (p.kategori || "").trim(),
        marka: (p.marka || "").trim(),
        model: (p.model || "").trim(),
        alt_model_guc: (p.alt_model_guc || "").trim(),
        alis_fiyati: alis,
        montaj_maliyeti: montaj,
        puan,
        fayda,
        net_bedel: netBedel,
        nakit_carpani: nakitCarpani,
        kart_komisyon: kartKomisyon,
        nakit,
        kart,
        kar,
        kampanya,
        aktif: Boolean(p.aktif),
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "id" })
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, products: (data || []).map(normalizeProduct) },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "POST products hatası." },
      { status: 500 }
    );
  }
}
