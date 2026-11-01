# Aktif bağlam

1 Kasım 2026. Etiket: Expo SDK 58 React Native Android/iOS + web kabul önizlemesi, Node API.
Kullanıcı tüm fazların soru sormadan uygulanmasını, test edilmesini ve GitHub push istedi.
Son ek direktif: Gmail adresiyle Google hesabından kayıt/giriş. Uygulandı; gerçek OAuth kabulü için client ID yok.
Etkin faz: 13 / yerel ücretsiz yorum ve demo model seçimi kabulü.

## Başlangıç belgeleri
AGENTS.md → MASTER_PLAN.md → PHASE_STATUS.md. Tasarım: AI_SLOP_AVOIDANCE.md.
AI_GUIDELINES.md; model seçimi MODEL_SELECTION.md; maliyet INVESTOR_COSTS.md.

## Hazır özellikler
- Kamera/galeri, önizleme, ikinci besin tablosu fotoğrafı, tek Gemini Vision çağrısı.
- Kanıtlı içerik/alerjen/katkı, görünür besin değerleri ve deterministik porsiyon hesabı.
- Altı adımlı amaç/rutin/tanı-şüphe/semptom profili; seçimlere göre sorular, LLM ile isteğe bağlı sıralama.
- Öğün/belirti günlüğü CRUD, belirtisiz kayıt, zaman, miktar ve notlar.
- Hassas profil/günlük AES-256-GCM. Native key SecureStore; web yalnız sekme oturum deposu.
- Health verisi Anthropic'e yalnız ayrı açık izin ve düğmeyle; Google'a sağlık profili gönderilmez.
- Yerel profil yorumu API çağrısı yapmaz. Demo bulutu Sonnet 5.5; ekonomi komutu Haiku 5.5.
- Opus forced-tool desteklemez; JSON output_config.format ve ayrı Zod kontrolü kullanılır.
- Google GIS web / Nitro Credential Manager native; server Google JWK+audience+issuer+expiry+verified-email.
- Ayrı 24h uygulama JWT, güvenli saklama ve origin bağı. Bulut kullanıcı DB/senkronizasyonu yok.
- Profil/günlük/anahtar, geçmiş ve alerjen tercihleri hesap/misafir bazında ayrılır.
- Hesap değişirken önceki veri gösterilmez, bekleyen yazılar eski kimliğe bağlı kalır.

## Çalıştırma ve kabul
- npm ci; ayrı terminaller npm run api ve npm start. Web geliştirme npm run web.
- npm run test:e2e önce export üretir, 8082 statik önizlemede tek worker kullanır. Paralel iki koşu başlatma.
- 74 birim/HTTP testi ve 11 ekran testi geçti. Lint/typecheck temiz; expo-doctor 20/20.
- Nihai npm run verify başarılı: Android/iOS/web export + API bundle + bundle HTTP smoke geçti.
- npm audit: 0 yüksek/kritik, 22 orta araç zinciri bulgusu; uyumsuz force downgrade yapılmadı.
- Gerçek sağlayıcı çağrısı, Google OAuth ve native cihaz kabulü yapılmadı. VERIFICATION.md sınırları açıklar.

## Dış yapılandırmalar
- Sunucu: GEMINI_API_KEY, ANTHROPIC_API_KEY, PERSONAL_MODEL=claude-sonnet-5-5.
- Google: public OAuth client ID'leri, server GOOGLE_CLIENT_IDS ve 32+ karakter SESSION_SECRET.
- Native Google girişi Expo Go'da yok; APK/development build gerekir. iOS gerçek ID app.config.ts plugin'ini açar.
- Google-only production anonim API açmaz. REQUIRE_GOOGLE_AUTH=true yalnız kullanıcı oturumu ister.
- Fiziksel telefon için EXPO_PUBLIC_API_URL LAN IP; yayında HTTPS.
- Hesap/anahtar verilmedi; bunları varmış gibi raporlama. GOOGLE_AUTH.md ve RELEASE_RUNBOOK.md takip edilir.

## Demo ve giderler
DEMO_SCRIPT.md beş dakikalık akış. npm run costs senaryoları tekrar üretir.
Ekonomi alternatifi: 1000 aktif / 20000 tarama ~$111/ay; %50 Haiku ile ~$130/ay. Demo tam Vision+Sonnet çiftleri ~$835 API/ay.
Bunlar token/hacim varsayımlarıdır; gerçek fatura değildir. Eski premium senaryo arşive alındı.

## Son teslim işlemi
Repo https://github.com/0gsar1m/Food_label_reader. Doğrulanan yeni kapsam kod commit'i 45308ef.
origin/main push başarılı ve uzak hash eşleşti. Bu teslim kaydı ayrı docs commit'iyle gönderilir.
Sonraki kod dışı kabul: gerçek iki sağlayıcı çağrısı, 20 etiket/sağlık senaryosu ve native OAuth/erişilebilirlik.

## Son yönlendirme: maliyet ve sıfır token
Kullanıcı pahalı Opus senaryosunu reddetti. Gemini 3.1 Flash-Lite + yerel kurallı yorum varsayılan; bulut Haiku isteğe bağlı.
Yerel yorum gerçek LLM diye etiketlenmez; tam fotoğraf akışı sıfır maliyetli diye sunulmaz. Profil bağlamı cihazda ücretsizdir.
Yeni maliyetler INVESTOR_COSTS.md; eski Opus tablosu INVESTOR_COSTS_PREMIUM.md. 74 birim/HTTP, 11 ekran testi ve üç platform/API derlemesi geçti; 69dc08a main dalına push edildi, uzak hash teyit edildi.

## Son karar: APK demo Vision + Sonnet
Kullanıcı 2–3 deneme için güçlü Vision + Sonnet istedi ve 20000 okuma giderini ayrı sunmayı kabul etti.
Normal API varsayılanı Gemini 3.8 Flash + Sonnet 5.5; api:economy açıkça Lite + Haiku seçer.
3 demo çifti ~$0,125; 20000 Vision+20000 Sonnet ~$835 API tüketimi (aynı token varsayımlarıyla, paylar hariç).
Yerel kurallı yorum ücretsiz kalır. Nihai verify geçti (74 test, üç platform/API paketleri); tek sıra 11 ekran kabulü geçti, 69dc08a main dalına push edildi, uzak hash teyit edildi.

Son kaynak kod teslimi: 69dc08a (yerel yorum + güçlü Vision/Sonnet demo). Hesap/anahtar ve fiziksel APK kabul sınırları değişmedi.
