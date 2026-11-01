# Varsayımlar ve açık kabul adımları

| Konu | Karar / kalan adım |
|---|---|
| Mobil hedef | Android öncelikli, iOS kaynak desteği; native cihazlar henüz sınanmadı |
| Model | gemini-3.8-flash; kullanıcı hesabında erişim/kalite henüz denenmedi |
| API anahtarı | Sağlanmadı. Sunucu ortamına eklenmeli; örnek akış hazır |
| Gecikme | Tek istek ve düşük düşünme ayarı; ölçülmüş hız garantisi yok |
| Alerjen kaçırma | Model yanılabilir. Kaynak metni görünür; tüketim garantisi verilmez |
| Veri işleme | Google planı ve barındırma bölgesi yayın sahibi tarafından kesinleştirilir |
| Geçmiş | 50 metin kaydı cihazda, şifresiz AsyncStorage; sağlık kasası olarak sunulmaz |
| Fotoğraflar | Sunucuda saklanmaz; cihazda kamera/manipülasyon cache dosyaları olabilir |
| API erişimi | İç test için elle girilen token. Açık mağaza için oturum ve ortak bütçe kontrolü gerekir |
| Kota | Instance başına IP limiter; çoklu instance için ortak depo gerekir |
| Bağımlılıklar | 0 yüksek/kritik; 21 orta seviye derleme/lint zinciri bulgusu raporda |
| Hukuk | İşletmeci/iletişim ve nihai hukuki değerlendirme eksik, ekranlar taslak |
| APK | EAS profili hazır; hesap, proje ID, imza ve native kabul ayrıca gerekli |
| CI | Şablon docs/ci-verify.yml; GitHub workflow etkinleştirilmedi |
| Web | Native uygulamanın kabul önizlemesi; ayrı PWA/offline web dağıtımı yok |
