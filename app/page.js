"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getBrowserSupabase } from "./lib/supabase";
import { formatMoney, norm } from "./lib/pricing";

export default function HomePage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    kategori: "",
    marka: "",
    model: "",
    arama: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const supabase = getBrowserSupabase();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("aktif", true);

      if (!active) return;

      if (error) {
        console.error(error);
        setRows([]);
        setLoading(false);
        return;
      }

     const categoryOrder = {
  kombi: 1,
  klima: 2,
  sofben: 3,
  "şofben": 3,
  elektriklikombi: 4,
  elektrikli_kombi: 4,
  "elektrikli kombi": 4,
};

const brandOrder = {
  vaillant: 1,
  demirdokum: 2,
  protherm: 3,
};

const sorted = [...(data || [])].sort((a, b) => {
  const aCatKey = norm(a.kategori).toLowerCase().replace(/\s+/g, "");
  const bCatKey = norm(b.kategori).toLowerCase().replace(/\s+/g, "");

  const aCat = categoryOrder[aCatKey] ?? 999;
  const bCat = categoryOrder[bCatKey] ?? 999;

  if (aCat !== bCat) return aCat - bCat;

  if (aCat === 1) {
    const aBrandKey = norm(a.marka)
      .toLowerCase()
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "");

    const bBrandKey = norm(b.marka)
      .toLowerCase()
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "");

    const aBrand = brandOrder[aBrandKey] ?? 999;
    const bBrand = brandOrder[bBrandKey] ?? 999;

    if (aBrand !== bBrand) return aBrand - bBrand;
  }

 const aText = `${norm(a.model)} ${norm(a.alt_model)}`;
const bText = `${norm(b.model)} ${norm(b.alt_model)}`;

const aNums = aText.match(/\d+/g)?.map(Number) || [];
const bNums = bText.match(/\d+/g)?.map(Number) || [];

if (aNums.length && bNums.length) {
  for (let i = 0; i < Math.max(aNums.length, bNums.length); i++) {
    const av = aNums[i] ?? 0;
    const bv = bNums[i] ?? 0;
    if (av !== bv) return av - bv;
  }
}

return aText.localeCompare(bText, "tr");
});

      setRows(sorted);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(() => {
    const kategori = [...new Set(rows.map((r) => norm(r.kategori)).filter(Boolean))];
    const marka = [...new Set(rows.map((r) => norm(r.marka)).filter(Boolean))];
    const model = [...new Set(rows.map((r) => norm(r.model)).filter(Boolean))];
    return { kategori, marka, model };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const text = `${norm(r.kategori)} ${norm(r.marka)} ${norm(r.model)} ${norm(r.alt_model)}`.toLowerCase();

      return (
        (!filters.kategori || norm(r.kategori) === filters.kategori) &&
        (!filters.marka || norm(r.marka) === filters.marka) &&
        (!filters.model || norm(r.model) === filters.model) &&
        (!filters.arama || text.includes(filters.arama.toLowerCase()))
      );
    });
  }, [rows, filters]);

  const grouped = useMemo(() => {
    const map = new Map();

    for (const row of filtered) {
      const kategori = norm(row.kategori);
      const marka = norm(row.marka);

      if (!map.has(kategori)) map.set(kategori, new Map());
      if (!map.get(kategori).has(marka)) map.get(kategori).set(marka, []);
      map.get(kategori).get(marka).push(row);
    }

    return map;
  }, [filtered]);

  return (
    <div className="price-page">
      <div className="price-shell">
        <div className="topbar">
          <span className="badge">Personel görünümü</span>
          <a href="/admin" className="button primary">Yönetici Girişi</a>
        </div>

        <div className="top-panel">
          <div className="top-row">
           <Image
  src="/logo.png"
  alt="Çataş Mühendislik"
  width={900}
  height={394}
  priority
  style={{ width: "100%", maxWidth: "420px", height: "auto", display: "block" }}
            />
          </div>

          <div className="stats">
            <div className="stat">
              Toplam ürün: <strong>{filtered.length}</strong>
            </div>
            <div className="stat">
              Kategori: <strong>{options.kategori.length}</strong>
            </div>
            <div className="stat">
              Marka: <strong>{options.marka.length}</strong>
            </div>
          </div>

          <div className="filter-row">
            <select
              className="soft-select"
              value={filters.kategori}
              onChange={(e) => setFilters((s) => ({ ...s, kategori: e.target.value }))}
            >
              <option value="">Tüm kategoriler</option>
              {options.kategori.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              className="soft-select"
              value={filters.marka}
              onChange={(e) => setFilters((s) => ({ ...s, marka: e.target.value }))}
            >
              <option value="">Tüm markalar</option>
              {options.marka.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              className="soft-select"
              value={filters.model}
              onChange={(e) => setFilters((s) => ({ ...s, model: e.target.value }))}
            >
              <option value="">Tüm modeller</option>
              {options.model.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <input
              className="soft-input"
              placeholder="Ara: model / güç / marka"
              value={filters.arama}
              onChange={(e) => setFilters((s) => ({ ...s, arama: e.target.value }))}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Sonuç bulunamadı.</div>
        ) : (
          [...grouped.entries()].map(([kategori, brands]) => (
            <section key={kategori}>
              <h2 className="section-title">{kategori}</h2>

              {[...brands.entries()].map(([marka, items]) => (
                <div key={`${kategori}-${marka}`}>
                  <h3 className="brand-title">{marka}</h3>

                  <div className="table-wrap">
                    <div className="cards-wrap">
                      {items.map((item) => {
                        const kar = (item.nakit_satis || 0) - (item.net_bedel || 0);

                        return (
                          <div className="product-card" key={item.id}>
                            <div className="product-top-line" />

                            <div className="product-inner">
                              <div className="card-head">
                                <div>
                                  <div className="brand-pill">{item.marka}</div>
                                  <h3 className="model-title">
                                    {item.model} {item.alt_model || ""}
                                  </h3>
                                </div>

                                <button className="settings-btn">Ayar</button>
                              </div>

                              <div className="price-grid">
                                <div className="price-box">
                                  <div className="price-label orange">Nakit</div>
                                  <div className="price-value">
                                    {formatMoney(item.nakit_satis)}
                                  </div>
                                </div>

                                <div className="price-box">
                                  <div className="price-label blue">Kart</div>
                                  <div className="price-value">
                                    {formatMoney(item.kart_satis)}
                                  </div>
                                </div>

                                <div className="price-box">
                                  <div className="price-label gray">Net</div>
                                  <div className="price-value">
                                    {formatMoney(item.net_bedel)}
                                  </div>
                                </div>

                                <div className="price-box">
                                  <div className="price-label green">Kar</div>
                                  <div className="price-value">
                                    <span className={kar >= 0 ? "kar-pozitif" : "kar-negatif"}>
                                      {formatMoney(kar)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="edit-grid">
                                <div className="field-box">
                                  <label>Alış</label>
                                  <input defaultValue={item.alis_fiyati} />
                                </div>

                                <div className="field-box">
                                  <label>Montaj</label>
                                  <input defaultValue={item.montaj_maliyeti} />
                                </div>

                                <div className="field-box">
                                  <label>Puan</label>
                                  <input defaultValue={item.puan} />
                                </div>

                                <div className="field-box">
                                  <label>Fayda</label>
                                  <input defaultValue={item.fayda} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
