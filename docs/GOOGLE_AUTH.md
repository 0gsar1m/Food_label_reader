# Google hesabıyla kayıt ve giriş

Gmail adresiyle kullanılan Google hesabı üzerinden temel kimlik doğrulaması. Gmail kutusu, mesaj, kişi veya Drive kapsamı istenmez.
İlk doğrulanmış Google girişi uygulama oturumu oluşturur; aynı Google `sub` aynı cihazdaki kendi kayıt alanını açar. Bulut profil senkronizasyonu veya sunucuda kullanıcı veritabanı eklenmedi.

## İstemci
- Android: güncel Credential Manager kullanan `react-native-nitro-google-signin`.
- iOS: aynı paketin Google Sign-In SDK bağlantısı.
- Web: Google Identity Services resmi düğmesi.
- Native SDK açık giriş düğmesine basıldığında yüklenir. Expo Go için geliştirme/APK derlemesi gerektiği açıklanır; diğer akışlar hesapsız kullanılabilir.
- Oturum native SecureStore, web sekme oturum deposunda tutulur; API origin'ine bağlıdır.

## Sunucu
`POST /api/auth/google`, Google ID token'ını alır. JOSE ile Google JWK imzası, RS256 algoritması, issuer, expiry ve allowlist audience doğrulanır; email_verified=true gerekir.
Doğrulanmış `sub` kimliği esas alınır; istemciden gönderilen düz email/user ID kabul edilmez.
Sunucu ayrı, rastgele SESSION_SECRET ile 24 saatlik HS256 uygulama JWT'si üretir. API her istekte JWT imzasını ve süresini tekrar doğrular.
Google token'ı sunucuda saklanmaz veya loglanmaz. `/api/auth/google` rate limit kapsamındadır ve 16KB gövde sınırı vardır.
Üretimde geçerli servis anahtarı veya tam Google konfigürasyonu gerekir. Yalnız Google ile üretim yapılandırmasında anonim ücretli çağrı açılmaz.
`REQUIRE_GOOGLE_AUTH=true` servis anahtarı yerine doğrulanmış kullanıcı oturumu ister. Geliştirmede false ile hesapsız demo mümkündür.

## Google Cloud kurulumu
1. Kendi Google Cloud projesinde OAuth consent screen'i ve gerekli test kullanıcılarını yapılandır.
2. Web OAuth client oluştur; gerçek HTTPS önizleme origin'ini, yerelde `http://localhost:8082` adresini authorized JavaScript origins'e ekle.
3. Android OAuth client'ta paket `com.ogsarim.etiket` ve EAS/debug/Play imzasının gerçek SHA-1 bilgisini tanımla.
4. Native yapılandırmadaki webClientId alanına **web** istemci ID'sini gir. Android istemci ID'sini buraya yazma.
5. iOS hedefinde `com.ogsarim.etiket` bundle ID'si için ayrı iOS OAuth client oluştur.
6. İstemci ortamı: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, iOS için `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
7. Sunucu: `GOOGLE_CLIENT_IDS` virgülle ayrılmış kabul edilen gerçek audience değerleri; `SESSION_SECRET` rastgele en az 32 karakter. SESSION_SECRET public değişkene konmaz.
8. `app.config.ts` gerçek iOS client ID'sinden reverse URL scheme üretir ve native plugin'i ekler. ID yokken sahte scheme üretilmez. Android açık webClientId ile native autolinking kullanır.
9. Ortam değişiminden sonra native APK'yı yeniden derle; yalnız OTA güncellemesi native modül eklemez.

## Hesap izolasyonu ve çıkış
Misafir kaydı Google hesabına sessizce taşınmaz. Her kimliğin profil/günlük anahtarı ve şifreli dosyası ayrıdır; geçmiş/tercihler de kimliğe göre ayrılır.
Hesap değişirken önceki hesabın ekranı, yeni depolama yüklenene kadar gösterilmez. Bekleyen yazılar eski kimliğin dosyasına bağlı kalır.
Çıkış cihazdaki uygulama oturumunu siler, kişisel cihaz kayıtlarını silmez. Oturum stateless'tir: daha önce çalınmış bir JWT sunucuda anında geri alınamaz ve en geç 24 saatte sona erer.
Herkese açık büyümede revocation deposu, kullanıcı bazlı kota ve sunucu/oturum olay izlemesi eklenmelidir. Bu sürüm bunlar varmış gibi sunulmaz.

## Kabul sınırı
Sunucu doğrulama ve JWT kontrat testleri çalıştırılır; tarayıcıda yapılandırma eksikliği, misafir geçişi ve kontrollü oturumlarla hesap izolasyonu sınanır.
Gerçek Google ekranında hesap seçimi, gerçek ID token ve native Credential Manager/SHA-1 kabulü yapılmadı: OAuth hesabı/ID'leri ve fiziksel build yok.

Kaynaklar: [Expo Google rehberi](https://docs.expo.dev/guides/google-authentication/), [native SDK](https://react-native-nitro-google-sign-in.github.io/docs/guide/usage/), [Google backend doğrulama](https://developers.google.com/identity/sign-in/web/backend-auth), [GIS web düğmesi](https://developers.google.com/identity/gsi/web/guides/display-button).
