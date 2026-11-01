# Aktif bağlam

1 Kasım 2026. Etiket: Expo SDK 58 React Native Android/iOS + web kabul önizlemesi, Node API.
Kullanıcı tüm fazların soru sormadan uygulanmasını, test edilmesini ve GitHub push istedi.
Son ek direktif: Gmail adresiyle Google hesabından kayıt/giriş. Uygulandı; gerçek OAuth kabulü için client ID yok.
Etkin faz: 08–12 kod ve yerel kabul tamamlandı, GitHub teslimi doğrulandı.

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
- Kişisel yorum Claude Opus 5.5, kaynak ID kontrolü, Sonnet yapılandırılabilir; sessiz fallback yok.
- Opus forced-tool desteklemez; JSON output_config.format ve ayrı Zod kontrolü kullanılır.
- Google GIS web / Nitro Credential Manager native; server Google JWK+audience+issuer+expiry+verified-email.
- Ayrı 24h uygulama JWT, güvenli saklama ve origin bağı. Bulut kullanıcı DB/senkronizasyonu yok.
- Profil/günlük/anahtar, geçmiş ve alerjen tercihleri hesap/misafir bazında ayrılır.
- Hesap değişirken önceki veri gösterilmez, bekleyen yazılar eski kimliğe bağlı kalır.

## Çalıştırma ve kabul
- npm ci; ayrı terminaller npm run api ve npm start. Web geliştirme npm run web.
- npm run test:e2e önce export üretir, 8082 statik önizlemede tek worker kullanır. Paralel iki koşu başlatma.
- 69 birim/HTTP testi ve 11 ekran testi geçti. Lint/typecheck temiz; expo-doctor 20/20.
- Nihai npm run verify başarılı: Android/iOS/web export + API bundle + bundle HTTP smoke geçti.
- npm audit: 0 yüksek/kritik, 22 orta araç zinciri bulgusu; uyumsuz force downgrade yapılmadı.
- Gerçek sağlayıcı çağrısı, Google OAuth ve native cihaz kabulü yapılmadı. VERIFICATION.md sınırları açıklar.

## Dış yapılandırmalar
- Sunucu: GEMINI_API_KEY, ANTHROPIC_API_KEY, PERSONAL_MODEL=claude-opus-5-5.
- Google: public OAuth client ID'leri, server GOOGLE_CLIENT_IDS ve 32+ karakter SESSION_SECRET.
- Native Google girişi Expo Go'da yok; APK/development build gerekir. iOS gerçek ID app.config.ts plugin'ini açar.
- Google-only production anonim API açmaz. REQUIRE_GOOGLE_AUTH=true yalnız kullanıcı oturumu ister.
- Fiziksel telefon için EXPO_PUBLIC_API_URL LAN IP; yayında HTTPS.
- Hesap/anahtar verilmedi; bunları varmış gibi raporlama. GOOGLE_AUTH.md ve RELEASE_RUNBOOK.md takip edilir.

## Demo ve giderler
DEMO_SCRIPT.md beş dakikalık akış. npm run costs senaryoları tekrar üretir.
1000 aktif / 20000 tarama / %50 yorum: Opus toplam yaklaşık $1012/ay; Sonnet yaklaşık $640/ay.
Bunlar token/hacim varsayımlarıdır; gerçek fatura değildir. Gemini 2027 fiyat değişimi ayrı hesaplandı.

## Son teslim işlemi
Repo https://github.com/0gsar1m/Food_label_reader. Doğrulanan yeni kapsam kod commit'i 45308ef.
origin/main push başarılı ve uzak hash eşleşti. Bu teslim kaydı ayrı docs commit'iyle gönderilir.
Sonraki kod dışı kabul: gerçek iki sağlayıcı çağrısı, 20 etiket/sağlık senaryosu ve native OAuth/erişilebilirlik.
