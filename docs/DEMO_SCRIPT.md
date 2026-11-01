# Güncel demo modeli

Normal sunucu `npm run api`: Gemini 3.8 Flash + Claude Sonnet 5.5. Önceki model ifadeleri tarihi akıştır; bu bölüm esas alınır.
APK'da iki veya üç fotoğraf ve her birinde kişisel bulut yorumunu aç. Tahmini tüketim toplam $0,08–0,13 (yükleme bakiyesi ayrı).
20000 Vision+20000 Sonnet için aynı token varsayımıyla API $835/ay; tekrar/hosting ayrıca gösterilir.

# Beş dakikalık yatırımcı demosu

1. Hesap ekranı: Google ile kayıt/giriş ve hesapsız deneme. OAuth yapılandırması hazır değilse canlı giriş yapıldığı iddia edilmez; hesapsız modla devam edilir.
2. Altı adımlı tanışma: kilo yönetimi + protein, şişkinlik, tanı/şüphe ayrımı ve kahvaltı rutini. Seçimlere göre sorular değişir.
3. Açıkça etiketlenmiş örnek ürünü aç; 100g temelindeki 400 kcal değerini 40g porsiyon için 160 kcal olarak göster. Bu sayı kurgu örnek etikete aittir.
4. Kullanıcı izin verirse kişisel yorum çağrısı: etiketten, profilden, günlükten ve kaynaktan gelen dayanaklar ayrı görünür. API anahtarı yoksa yapılandırma hatasını göster; önceden yazılmış yanıtı canlı LLM gibi sunma.
5. Öğünü günlüğe ekle, belirtisiz ve belirtili kayıtların ayrımını göster. İlişkinin neden kanıtı olmadığını belirt.
6. Profil ekranında şifreli saklama, açık aktarım tercihi ve tüm sağlık verisini silme. Hesap değişiminde kayıtların ayrılığını anlat.
7. INVESTOR_COSTS.md tablosunu sun: 20000 Vision + 20000 Sonnet yorumu için yaklaşık $835 API tüketimi; bunun token varsayımı olduğunu açıkla.

## Gerekli dış yapılandırma
Canlı demo: Google OAuth client ID'leri, SESSION_SECRET, GEMINI_API_KEY, ANTHROPIC_API_KEY ve HTTPS API.
Native Google girişi için imzalı APK veya development build. Anahtarlar olmadığı durumda örnek/porsiyon/profil/günlük akışı yerel olarak gösterilebilir.

Güncel ekonomik varsayılan: Gemini 3.1 Flash-Lite fotoğraf okuma, API çağrısız yerel profil değerlendirmesi ve isteğe bağlı Haiku bulut ayrıntısı. Eski premium gider rakamları varsayılan değildir; INVESTOR_COSTS.md esas alınır.
