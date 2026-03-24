import { NextResponse } from "next/server";
import { getServerSupabase } from "../../lib/supabase";

function norm(value) {
  return String(value ?? "").trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = getServerSupabase();

    const payload = {
      kategori: norm(body.kategori),
      marka: norm(body.marka),
      model: norm(body.model),
      alt_model: norm(body.alt_model),

      alis_fiyati: Number(body.alis_fiyati || 0),
      montaj_maliyeti: Number(body.montaj_maliyeti || 0),
      puan: Number(body.puan || 0),
      fayda: Number(body.fayda || 0),

      nakit_carpani: Number(body.nakit_carpani || 9),
      kart_komisyon: Number(body.kart_komisyon || 18),

      aktif: body.aktif ?? true,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ row: data });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Ürün eklenemedi." },
      { status: 500 }
    );
  }
}
