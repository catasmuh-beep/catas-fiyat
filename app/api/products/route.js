import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function normalizePayload(body) {
  return {
    kategori: body?.kategori ?? "",
    marka: body?.marka ?? "",
    model: body?.model ?? "",
    urun_adi: body?.urun_adi ?? body?.model ?? "",
    alis: Number(body?.alis ?? 0),
    montaj: Number(body?.montaj ?? 0),
    puan: Number(body?.puan ?? 0),
    fayda: Number(body?.fayda ?? 0),
    nakit_carpani: Number(body?.nakit_carpani ?? 0),
    kart_komisyon: Number(body?.kart_komisyon ?? 0),
    aktif: body?.aktif ?? true,
    siralama: Number(body?.siralama ?? 0),
  };
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("kategori", { ascending: true })
      .order("marka", { ascending: true })
      .order("siralama", { ascending: true })
      .order("model", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, products: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: Array.isArray(data) ? data : [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "GET products hatası",
        products: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const payload = normalizePayload(body);

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, product: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "POST products hatası" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (!body?.id) {
      return NextResponse.json(
        { ok: false, error: "Ürün id eksik." },
        { status: 400 }
      );
    }

    const payload = normalizePayload(body);

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, product: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "PUT products hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Silme için id gerekli." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "DELETE products hatası" },
      { status: 500 }
    );
  }
}
