# Faz durumları

| Faz | Durum | Kabul kanıtı |
|---|---|---|
| 00 Kararlar | Tamamlandı | Plan ve iki ayrı rehber yazıldı |
| 01 Temel | Tamamlandı | Typecheck/lint, expo-doctor 20/20 |
| 02 Görsel sistem | Tamamlandı | Ortak token/font, 320/360/390/1440px kabulü |
| 03 Fotoğraf | Kod ve web kabulü tamamlandı | Galeri/önizleme/izin ekranı; fiziksel kamera kabulü açık |
| 04 Vision | Entegrasyon ve kontrat kabulü tamamlandı | 33 test; canlı anahtar yok, kalite/gecikme ölçülmedi |
| 05 Sonuç ve geçmiş | Tamamlandı | Kanıt sekmeleri, tercih kalıcılığı, Türkçe arama/silme |
| 06 Erişilebilirlik/gizlilik | Kod ve web kabulü tamamlandı | Semantik state, veri pratikleri; native okuyucu ve hukuk kabulü açık |
| 07 Teslim | Kaynak kod teslimi tamamlandı | verify geçti; 1bfdc25 origin/main'e push edildi, uzak hash teyit edildi |
| 08 Profil ve koşullu tanışma | Kod/web kabulü tamamlandı | Altı adım, şifreli saklama, koşullu sorular, izin ve silme |
| 09 Besin tablosu ve porsiyon | Kod/web kabulü tamamlandı | İkinci fotoğraf, kaynaklı değerler, 100g/40g deterministik hesap |
| 10 Kişisel yorum ve günlük | Kod/kontrat kabulü tamamlandı | Opus yapılandırması, kaynak atfı, günlük CRUD; canlı model kalitesi açık |
| 11 Yeni kapsamın kabulü | Kod ve yerel kabul tamamlandı | Nihai verify, 69 birim/API ve 11 ekran testi geçti |
| 12 Google kayıt/giriş | Kod/kontrat kabulü tamamlandı | Google JWK doğrulama, JWT, hesap izolasyonu; gerçek OAuth/native kabulü açık |

## Tamamlandı ifadesinin kapsamı
Kişiselleştirme fazları ve Google giriş kapsamı uygulandı. Canlı model ve gerçek Google OAuth kabulü için hesap/anahtar gerekiyor.
Kaynak kod ve yerel kabul teslimidir. Fiziksel cihaz, canlı model, HTTPS barındırma, imzalı APK ve mağaza yayını ayrıca gerekir.
Eksik hesaplar/anahtarlar varmış gibi tamamlanmış gösterilmez. Ayrıntı: VERIFICATION.md ve RELEASE_RUNBOOK.md.

## Yeni kapsam teslimi
Profil/kişiselleştirme, maliyet modeli ve Google giriş kodu 45308ef ile main dalına push edildi; uzak hash eşleşmesi doğrulandı. Canlı sağlayıcı/OAuth ve native kabul sınırları değişmedi.

## Faz 13: yerel yorum ve demo gideri

| Faz | Durum | Kanıt |
|---|---|---|
| 13 Yerel yorum / demo | Kod ve kabul tamamlandı | API’siz yerel yorum ve ayrı ekonomi modu; son demo kararı güçlü Flash + Sonnet, giderler ayrı |

## Faz 14: My GutIQ uyarlaması

| Faz | Durum | Kanıt |
|---|---|---|
| 14 Araştırma ve Türkçe takip döngüsü | Kod ve yerel kabul tamamlandı | Resmi kaynak/web giriş/görsel araştırma; menü/tabak/barkod, bekleyen kontroller, 7/30 gün gözlemleri, restoran kartı ve rapor. verify87 test/üç platform/API; e2e14/14; expo-doctor20/20. Canlı model/katalog/native PDF-kamera ve imzalı APK ayrı kabul bekler. |

Kaynak: GUTIQ_RESEARCH.md. Bu faz tam rakip klonu veya klinik doğrulama iddiası değildir; parite dışı alanlar ve test sınırları belgede açıkça listelidir.

Faz14 kod/belge teslimi: ecfc221 origin/main dalına push edildi ve uzak hash teyit edildi. 87 test, 14 ekran testi, üç platform/API paketleri ve expo-doctor20/20 geçti. Dış kabul sınırları değişmedi.

## Faz 15 / Nazif adı

Mobil ve web görünen adı, API servis adı ve rapor başlıkları güncellendi. Kurulum kimliği ve depolama anahtarları korundu. Verify ve 14 ekran testi geçti. Gerçek model ve fiziksel cihaz testi sırada.

## Faz 16 / Yerel öğün eşleşmesi

Etiket ve geçmiş öğün bileşeni eşleşmesi uygulandı. Verify, 88 birim/API testi ve üç platformun paketlemesi geçti. Fiziksel cihazda canlı okuma sırada.
