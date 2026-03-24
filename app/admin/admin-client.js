"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];
const BRAND_ORDER = ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"];

function num(v, fallback = 0) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function emptyProduct() {
  return {
    id: crypto.randomUUID(),
    kategori: "",
    marka: "",
    model: "",
    alt_model_guc: "",
    alis_fiyati: 0,
    montaj_maliyeti: 0,
    puan: 0,
    fayda: 0,
    net_bedel: 0,
    nakit_carpani: 0,
    kart_komisyon: 0,
    nakit: 0,
    kart: 0,
    kar: 0,
    kampanya: 0,
    aktif: true,
    _isNew: true,
  };
}

function enrich(row) {
  const alis = num(row.alis_fiyati);
  const montaj = num(row.montaj_maliyeti);
  const puan = num(row.puan);
  const fayda = num(row.fayda);

  const net_bedel = row.net_bedel !== null && row.net_bedel !== undefined
    ? num(row.net_bedel)
    : alis + montaj;

  const nakit_carpani = num(row.nakit_carpani);
  const kart_komisyon = num(row.kart_komisyon);

  const nakit = row.nakit !== null && row.nakit !== undefined
    ? num(row.nakit)
    : Math.round(net_bedel * (1 + nakit_carpani / 100));

  const kart = row.kart !== null && row.kart !== undefined
    ? num(row.kart)
    : Math.round(nakit * (1 + kart_komisyon / 100));

  const kar = row.kar !== null && row.kar !== undefined
    ? num(row.kar)
    : Math.max(0, nakit - net_bedel + fayda + puan);

  const kampanya = row.kampanya !== null && row.kampanya !== undefined
    ? num(row.kampanya)
    : nakit;

  return {
    ...row,
    kategori: row.kategori || "",
    marka: row.marka || "",
    model: row.model || "",
    alt_model_guc: row.alt_model_guc || "",
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    net_bedel,
    nakit_carpani,
    kart_komisyon,
    nakit,
    kart,
    kar,
    kampanya,
    aktif: Boolean(row.aktif),
  };
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

export default function AdminClient({ initialProducts = [] }) {
  const [products, setProducts] = useState(sortProducts(initialProducts.map(enrich)));
  const [original, setOriginal] = useState(sortProducts(initialProducts.map(enrich)));
  const [newProduct, setNewProduct] = useState(emptyProduct());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function reloadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) {
      const ready = sortProducts(data.map(enrich));
      setProducts(ready);
      setOriginal(ready);
    }
  }

  useEffect(() => {
    reloadProducts();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of sortProducts(products)) {
      if (!map[p.kategori]) map[p.kategori] = [];
      map[p.kategori].push(p);
    }
    return map;
  }, [products]);

  function updateRow(id, field, value) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = enrich({ ...p, [field]: value });
        return next;
      })
    );
  }

  function updateNewProduct(field, value) {
    setNewProduct((prev) => enrich({ ...prev, [field]: value }));
  }

  function addNewProduct() {
    if (!newProduct.kategori || !newProduct.marka || !newProduct.model) {
      setMessage("Kategori, marka ve model zorunlu.");
      return;
    }

    const ready = enrich({
      ...newProduct,
      aktif: Boolean(newProduct.aktif),
    });

    setProducts((prev) => sortProducts([...prev, ready]));
    setNewProduct(emptyProduct());
    setMessage("Yeni ürün listeye eklendi. Kalıcı olması için üstteki 'Tüm Değişiklikleri Kaydet' butonuna bas.");
  }

  function revertChanges() {
    setProducts(sortProducts(original.map(enrich)));
    setNewProduct(emptyProduct());
    setMessage("Değişiklikler geri alındı.");
  }

  async function saveAll() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ products }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Kaydetme başarısız.");
      }

      const ready = sortProducts((data.products || []).map(enrich));
      setProducts(ready);
      setOriginal(ready);
      setMessage("Tüm değişiklikler başarıyla kaydedildi. Personel ekranına da yansır.");
    } catch (err) {
      setMessage(err.message || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id) {
    const filtered = products.filter((p) => p.id !== id);
    setProducts(filtered);
    setMessage("Ürün listeden kaldırıldı. Kalıcı olması için kaydet butonuna bas.");
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
        </button>

        <button className="btn btn-secondary" onClick={revertChanges}>
          Değişiklikleri Geri Al
        </button>

        <a className="btn btn-outline" href="/">
          Personel görünümüne dön
        </a>

        <a className="btn btn-light" href="/api/admin/logout">
          Çıkış
        </a>
      </div>

      {message ? <div className="admin-message">{message}</div> : null}

      <section className="new-product-box">
        <h3>Yeni ürün ekle</h3>

        <div className="new-product-grid">
          <input
            value={newProduct.kategori}
            onChange={(e) => updateNewProduct("kategori", e.target.value)}
            placeholder="Kategori"
          />
          <input
            value={newProduct.marka}
            onChange={(e) => updateNewProduct("marka", e.target.value)}
            placeholder="Marka"
          />
          <input
            value={newProduct.model}
            onChange={(e) => updateNewProduct("model", e.target.value)}
            placeholder="Model"
          />
          <input
            value={newProduct.alt_model_guc}
            onChange={(e) => updateNewProduct("alt_model_guc", e.target.value)}
            placeholder="Alt model / güç"
          />

          <input
            type="number"
            value={newProduct.alis_fiyati}
            onChange={(e) => updateNewProduct("alis_fiyati", e.target.value)}
            placeholder="Alış fiyatı"
          />
          <input
            type="number"
            value={newProduct.montaj_maliyeti}
            onChange={(e) => updateNewProduct("montaj_maliyeti", e.target.value)}
            placeholder="Montaj maliyeti"
          />
          <input
            type="number"
            value={newProduct.puan}
            onChange={(e) => updateNewProduct("puan", e.target.value)}
            placeholder="Puan"
          />
          <input
            type="number"
            value={newProduct.fayda}
            onChange={(e) => updateNewProduct("fayda", e.target.value)}
            placeholder="Fayda"
          />
        </div>

        <div className="new-product-actions">
          <label className="checkbox-row">
            <span>Aktif</span>
            <input
              type="checkbox"
              checked={newProduct.aktif}
              onChange={(e) => updateNewProduct("aktif", e.target.checked)}
            />
          </label>

          <button className="btn btn-success" onClick={addNewProduct}>
            Yeni Ürün Ekle
          </button>
        </div>
      </section>

      {Object.entries(grouped).map(([kategori, items]) => (
        <section key={kategori} className="category-block">
          <div className="category-chip">{kategori}</div>

          <div className="table-wrap">
            <table className="admin-table">
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
                  <th>Sil</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.marka}</strong> {p.model} {p.alt_model_guc}
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.alis_fiyati}
                        onChange={(e) => updateRow(p.id, "alis_fiyati", e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.montaj_maliyeti}
                        onChange={(e) => updateRow(p.id, "montaj_maliyeti", e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.puan}
                        onChange={(e) => updateRow(p.id, "puan", e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.fayda}
                        onChange={(e) => updateRow(p.id, "fayda", e.target.value)}
                      />
                    </td>

                    <td>₺{enrich(p).net_bedel.toLocaleString("tr-TR")}</td>
                    <td>₺{enrich(p).kar.toLocaleString("tr-TR")}</td>
                    <td>₺{enrich(p).nakit.toLocaleString("tr-TR")}</td>
                    <td>₺{enrich(p).kart.toLocaleString("tr-TR")}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(p.aktif)}
                        onChange={(e) => updateRow(p.id, "aktif", e.target.checked)}
                      />
                    </td>

                    <td>
                      <button className="btn btn-light" onClick={() => deleteRow(p.id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
