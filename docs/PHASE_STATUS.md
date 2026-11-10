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

## Faz 17 / Gemini yorum ve takip

Gemini fotoğraf ve yorum aynı anahtarı kullanır. Kurgu senaryo, takip cevabı ve ikinci istek tarayıcıda kontrollü yanıtla doğrulandı. Canlı yorum kısmen çalıştı. Model fotoğrafı ve cevap sonrası canlı yorum sağlayıcı 503 nedeniyle açık. Ayrıntı PROD_FLOW_LOG.md dosyasında.

Profil metni: 390 px web önizlemesinde açık uçlu adımlar ve kahvaltı örneği görüldü. Verify ve 88 test geçti.

Profil soru özelleştirme: tarayıcıda 503 mesajı, yerel sorularla devam ve tekrar denemede başarı doğrulandı. Verify geçti.

Profil soru metni ve veri açıklaması: 89 birim/API, verify ve 3 profil ekran testi geçti. Kontrollü model yanıtı yeni soru olarak gösterildi. Canlı Gemini provası 502 PROVIDER_UNAVAILABLE döndürdü.

## Faz 18 / Android APK ve canlı okuma

Gemini 3.5 Flash-Lite ile korumalı HTTPS üzerinden etiket okuma, kişisel yorum ve cevap sonrası yeniden yorum 200 döndü. Etiket fotoğrafı ve günlük verileri test girdisiydi, normal API yolu kullanıldı. Fiziksel telefon, Google giriş ortamı ve kalıcı API barındırması dış kabulde.

Lint, strict typecheck, 90 test, üç platform export ve derlenmiş API smoke geçti. Windows Gradle release APK, geliştirme imzası v2, ARM64 hedefi, Nazif adı ve gömülü Android bundle doğrulandı. Geçici HTTPS üzerinden APK yanıtı 200 döndü.

Bağlantı ve soru önerisi düzeltmesinden sonra 91 birim/API testi, üç profil ekran testi, üç platform export ve derlenmiş API smoke geçti. Süreli misafir erişiminde gerçek Gemini soru ve fotoğraf uçları erişim başlığı olmadan 200 döndü.

## Faz 19 / Bulut API ve Android güncellemesi

Railway üretim dağıtımı başarılı. Önceki yerel tünel ve ona bağlı sunucu durdurulduktan sonra bulut sağlık kontrolü 200 döndü. Android sürüm kodu 3, mevcut imza ve bulut origin'i doğrulandı. GitHub Releases üzerinden indirilen APK'nın SHA-256 özeti yerel imzalı APK ile eşleşti. Fiziksel cihaz kabulü ayrı.

Lint, strict typecheck, 92 birim/API testi, üç platform export, Android release ve derlenmiş API smoke geçti. Canlı kabul ve Gemini yedek model kanıtı PROD_FLOW_LOG.md dosyasında.

Android profil sonucu düzeltmesinde 92 birim/API testi ve üç profil tarayıcı testi geçti. Tarayıcı testinde başarısız istekten sonra sayfa yenilendi, beşinci adım ve izin seçimi geri geldi, tekrar denemede öneri gösterildi. Bulut Gemini profil isteği 200 ve üç öneri döndürdü. Kullanıcının telefonundan native çökme kaydı alınmadı.

## Faz 20 / Çevrimdışı OCR ve GPT-6 Luna

Gerçek noodle fotoğrafı masaüstü OCR ile işlendi. Aynı metin ayrıştırıcı glüten ve kereviz beyanını etiket kanıtıyla çıkardı. Railway'de GPT-6 Luna 200 ile yorum ve üç soru döndürdü. Android derlemesi ve fiziksel cihaz kabulü ayrı izlenir. Besin tablosunda doğrulanmamış sütunlardan miktar hesaplanmaz.

Android sürüm kodu 5 derlendi ve GitHub Releases üzerinden yayınlandı. APK imzası, paketlenmiş çevrimdışı model ve sunucu adresi doğrulandı. Lint, typecheck, 95 birim/API, üç profil tarayıcı testi, üç platform export ve API smoke geçti.

Açık kabul: fiziksel Android'de uçak modunda gerçek fotoğrafı okut, ardından interneti açıp OpenAI izniyle soru ve kişisel yorum iste. Sonuçlar kullanıcıdan veya cihaz testinden gelene kadar fazın donanım kabulü açık. [Uygulama adımları](ACTIVE_CONTEXT.md#claude-code-için-devam-noktası)

10 Kasım 2026: Android v6 (ad6fafb) GitHub Releases üzerinden yayımlandı. APK sürüm kodu, geliştirme imzası, yükleme özeti ve herkese açık indirme doğrulandı. Railway v6 dağıtımı başarılı; gerçek noodle etiketinin masaüstü OCR metni ve sentetik günlükle canlı Luna yorumu doğrulandı. Fiziksel Android kabulü açık.

## Faz 21 / v8–v10 düzeltmeleri ve Luna yorum iyileştirmesi

APK versionCode sırası: v8 (aaac034) → v9 (0b5b94e, .env Railway URL) → v10 (b293f18, evidence normalization fix).

| Değişiklik | Commit | Durum |
|---|---|---|
| Review ekranı yerleşik spinner + iptal | aaac034 | Tamamlandı |
| Luna yorum istemi yeniden yazıldı | aaac034 | Tamamlandı |
| server/prompt.ts kanıt talimatı güçlendirildi | 02f4247 | Tamamlandı |
| shared/analysis.ts noktalama normalizasyonu | 02f4247 | Tamamlandı — INVALID_RESULT sorunu çözüldü |
| .env ile Railway URL APK'ya bake | 0b5b94e | Tamamlandı |
| build.gradle ARM64 ABI splits (43 MB) | b293f18 | Tamamlandı |
| versionCode 10, etiket v1.0.10 | b293f18 | Tamamlandı |

Kabul kanıtı: kullanıcı v10 APK ile gerçek cihazda noodle etiketini başarıyla taradı ("tamam çalıştı"). Railway sağlık ucu `configured: true, personalConfigured: true`. 95/95 birim/API testi, TypeScript strict temiz.

Açık: Luna granola senaryosu (3 tüketim durumu) cihazda formal test edilmedi. GitHub Releases v10 manuel yükleme bekliyor (gh CLI yok).

Derleme zorunluluğu: Kök dizinde `.env` → `EXPO_PUBLIC_API_URL=https://nazif-api-production.up.railway.app` (gitignored).

## Faz 22 / v11

Yeni okumada açık izin varsa profil özeti, son 20 öğün ve okunan etiket metni Luna yorumuna gider. İzin kapalıyken etiket okunabilir. Fotoğraf okuma ve kişisel yorum için animasyonlu bekleme görünür. İlk kurulumda amaç seçimi zorunlu. Örnek okuma Öğretici altında açılır. Fiziksel v11 cihaz kabulü açık.
