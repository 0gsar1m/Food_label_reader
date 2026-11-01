# Değişiklik geçmişi

## Kişiselleştirme yönlendirmesi
- Amaç, rutin, sağlık bildirimi, koşullu sorular, besin/porsiyon ve belirti günlüğü ürün tasarımına eklendi.
- Faz 08–11 planlandı; bu özellikler henüz uygulanmadı. Kaynaklar ve karar tablosu PERSONALIZATION_VISION.md içinde.

## Profil, kişisel yorum ve Google giriş uygulaması
- Altı adımlı profil, koşullu sorular, tanı/şüphe ayrımı, şifreli öğün/belirti günlüğü, silme/dışa aktarma uygulandı.
- Besin tablosu için ikinci fotoğraf, kaynaklı besin değerleri ve deterministik porsiyon hesabı eklendi.
- Claude Opus 5.5 kişisel yorum/soru seçimi; açık aktarım izni, kaynak ID kontrolü ve kullanım token bilgisi eklendi.
- Google GIS / native Credential Manager girişi, server JWK doğrulaması, JWT ve hesaplara ayrılmış cihaz depoları eklendi.
- Yatırımcı maliyet modeli, 2027 fiyat senaryosu, model seçim raporu ve beş dakikalık demo akışı yazıldı.
- 69 birim/HTTP ve 11 tarayıcı akışı geçti; gerçek sağlayıcı anahtarları/OAuth kabulü yapılmış gibi gösterilmedi.

## 1 Kasım 2026
- Eski proje metodolojisinden faz planı, etkin bağlam ve AI rehberleri oluşturuldu.
- Kullanıcının sağladığı AI Slop rehberi mobil tasarım ve kabul ölçütlerine uyarlandı.
- Yuka ve Fig resmi belgeleri/mağaza yorumları incelendi; geçmiş araması ve kolay tercihler benimsendi.
- Expo/React Native uygulama, fotoğraf akışı, kanıtlı sonuçlar ve yerel geçmiş eklendi.
- Node API, Gemini entegrasyonu, doğrulama, erişim token'ı ve maliyet korumaları eklendi.
- Anahtar yokluğunu gizlemeyen gerçek yapılandırma ve açıkça etiketli kurgu örnek eklendi.
- 33 birim/HTTP testi, 7 ekran akışı, üç platform export ve üretim API smoke kabulü geçti.
- Doğrulanan kod 1bfdc25 commit'iyle istenen GitHub reposunun main dalına gönderildi.

Yeni kapsamın doğrulanan kod teslimi: 45308ef; origin/main push ve hash teyidi başarılı.

## Ekonomik kullanım
- Yerel profil/etiket/günlük değerlendirmesi eklendi; bu bölüm API çağırmaz ve LLM diye sunulmaz.
- Vision varsayılanı Gemini 3.1 Flash-Lite, isteğe bağlı bulut varsayılanı Haiku 5.5. Opus otomatik kullanılmaz.
- Yinelenen ürün açıklamaları bulut bağlamından çıkarıldı; başarılı cevap açıkken tekrar bulut çağrısı kapatıldı.
- Eski premium maliyet raporu arşivlendi, EAS ücretsiz planı ile ekonomik tablo yazıldı.

Son kullanıcı kararı: APK demosu için Gemini 3.8 Flash + Sonnet 5.5 normal varsayılan yapıldı; ekonomik sunucu ayrı komutla korundu. 2–3 deneme ve 20000 tam çift gideri ayrı raporlandı.

Son demo/ekonomi kodu 69dc08a ile origin/main’e push edildi; 74 birim/HTTP, 11 ekran ve tüm platform/API derlemeleri geçti.
