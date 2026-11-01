# Doğrulama raporu

Tarih: 1 Kasım 2026. Ortam: Windows, Node 24.15.0, npm 11.12.1, Expo SDK 58.

| Kontrol | Sonuç |
|---|---|
| ESLint | 0 hata / 0 uyarı |
| Strict TypeScript | Geçti |
| Birim ve gerçek HTTP API testleri | 69 geçti, 0 başarısız |
| Playwright Chromium | 11 geçti, 0 başarısız |
| expo-doctor | 20/20 geçti |
| Android/iOS/web export | Üç platform da paketlendi |
| Üretim API bundle | Üretildi, 2,1 MB civarı |
| Bundle üzerinden HTTP smoke | Sağlık ve kimlik doğrulama geçti |
| Tarayıcı runtime konsolu | Ana ekran → örnek → içerik akışında hata yok |

## Görsel kabul
- 390px ana ekran, sonuç özeti ve fotoğraf önizlemesi görüntüleri gözle incelendi.
- Ana ekran 320/360/390/1440px genişliklerde çalıştırıldı; document yatay taşması olmadı.
- Sonuç 320px genişlikte çalıştırıldı; yatay taşma olmadı.
- Yeni Google giriş ekranı, profil takip soruları, kişisel porsiyon ve tercihler görüntüleri de gözle incelendi; başlıktaki ters bölü n görüntü hatası düzeltildi.
- Ekran görüntüleri docs/screenshots içinde. Bu rapor her dosyanın tek tek gözle incelendiğini iddia etmez.

## Tarayıcı akış testleri
1. Ana ekran ve farklı viewport'lar.
2. Açık örnek etiketi, içerik/kaynak metni sekmeleri, örneğin geçmişe eklenmemesi.
3. Alerjen tercihinin seçimi, yeniden yüklemede kalması, kişisel eşleşme ve iki taslak hukuki sayfa.
4. Sistem galeri seçicisi, JPEG yeniden kodlama, onaydan önce sıfır istek, sonuç, Türkçe arama, kalıcılık, toplu silme ve vazgeçme.
5. Anahtarsız sunucu hatası ve sahte sonuç üretilmemesi.
6. Kamera izni ekranı ve galeriden devam.
7. Dar ekranda sonuç okunabilirliği.
8. Altı adımlı profil, AES-GCM şifreli kayıt/yeniden açılış, 40g hesap ve günlük CRUD.
9. Açık izin sonrası soru seçimi ve kaynaklı yorum (sağlayıcı test dublörü).
10. Google yapılandırma eksikliği ve hesapsız devam.
11. Kontrollü oturumlarla iki hesap/misafir arasında sağlık kaydı ve alerjen tercihi izolasyonu.

Google kimliği ve model yanıtı testlerde kontrollü dublör veya kontrollü istemci oturumu kullanır; gerçek Google OAuth kabulü değildir.
Fotoğraf/sonuç testlerinde sağlayıcı HTTP yanıtı kontrollü test dublörüdür. Gerçek OCR/model kalitesi ölçülmedi.
API testleri gerçek yerel HTTP sunucusunu açar; upstream sağlayıcı enjekte edilen transport ile sınanır.

## Güvenilirlik ve sınır testleri
Kanıtsız alerjen/içerik, eksik okunabilir sonuç, okunamayan görsele bulgu ekleme, Türkçe büyük/küçük harf,
E kodu olmayan katkı, URL enjeksiyonu, yanlış token, üretimde tokensız başlama, bozuk JSON/görsel,
5 MB sınırı, provider truncation, rate-limit, timeout, CORS ve cache/no-secret davranışı sınandı.
AES-GCM tag bozma/yanlış anahtar, UTF-8, porsiyon/birim/eksik değer, maliyet formülleri, kaynak ve takip sorusu allowlist, JWT imza/süre/issuer/audience ve Google kimlik girdi sınırları da test edildi.
Bu kontroller modelin fotoğraftan uydurduğu transkripsiyonu tek başına saptayamaz; kullanıcı kaynak ambalajı kontrol etmelidir.

## Bağımlılık denetimi
`audit-results.json`: 0 kritik, 0 yüksek, 22 orta seviye dolaylı/araç zinciri bulgusu.
Temel zincir glob/minimatch üzerinden Expo ve lint araçlarına yayılır. Otomatik öneri Expo'yu eski majöre düşürüyordu;
uyumsuz downgrade/force fix uygulanmadı. Uyumlu upstream düzeltmeleri izlenmelidir.
Üretim API çok aşamalı derlenir; runner node_modules/Expo araçları taşımaz. API bundle'da glob/minimatch modülü bulunmadığı kontrol edildi.

## Bu oturumda yapılmayanlar
- Fiziksel Android/iPhone kamera, HEIC, izin/fener, TalkBack/VoiceOver ve native %200 font testi.
- Canlı Gemini isteği, gerçek etiket doğruluğu ve gecikme p50/p95 ölçümü (anahtar yok).
- Gerçek Google OAuth ekranı ve native Credential Manager, SHA-1/iOS callback kabulü (OAuth ID yok).
- EAS hesabı/proje bağlantısı, imzalı APK/AAB ve mağaza yayını (hesap yok).
- Gerçek HTTPS sunucu yayını, Docker engine üzerinden container testi ve nihai hukuk kabulü.

Kod/yerel doğrulama teslimi bu dış kabul adımlarından ayrıdır. Sonraki adımlar RELEASE_RUNBOOK.md içinde.

## Kabul yöntemi düzeltmesi
Geliştirme sunucusunda iki Playwright süreci aynı trace klasörünü kullanınca başarısız/eksik izler oluştu. Bu koşular kabul kanıtı sayılmadı. Sonuçlar tek worker ile export edilmiş web paketi üzerinde tekrarlanan tam test grubuna aittir.
