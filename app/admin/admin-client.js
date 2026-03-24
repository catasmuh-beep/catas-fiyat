"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_ORDER,
  BRAND_ORDER_BY_CATEGORY,
  sortProducts,
} from "../../lib/catalog";

cconst EMPTY_PRODUCT = {
  active: true,
  category: "",
  brand: "",
  model: "",
  submodel: "",
  purchase_price: "",
  installation_cost: "",
  score: "",
  benefit: "",
  net_price: 0,
  cash_price: 0,
  card_price: 0,
  cash_multiplier: 0,
  card_commission: 0,
};

export default function AdminClient() {
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Ürünler alınamadı");

      const rows = sortProducts(json.products || []);
      setProducts(rows);
      setDrafts(rows);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id, field, value) {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function updateNewProduct(field, value) {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  }

  async function addProduct() {
    try {
      setMessage("");

      if (!newProduct.category || !newProduct.brand || !newProduct.model) {
        setMessage("Kategori, marka ve model zorunludur.");
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ürün eklenemedi");

      setNewProduct(EMPTY_PRODUCT);
      await fetchProducts();
      setMessage("Yeni ürün eklendi.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveAllChanges() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: drafts }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Kaydetme başarısız");

      await fetchProducts();
      setMessage("Tüm değişiklikler kaydedildi.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredDrafts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return drafts;

    return drafts.filter((item) => {
      const text = `${item.category} ${item.brand} ${item.model}`.toLowerCase();
      return text.includes(q);
    });
  }, [drafts, search]);

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>;
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Yönetici Paneli</h1>
          <p>Ürün ekle, filtrele, düzenle ve tek tuşla kaydet.</p>
        </div>
        <div className="admin-actions-top">
          <a href="/" className="ghost-btn">Personel görünümüne dön</a>
          <a href="/admin/logout" className="ghost-btn">Çıkış</a>
        </div>
      </div>

      <section className="admin-card">
        <h2>Yeni Ürün Ekle</h2>

        <div className="admin-form-grid">
          <select
            value={newProduct.category}
            onChange={(e) => updateNewProduct("category", e.target.value)}
          >
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={newProduct.brand}
            onChange={(e) => updateNewProduct("brand", e.target.value)}
          >
            {(BRAND_ORDER_BY_CATEGORY[newProduct.category] || []).map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Model"
            value={newProduct.model}
            onChange={(e) => updateNewProduct("model", e.target.value)}
          />

          <input
            type="number"
            placeholder="Alış Fiyatı"
            value={newProduct.purchase_price}
            onChange={(e) => updateNewProduct("purchase_price", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Net Fiyat"
            value={newProduct.net_price}
            onChange={(e) => updateNewProduct("net_price", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Nakit Fiyat"
            value={newProduct.cash_price}
            onChange={(e) => updateNewProduct("cash_price", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Kart Fiyat"
            value={newProduct.card_price}
            onChange={(e) => updateNewProduct("card_price", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Montaj Maliyeti"
            value={newProduct.installation_cost}
            onChange={(e) => updateNewProduct("installation_cost", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Fayda"
            value={newProduct.benefit}
            onChange={(e) => updateNewProduct("benefit", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Puan"
            value={newProduct.score}
            onChange={(e) => updateNewProduct("score", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Nakit Çarpanı"
            value={newProduct.cash_multiplier}
            onChange={(e) => updateNewProduct("cash_multiplier", Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Kart Komisyonu"
            value={newProduct.card_commission}
            onChange={(e) => updateNewProduct("card_commission", Number(e.target.value))}
          />
        </div>

        <div className="admin-inline-actions">
          <label className="checkbox-wrap">
            <input
              type="checkbox"
              checked={newProduct.active}
              onChange={(e) => updateNewProduct("active", e.target.checked)}
            />
            Aktif
          </label>

          <button className="primary-btn" onClick={addProduct}>
            Yeni Ürün Ekle
          </button>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-list-top">
          <h2>Ürünleri Düzenle</h2>
          <input
            type="text"
            placeholder="Kategori / Marka / Model ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Aktif</th>
                <th>Kategori</th>
                <th>Marka</th>
                <th>Model</th>
                <th>Alış</th>
                <th>Net</th>
                <th>Nakit</th>
                <th>Kart</th>
                <th>Montaj</th>
                <th>Fayda</th>
                <th>Puan</th>
                <th>Nakit Çarpanı</th>
                <th>Kart Komisyonu</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrafts.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.active ?? true}
                      onChange={(e) => updateDraft(item.id, "active", e.target.checked)}
                    />
                  </td>

                  <td>
                    <select
                      value={item.category}
                      onChange={(e) => updateDraft(item.id, "category", e.target.value)}
                    >
                      {CATEGORY_ORDER.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={item.brand}
                      onChange={(e) => updateDraft(item.id, "brand", e.target.value)}
                    >
                      {(BRAND_ORDER_BY_CATEGORY[item.category] || []).map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="text"
                      value={item.model || ""}
                      onChange={(e) => updateDraft(item.id, "model", e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.purchase_price || 0}
                      onChange={(e) => updateDraft(item.id, "purchase_price", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.net_price || 0}
                      onChange={(e) => updateDraft(item.id, "net_price", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.cash_price || 0}
                      onChange={(e) => updateDraft(item.id, "cash_price", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.card_price || 0}
                      onChange={(e) => updateDraft(item.id, "card_price", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.installation_cost || 0}
                      onChange={(e) =>
                        updateDraft(item.id, "installation_cost", Number(e.target.value))
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.benefit || 0}
                      onChange={(e) => updateDraft(item.id, "benefit", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.score || 0}
                      onChange={(e) => updateDraft(item.id, "score", Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.cash_multiplier || 0}
                      onChange={(e) =>
                        updateDraft(item.id, "cash_multiplier", Number(e.target.value))
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.card_commission || 0}
                      onChange={(e) =>
                        updateDraft(item.id, "card_commission", Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sticky-save-bar">
          <button className="primary-btn save-all-btn" onClick={saveAllChanges} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>

        {message ? <div className="status-msg">{message}</div> : null}
      </section>
    </main>
  );
}
