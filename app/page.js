"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];

const BRAND_ORDER_BY_CATEGORY = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Şofben": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Elektrikli Kombi": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
};

const BRAND_COLORS = {
  Vaillant: "#0a8f6a",
  "Demirdöküm": "#005baa",
  Baymak: "#00a651",
  ECA: "#005baa",
  Protherm: "#d71920",
  Baykan: "#f2c200",
  Warmhaus: "#e30613",
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

function formatCurrency(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

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

      setProducts(sortProducts(json.products || []));
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active !== false);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      const categoryOk = !categoryFilter || p.category === categoryFilter;
      const brandOk = !brandFilter || p.brand === brandFilter;
      const modelOk =
        !modelFilter ||
        `${p.brand} ${p.model}`.toLowerCase().includes(modelFilter.toLowerCase()) ||
        (p.model || "").toLowerCase().includes(modelFilter.toLowerCase());

      return categoryOk && brandOk && modelOk;
    });
  }, [activeProducts, categoryFilter, brandFilter, modelFilter]);

  const stats = useMemo(() => {
    const categories = new Set(filteredProducts.map((p) => p.category).filter(Boolean));
    const brands = new Set(filteredProducts.map((p) => p.brand).filter(Boolean));
    return {
      productCount: filteredProducts.length,
      categoryCount: categories.size,
      brandCount: brands.size,
    };
  }, [filteredProducts]);

  const grouped = useMemo(() => {
    const map = {};

    for (const category of CATEGORY_ORDER) {
      const itemsInCategory = filteredProducts.filter((p) => p.category === category);
      if (!itemsInCategory.length) continue;

      map[category] = {};

      const brandOrder = BRAND_ORDER_BY_CATEGORY[category] || [];

      for (const brand of brandOrder) {
        const brandItems = itemsInCategory
          .filter((p) => p.brand === brand)
          .sort((a, b) => (a.model || "").localeCompare(b.model || "", "tr"));

        if (brandItems.length) {
          map[category][brand] = brandItems;
        }
      }

      const remainingBrands = [...new Set(itemsInCategory.map((p) => p.brand))]
        .filter((brand) => !brandOrder.includes(brand))
        .sort((a, b) => a.localeCompare(b, "tr"));

      for (const brand of remainingBrands) {
        const brandItems = itemsInCategory
          .filter((p) => p.brand === brand)
          .sort((a, b) => (a.model || "").localeCompare(b.model || "", "tr"));

        if (brandItems.length) {
          map[category][brand] = brandItems;
        }
      }
    }

    return map;
  }, [filteredProducts]);

  const allBrands = useMemo(() => {
    return [...new Set(activeProducts.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr")
    );
  }, [activeProducts]);

  if (loading) {
    return (
      <main className="page-wrap">
        <div className="topbar">
          <h1>Personel görünümü</h1>
          <a href="/admin" className="admin-link">Yönetici Girişi</a>
        </div>
        <div className="loading-box">Yükleniyor...</div>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <div className="topbar">
        <h1>Personel görünümü</h1>
        <a href="/admin" className="admin-link">Yönetici Girişi</a>
      </div>

      <div className="stats-row">
        <span>Toplam ürün: {stats.productCount}</span>
        <span>Kategori: {stats.categoryCount}</span>
        <span>Marka: {stats.brandCount}</span>
      </div>

      <div className="filters">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Tüm kategoriler</option>
          {CATEGORY_ORDER.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">Tüm markalar</option>
          {allBrands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ara: model / güç / marka"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
        />
      </div>

      {stats.productCount === 0 ? (
        <div className="empty-box">Gösterilecek ürün bulunamadı.</div>
      ) : (
        CATEGORY_ORDER.map((category) => {
          const brands = grouped[category];
          if (!brands) return null;

          return (
            <section key={category} className="category-section">
              <h2 className="category-title">{category}</h2>

              {Object.entries(brands).map(([brand, items]) => (
                <div key={`${category}-${brand}`} className="brand-section">
                  <h3
                    className="brand-title"
                    style={{ color: BRAND_COLORS[brand] || "#00917e" }}
                  >
                    {brand}
                  </h3>

                  <div className="product-grid">
                    {items.map((item) => (
                      <article key={item.id} className="product-card">
                        <div className="product-head">
                          <div className="product-brand">{item.brand}</div>
                          <div className="product-model">{item.model}</div>
                        </div>

                        <div className="price-row">
                          <span>Nakit</span>
                          <strong>{formatCurrency(item.cash_price)}</strong>
                        </div>

                        <div className="price-row">
                          <span>Kart</span>
                          <strong>{formatCurrency(item.card_price)}</strong>
                        </div>

                        <div className="price-row">
                          <span>Net</span>
                          <strong>{formatCurrency(item.net_price)}</strong>
                        </div>

                        <div className="meta-row positive">
                          <span>Kar</span>
                          <strong>{formatCurrency(item.benefit)}</strong>
                        </div>

                        <div className="meta-row">
                          <span>Alış</span>
                          <strong>{formatCurrency(item.purchase_price)}</strong>
                        </div>

                        <div className="meta-row negative">
                          <span>Montaj</span>
                          <strong>{formatCurrency(item.installation_cost)}</strong>
                        </div>

                        <div className="meta-row positive">
                          <span>Puan</span>
                          <strong>{item.score || 0}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}
    </main>
  );
}
