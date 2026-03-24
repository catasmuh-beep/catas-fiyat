"use client";

import { useEffect, useMemo, useState } from "react";

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function recalculateProduct(product = {}) {
  const alis = toNumber(product.alis_fiyati);
  const montaj = toNumber(product.montaj_maliyeti);
  const puan = toNumber(product.puan);
  const fayda = toNumber(product.fayda);

  const nakitCarpani = toNumber(
    product.nakit_carpani ?? product.nakitCarpani ?? 0
  );

  const kartKomisyon = toNumber(
    product.kart_komisyon ??
      product.kart_komisyonu ??
      product.kartKomisyon ??
      0
  );

  const kampanya = toNumber(
    product.kampanya ?? product.kampanya_fiyati ?? 0
  );

  // Mevcut yapıyı bozmadan: net bedel alış + montaj
  const netBedel = alis + montaj;

  // Kampanya varsa nakit onu baz alsın, yoksa çarpanlı hesaplansın
  const nakit =
    kampanya > 0
      ? Math.round(kampanya)
      : Math.round(netBedel * (1 + nakitCarpani / 100));

  const kart = Math.round(nakit * (1 + kartKomisyon / 100));

  // Mevcut mantığa sadık: kar hesabında puan ve fayda pozitif katkı
  const kar = Math.max(0, nakit - netBedel + puan + fayda);

  return {
    ...product,
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    net_bedel: netBedel,
    nakit_carpani: nakitCarpani,
    kart_komisyon: kartKomisyon,
    nakit,
    kart,
    kar,
    kampanya,
    aktif: Boolean(product.aktif),
  };
}

function normalizeProduct(product = {}) {
  return {
    id: product.id,
    kategori: product.kategori || "",
    marka: product.marka || "",
    model: product.model || "",
    alt_model_guc:
      product.alt_model_guc || product.alt_model || product.guc || "",
    ...recalculateProduct(product),
  };
}

function emptyNewProduct() {
  return {
    kategori: "",
    marka: "",
    model: "",
    alt_model_guc: "",
    alis_fiyati: "",
    montaj_maliyeti: "",
    puan: "",
    fayda: "",
    aktif: true,
  };
}

