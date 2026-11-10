# Aktif bağlam

10 Kasım 2026. Nazif: Türkçe Expo SDK58 React Native Android/iOS, web kabul önizlemesi ve Node API.
Kullanıcı tüm fazları özerk uygulama, test ve sonunda https://github.com/0gsar1m/Food_label_reader.git repoya normal push yetkisi verdi. Fazlar arasında onay isteme.
Son direktif: My GutIQ'yu ayrıntılı araştır, düşük maliyetle yakın Türkçe deneyimi uygula.
Etkin faz: 14. Kod, yerel kabul ve kaynak kod push tamamlandı. Sonraki işler dış hesap/cihaz kabulüdür.

## Önce okunacaklar
AGENTS.md → bu dosya → MASTER_PLAN.md / PHASE_STATUS.md. AI_GUIDELINES.md ve AI_SLOP_AVOIDANCE.md bağlayıcı.
GUTIQ_RESEARCH.md araştırma, parite tablosu ve bilinmeyenleri; INVESTOR_COSTS.md giderleri; VERIFICATION.md gerçek kabul sınırlarını içerir.
Eski çiftlik projesi yalnız metodoloji için okundu, değiştirilmedi. Kod/yorum/commit İngilizce, UI/belgeler Türkçe; strict TS ve Zod. Secret mobil bundle/git/loga girmez.

## Hazır ürün
- Kamera/galeri, EXIF taşımayan küçültülmüş JPEG önizlemesi; tek Vision çağrısı, isteğe bağlı ikinci besin tablosu.
- Kanıt metinli içerik/alerjen/katkı, contains/may_contain ayrımı, besin tablosu ve deterministik porsiyon.
- Altı adımlı amaç/semptom/tanı-şüphe/rutin profili, koşullu sorular ve kendi kaçınma listesi.
- Google GIS web / Nitro Credential Manager native, server Google JWK/audience/issuer/expiry/verified email; 24h uygulama JWT. Gmail mesaj izni yok.
- Hesap/misafir ayrımı, geçmiş/tercih/profil/günlük izolasyonu. Sağlık vault AES-256-GCM; native key SecureStore; web sekme oturumunda. Bulut sync yok.
- Yerel kişisel yorum kurallıdır, API çağırmaz; ayrı izin/düğmeyle kaynaklı Gemini açıklaması.
- Yeni günlük: scanId, tüketim teyidi, pending/symptom_free/symptoms, teyitli bileşenler, şiddet, gecikme, bağlam ve isteğe bağlı Bristol tipi. Yerel tarih girişidir, ISO protokolü kullanıcıya gösterilmez. En fazla 100 öğün.
- Gözlemler dördüncü ana sekme: 7/30 gün, paydalı sayımlar. Demo/future dışlanır, pending belirtisiz sayılmaz, bilinmeyen bileşen karşılaştırma grubu olmaz. 3+3 yalnız sunum eşiğidir, klinik doğrulama değildir.
- Restoran kartı yalnız seçili alerjen ve kendi kaçınma tercihini paylaşır, tanıyı paylaşmaz.
- Görüşme raporu Türkçe metin paylaşımı / native geçici PDF / web yazdırılabilir ayrı pencere. HTML escape, normal paylaşım sonrası PDF cleanup.
- Menü/tabak ayrı Zod sözleşmesi ve POST /api/food-context. Menü yazılı kanıt; tabak belirsiz görünüş gözlemi. Teyit edilen öğün günlükte tutulur, sonuç/fotoğraf arşivlenmez. Menü yemek adı bileşen listesine dönüşmez.
- Barkod kamera EAN8/EAN13/UPC-A veya elle GTIN. GET /api/barcode/:code, Open Food Facts v3.6, sınırlı alanlar, 8sn/128KB. LLM yok; kaynak/güncellik/eksik ürün ayrımı ve etiket fotoğrafına dönüş var. Profil/kimlik/fotoğraf kataloğa gönderilmez.
- Yeni API'ler aynı kimlik/IP10/dakika/timeout koruması altında. Fotoğraf ve sağlık içeriği server dosya/DB/loga yazılmaz.

## Model ve gider kararı
Güncel seçim: normal API Gemini 3.8 Flash fotoğraf + Gemini 3.1 Flash-Lite yorum. İkisi aynı GEMINI_API_KEY kullanır. api:economy fotoğrafta da Lite seçer.
Güncel tahmin: bir fotoğraf $0,00975, bir Flash-Lite yorum $0,0045. Cevap sonrası yorum ayrıca çağrılır.
Geçmiş Sonnet maliyetleri INVESTOR_COSTS.md içinde tarihsel karşılaştırma olarak durur. Canlı Gemini ölçümleri PROD_FLOW_LOG.md içinde.
Ücretli abonelik/tahsilat ve kullanıcı bazında ticari kota uygulanmadı; IP kotası finansal limit değildir.

## Son doğrulama
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
