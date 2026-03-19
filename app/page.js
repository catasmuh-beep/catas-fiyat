
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
        .eq("aktif", true)
        

      if (!active) return;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
      const categoryOrder = {
  kombi: 1,
  klima: 2,
  sofben: 3,
  elektrikli_kombi: 4,
  "elektrikli kombi": 4,
};
const brandOrder = {
  vaillant: 1,
  "demirdöküm": 2,
  demirdokum: 2,
  protherm: 3,
};

const sorted = (data || []).sort((a, b) => {
  const aCat = categoryOrder[(a.kategori || "").toLowerCase()] ?? 999;
  const bCat = categoryOrder[(b.kategori || "").toLowerCase()] ?? 999;

  if (aCat !== bCat) return aCat - bCat;

  if ((a.kategori || "").toLowerCase() === "kombi") {
    const aBrand = brandOrder[(a.marka || "").toLowerCase()] ?? 999;
    const bBrand = brandOrder[(b.marka || "").toLowerCase()] ?? 999;

    if (aBrand !== bBrand) return aBrand - bBrand;
  }

  return (a.model || "").localeCompare(b.model || "", "tr");
});
        setRows(sorted);
      }
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
      const k = norm(row.kategori);
      const b = norm(row.marka);
      if (!map.has(k)) map.set(k, new Map());
      if (!map.get(k).has(b)) map.get(k).set(b, []);
      map.get(k).get(b).push(row);
    }
    return map;
  }, [filtered]);

  return (
    <main className="container">
      <div className="topbar">
        <span className="badge">Personel görünümü</span>
        <a href="/admin" className="button primary">Yönetici Girişi</a>
      </div>

      <div className="card hero">
        <Image src="/logo.png" alt="Çataş Mühendislik" width={1600} height={700} priority />
      </div>

      <section className="card panel" style={{ marginTop: 16 }}>
        <div className="stats">
          <div className="stat">Toplam ürün: <strong>{filtered.length}</strong></div>
          <div className="stat">Kategori: <strong>{options.kategori.length}</strong></div>
          <div className="stat">Marka: <strong>{options.marka.length}</strong></div>
        </div>

        <div className="filters">
          <select value={filters.kategori} onChange={(e) => setFilters((s) => ({ ...s, kategori: e.target.value }))}>
            <option value="">Tüm kategoriler</option>
            {options.kategori.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          <select value={filters.marka} onChange={(e) => setFilters((s) => ({ ...s, marka: e.target.value }))}>
            <option value="">Tüm markalar</option>
            {options.marka.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          <select value={filters.model} onChange={(e) => setFilters((s) => ({ ...s, model: e.target.value }))}>
            <option value="">Tüm modeller</option>
            {options.model.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          <input
            placeholder="Ara: model / güç / marka"
            value={filters.arama}
            onChange={(e) => setFilters((s) => ({ ...s, arama: e.target.value }))}
          />
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
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Güç / Alt Model</th>
                          <th>Alış</th>
                          <th>Puan</th>
                          <th>Fayda</th>
                          <th>Kampanya M.</th>
                          <th>Montaj M.</th>
                          <th>Net Bedel</th>
                          <th>Kar</th>
                          <th>Nakit Satış</th>
                          <th>Kart Satış %18</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((r) => (
                          <tr key={r.id}>
                            <td>{norm(r.model)}</td>
                            <td>{norm(r.alt_model)}</td>
                            <td className="money">{formatMoney(r.alis_fiyati)}</td>
                            <td>{formatMoney(r.puan)}</td>
                            <td>{formatMoney(r.fayda)}</td>
                            <td>{formatMoney(r.kampanya_maliyeti)}</td>
                            <td>{formatMoney(r.montaj_maliyeti)}</td>
                            <td className="money">{formatMoney(r.net_bedel)}</td>
                            <td>{formatMoney(r.kar)}</td>
                            <td className="money">{formatMoney(r.nakit_satis)}</td>
                            <td className="money">{formatMoney(r.kart_satis)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </section>
    </main>
  );
}
