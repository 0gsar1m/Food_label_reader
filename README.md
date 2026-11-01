# Etiket

Gıda etiketi fotoğrafını okuyup içerik, alerjen ve katkı maddelerini Türkçe açıklayan Android öncelikli React Native uygulama.

Kamera veya galeri → yerel önizleme → açık gönderim işlemi → kanıt metinleriyle açıklama.
Her alerjen beyanı **içerir** veya **eser miktarda içerebilir** olarak ayrılır. Sağlık puanı ve tüketim güvenliği garantisi üretilmez.

<img src="docs/screenshots/home-390.png" width="280" alt="Etiket ana ekranı" /> <img src="docs/screenshots/result-summary.png" width="280" alt="Açıkça işaretli örnek etiket sonucu" />

## Çalıştırma

Node.js 24 LTS ve Android telefonda Expo Go yeterlidir. Android Studio zorunlu değildir.

```powershell
npm ci
Copy-Item .env.example .env
```

`.env` içinde `GEMINI_API_KEY` değerini kendi sunucu anahtarınla doldur. Bu dosya git'e dahil edilmez.
`EXPO_PUBLIC_API_URL` yalnız sunucu adresidir; buraya veya başka bir `EXPO_PUBLIC_` değişkenine API anahtarı koyma.

İki ayrı terminal:

```powershell
npm run api
```

```powershell
npm start
```

Telefonda Expo Go ile terminaldeki QR kodunu aç. Telefon ve bilgisayar aynı ağda olmalı.
Fiziksel telefonda `.env` içindeki `EXPO_PUBLIC_API_URL` için bilgisayarın LAN IP adresini kullan:
`http://192.168.1.10:8787` bir örnektir; kendi IP adresinle değiştir.
`EXPO_PUBLIC_API_URL` hiç tanımlanmazsa development modunda Expo'nun LAN adresi otomatik kullanılır.
Uygulamada **Tercihler → Okuma hizmeti bağlantısı** üzerinden de adresi değiştirebilirsin.
Windows güvenlik duvarında Node bağlantısına yalnız özel ağda izin ver. Ortak Wi-Fi istemcileri birbirinden yalıtabilir.

Web önizleme:

```powershell
npm run web
```

Örnek sonucu anahtarsız ve çevrimdışı inceleyebilirsin. Örnek kurgu olduğu her ekranda belirtilir.
Gerçek fotoğraf gönderiminde anahtar yoksa yapılandırma hatası gösterilir; sahte analiz yapılmaz.

## İçerik

- Gerçek kamera ekranı, fener, sistem galeri seçicisi, JPEG küçültme ve fotoğraf önizlemesi.
- Gemini Flash Vision, tek istek ve doğrulanmış JSON sözleşmesi.
- Sade özet, içerik açıklamaları, katkı işlevleri ve birebir etiket kanıtları.
- İsteğe bağlı 14 alerjen tercihi ve kişisel eşleşme vurgusu; tercihler modele gönderilmez.
- Son 50 metin okuması cihazda; Türkçe arama, tekil/tam silme ve paylaşma.
- Gizlilik ve kullanım koşulları; işletmeci bilgileri eksik olduğundan hukuki metinler taslaktır.
- API token koruması, istek sınırı, boyut kontrolü, timeout ve istemci iptali.

## Doğrulama

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run build:api
npm run test:api-bundle
npx playwright install chromium
npm run test:e2e
npx expo-doctor
```

`build`, Android/iOS/web JavaScript ve Hermes paketlerini üretir. İmzalı APK veya mağaza paketi değildir.
Tarayıcı testlerinde sağlayıcı yanıtları test dublörüyle doğrulanır; canlı Vision kalitesi ölçülmüş sayılmaz.
Gerçek test sonuçları ve sınırlar: [doğrulama raporu](docs/VERIFICATION.md).

## APK ve sunucu yayını

Android Studio olmadan EAS bulut APK profili `eas.json` içinde hazırlanmıştır.
EAS hesabı/proje bağlantısı ve gerçek HTTPS API adresi gerekir. Komutlar ve kabul adımları:
[yayın rehberi](docs/RELEASE_RUNBOOK.md).

## Projede devam etme

Claude Code veya başka bir geliştirme oturumunda önce [CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md)
ve [aktif bağlam](docs/ACTIVE_CONTEXT.md) okunur. [Faz planı](docs/MASTER_PLAN.md),
[faz durumları](docs/PHASE_STATUS.md), [AI rehberi](docs/AI_GUIDELINES.md),
[AI Slop rehberi](docs/AI_SLOP_AVOIDANCE.md) ve [rakip araştırması](docs/COMPETITOR_RESEARCH.md) ayrı tutulur.
