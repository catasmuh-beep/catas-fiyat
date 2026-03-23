"use client";

import { useEffect, useMemo, useState } from "react";
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
    .replace(/\.(?=\d)/g, "")
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
  protherm: 6,
  daxom: 7,
};

const klimaBrandOrder = {
  vaillant: 1,
  baymak: 2,
  eca: 3,
  protherm: 4,
  daxom: 5,
};

const ecaKombiModelOrder = {
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
  "cofeo premix 24": 12,
  "cofeo premix 30": 13,
  "cofeo premix 35": 14,
};

const ecaKlimaModelOrder = {
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

const vaillantKlimaModelOrder = {
  "climavair pure 9000": 1,
  "climavair pure 12000": 2,
  "climavair pure 18000": 3,
  "climavair pure 24000": 4,
  "climavair pro 9000": 5,
  "climavair pro 12000": 6,
  "climavair pro 18000": 7,
  "climavair pro 24000": 8,

  "climavair pure 9 000": 1,
  "climavair pure 12 000": 2,
  "climavair pure 18 000": 3,
  "climavair pure 24 000": 4,
  "climavair pro 9 000": 5,
  "climavair pro 12 000": 6,
  "climavair pro 18 000": 7,
  "climavair pro 24 000": 8,

  "climavair pure 9.000": 1,
  "climavair pure 12.000": 2,
  "climavair pure 18.000": 3,
  "climavair pure 24.000": 4,
  "climavair pro 9.000": 5,
  "climavair pro 12.000": 6,
  "climavair pro 18.000": 7,
  "climavair pro 24.000": 8,
};

function hydrateRows(rows) {
  return (rows || []).map((row) => ({
    ...row,
    ...computeDerived(row),
  }));
}

function buildPayload(row) {
  const derived = computeDerived(row);

  return {
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
}

function categoryClass(kategori) {
  const key = trKey(kategori).replace(/\s+/g, "");

  if (key.includes("kombi") && !key.includes("elektrik")) return "kombi";
  if (key.includes("klima")) return "klima";
  if (key.includes("sofben")) return "sofben";
  if (key.includes("elektrik")) return "elk-kombi";

  return "";
}

function brandClass(marka) {
  const key = trKey(marka).replace(/\s+/g, "");

  if (key.includes("vaillant")) return "vaillant";
  if (key.includes("baymak")) return "baymak";
  if (key.includes("demirdokum")) return "demirdokum";
  if (key.includes("eca")) return "eca";
  if (key.includes("baykan")) return "baykan";
  if (key.includes("protherm")) return "protherm";
  if (key.includes("daxom")) return "daxom";
  if (key.includes("warmhaus")) return "warmhaus";

  return "";
}

function buildProductName(row) {
  return `${norm(row.marka)} ${norm(row.model)} ${norm(row.alt_model)}`
    .replace(/\s+/g, " ")
    .trim();
}

function getVaillantKombiOrder(row) {
  const markaKey = trKey(row.marka).replace(/\s+/g, "");
  if (markaKey !== "vaillant") return 999;

  const full = trKey(`${row.model} ${row.alt_model || ""}`);

  if (full.includes("intro 24/24")) return 1;
  if (full.includes("intro 28/28")) return 2;

  if (full.includes("pure 236/7-2")) return 3;
  if (full.includes("pure 286/7-2")) return 4;

  if (
    full.includes("ecotec plus 26") ||
    full.includes("ecotec plus vuw 26") ||
    full.includes("ecotec plus vuw tr 26")
  ) {
    return 5;
  }

  if (
    full.includes("ecotec plus 32") ||
    full.includes("ecotec plus vuw 32") ||
    full.includes("ecotec plus vuw tr 32")
  ) {
    return 6;
  }

  if (
    full.includes("ecotec plus 36") ||
    full.includes("ecotec plus vuw 36") ||
    full.includes("ecotec plus vuw tr 36")
  ) {
    return 7;
  }

  if (
    full.includes("ecotec plus 40") ||
    full.includes("ecotec plus vuw 40") ||
    full.includes("ecotec plus vuw tr 40")
  ) {
    return 8;
  }

  return 999;
}

function sortRowsForCategory(items, kategori) {
  return [...items].sort((a, b) => {
    const kategoriKey = trKey(kategori).replace(/\s+/g, "");
    const aBrand = trKey(a.marka).replace(/\s+/g, "");
    const bBrand = trKey(b.marka).replace(/\s+/g, "");

    if (kategoriKey === "kombi") {
      const aBrandOrder = combiBrandOrder[aBrand] ?? 999;
      const bBrandOrder = combiBrandOrder[bBrand] ?? 999;
      if (aBrandOrder !== bBrandOrder) return aBrandOrder - bBrandOrder;

      const aModelFull = trKey(`${a.model} ${a.alt_model || ""}`);
      const bModelFull = trKey(`${b.model} ${b.alt_model || ""}`);

      if (aBrand === "vaillant" && bBrand === "vaillant") {
        const aOrder = getVaillantKombiOrder(a);
        const bOrder = getVaillantKombiOrder(b);
        if (aOrder !== bOrder) return aOrder - bOrder;
      }

      if (aBrand === "eca" && bBrand === "eca") {
        const aOrder = ecaKombiModelOrder[aModelFull] ?? 999;
        const bOrder = ecaKombiModelOrder[bModelFull] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
    }

    if (kategoriKey === "klima") {
      const aBrandOrder = klimaBrandOrder[aBrand] ?? 999;
      const bBrandOrder = klimaBrandOrder[bBrand] ?? 999;
      if (aBrandOrder !== bBrandOrder) return aBrandOrder - bBrandOrder;

      const aModelFull = trKey(`${a.model} ${a.alt_model || ""}`);
      const bModelFull = trKey(`${b.model} ${b.alt_model || ""}`);

      if (aBrand === "vaillant" && bBrand === "vaillant") {
        const aOrder = vaillantKlimaModelOrder[aModelFull] ?? 999;
        const bOrder = vaillantKlimaModelOrder[bModelFull] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }

      if (aBrand === "eca" && bBrand === "eca") {
        const aOrder = ecaKlimaModelOrder[aModelFull] ?? 999;
        const bOrder = ecaKlimaModelOrder[bModelFull] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
    }

    const aText = `${norm(a.marka)} ${norm(a.model)} ${norm(a.alt_model)}`;
    const bText = `${norm(b.marka)} ${norm(b.model)} ${norm(b.alt_model)}`;
    return aText.localeCompare(bText, "tr");
  });
}

function ProductInfoBlock({ row }) {
  return (
    <div className="admin-product-info">
      <div className={`product-name ${brandClass(row.marka)}`}>{buildProductName(row) || "-"}</div>
    </div>
  );
}

function MobileRowCard({ row, isDirty, updateField }) {
  return (
    <div className={`admin-mobile-card${isDirty ? " dirty" : ""}`}>
      <div className="admin-mobile-head">
        <div className="admin-mobile-head-main">
          <ProductInfoBlock row={row} />
        </div>

        <label className="admin-active-toggle">
          <span>Aktif</span>
          <input
            type="checkbox"
            checked={!!row.aktif}
            onChange={(e) => updateField(row.id, "aktif", e.target.checked)}
          />
        </label>
      </div>

      <div className="admin-mobile-stats">
        <div>
          <span>Net</span>
          <strong>{formatMoney(row.net_bedel)}</strong>
        </div>
        <div>
          <span>Kar</span>
          <strong>{formatMoney(row.kar)}</strong>
        </div>
        <div>
          <span>Nakit</span>
          <strong>{formatMoney(row.nakit_satis)}</strong>
        </div>
        <div>
          <span>Kart</span>
          <strong>{formatMoney(row.kart_satis)}</strong>
        </div>
      </div>

      <div className="admin-mobile-fields">
        <label>
          <span>Alış</span>
          <input
            className="purchase-input"
            type="number"
            value={row.alis_fiyati ?? 0}
            onChange={(e) => updateField(row.id, "alis_fiyati", e.target.value)}
          />
        </label>

        <label>
          <span>Montaj</span>
          <input
            type="number"
            value={row.montaj_maliyeti ?? 0}
            onChange={(e) => updateField(row.id, "montaj_maliyeti", e.target.value)}
          />
        </label>

        <label>
          <span>Puan</span>
          <input
            type="number"
            value={row.puan ?? 0}
            onChange={(e) => updateField(row.id, "puan", e.target.value)}
          />
        </label>

        <label>
          <span>Fayda</span>
          <input
            type="number"
            value={row.fayda ?? 0}
            onChange={(e) => updateField(row.id, "fayda", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminClient({ initialRows }) {
  const initialHydrated = useMemo(() => hydrateRows(initialRows), [initialRows]);

  const [rows, setRows] = useState(initialHydrated);
  const [savedRows, setSavedRows] = useState(initialHydrated);
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setRows(initialHydrated);
    setSavedRows(initialHydrated);
    setDirtyIds(new Set());
  }, [initialHydrated]);

  useEffect(() => {
    const handler = (event) => {
      if (dirtyIds.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyIds]);

  const categories = useMemo(() => {
    return [...new Set(rows.map((r) => norm(r.kategori)).filter(Boolean))].sort((a, b) => {
      const aKey = trKey(a).replace(/\s+/g, "");
      const bKey = trKey(b).replace(/\s+/g, "");
      return (categoryOrder[aKey] ?? 999) - (categoryOrder[bKey] ?? 999);
    });
  }, [rows]);

  const availableBrands = useMemo(() => {
    const source =
      selectedCategory === "all"
        ? rows
        : rows.filter((r) => norm(r.kategori) === selectedCategory);

    return [...new Set(source.map((r) => norm(r.marka)).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr")
    );
  }, [rows, selectedCategory]);

  const availableModels = useMemo(() => {
    let source = rows;

    if (selectedCategory !== "all") {
      source = source.filter((r) => norm(r.kategori) === selectedCategory);
    }

    if (selectedBrand !== "all") {
      source = source.filter((r) => norm(r.marka) === selectedBrand);
    }

    return [...new Set(source.map((r) => norm(r.model)).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr")
    );
  }, [rows, selectedCategory, selectedBrand]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const categoryOk =
        selectedCategory === "all" || norm(row.kategori) === selectedCategory;

      const brandOk = selectedBrand === "all" || norm(row.marka) === selectedBrand;

      const modelOk = selectedModel === "all" || norm(row.model) === selectedModel;

      const text = trKey(
        `${row.kategori || ""} ${row.marka || ""} ${row.model || ""} ${row.alt_model || ""}`
      );

      const searchOk = !searchTerm || text.includes(trKey(searchTerm));

      return categoryOk && brandOk && modelOk && searchOk;
    });
  }, [rows, selectedCategory, selectedBrand, selectedModel, searchTerm]);

  const filteredCategories = useMemo(() => {
    return [...new Set(filteredRows.map((r) => norm(r.kategori)).filter(Boolean))].sort(
      (a, b) => {
        const aKey = trKey(a).replace(/\s+/g, "");
        const bKey = trKey(b).replace(/\s+/g, "");
        return (categoryOrder[aKey] ?? 999) - (categoryOrder[bKey] ?? 999);
      }
    );
  }, [filteredRows]);

  useEffect(() => {
    setSelectedBrand("all");
    setSelectedModel("all");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedModel("all");
  }, [selectedBrand]);

  const dirtyCount = dirtyIds.size;

  function markDirty(id) {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function clearDirty(ids) {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function updateField(id, field, value) {
    setNotice("");

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const next = {
          ...row,
          [field]: numericFields().includes(field)
            ? Number(value === "" ? 0 : value)
            : value,
        };

        return { ...next, ...computeDerived(next) };
      })
    );

    markDirty(id);
  }

  async function saveAllChanges() {
    if (dirtyIds.size === 0 || saving) return;

    setSaving(true);
    setNotice("");

    const rowsToSave = rows.filter((row) => dirtyIds.has(row.id));

    const results = await Promise.all(
      rowsToSave.map(async (row) => {
        const payload = buildPayload(row);

        try {
          const res = await fetch(`/api/products/${row.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            return {
              ok: false,
              id: row.id,
              error: json.error || "Kayıt kaydedilemedi.",
            };
          }

          return {
            ok: true,
            id: row.id,
            row: { ...(json.row || row), ...computeDerived(json.row || row) },
          };
        } catch {
          return {
            ok: false,
            id: row.id,
            error: "Bağlantı hatası oluştu.",
          };
        }
      })
    );

    const failed = results.filter((r) => !r.ok);
    const succeeded = results.filter((r) => r.ok);

    if (succeeded.length > 0) {
      setRows((prev) =>
        prev.map((row) => {
          const found = succeeded.find((s) => s.id === row.id);
          return found ? found.row : row;
        })
      );

      setSavedRows((prev) =>
        prev.map((row) => {
          const found = succeeded.find((s) => s.id === row.id);
          return found ? found.row : row;
        })
      );

      clearDirty(succeeded.map((s) => s.id));
    }

    if (failed.length > 0) {
      setNotice(`${succeeded.length} kayıt kaydedildi, ${failed.length} kayıt kaydedilemedi.`);
    } else {
      setNotice(`${succeeded.length} kayıt başarıyla güncellendi.`);
    }

    setSaving(false);
  }

  function revertAllChanges() {
    setRows(savedRows);
    setDirtyIds(new Set());
    setNotice("Kaydedilmemiş değişiklikler geri alındı.");
  }

  async function logout() {
    if (dirtyIds.size > 0) {
      const ok = window.confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğine emin misin?");
      if (!ok) return;
    }

    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="container admin-page-shell">
      <div className="admin-topbar-card">
        <div className="admin-top-actions">
          <button
            className="button primary"
            onClick={saveAllChanges}
            disabled={saving || dirtyCount === 0}
          >
            {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
          </button>

          <button
            className="button secondary"
            onClick={revertAllChanges}
            disabled={saving || dirtyCount === 0}
          >
            Değişiklikleri Geri Al
          </button>

          <a href="/" className="button secondary">
            Personel görünümüne dön
          </a>

          <button className="button danger" onClick={logout} disabled={saving}>
            Çıkış
          </button>
        </div>
      </div>

      <div className="card panel admin-filter-bar">
        <div className="admin-filter-stats">
          <strong>Toplam ürün: {filteredRows.length}</strong>
          <span>Kategori: {filteredCategories.length}</span>
          <span>Marka: {availableBrands.length}</span>
        </div>

        <div className="admin-filter-grid">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">Tüm kategoriler</option>
            {categories.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </select>

          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="all">Tüm markalar</option>
            {availableBrands.map((marka) => (
              <option key={marka} value={marka}>
                {marka}
              </option>
            ))}
          </select>

          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            <option value="all">Tüm modeller</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ara: model / güç / marka"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {notice ? <div className="notice ok">{notice}</div> : null}

      {filteredCategories.map((kategori) => {
        const categoryRows = sortRowsForCategory(
          filteredRows.filter((r) => norm(r.kategori) === kategori),
          kategori
        );

        return (
          <section key={kategori} className="card panel admin-section">
            <h2
              className={`section-title admin-section-title category-title ${categoryClass(
                kategori
              )}`}
            >
              {kategori}
            </h2>

            <div className="admin-desktop-table">
              <div className="table-wrap">
                <table className="table admin-table">
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
                    {categoryRows.map((row) => {
                      const isDirty = dirtyIds.has(row.id);

                      return (
                        <tr key={row.id} className={isDirty ? "admin-row-dirty" : ""}>
                          <td>
                            <ProductInfoBlock row={row} />
                          </td>

                          <td>
                            <input
                              className="purchase-input"
                              type="number"
                              value={row.alis_fiyati ?? 0}
                              onChange={(e) => updateField(row.id, "alis_fiyati", e.target.value)}
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              value={row.montaj_maliyeti ?? 0}
                              onChange={(e) =>
                                updateField(row.id, "montaj_maliyeti", e.target.value)
                              }
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

                          <td>{formatMoney(row.net_bedel)}</td>
                          <td>{formatMoney(row.kar)}</td>
                          <td className="money">{formatMoney(row.nakit_satis)}</td>
                          <td className="money">{formatMoney(row.kart_satis)}</td>

                          <td className="admin-check-cell">
                            <input
                              type="checkbox"
                              checked={!!row.aktif}
                              onChange={(e) => updateField(row.id, "aktif", e.target.checked)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-mobile-list">
              {categoryRows.map((row) => (
                <MobileRowCard
                  key={row.id}
                  row={row}
                  isDirty={dirtyIds.has(row.id)}
                  updateField={updateField}
                />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
