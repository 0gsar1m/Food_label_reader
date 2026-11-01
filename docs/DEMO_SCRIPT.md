# Beş dakikalık yatırımcı demosu

1. Hesap ekranı: Google ile kayıt/giriş ve hesapsız deneme. OAuth yapılandırması hazır değilse canlı giriş yapıldığı iddia edilmez; hesapsız modla devam edilir.
2. Altı adımlı tanışma: kilo yönetimi + protein, şişkinlik, tanı/şüphe ayrımı ve kahvaltı rutini. Seçimlere göre sorular değişir.
3. Açıkça etiketlenmiş örnek ürünü aç; 100g temelindeki 400 kcal değerini 40g porsiyon için 160 kcal olarak göster. Bu sayı kurgu örnek etikete aittir.
4. Kullanıcı izin verirse kişisel yorum çağrısı: etiketten, profilden, günlükten ve kaynaktan gelen dayanaklar ayrı görünür. API anahtarı yoksa yapılandırma hatasını göster; önceden yazılmış yanıtı canlı LLM gibi sunma.
5. Öğünü günlüğe ekle, belirtisiz ve belirtili kayıtların ayrımını göster. İlişkinin neden kanıtı olmadığını belirt.
6. Profil ekranında şifreli saklama, açık aktarım tercihi ve tüm sağlık verisini silme. Hesap değişiminde kayıtların ayrılığını anlat.
7. INVESTOR_COSTS.md tablosunu sun: 1000 aktif / 20000 tarama / %50 yorum için Opus senaryosunda aylık yaklaşık $1012; bunun token varsayımı olduğunu açıkla.

## Gerekli dış yapılandırma
Canlı demo: Google OAuth client ID'leri, SESSION_SECRET, GEMINI_API_KEY, ANTHROPIC_API_KEY ve HTTPS API.
Native Google girişi için imzalı APK veya development build. Anahtarlar olmadığı durumda örnek/porsiyon/profil/günlük akışı yerel olarak gösterilebilir.
