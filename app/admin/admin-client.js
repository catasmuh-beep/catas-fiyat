"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_ORDER,
  BRAND_ORDER_BY_CATEGORY,
  sortProducts,
} from "../lib/catalog";

const EMPTY_PRODUCT = {
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

      if (!res.ok) {
        throw new Error(json.error || "Ürünler alınamadı");
      }

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

  function prepareProductForSave(item) {
    const purchasePrice = Number(item.purchase_price || 0);
    const installationCost = Number(item.installation_cost || 0);
    const benefit = Number(item.benefit || 0);
    const score = Number(item.score || 0);
    const cashMultiplier = Number(item.cash_multiplier || 0);
    const cardCommission = Number(item.card_commission || 0);

    const netPrice = purchasePrice + installationCost;
    const cashPrice =
      cashMultiplier > 0
        ? Math.round(netPrice * (1 + cashMultiplier / 100))
        : netPrice + benefit;

    const cardPrice =
      cardCommission > 0
        ? Math.round(cashPrice * (1 + cardCommission / 100))
        : cashPrice;

    return {
      ...item,
      active: item.active ?? true,
      category: item.category || "",
      brand: item.brand || "",
      model: item.model || "",
      purchase_price: purchasePrice,
      installation_cost: installationCost,
      score,
      benefit,
      cash_multiplier: cashMultiplier,
      card_commission: cardCommission,
      net_price: netPrice,
      cash_price: cashPrice,
      card_price: cardPrice,
    };
  }

  function updateDraft(id, field, value) {
    setDrafts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function updateNewProduct(field, value) {
    setNewProduct((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "category") {
        updated.brand = "";
      }

      return updated;
    });
  }

  async function addProduct() {
    try {
      setMessage("");

      if (!newProduct.category || !newProduct.brand || !newProduct.model) {
        setMessage("Kategori, marka ve model zorunludur.");
        return;
      }

      const payload = prepareProductForSave(newProduct);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Ürün eklenemedi");
      }

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
        body: JSON.stringify({
          products: drafts.map(prepareProductForSave),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Kaydetme başarısız");
      }

      await fetchProducts();
      setMessage("Tüm değişiklikler kaydedildi.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    setDrafts(products);
    setMessage("Değişiklikler geri alındı.");
  }

  async function deleteProduct(id) {
    const ok = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      setMessage("");

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Ürün silinemedi");
      }

      await fetchProducts();
      setMessage("Ürün silindi.");
    } catch (error) {
      setMessage(error.message);
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
      <div className="admin-actions-top">
        <button
          className="primary-btn"
          onClick={saveAllChanges}
          disabled={saving}
        >
          {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
        </button>

        <button className="ghost-btn" onClick={resetChanges}>
          Değişiklikleri Geri Al
        </button>

        <a href="/" className="ghost-btn">
          Personel görünümüne dön
        </a>

        <a href="/admin/logout" className="ghost-btn">
          Çıkış
        </a>
      </div>

      <section className="admin-card">
        <h2>Yeni ürün ekle</h2>

        <div className="admin-form-grid">
          <select
            value={newProduct.category}
            onChange={(e) => updateNewProduct("category", e.target.value)}
          >
            <option value="">Kategori</option>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={newProduct.brand}
            onChange={(e) => updateNewProduct("brand", e.target.value)}
            disabled={!newProduct.category}
          >
            <option value="">Marka</option>
            {(BRAND_ORDER_BY_CATEGORY[newProduct.category] || []).map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Model"
            value={newProduct.model}
            onChange={(e) => updateNewProduct("model", e.target.value)}
          />

          <input
            type="text"
            placeholder="Alt model / güç"
            value={newProduct.submodel || ""}
            onChange={(e) => updateNewProduct("submodel", e.target.value)}
          />

          <input
            type="number"
            placeholder="Alış Fiyatı"
            value={newProduct.purchase_price}
            onChange={(e) => updateNewProduct("purchase_price", e.target.value)}
          />

          <input
            type="number"
            placeholder="Montaj Maliyeti"
            value={newProduct.installation_cost}
            onChange={(e) => updateNewProduct("installation_cost", e.target.value)}
          />

          <input
            type="number"
            placeholder="Puan"
            value={newProduct.score}
            onChange={(e) => updateNewProduct("score", e.target.value)}
          />

          <input
            type="number"
            placeholder="Fayda / Kar"
            value={newProduct.benefit}
            onChange={(e) => updateNewProduct("benefit", e.target.value)}
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
            className="search-input"
            placeholder="Kategori / Marka / Model ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ürün Bilgisi</th>
                <th>Alış</th>
                <th>Montaj Maliyeti</th>
                <th>Puan</th>
                <th>Fayda</th>
                <th>Net Maliyet</th>
                <th>Kar</th>
                <th>Nakit</th>
                <th>Kart</th>
                <th>Aktif</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrafts.map((item) => {
                const preview = prepareProductForSave(item);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.brand}</strong> {item.model}
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.purchase_price ?? ""}
                        onChange={(e) =>
                          updateDraft(item.id, "purchase_price", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.installation_cost ?? ""}
                        onChange={(e) =>
                          updateDraft(item.id, "installation_cost", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.score ?? ""}
                        onChange={(e) =>
                          updateDraft(item.id, "score", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.benefit ?? ""}
                        onChange={(e) =>
                          updateDraft(item.id, "benefit", e.target.value)
                        }
                      />
                    </td>

                    <td>₺{preview.net_price.toLocaleString("tr-TR")}</td>
                    <td>₺{Number(preview.benefit || 0).toLocaleString("tr-TR")}</td>
                    <td>₺{preview.cash_price.toLocaleString("tr-TR")}</td>
                    <td>₺{preview.card_price.toLocaleString("tr-TR")}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={item.active ?? true}
                        onChange={(e) =>
                          updateDraft(item.id, "active", e.target.checked)
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="ghost-btn"
                        onClick={() => deleteProduct(item.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {message ? <div className="status-msg">{message}</div> : null}
      </section>
    </main>
  );
}
