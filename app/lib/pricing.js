// lib/pricing.js

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function calculateProductPricing(product) {
  const alis = toNumber(
    product.alis ??
    product.alis_fiyati ??
    product.purchase_price ??
    0
  );

  const montaj = toNumber(
    product.montaj ??
    product.montaj_maliyeti ??
    product.installation_cost ??
    0
  );

  const puan = toNumber(product.puan ?? 0);
  const fayda = toNumber(product.fayda ?? 0);

  const nakitCarpani = toNumber(
    product.nakit_carpani ??
    product.nakit_carpan ??
    0
  );

  const kartKomisyon = toNumber(
    product.kart_komisyon ??
    product.kart_komisyonu ??
    0
  );

  const netMaliyet = alis + montaj + puan - fayda;
  const kar = fayda;
  const nakit = Math.round(netMaliyet * (1 + nakitCarpani / 100));
  const kart = Math.round(nakit * (1 + kartKomisyon / 100));
  const kampanya = nakit;

  return {
    alis,
    montaj,
    puan,
    fayda,
    nakitCarpani,
    kartKomisyon,
    netMaliyet,
    kar,
    nakit,
    kart,
    kampanya,
  };
}

export function formatTL(value) {
  const number = toNumber(value);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(number);
}
