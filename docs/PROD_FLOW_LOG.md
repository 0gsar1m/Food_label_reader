# Nazif / Üretim akışı prova kaydı

10 Kasım 2026, İstanbul. API, yerelde üretim ayarıyla ve süreç içinde üretilen erişim belirteciyle çalıştırıldı. Gemini çağrıları gerçek sağlayıcıya, barkod sorgusu gerçek kataloğa gitti. Fotoğraflar ve öğün kayıtları kurgu test verisiydi. Süreler yerel HTTP isteğinden dönüşe kadar tekil örneklerdir. Parola, anahtar, gerçek sağlık bilgisi ve tam istek gövdesi kaydedilmedi.

## Çalıştırma sırası

1. İlk provada sunucuya `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-3.8-flash` ve `PERSONAL_MODEL=gemini-3.1-flash-lite` verildi. İki model aynı anahtarı kullandı. Üretim açılışında geçerli Google oturumu veya sunucu erişim belirteci gerekir. HTTPS ve izin verilen web origin’leri yayın ortamında yapılandırılır.
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

## 10 Kasım ek kabulü

Normal etiket ve kişisel yorum uçları, korumalı HTTPS üzerinden Gemini 3.5 Flash-Lite ile test edildi. Girdiler test etiket fotoğrafı ve sentetik öğün kayıtlarıydı. Yorum isteğinde kurgu senaryo işareti kullanılmadı ve yorum, fotoğraftan yeni çıkarılan analizi aldı.

| Adım | Sonuç |
| --- | --- |
| HTTPS servis durumu | 200, erişim anahtarı zorunlu |
| Anahtarsız analiz isteği | 401 |
| Etiket fotoğrafından içerik çıkarımı | 200, 1.617 giriş ve 803 çıkış tokenı |
| İlk kişisel yorum ve öğüne bağlı takip sorusu | 200, 1.616 giriş ve 292 çıkış tokenı |
| Yanıt sonrası yeniden yorum | 200, 1.621 giriş ve 300 çıkış tokenı. Bu yanıtta süt ayrıntısı açıkça yer almadı, model talimatı ardından güncellendi. |

Farklı çağrılarda sağlayıcı 503 döndürdü. Tam canlı provada etiket, yorum, takip cevabı, profil sorusu ve menü 200 döndü, ayrı barkod kataloğu 502 verdi. Geçici HTTPS uç noktasında profil sorusu isteği JSON yerine HTML hata yanıtı aldı. Bu gözlemler kalıcı servis sürekliliği veya fiziksel kamera kabulü sayılmaz.

Sonraki canlı cevap testi 200 döndü ve model 60 g yulaf ile 200 ml süt içeren öğünü 30 g yulaf ve su ile hazırlanan belirtisiz öğünle karşılaştırdı. Gemini 503 için ilk isteğin süre sınırı içinde tek tekrar eklendi.

Öncelikli Gemini isteği mevcut anahtarla 200 döndü, yanıt başlığındaki gerçekleşen hizmet seviyesi standard oldu. Mevcut anahtarla öncelikli işleme doğrulanmadı. Ölçülen 4.854 giriş ve 1.395 çıkış tokenı, 10 Kasım standart ücretli tarifesiyle (milyonda 0,30 ve 2,50 USD) tam akış başına yaklaşık 0,00494 USD eder. Bu rakam tek örneklemden hesaplandı ve barındırma dahil değildir. [Gemini ücretleri](https://ai.google.dev/gemini-api/docs/pricing)

## Mobil bağlantı ve profil sorusu düzeltmesi

Sentetik profille yeniden üretimde Gemini soru önerisi döndürdü. Boş etiket özeti ortak yanıt şeması tarafından reddedildi ve API 502 verdi. Soru görevi için ayrı şemaya geçildi. Ardından telefonun kullandığı HTTPS adresinde, erişim başlığı olmadan profil sorusu 200 ve test etiket fotoğrafı 200 döndü. Aynı servis başka denemelerde geçici sağlayıcı hatası veya zaman aşımı da döndürdü.

Sunum için erişim 11 Kasım İstanbul gün sonuna kadar ve sunucu süreci başına 30 anahtarsız istekle sınırlıdır. Gemini anahtarı sunucuda kalır. Telefon kurulum ve kamera kabulü fiziksel cihazda yapılır.

## Railway bulut kabulü

Bulut dağıtımında anahtarsız /health 200, profil sorusu 200 ve test etiketi okuma 200 döndü. Üretim fotoğraf modeli Gemini 3.5 Flash, kişisel görev modeli Gemini 3.5 Flash-Lite. İlk testlerde bazı istekler 502 PROVIDER_UNAVAILABLE döndürdü. Tek 503 tekrarında karşı model yapılandırıldı. Fotoğraf isteğinde yedek Flash-Lite 200 ve okunabilir etiket döndürdü. Kişisel yorum isteği Flash-Lite ile 200 ve takip sorusu döndürdü. Cevap sonrası yorum yedek Flash ile 200 döndü ve 200 ml süt ayrıntısını kullandı. Profil ve günlük girdileri sentetik, sağlayıcı çağrıları canlıydı.

Yerel tünel ve önceki API kapatıldı. Railway /health çalışmaya devam etti. GitHub Releases APK dosyası indirildi ve SHA-256 imzalı derleme ile eşleşti. Anahtar APK içeriğinde bulunmadı. [Android sürümü](https://github.com/0gsar1m/Food_label_reader/releases/tag/nazif-android-v3)

Yerel süreçler durdurulduktan sonraki tam akış denemesinde yeni fotoğraf ve ilk kişisel yorum 200 döndü. Cevap sonrası istek 502 PROVIDER_UNAVAILABLE döndürdü. Önceki başarılı yanıt süreklilik garantisi değildir.

### 429 incelemesi

Railway gerçek fotoğraf isteği, dakikalık sayaçta 9 istek hakkı görünürken yaklaşık 5,3 saniyede 429 döndürdü. Aynı görsel ile doğrudan Gemini 3.5 Flash ve 3.6 Flash çağrıları okunabilir çıktı verdi. Railway'e 429 için tek farklı model denemesi ve 60 misafir isteği ayarı yayınlandı. Üretim tekrarında iki fotoğraf isteği 429, soru isteği 502 döndürdü. Google projesinin ödeme/kota durumu doğrulanmadı. Yedek davranışı ve API smoke geçti, toplam 93 birim/API testi geçti.

### Çevrimdışı OCR ve GPT-6 Luna

Kullanıcının noodle etiket fotoğrafı yerelde Türkçe OCR ile işlendi. Ürün metni ayrıştırıcısı glüten ve kereviz için aynı basılı alerjen satırını gösterdi. Railway'de yeni OpenAI aktarım izniyle kişisel yorum HTTP 200 döndü (1.536 giriş, 237 çıkış tokenı). Profil soruları HTTP 200 ve üç öneri döndürdü (595 giriş, 244 çıkış tokenı). Test profili sentetikti, fotoğraf Luna'ya gönderilmedi. Masaüstü OCR, APK içindeki ML Kit'in cihazda çalıştığını tek başına kanıtlamaz.

Ayrı Railway isteğinde aynı etiket metni ve iki sentetik öğün kaydı GPT-6 Luna'dan HTTP 200 döndü. Yanıt iki kaydı da dayanak gösterdi ve takip sorusu üretti. Herkese açık v5 APK indirildi, özeti yerel imzalı paketle eşleşti. Fiziksel Android kabulü açık.
