# Çalıştırma ve yayın rehberi

## Profil, kişisel yorum ve Google giriş eki
Profil/günlük native cihazda ayrı şifreli depoda; webde sekme oturumundadır. Google, misafir ve diğer hesaplar ayrı kayıt alanları kullanır.
Kişisel yorum için aynı `GEMINI_API_KEY` ve varsayılan `PERSONAL_MODEL=gemini-3.1-flash-lite` kullanılır. Gerçek profil için Gemini’ye açık aktarım izni gerekir.
Google giriş ortamı ve native yapılandırması GOOGLE_AUTH.md içinde. Google native SDK Expo Go'da bulunmaz; gerçek giriş için APK/development build gerekir.
`npm run test:e2e` derlenmiş web önizlemesini 8082'de sınar. Tek Playwright çalıştırması kullan; geliştirme sunucusu HMR çıktısı test kanıtı değildir.
Yatırımcı gider tablosu INVESTOR_COSTS.md, tekrar üretim `npm run costs`, demo akışı DEMO_SCRIPT.md içinde.

## Yerel ortam
Node 24 LTS, `npm ci`. İlk terminal `npm run api`, ikinci terminal `npm start`.
Web `npm run web`, telefon Expo Go QR. Android Studio yalnız yerel emülatör/yerel native build için gereklidir.
SDK 58 projesidir; telefonundaki Expo Go sürümü SDK 58 desteklemiyorsa uygulamayı güncelle veya EAS development build kullan.
create-expo-app başlangıç mesajı SDK 57 dese de çıkarılan gerçek paket SDK 58.0.22 idi; expo-doctor gerçek bağımlılıkları doğrular.

## Gerçek Vision
1. Google AI Studio üzerinden sunucu hesabına ait API anahtarı oluştur.
2. `.env` içindeki `GEMINI_API_KEY` değerini doldur. Anahtarı mobil ayarlara yazma.
3. `GEMINI_MODEL=gemini-3.8-flash` varsayılan. Model erişimini kendi hesap/bölgenle doğrula.
4. API'yi başlat; `/health` configured=true olmalı. Bu yalnız anahtarın tanımlı olduğunu gösterir, geçerli olduğunu doğrulamaz.
5. Düz, net ve tam bir etiketle gerçek okuma yap; her alerjen kanıtını ambalajla karşılaştır.
6. Bulanık fotoğraf, kesik alerjen bölümü, yabancı dil, uzun içerik ve aynı ürünün değişmiş etiketini dene.
7. En az 20 gerçek etiket için alerjen kaçırma/hatalı ekleme ve gecikme p50/p95 kaydı tut.
Canlı anahtar bu oturumda mevcut değildi. Sahte benchmark/başarı yüzdesi yok.

## Üretim API
`npm run build:api`, ardından `node dist-api/server.cjs` veya çok aşamalı Dockerfile.
Runner yalnız Node ve oluşturulmuş sunucu dosyasını taşır; Expo araçları üretim runtime'ına kopyalanmaz.

```powershell
docker build -t etiket-api .
docker run --rm -p 8787:8787 --env-file .env etiket-api
```

Gerekli ortam:
- `NODE_ENV=production`
- `GEMINI_API_KEY`: sağlayıcı sırrı
- `APP_ACCESS_TOKEN`: rastgele, en az 24 karakter; uygulamanın güvenli bağlantı ayarına girilir
- `ALLOWED_ORIGINS`: web önizlemesinin gerçek HTTPS origin'i, virgülle ayrılır
- `GEMINI_MODEL`, `PORT`, gerekiyorsa `TRUST_PROXY_HOPS`

Önüne HTTPS reverse proxy koy. TRUST_PROXY_HOPS değerini gerçek proxy zinciriyle eşleştir; herkese güven seçeneği kullanma.
Native uygulamada CORS güvenlik kontrolü değildir; token ve API oran sınırı uygulanır.
Mevcut oran sınırı instance başına bellektedir. Çok instance için ortak limiter, genel bütçe kotası ve kullanıcı bazlı yetkilendirme gerekir.
Bu sürümün elle girilen erişim token'ı kişisel/iç test içindir. Herkese açık mağaza dağıtımında kısa ömürlü oturum ve cihaz/hesap bazlı yetkilendirme kur.
Sağlayıcı hesabında bütçe ve kota belirle. Görsel veya model yanıtı loglama. Proxy gövde limiti uygulamadan düşük olmamalı.

