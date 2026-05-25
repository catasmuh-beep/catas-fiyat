import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSupabase } from "../../../../lib/supabase";

function safeNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeKategori(value) {
  if (!value) return "";
  const v = String(value).trim().toLowerCase();

  if (v === "kombi") return "Kombi";
  if (v === "klima") return "Klima";
  if (v === "şofben" || v === "sofben") return "Şofben";
  if (
    v === "elektrikli kombi" ||
    v === "elk. kombi" ||
    v === "elk kombi" ||
    v === "elektrik kombi"
  ) return "Elektrikli Kombi";

  return String(value).trim();
}

function cleanRow(row) {
  return {
    id: row.id,
    kategori: normalizeKategori(row.kategori),
    marka: String(row.marka || "").trim(),
    model: String(row.model || "").trim(),
    guc: String(row.guc || "").trim(),
    alis: safeNumber(row.alis),
    montaj: safeNumber(row.montaj),
    puan: safeNumber(row.puan),
    fayda: safeNumber(row.fayda),
    aktif: row.aktif === true || row.aktif === "true" || row.aktif === 1,
  };
}

async function isAuthed() {
  const store = await cookies();
  return store.get("catas_admin")?.value === "1";
}

export async function POST(request) {
  try {
    if (!(await isAuthed())) {
      return NextResponse.json(
        { ok: false, error: "Yetkisiz işlem. Tekrar giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const products = Array.isArray(body?.products) ? body.products : [];

    if (products.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Kaydedilecek ürün gelmedi." },
        { status: 400 }
      );
    }

    const rows = products.map(cleanRow);

    const missing = rows.find((x) => !x.id || !x.kategori || !x.marka || !x.model);
    if (missing) {
      return NextResponse.json(
        { ok: false, error: "Eksik ürün bilgisi var.", missing },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const { error: upsertError } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "id" });

    if (upsertError) {
      return NextResponse.json(
        { ok: false, error: `Toplu kayıt hatası: ${upsertError.message}` },
        { status: 500 }
      );
    }

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { ok: false, error: `Listeleme hatası: ${fetchError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
