# Güncel model seçimi

1 Kasım 2026 son kullanıcı kararı: APK'da 2–3 gerçek deneme için güçlü Vision + Sonnet.

| Kullanım | Vision | Kişisel yorum |
|---|---|---|
| Normal API / APK demo | gemini-3.8-flash | claude-sonnet-5-5, açık düğmeyle |
| npm run api:economy | gemini-3.1-flash-lite | claude-haiku-5-5, açık düğmeyle |
| Yerel değerlendirme | Mevcut okunmuş etiket | Kurallar; API/LLM çağrısı yok |

Önceki Opus varsayılanı maliyet itirazıyla kaldırıldı. Kullanıcının açıkça model seçmesi halinde sunucu PERSONAL_MODEL alanı Opus'u destekler; otomatik pahalı yükseltme yok.
Normal başlangıçta ortamda açık model tanımlanmışsa o değer korunur. İki model sağlayıcısının API anahtarları hâlâ gereklidir.

## Gerekçe ve kanıt
Sonnet demo için maliyet/kalite uzlaşmasıdır. [Resmi model tablosu](https://platform.claude.com/docs/en/models/overview) kimlik ve fiyatları doğrular; [Microsoft HealthAgentBench](https://microsoft.github.io/HealthAgentBench/v2/results/) Sonnet'in sağlık agent görevlerini de değerlendirir. Bu farklı test Türkçe beslenme doğruluğumuzun kanıtı değildir.
[Gemini model belgeleri](https://ai.google.dev/gemini-api/docs/models) multimodal ve structured output desteğini açıklar. Lite seçeneğin aynı OCR kalitesini verdiği ölçülmüş değildir.
[Haiku fiyatı](https://platform.claude.com/docs/en/models/haiku-5-5/overview) ekonomik bulut seçeneği için kullanıldı.

## API ve veri davranışı
Anthropic JSON structured output kullanılır; model çıktısında Zod uzunlukları, atıf ID'leri ve soru allowlist'i ayrıca doğrulanır.
Kişisel modele raw fotoğraf gönderilmez. Profil/günlük ayrı izinle, gereken etiket alanları ve kaynak metniyle gider; yinelenen ürün açıklamaları tekrar gönderilmez.
Yerel yorum amaç/etiket değerleri ve günlük sayaçlarını gösterir. Hastalık tanısı, gıda tetikleyicisi veya serbest klinik çıkarım üretmez; LLM diye etiketlenmez.
Porsiyon hesabı kodla yapılır. Başarılı bulut yanıtı açık ekranda tekrar çağrılmaz; kalıcı cache uygulanmış değildir.

## Yayından önce kalite kabulü
Aynı gerçek 20 etiketi iki Vision modelinde karşılaştır. Eksik/yanlış alerjen, katkı, besin tablosu ve uzun etiketleri ayrı değerlendir.
Sonnet/Haiku için şişkinlik, egzama, tanı-şüphe, belirtili/belirtisiz günlük, bilinen alerji, eksik miktar, özel kullanıcı koşulları, akut belirti ve prompt enjeksiyonu senaryolarını karşılaştır.
İnsan değerlendirmesinde kaynak sadakati, yararlılık, yanlış kesinlik, Türkçe ve gecikme ayrı kaydedilir. Bu oturumda gerçek sağlayıcı anahtarı yok; kontrat testleri canlı klinik başarı olarak sunulmaz.
