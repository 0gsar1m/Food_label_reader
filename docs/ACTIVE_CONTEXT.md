# Aktif bağlam

11 Kasım 2026. Nazif: Türkçe Expo SDK58 React Native Android/iOS, web kabul önizlemesi ve Node API.
Kullanıcı tüm fazları özerk uygulama, test ve sonunda https://github.com/0gsar1m/Food_label_reader.git repoya normal push yetkisi verdi. Fazlar arasında onay isteme.
Son direktif: Android etiketi ve kişisel yorumu GPT-6 Luna ile hazırla. İlk profilde amaç seçimi zorunlu. Profil aktarımı açık izne bağlı.
Etkin faz: 22. v11, otomatik kişisel yorum ve ilk profil akışı.

## Claude Code için devam noktası

- v11, izinli Luna yorumunu Özet sekmesinde otomatik gösterir. Örnek okuma ana ekrandaki Öğretici penceresinde. v10 taraması fiziksel telefonda kullanıcı tarafından onaylandı.
- Android: Etiket fotoğrafı GPT-6 Luna üzerinden `/api/analyze` ile okunuyor. Offline OCR kaldırıldı. Review ekranında gönder düğmesi yerine yerleşik spinner + "Etiket okunuyor…" gösteriliyor; gövde ve onay metni yükleme sırasında gizli. İkinci fotoğraf yerine iptal düğmesi çıkıyor. Çift gönderim engellendi.
- shared/analysis.ts `normalized()` işlevi noktalama işaretlerini de temizleyecek şekilde güncellendi (`[^\p{L}\p{N}]+` → boşluk). Bu INVALID_RESULT hatasını çözdü; hem server hem APK etkilendiğinden v10 gerekli oldu.
- server/personal.ts Luna yorum istemi yeniden yazıldı: ilk cümle bulunan kaçınılan içeriği adlandırır, süt gibi faktörler günlükteki o öğüne atfedilir, tüketim bilinmiyorsa "Yediysen…" koşullu çerçevesi, "buradan anlayamıyorum" ve benzeri hedge ifadeler engellendi.
- server/prompt.ts kanıt talimatı güçlendirildi: evidence rawText'ten birebir karakter kopyasıdır, parafraz/çeviri/ellipsis yasak.
- android/app/build.gradle: `splits { abi { include 'arm64-v8a'; universalApk false } }` bloğu eklendi → APK 43 MB (önceki 138 MB evrensel build).
- Bulut: Railway `Nazif / nazif-api`, [sağlık ucu](https://nazif-api-production.up.railway.app/health). `server/index.ts` üretimde `OPENAI_API_KEY` ve `OPENAI_MODEL=gpt-6-luna` kullanır. `POST /api/personalize` yeni `openaiConsent` iznini arar. Önceki Gemini izni taşınmaz. Anahtar yerel git dışı `.env` ve Railway servis sırrında. Değeri yazdırma veya kopyalama. Anahtar 10 Kasım'da yedi gün için açıldı. Kullanıcı 5 USD kredi yükledi.
- Misafir erişimi: İstanbul saatiyle 11 Kasım 2026 23.59 sonuna kadar ve Railway süreci başına toplam 60 istek. Bu süre ve kota yalnız bulut işlemlerini etkiler. Yerel tünel kapalı. Google OAuth yapılandırılmadı.
- Doğrulandı: v10 APK gerçek Android cihazda çalıştı ("tamam çalıştı"). Railway sağlık ucu `{"status":"ok","configured":true,"model":"gpt-6-luna","personalConfigured":true}`. 95 birim/API ve 3 profil tarayıcı testi, üç platform export, API smoke. Gerçek noodle fotoğrafı tarama v10 sonrası başarılı.
- Android release derlemesinde EXPO_PUBLIC_API_URL değerini Railway adresi olarak açıkça ver ve APK içindeki adresi doğrula. Eski localhost kaydı için EXPO_PUBLIC_REPLACED_API_URL kullan.
- Sonraki iş: v11 Android cihazda klavye açık profil kaydırması, noodle taraması ve Özet sekmesindeki otomatik yorumun kabulü.
- Sorun çıktığında önce APK sürüm kodunu, hata metnini, uçak modu durumunu ve hangi adımda oluştuğunu ayır. Bulut için önce `/health`, sonra izinli sentetik `/api/personalize` isteği. Sağlık ucu anahtarın tanımlı olduğunu gösterir, kredi veya canlı model çağrısını doğrulamaz. Android için cihaz varsa uygulama paketine filtrelenmiş hata kaydı al ve özel veriyi loglama.

## Önce okunacaklar
AGENTS.md → bu dosya → MASTER_PLAN.md / PHASE_STATUS.md. AI_GUIDELINES.md ve AI_SLOP_AVOIDANCE.md bağlayıcı.
GUTIQ_RESEARCH.md araştırma, parite tablosu ve bilinmeyenleri; INVESTOR_COSTS.md giderleri; VERIFICATION.md gerçek kabul sınırlarını içerir.
Eski çiftlik projesi yalnız metodoloji için okundu, değiştirilmedi. Kod/yorum/commit İngilizce, UI/belgeler Türkçe; strict TS ve Zod. Secret mobil bundle/git/loga girmez.

## Ürün kapsamı
- Kamera/galeri ve EXIF taşımayan küçültülmüş JPEG önizlemesi. Android etiketinde yerel OCR, çevrimiçi görsel yollarında OpenAI. İsteğe bağlı ikinci besin tablosu fotoğrafı.
- Kanıt metinli içerik/alerjen/katkı, contains/may_contain ayrımı, besin tablosu ve deterministik porsiyon.
- Altı adımlı amaç/semptom/tanı-şüphe/rutin profili, koşullu sorular ve kendi kaçınma listesi.
- Google GIS web / Nitro Credential Manager native, server Google JWK/audience/issuer/expiry/verified email; 24h uygulama JWT. Gmail mesaj izni yok.
- Hesap/misafir ayrımı, geçmiş/tercih/profil/günlük izolasyonu. Sağlık vault AES-256-GCM; native key SecureStore; web sekme oturumunda. Bulut sync yok.
- Yerel kişisel yorum kurallıdır, API çağırmaz. Ayrı izin ve düğmeyle GPT-6 Luna üzerinden kaynaklı yorum istenir.
- Yeni günlük: scanId, tüketim teyidi, pending/symptom_free/symptoms, teyitli bileşenler, şiddet, gecikme, bağlam ve isteğe bağlı Bristol tipi. Yerel tarih girişidir, ISO protokolü kullanıcıya gösterilmez. En fazla 100 öğün.
- Gözlemler dördüncü ana sekme: 7/30 gün, paydalı sayımlar. Demo/future dışlanır, pending belirtisiz sayılmaz, bilinmeyen bileşen karşılaştırma grubu olmaz. 3+3 yalnız sunum eşiğidir, klinik doğrulama değildir.
- Restoran kartı yalnız seçili alerjen ve kendi kaçınma tercihini paylaşır, tanıyı paylaşmaz.
- Görüşme raporu Türkçe metin paylaşımı / native geçici PDF / web yazdırılabilir ayrı pencere. HTML escape, normal paylaşım sonrası PDF cleanup.
- Menü/tabak ayrı Zod sözleşmesi ve POST /api/food-context. Menü yazılı kanıt; tabak belirsiz görünüş gözlemi. Teyit edilen öğün günlükte tutulur, sonuç/fotoğraf arşivlenmez. Menü yemek adı bileşen listesine dönüşmez.
- Barkod kamera EAN8/EAN13/UPC-A veya elle GTIN. GET /api/barcode/:code, Open Food Facts v3.6, sınırlı alanlar, 8sn/128KB. LLM yok; kaynak/güncellik/eksik ürün ayrımı ve etiket fotoğrafına dönüş var. Profil/kimlik/fotoğraf kataloğa gönderilmez.
- Yeni API'ler aynı kimlik/IP10/dakika/timeout koruması altında. Fotoğraf ve sağlık içeriği server dosya/DB/loga yazılmaz.

## Model ve gider kararı
Android yerel OCR için model API ücreti yoktur. GPT-6 Luna yorum, profil sorusu ve takip cevabı ayrı bulut istekleridir. Ölçülen Luna token sayıları [üretim akışı kaydında](PROD_FLOW_LOG.md). Eski model maliyet tabloları tarihsel karşılaştırmadır.
Ücretli abonelik/tahsilat ve kullanıcı bazında ticari kota uygulanmadı; IP kotası finansal limit değildir.

## Önceki fazların doğrulama geçmişi
- npm run verify geçti: lint, strict typecheck, 87 birim/HTTP, Android/iOS/web export, API bundle ve bundle HTTP smoke.
- Son npm run test:e2e: 14/14 geçti, tek worker, statik export/8082. İki e2e veya aynı dist'e export süreçlerini paralel çalıştırma.
- expo-doctor20/20. npm audit0 yüksek/kritik,23 orta araç zinciri bulgusu; expo-sharing de config-plugins zincirinden etkileniyor. Force downgrade yapılmadı.
- Yeni 320/390/1440 gözlem görüntüleri, 390 restoran/menü görüntüleri incelendi; başlık satır kırılması ve uzun düğme sarması düzeltildi.
- Model ve katalog testleri kontrollü transport yanıtlarıdır. tests/fixtures/example-menu.png açıkça kurgu test menüsüdür. Gerçek ürün/model doğruluğu kanıtı değildir.
- Bir verify koşusu Vitest başlangıcında raporsuz kod1 ile çıktı; bağımsız ve sonraki tam verify geçti. Metro cache bir export'ta yeniden taramaya döndü, export/test geçti.

## Dış kabul / tamamlandı diye gösterilmez
Gerçek Gemini ve barkod prova kayıtları PROD_FLOW_LOG.md içinde. Google OAuth, fiziksel cihaz, HTTPS yayın ve imzalı APK ayrı kabul bekler. EAS hesabı/proje bağlantısı ve gerçek anahtar/client ID'ler kullanıcı ortamında ayarlanmalı.
Google native Expo Go'da yok; development/APK gerekir. Hesapsız akış Expo Go'da denenebilir. android/ios elle üretilmez; app.config.ts/plugin kaynaktır.
Sunucu GEMINI_API_KEY, ANTHROPIC_API_KEY; Google OAuth public client ID'leri, GOOGLE_CLIENT_IDS ve 32+ SESSION_SECRET bekler. Fiziksel telefon için API LAN IP; yayında HTTPS.
Klinik FODMAP miktar veritabanı, kesin tetikleyici/güvenli gıda hükmü, OS zamanlanmış bildirim, bulut sağlık sync ve mağaza aboneliği yok. Katalog Türkiye kapsamı ölçülmedi. RELEASE_RUNBOOK.md sonraki dış kabul listesidir.

## Araştırma sınırı
My GutIQ resmi site/mağaza/gizlilik/koşullar/blog dizini, kamuya açık web girişi ve üç mağaza görseli incelendi. Onay verilmedi, hesap açılmadı; giriş sonrası ekranlar kullanılmadı. App Store1 puan, Play10+ indirme; yorum gövdesi yok, güçlü pazar doğrulaması iddiası kurulmaz. Rakibin modeli/faturası bilinmiyor. Marka/asset/metin kopyalanmadı.

## Teslim sırası
Yeni kapsam ecfc221ff3e595270cdea9eb2e8906053905c2d1 ile origin/main dalına push edildi; git ls-remote ile uzak hash eşleşti. Çalışma ağacı temizdi. Bu teslim kaydı ayrı docs commit ile gönderilir. Sonraki agent uygulamayı yeniden yazmamalı; RELEASE_RUNBOOK içindeki dış kabul adımlarından veya kullanıcının yeni yönlendirmesinden devam etmelidir. Force push veya git kimlik değişimi yapılmadı.

## Nazif adı
Uygulamanın görünen adı, raporlar ve API servis adı Nazif oldu. Mevcut kurulum ve veri uyumluluğu için uygulama kimliği, Expo slug, URL şeması ve depolama anahtarları korundu.

Faz 15 kabulü: lint/typecheck, 87 birim/API, 14 ekran, Android/iOS/web export ve API smoke geçti. Yerel telefon ayarı hazırlandı. Gerçek etiket denemesi için Gemini API anahtarı gerekiyor.

Etiket sonuçlarında yerel kişisel yorum, bir bileşeni son 20 tamamlanmış gerçek öğün kaydıyla tam ad üzerinden eşleştirir. Öğün adı, tarih, belirtiler ve belirtisiz örnekler birlikte gösterilir. Sonnet anahtarı bu akış için gerekmez.

Faz 17: kurgu senaryo ve takip sorusu tamamlandı. Gemini’ye özgü izin eski sağlayıcı iznini devralmaz. Ayrıntılı yorumda kullanıcı cevabı ilgili öğüne yazılır, sonra yeniden yorumlanır.

Kullanım profilinin açık uçlu adımlarında kısa ve gündelik yazma yönlendirmesi var. Kahvaltı sorusu örnek bir cümleyle başlıyor.

Profil soru seçimi için düğmenin yanında bekleme, hata, boş yanıt ve başarı geri bildirimi gösterilir. Servis hatasında mevcut sorularla devam edilebilir.

Kullanım profilinde başlangıç süresi, sıklık, öğün saati ve son belirtili öğün ayrı sorulur. Gemini izinle yalnızca yanıtlanmamış konularda yeni soru metni önerebilir. Soru metni cevabıyla birlikte saklanır. Fotoğraf, soru önerisi ve ayrıntılı yorumun veri kapsamı profil ekranında ayrı anlatılır.

Faz 18: kullanıcı bağımsız kurulan normal Android APK ve canlı Gemini istiyor. Vision ve kişisel yorum varsayılanı Gemini 3.5 Flash-Lite. Modelin fotoğraf şeması hafifletildi, sunucu doğrulaması korundu. Geçici HTTPS üzerinden test etiketinin normal okuma ve kişisel yorum istekleri 200 döndü. Kalıcı HTTPS barındırması, yapılandırılmış Google hesabı girişi ve fiziksel cihaz kabulü ayrı adımlardır.

Yerel Gradle release derlemesi başarılı. Nazif APK ARM64 ve Android 7.0+ için, geliştirme imzası ve gömülü uygulama paketiyle doğrulandı. Geçici HTTPS servisi sunucu bilgisayarının ve tünelin açık kalmasına bağlı. İlk APK servis adresi ve erişim anahtarının Tercihler ekranında girilmesini bekliyordu.

Android bağlantı düzeltmesi: ikinci APK derlemesinde geçici HTTPS adresi varsayılan olarak kullanılır. Kurulumda Gemini anahtarı girilmez. Sunucuya 11 Kasım 2026 sonuna kadar toplam 30 isteklik anahtarsız misafir erişimi açıldı. Soru isteği kendi Gemini yanıt şemasını kullanır, etiket özeti gerektirmez. Bekleme göstergesi ile bağlantı ve yetki hataları ayrı gösterilir.

Faz 19: kullanıcı Railway bağlantısını onayladı. Nazif API için bilgisayardan bağımsız HTTPS alan adı oluşturuldu. Bulut APK sürüm kodu 3. Cihazda önceki tünel adresi kayıtlıysa yalnız o adres taşınır ve eski erişim anahtarı temizlenir. Fotoğrafta Gemini 3.5 Flash, profil ve yorumda 3.5 Flash-Lite seçildi. Sağlayıcı 503 döndürürse süre sınırı içinde diğer Gemini modeli bir kez denenir.

Bulut API `https://nazif-api-production.up.railway.app`. Yerel tünel ve geçici API kapatıldı. İmzalı APK, GitHub Releases `nazif-android-v3` sürümünde yayınlandı. Erişim başlıksız misafir modu İstanbul saatiyle 11 Kasım gün sonuna kadar, sunucu süreci başına 30 istekle açık. Fiziksel telefon kurulumu ve kamera testi ayrı kabul.

Android profil sonucu düzeltmesi: React Native Android'in desteklemediği status erişilebilirlik rolü sonuç metninden kaldırıldı, web rolü ve canlı duyuru korundu. Soru isteği öncesi taslak mevcut şifreli kasaya yazılır. Uygulama yeniden açılırsa soru adımı ve girilen bilgiler geri gelir. Profil kaydedilir veya silinirse taslak temizlenir.

Sürüm 4 APK GitHub Releases üzerinden yayınlandı. Railway'de misafir sınırı 60 isteğe çıkarıldı, mevcut süre sonu korundu. Sağlayıcı 429 döndürdüğünde farklı Gemini modeli bir kez denenir. Fotoğraf yedeği 3.6 Flash. Aynı etiket yerel sağlayıcı çağrısında iki Flash modeliyle okunurken yeni Railway dağıtımında 429 sürdü. Üretim kabulü açık. Kullanıcı cihazda çevrimdışı OCR ve metin temelli kişisel yorum alternatifini gündeme getirdi.

Faz 20 etkin. Android etiket okuması için yerel Expo modülü ve APK'ya gömülü ML Kit eklendi. Yerel ayrıştırıcı etiket kanıtı olmadan alerjen sonucu üretmez. Kullanıcının noodle fotoğrafı çalışma alanı dışından masaüstü OCR ile okutuldu, gerçek metinde glüten ve kereviz beyanı doğrulandı. Bu test Android ML Kit cihaz testi yerine geçmez.

OpenAI projesinde Responses yazma kapsamlı, yedi günlük Nazif anahtarı oluşturuldu ve git dışında .env'e yazıldı. Kullanıcı 5 USD API kredisi yükledi. Üretim hedefi GPT-6 Luna ve bağımsız OpenAI aktarım izni. APK sürüm kodu 5. Bulut kabulü, fiziksel Android OCR ve APK yayın durumu ayrı doğrulanacak. Devam edecek agent .env değerlerini yazdırmadan Railway servisini ve Gradle çıktısını doğrulamalı.

Railway üretim API'sinde gerçek noodle etiketinden masaüstünde çıkarılan metinle GPT-6 Luna kişisel yorum ve soru seçimi ayrı ayrı HTTP 200 döndürdü. Yeni API başlangıç yapılandırması yalnız OpenAI kullanır. OCR'ın Android cihaz kabulü ve APK teslimini aşağıdaki faz kaydından takip et.

APK v5 GitHub Releases `nazif-android-v5` altında yayınlandı. Aynı geliştirme imzası, ARM64, gömülü ML Kit Latin modeli ve Railway adresi doğrulandı. 95 birim/API ve üç profil tarayıcı testi, üç platform export ve API smoke geçti. Fiziksel telefonun uçak modunda OCR kabulü açık.
