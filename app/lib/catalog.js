export const CATEGORY_ORDER = ["Kombi","Klima","Şofben","Elektrikli Kombi"];

export const BRAND_ORDER_BY_CATEGORY = {
  Kombi: ["Vaillant","Demirdöküm","Baymak","ECA","Protherm","Baykan","Warmhaus"],
  Klima: ["Vaillant","Demirdöküm","Baymak","ECA","Protherm","Baykan","Warmhaus"],
  Şofben: ["Vaillant","Demirdöküm","Baymak","ECA","Protherm","Baykan","Warmhaus"],
  "Elektrikli Kombi": ["Vaillant","Demirdöküm","Baymak","ECA","Protherm","Baykan","Warmhaus"],
};

export function sortProducts(products = []) {
  return [...products].sort((a,b)=>{
    const c1 = CATEGORY_ORDER.indexOf(a.category);
    const c2 = CATEGORY_ORDER.indexOf(b.category);

    if(c1 !== c2) return c1 - c2;

    const brands = BRAND_ORDER_BY_CATEGORY[a.category] || [];
    const b1 = brands.indexOf(a.brand);
    const b2 = brands.indexOf(b.brand);

    if(b1 !== b2) return b1 - b2;

    return (a.model || "").localeCompare(b.model || "","tr");
  });
}
