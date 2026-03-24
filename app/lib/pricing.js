export function toNumber(val) {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    return Number.isFinite(val) ? val : 0;
  }

  const str = String(val).trim();
  if (!str) return 0;

  const normalized = str
    .replace(/₺/g, "")
    .replace(/%/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function calculatePricing(product) {
  const alis = toNumber(product?.alis_fiyati ?? product?.alis ?? 0);
  const montaj = toNumber(product?.montaj_maliyeti ?? product?.montaj ?? 0);
  const puan = toNumber(product?.puan ?? 0);
  const fayda = toNumber(product?.fayda ?? 0);
  const nakitCarpani = toNumber(product?.nakit_carpani ?? 0);
  const kartKomisyon = toNumber(
    product?.kart_komisyonu ?? product?.kart_komisyon ?? 0
  );
  const kampanya = toNumber(
    product?.kampanya_fiyati ?? product?.kampanya ?? 0
  );

  const netMaliyet = Math.max(0, alis + montaj - puan - fayda);

  const nakit =
    kampanya > 0
      ? Math.round(kampanya)
      : Math.round(netMaliyet * (1 + nakitCarpani / 100));

  const kart = Math.round(nakit * (1 + kartKomisyon / 100));
  const kar = Math.max(0, nakit - netMaliyet);

  return {
    alis,
    montaj,
    puan,
    fayda,
    nakitCarpani,
    kartKomisyon,
    kampanya,
    netMaliyet,
    nakit,
    kart,
    kar,
  };
}

export function formatTL(value) {
  return `₺${toNumber(value).toLocaleString("tr-TR")}`;
}
