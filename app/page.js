"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];
const BRAND_ORDER = ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"];

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sortProducts(list) {
  return [...list].sort((a, b) => {
    const aCat = CATEGORY_ORDER.indexOf(a.kategori);
    const bCat = CATEGORY_ORDER.indexOf(b.kategori);
    if (aCat !== bCat) return (aCat === -1 ? 999 : aCat) - (bCat === -1 ? 999 : bCat);

    const aBrand = BRAND_ORDER.indexOf(a.marka);
    const bBrand = BRAND_ORDER.indexOf(b.marka);
    if (aBrand !== bBrand) return (aBrand === -1 ? 999 : aBrand) - (bBrand === -1 ? 999 : bBrand);

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
    let active = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const data = await res.json();

        if (active && Array.isArray(data)) {
          setProducts(sortProducts(data));
        }
      } catch (error) {
        console.error("Ürünler alınamadı:", error);
      }
    }

    loadProducts();
    const timer = setInterval(loadProducts, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const kategoriOptions = useMemo(
    () => [...new Set(products.map((x) => x.kategori).filter(Boolean))],
    [products]
  );

  const markaOptions = useMemo(() => {
    return [
      ...new Set(
        products
          .filter((x) => !kategori || x.kategori === kategori)
          .map((x) => x.marka)
          .filter(Boolean)
      ),
    ];
  }, [products, kategori]);

  const modelOptions = useMemo(() => {
    return [
      ...new Set(
        products
          .filter((x) => (!kategori || x.kategori === kategori) && (!marka || x.marka === marka))
          .map((x) => x.model)
          .filter(Boolean)
      ),
    ];
  }, [products, kategori, marka]);

  const filteredProducts = useMemo(() => {
    return sortProducts(
      products.filter((item) => {
        const okKategori = !kategori || item.kategori === kategori;
        const okMarka = !marka || item.marka === marka;
        const okModel = !model || item.model === model;

        const q = search.trim().toLocaleLowerCase("tr");
        const haystack =
          `${item.kategori} ${item.marka} ${item.model} ${item.alt_model_guc}`.toLocaleLowerCase("tr");
        const okSearch = !q || haystack.includes(q);

        return okKategori && okMarka && okModel && okSearch;
      })
    );
  }, [products, kategori, marka, model, search]);

  const grouped = useMemo(() => {
    const result = {};
    for (const item of filteredProducts) {
      if (!result[item.kategori]) result[item.kategori] = {};
      if (!result[item.kategori][item.marka]) result[item.kategori][item.marka] = [];
      result[item.kategori][item.marka].push(item);
    }
    return result;
  }, [filteredProducts]);

  return (
    <main>
      <div className="stats-row">
        <span>Toplam ürün: {filteredProducts.length}</span>
        <span>Kategori: {kategoriOptions.length}</span>
        <span>Marka: {markaOptions.length}</span>
      </div>

      <div className="filters-row">
        <select
          value={kategori}
          onChange={(e) => {
            setKategori(e.target.value);
            setMarka("");
            setModel("");
          }}
        >
          <option value="">Tüm kategoriler</option>
          {kategoriOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
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
          {markaOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Tüm modeller</option>
          {modelOptions.map((item) => (
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

      {Object.entries(grouped).map(([kategoriName, brands]) => (
        <section key={kategoriName}>
          <h1>{kategoriName}</h1>

          {Object.entries(brands).map(([brandName, items]) => (
            <div key={brandName}>
              <h2>{brandName}</h2>

              {items.map((item) => (
                <article key={item.id} className="product-card">
                  <div className="brand-pill">{item.marka}</div>

                  <h3>
                    {item.model} {item.alt_model_guc}
                  </h3>

                  <div className="mini-grid">
                    <div className="mini-box">
                      <span>Nakit</span>
                      <strong>₺{toNumber(item.nakit).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Kart</span>
                      <strong>₺{toNumber(item.kart).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Net</span>
                      <strong>₺{toNumber(item.net_bedel).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Kar</span>
                      <strong>₺{toNumber(item.kar).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Kampanya</span>
                      <strong>₺{toNumber(item.kampanya).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Net Bedel</span>
                      <strong>₺{toNumber(item.net_bedel).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Nakit Çarpanı</span>
                      <strong>%{toNumber(item.nakit_carpani).toLocaleString("tr-TR")}</strong>
                    </div>

                    <div className="mini-box">
                      <span>Kart Komisyon</span>
                      <strong>%{toNumber(item.kart_komisyon).toLocaleString("tr-TR")}</strong>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div>
                      <label>Alış</label>
                      <input readOnly value={toNumber(item.alis_fiyati)} />
                    </div>

                    <div>
                      <label>Montaj</label>
                      <input readOnly value={toNumber(item.montaj_maliyeti)} />
                    </div>

                    <div>
                      <label>Puan</label>
                      <input readOnly value={toNumber(item.puan)} />
                    </div>

                    <div>
                      <label>Fayda</label>
                      <input readOnly value={toNumber(item.fayda)} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
