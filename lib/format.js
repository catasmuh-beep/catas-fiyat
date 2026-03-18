export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(Number(value));
}
