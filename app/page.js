import Link from "next/link";
import { createPublicClient } from "../lib/supabase";
import { formatPrice } from "../lib/format";

async function getPrices() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("price_items")
    .select("id, category, brand, model, cash_price, card_price, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

function groupByCategoryAndBrand(items) {
  const grouped = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = {};
    const brandKey = item.brand || "Diğer";
    if (!grouped[item.category][brandKey]) grouped[item.category][brandKey] = [];
    grouped[item.category][brandKey].push(item);
  }
  return grouped;
}

export const revalidate = 0;

export default async function HomePage() {
  const items = await getPrices();
  const grouped = groupByCategoryAndBrand(items);

  return (
    <main className="page">
      <div className="topBar">
        <div className="pill">Personel görünümü</div>
        <Link href="/yonetici" className="adminLink">Yönetici Girişi</Link>
      </div>

      <div className="logoWrap">
        <img src="/logo.png" alt="Çataş Mühendislik" />
      </div>

      {Object.entries(grouped).map(([category, brands]) => (
        <section className="section" key={category}>
          <h2 className="sectionTitle">{category}</h2>

          {Object.entries(brands).map(([brand, brandItems]) => (
            <div key={brand} style={{ marginBottom: 16 }}>
              {brand !== "Diğer" && <h3 className="brandTitle">{brand}</h3>}

              <div className="card">
                <table>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Nakit Satış</th>
                      <th>Kart Satış %18</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandItems.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Model">{item.model}</td>
                        <td data-label="Nakit Satış" className="price">{formatPrice(item.cash_price)}</td>
                        <td data-label="Kart Satış %18" className="price">{formatPrice(item.card_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}

      {!items.length && (
        <div className="card" style={{ padding: 16 }}>
          Veri bulunamadı. Supabase kurulumu tamamlanınca fiyatlar burada görünecek.
        </div>
      )}
    </main>
  );
}
