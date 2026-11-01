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