export default function AdminClient({ initialProducts = [] }) {
  const [products, setProducts] = useState(
    Array.isArray(initialProducts) ? initialProducts.map(normalizeProduct) : []
  );
  const [newProduct, setNewProduct] = useState(emptyNewProduct());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchKategori, setSearchKategori] = useState("");
  const [searchMarka, setSearchMarka] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (Array.isArray(initialProducts)) {
      setProducts(initialProducts.map(normalizeProduct));
    }
  }, [initialProducts]);

  function updateProduct(id, field, value) {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? normalizeProduct({
              ...item,
              [field]: field === "aktif" ? value : value,
            })
          : item
      )
    );
  }

  function updateNewProduct(field, value) {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function addNewProduct() {
    setMessage("");

    if (
      !newProduct.kategori.trim() ||
      !newProduct.marka.trim() ||
      !newProduct.model.trim()
    ) {
      setMessage("Kategori, marka ve model alanları zorunludur.");
      return;
    }

    try {
      setSaving(true);

     const calculated = recalculateProduct({
  kategori: newProduct.kategori.trim(),
  marka: newProduct.marka.trim(),
  model: newProduct.model.trim(),
  alt_model_guc: newProduct.alt_model_guc.trim(),

  alis_fiyati: newProduct.alis_fiyati,
  montaj_maliyeti: newProduct.montaj_maliyeti,
  puan: newProduct.puan,
  fayda: newProduct.fayda,

  // Hesaplama için gerekli varsayılan değerler
  nakit_carpani: 9,
  kart_komisyonu: 18,
  kampanya_fiyati: 0,

  aktif: Boolean(newProduct.aktif),
});

      const payload = {
        kategori: newProduct.kategori.trim(),
        marka: newProduct.marka.trim(),
        model: newProduct.model.trim(),
        alt_model_guc: newProduct.alt_model_guc.trim(),

        alis_fiyati: calculated.alis_fiyati,
        montaj_maliyeti: calculated.montaj_maliyeti,
        puan: calculated.puan,
        fayda: calculated.fayda,

        net_bedel: calculated.net_bedel,
        nakit_carpani: calculated.nakit_carpani,
        kart_komisyon: calculated.kart_komisyon,
        nakit: calculated.nakit,
        kart: calculated.kart,
        kar: calculated.kar,
        kampanya: calculated.kampanya,

        aktif: calculated.aktif,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          action: "create",
          product: payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Yeni ürün eklenemedi.");
      }

      if (data?.product) {
        setProducts((prev) => [...prev, normalizeProduct(data.product)]);
      }

      setNewProduct(emptyNewProduct());
      setMessage("Yeni ürün başarıyla eklendi.");
    } catch (error) {
      setMessage(error.message || "Yeni ürün eklenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAllChanges() {
    setMessage("");

    try {
      setSaving(true);

      const payloadProducts = products.map((item) => {
        const calculated = recalculateProduct(item);

        return {
          id: item.id,
          kategori: item.kategori,
          marka: item.marka,
          model: item.model,
          alt_model_guc: item.alt_model_guc,
          alis_fiyati: calculated.alis_fiyati,
          montaj_maliyeti: calculated.montaj_maliyeti,
          puan: calculated.puan,
          fayda: calculated.fayda,
          net_bedel: calculated.net_bedel,
          nakit_carpani: calculated.nakit_carpani,
          kart_komisyon: calculated.kart_komisyon,
          nakit: calculated.nakit,
          kart: calculated.kart,
          kar: calculated.kar,
          kampanya: calculated.kampanya,
          aktif: Boolean(calculated.aktif),
        };
      });

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          products: payloadProducts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Değişiklikler kaydedilemedi.");
      }

      if (Array.isArray(data?.products)) {
        setProducts(data.products.map(normalizeProduct));
      } else {
        setProducts(payloadProducts.map(normalizeProduct));
      }

      setMessage("Tüm değişiklikler kaydedildi.");
    } catch (error) {
      setMessage(error.message || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    setProducts(
      Array.isArray(initialProducts) ? initialProducts.map(normalizeProduct) : []
    );
    setNewProduct(emptyNewProduct());
    setMessage("Değişiklikler geri alındı.");
  }

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const okKategori = !searchKategori || item.kategori === searchKategori;
      const okMarka = !searchMarka || item.marka === searchMarka;
      const okModel = !searchModel || item.model === searchModel;

      const q = searchText.trim().toLocaleLowerCase("tr");
      const haystack =
        `${item.kategori} ${item.marka} ${item.model} ${item.alt_model_guc}`.toLocaleLowerCase("tr");

      const okText = !q || haystack.includes(q);

      return okKategori && okMarka && okModel && okText;
    });
  }, [products, searchKategori, searchMarka, searchModel, searchText]);

  const kategoriler = [...new Set(products.map((x) => x.kategori).filter(Boolean))];
  const markalar = [...new Set(products.map((x) => x.marka).filter(Boolean))];
  const modeller = [...new Set(products.map((x) => x.model).filter(Boolean))];

  return (
    <div className="admin-client-page">
      <div className="admin-top-actions">
        <button className="save-all-btn" onClick={saveAllChanges} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
        </button>

        <button className="ghost-btn" onClick={resetChanges} disabled={saving}>
          Değişiklikleri Geri Al
        </button>

        <a className="outline-btn" href="/">
          Personel görünümüne dön
        </a>

        <a className="logout-btn" href="/api/admin/logout">
          Çıkış
        </a>
      </div>

      {message ? <div className="admin-message">{message}</div> : null}

      <div className="new-product-section">
        <h3>Yeni ürün ekle</h3>

        <div className="new-product-grid">
          <input
            type="text"
            placeholder="Kategori"
            value={newProduct.kategori}
            onChange={(e) => updateNewProduct("kategori", e.target.value)}
          />

          <input
            type="text"
            placeholder="Marka"
            value={newProduct.marka}
            onChange={(e) => updateNewProduct("marka", e.target.value)}
          />

          <input
            type="text"
            placeholder="Model"
            value={newProduct.model}
            onChange={(e) => updateNewProduct("model", e.target.value)}
          />

          <input
            type="text"
            placeholder="Alt model / güç"
            value={newProduct.alt_model_guc}
            onChange={(e) => updateNewProduct("alt_model_guc", e.target.value)}
          />

          <input
            type="number"
            placeholder="Alış"
            value={newProduct.alis_fiyati}
            onChange={(e) => updateNewProduct("alis_fiyati", e.target.value)}
          />

          <input
            type="number"
            placeholder="Montaj Maliyeti"
            value={newProduct.montaj_maliyeti}
            onChange={(e) => updateNewProduct("montaj_maliyeti", e.target.value)}
          />

          <input
            type="number"
            placeholder="Puan"
            value={newProduct.puan}
            onChange={(e) => updateNewProduct("puan", e.target.value)}
          />

          <input
            type="number"
            placeholder="Fayda"
            value={newProduct.fayda}
            onChange={(e) => updateNewProduct("fayda", e.target.value)}
          />
        </div>

        <div className="new-product-bottom">
          <label className="active-checkbox">
            <span>Aktif</span>
            <input
              type="checkbox"
              checked={newProduct.aktif}
              onChange={(e) => updateNewProduct("aktif", e.target.checked)}
            />
          </label>

          <button className="add-product-btn" onClick={addNewProduct} disabled={saving}>
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <select value={searchKategori} onChange={(e) => setSearchKategori(e.target.value)}>
          <option value="">Tüm kategoriler</option>
          {kategoriler.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={searchMarka} onChange={(e) => setSearchMarka(e.target.value)}>
          <option value="">Tüm markalar</option>
          {markalar.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={searchModel} onChange={(e) => setSearchModel(e.target.value)}>
          <option value="">Tüm modeller</option>
          {modeller.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ara: model / güç / marka"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="admin-products-list">
        {filteredProducts.map((item) => (
          <div key={item.id} className="admin-product-row">
            <div className="admin-product-title">
              {item.kategori} / {item.marka} / {item.model} {item.alt_model_guc}
            </div>

            <div className="admin-product-grid">
              <input
                type="number"
                value={item.alis_fiyati}
                onChange={(e) => updateProduct(item.id, "alis_fiyati", e.target.value)}
              />
              <input
                type="number"
                value={item.montaj_maliyeti}
                onChange={(e) => updateProduct(item.id, "montaj_maliyeti", e.target.value)}
              />
              <input
                type="number"
                value={item.puan}
                onChange={(e) => updateProduct(item.id, "puan", e.target.value)}
              />
              <input
                type="number"
                value={item.fayda}
                onChange={(e) => updateProduct(item.id, "fayda", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
