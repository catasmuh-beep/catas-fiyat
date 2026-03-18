import { defaultItems } from "./default-data";
import { recalcItem } from "./utils";

const STORAGE_KEY = "catas-price-items-v1";

export function getFallbackItems() {
  if (typeof window === "undefined") {
    return defaultItems.map(recalcItem);
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultItems.map(recalcItem);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaultItems.map(recalcItem);
    return parsed.map(recalcItem);
  } catch {
    return defaultItems.map(recalcItem);
  }
}

export function saveFallbackItems(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(recalcItem)));
}

export async function fetchItems() {
  try {
    const response = await fetch("/api/prices", { cache: "no-store" });
    if (!response.ok) throw new Error("Sunucu verisi alınamadı");
    const payload = await response.json();
    if (payload?.mode === "supabase" && Array.isArray(payload.items)) {
      return { items: payload.items.map(recalcItem), mode: "supabase" };
    }
    return { items: getFallbackItems(), mode: "local" };
  } catch {
    return { items: getFallbackItems(), mode: "local" };
  }
}

export async function persistItems(items) {
  try {
    const response = await fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    if (!response.ok) throw new Error("Kaydetme başarısız");
    const payload = await response.json();
    if (payload?.mode === "supabase") {
      return { ok: true, mode: "supabase" };
    }
  } catch {
    saveFallbackItems(items);
    return { ok: true, mode: "local" };
  }

  saveFallbackItems(items);
  return { ok: true, mode: "local" };
}