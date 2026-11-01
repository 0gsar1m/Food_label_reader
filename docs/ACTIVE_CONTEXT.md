# Aktif bağlam

1 Kasım 2026. Kullanıcı tüm fazların tamamlanmasını ve sonunda Food_label_reader reposuna push istedi.
Eski proje yalnız metodoloji referansı olarak okundu. Mevcut çalışma klasörü başlangıçta boştu.
Etiket: Expo React Native Android/iOS, Türkçe arayüz, Node API, Gemini Flash Vision.
Etkin faz: 08 / amaç ve kişisel sağlık bağlamı ürün tasarımı. İlk sürümün kod teslimi tamamlandı; yeni kapsam henüz uygulanmadı.
Tasarım: AI_SLOP_AVOIDANCE.md. Güvenilirlik: AI_GUIDELINES.md.
Kullanıcının sağladığı API anahtarı/EAS hesabı yok. Bunlar varmış gibi kabul raporu yazılmaz.

## Hazır kod
- Ana ekran, gerçek CameraView, galeri seçimi, JPEG yeniden kodlama, gönderim öncesi izin/önizleme.
- Sonuç: özet, alerjen ayrımı, kişisel eşleşme, katkı açıklaması, içerik ve birebir kanıt metni.
- 50 yerel kayıt, Türkçe geçmiş araması, tekil/tam silme, tercihler, SecureStore token, gizlilik/koşullar.
- Express API: ortak Zod şeması, tek Gemini çağrısı, kanıt doğrulama, auth/kota/timeout/boyut koruması.
- Rakip araştırması docs/COMPETITOR_RESEARCH.md içinde. Yuka/Fig resmi sayfaları ve mağaza yorumları okundu.

## Son çalıştırılanlar
- Strict typecheck temiz. Lint 0 hata/uyarı. 33 birim/HTTP testi geçti.
- Nihai app.json ile expo-doctor 20/20 geçti.
- npm audit: 0 yüksek/kritik; Expo/lint araç zincirinde 21 orta seviye bulgu raporlandı. Uyumsuz majör downgrade uygulanmadı.
- Web önizleme 8081, anahtarsız API 8787 çalışıyor.
- 7/7 Playwright testi geçti. 390px ana ekran/sonuç/önizleme gözle incelendi; 320/360/390/1440 taşma kontrolü geçti.
- Android/iOS/web bundle, üretim API bundle ve bundle üzerinden HTTP smoke geçti.
- Son toplu `npm run verify` başarılı. Tarayıcı runtime konsolu ana ekran/örnek/içerikte temiz.
- README, RELEASE_RUNBOOK, VERIFICATION ve ASSUMPTIONS_AND_RISKS güncel.

## Sonraki kesin adımlar
1. Kod doğrulaması tamamlandı; sır deseni taramasında eşleşme yok. Kod commit'i `1bfdc25` origin/main'e push edildi ve uzak hash teyit edildi.
2. Kullanıcı anahtar eklediğinde gerçek Gemini çağrısı ve 20 etiket kalite/gecikme kabulü.
3. Fiziksel Android kamera/izin/fener/TalkBack ve %200 yazı kabulü.
4. Hesap hazır olduğunda HTTPS API + EAS APK. Hesap/anahtar bu oturumda yoktu.

## Claude Code'a kısa devir
`AGENTS.md` ve bu dosyadan başla. Kodda yapay demo fallback yok; örnek kasıtlı ve işaretli.
Yerel başlangıç: `npm ci`, `npm run api`, ayrı terminal `npm start`; web `npm run web`.
Gerçek key yalnız GEMINI_API_KEY. Fiziksel telefon için EXPO_PUBLIC_API_URL bilgisayarın LAN IP'si olmalı.
CI şablonu docs/ci-verify.yml içinde; otomatik GitHub workflow etkinleştirilmedi.
Harici kabul işleri için RELEASE_RUNBOOK.md; yapılan test sınırları VERIFICATION.md.

## Teslim
Repo: https://github.com/0gsar1m/Food_label_reader
Doğrulanan kod commit'i: 1bfdc25. Bu belge güncellemesi ayrı docs commit'iyle push edilir.
Kullanıcı yeni yön istedi: amaç/rutin/bildirilen hastalık/semptom profili ve bunlara göre etiket yorumu.
PERSONALIZATION_VISION.md yes/no tablosu, örnek dil ve mimariyi içerir; MASTER_PLAN faz 08–11 eklendi.
Yeni profili mevcut şifresiz depoya ekleme. Alerjen tercihlerinin mevcut aktarılmama davranışını sessizce değiştirme.
Bu tur ürün değerlendirmesi ve plan güncellemesidir; yeni özelliğin kodlandığını iddia etme.
