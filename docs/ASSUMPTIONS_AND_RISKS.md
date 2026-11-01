# Varsayımlar ve açık kabul adımları

| Konu | Karar / kalan adım |
|---|---|
| Mobil hedef | Android öncelikli, iOS kaynak desteği; native cihazlar henüz sınanmadı |
| Model | Vision Gemini 3.1 Flash-Lite + yerel kurallı yorum, isteğe bağlı Haiku 5.5; canlı erişim/kalite henüz denenmedi |
| API anahtarı | Sağlanmadı. Sunucu ortamına eklenmeli; örnek akış hazır |
| Gecikme | Tek istek ve düşük düşünme ayarı; ölçülmüş hız garantisi yok |
| Alerjen kaçırma | Model yanılabilir. Kaynak metni görünür; tüketim garantisi verilmez |
| Veri işleme | Google planı ve barındırma bölgesi yayın sahibi tarafından kesinleştirilir |
| Geçmiş | 50 metin kaydı cihazda, şifresiz AsyncStorage; sağlık kasası olarak sunulmaz |
| Fotoğraflar | Sunucuda saklanmaz; cihazda kamera/manipülasyon cache dosyaları olabilir |
| API erişimi | Google doğrulamalı JWT ve iç test servis token'ı. Oturum revocation ve ortak bütçe kontrolü açık |
| Kota | Instance başına IP limiter; çoklu instance için ortak depo gerekir |
| Bağımlılıklar | 0 yüksek/kritik; 22 orta seviye araç zinciri bulgusu, native giriş paketinin config-plugin zinciri dahil |
| Hukuk | İşletmeci/iletişim ve nihai hukuki değerlendirme eksik, ekranlar taslak |
| APK | EAS profili hazır; hesap, proje ID, imza ve native kabul ayrıca gerekli |
| CI | Şablon docs/ci-verify.yml; GitHub workflow etkinleştirilmedi |
| Web | Native uygulamanın kabul önizlemesi; ayrı PWA/offline web dağıtımı yok |
| Hassas profil | Ayrı AES-256-GCM vault; native anahtar SecureStore, web sekme oturumu. Dışa aktarılan JSON açıktır |
| Google giriş | OAuth client ID'leri/SESSION_SECRET yok. Gerçek Google girişi ve native SHA-1 kabulü ayrıca gerekir |
| Hesaplar | Cihaz kayıtları hesaplara ayrılır; bulut senkronizasyonu ve sunucuda kullanıcı veritabanı yok |
| Maliyet | Gerçek fatura değil, hacim/token senaryosu; Gemini 2026 giriş fiyatı 2027'de artar |

Yerel yorumda LLM/token gideri yoktur; gerçek fotoğraf okuma ve bulut ayrıntısı ücretli olabilir. Yerel OCR/LLM uygulanmış değildir. Ucuz sağlayıcı modellerinin canlı kalite kabulü ayrıca gerekir.

Son demo kararı: normal sunucu Gemini 3.8 Flash + Sonnet 5.5; api:economy Lite + Haiku seçer. Yerel kurallı yorum her iki modda API’sizdir. Önceki ekonomik varsayılan ifadeleri bu son kararla alternatif mod anlamındadır.
