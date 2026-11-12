# Nazif

Nazif, gıda etiketi fotoğrafından içindekileri, alerjen beyanlarını ve katkı maddelerini okuyup Türkçe açıklayan bir mobil uygulama. Öğün ve belirti günlüğü tutabilir, izin verirsen yeni bir etiketi kendi kayıtlarınla birlikte yorumlatabilirsin.

- [Android V17 demo APK](https://github.com/0gsar1m/Food_label_reader/releases/download/nazif-android-v17-demo/Nazif-v17.apk)
- [Canlı API durumunu kontrol et](https://nazif-api-production.up.railway.app/health)

## Uygulama nasıl çalışıyor?

1. **Etiketi okut.** Kamerayla çektiğin veya galeriden seçtiğin fotoğrafı önizle ve gönder. Sunucu fotoğrafı GPT-6 Luna ile okur. Sonuçta içerikler, katkılar ve alerjenler için etiketten dayanak gösterilir. “İçerir” ile “eser miktarda içerebilir” ayrı gösterilir.
2. **Öğününü kaydet.** Ne yediğini, ne zaman yediğini ve sonrasında nasıl hissettiğini yazabilirsin. Geçmiş okumalar ve günlük ayrı ekranlarda tutulur. Gözlemler ekranı 7 veya 30 günlük kayıtlarını özetler.
3. **Kişisel yorumu gör.** Profil aktarım izni açıksa, yeni taramanın Özet ekranında GPT-6 Luna etiket metnini, profilini ve son 20 öğüne kadar olan kayıtlarını birlikte değerlendirir. Sonuç ve öneri ayrı gösterilir. Yorum tanı koymaz ve tüketim güvenliği garantisi vermez.

Uygulamada ayrıca barkod sorgulama, menü ve tabak inceleme, restoran için alerjen kartı ve görüşmede paylaşılabilen gözlem raporu bulunur.

## Teknik yapı

- **İstemci:** Expo SDK 58, React Native 0.88 ve TypeScript. Android öncelikli, iOS ve web çıktısı da alınabiliyor.
- **Sunucu:** Node.js 24 ve Express. İstemci ile sunucu ortak Zod şemaları kullanır. Sunucu model çıktısını ve etiket alıntılarını doğrular.
- **Model:** Üretimde etiket okuma, menü ve tabak inceleme, kişisel yorum ve profil soru önerileri OpenAI Responses API üzerinden `gpt-6-luna` kullanır. Model anahtarı sunucu ortamında tutulur.
- **Veri:** Etiket geçmişi ve alerjen tercihleri cihazda tutulur. Profil ve günlük, telefonda AES-256-GCM ile şifrelenir. Şifreleme anahtarı SecureStore'dadır. Web önizlemesinde profil ve günlük sekme oturumunda tutulur.
- **İzinler:** Fotoğraf okuma isteği profil ve günlük taşımaz. Kişisel yorum için ayrı OpenAI aktarım izni gerekir. Google girişi ayrıca OAuth yapılandırması gerektirir.

| Uç | İşlev |
| --- | --- |
| `GET /health` | Hizmet ve model yapılandırması |
| `POST /api/analyze` | Etiket fotoğrafı okuma |
| `POST /api/personalize` | İzinli kişisel yorum ve profil soru önerileri |
| `POST /api/food-context` | Menü ve tabak fotoğrafı inceleme |
| `GET /api/barcode/:code` | Open Food Facts barkod sorgusu |
| `POST /api/auth/google` | Yapılandırılmışsa Google oturumu |

## Yerelde çalıştırma

Node.js 24 ile bağımlılıkları kur. İlk kurulumda ortam dosyasını örnekten oluştur.

```powershell
npm ci
Copy-Item .env.example .env
```

Canlı model çağrıları için yerel `.env` dosyasında sunucuya ait `OPENAI_API_KEY` değerini ayarla. `OPENAI_MODEL` varsayılanı `gpt-6-luna`. `EXPO_PUBLIC_API_URL` yalnızca istemcinin bağlanacağı açık URL'yi taşır. Sağlayıcı anahtarını `EXPO_PUBLIC_` değişkenlerine koyma.

Bir terminalde `npm run api`, ikinci terminalde hedefe göre şu komutlardan birini çalıştır.

| Komut | Hedef |
| --- | --- |
| `npm run web` | Tarayıcıda geliştirme |
| `npm start` | Expo geliştirme sunucusu |
| `npm run android` | Yerel Android derlemesi ve çalıştırma |
| `npm run ios` | macOS ve Xcode ile yerel iOS derlemesi |

Fiziksel telefondan yerel API'ye bağlanırken `EXPO_PUBLIC_API_URL` için bilgisayarının LAN adresini kullan. Örneğin `http://192.168.1.10:8787`. Adresi uygulamada **Tercihler → Okuma hizmeti bağlantısı** üzerinden de değiştirebilirsin.

## V17 demo

Demo APK açılışta kısa bir tur gösterir. **Demo profiliyle devam et** seçeneği, gerçek profilden ayrı tutulan 24 kurgu öğün ve örnek etiket geçmişini açar. Web önizlemesinde bu akışı görmek için başlatmadan önce PowerShell'de `$env:EXPO_PUBLIC_DEMO_WEEK = 'true'` ayarla. Örnek okumaları API anahtarı olmadan inceleyebilirsin. Yeni fotoğraf taraması ve bulut yorumu için çalışan API erişimi gerekir.

## Doğrulama ve yayın

```powershell
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` lint, TypeScript, birim ve API testleri, uygulama export'u ve sunucu paketi smoke testini çalıştırır. Playwright web export'unu 8082 portunda sınar. Canlı sağlayıcı çağrıları ve fiziksel cihaz kabulü ayrı kaydedilir.

Üretim API'si Railway'deki `nazif-api` servisinde çalışır. Android yayın derlemesine açık HTTPS API adresini `EXPO_PUBLIC_API_URL` olarak ver. APK paketleme ve dağıtım adımları için [yayın rehberine](docs/RELEASE_RUNBOOK.md), kabul kayıtları için [doğrulama raporuna](docs/VERIFICATION.md) bak.

## Geliştirme belgeleri

[Çalışma kuralları](AGENTS.md), [aktif bağlam](docs/ACTIVE_CONTEXT.md), [faz planı](docs/MASTER_PLAN.md) ve [faz durumları](docs/PHASE_STATUS.md).
