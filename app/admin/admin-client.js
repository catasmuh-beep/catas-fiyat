"use client";

import { useMemo, useState } from "react";
import { computeDerived, formatMoney, norm } from "../lib/pricing";

function numericFields() {
  return ["alis_fiyati", "puan", "fayda", "montaj_maliyeti"];
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

export default function AdminClient({ initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState("");

  const categories = useMemo(() => {
    return [...new Set(rows.map((r) => norm(r.kategori)))].sort((a, b) => {
      const aKey = trKey(a).replace(/\s+/g, "");
      const bKey = trKey(b).replace(/\s+/g, "");
      return (categoryOrder[aKey] ?? 999) - (categoryOrder[bKey] ?? 999);
    });
  }, [rows]);

  async function saveRow(row) {
    setSavingId(row.id);
    setNotice("");

    const derived = computeDerived(row);

    const payload = {
      kategori: norm(row.kategori),
      marka: norm(row.marka),
      model: norm(row.model),
      alt_model: norm(row.alt_model),
      alis_fiyati: Number(row.alis_fiyati || 0),
      puan: Number(row.puan || 0),
      fayda: Number(row.fayda || 0),
      montaj_maliyeti: Number(row.montaj_maliyeti || 0),
      kampanya_maliyeti: derived.kampanya_maliyeti,
      net_bedel: derived.net_bedel,
      kar: derived.kar,
      nakit_satis: derived.nakit_satis,
      kart_satis: derived.kart_satis,
      aktif: !!row.aktif,
    };

    const res = await fetch(`/api/products/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(json.error || "Kayıt kaydedilemedi.");
      setSavingId("");
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === row.id ? json.row || r : r)));
    setSavingId("");
    setNotice("Kayıt güncellendi.");
  }

  function updateField(id, field, value) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = {
          ...r,
          [field]: numericFields().includes(field) ? Number(value || 0) : value,
        };
        return { ...next, ...computeDerived(next) };
      })
    );
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="container">
      <div className="admin-actions">
        <div>
          <span className="badge">Yönetici paneli</span>
          <div className="small" style={{ marginTop: 8 }}>
            Fiyatları burada değiştirince personel ekranı otomatik yeni veriyi gösterir.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" className="button secondary">Personel görünümüne dön</a>
          <button className="button danger" onClick={logout}>Çıkış</button>
        </div>
      </div>

      {notice ? <div className="notice ok">{notice}</div> : null}

      {categories.map((kategori) => (
        <section key={kategori} className="card panel" style={{ marginBottom: 16 }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>{kategori}</h2>
          <div className="table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>Marka</th>
                  <th>Model</th>
                  <th>Güç / Alt Model</th>
                  <th>Alış</th>
                  <th>Puan</th>
                  <th>Fayda</th>
                  <th>Montaj</th>
                  <th>Net</th>
                  <th>Kar</th>
                  <th>Nakit</th>
                  <th>Kart %18</th>
                  <th>Aktif</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => norm(r.kategori) === kategori)
                  .sort((a, b) => {
                    const kategoriKey = trKey(kategori).replace(/\s+/g, "");

                    const aBrand = trKey(a.marka).replace(/\s+/g, "");
                    const bBrand = trKey(b.marka).replace(/\s+/g, "");

                    if (kategoriKey === "kombi") {
                      const aOrder = combiBrandOrder[aBrand] ?? 999;
                      const bOrder = combiBrandOrder[bBrand] ?? 999;
                      if (aOrder !== bOrder) return aOrder - bOrder;
                    }

                    if (kategoriKey === "klima") {
                      const aOrder = klimaBrandOrder[aBrand] ?? 999;
                      const bOrder = klimaBrandOrder[bBrand] ?? 999;
                      if (aOrder !== bOrder) return aOrder - bOrder;
                    }

                    const aText = `${norm(a.marka)} ${norm(a.model)} ${norm(a.alt_model)}`;
                    const bText = `${norm(b.marka)} ${norm(b.model)} ${norm(b.alt_model)}`;

                    return aText.localeCompare(bText, "tr");
                  })
                  .map((row) => (
                    <tr key={row.id}>
                      <td>{norm(row.marka)}</td>
                      <td>{norm(row.model)}</td>
                      <td>{norm(row.alt_model)}</td>
                      <td>
                        <input
                          type="number"
                          value={row.alis_fiyati ?? 0}
                          onChange={(e) => updateField(row.id, "alis_fiyati", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.puan ?? 0}
                          onChange={(e) => updateField(row.id, "puan", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.fayda ?? 0}
                          onChange={(e) => updateField(row.id, "fayda", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.montaj_maliyeti ?? 0}
                          onChange={(e) => updateField(row.id, "montaj_maliyeti", e.target.value)}
                        />
                      </td>
                      <td>{formatMoney(row.net_bedel)}</td>
                      <td>{formatMoney(row.kar)}</td>
                      <td className="money">{formatMoney(row.nakit_satis)}</td>
                      <td className="money">{formatMoney(row.kart_satis)}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!row.aktif}
                          onChange={(e) => updateField(row.id, "aktif", e.target.checked)}
                        />
                      </td>
                      <td>
                        <button
                          className="button primary"
                          disabled={savingId === row.id}
                          onClick={() => saveRow(row)}
                        >
                          {savingId === row.id ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
