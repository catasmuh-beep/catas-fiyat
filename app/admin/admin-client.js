"use client";

import { useEffect, useMemo, useState } from "react";

function safeText(value) {
  return String(value ?? "").trim();
}

function trKey(value) {
  return safeText(value)
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

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function roundToNearestThousand(value) {
  return Math.round(toNumber(value) / 1000) * 1000;
}

function formatTL(value) {
  return toNumber(value).toLocaleString("tr-TR", {
    maximumFractionDigits: 0,
  });
}

function calculatePricing(product) {
  const alis = toNumber(product?.alis_fiyati ?? product?.alis);
  const montaj = toNumber(product?.montaj);
  const puan = toNumber(product?.puan);
  const fayda = toNumber(product?.fayda);

  const kampanya = Math.max(0, alis + montaj - puan - fayda);
  const nakit = roundToNearestThousand(kampanya * 1.09);
  const kart = roundToNearestThousand(nakit * 1.18);
  const kar = nakit - kampanya;

  return { kampanya, nakit, kart, kar };
}

function safeCalculatePricing(product) {
  try {
    return calculatePricing(product || {});
  } catch {
    return { kampanya: 0, nakit: 0, kart: 0, kar: 0 };
  }
}

const CATEGORY_ORDER = [
  "Kombi",
  "Klima",
  "Şofben",
  "Elektrikli Kombi",
  "Boyler",
  "Kazan",
  "Radyatör",
  "Pompa",
  "Aksesuar",
];

const BRAND_ORDER = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan",  "Ferroli", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Şofben: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Daxom"],
  "Elektrikli Kombi": ["Daxom", "ECA"],
    Boyler: ["Wenta", "APA", "Apamet", "Kodsan", "Baymak", "MIT", "ECA", "Vaillant", "Viessmann", "Bosch", "Buderus"],
  Kazan: ["Vaillant", "Viessmann", "Bosch", "Buderus", "ECA"],
  Radyatör: ["Demirdöküm", "ECA", "Baymak"],
  Pompa: ["Wilo", "Grundfos", "Duca", "Regen", "DAB"],
  Aksesuar: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Bosch", "Buderus"],
};

const EMPTY_NEW_PRODUCT = {
  kategori: "Kombi",
  marka: "",
  model: "",
  alt_model: "",
  urun_adi: "",
  guc_kw: "",
  alis_fiyati: "",
  montaj: "",
  puan: "",
  fayda: "",
  kampanya: "",
  nakit_carpani: "",
  kart_komisyonu: "",
  aktif: true,
};

function normalizeCategory(value) {
  const raw = safeText(value);
  const key = trKey(raw).replace(/\s+/g, "");

  if (key === "kombi") return "Kombi";
  if (key === "klima") return "Klima";
  if (key === "sofben") return "Şofben";
  if (key === "elektriklikombi" || key === "elektrikli_kombi") return "Elektrikli Kombi";

  return raw || "Kombi";
}

function buildModelName(product) {
  return `${safeText(product?.model)} ${safeText(product?.alt_model)}`
    .replace(/\s+/g, " ")
    .trim();
}

function compareWithOrder(a, b, orderList) {
  const aIndex = orderList.findIndex((x) => trKey(x) === trKey(a));
  const bIndex = orderList.findIndex((x) => trKey(x) === trKey(b));

  const ao = aIndex === -1 ? 999 : aIndex;
  const bo = bIndex === -1 ? 999 : bIndex;

  if (ao !== bo) return ao - bo;
  return safeText(a).localeCompare(safeText(b), "tr");
}

function sortProductsByWordOrder(list) {
  return [...list].sort((a, b) => {
    const aCategory = normalizeCategory(a?.kategori);
    const bCategory = normalizeCategory(b?.kategori);

    const aCatOrder = CATEGORY_ORDER.indexOf(aCategory) === -1 ? 999 : CATEGORY_ORDER.indexOf(aCategory);
    const bCatOrder = CATEGORY_ORDER.indexOf(bCategory) === -1 ? 999 : CATEGORY_ORDER.indexOf(bCategory);

    if (aCatOrder !== bCatOrder) return aCatOrder - bCatOrder;

    const brandCmp = compareWithOrder(a?.marka, b?.marka, BRAND_ORDER[aCategory] || []);
    if (brandCmp !== 0) return brandCmp;

    return buildModelName(a).localeCompare(buildModelName(b), "tr");
  });
}

