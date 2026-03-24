// lib/pricing.js

export function toNumber(val) {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    return Number.isFinite(val) ? val : 0;
  }

  const normalized = String(val)
    .replace(/\s/g, "")
    .replace("₺", "")
    .replace("%", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function calculateProduct(product) {
  const alis = toNumber(product.alis_fiyati ?? product.alis ?? product.buying_price);
  const montaj = toNumber(product.montaj_maliyeti ?? product.montaj ?? product.installation_cost);
  const puan = toNumber(product.puan ?? product.points_discount);
  const fayda = toNumber(product.fayda ?? product.benefit_discount);
  const nakitCarpani = toNumber(product.nakit_carpani ?? product.cash_multiplier);
  const kartKomisyon = toNumber(product.kart_komisyonu ?? product.kart_komisyon ?? product.card_commission);
  const kampanya = toNumber(product.kampanya_fiyati ?? product.kampanya ?? product.campaign_price);

  // Net maliyet
  const net = Math.max(0, alis + montaj - puan - fayda);

  // Nakit satış
  const nakit = Math.round(net * (1 + nakitCarpani / 100));

  // Kart satış
  const kart = Math.round(nakit * (1 + kartKomisyon / 100));

  // Kar
  const kar = Math.max(0, nakit - net);

  return {
    ...product,
    alis_fiyati: alis,
    montaj_maliyeti: montaj,
    puan,
    fayda,
    nakit_carpani: nakitCarpani,
    kart_komisyonu: kartKomisyon,
    kampanya_fiyati: kampanya,

    net_bedel: net,
    nakit_satis: nakit,
    kartli_satis: kart,
    kar,
  };
}
