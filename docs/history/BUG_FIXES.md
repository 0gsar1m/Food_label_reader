# Düzeltmeler

## Yeni kapsam kabulü
- İki paralel Playwright sürecinin ortak iz klasörü çakışması giderildi; tek sıra ve export edilmiş uygulama üzerinden kabul yapılıyor.
- Hesap değişiminde eski verinin bir kare gösterilmesi ve bekleyen yazıların yanlış hesaba bağlanması engellendi.
- Google-only üretim yapılandırmasında anonim ücretli API erişimi kapatıldı.
- Opus 5.5 için desteklenmeyen forced tool yerine JSON structured output kullanıldı; desteklenmeyen grammar kısıtları Zod katmanında doğrulanıyor.
- Tercih başlığındaki düz metin ters bölü n, gerçek satır kırılmasına dönüştürüldü.

## 1 Kasım 2026
- Webde RN accessibilityState tek başına seçili durumunu DOM'a taşımıyordu; aria-checked/selected/expanded eklendi.
- SVG üzerine native erişilebilirlik prop'ları webde uyarı üretiyordu; gizleme View katmanına taşındı.
- Boş hata metni koşullu render'da View içine metin düşürüyordu; null dönüşüyle düzeltildi.
- HTTP yerel adres kontrolü 192.168 ile başlayan alan adlarını kabul edebiliyordu; gerçek IPv4 kontrolü eklendi.
- Derlenmiş API dosyası kaynak lint taramasına giriyordu; üretilmiş dist-api klasörü kaynak kontrollerinden ayrıldı.
- Windows'ta paralel build/test sırasında Vitest fork worker bir kez kapandı; tek thread worker ile yeniden doğrulandı.

## Faz 14 kabul düzeltmeleri
- Yeni JSX başlıklarında düz ters bölü n yerine gerçek satır kırılması; ortak düğmede uzun Türkçe metin sarılması.
- Yeni günlüğün varsayılanı kontrol bekliyor; belirtisiz sonuç yalnız açık seçimle kaydedilir. Legacy kayıtlar eski semantiği korur.
- Pending/kurgu kayıtlar yerel kişisel yorumda belirtisiz sayılmaz. Yeni outcome ile belirti listesi çelişkisi Zod'da reddedilir.
- Öğün kaydından sonra yeni form eski tarama kimliği ve demo işaretini taşımıyor. Bekleyen kontrol kısa yolu formun üstüne alındı.
- Kullanıcıya ISO formatı yazdıran alan yerel gün.ay.yıl saat:dakika biçimine dönüştürüldü; hatalı takvim günleri reddedilir.
- Profil kaçınma alanında virgül yazarken metni kırpan erken normalizasyon kaldırıldı; doğrulama kaydetmede yapılır.

## Faz 18 kabul düzeltmeleri

- Gemini’nin etiket JSON şemasını HTTP 400 ile reddetmesi, model şemasındaki iç içe uzunluk kısıtları kaldırılarak giderildi. Sunucu, Zod sınırlarını ve etiket kanıtı doğrulamasını aynı şekilde uygular.
- Fotoğraf ve kişisel yorum için canlı test edilen Flash-Lite modeli varsayılan oldu. Takip cevabının getirdiği yeni ayrıntıyı açıkça kullanması model talimatına eklendi.
- Gemini 503 verdiğinde mevcut süre sınırı içinde bir kez aynı model çağrılır. 503 ardından başarılı yanıtın API'den geçmesi test edildi.
