"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatePricing, formatTL } from "../lib/pricing";

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

  const normalized = String(value)
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function safeCalculatePricing(product) {
  try {
    return calculatePricing(product || {});
  } catch (error) {
    console.error("Pricing error:", product, error);
    return {
      alis: 0,
      montaj: 0,
      puan: 0,
      fayda: 0,
      netMaliyet: 0,
      net_bedel: 0,
      nakit: 0,
      kart: 0,
      kampanya: 0,
      kar: 0,
      nakitCarpani: 0,
      kartKomisyon: 0,
    };
  }
}

const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];

const BRAND_ORDER = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Şofben: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Daxom"],
  "Elektrikli Kombi": ["Daxom", "ECA"],
};

const MODEL_ORDER = {
  "Kombi|Vaillant": [
    "ecoTEC Intro 24/24",
    "ecoTEC Intro 28/28",
    "ecoTEC Pure 236/7-2",
    "ecoTEC Pure 286/7-2",
    "ecoTEC Pro 236/5-3",
    "ecoTEC Pro 286/5-3",
    "ecoTEC Plus 26 CS/1-5",
    "ecoTEC Plus 32 CS/1-5",
    "ecoTEC Plus 36 CS/1-5",
    "ecoTEC Plus 40 CS/1-5",
  ],
  "Kombi|Demirdöküm": [
    "Ademix 24/24",
    "Ademix 28/28",
    "Nitromix 24",
    "Nitromix 28",
    "Nitromix 35",
    "Nitromix Ioni 24",
    "Nitromix Ioni 28",
    "Nitromix Ioni 35",
  ],
  "Kombi|Baymak": [
    "Lunatec 24 F",
    "Lunatec 30 F",
    "Lunatec 35 F",
    "Duotec 24 F",
    "Duotec 30 F",
    "Duotec 33",
    "Duotec 42",
    "Duotec 45",
    "Duotec 42 DWH",
  ],
  "Kombi|ECA": [
    "Citius Premix 20",
    "Citius Premix 24",
    "Citius Premix 28",
    "Proteus Premix 24",
    "Proteus Premix 28",
    "Proteus Premix 30",
    "Proteus Premix 35",
    "Proteus Premix 42",
    "Proteus Premix 45",
    "Proteus Premix 35 HST",
    "Proteus Premix 45 HST",
    "Cofeo Premix 24",
    "Cofeo Premix 30",
    "Cofeo Premix 35",
    "Confeo Premix 24",
    "Confeo Premix 30",
    "Confeo Premix 35",
  ],
  "Kombi|Protherm": [
    "Puma Condens 18/24",
    "Puma Condens 28/28",
    "Lynx Condens 24",
    "Lynx Condens 28",
  ],
  "Klima|Vaillant": [
    "Elegant Plus 9.000 BTU",
    "Elegant Plus 12.000 BTU",
    "Elegant Plus 18.000 BTU",
    "Elegant Plus 24.000 BTU",
  ],
  "Klima|Demirdöküm": [
    "Kion 9.000 BTU",
    "Kion 12.000 BTU",
    "Kion 18.000 BTU",
    "Kion 24.000 BTU",
  ],
  "Klima|Baymak": [
    "VAIB 025 Pro 12000 BTU",
    "VAIB 025 Pro 18000 BTU",
    "VAIB 025 Pro 24000 BTU",
  ],
  "Klima|ECA": [
    "Spaylos Pro 9.000 BTU",
    "Spaylos Pro 12.000 BTU",
    "Spaylos Pro 15.000 BTU",
    "Spaylos Pro 18.000 BTU",
    "Spaylos Pro 24.000 BTU",
    "Ecotech 9.000 BTU",
    "Ecotech 12.000 BTU",
    "Ecotech 18.000 BTU",
    "Ecotech 24.000 BTU",
    "Niobe 12.000 BTU",
    "Niobe 18.000 BTU",
  ],
  "Şofben|Vaillant": ["Vaillant MAG.12", "Vaillant MAG.14"],
  "Şofben|Demirdöküm": ["Demirdöküm F.11", "Demirdöküm F.14"],
  "Şofben|Baymak": ["Baymak BH 12 LN", "Baymak BH 14 LN"],
  "Şofben|ECA": ["ECA Phonenix.11"],
  "Şofben|Daxom": ["Daxom UDAX.12", "Daxom UDAX.14"],
  "Elektrikli Kombi|Daxom": ["Daxom 10 EDM", "Daxom 12 EDM", "Daxom 16 EDM", "Daxom 18 EDM"],
  "Elektrikli Kombi|ECA": [
    "ECA Arceus 12 MN TR",
    "ECA Arceus 15 MN TR",
    "ECA Arceus 18 MN TR",
    "ECA Arceus 24 MN TR",
    "ECA Arceus 27 MN TR",
  ],
};

