import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function num(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(product = {}) {
  return {
    kategori: product.kategori || "",
    marka: product.marka || "",
    model: product.model || "",
    urun_adi: product.urun_adi || product.model || "",
    guc: product.guc || product.alt_model_guc || "",
    aktif: product.aktif !== false,

    alis_fiyati: num(product.alis_fiyati),
    montaj_maliyeti: num(product.montaj_maliyeti),
    puan: num(product.puan),
    fayda: num(product.fayda),
    nakit_carpani: num(product.nakit_carpani),
    kart_komisyonu: num(product.kart_komisyonu ?? product.kart_komisyon),
    kampanya_fiyati: num(product.kampanya_fiyati ?? product.kampanya),
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        kategori,
        marka,
        model,
        urun_adi,
        guc,
        aktif,
        alis_fiyati,
        montaj_maliyeti,
        puan,
        fayda,
        nakit_carpani,
        kart_komisyonu,
        kampanya_fiyati,
        created_at,
        updated_at
      `)
      .order("kategori", { ascending: true })
      .order("marka", { ascending: true })
      .order("model", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, products: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Products API hatası",
        products: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawProduct = body?.product || body || {};
    const product = normalizeProduct(rawProduct);

    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: data,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Ürün eklenemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const incomingProducts = Array.isArray(body?.products) ? body.products : [];

    if (!incomingProducts.length) {
      return NextResponse.json(
        { ok: false, error: "Güncellenecek ürün bulunamadı." },
        { status: 400 }
      );
    }

    const products = incomingProducts.map((item) => ({
      id: item.id,
      ...normalizeProduct(item),
    }));

    const { data, error } = await supabase
      .from("products")
      .upsert(products, { onConflict: "id" })
      .select();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Ürünler güncellenemedi." },
      { status: 500 }
    );
  }
}
