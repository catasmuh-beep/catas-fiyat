
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Giriş başarısız.");
    }
    setLoading(false);
  }

  return (
    <main className="container">
      <form className="card login-card" onSubmit={onSubmit}>
        <h1>Yönetici Girişi</h1>
        <p className="muted">Fiyatları sadece yönetici değiştirebilir. Personel tüm detayları görüntüler.</p>
        {error ? <div className="notice err">{error}</div> : null}
        <div className="field">
          <label>Şifre</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="button primary" disabled={loading} type="submit">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}
