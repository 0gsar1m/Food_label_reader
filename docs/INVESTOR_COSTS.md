# Demo ayarı: Vision + Sonnet

Kullanıcının son kararıyla APK demosunun varsayılanı **gemini-3.8-flash + claude-sonnet-5-5**. Yerel kurallı yorum ücretsiz kalır; gerçek Sonnet yorumu ayrı bulut düğmesinden istenir.

Varsayım: her Vision çağrısı 3000 girdi/2000 çıktı, her Sonnet yorumu 6000 girdi/2000 çıktı token. Resmi standart fiyatlarla bir çift yaklaşık $0,04175; 2 çift $0,0835, 3 çift $0,12525 API tüketimi. Sağlayıcı asgari kredi yüklemesi ve vergi bu tüketim hesabından ayrıdır.

**20000 fotoğraf + her biri için bir Sonnet yorumu: yaklaşık $835 API tüketimi/ay.** %15 tekrar payıyla $960,25; örnek $25 barındırmayla $985,25. Soru özelleştirme, mağaza ve diğer giderler dahil değil. Sonnet yalnız taramaların yarısında istenirse API $515; %15 pay ve $25 hosting ile $617,25. Bunlar ölçülmüş fatura değildir; aynı token varsayımlarıdır.

Fiyat kaynakları: [Google](https://ai.google.dev/gemini-api/docs/pricing.md), [Sonnet](https://platform.claude.com/docs/en/models/overview). Google Flash fiyatı 2026 giriş tarifesidir; 2027 fiyatında aynı demo çifti $0,0515 olur. Yayından önce yeniden kontrol edin.

`npm run api` demo modellerini kullanır. `npm run api:economy` Lite + Haiku'yu açıkça seçer. Ortamda elle model tanımlandıysa normal başlangıç o ayarı korur. API anahtarları yokken gerçek çağrı yapılamaz; APK ve sağlayıcı kabulü henüz yapılmadı.

---

# Güncel gider planı: ekonomik varsayılan

1 Kasım 2026. Önceki Opus ağırlıklı ~$1012/ay senaryosu artık varsayılan değildir; karşılaştırma için INVESTOR_COSTS_PREMIUM.md içinde saklandı.

## Üründe uygulanan değişiklik
- Profil, günlük, amaç/semptom bağlamını tutma ve yerel kurallarla yorum: cihazda, LLM/API çağrısı yok.
- Yerel bölüm açıkça yerel değerlendirme diye etiketlenir. Serbest biçimli üretken LLM veya klinik değerlendirme olduğu iddia edilmez.
- Fotoğraf okuma: varsayılan `gemini-3.1-flash-lite`. Kısık düşünme ayarı, tek istek, aynı JSON/kanıt kontrolleri korunur.
- Bulutla ayrıntılandırma yalnız düğmeyle ve ayrı aktarım izniyle: varsayılan `claude-haiku-5-5`. Opus/Sonnet yalnız sunucu ayarıyla isteğe bağlıdır; otomatik pahalı yükseltme yok.
- Aynı açık sonuç ekranında başarılı bulut yanıtı alındıktan sonra düğme tekrar çağrı yapmaz. Kalıcı/ürünler arası cache varmış gibi tasarruf yazılmadı.
- Kişisel modele ürünün bütün açıklamaları ikinci kez gönderilmez; kaynak metni ile gerekli besin/alerjen/katkı alanları gönderilir. Günlük ve profil korunur.
- EAS Starter başlangıçta zorunlu sayılmaz; Free planının build/kullanım sınırları içinde abonelik $0 kabul edilir.

## Doğrulanan standart birim fiyatlar
[Google](https://ai.google.dev/gemini-api/docs/pricing.md): Gemini 3.1 Flash-Lite, milyon girdi $0,25 ve çıktı $1,50.
[Anthropic](https://platform.claude.com/docs/en/models/haiku-5-5/overview): Haiku 5.5, 100000 token'a kadar prompt için milyon girdi $0,10 ve çıktı $0,50.
Bu raporda batch/özel davet indirimi veya ücretsiz kredi kullanılmadı. Thinking token'ları çıktıya dahildir.
Gemini 3.8'in 2027 fiyat değişimi Lite'a uygulanmaz; listeler yayından önce yeniden kontrol edilmelidir.

## Aynı hacimle karşılaştırma
Varsayım: kişi başına 20 tarama/ay, Vision çağrısı 3000 girdi + 2000 çıktı token. %15 tekrar payı.
İsteğe bağlı bulut senaryosunda taramaların %50'si için 6000 girdi + 2000 çıktı token, aktiflerin %10'u için bir soru özelleştirme çağrısı.
Token sayıları ve barındırma ödenekleri gerçek fatura/tedarikçi teklifi değildir. Şema sınırları ve çağrı tavanları aynı kaldı; tahmini ortalama, token tavanı değildir.

| Aylık aktif | Tarama | Yerel yorumla API | Barındırma varsayımı | Yerel varsayılan toplam | %50 Haiku bulut yorumuyla toplam |
|---:|---:|---:|---:|---:|---:|
| 100 | 2000 | $8,63 | $10 | $18,63 | $20,48 |
| 1000 | 20000 | $86,25 | $25 | $111,25 | $129,83 |
| 10000 | 200000 | $862,50 | $150 | $1012,50 | $1198,34 |

1000 kişi senaryosunda eski ~$1012 toplamına karşı yeni yerel varsayılan ~$111; yaklaşık %89 daha düşük bütçe senaryosu. Kişi başına yaklaşık $0,11/ay toplam gider varsayımıdır; her aktif kullanıcının ücretli kullanıcı olduğu varsayılmaz.
Başlangıçta ücretli API çağrısını hiç açmadan kurgu örnek + profil + yerel değerlendirme + günlük + porsiyon hesabı gösterilebilir. Gerçek fotoğraf okuma ve isteğe bağlı bulut modeli bunun dışındadır.

## Gelir ve kâr
Bu hesap satış fiyatı veya gelir garantisi değildir. Ücretli kullanıcı oranı, mağaza komisyonu, vergi, ödeme maliyeti, destek, geliştirme ve klinik/hukuk değerlendirmesi ayrıca modellenmelidir.
Birim katkı hesabı: ücretli kullanıcıdan net tahsilat eksi o kullanıcının değişken kullanım maliyeti. Ücretsiz kullanıcı tüketimi ayrı bütçelenmeli; yayın öncesi kullanıcı kotası ve sağlayıcı harcama limiti kurulmalıdır.
Öngörülen fiyatlar sert fatura limiti değildir. Mevcut IP rate limit ve kullanıcı oturumu toplam aylık dolar bütçesini garanti etmez.

## Gerçekten sıfır API ücreti isteyen seçenek
Profil/günlük ve kurallı kişiselleştirme zaten bu cihazda API'siz çalışır. Telefonda yerel OCR + yerel LLM ile gerçek fotoğraf akışının da token faturası kaldırılabilir; o çözüm bu sürümde uygulanmadı.
Yerel LLM için cihaz RAM/depolama/pil ve Türkçe kabul testi gerekir. Modeli kendi sunucunda çalıştırmak ise API token faturası yerine donanım/barındırma gideri yaratır. Tam uygulama için 'her koşulda sıfır gider' denmez.

## Ölçüm ve kalite
`npm run costs` güncel tabloyu tekrar üretir; shared/costs.ts ekonomik ve eski premium referansını ayrı tutar.
Daha ucuz modellerin Türkçe etiket/sağlık kalitesi bu oturumda ölçülmedi. 20 gerçek etiket ve mevcut sağlık kabul setiyle test gerekir; gerekirse Vision modeli elle güçlendirilir. Şema geçmesi aynı klinik/OCR kaliteyi kanıtlamaz.
Google OAuth doğrulaması kendi API sunucusundadır; ayrı ücretli auth SaaS eklenmedi. Bulut DB/senkronizasyon yok. Mevcut gerçek hesap/anahtar kabul sınırları devam eder.
