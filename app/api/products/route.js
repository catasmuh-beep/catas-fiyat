import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase env bilgileri eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function enrichProduct(product) {
  const alis = toNumber(product.alis_fiyati);
  const montaj = toNumber(product.montaj_maliyeti);
  const puan = toNumber(product.puan);
  const fayda = toNumber(product.fayda);

  const netBedel =
    product.net_bedel !== null &&
    product.net_bedel !== undefined &&
    product.net_bedel !== ""
      ? toNumber(product.net_bedel)
      : alis + montaj;

  const nakitCarpani = toNumber(product.nakit_carpani);
  const kartKomisyon = toNumber(product.kart_komisyon);

  const nakit =
    product.nakit !== null &&
    product.nakit !== undefined &&
    product.nakit !== ""
      ? toNumber(product.nakit)
      : Math.round(netBedel * (1 + nakitCarpani / 100));

  const kart =
    product.kart !== null &&
    product.kart !== undefined &&
    product.kart !== ""
      ? toNumber(product.kart)
      : Math.round(nakit * (1 + kartKomisyon / 100));

  const kar =
    product.kar !== null &&
    product.kar !== undefined &&
    product.kar !== ""
      ? toNumber(product.kar)
      : Math.max(0, nakit - netBedel + puan + fayda);

  const kampanya =
    product.kampanya !== null &&
    product.kampanya !== undefined &&
    product.kampanya !== ""
      ? toNumber(product.kampanya)
      : 0;

  return {
    ...product,
    alt_model_guc: product.alt_model_guc || product.alt_model || "",
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
    aktif: Boolean(product.aktif),
  };
}

export async function GET() {
  try {
    const supabase = getSupabase();

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
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Ürünler alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (body?.action !== "create" || !body?.product) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const product = body.product;

    const payload = enrichProduct({
      kategori: product.kategori || "",
      marka: product.marka || "",
      model: product.model || "",
      alt_model_guc: product.alt_model_guc || "",
      alis_fiyati: toNumber(product.alis_fiyati),
      montaj_maliyeti: toNumber(product.montaj_maliyeti),
      puan: toNumber(product.puan),
      fayda: toNumber(product.fayda),
      aktif: product.aktif ?? true,
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
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Yeni ürün eklenemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const supabase = getSupabase();
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
        alis_fiyati: toNumber(item.alis_fiyati),
        montaj_maliyeti: toNumber(item.montaj_maliyeti),
        puan: toNumber(item.puan),
        fayda: toNumber(item.fayda),
        net_bedel: toNumber(item.net_bedel),
        nakit_carpani: toNumber(item.nakit_carpani),
        kart_komisyon: toNumber(item.kart_komisyon),
        nakit: toNumber(item.nakit),
        kart: toNumber(item.kart),
        kar: toNumber(item.kar),
        kampanya: toNumber(item.kampanya),
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
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Güncelleme yapılamadı." },
      { status: 500 }
    );
  }
}
