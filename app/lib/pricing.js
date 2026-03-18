
export function round500(value) {
  if (!value) return 0;
  return Math.ceil(Number(value) / 500) * 500;
}

export function computeDerived(input) {
  const alis = Number(input.alis_fiyati || 0);
  const puan = Number(input.puan || 0);
  const fayda = Number(input.fayda || 0);
  const montaj = Number(input.montaj_maliyeti || 0);

  const kampanya_maliyeti = alis - puan - fayda;
  const net_bedel = kampanya_maliyeti + montaj;
  const nakit_satis = net_bedel > 0 ? round500(net_bedel * 1.09) : 0;
  const kar = nakit_satis - net_bedel;
  const kart_satis = nakit_satis > 0 ? round500(nakit_satis * 1.18) : 0;

  return {
    kampanya_maliyeti,
    net_bedel,
    kar,
    nakit_satis,
    kart_satis,
  };
}

export function formatMoney(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function norm(value) {
  return String(value || "").trim();
}
