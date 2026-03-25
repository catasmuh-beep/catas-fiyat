"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("başlamadı");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setDebug("sorgu başlıyor");

      const { data, error } = await supabase
        .from("catas-fiyat-v3")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError(error.message);
        setDebug(`supabase error: ${JSON.stringify(error)}`);
        return;
      }

      setProducts(data || []);
      setDebug(`ürün sayısı: ${(data || []).length}`);
    } catch (err) {
      setError(err?.message || "bilinmeyen hata");
      setDebug(`catch: ${String(err)}`);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Çataş Fiyat Sistemi</h1>

      <div style={{ marginBottom: 16 }}>
        <strong>Debug:</strong> {debug}
      </div>

      {error ? (
        <div style={{ color: "red", marginBottom: 20 }}>
          Hata: {error}
        </div>
      ) : null}

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
          <div>Güç: {p.guc}</div>
          <div>Alış: {p.alis}</div>
          <div>Montaj: {p.montaj}</div>
          <div>Puan: {p.puan}</div>
          <div>Fayda: {p.fayda}</div>
        </div>
      ))}
    </main>
  );
}
