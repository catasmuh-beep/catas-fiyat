
# Çataş Mühendislik Fiyat Programı

Bu proje, yüklediğin **Fiyat GPT.xlsx** dosyasındaki 88 satırlık ürün listesini temel alır.
Uygulama Windows, iOS ve Android tarayıcılarında çalışır. Personel tüm detayları görebilir. Sadece yönetici fiyat güncelleyebilir.

## Özellikler

- Kategori / marka / model / arama filtreleri
- Personel için tam fiyat görünümü
- Yönetici panelinden alış fiyatı, puan, fayda ve montaj maliyeti düzenleme
- Kaydettiğinde:
  - Kampanya maliyeti
  - Net bedel
  - Kar
  - Nakit satış
  - Kart satış %18
  otomatik hesaplanır
- Veriler Supabase üzerinde tutulur
- Vercel'e deploy edilip link ile paylaşılır

## Ortam değişkenleri

Vercel'e şu değişkenleri ekle:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## Supabase kurulumu

1. Supabase SQL Editor'da önce `supabase/schema.sql`
2. sonra `supabase/seed.sql`

çalıştır.

## Vercel

1. Bu klasörü zipleyip Vercel'e yükle
2. Environment Variables bölümüne yukarıdaki 4 değeri ekle
3. Redeploy yap

## Yönetici kullanımı

- `/admin/login` sayfasına git
- `ADMIN_PASSWORD` ile giriş yap
- Satırları güncelle ve kaydet

## Notlar

- Excel'deki hesap mantığı korunmuştur:
  - Kampanya Maliyeti = Alış - Puan - Fayda
  - Net Bedel = Kampanya Maliyeti + Montaj
  - Nakit Satış = 500'e yuvarlanmış (Net Bedel x 1.09)
  - Kart Satış = 500'e yuvarlanmış (Nakit Satış x 1.18)
- Excel'de 0 görünen ürünler de dosyadaki gibi içeri alınmıştır.