const EMPTY_NEW_PRODUCT = {
  kategori: "Kombi",
  marka: "Vaillant",
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
  if (key === "sofben" || key === "şofben") return "Şofben";
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

    const aCatIndex = CATEGORY_ORDER.indexOf(aCategory);
    const bCatIndex = CATEGORY_ORDER.indexOf(bCategory);

    const aCatOrder = aCatIndex === -1 ? 999 : aCatIndex;
    const bCatOrder = bCatIndex === -1 ? 999 : bCatIndex;

    if (aCatOrder !== bCatOrder) return aCatOrder - bCatOrder;

    const brandList = BRAND_ORDER[aCategory] || [];
    const brandCmp = compareWithOrder(a?.marka, b?.marka, brandList);
    if (brandCmp !== 0) return brandCmp;

    const key = `${aCategory}|${safeText(a?.marka)}`;
    const modelList = MODEL_ORDER[key] || [];
    return compareWithOrder(buildModelName(a), buildModelName(b), modelList);
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
    guc_kw: safeText(product?.guc_kw ?? product?.kw),
    alis_fiyati: toNumber(product?.alis_fiyati ?? product?.alis),
    montaj: toNumber(product?.montaj ?? product?.montaj_maliyeti),
    puan: toNumber(product?.puan),
    fayda: toNumber(product?.fayda),
    kampanya: toNumber(product?.kampanya),
    nakit_carpani: toNumber(product?.nakit_carpani),
    kart_komisyonu: toNumber(product?.kart_komisyonu),
    aktif: product?.aktif !== false && product?.active !== false,
    _deleted: false,
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

function ProductRow({
  product,
  editingId,
  onEdit,
  onDelete,
  onChange,
}) {
  const isEditing = editingId === product.id;
  const pricing = safeCalculatePricing(product);

  return (
    <div className={`admin-product-row ${product._deleted ? "is-deleted" : ""}`}>
      <div className="admin-row-top">
        <div className="admin-row-title">
          <strong>{safeText(product.marka)}</strong>
          <span>{buildModelName(product) || "-"}</span>
        </div>

        <div className="admin-row-actions">
          <button
            type="button"
            className="admin-mini-btn"
            onClick={() => onEdit(product.id)}
          >
            {isEditing ? "Düzenlemeyi Kapat" : "Düzenle"}
          </button>

          <button
            type="button"
            className="admin-mini-btn admin-mini-btn-danger"
            onClick={() => onDelete(product.id)}
          >
            Sil
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <div>
          <label>Kategori</label>
          <select
            value={product.kategori}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "kategori", e.target.value)}
          >
            {CATEGORY_ORDER.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Marka</label>
          <input
            value={product.marka}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "marka", e.target.value)}
          />
        </div>

        <div>
          <label>Model</label>
          <input
            value={product.model}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "model", e.target.value)}
          />
        </div>

        <div>
          <label>Alt Model</label>
          <input
            value={product.alt_model}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "alt_model", e.target.value)}
          />
        </div>

        <div>
          <label>Ürün Adı</label>
          <input
            value={product.urun_adi}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "urun_adi", e.target.value)}
          />
        </div>

        <div>
          <label>Güç (kW)</label>
          <input
            value={product.guc_kw}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "guc_kw", e.target.value)}
          />
        </div>

        <div>
          <label>Alış Fiyatı</label>
          <input
            type="number"
            value={product.alis_fiyati}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "alis_fiyati", e.target.value)}
          />
        </div>

        <div>
          <label>Montaj</label>
          <input
            type="number"
            value={product.montaj}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "montaj", e.target.value)}
          />
        </div>

        <div>
          <label>Puan</label>
          <input
            type="number"
            value={product.puan}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "puan", e.target.value)}
          />
        </div>

        <div>
          <label>Fayda</label>
          <input
            type="number"
            value={product.fayda}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "fayda", e.target.value)}
          />
        </div>

        <div>
          <label>Nakit Çarpanı (%)</label>
          <input
            type="number"
            value={product.nakit_carpani}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "nakit_carpani", e.target.value)}
          />
        </div>

        <div>
          <label>Kart Komisyonu (%)</label>
          <input
            type="number"
            value={product.kart_komisyonu}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "kart_komisyonu", e.target.value)}
          />
        </div>

        <div>
          <label>Kampanya</label>
          <input
            type="number"
            value={product.kampanya}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "kampanya", e.target.value)}
          />
        </div>

        <div>
          <label>Aktif</label>
          <input
            type="checkbox"
            checked={!!product.aktif}
            disabled={!isEditing}
            onChange={(e) => onChange(product.id, "aktif", e.target.checked)}
          />
        </div>
      </div>

      <div className="admin-price-preview">
        <span>Net Bedel: <strong>{formatTL(pricing.netMaliyet)}</strong></span>
        <span>Nakit: <strong>{formatTL(pricing.nakit)}</strong></span>
        <span>Kart: <strong>{formatTL(pricing.kart)}</strong></span>
        <span>Kar: <strong>{formatTL(pricing.kar)}</strong></span>
      </div>
    </div>
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
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_NEW_PRODUCT);

  useEffect(() => {
    const normalized = sortProductsByWordOrder((initialProducts || []).map(normalizeProduct));
    setProducts(normalized);
    setOriginalProducts(normalized);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const q = trKey(search);

    const list = products.filter((item) => !item._deleted);

    if (!q) return sortProductsByWordOrder(list);

    return sortProductsByWordOrder(
      list.filter((item) => {
        const text = trKey(
          [
            item.kategori,
            item.marka,
            item.model,
            item.alt_model,
            item.urun_adi,
            item.guc_kw,
          ].join(" ")
        );

        return text.includes(q);
      })
    );
  }, [products, search]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(products) !== JSON.stringify(originalProducts);
  }, [products, originalProducts]);

  function handleEdit(id) {
    setEditingId((prev) => (prev === id ? null : id));
  }

  function handleDelete(id) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, _deleted: true, _dirty: true }
          : item
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
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    setStatus("Yeni ürün eklendi. Kaydet butonuna basmayı unutma.");
  }

  async function refreshProductsFromServer() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const json = await safeReadJson(res);

    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || "Güncel ürünler alınamadı.");
    }

    const normalized = sortProductsByWordOrder(
      (json.products || []).map(normalizeProduct)
    );

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
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Silme işlemi başarısız.");
        }
      }

      if (createPayload.length > 0) {
        const res = await fetch("/api/admin/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: createPayload }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Yeni ürün ekleme başarısız.");
        }
      }

      if (updatePayload.length > 0) {
        const res = await fetch("/api/admin/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: updatePayload }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Güncelleme başarısız.");
        }
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
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <img src="/logo.png" alt="Çataş Mühendislik" className="admin-logo-small" />
          <div className="admin-heading">
            <h1>Yönetici Paneli</h1>
            <p>Ürün düzenleme, silme, ekleme ve sıralama ekranı</p>
          </div>
        </div>

        <div className="admin-topbar-right">
          <button
            type="button"
            className="admin-main-btn"
            onClick={handleSaveChanges}
            disabled={saving || !hasChanges}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>

          <button
            type="button"
            className="admin-mini-btn"
            onClick={handleResetChanges}
            disabled={saving || !hasChanges}
          >
            Değişiklikleri Geri Al
          </button>

          <a href="/" className="admin-mini-btn">
            Personel Görünümüne Dön
          </a>

          <button
            type="button"
            className="admin-mini-btn admin-mini-btn-danger"
            onClick={handleLogout}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {status ? <div className="admin-status">{status}</div> : null}

      <section className="admin-add-box">
        <h2>Yeni Ürün Ekle</h2>

        <div className="admin-grid">
          <div>
            <label>Kategori</label>
            <select
              value={newProduct.kategori}
              onChange={(e) => updateNewProduct("kategori", e.target.value)}
            >
              {CATEGORY_ORDER.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Marka</label>
            <input
              value={newProduct.marka}
              onChange={(e) => updateNewProduct("marka", e.target.value)}
            />
          </div>

          <div>
            <label>Model</label>
            <input
              value={newProduct.model}
              onChange={(e) => updateNewProduct("model", e.target.value)}
            />
          </div>

          <div>
            <label>Alt Model</label>
            <input
              value={newProduct.alt_model}
              onChange={(e) => updateNewProduct("alt_model", e.target.value)}
            />
          </div>

          <div>
            <label>Ürün Adı</label>
            <input
              value={newProduct.urun_adi}
              onChange={(e) => updateNewProduct("urun_adi", e.target.value)}
            />
          </div>

          <div>
            <label>Güç (kW)</label>
            <input
              value={newProduct.guc_kw}
              onChange={(e) => updateNewProduct("guc_kw", e.target.value)}
            />
          </div>

          <div>
            <label>Alış Fiyatı</label>
            <input
              type="number"
              value={newProduct.alis_fiyati}
              onChange={(e) => updateNewProduct("alis_fiyati", e.target.value)}
            />
          </div>

          <div>
            <label>Montaj</label>
            <input
              type="number"
              value={newProduct.montaj}
              onChange={(e) => updateNewProduct("montaj", e.target.value)}
            />
          </div>

          <div>
            <label>Puan</label>
            <input
              type="number"
              value={newProduct.puan}
              onChange={(e) => updateNewProduct("puan", e.target.value)}
            />
          </div>

          <div>
            <label>Fayda</label>
            <input
              type="number"
              value={newProduct.fayda}
              onChange={(e) => updateNewProduct("fayda", e.target.value)}
            />
          </div>

          <div>
            <label>Nakit Çarpanı (%)</label>
            <input
              type="number"
              value={newProduct.nakit_carpani}
              onChange={(e) => updateNewProduct("nakit_carpani", e.target.value)}
            />
          </div>

          <div>
            <label>Kart Komisyonu (%)</label>
            <input
              type="number"
              value={newProduct.kart_komisyonu}
              onChange={(e) => updateNewProduct("kart_komisyonu", e.target.value)}
            />
          </div>

          <div>
            <label>Kampanya</label>
            <input
              type="number"
              value={newProduct.kampanya}
              onChange={(e) => updateNewProduct("kampanya", e.target.value)}
            />
          </div>

          <div>
            <label>Aktif</label>
            <input
              type="checkbox"
              checked={!!newProduct.aktif}
              onChange={(e) => updateNewProduct("aktif", e.target.checked)}
            />
          </div>
        </div>

        <div className="admin-add-actions">
          <button type="button" className="admin-main-btn" onClick={addNewProduct}>
            Yeni Ürünü Listeye Ekle
          </button>
        </div>
      </section>

      <section className="admin-list-box">
        <div className="admin-list-top">
          <h2>Ürünler</h2>

          <input
            className="admin-search-input"
            placeholder="Kategori / Marka / Model ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-products-list">
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
        </div>
      </section>
    </main>
  );
}
