import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
