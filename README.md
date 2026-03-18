# Çataş Fiyat Programı

Bu paket, mevcut fiyat programının yeni sürümüdür. İçinde şu listeler hazır gelir:

- Vaillant kombi
- Demirdöküm kombi
- Protherm kombi
- ECA kombi
- Baykan kombi
- Elektrikli kombi
- Şofben
- Klima

## Önemli çalışma mantığı

Bu sürüm 2 şekilde çalışır:

### 1) Yerel kayıt modu
Hiçbir ek veritabanı bağlamazsanız fiyat değişikliği sadece sizin giriş yaptığınız tarayıcıda saklanır.

### 2) Ortak veritabanı modu
Çalışanların da sizin değiştirdiğiniz fiyatları görmesi için **Supabase** bağlamanız gerekir.
Bu bağlanınca siz fiyatı değiştirip kaydettiğinizde herkes güncel listeyi görür.

---

## Kurulum

Terminalde:

```bash
npm install
npm run dev
```

Vercel için:
- Project içine bu klasörü yükleyin
- Build Command: `next build`
- Output ayarı varsayılan kalabilir

---

## Yönetici girişi

Varsayılan yönetici şifresi:

```text
catas123
```

Vercel ortam değişkeni ile bunu değiştirin:

```text
ADMIN_PASSWORD=buraya-kendi-sifreniz
```

---

## Ortak veritabanı için Supabase kurulumu

Supabase SQL Editor içine bunu yapıştırın:

```sql
create table if not exists public.price_items (
  item_id text primary key,
  sort_order int,
  brand text not null,
  category text not null,
  model text not null,
  alis_fiyat numeric not null default 0,
  puan numeric not null default 0,
  fayda numeric not null default 0,
  kampanya_maliyet numeric not null default 0,
  montaj_maliyet numeric not null default 0,
  net_bedel numeric not null default 0,
  kar numeric not null default 0,
  nakit_satis numeric not null default 0,
  kart_satis numeric not null default 0
);
```

Sonra Vercel Environment Variables bölümüne şunları ekleyin:

```text
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
```

## İlk veri yükleme

İlk açılışta program hazır veri ile gelir.
Daha sonra yönetici panelinden fiyatları değiştirip **Kaydet ve yayınla** butonuna basın.

## Yedek alma

Sağ üstteki **JSON yedek indir** ile veriyi dışarı alabilirsiniz.
Yönetici panelindeki **JSON içe aktar** ile geri yükleyebilirsiniz.

## Not

Bu dosyadaki ürün ve fiyat başlangıç verileri yüklediğiniz Excel listesinden alınmıştır.
Excel içindeki bazı sıfır veya çok düşük değerler de aynen aktarılmıştır. Örneğin:
- ECA Arceus 15 MN TR alış fiyatı dosyada 49 görünüyor
- Bazı klima modelleri 0 fiyat ile yer alıyor

Bunları yönetici panelinden düzeltebilirsiniz.