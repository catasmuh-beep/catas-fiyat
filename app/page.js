"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setError("");
      setDebug("Bağlantı deneniyor...");

      const { data, error } = await supabase
        .from("catas-fiyat-v3")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError(error.message);
        setDebug(JSON.stringify(error, null, 2));
        return;
      }

      setProducts(data || []);
      setDebug(`Ürün sayısı: ${(data || []).length}`);
    } catch (err) {
      setError(err?.message || "Bilinmeyen hata");
      setDebug(String(err));
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Çataş Fiyat Sistemi</h1>

      {error ? (
        <div style={{ color: "red", marginBottom: 20 }}>
          Hata: {error}
        </div>
      ) : null}

      <div style={{ marginBottom: 20, color: "#555" }}>
        Debug: {debug}
      </div>

      {products.length === 0 && !error ? <div>Ürün bulunamadı.</div> : null}

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            background: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {p.marka} {p.model}
          </h3>

          <div>Kategori: {p.kategori}</div>
          <div>Güç: {p.guc} kW</div>
          <div>Alış: {p.alis} ₺</div>
          <div>Montaj: {p.montaj} ₺</div>
          <div>Puan: {p.puan}</div>
          <div>Fayda: {p.fayda}</div>
        </div>
      ))}
    </main>
  );
}
