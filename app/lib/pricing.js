export function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function formatTL(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function calculatePricing(product) {
  const alis = toNumber(product?.alis);
  const montaj = toNumber(product?.montaj);
  const puan = toNumber(product?.puan);
  const fayda = toNumber(product?.fayda);
  const nakitCarpani = toNumber(product?.nakit_carpani);
  const kartKomisyon = toNumber(product?.kart_komisyon);

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
