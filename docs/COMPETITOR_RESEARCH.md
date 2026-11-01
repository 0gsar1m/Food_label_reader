# Benzer uygulamalar ve yorumlardan ürün kararları

İnceleme: 1 Kasım 2026, ABD App Store web sayfaları ve resmi yardım/ürün dokümanları.
Bu küçük, seçilmiş yorum örneklemidir; tüm kullanıcıları temsil eden bir araştırma değildir.
Puanlar bölgeye ve zamana bağlıdır. Rakiplerin sağlık iddiaları bu ürünün iddiası olarak alınmaz.

## Yuka
Mağaza görünümü 4,8/5 ve yaklaşık 102 bin değerlendirme gösterdi.
Resmi ürün sayfası barkod tarama, açıklama, geçmiş, arama ve tercihler sunuyor.
Mağaza yorumları hızlı içerik açıklamasını ve eski taramalara dönüşü olumlu anıyor.
8 Mart 2025 tarihli erieholl yorumu, ücretli gluten uyarısı ve etiketle sonuç arasındaki farktan yakınıyor.
Geliştirici yanıtı eser miktarlarının tercih uyarısında hesaba katılmadığını belirtiyor.
Bunlar kullanıcının beyanıdır; doğrulanmış teknik hata olarak genellenmez.

Bizim kararımız: alerjen vurgusu temel özellik; eser miktarda ayrı satır; kaynak etiket metni görünür.
Sağlık skoru ve alternatif ürün önerisi, güvenilir veri/kriter olmadan eklenmez.

Kaynaklar:
- [Resmi özellikler](https://yuka.io/en/app/)
- [Mağaza ve yorumlar](https://apps.apple.com/us/app/yuka-food-cosmetic-scanner/id1092799236?see-all=reviews)
- [Çevrimdışı mod sınırları](https://help.yuka.io/l/en/article/ur4x5k32qg-database-in-offline-mode)

## Fig
Mağaza görünümü 4,7/5 ve yaklaşık 17 bin değerlendirme gösterdi.
Resmi ürün kişisel içerik tercihleri ve arama etrafında kurulmuş.
8 Temmuz 2024 tarihli Catbug3k yorumu kişisel tercihler ve geçmişi övüyor.
12 Ekim 2023 tarihli Peej2023 yorumu uzun ilk kurulum ve tercih değiştirme zorluğundan yakınıyor.
Bu eski yorum bugünkü sürümde aynı sorunun sürdüğünü kanıtlamaz; etkileşim tasarımı için ihtiyaç sinyalidir.

Bizim kararımız: zorunlu onboarding ve hesap yok; isteğe bağlı, tek tek değiştirilen alerjenler.
Geçmişte Türkçe arama; kayıtlar internet olmadan açılır. Yeni Vision okuması çevrimdışı çalışmaz.

Kaynaklar:
- [Resmi ürün](https://foodisgood.com/)
- [Mağaza ve kullanıcı yorumları](https://apps.apple.com/us/app/fig-food-scanner-recipes/id1564434726?see-all=reviews)

## Bu sürüme alınanlar

| İhtiyaç | Karar | Kabul |
|---|---|---|
| Hızlı başlama | Hesapsız ana ekrandan kamera/galeri | Ekran akışı testi |
| Kişisel alerjen görünürlüğü | Yerel tercih + açık eşleşme uyarısı | Tercih/sonuç testi |
| Kaynağa güven | Birebir kanıt, tam okunan metin | Şema/API testi |
| Eski taramaya dönme | 50 yerel kayıt + Türkçe arama | Kalıcılık/arama testi |
| İnternetsiz erişim | Yalnız kayıtlı sonuçlar ve örnek | Çevrimdışı kayıt testi |
| Kontrol ve anlaşılabilirlik | Tercihleri tek tek değiştir, tekil/tam sil | UI kabulü |

## Ayrı ürün genişletmeleri
Favoriler/alışveriş listesi ve ürün karşılaştırması, çekirdek fotoğraf akışından sonra ele alınabilir.
Barkod veritabanı, FODMAP/diyet reçetesi, otomatik güvenli ürün önerisi ve Nutri-Score bu kapsamın parçası değildir.
Güvenilir veri ve yöntem olmadan bu özelliklerin eklenmesi istenen ürün doğruluğunu azaltır.
