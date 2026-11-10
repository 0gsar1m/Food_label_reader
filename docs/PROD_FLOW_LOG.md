# Nazif / Üretim akışı prova kaydı

10 Kasım 2026, İstanbul. API, yerelde üretim ayarıyla ve süreç içinde üretilen erişim belirteciyle çalıştırıldı. Gemini çağrıları gerçek sağlayıcıya, barkod sorgusu gerçek kataloğa gitti. Fotoğraflar ve öğün kayıtları kurgu test verisiydi. Süreler yerel HTTP isteğinden dönüşe kadar tekil örneklerdir. Parola, anahtar, gerçek sağlık bilgisi ve tam istek gövdesi kaydedilmedi.

## Çalıştırma sırası

1. Sunucuya `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-3.8-flash` ve `PERSONAL_MODEL=gemini-3.1-flash-lite` verilir. İki model aynı anahtarı kullanır. Üretim açılışında geçerli Google oturumu veya sunucu erişim belirteci gerekir. HTTPS ve izin verilen web origin’leri yayın ortamında yapılandırılır.
2. Kullanıcı **Hesapsız dene** yoluyla yerel demo açabilir. Canlı üretim API’sinde bulut rotalarının erişim yetkisi ayrıca kontrol edilir. `GET /health` yapılandırma durumunu gösterir. Bir anahtarın tanımlı görünmesi sağlayıcının yanıt vereceğini garanti etmez.
3. Fotoğraf önizlemesi kullanıcıya gösterilir. Onayla `POST /api/analyze` çağrılır. API görseli Gemini’ye yollar ve şema ile etiket kanıtını kontrol eder. Görsel çağrıya profil veya öğün geçmişi eklenmez. Menü/tabak `POST /api/food-context` kullanır. Barkod `GET /api/barcode/:code` üzerinden kataloğa gider.
4. Cihazdaki yorum, ortak bileşen ve tamamlanmış öğün kayıtlarını eşleştirir. Ek model çağrısı yapmaz.
5. Kullanıcı Gemini aktarımına izin verip **Bulut modeliyle ayrıntılandır** dediğinde `POST /api/personalize` etiket metnini, profil özetini ve en fazla 20 öğün kaydını gönderir. Eski sağlayıcı izni Gemini iznine dönüşmez. Gemini yanıtındaki dayanak kimlikleri doğrulanır.
6. Karşılaştırmayı değiştirecek bilgi eksikse belirli bir öğüne bağlı soru çıkar. **Cevabı kaydet ve yeniden yorumla**, cevabı önce ilgili öğünün notuna ekler. Ardından ikinci Gemini isteği güncel notu taşır. Öğün miktarı ve yanında tüketilen gıda birlikte değiştiyse sonuç bunu belirsizlik olarak gösterir. Kurgu senaryonun cevabı yalnız o ekran oturumunda kalır.
7. **Hazır yanıtlarla prova yap**, model erişimi sorunluysa aynı ekran akışını yerel, işaretli kurgu yanıtlarla gösterir. Bu düğme API çağırmaz.

## Canlı prova olayları

| Adım | Sonuç | Gözlem |
|---|---|---|
| Sağlık kontrolü | 200 | Gemini 3.8 Flash fotoğraf ve 3.1 Flash-Lite kişisel yorum yapılandırıldı. |
| Yetkisiz üretim isteği | 401 | Fotoğraf API’si sağlayıcıya gitmeden reddetti. |
| Gemini aktarım izni yok | 400 | Kişisel yorum isteği sağlayıcıya gitmeden reddedildi. |
| Google giriş | 503 | OAuth istemci ayarı bulunmadı. Canlı Google oturumu denenemedi. |
| Kurgu etiket fotoğrafı | Başarılı canlı sonuç alınmadı | Gemini 3.8 Flash 503 döndürdü. Uygulama 502 / PROVIDER_UNAVAILABLE döndürdü. |
| Kurgu menü fotoğrafı | Başarılı canlı sonuç alınmadı | Sağlayıcı 503 ve bir denemede API’nin 35 sn zaman aşımı gözlendi. |
| Flash-Lite ilk yorum | 200, 17,2 sn | 1.639 girdi / 410 çıktı tokenı. Model 60 g ve 30 g yulaf öğünlerini ve belirtili/belirtisiz sonuçları doğru ayırdı. Genel bir kayıt önerisi ve ilgisiz bir katkı maddesi açıklaması da ekledi. İlk çıktıda özel takip alanı yoktu. Bu bulgudan sonra ortak bileşenli örneklerde eksik eşlik eden gıda için uygulama tarafında takip sorusu eklendi. |
| Takip cevabıyla canlı tekrar | 502 | Kurgu cevapla doğrudan yeniden değerlendirmede sağlayıcı 503 döndürdü. Canlı ikinci yorum kabulü açık. |
| Flash-Lite profil soru seçimi | 200, 3,3 sn | 872 girdi / 322 çıktı tokenı. İzinli rutin, zamanlama ve bağlam soruları döndü. Başka bir deneme zaman aşımına girdi. |
| Normal Flash ile yorum karşılaştırması | 502 | Sağlayıcı 503 döndürdü. Flash-Lite varsayılanı korundu. |
| Canlı Open Food Facts barkod | 200, 0,2–0,4 sn | `3017620422003` için katalog kaydı döndü. |

İlk başarılı Flash-Lite yorumunun liste fiyatıyla yaklaşık maliyeti `1639 × $0,25 / 1.000.000 + 410 × $1,50 / 1.000.000 = $0,001025`. Başarısız denemelerin fatura durumunu sağlayıcı yanıtından belirlemedik. [Gemini tarifesi](https://ai.google.dev/gemini-api/docs/pricing?frmapp=yes)

## Denetimli doğrulama ve kalan kabul

- Tarayıcı testi, kurgu profil → aktarım izni → ilk karşılaştırma → takip sorusu → cevap → ikinci yorum akışını kontrollü sağlayıcı yanıtıyla doğruladı. İkinci istek güncellenmiş öğün notunu taşıdı. Şifreli gerçek günlük değişmedi.
- Mevcut fotoğraf, menü, barkod, izin ve hesap ekran testleri ayrı çalıştırıldı. Gerçek telefon kamerası, Google OAuth, imzalı APK ve internet üzerindeki HTTPS üretim ortamı kabulü sırada.
- Aynı canlı provayı yerelde `npm run test:live-demo` ile tekrarla. Komut kurgu veri kullanır ve gerçek Gemini çağrıları faturalandırılabilir. `--comment-only` fotoğraf isteklerini atlar. `--answer-only` kurgu takip cevabıyla ikinci yorumu tek başına sınar. `--inspect-synthetic` yalnız bu provadaki kurgu model metnini konsola yazar.

Son kabul: `npm run verify` geçti (88 test, üç platform export, API bundle ve smoke). `EXPO_PUBLIC_API_URL=http://localhost:8787` ile web paketinde 15 ekran testi geçti. Hazır prova yolu iki model çağrısı yerine sıfır sağlayıcı çağrısıyla ilk soru, cevap ve ikinci değerlendirmeyi gösterdi. İlk ekran koşusundaki hesap testi, testin beklediği localhost ile LAN adresi farklı olduğu için zaman aşımına girmişti. Web test paketi localhost adresiyle yeniden oluşturulunca geçti.

Bu canlı provada 429 gözlenmedi. Google, kota/istek sınırı için 429 ve geçici servis erişilemezliği için 503 belgeler. [Google hata kodları](https://ai.google.dev/gemini-api/docs/generate-content/api-errors?hl=en)
