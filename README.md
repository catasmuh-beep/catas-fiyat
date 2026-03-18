# Çataş Fiyat Sistemi - Supabase Sürümü

Bu sürümde:
- Personel telefonundan ana sayfaya girip fiyatları görür.
- Fiyatları sadece yönetici değiştirir.
- Sen fiyatı güncellediğinde herkes aynı anda yeni fiyatı görür.

## 1) Supabase kurulumu
1. Supabase hesabı aç.
2. **New Project** oluştur.
3. Sol menüden **SQL Editor** aç.
4. `supabase/setup.sql` dosyasındaki tüm SQL kodunu kopyala.
5. SQL Editor içine yapıştır ve **Run** yap.
6. Sol menüden **Project Settings > API** bölümüne gir.
7. Şunları kopyala:
   - Project URL
   - anon public key
   - service_role secret key

## 2) Vercel ortam değişkenleri
Vercel projesinde **Settings > Environment Variables** bölümüne şunları ekle:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## 3) Yönetici girişi
- Personel ana sayfayı açar.
- Sen `/yonetici` sayfasından giriş yaparsın.
- Burada fiyatları değiştirip kaydedersin.

## 4) Güvenlik mantığı
- Public kullanıcı sadece okuyabilir.
- Güncelleme sadece servis anahtarı kullanan admin API üzerinden yapılır.
- Admin girişinde tarayıcıya güvenli cookie yazılır.

## 5) Vercel deploy
1. Bu klasörü GitHub'a yükle.
2. Vercel'de **Add New > Project** yap.
3. GitHub reposunu seç.
4. Environment Variables ekle.
5. Deploy et.

## 6) Not
Bu proje senin gönderdiğin logo ile hazırlandı ve Excel listesindeki fiyatlar başlangıç verisi olarak SQL dosyasına işlendi.