## Android APK, Android Studio olmadan
EAS hesabıyla kendi terminalinde:

```powershell
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

Build ortamında `EXPO_PUBLIC_API_URL=https://gercek-api-adresin` tanımla. API anahtarı EAS public değişkenlerine konmaz.
`preview` iç dağıtım APK üretir. `production` Play Store AAB üretir.
Paket adı `com.ogsarim.etiket`. Hesap sahibi değiştirirse bundle ID ve mağaza kaydı birlikte güncellenir.
Bu oturumda EAS hesabı/proje ID yoktu; imzalı APK oluşturulmadı. EAS build ücret/kota sınırları hesabına bağlıdır.

## Fiziksel cihaz kabulü
- Expo Go/development build açılışı; geri tuşu, çentik ve alt güvenli alan.
- Kamera izni reddi/kalıcı reddi, fener, yönlü fotoğraf, galeri HEIC/JPEG/PNG.
- Android yazı ölçeği %100/%200, TalkBack; iOS VoiceOver ve dinamik yazı.
- Uçak modunda eski kayıtlar; yeni okuma hatası; okuma sırasında iptal/arka plana alma.
- Gerçek ağda 20 etiket kabulü; kişisel alerjen ile eser miktarda ayrımı.
- Geçmişi sil, uygulamayı yeniden başlat, silinmiş kayıt kalmadığını doğrula.

## Mağaza yayını öncesi
İşletmeci/iletişim ve hukuki metinleri tamamla; gerçek Google planı ve barındırma bölgesini gizlilik metnine işle.
Google Play veri güvenliği ve Apple gizlilik formlarını gerçek veri akışına göre doldur.
Ürün adı/modeli başarı ve gecikme garantisi vermez. Model sürümü değişince etiket kabul setini yeniden çalıştır.
Bu adımlar bu oturumda yapılmış veya hesap açılmış gibi raporlanmaz.

Ekonomik alternatif: Gemini 3.1 Flash-Lite fotoğraf okuma, API çağrısız yerel profil değerlendirmesi ve isteğe bağlı Gemini Flash-Lite bulut ayrıntısı. Eski premium gider rakamları varsayılan değildir; INVESTOR_COSTS.md esas alınır.
# Faz 14 ek kabulü

- `docs/GUTIQ_RESEARCH.md` ürün karşılaştırmasını ve bilinmeyenleri kaydeder. Yeni ekranlar: Gözlemler, Dışarıda yemek, Menü ve tabak, Barkod.
- Mevcut Google/sağlık izinleri korunur. `POST /api/food-context` ve `GET /api/barcode/:code` aynı erişim/IP kotası altındadır; barkod için model anahtarı gerekmez, internet/katalog erişimi gerekir.
- Katalog: Open Food Facts v3.6, yalnız sınırlı ürün alanları, 8sn/128KB. Ürün yok, servis kapalı, yanlış kontrol rakamı ve Türkçe ürün kapsamını gerçek ambalajlarla kontrol edin. Yayın öncesi Open Food Facts uygulama iletişimi/API kullanım kurallarını tamamlayın.
- Native: EAN8/EAN13/UPC-A barkod kamerasını, reddedilen izni ve elle girişi test edin. Expo Print/Sharing/FileSystem yeni paketleri development/APK build'ine dahil edin. Her iki platformda PDF paylaşma, iptal, Türkçe metin ve normal geçici dosya temizliğini kontrol edin.
- Canlı model seti: en az 5 menü, 5 tabak, 10 etiket; kırpık/bulanık/gizli sos/alerjen eksikliği ve görsel talimat enjeksiyonu dahil. Gerçek usage, p50/p95, bozuk yanıt oranı ölçülmeden ucuz model eşdeğerliği iddia etmeyin.
- Menü/tabak sonucu saklanmaz; teyit edilen öğün günlükte saklanır. Uzun dönem için 100 kayıt sınırı/senkronizasyon ve abonelik bütçesi ayrıca tasarlanır.

Üretim ayarıyla yerel kabul provası ve gerçek durumlar: [PROD_FLOW_LOG.md](PROD_FLOW_LOG.md).
