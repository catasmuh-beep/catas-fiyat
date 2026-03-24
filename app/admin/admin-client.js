"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];

const BRAND_ORDER_BY_CATEGORY = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Şofben": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Elektrikli Kombi": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
};

function sortProducts(products = []) {
  return [...products].sort((a, b) => {
    const c1 = CATEGORY_ORDER.indexOf(a.category);
    const c2 = CATEGORY_ORDER.indexOf(b.category);
    const ci1 = c1 === -1 ? 999 : c1;
    const ci2 = c2 === -1 ? 999 : c2;

    if (ci1 !== ci2) return ci1 - ci2;

    const brands = BRAND_ORDER_BY_CATEGORY[a.category] || [];
    const b1 = brands.indexOf(a.brand);
    const b2 = brands.indexOf(b.brand);
    const bi1 = b1 === -1 ? 999 : b1;
    const bi2 = b2 === -1 ? 999 : b2;

    if (bi1 !== bi2) return bi1 - bi2;

    return (a.model || "").localeCompare(b.model || "", "tr");
  });
}

const EMPTY_PRODUCT = {
  active: true,
  category: "",
  brand: "",
  model: "",
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
      if (field === "category") updated.brand = "";
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
        body: JSON.stringify({
          products: drafts.map(prepareProductForSave),
        }),
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
      <div className="admin-actions-top">
        <button className="primary-btn" onClick={saveAllChanges} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
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
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={newProduct.brand}
            onChange={(e) => updateNewProduct("brand", e.target.value)}
            disabled={!newProduct.category}
          >
            <option value="">Marka</option>
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
