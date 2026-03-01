# İş Takip Sistemi

Firma, proje, muhasebe ve personel takibini tek platformda yöneten SaaS uygulaması.

## Teknolojiler

- **Next.js 16** - React framework
- **Supabase** - Auth, veritabanı, RLS
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Stil

## Modüller

### İş Takibi
- Firmalar: İş yaptığınız firmaları ekleyin
- Projeler: Firma + il bazında projeler (kurulum, montaj, servis, demontaj)
- Proje hizmetleri takibi

### Muhasebe
- Faturalar: Firmalara kesilen faturalar
- Hakedişler: Proje bazlı ödemeler
- Ürünler & Mal Alımı: Alış/satış fiyatları, stok

### Şirket Giderleri
- Demirbaş, giyim, araç vergi, yakıt, yemek vb.

### Ön Muhasebe
- Personel giderleri + ödemeleri
- Ekip giderleri + ödemeleri
- Şirket giderleri
- Fatura karşılaştırması ile kar/zarar hesaplama

### Personel & Ekip Takibi
- Personel/ekip ekleme, sistem girişi
- İş kayıtları: Nerede, hangi ilde, ne iş yapıldı
- Harcamalar: Yakıt, yemek vb. (admin onayı sonrası muhasebeye işlenir)
- Ödemeler: Personel/ekip dashboard'da görebilir
- WhatsApp mesaj linki

### Yetkiler
- **Admin**: Tüm yetkiler
- **Personel**: Kendi harcamaları, iş kayıtları, ödemeleri
- **Ekip**: Kendi harcamaları, iş kayıtları, ödemeleri

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase Projesi

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın

### 3. Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. E-posta Doğrulamasını Kapat (Opsiyonel)

E-posta doğrulaması olmadan kayıt için: Supabase Dashboard → Authentication → Providers → Email → **Confirm email** seçeneğini kapatın.

### 5. İlk Admin Kullanıcı

1. Kayıt sayfasından bir hesap oluşturun
2. Supabase Dashboard → Table Editor → `profiles` tablosuna gidin
3. Oluşturduğunuz kullanıcının `role` değerini `admin` yapın

### 6. Çalıştırma

```bash
npm run dev
```

http://localhost:3000 adresinde uygulama çalışacaktır.

## Proje Yapısı

```
src/
├── app/
│   ├── dashboard/       # Dashboard sayfaları (rol bazlı)
│   ├── giris/           # Giriş
│   ├── kayit/           # Kayıt
│   └── cikis/           # Çıkış
├── components/          # Ortak bileşenler
└── lib/
    ├── supabase/        # Supabase client
    └── types.ts         # TypeScript tipleri
supabase/
└── migrations/          # Veritabanı migration
```

## WhatsApp Entegrasyonu

Personel ve ekip listelerinde WhatsApp numarası varsa "WhatsApp" linki görünür. `profiles` tablosundaki `whatsapp` veya `phone` alanı kullanılır.
