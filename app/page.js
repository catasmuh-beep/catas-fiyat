"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatePricing, formatTL } from "./lib/pricing";

function safeText(value) {
  return String(value ?? "").trim();
}

function brandColor(brand) {
  const b = safeText(brand).toLowerCase();

  if (b.includes("vaillant")) return "#009c95";
  if (b.includes("demirdöküm") || b.includes("demirdokum")) return "#005bbb";
  if (b.includes("protherm")) return "#cf102d";
  if (b.includes("warmhaus")) return "#f28c00";
  if (b.includes("baymak")) return "#00a651";
  if (b.includes("eca")) return "#005bbb";
  if (b.includes("baykan")) return "#d4aa00";

  return "#1f3b64";
}

async function safeReadJson(res) {
  const text = await res.text();
  if (!text) throw new Error("API boş cevap döndü.");

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("API geçerli JSON döndürmedi.");
  }
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products", { cache: "no-store" });
        const json = await safeReadJson(res);

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Ürünler alınamadı.");
        }

        if (active) {
          setProducts(Array.isArray(json.products) ? json.products : []);
        }
      } catch (err) {
        if (active) {
          setProducts([]);
          setError(err?.message || "Bir hata oluştu.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p?.aktif !== false);
  }, [products]);

  const categories = useMemo(() => {
    return [...new Set(activeProducts.map((p) => safeText(p?.kategori)).filter(Boolean))];
  }, [activeProducts]);

  const brands = useMemo(() => {
    const filtered = category
      ? activeProducts.filter((p) => safeText(p?.kategori) === category)
      : activeProducts;

    return [...new Set(filtered.map((p) => safeText(p?.marka)).filter(Boolean))];
  }, [activeProducts, category]);

  const models = useMemo(() => {
    const filtered = activeProducts.filter((p) => {
      const kategoriOk = category ? safeText(p?.kategori) === category : true;
      const markaOk = brand ? safeText(p?.marka) === brand : true;
      return kategoriOk && markaOk;
    });

    return [...new Set(filtered.map((p) => safeText(p?.model)).filter(Boolean))];
  }, [activeProducts, category, brand]);

  const filteredProducts = useMemo(() => {
    const q = safeText(search).toLowerCase();

    return activeProducts.filter((p) => {
      const kategoriOk = category ? safeText(p?.kategori) === category : true;
      const markaOk = brand ? safeText(p?.marka) === brand : true;
      const modelOk = model ? safeText(p?.model) === model : true;

      const text = [
        safeText(p?.kategori),
        safeText(p?.marka),
        safeText(p?.model),
        safeText(p?.urun_adi),
      ].join(" ").toLowerCase();

      const searchOk = q ? text.includes(q) : true;

      return kategoriOk && markaOk && modelOk && searchOk;
    });
  }, [activeProducts, category, brand, model, search]);

  const grouped = useMemo(() => {
    const result = {};

    for (const product of filteredProducts) {
      const kategori = safeText(product?.kategori) || "Diğer";
      const marka = safeText(product?.marka) || "Diğer";

      if (!result[kategori]) result[kategori] = {};
      if (!result[kategori][marka]) result[kategori][marka] = [];
      result[kategori][marka].push(product);
    }

    return result;
  }, [filteredProducts]);

  const brandCount = useMemo(() => {
    return new Set(activeProducts.map((p) => safeText(p?.marka)).filter(Boolean)).size;
  }, [activeProducts]);

  return (
    <main className="page-shell">
      <div className="topbar">
        <button className="switch-btn" type="button">
          Personel görünümü
        </button>
        <a href="/admin" className="admin-btn">
          Yönetici Girişi
        </a>
      </div>

      <div className="logo-area">
        <img src="/logo.png" alt="Çataş Mühendislik" className="main-logo" />

        <div className="stats">
          <span>Toplam ürün: {activeProducts.length}</span>
          <span>Kategori: {categories.length}</span>
          <span>Marka: {brandCount}</span>
        </div>
      </div>

      <div className="filters">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setBrand("");
            setModel("");
          }}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("");
          }}
        >
          <option value="">Tüm markalar</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Tüm modeller</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ara: model / güç / marka"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="state-box">Yükleniyor...</div>}
      {!loading && error && <div className="state-box error">{error}</div>}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="state-box">Ürün bulunamadı.</div>
      )}

      {!loading &&
        !error &&
        Object.entries(grouped).map(([kategori, brandsObj]) => (
          <section key={kategori} className="category-section">
            <h1 className="category-title">{kategori}</h1>

            {Object.entries(brandsObj).map(([marka, items]) => (
              <div key={marka} className="brand-section">
                <h2 className="brand-title" style={{ color: brandColor(marka) }}>
                  {marka}
                </h2>

                <div className="cards">
                  {items.map((product) => {
                    const pricing = calculatePricing(product);

                    return (
                      <article key={product.id} className="product-card">
                        <div className="brand-badge">{safeText(product?.marka)}</div>

                        <h3 className="product-title">
                          {safeText(product?.model) || safeText(product?.urun_adi)}
                        </h3>

                        <div className="price-grid">
                          <div className="price-box">
                            <span className="label orange">Nakit</span>
                            <strong>{formatTL(pricing.nakit)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label blue">Kart</span>
                            <strong>{formatTL(pricing.kart)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label gray">Net</span>
                            <strong>{formatTL(pricing.netMaliyet)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label green">Kar</span>
                            <strong>{formatTL(pricing.kar)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label">Kampanya</span>
                            <strong>{formatTL(pricing.kampanya)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label">Net Bedel</span>
                            <strong>{formatTL(pricing.netMaliyet)}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label">Nakit Çarpanı</span>
                            <strong>%{pricing.nakitCarpani}</strong>
                          </div>
                          <div className="price-box">
                            <span className="label">Kart Komisyon</span>
                            <strong>%{pricing.kartKomisyon}</strong>
                          </div>
                        </div>

                        <div className="detail-grid">
                          <div>
                            <label>Alış</label>
                            <input readOnly value={pricing.alis} />
                          </div>
                          <div>
                            <label className="label-red">Montaj</label>
                            <input readOnly value={pricing.montaj} />
                          </div>
                          <div>
                            <label className="label-teal">Puan</label>
                            <input readOnly value={pricing.puan} />
                          </div>
                          <div>
                            <label className="label-teal">Fayda</label>
                            <input readOnly value={pricing.fayda} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
    </main>
  );
}
