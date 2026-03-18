"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchItems() {
    const res = await fetch("/api/admin/items", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setItems(json.items || []);
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Giriş başarısız.");
      return;
    }

    setPassword("");
    setMessage("Giriş başarılı.");
    await fetchItems();
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setIsAuthed(false);
    setItems([]);
    setMessage("Çıkış yapıldı.");
  }

  async function handleSave(item) {
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Kaydedilemedi.");
      return;
    }

    setMessage(item.model + " güncellendi.");
    await fetchItems();
  }

  function updateLocal(id, field, value) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  const grouped = useMemo(() => {
    const out = {};
    for (const item of items) {
      if (!out[item.category]) out[item.category] = {};
      const brandKey = item.brand || "Diğer";
      if (!out[item.category][brandKey]) out[item.category][brandKey] = [];
      out[item.category][brandKey].push(item);
    }
    return out;
  }, [items]);

  if (!isAuthed) {
    return (
      <main className="page">
        <div className="logoWrap">
          <img src="/logo.png" alt="Çataş Mühendislik" />
        </div>

        <div className="loginBox">
          <h1 className="title">Yönetici Girişi</h1>
          <p className="subtitle">Fiyatları sadece sen düzenlersin. Personel sadece ana sayfayı görür.</p>
          {message && <div className="notice">{message}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder="Yönetici şifresi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btnPrimary" type="submit">Giriş Yap</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="topBar">
        <div className="pill">Yönetici paneli</div>
        <button className="btn btnGhost" onClick={handleLogout}>Çıkış Yap</button>
      </div>

      <div className="logoWrap">
        <img src="/logo.png" alt="Çataş Mühendislik" />
      </div>

      <div className="adminBox">
        <h1 className="title">Fiyat Düzenleme</h1>
        <p className="subtitle">Burada yaptığın değişiklikler çalışanların telefonunda anında görünür.</p>
        {message && <div className="notice">{message}</div>}
        {error && <div className="error">{error}</div>}

        {Object.entries(grouped).map(([category, brands]) => (
          <section key={category} className="section">
            <h2 className="sectionTitle">{category}</h2>

            {Object.entries(brands).map(([brand, brandItems]) => (
              <div key={brand} style={{ marginBottom: 12 }}>
                {brand !== "Diğer" && <h3 className="brandTitle">{brand}</h3>}

                {brandItems.map((item) => (
                  <div className="row" key={item.id}>
                    <div className="grid">
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.model}</div>
                        <div className="muted">{item.category}{item.brand ? " / " + item.brand : ""}</div>
                      </div>

                      <input
                        type="number"
                        value={item.cash_price ?? ""}
                        onChange={(e) => updateLocal(item.id, "cash_price", e.target.value)}
                        placeholder="Nakit fiyat"
                      />

                      <input
                        type="number"
                        value={item.card_price ?? ""}
                        onChange={(e) => updateLocal(item.id, "card_price", e.target.value)}
                        placeholder="Kart fiyat"
                      />

                      <button
                        className="btn btnSecondary"
                        disabled={loading}
                        onClick={() => handleSave(item)}
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
