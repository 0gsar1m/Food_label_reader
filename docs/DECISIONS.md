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
