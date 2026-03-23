import { NextResponse } from "next/server";
function norm(value) {
  return String(value ?? "").trim();
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const supabase = getServerSupabase();
    const id = params.id;

    const payload = {
      kategori: norm(body.kategori),
      marka: norm(body.marka),
      model: norm(body.model),
      alt_model: norm(body.alt_model),
      alis_fiyati: Number(body.alis_fiyati || 0),
      montaj_maliyeti: Number(body.montaj_maliyeti || 0),
      puan: Number(body.puan || 0),
      fayda: Number(body.fayda || 0),
      aktif: !!body.aktif,
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ row: data });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Ürün güncellenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getServerSupabase();
    const id = params.id;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Ürün silinemedi." },
      { status: 500 }
    );
  }
}
