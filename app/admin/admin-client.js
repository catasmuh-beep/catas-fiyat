"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatePricing, formatTL } from "../lib/pricing";

function emptyProduct() {
  return {
    kategori: "",
    marka: "",
    model: "",
    urun_adi: "",
    alis: 0,
    montaj: 0,
    puan: 0,
    fayda: 0,
    nakit_carpani: 0,
    kart_komisyon: 0,
    aktif: true,
    siralama: 0,
  };
}

function safeText(value) {
  return String(value ?? "");
}

export default function AdminClient() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState(emptyProduct());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Ürünler alınamadı.");
      }

      setProducts(Array.isArray(json.products) ? json.products : []);
    } catch (err) {
      setProducts([]);
      setError(err?.message || "Yükleme hatası.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const grouped = useMemo(() => {
    const result = {};

    for (const product of products) {
      const kategori = safeText(product?.kategori) || "Diğer";
      if (!result[kategori]) result[kategori] = [];
      result[kategori].push(product);
    }

    return result;
  }, [products]);

  function updateNewProduct(field, value) {
    setNewProduct((prev) => ({
      ...prev,
      [field]:
        field === "aktif"
          ? value
          : ["kategori", "marka", "model", "urun_adi"].includes(field)
          ? value
          : Number(value || 0),
    }));
  }

  async function handleCreate() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...newProduct,
        urun_adi: newProduct.urun_adi || newProduct.model,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Ürün eklenemedi.");
      }

      setMessage("Ürün başarıyla eklendi.");
      setNewProduct(emptyProduct());
      await loadProducts();
    } catch (err) {
      setError(err?.message || "Kaydetme hatası.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(product) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Güncelleme yapılamadı.");
      }

      setMessage("Ürün güncellendi.");
      await loadProducts();
    } catch (err) {
      setError(err?.message || "Güncelleme hatası.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Silme işlemi başarısız.");
      }

      setMessage("Ürün silindi.");
      await loadProducts();
    } catch (err) {
      setError(err?.message || "Silme hatası.");
    } finally {
      setSaving(false);
    }
  }

  function updateRow(id, field, value) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "aktif"
                  ? value
                  : ["kategori", "marka", "model", "urun_adi"].includes(field)
                  ? value
                  : Number(value || 0),
            }
          : item
      )
    );
  }

  return (
    <div className="admin-shell">
      <h1>Yönetici Paneli</h1>

      {error ? <div className="state-box error">{error}</div> : null}
      {message ? <div className="state-box">{message}</div> : null}

      <section className="admin-create-card">
        <h2>Yeni Ürün Ekle</h2>

        <div className="admin-grid">
          <input placeholder="Kategori" value={newProduct.kategori} onChange={(e) => updateNewProduct("kategori", e.target.value)} />
          <input placeholder="Marka" value={newProduct.marka} onChange={(e) => updateNewProduct("marka", e.target.value)} />
          <input placeholder="Model" value={newProduct.model} onChange={(e) => updateNewProduct("model", e.target.value)} />
          <input placeholder="Ürün Adı" value={newProduct.urun_adi} onChange={(e) => updateNewProduct("urun_adi", e.target.value)} />
          <input type="number" placeholder="Alış" value={newProduct.alis} onChange={(e) => updateNewProduct("alis", e.target.value)} />
          <input type="number" placeholder="Montaj" value={newProduct.montaj} onChange={(e) => updateNewProduct("montaj", e.target.value)} />
          <input type="number" placeholder="Puan" value={newProduct.puan} onChange={(e) => updateNewProduct("puan", e.target.value)} />
          <input type="number" placeholder="Fayda" value={newProduct.fayda} onChange={(e) => updateNewProduct("fayda", e.target.value)} />
          <input type="number" placeholder="Nakit Çarpanı" value={newProduct.nakit_carpani} onChange={(e) => updateNewProduct("nakit_carpani", e.target.value)} />
          <input type="number" placeholder="Kart Komisyon" value={newProduct.kart_komisyon} onChange={(e) => updateNewProduct("kart_komisyon", e.target.value)} />
          <input type="number" placeholder="Sıralama" value={newProduct.siralama} onChange={(e) => updateNewProduct("siralama", e.target.value)} />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={!!newProduct.aktif}
              onChange={(e) => updateNewProduct("aktif", e.target.checked)}
            />
            Aktif
          </label>
        </div>

        <button onClick={handleCreate} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </button>
      </section>

      {loading ? (
        <div className="state-box">Yükleniyor...</div>
      ) : (
        Object.entries(grouped).map(([kategori, items]) => (
          <section key={kategori} className="admin-category">
            <h2>{kategori}</h2>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ürün Bilgisi</th>
                    <th>Alış</th>
                    <th>Montaj</th>
                    <th>Puan</th>
                    <th>Fayda</th>
                    <th>Net Maliyet</th>
                    <th>Kar</th>
                    <th>Nakit</th>
                    <th>Kart</th>
                    <th>Aktif</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => {
                    const pricing = calculatePricing(product);

                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ minWidth: 180 }}>
                            <div><strong>{safeText(product.marka)}</strong></div>
                            <div>{safeText(product.model)}</div>
                          </div>
                        </td>

                        <td>
                          <input
                            type="number"
                            value={product.alis ?? 0}
                            onChange={(e) => updateRow(product.id, "alis", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.montaj ?? 0}
                            onChange={(e) => updateRow(product.id, "montaj", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.puan ?? 0}
                            onChange={(e) => updateRow(product.id, "puan", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.fayda ?? 0}
                            onChange={(e) => updateRow(product.id, "fayda", e.target.value)}
                          />
                        </td>

                        <td>{formatTL(pricing.netMaliyet)}</td>
                        <td>{formatTL(pricing.kar)}</td>
                        <td>{formatTL(pricing.nakit)}</td>
                        <td>{formatTL(pricing.kart)}</td>

                        <td>
                          <input
                            type="checkbox"
                            checked={!!product.aktif}
                            onChange={(e) => updateRow(product.id, "aktif", e.target.checked)}
                          />
                        </td>

                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleUpdate(product)} disabled={saving}>
                              Kaydet
                            </button>
                            <button onClick={() => handleDelete(product.id)} disabled={saving}>
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
