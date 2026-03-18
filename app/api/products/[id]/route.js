
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { computeDerived } from "../../../lib/pricing";
import { getServerSupabase } from "../../../lib/supabase";

export async function PATCH(request, { params }) {
  if (cookies().get("catas_admin")?.value !== "1") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await request.json();
  const derived = computeDerived(body);
  const payload = {
    kategori: body.kategori,
    marka: body.marka,
    model: body.model,
    alt_model: body.alt_model,
    alis_fiyati: Number(body.alis_fiyati || 0),
    puan: Number(body.puan || 0),
    fayda: Number(body.fayda || 0),
    kampanya_maliyeti: derived.kampanya_maliyeti,
    montaj_maliyeti: Number(body.montaj_maliyeti || 0),
    net_bedel: derived.net_bedel,
    kar: derived.kar,
    nakit_satis: derived.nakit_satis,
    kart_satis: derived.kart_satis,
    aktif: !!body.aktif,
  };

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ row: data });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Sunucu hatası." }, { status: 500 });
  }
}
