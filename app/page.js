"use client";

import { useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];
const BRAND_ORDER = ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"];

function num(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sortProducts(list) {
  return [...list].sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.kategori);
    const catB = CATEGORY_ORDER.indexOf(b.kategori);
    if (catA !== catB) return (catA === -1 ? 999 : catA) - (catB === -1 ? 999 : catB);

    const brandA = BRAND_ORDER.indexOf(a.marka);
    const brandB = BRAND_ORDER.indexOf(b.marka);
    if (brandA !== brandB) return (brandA === -1 ? 999 : brandA) - (brandB === -1 ? 999 : brandB);

    return `${a.model} ${a.alt_model_guc}`.localeCompare(`${b.model} ${b.alt_model_guc}`, "tr");
  });
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [kategori, setKategori] = useState("");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(sortProducts(data.filter((x) => x.aktif)));
      }
    }

    load();

    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.kategori).filter(Boolean))];
  }, [products]);

  const brands = useMemo(() => {
    return [...new Set(
      products
        .filter((p) => !kategori || p.kategori === kategori)
        .map((p) => p.marka)
        .filter(Boolean)
    )];
  }, [products, kategori]);

  const models = useMemo(() => {
    return [...new Set(
      products
        .filter((p) => (!kategori || p.kategori === kategori) && (!marka || p.marka === marka))
        .map((p) => p.model)
        .filter(Boolean)
    )];
  }, [products, kategori, marka]);

  const filtered = useMemo(() => {
    return sortProducts(
      products.filter((p) => {
        const okKategori = !kategori || p.kategori === kategori;
        const okMarka = !marka || p.marka === marka;
        const okModel = !model || p.model === model;
        const q = search.trim().toLocaleLowerCase("tr");
        const fullText = `${p.marka} ${p.model} ${p.alt_model_guc} ${p.kategori}`.toLocaleLowerCase("tr");
        const okSearch = !q || fullText.includes(q);
        return okKategori && okMarka && okModel && okSearch;
      })
    );
  }, [products, kategori, marka, model, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p.kategori]) map[p.kategori] = {};
      if (!map[p.kategori][p.marka]) map[p.kategori][p.marka] = [];
      map[p.kategori][p.marka].push(p);
    }
    return map;
  }, [filtered]);

  return (
    <main className="personel-page">
      <div className="top-stats">
        <span>Toplam ürün: {filtered.length}</span>
        <span>Kategori: {categories.length}</span>
        <span>Marka: {brands.length}</span>
      </div>

      <div className="filters">
        <select
          value={kategori}
          onChange={(e) => {
            setKategori(e.target.value);
            setMarka("");
            setModel("");
          }}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>

        <select
          value={marka}
          onChange={(e) => {
            setMarka(e.target.value);
            setModel("");
          }}
        >
          <option value="">Tüm markalar</option>
          {brands.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Tüm modeller</option>
          {models.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ara: model / güç / marka"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {Object.entries(grouped).map(([catName, brandsMap]) => (
        <section key={catName} className="category-section">
          <h1>{catName}</h1>

          {Object.entries(brandsMap).map(([brandName, items]) => (
            <div key={brandName}>
              <h2>{brandName}</h2>

              <div className="cards">
                {items.map((p) => (
                  <article key={p.id} className="product-card">
                    <div className="brand-pill">{p.marka}</div>

                    <h3>
                      {p.model} {p.alt_model_guc}
                    </h3>

                    <div className="mini-grid">
                      <div className="mini-box">
                        <span>Nakit</span>
                        <strong>₺{num(p.nakit).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Kart</span>
                        <strong>₺{num(p.kart).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Net</span>
                        <strong>₺{num(p.net_bedel).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Kar</span>
                        <strong>₺{num(p.kar).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Kampanya</span>
                        <strong>₺{num(p.kampanya).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Net Bedel</span>
                        <strong>₺{num(p.net_bedel).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Nakit Çarpanı</span>
                        <strong>%{num(p.nakit_carpani).toLocaleString("tr-TR")}</strong>
                      </div>
                      <div className="mini-box">
                        <span>Kart Komisyon</span>
                        <strong>%{num(p.kart_komisyon).toLocaleString("tr-TR")}</strong>
                      </div>
                    </div>

                    <div className="detail-grid">
                      <div>
                        <label>Alış</label>
                        <input value={num(p.alis_fiyati)} readOnly />
                      </div>
                      <div>
                        <label>Montaj</label>
                        <input value={num(p.montaj_maliyeti)} readOnly />
                      </div>
                      <div>
                        <label>Puan</label>
                        <input value={num(p.puan)} readOnly />
                      </div>
                      <div>
                        <label>Fayda</label>
                        <input value={num(p.fayda)} readOnly />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