function normalizeProduct(product) {
  return {
    id: product?.id ?? null,
    kategori: normalizeCategory(product?.kategori || product?.category),
    marka: safeText(product?.marka || product?.brand),
    model: safeText(product?.model),
    alt_model: safeText(product?.alt_model),
    urun_adi: safeText(product?.urun_adi),
    guc_kw: safeText(product?.guc_kw ?? product?.kw ?? product?.guc),
    alis_fiyati: toNumber(product?.alis_fiyati ?? product?.alis),
    montaj: toNumber(product?.montaj ?? product?.montaj_maliyeti),
    puan: toNumber(product?.puan),
    fayda: toNumber(product?.fayda),
    kampanya: toNumber(product?.kampanya),
    nakit_carpani: toNumber(product?.nakit_carpani),
    kart_komisyonu: toNumber(product?.kart_komisyonu),
    aktif: product?.aktif !== false && product?.active !== false,
    _deleted: !!product?._deleted,
    _isNew: !!product?._isNew,
    _dirty: !!product?._dirty,
  };
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

function ProductRow({ product, editingId, onEdit, onDelete, onChange }) {
  const isEditing = editingId === product.id;
  const pricing = safeCalculatePricing(product);

  return (
    <tr className={product._dirty ? "dirty-row" : ""}>
      <td>
        <select
          value={product.kategori}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "kategori", e.target.value)}
        >
          {CATEGORY_ORDER.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </td>

      <td>
        <span className={`brand-pill brand-${trKey(product.marka)}`}>
          {product.marka || "-"}
        </span>
      </td>

      <td>
        <input
          value={product.model}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "model", e.target.value)}
        />
      </td>

      <td>
        <input
          value={product.guc_kw}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "guc_kw", e.target.value)}
        />
      </td>

      <td>
        <input
          type="number"
          value={product.alis_fiyati}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "alis_fiyati", e.target.value)}
        />
      </td>

      <td>
        <input
          type="number"
          value={product.montaj}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "montaj", e.target.value)}
        />
      </td>

      <td>
        <input
          type="number"
          value={product.puan}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "puan", e.target.value)}
        />
      </td>

      <td>
        <input
          type="number"
          value={product.fayda}
          disabled={!isEditing}
          onChange={(e) => onChange(product.id, "fayda", e.target.value)}
        />
      </td>

      <td className="money blue">{formatTL(pricing.kampanya)}</td>
      <td className="money black">{formatTL(pricing.nakit)}</td>
      <td className="money black">{formatTL(pricing.kart)}</td>
      <td className="money green">{formatTL(pricing.kar)}</td>

      <td>
        <label className="active-check">
          <input
            type="checkbox"
            checked={!!product.aktif}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "aktif", e.target.checked)}
          />
          Aktif
        </label>
      </td>

      <td className="action-cell">
        <button type="button" className="edit-btn" onClick={() => onEdit(product.id)}>
          {isEditing ? "Kapat" : "Düzenle"}
        </button>
        <button type="button" className="delete-btn" onClick={() => onDelete(product.id)}>
          Sil
        </button>
      </td>
    </tr>
  );
}

