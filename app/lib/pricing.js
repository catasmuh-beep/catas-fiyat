// lib/pricing.js
import { calculateProduct, formatTL } from "./lib/pricing";
export function toNumber(val) {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    return Number.isFinite(val) ? val : 0;
  }

  const str = String(val).trim();

  if (!str) return 0;

  // Türkçe sayı formatı destek
  const normalized = str
    .replace(/₺/g, "")
    .replace(/%/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function calculateProduct(product) {
  const alis = toNumber(product.alis_fiyati ?? product.alis ?? 0);
  const montaj = toNumber(product.montaj_maliyeti ?? product.montaj ?? 0);
  const puan = toNumber(product.puan ?? 0);
  const fayda = toNumber(product.fayda ?? 0);
  const nakitCarpani = toNumber(product.nakit_carpani ?? 0);
  const kartKomisyonu = toNumber(product.kart_komisyonu ?? product.kart_komisyon ?? 0);
  const kampanya = toNumber(product.kampanya_fiyati ?? product.kampanya ?? 0);

  const netBedel = Math.max(0, alis + montaj - puan - fayda);
  const nakitSatis = Math.round(netBedel * (1 + nakitCarpani / 100));
  const kartliSatis = Math.round(nakitSatis * (1 + kartKomisyonu / 100));
  const kar = Math.max(0, nakitSatis - netBedel);

  return {
    ...product,
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    nakit_carpani: nakitCarpani,
    kart_komisyonu: kartKomisyonu,
    kampanya_fiyati: kampanya,
    net_bedel: netBedel,
    nakit_satis: nakitSatis,
    kartli_satis: kartliSatis,
    kar,
  };
}

export function formatTL(value) {
  return `₺${toNumber(value).toLocaleString("tr-TR")}`;
}
