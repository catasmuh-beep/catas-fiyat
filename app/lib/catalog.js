export const CATEGORY_ORDER = ["Kombi", "Klima", "Şofben", "Elektrikli Kombi"];

export const BRAND_ORDER_BY_CATEGORY = {
  Kombi: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  Klima: ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Şofben": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
  "Elektrikli Kombi": ["Vaillant", "Demirdöküm", "Baymak", "ECA", "Protherm", "Baykan", "Warmhaus"],
};

export const BRAND_COLORS = {
  Vaillant: "#0a8f6a",
  "Demirdöküm": "#005baa",
  Baymak: "#00a651",
  ECA: "#005baa",
  Protherm: "#d71920",
  Baykan: "#f2c200",
  Warmhaus: "#e30613",
};

export function categorySort(a, b) {
  const ai = CATEGORY_ORDER.indexOf(a);
  const bi = CATEGORY_ORDER.indexOf(b);
  const aIndex = ai === -1 ? 999 : ai;
  const bIndex = bi === -1 ? 999 : bi;
  return aIndex - bIndex;
}

export function brandSort(category, a, b) {
  const order = BRAND_ORDER_BY_CATEGORY[category] || [];
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  const aIndex = ai === -1 ? 999 : ai;
  const bIndex = bi === -1 ? 999 : bi;

  if (aIndex !== bIndex) return aIndex - bIndex;
  return (a || "").localeCompare(b || "", "tr");
}

export function sortProducts(products = []) {
  return [...products].sort((a, b) => {
    const cat = categorySort(a.category, b.category);
    if (cat !== 0) return cat;

    const brand = brandSort(a.category, a.brand, b.brand);
    if (brand !== 0) return brand;

    return (a.model || "").localeCompare(b.model || "", "tr");
  });
}

export function formatCurrency(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(num);
}
