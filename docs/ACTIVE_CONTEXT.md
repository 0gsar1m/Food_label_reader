# Aktif bağlam

1 Kasım 2026. Etiket: Türkçe Expo SDK58 React Native Android/iOS, web kabul önizlemesi ve Node API.
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
- Yerel kişisel yorum kurallıdır, API çağırmaz; ayrı izin/düğmeyle kaynaklı Claude açıklaması.
- Yeni günlük: scanId, tüketim teyidi, pending/symptom_free/symptoms, teyitli bileşenler, şiddet, gecikme, bağlam ve isteğe bağlı Bristol tipi. Yerel tarih girişidir, ISO protokolü kullanıcıya gösterilmez. En fazla 100 öğün.
- Gözlemler dördüncü ana sekme: 7/30 gün, paydalı sayımlar. Demo/future dışlanır, pending belirtisiz sayılmaz, bilinmeyen bileşen karşılaştırma grubu olmaz. 3+3 yalnız sunum eşiğidir, klinik doğrulama değildir.
- Restoran kartı yalnız seçili alerjen ve kendi kaçınma tercihini paylaşır, tanıyı paylaşmaz.
- Görüşme raporu Türkçe metin paylaşımı / native geçici PDF / web yazdırılabilir ayrı pencere. HTML escape, normal paylaşım sonrası PDF cleanup.
- Menü/tabak ayrı Zod sözleşmesi ve POST /api/food-context. Menü yazılı kanıt; tabak belirsiz görünüş gözlemi. Teyit edilen öğün günlükte tutulur, sonuç/fotoğraf arşivlenmez. Menü yemek adı bileşen listesine dönüşmez.
- Barkod kamera EAN8/EAN13/UPC-A veya elle GTIN. GET /api/barcode/:code, Open Food Facts v3.6, sınırlı alanlar, 8sn/128KB. LLM yok; kaynak/güncellik/eksik ürün ayrımı ve etiket fotoğrafına dönüş var. Profil/kimlik/fotoğraf kataloğa gönderilmez.
- Yeni API'ler aynı kimlik/IP10/dakika/timeout koruması altında. Fotoğraf ve sağlık içeriği server dosya/DB/loga yazılmaz.

## Model ve gider kararı
Son kullanıcı seçimi korunur: normal npm run api = Gemini 3.8 Flash + Claude Sonnet 5.5. npm run api:economy açıkça Gemini 3.1 Flash-Lite + Haiku 5.5 seçer. Yerel takip her iki modda API'siz. Otomatik yükseltme yok.
Demo 3 tam çift ~$0,125; 20000 güçlü Vision+Sonnet ~$835 API, pay/hosting hariç.
1000 aktif / toplam20000 fotoğraf / %15 pay / $25 hosting: Lite+yerel ~$111,25; Lite+%10 Sonnet ~$184,85. Bunlar token/hacim varsayımlarıdır, gerçek fatura veya kota garantisi değildir. npm run costs tekrar üretir.
Ücretli abonelik/tahsilat ve kullanıcı bazında ticari kota uygulanmadı; IP kotası finansal limit değildir.

## Son doğrulama
- npm run verify geçti: lint, strict typecheck, 87 birim/HTTP, Android/iOS/web export, API bundle ve bundle HTTP smoke.
- Son npm run test:e2e: 14/14 geçti, tek worker, statik export/8082. İki e2e veya aynı dist'e export süreçlerini paralel çalıştırma.
- expo-doctor20/20. npm audit0 yüksek/kritik,23 orta araç zinciri bulgusu; expo-sharing de config-plugins zincirinden etkileniyor. Force downgrade yapılmadı.
- Yeni 320/390/1440 gözlem görüntüleri, 390 restoran/menü görüntüleri incelendi; başlık satır kırılması ve uzun düğme sarması düzeltildi.
- Model ve katalog testleri kontrollü transport yanıtlarıdır. tests/fixtures/example-menu.png açıkça kurgu test menüsüdür. Gerçek ürün/model doğruluğu kanıtı değildir.
- Bir verify koşusu Vitest başlangıcında raporsuz kod1 ile çıktı; bağımsız ve sonraki tam verify geçti. Metro cache bir export'ta yeniden taramaya döndü, export/test geçti.

## Dış kabul / tamamlandı diye gösterilmez
Gerçek Gemini/Anthropic çağrısı ve kalite/gecikme/usage ölçümü, Google OAuth, fiziksel kamera/barkod/PDF/TalkBack, HTTPS yayın ve imzalı EAS APK yapılmadı. EAS hesabı/proje bağlantısı ve gerçek anahtar/client ID'ler kullanıcı ortamında ayarlanmalı.
Google native Expo Go'da yok; development/APK gerekir. Hesapsız akış Expo Go'da denenebilir. android/ios elle üretilmez; app.config.ts/plugin kaynaktır.
Sunucu GEMINI_API_KEY, ANTHROPIC_API_KEY; Google OAuth public client ID'leri, GOOGLE_CLIENT_IDS ve 32+ SESSION_SECRET bekler. Fiziksel telefon için API LAN IP; yayında HTTPS.
Klinik FODMAP miktar veritabanı, kesin tetikleyici/güvenli gıda hükmü, OS zamanlanmış bildirim, bulut sağlık sync ve mağaza aboneliği yok. Katalog Türkiye kapsamı ölçülmedi. RELEASE_RUNBOOK.md sonraki dış kabul listesidir.

## Araştırma sınırı
My GutIQ resmi site/mağaza/gizlilik/koşullar/blog dizini, kamuya açık web girişi ve üç mağaza görseli incelendi. Onay verilmedi, hesap açılmadı; giriş sonrası ekranlar kullanılmadı. App Store1 puan, Play10+ indirme; yorum gövdesi yok, güçlü pazar doğrulaması iddiası kurulmaz. Rakibin modeli/faturası bilinmiyor. Marka/asset/metin kopyalanmadı.

## Teslim sırası
Yeni kapsam ecfc221ff3e595270cdea9eb2e8906053905c2d1 ile origin/main dalına push edildi; git ls-remote ile uzak hash eşleşti. Çalışma ağacı temizdi. Bu teslim kaydı ayrı docs commit ile gönderilir. Sonraki agent uygulamayı yeniden yazmamalı; RELEASE_RUNBOOK içindeki dış kabul adımlarından veya kullanıcının yeni yönlendirmesinden devam etmelidir. Force push veya git kimlik değişimi yapılmadı.
