"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "/api/products";

const CATEGORY_ORDER = [
  "vaillant kombi",
  "demirdöküm kombi",
  "protherm kombi",
  "warmhaus kombi",
  "vaillant klima",
  "demirdöküm klima",
  "ticari ürünler",
  "aksesuar",
];

const VAILLANT_CLIMATE_ORDER = [
  "climavair pure 9000",
  "climavair pure 12000",
  "climavair pure 18000",
  "climavair pure 24000",
  "climavair pro 9000",
  "climavair pro 12000",
  "climavair pro 18000",
  "climavair pro 24000",
];

function normalizeText(value = "") {
  return String(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("tr-TR");
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `%${value.toFixed(1).replace(".", ",")}`;
}

function getPercentDiff(base, target) {
  const baseNum = Number(base || 0);
  const targetNum = Number(target || 0);
  if (!baseNum || !targetNum) return null;
  return ((targetNum - baseNum) / baseNum) * 100;
}

function getField(product, keys, fallback = "") {
  for (const key of keys) {
    if (product?.[key] !== undefined && product?.[key] !== null) {
      return product[key];
    }
  }
  return fallback;
}

function getId(product) {
  return getField(product, ["id", "uuid"], "");
}

function getCategory(product) {
  return getField(product, ["category", "kategori"], "");
}

function getBrand(product) {
  return getField(product, ["brand", "marka"], "");
}

function getModel(product) {
  return getField(product, ["model", "urun_adi", "name", "urun"], "");
}

function getPurchasePrice(product) {
  return getField(product, ["purchase_price", "alis_fiyati"], "");
}

function getCashPrice(product) {
  return getField(product, ["cash_price", "nakit_fiyat"], "");
}

function getCardPrice(product) {
  return getField(product, ["card_price", "kart_fiyat"], "");
}

function getInstallCost(product) {
  return getField(product, ["installation_cost", "montaj"], "");
}

function getPointValue(product) {
  return getField(product, ["points", "puan"], "");
}

function getBenefitValue(product) {
  return getField(product, ["benefit", "fayda"], "");
}

function getCategoryOrderIndex(category) {
  const normalized = normalizeText(category);
  const idx = CATEGORY_ORDER.findIndex((item) => item === normalized);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function getVaillantClimateIndex(product) {
  const brand = normalizeText(getBrand(product));
  const category = normalizeText(getCategory(product));
  const model = normalizeText(getModel(product));

  if (brand !== "vaillant") return Number.MAX_SAFE_INTEGER;
  if (!category.includes("klima")) return Number.MAX_SAFE_INTEGER;

  const idx = VAILLANT_CLIMATE_ORDER.findIndex((item) => model.includes(item));
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function sortProductsForStaff(list) {
  return [...list].sort((a, b) => {
    const aCategory = normalizeText(getCategory(a));
    const bCategory = normalizeText(getCategory(b));
    const aBrand = normalizeText(getBrand(a));
    const bBrand = normalizeText(getBrand(b));
    const aModel = getModel(a);
    const bModel = getModel(b);

    const categoryCompare =
      getCategoryOrderIndex(aCategory) - getCategoryOrderIndex(bCategory);
    if (categoryCompare !== 0) return categoryCompare;

    if (
      aBrand === "vaillant" &&
      bBrand === "vaillant" &&
      aCategory.includes("klima") &&
      bCategory.includes("klima")
    ) {
      const aIdx = getVaillantClimateIndex(a);
      const bIdx = getVaillantClimateIndex(b);
      if (aIdx !== bIdx) return aIdx - bIdx;
    }

    const brandCompare = aBrand.localeCompare(bBrand, "tr");
    if (brandCompare !== 0) return brandCompare;

    return String(aModel).localeCompare(String(bModel), "tr");
  });
}

function toEditableProduct(product) {
  return {
    id: getId(product),
    category: getCategory(product),
    brand: getBrand(product),
    model: getModel(product),
    purchase_price: getPurchasePrice(product),
    cash_price: getCashPrice(product),
    card_price: getCardPrice(product),
    installation_cost: getInstallCost(product),
    points: getPointValue(product),
    benefit: getBenefitValue(product),
    original: product,
  };
}

export default function AdminClient() {
  const [products, setProducts] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isAdminView, setIsAdminView] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Ürünler alınamadı.");
        }

        const data = await res.json();
        const rawProducts = Array.isArray(data) ? data : data?.products || [];

        if (!active) return;
        setProducts(rawProducts.map(toEditableProduct));
      } catch (err) {
        if (!active) return;
        setError(err.message || "Veri yüklenirken hata oluştu.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))].sort(
      (a, b) => getCategoryOrderIndex(a) - getCategoryOrderIndex(b)
    );
  }, [products]);

  const brands = useMemo(() => {
    const base = products.filter((p) => {
      if (!selectedCategory) return true;
      return p.category === selectedCategory;
    });

    return [...new Set(base.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "tr")
    );
  }, [products, selectedCategory]);

  const models = useMemo(() => {
    const base = products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      return true;
    });

    return [...new Set(base.map((p) => p.model).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "tr")
    );
  }, [products, selectedCategory, selectedBrand]);

  const filteredProducts = useMemo(() => {
    const term = normalizeText(searchTerm);

    const list = products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (selectedModel && p.model !== selectedModel) return false;

      if (term) {
        const haystack = normalizeText(
          `${p.category} ${p.brand} ${p.model} ${p.purchase_price} ${p.cash_price} ${p.card_price}`
        );
        if (!haystack.includes(term)) return false;
      }

      return true;
    });

    return isAdminView ? list : sortProductsForStaff(list);
  }, [products, selectedCategory, selectedBrand, selectedModel, searchTerm, isAdminView]);

  const changedCount = useMemo(() => Object.keys(editedRows).length, [editedRows]);

  function updateRow(id, field, value) {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    setEditedRows((prev) => {
      const baseItem = products.find((item) => item.id === id);
      return {
        ...prev,
        [id]: {
          ...(prev[id] || baseItem || {}),
          [field]: value,
        },
      };
    });
  }

  async function saveAllChanges() {
    if (changedCount === 0) {
      setMessage("Kaydedilecek değişiklik yok.");
      setError("");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = Object.values(editedRows).map((item) => ({
        id: item.id,
        category: item.category,
        brand: item.brand,
        model: item.model,
        purchase_price: Number(item.purchase_price || 0),
        cash_price: Number(item.cash_price || 0),
        card_price: Number(item.card_price || 0),
        installation_cost: Number(item.installation_cost || 0),
        points: Number(item.points || 0),
        benefit: Number(item.benefit || 0),
      }));

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });

      if (!res.ok) {
        throw new Error("Değişiklikler kaydedilemedi.");
      }

      setEditedRows({});
      setMessage("Tüm değişiklikler kaydedildi.");
    } catch (err) {
      setError(err.message || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  function resetFilters() {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedModel("");
    setSearchTerm("");
  }

  return (
    <div className="admin-page-shell">
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Yönetici Paneli</h1>
          <p className="admin-page-subtitle">
            Ürünleri filtrele, personel görünümünü kontrol et ve fiyatları düzenle.
          </p>
        </div>

        <div className="admin-topbar-actions">
          <button
            type="button"
            className={`topbar-btn ${isAdminView ? "topbar-btn-muted" : ""}`}
            onClick={() => setIsAdminView(false)}
          >
            Personel görünümüne dön
          </button>

          <button
            type="button"
            className={`topbar-btn ${!isAdminView ? "topbar-btn-muted" : ""}`}
            onClick={() => setIsAdminView(true)}
          >
            Yönetici görünümü
          </button>
        </div>
      </div>

      <div className="staff-filters">
        <div className="staff-filter-item">
          <label>Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedBrand("");
              setSelectedModel("");
            }}
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="staff-filter-item">
          <label>Marka</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
          >
            <option value="">Tüm markalar</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="staff-filter-item">
          <label>Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="">Tüm modeller</option>
            {models.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="staff-filter-item">
          <label>Ara</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ürün ara..."
          />
        </div>
      </div>

      <div className="admin-summary-row">
        <div className="summary-pill">Toplam ürün: {filteredProducts.length}</div>
        <div className="summary-pill">Değişen satır: {changedCount}</div>
        <button type="button" className="summary-reset-btn" onClick={resetFilters}>
          Filtreleri temizle
        </button>
      </div>

      {message ? <div className="panel-message success">{message}</div> : null}
      {error ? <div className="panel-message error">{error}</div> : null}

      {loading ? (
        <div className="panel-loading">Yükleniyor...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="panel-empty">Eşleşen ürün bulunamadı.</div>
      ) : isAdminView ? (
        <div className="admin-list">
          {filteredProducts.map((item) => {
            const cashMargin = getPercentDiff(item.purchase_price, item.cash_price);
            const cardDiff = getPercentDiff(item.cash_price, item.card_price);

            return (
              <div key={item.id} className="admin-product-card">
                <div className="admin-product-head">
                  <div>
                    <div className="admin-product-brand">{item.brand}</div>
                    <div className="admin-product-model">{item.model}</div>
                  </div>
                  <div className="admin-product-category">{item.category}</div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-field admin-field-highlight">
                    <label>
                      ALIŞ FİYATI <span className="field-badge">EN SIK DEĞİŞEN</span>
                    </label>
                    <input
                      type="number"
                      value={item.purchase_price}
                      onChange={(e) =>
                        updateRow(item.id, "purchase_price", e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-field">
                    <label>Nakit Satış</label>
                    <input
                      type="number"
                      value={item.cash_price}
                      onChange={(e) => updateRow(item.id, "cash_price", e.target.value)}
                    />
                    <small className="calc-note">
                      Alış → Nakit: {formatPercent(cashMargin)}
                    </small>
                  </div>

                  <div className="admin-field">
                    <label>Kart Satış</label>
                    <input
                      type="number"
                      value={item.card_price}
                      onChange={(e) => updateRow(item.id, "card_price", e.target.value)}
                    />
                    <small className="calc-note">
                      Nakit → Kart: {formatPercent(cardDiff)}
                    </small>
                  </div>

                  <div className="admin-field admin-field-montaj">
                    <label>Montaj</label>
                    <input
                      type="number"
                      value={item.installation_cost}
                      onChange={(e) =>
                        updateRow(item.id, "installation_cost", e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-field admin-field-puan">
                    <label>Puan</label>
                    <input
                      type="number"
                      value={item.points}
                      onChange={(e) => updateRow(item.id, "points", e.target.value)}
                    />
                  </div>

                  <div className="admin-field admin-field-fayda">
                    <label>Fayda</label>
                    <input
                      type="number"
                      value={item.benefit}
                      onChange={(e) => updateRow(item.id, "benefit", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="staff-list-view">
          {filteredProducts.map((item) => (
            <div key={item.id} className="staff-list-row">
              <div className="staff-list-main">
                <div className="staff-card-category">{item.category}</div>
                <div className="staff-card-brand">{item.brand}</div>
                <div className="staff-card-model">{item.model}</div>
              </div>

              <div className="staff-list-prices">
                <div className="staff-price-row">
                  <span>Alış</span>
                  <strong>{formatCurrency(item.purchase_price)} ₺</strong>
                </div>
                <div className="staff-price-row">
                  <span>Nakit</span>
                  <strong>{formatCurrency(item.cash_price)} ₺</strong>
                </div>
                <div className="staff-price-row">
                  <span>Kart</span>
                  <strong>{formatCurrency(item.card_price)} ₺</strong>
                </div>
              </div>

              <div className="staff-benefit-strip">
                <span className="pill red">Montaj: {formatCurrency(item.installation_cost)}</span>
                <span className="pill blue">Puan: {formatCurrency(item.points)}</span>
                <span className="pill green">Fayda: {formatCurrency(item.benefit)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdminView ? (
        <div className="admin-sticky-save">
          <button
            type="button"
            className="admin-save-btn"
            onClick={saveAllChanges}
            disabled={saving}
          >
            {saving ? "Kaydediliyor..." : `Değişiklikleri Kaydet (${changedCount})`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
