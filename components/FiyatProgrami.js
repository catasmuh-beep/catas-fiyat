"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSections, formatTL, recalcItem } from "@/lib/utils";
import { fetchItems, persistItems } from "@/lib/data-source";

const defaultFilters = {
  search: "",
  section: "all"
};

export default function FiyatProgrami() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("local");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [exportUrl, setExportUrl] = useState("");

  useEffect(() => {
    async function load() {
      const result = await fetchItems();
      setItems(result.items);
      setMode(result.mode);
      setSelectedId(result.items[0]?.id || "");
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setExportUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [items]);

  const sections = useMemo(() => buildSections(items), [items]);

  const filteredSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesSearch = `${item.brand} ${item.model} ${item.category}`
            .toLowerCase()
            .includes(filters.search.toLowerCase());
          const matchesSection = filters.section === "all" || section.key === filters.section;
          return matchesSearch && matchesSection;
        })
      }))
      .filter((section) => section.items.length);
  }, [filters, sections]);

  const selectedItem = items.find((item) => item.id === selectedId) || items[0];

  function handleLogin(event) {
    event.preventDefault();
    if (!adminPassword.trim()) {
      setStatus("Yönetici şifresi giriniz.");
      return;
    }
    setAdminLoggedIn(true);
    setStatus("Yönetici modu açıldı.");
  }

  function updateItemField(field, value) {
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? recalcItem({
              ...item,
              [field]: Number(value || 0)
            })
          : item
      )
    );
  }

  async function handleSave() {
    setStatus("Kaydediliyor...");
    const response = await fetch("/api/prices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword
      },
      body: JSON.stringify({ items })
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload.mode === "supabase") {
        setMode("supabase");
        setStatus("Fiyatlar ortak veritabanına kaydedildi.");
      } else {
        await persistItems(items);
        setMode("local");
        setStatus("Fiyatlar bu cihazın tarayıcısına kaydedildi.");
      }
      return;
    }

    await persistItems(items);
    setMode("local");
    setStatus("Sunucu kaydı yapılamadı. Veriler bu cihazda saklandı.");
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Geçersiz veri");
        const nextItems = parsed.map(recalcItem);
        setItems(nextItems);
        setSelectedId(nextItems[0]?.id || "");
        setStatus("JSON içeri aktarıldı. Kaydet ile yayınlayabilirsiniz.");
      } catch {
        setStatus("JSON dosyası okunamadı.");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  if (loading) {
    return <div className="loading">Fiyat programı yükleniyor...</div>;
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <span className="badge">Çataş Fiyat Programı</span>
          <h1>Personel için okunabilir, yönetici için düzenlenebilir fiyat paneli</h1>
          <p>
            Bu sürüm; Vaillant, Demirdöküm, Protherm, ECA, Baykan kombiler ile
            elektrikli kombi, şofben ve klima fiyat listelerini tek ekranda toplar.
          </p>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <strong>Sistem modu</strong>
            <span className={mode === "supabase" ? "mode live" : "mode local"}>
              {mode === "supabase" ? "Ortak veritabanı aktif" : "Yerel kayıt modu"}
            </span>
          </div>
          <p>
            Ortak güncelleme için Supabase bağlanır. Supabase yoksa veriler yalnızca sizin
            kullandığınız tarayıcıda saklanır.
          </p>
          <button className="primary-btn" onClick={() => setAdminOpen((v) => !v)}>
            {adminOpen ? "Yönetici panelini kapat" : "Yönetici panelini aç"}
          </button>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="text"
          placeholder="Marka veya model ara..."
          value={filters.search}
          onChange={(event) => setFilters((s) => ({ ...s, search: event.target.value }))}
        />
        <select
          value={filters.section}
          onChange={(event) => setFilters((s) => ({ ...s, section: event.target.value }))}
        >
          <option value="all">Tüm listeler</option>
          {sections.map((section) => (
            <option key={section.key} value={section.key}>
              {section.title} / {section.subtitle}
            </option>
          ))}
        </select>
        <a className="ghost-btn" href={exportUrl} download="catas-fiyat-yedek.json">
          JSON yedek indir
        </a>
      </section>

      {adminOpen && (
        <section className="admin-panel">
          {!adminLoggedIn ? (
            <form onSubmit={handleLogin} className="admin-login">
              <h2>Yönetici girişi</h2>
              <p>
                Bu alan sadece fiyat düzenlemek içindir. Personel fiyatları görür ama
                değiştirmez.
              </p>
              <input
                type="password"
                placeholder="Yönetici şifresi"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
              />
              <button className="primary-btn" type="submit">
                Giriş yap
              </button>
            </form>
          ) : (
            <div className="admin-editor">
              <div className="admin-head">
                <div>
                  <h2>Yönetici düzenleme paneli</h2>
                  <p>Kaydetmeden yapılan değişiklikler çalışanlara yansımaz.</p>
                </div>
                <div className="admin-actions">
                  <label className="file-btn">
                    JSON içe aktar
                    <input type="file" accept="application/json" onChange={handleImport} />
                  </label>
                  <button className="primary-btn" onClick={handleSave}>
                    Kaydet ve yayınla
                  </button>
                </div>
              </div>

              <div className="editor-grid">
                <div className="editor-select">
                  <label>Ürün seç</label>
                  <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.brand} - {item.model}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <>
                    <div className="field">
                      <label>Alış fiyatı</label>
                      <input
                        type="number"
                        value={selectedItem.alisFiyat}
                        onChange={(e) => updateItemField("alisFiyat", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Puan ₺</label>
                      <input
                        type="number"
                        value={selectedItem.puan}
                        onChange={(e) => updateItemField("puan", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Fayda ₺</label>
                      <input
                        type="number"
                        value={selectedItem.fayda}
                        onChange={(e) => updateItemField("fayda", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Montaj maliyeti</label>
                      <input
                        type="number"
                        value={selectedItem.montajMaliyet}
                        onChange={(e) => updateItemField("montajMaliyet", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {selectedItem && (
                <div className="summary-grid">
                  <div className="summary-card">
                    <span>Net bedel</span>
                    <strong>{formatTL(selectedItem.netBedel)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Nakit satış</span>
                    <strong>{formatTL(selectedItem.nakitSatis)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Kart satış</span>
                    <strong>{formatTL(selectedItem.kartSatis)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Kâr</span>
                    <strong>{formatTL(selectedItem.kar)}</strong>
                  </div>
                </div>
              )}

              {status && <p className="status-text">{status}</p>}
            </div>
          )}
        </section>
      )}

      <section className="section-list">
        {filteredSections.map((section) => (
          <article key={section.key} className="brand-card">
            <div className="brand-header">
              <div>
                <span>{section.subtitle}</span>
                <h2>{section.title}</h2>
              </div>
              <div className="count-pill">{section.items.length} ürün</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Alış</th>
                    <th>Net Bedel</th>
                    <th>Nakit Satış</th>
                    <th>Kart Satış</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="model-cell">
                          <strong>{item.model}</strong>
                          <span>{item.brand}</span>
                        </div>
                      </td>
                      <td>{formatTL(item.alisFiyat)}</td>
                      <td>{formatTL(item.netBedel)}</td>
                      <td className="price-highlight">{formatTL(item.nakitSatis)}</td>
                      <td>{formatTL(item.kartSatis)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}