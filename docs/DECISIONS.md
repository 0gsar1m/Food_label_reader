# Teknik kararlar

- Mobil: Expo + React Native + strict TypeScript. Android öncelikli; iOS ve web önizleme aynı kaynak.
- Gezinme: blank template üzerinde tipli yerel ekran yığını. Üç ana sekme ve kamera/sonuç/koşul ekranları için dış routing bağımlılığı eklenmedi. Deep link/URL veya çok seviyeli navigasyon gelirse Expo Router'a geçiş ayrı karar gerektirir.
- Expo sürümü tahminle sabitlenmez; create-expo-app çıktısı ve expo install sürüm eşleşmesi kullanılır.
- Vision: `gemini-3.8-flash`, düşük düşünme seviyesi, tek fotoğraf/tek JSON yanıt. Kalite/hız odağı; ölçülmemiş gecikme sözü yok.
- Model `GEMINI_MODEL` ile sunucudan değiştirilir. İstemcide anahtar yok; standart HTTPS API kullanılır.
- API: Express/Node, Zod, güvenlik başlıkları, oran sınırı, sınırlı gövde, isteğe bağlı bearer token.
- API herkese açık üretime çıkarılacaksa `APP_ACCESS_TOKEN` zorunlu; token cihazda SecureStore içinde tutulur (webde oturum belleği).
- Hesap/üyelik ve bulut geçmişi yok. AsyncStorage yalnız analiz ve tercihler; görsel/base64 geçmişe girmez.
- Fotoğraf JPEG'e yeniden çizilip en uzun kenar 1800px ile sınırlanır; API en fazla 5MB decoded JPEG/PNG kabul eder.
- Yerel demo kurgu bir etiket ve sabit açıklamalardır; hiçbir gerçek görseli analiz ettiğini söylemez.
- Anahtar verilmediğinden canlı model çağrısı ve gerçek kalite/latency ölçümü ayrıca gerekir.

## 1 Kasım 2026 tarihinde kontrol edilen resmi kaynaklar
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- https://ai.google.dev/gemini-api/docs/generate-content/thinking
- https://docs.expo.dev/versions/latest/sdk/imagepicker/
- https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
- https://docs.expo.dev/versions/latest/sdk/camera/
- https://www.gov.uk/understanding-food-labelling/allergen-labelling

Kaynaklar tasarım kararını destekler; seçilen modelin gerçek etiketlerde doğruluğu henüz ölçülmemiştir.

## Kişiselleştirme ve kimlik eki
- Sağlık profili/günlük ayrı şifreli cihaz depoları; hesap değişiminde izolasyon.
- Claude Opus 5.5 kaynaklı kişisel yorum; seçim MODEL_SELECTION.md içinde gerekçelidir, canlı kalite kanıtı yok.
- Google kimliği sunucuda JOSE JWK doğrulama, 24h uygulama JWT. Gmail kapsamı yok; bulut sync yok.
- Native giriş için modern Credential Manager SDK; deprecated Expo Google provider eklenmedi.
- 2026/2027 token giderleri ve sabit abonelikler ayrı, varsayımlar parametreli.

## Faz 14 / My GutIQ yönlendirmesi
GUTIQ_RESEARCH.md kanıt ve parite tablosudur. Yeni ana hedef tarama, tüketim teyidi, kontrol ve yerel gözlemler döngüsüdür. Yerel tipli ekran yığını korunur; gözlemler dördüncü ana sekmedir.
Menü/tabak için ayrı Zod sözleşmesi ve API kullanılır; etiket şeması gevşetilmez. Aynı Vision taşımacısı, anahtar, kota ve zaman aşımı kullanılır. API katalog sorgusu sabit Open Food Facts v3.6 origin'ine, sınırlı alanlarla, 8 saniye/128KB sınırıyla gider; sağlık profili ve hesap aktarılmaz. Katalog, LLM veya etiket doğrulaması değildir.
PDF için SDK58 resmi dokümanı okundu; `npx expo install expo-print expo-sharing expo-file-system` ile uyumlu sürümler kuruldu. app.config.ts plugin kaynağıdır; incoming sharing açılmadı. Native geçici PDF paylaşım sonrası silinir. Web ayrı yerel HTML penceresini yazdırır; sağlık verisi HTML escape edilir, uzak font/görsel yoktur.
Şifreli vault sürüm1 korunur; yeni alanlar optional, eski kayıtların boş belirtisi eski açık “Belirti yok” seçimine uygun yorumlanır. Yeni pending durumu ayrı saklanır. Günlük sınırı 100 öğündür. Klinik skor/FODMAP veritabanı, senkronizasyon ve abonelik kapsam dışıdır.
Kaynaklar: https://docs.expo.dev/versions/v58.0.0/sdk/print/ ; https://docs.expo.dev/versions/v58.0.0/sdk/sharing/ ; https://docs.expo.dev/versions/v58.0.0/sdk/camera/ ; https://openfoodfacts.github.io/openfoodfacts-server/api/ ; Bristol betimleri: https://www.plymouthhospitals.nhs.uk/display-pil/pil-loss-of-bowel-motions-in-adults-4092
