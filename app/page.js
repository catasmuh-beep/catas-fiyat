"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getBrowserSupabase } from "./lib/supabase";
import { formatMoney, norm } from "./lib/pricing";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function calcNakitCarpani(item) {
  const net = toNumber(item.net_bedel);
  const nakit = toNumber(item.nakit_satis);

  if (!net || !nakit || nakit <= net) return 0;

  return Math.floor(((nakit - net) / net) * 100);
}

function calcKartKomisyonu(item) {
  const nakit = toNumber(item.nakit_satis);
  const kart = toNumber(item.kart_satis);

  if (!nakit || !kart || kart <= nakit) return 0;

  return Math.floor(((kart - nakit) / nakit) * 100);
}

function trKey(value) {
  return norm(value)
    .toLowerCase()
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/\s+/g, " ")
    .trim();
}

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

      const combiBrandOrder = {
        vaillant: 1,
        demirdokum: 2,
        baymak: 3,
        eca: 4,
        baykan: 5,
      };

      const klimaBrandOrder = {
        vaillant: 1,
        baymak: 2,
        eca: 3,
      };

      const ecaModelOrder = {
        "citius premix 20": 1,
        "citius premix 24": 2,
        "citius premix 28": 3,
        "proteus premix 24": 4,
        "proteus premix 28": 5,
        "proteus premix 30": 6,
        "proteus premix 35": 7,
        "proteus premix 42": 8,
        "proteus premix 45": 9,
        "proteus premix hst 35": 10,
        "proteus premix hst 45": 11,
        "confeo premix 24": 12,
        "confeo premix 30": 13,
        "confeo premix 35": 14,
      };

     const klimaModelOrder = {
  "spaylos pro 9000": 1,
  "spaylos pro 12000": 2,
  "spaylos pro 18000": 3,
  "spaylos pro 24000": 4,
  "spylos pro 9000": 1,
  "spylos pro 12000": 2,
  "spylos pro 18000": 3,
  "spylos pro 24000": 4,

  "ecotech 9000": 5,
  "ecotech 12000": 6,
  "ecotech 18000": 7,
  "ecotech 24000": 8,
  "ecotec 9000": 5,
  "ecotec 12000": 6,
  "ecotec 18000": 7,
  "ecotec 24000": 8,
};

      const sorted = [...(data || [])].sort((a, b) => {
        const aCatKey = trKey(a.kategori).replace(/\s+/g, "");
        const bCatKey = trKey(b.kategori).replace(/\s+/g, "");

        const aCat = categoryOrder[aCatKey] ?? 999;
        const bCat = categoryOrder[bCatKey] ?? 999;

        if (aCat !== bCat) return aCat - bCat;

        const aBrandKey = trKey(a.marka).replace(/\s+/g, "");
        const bBrandKey = trKey(b.marka).replace(/\s+/g, "");

        if (aCatKey === "kombi") {
          const aBrand = combiBrandOrder[aBrandKey] ?? 999;
          const bBrand = combiBrandOrder[bBrandKey] ?? 999;
          if (aBrand !== bBrand) return aBrand - bBrand;
        }

        if (aCatKey === "klima") {
          const aBrand = klimaBrandOrder[aBrandKey] ?? 999;
          const bBrand = klimaBrandOrder[bBrandKey] ?? 999;
          if (aBrand !== bBrand) return aBrand - bBrand;
        }

        const aModelFull = trKey(`${a.model} ${a.alt_model || ""}`);
        const bModelFull = trKey(`${b.model} ${b.alt_model || ""}`);

        if (aBrandKey === "eca" && bBrandKey === "eca") {
          const aOrder = ecaModelOrder[aModelFull] ?? 999;
          const bOrder = ecaModelOrder[bModelFull] ?? 999;
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        if (aCatKey === "klima") {
          const aOrder = klimaModelOrder[aModelFull] ?? 999;
          const bOrder = klimaModelOrder[bModelFull] ?? 999;
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        const aPrice = Number(a.nakit_satis || 0);
        const bPrice = Number(b.nakit_satis || 0);

        if (aPrice !== bPrice) return aPrice - bPrice;

        const aText = `${norm(a.model)} ${norm(a.alt_model)}`;
        const bText = `${norm(b.model)} ${norm(b.alt_model)}`;

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
      const text =
        `${norm(r.kategori)} ${norm(r.marka)} ${norm(r.model)} ${norm(r.alt_model)}`.toLowerCase();

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
              style={{
                width: "100%",
                maxWidth: "380px",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
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
                        const nakitCarpaniYuzde = calcNakitCarpani(item);
                        const kartKomisyonuYuzde = calcKartKomisyonu(item);

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

                                <div className="settings-placeholder" />
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
                                <div className="summary-grid">
                                  <div className="summary-box">
                                    <div className="summary-label">Kampanya</div>
                                    <div className="summary-value">
                                      {formatMoney(item.kampanya_maliyeti)}
                                    </div>
                                  </div>

                                  <div className="summary-box">
                                    <div className="summary-label">Net Bedel</div>
                                    <div className="summary-value">
                                      {formatMoney(item.net_bedel)}
                                    </div>
                                  </div>

                                  <div className="summary-box">
                                    <div className="summary-label">Nakit Çarpanı</div>
                                    <div className="summary-value">
                                      %{nakitCarpaniYuzde}
                                    </div>
                                  </div>

                                  <div className="summary-box">
                                    <div className="summary-label">Kart Komisyon</div>
                                    <div className="summary-value">
                                      %{kartKomisyonuYuzde}
                                    </div>
                                  </div>
                                </div>

                                <div className="field-box">
                                  <label>Alış</label>
                                  <input
                                    defaultValue={item.alis_fiyati}
                                    readOnly
                                    className="readonly-input"
                                  />
                                </div>

                                <div className="field-box field-box-red">
                                  <label className="label-red">Montaj</label>
                                  <input
                                    defaultValue={item.montaj_maliyeti}
                                    readOnly
                                    className="readonly-input input-red"
                                  />
                                </div>

                                <div className="field-box field-box-green">
                                  <label className="label-green">Puan</label>
                                  <input
                                    defaultValue={item.puan}
                                    readOnly
                                    className="readonly-input input-green"
                                  />
                                </div>

                                <div className="field-box field-box-green">
                                  <label className="label-green">Fayda</label>
                                  <input
                                    defaultValue={item.fayda}
                                    readOnly
                                    className="readonly-input input-green"
                                  />
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