export default function AdminClient({ initialProducts = [] }) {
  const [products, setProducts] = useState(() =>
    sortProductsByWordOrder((initialProducts || []).map(normalizeProduct))
  );
  const [originalProducts, setOriginalProducts] = useState(() =>
    sortProductsByWordOrder((initialProducts || []).map(normalizeProduct))
  );
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [powerFilter, setPowerFilter] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_NEW_PRODUCT);

  useEffect(() => {
    const normalized = sortProductsByWordOrder((initialProducts || []).map(normalizeProduct));
    setProducts(normalized);
    setOriginalProducts(normalized);
  }, [initialProducts]);

  const visibleBaseProducts = useMemo(
    () => products.filter((item) => !item._deleted),
    [products]
  );

  const filterOptions = useMemo(() => {
    const brands = [...new Set(visibleBaseProducts.map((p) => p.marka).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
    const models = [...new Set(visibleBaseProducts.map((p) => p.model).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
    const powers = [...new Set(visibleBaseProducts.map((p) => p.guc_kw).filter(Boolean))].sort((a, b) => toNumber(a) - toNumber(b));
    return { brands, models, powers };
  }, [visibleBaseProducts]);

  const filteredProducts = useMemo(() => {
    const q = trKey(search);

    return sortProductsByWordOrder(
      visibleBaseProducts.filter((item) => {
        if (categoryFilter && item.kategori !== categoryFilter) return false;
        if (brandFilter && item.marka !== brandFilter) return false;
        if (modelFilter && item.model !== modelFilter) return false;
        if (powerFilter && String(item.guc_kw) !== String(powerFilter)) return false;

        if (!q) return true;

        const text = trKey([
          item.kategori,
          item.marka,
          item.model,
          item.alt_model,
          item.urun_adi,
          item.guc_kw,
        ].join(" "));

        return text.includes(q);
      })
    );
  }, [visibleBaseProducts, search, categoryFilter, brandFilter, modelFilter, powerFilter]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(products) !== JSON.stringify(originalProducts);
  }, [products, originalProducts]);

  function handleEdit(id) {
    setEditingId((prev) => (prev === id ? null : id));
  }

  function handleDelete(id) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, _deleted: true, _dirty: true } : item
      )
    );
    if (editingId === id) setEditingId(null);
  }

  function handleFieldChange(id, field, value) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? normalizeProduct({
              ...item,
              [field]: value,
              _dirty: true,
              _deleted: false,
              _isNew: item._isNew,
            })
          : item
      )
    );
  }

  function handleResetChanges() {
    const reverted = sortProductsByWordOrder(
      originalProducts.map((item) => ({ ...item, _deleted: false, _dirty: false }))
    );
    setProducts(reverted);
    setEditingId(null);
    setStatus("Değişiklikler geri alındı.");
  }

  function updateNewProduct(field, value) {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  }

  function addNewProduct() {
    if (!safeText(newProduct.marka) || !safeText(newProduct.model)) {
      setStatus("Yeni ürün için en az marka ve model gir.");
      return;
    }

    const tempId = `new-${Date.now()}`;
    const draft = normalizeProduct({
      ...newProduct,
      id: tempId,
      _isNew: true,
      _dirty: true,
    });

    setProducts((prev) => sortProductsByWordOrder([draft, ...prev]));
    setEditingId(tempId);
    setNewProduct(EMPTY_NEW_PRODUCT);
    setShowAdd(false);
    setStatus("Yeni ürün eklendi. Kaydet butonuna basmayı unutma.");
  }

  async function refreshProductsFromServer() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const json = await safeReadJson(res);

    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || "Güncel ürünler alınamadı.");
    }

    const normalized = sortProductsByWordOrder((json.products || []).map(normalizeProduct));
    setProducts(normalized);
    setOriginalProducts(normalized);
    setEditingId(null);
  }

  async function handleSaveChanges() {
    try {
      setSaving(true);
      setStatus("");

      const deletedIds = products
        .filter((item) => item._deleted && !item._isNew && item.id)
        .map((item) => item.id);

      const updatePayload = products
        .filter((item) => !item._isNew && !item._deleted && item._dirty)
        .map((item) => ({
          id: item.id,
          kategori: item.kategori,
          marka: item.marka,
          model: item.model,
          alt_model: item.alt_model,
          urun_adi: item.urun_adi,
          guc_kw: item.guc_kw,
          alis_fiyati: toNumber(item.alis_fiyati),
          montaj: toNumber(item.montaj),
          puan: toNumber(item.puan),
          fayda: toNumber(item.fayda),
          kampanya: toNumber(item.kampanya),
          nakit_carpani: toNumber(item.nakit_carpani),
          kart_komisyonu: toNumber(item.kart_komisyonu),
          aktif: !!item.aktif,
        }));

      const createPayload = products
        .filter((item) => item._isNew && !item._deleted)
        .map((item) => ({
          kategori: item.kategori,
          marka: item.marka,
          model: item.model,
          alt_model: item.alt_model,
          urun_adi: item.urun_adi,
          guc_kw: item.guc_kw,
          alis_fiyati: toNumber(item.alis_fiyati),
          montaj: toNumber(item.montaj),
          puan: toNumber(item.puan),
          fayda: toNumber(item.fayda),
          kampanya: toNumber(item.kampanya),
          nakit_carpani: toNumber(item.nakit_carpani),
          kart_komisyonu: toNumber(item.kart_komisyonu),
          aktif: !!item.aktif,
        }));

      if (deletedIds.length > 0) {
        const res = await fetch("/api/admin/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deletedIds }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Silme işlemi başarısız.");
      }

      if (createPayload.length > 0) {
        const res = await fetch("/api/admin/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: createPayload }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Yeni ürün ekleme başarısız.");
      }

      if (updatePayload.length > 0) {
        const res = await fetch("/api/admin/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: updatePayload }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Güncelleme başarısız.");
      }

      await refreshProductsFromServer();
      setStatus("Tüm değişiklikler kaydedildi.");
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    }
    window.location.href = "/";
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-hero">
          <div className="admin-hero-left">
            <img src="/logo.png" alt="Çataş Mühendislik" className="admin-logo" />
            <div>
              <h1>Yönetici Fiyat Paneli</h1>
              <p>Ürünleri düzenle, fiyatları kontrol et, personel ekranına anında yansıt.</p>
            </div>
          </div>

          <div className="admin-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={handleSaveChanges}
              disabled={saving || !hasChanges}
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>

            <button
              type="button"
              className="soft-btn"
              onClick={handleResetChanges}
              disabled={saving || !hasChanges}
            >
              Geri Al
            </button>

            <button type="button" className="soft-btn" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Yeni Ürünü Kapat" : "Yeni Ürün Ekle"}
            </button>

            <a href="/" className="soft-btn">Personel</a>

            <button type="button" className="danger-btn" onClick={handleLogout}>
              Çıkış
            </button>
          </div>
        </div>

        {status ? <div className="admin-status">{status}</div> : null}

        {showAdd ? (
          <section className="add-panel">
            <div className="add-grid">
              <select value={newProduct.kategori} onChange={(e) => updateNewProduct("kategori", e.target.value)}>
                {CATEGORY_ORDER.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>

              <input placeholder="Marka" value={newProduct.marka} onChange={(e) => updateNewProduct("marka", e.target.value)} />
              <input placeholder="Model" value={newProduct.model} onChange={(e) => updateNewProduct("model", e.target.value)} />
              <input placeholder="Güç" value={newProduct.guc_kw} onChange={(e) => updateNewProduct("guc_kw", e.target.value)} />
              <input type="number" placeholder="Alış" value={newProduct.alis_fiyati} onChange={(e) => updateNewProduct("alis_fiyati", e.target.value)} />
              <input type="number" placeholder="Montaj" value={newProduct.montaj} onChange={(e) => updateNewProduct("montaj", e.target.value)} />
              <input type="number" placeholder="Puan" value={newProduct.puan} onChange={(e) => updateNewProduct("puan", e.target.value)} />
              <input type="number" placeholder="Fayda" value={newProduct.fayda} onChange={(e) => updateNewProduct("fayda", e.target.value)} />

              <button type="button" className="primary-btn" onClick={addNewProduct}>
                Listeye Ekle
              </button>
            </div>
          </section>
        ) : null}

        <section className="filter-card">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Tüm Kategoriler</option>
            {CATEGORY_ORDER.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
            <option value="">Tüm Markalar</option>
            {filterOptions.brands.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
            <option value="">Tüm Modeller</option>
            {filterOptions.models.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={powerFilter} onChange={(e) => setPowerFilter(e.target.value)}>
            <option value="">Tüm Güçler</option>
            {filterOptions.powers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <input
            placeholder="Genel arama"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        <section className="table-card">
          <div className="table-top">
            <div>
              <h2>Ürün Listesi</h2>
              <p>{filteredProducts.length} ürün gösteriliyor</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Marka</th>
                  <th>Model</th>
                  <th>Güç</th>
                  <th>Alış</th>
                  <th>Montaj</th>
                  <th>Puan</th>
                  <th>Fayda</th>
                  <th>Kampanya</th>
                  <th>Nakit</th>
                  <th>Kart</th>
                  <th>Kâr</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id ?? `${product.marka}-${product.model}-${product.alt_model}`}
                    product={product}
                    editingId={editingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChange={handleFieldChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(0, 153, 153, 0.12), transparent 34%),
            linear-gradient(180deg, #eef6f7 0%, #f7fafc 45%, #eef3f5 100%);
          padding: 18px;
          color: #102033;
          font-family: Arial, sans-serif;
        }

        .admin-shell {
          max-width: 1540px;
          margin: 0 auto;
        }

        .admin-hero {
          background: linear-gradient(135deg, #ffffff 0%, #eefafb 100%);
          border: 1px solid #d8e8ed;
          border-radius: 22px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 14px 32px rgba(15, 55, 75, 0.08);
          margin-bottom: 12px;
        }

        .admin-hero-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-logo {
          width: 118px;
          height: auto;
          object-fit: contain;
          background: white;
          border-radius: 14px;
          padding: 6px;
          border: 1px solid #d8e8ed;
        }

        h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.4px;
        }

        p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .admin-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }

        button,
        a {
          text-decoration: none;
          font-family: inherit;
        }

        .primary-btn,
        .soft-btn,
        .danger-btn,
        .edit-btn,
        .delete-btn {
          border: 0;
          cursor: pointer;
          font-weight: 800;
          border-radius: 999px;
          white-space: nowrap;
        }

        .primary-btn {
          background: linear-gradient(135deg, #008c8c, #00a7a7);
          color: white;
          padding: 10px 15px;
          box-shadow: 0 10px 20px rgba(0, 140, 140, 0.24);
        }

        .soft-btn {
          background: #ffffff;
          color: #0f5f66;
          padding: 10px 13px;
          border: 1px solid #cfe4e9;
        }

        .danger-btn {
          background: #fff1f2;
          color: #e11d48;
          padding: 10px 13px;
          border: 1px solid #fecdd3;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .admin-status {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          border-radius: 14px;
          padding: 10px 14px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .add-panel,
        .filter-card,
        .table-card {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #dbe8ed;
          border-radius: 20px;
          box-shadow: 0 12px 28px rgba(15, 55, 75, 0.07);
          margin-bottom: 12px;
        }

        .add-panel {
          padding: 14px;
        }

        .add-grid {
          display: grid;
          grid-template-columns: repeat(9, minmax(100px, 1fr));
          gap: 9px;
          align-items: center;
        }

        .filter-card {
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(5, minmax(120px, 1fr));
          gap: 10px;
        }

        select,
        input {
          width: 100%;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #cbdbe4;
          background: white;
          padding: 0 9px;
          font-size: 12px;
          color: #102033;
          outline: none;
        }

        select:focus,
        input:focus {
          border-color: #00a7a7;
          box-shadow: 0 0 0 3px rgba(0, 167, 167, 0.12);
        }

        input:disabled,
        select:disabled {
          background: #f8fafc;
          color: #0f172a;
          opacity: 1;
          border-color: transparent;
        }

        .table-card {
          overflow: hidden;
        }

        .table-top {
          padding: 14px 16px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-top h2 {
          margin: 0;
          font-size: 18px;
        }

        .table-scroll {
          overflow-x: auto;
          padding: 0 10px 12px;
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 1260px;
          font-size: 12px;
        }

        .admin-table th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f1f8f9;
          color: #19384a;
          text-align: left;
          padding: 9px 8px;
          font-size: 12px;
          font-weight: 900;
          border-bottom: 1px solid #d8e8ed;
        }

        .admin-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #edf2f5;
          vertical-align: middle;
          background: white;
        }

        .admin-table tr:hover td {
          background: #f8fcfd;
        }

        .dirty-row td {
          background: #fffdf4;
        }

        .admin-table td:nth-child(1) {
          width: 120px;
        }

        .admin-table td:nth-child(2) {
          width: 110px;
        }

        .admin-table td:nth-child(3) {
          min-width: 220px;
        }

        .admin-table td:nth-child(4),
        .admin-table td:nth-child(5),
        .admin-table td:nth-child(6),
        .admin-table td:nth-child(7),
        .admin-table td:nth-child(8) {
          width: 82px;
        }

        .admin-table td:nth-child(9),
        .admin-table td:nth-child(10),
        .admin-table td:nth-child(11),
        .admin-table td:nth-child(12) {
          width: 92px;
        }

        .brand-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 5px 9px;
          font-weight: 900;
          background: #e0f7f5;
          color: #008c8c;
          border: 1px solid #b8ebe6;
          min-width: 72px;
        }

        .brand-demirdokum {
          background: #e8f1ff;
          color: #1264d8;
          border-color: #c8dcff;
        }

        .brand-baymak {
          background: #fff7ed;
          color: #ea580c;
          border-color: #fed7aa;
        }

        .brand-eca {
          background: #f1f5f9;
          color: #334155;
          border-color: #cbd5e1;
        }

        .money {
          font-weight: 950;
          text-align: right;
          white-space: nowrap;
        }

        .blue {
          color: #0b5cff;
        }

        .black {
          color: #020617;
        }

        .green {
          color: #00a13a;
        }

        .active-check {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 800;
          color: #334155;
        }

        .active-check input {
          width: 14px;
          height: 14px;
          accent-color: #f97316;
        }

        .action-cell {
          display: flex;
          gap: 6px;
        }

        .edit-btn {
          background: #ffffff;
          color: #0f5f66;
          border: 1px solid #cfe4e9;
          padding: 7px 10px;
          font-size: 11px;
        }

        .delete-btn {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          padding: 7px 9px;
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .admin-hero {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-actions {
            justify-content: flex-start;
          }

          .filter-card {
            grid-template-columns: 1fr;
          }

          .add-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}
