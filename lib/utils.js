export const BRAND_ORDER = ["Vaillant", "Demirdöküm", "Protherm", "ECA", "Baykan"];
export const CATEGORY_ORDER = ["kombi", "elektrikli-kombi", "sofben", "klima"];

export const categoryLabels = {
  kombi: "Kombi",
  "elektrikli-kombi": "Elektrikli Kombi",
  sofben: "Şofben",
  klima: "Klima"
};

export function formatTL(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function slugify(text = "") {
  return text
    .toLowerCase()
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replace(/\s+/g, "-");
}

export function recalcItem(item) {
  const alisFiyat = Number(item.alisFiyat || 0);
  const puan = Number(item.puan || 0);
  const fayda = Number(item.fayda || 0);
  const montajMaliyet = Number(item.montajMaliyet || 0);

  let multiplier = 1.09;
  if (item.category === "klima") multiplier = 1.07;
  if (item.brand === "ECA" && item.category === "kombi") multiplier = 1.12;
  if (item.brand === "Baykan" && item.category === "kombi") multiplier = 1.12;
  if (item.model === "ecoTEC Plus 40 CS/1-5") multiplier = 1.09;

  const kampanyaMaliyet = alisFiyat - puan - fayda;
  const netBedel = kampanyaMaliyet + montajMaliyet;
  const roundBase = item.model === "ecoTEC Plus 40 CS/1-5" ? 100 : 500;
  const nakitSatis = Math.ceil((netBedel * multiplier) / roundBase) * roundBase;
  const kartSatis = Math.ceil((nakitSatis * 1.18) / 100) * 100;
  const kar = nakitSatis - netBedel;

  return {
    ...item,
    alisFiyat,
    puan,
    fayda,
    montajMaliyet,
    kampanyaMaliyet,
    netBedel,
    kar,
    nakitSatis,
    kartSatis
  };
}

export function buildSections(items) {
  const sections = [];
  const kombiItems = items.filter((item) => item.category === "kombi");

  BRAND_ORDER.forEach((brand) => {
    const brandItems = kombiItems.filter((item) => item.brand === brand);
    if (brandItems.length) {
      sections.push({
        key: `kombi-${slugify(brand)}`,
        title: brand,
        subtitle: "Kombi",
        items: brandItems
      });
    }
  });

  CATEGORY_ORDER.filter((cat) => cat !== "kombi").forEach((category) => {
    const catItems = items.filter((item) => item.category === category);
    if (catItems.length) {
      sections.push({
        key: category,
        title: categoryLabels[category],
        subtitle: "Ürün grubu",
        items: catItems
      });
    }
  });

  return sections;
}