# My GutIQ araştırması ve Nazif uyarlaması

İnceleme tarihi: 1 Kasım 2026. Kapsam: resmi site, hakkında, blog dizini, gizlilik, koşullar, çerez politikası, ABD App Store, Google Play, kamuya açık web giriş ekranı ve üç mağaza görseli. Kaynak metinler aşağıda özetlenmiştir; ekran görüntüleri araştırma referansıdır, uygulamanın varlıkları değildir.

## Ürünün asıl döngüsü

[Resmi site](https://gutiq.app/) etiket, yemek, menü ve barkod taramasını kişisel sağlık bağlamıyla birleştiriyor. Ardından öğün sonrası kontrol ve zaman içinde kişisel gözlemler geliyor. IBS, reflü, intolerans ve tanı olmadan sindirim yakınmaları önemli kullanım grupları. İnternet, AI tarama ve senkronizasyon için gerekli. Sitedeki üç saniye, yüzdeli tetikleyici ve güvenli gıda örnekleri pazarlama anlatımıdır; bu incelemede doğrulukları ölçülmedi.

Çıkarımımız: Nazif’in değerini yalnız fotoğraf açıklamasıyla sınırlamamalıyız. Kalıcı bağlam, tüketim teyidi ve sonradan nasıl hissedildiği aynı ürün döngüsünün parçaları olmalı. Her adımda yeni LLM çağrısı gerekmiyor. Etiketin okunmasıyla yemeğin gerçekten tüketilmesi ayrı olaylar olmalı.

## Mağazalar ve gerçek kullanıcı kanıtı

[App Store ABD](https://apps.apple.com/us/app/my-gutiq-food-scanner/id6761395880) yalnız İngilizce, 15 ücretsiz tarama ve açıklama içinde aylık $9,99 Pro bildiriyor. IBS alt tipleri ve durum şiddetine göre yorum, öğüne bağlı belirtiler, haftalık özet, restoran kartı ve PDF raporu listeleniyor. Güvenli/dikkat/kaçın sınıflaması kullanılıyor. Puan 5,0 fakat yalnız **bir değerlendirme** var. Sürüm geçmişinde 1.0/14 Mayıs, 1.1/29 Mayıs görünüyor. Bunlar işlevlerin bağımsız kabul kanıtı değildir.

[Google Play](https://play.google.com/store/apps/details?id=app.gutiq) geliştiriciyi Cogumi, indirmeyi 10+, son güncellemeyi 23 Nisan 2026 gösteriyor. Bu görünümde okunabilir kullanıcı yorumları ve toplu puan yoktu. Apple'ın kamuya açık yorum RSS isteği de yorum gövdesi döndürmedi. Farklı ülke mağazalarında sonuç değişebilir. Bu yüzden “kullanıcılar şunu seviyor/şikayet ediyor” diye bir sonuç üretemiyoruz. Ürünün güçlü pazar çekişi bu verilerle gösterilemiyor.

## Gerçekte görülen arayüz

[Web uygulaması](https://app.gutiq.app/) 390px genişlikte Playwright ile açıldı, giriş ekranı görüntülendi. Sıcak açık zemin, koyu başlıklar, yeşil düğmeler ve dekoratif daireler var. Kullanım koşulları ve sağlık verisi onayı ayrı zorunlu seçimler; isteğe bağlı analitik üçüncü seçim. İlk ekranda Get Started ve Sign in bulunuyor. İkisi de zorunlu seçimler yapılmadan devre dışı. Rakip adına şart kabul edilmedi, hesap açılmadı ve sağlık verisi girilmedi. Bu nedenle ayrıntılı onboarding, ücret duvarı ve gerçek sonuç akışı kullanılarak doğrulanmış değildir.

Referans: [web giriş görüntüsü](screenshots/gutiq-public-entry.png), [üç mağaza görseli](screenshots/gutiq-store-reference.png). Mağaza görselinde tarama, kişisel sonuç ve gözlem haritası gösteriliyor. Gözlem ekranı farklı sayıda tamamlanmış kontrole göre kategori eşikleri tarif ediyor. Bu bir mağaza maketidir; uygulamanın gerçek istatistik yöntemini veya klinik doğruluğunu doğrulamaz.

Nazif’e görsel uyarlama kararı: mevcut Newsreader/DM Sans, kırık beyaz ve zeytin kimliği korunur. Rakibin logosu, İngilizce metni, daire dekorları, ekranları ve güven yüzdeleri taşınmaz. Araştırma ekran görüntüleri yalnız bu belgeye referanstır. Gözlemler ekranı sade sayılar, ince ayırıcılar ve örneklem büyüklüğü kullanır.

## Açıklanan teknik yapı ve veri akışı

[Gizlilik politikası](https://gutiq.app/privacy) Supabase (kimlik/veritabanı/depo/Edge Functions), OpenRouter ve seçilen model sağlayıcısı, RevenueCat ve mağazalar, Resend, Sentry, Google OAuth, Cloudflare, isteğe bağlı Google Analytics ve PostHog bildiriyor. Tarama girdisiyle ilgili profil bağlamı AI altyapısına gönderiliyor. Kullanılan kesin model, prompt, token tüketimi, sunucu maliyeti veya çalışma doğruluğu açıklanmıyor. Veriyi satmama ve araştırma/eğitim için ayrıca izin isteme beyanları var; bağımsız denetim yapılmadı.

[Koşullar](https://gutiq.app/terms) kullanım yaşını 18 olarak veriyor; Apple yaş derecesi 16+, Play ise Everyone gösteriyor. Bunlar farklı beyan türleri olsa da yayın tasarımında tutarlı yetişkin kapsamı gerekir. Abonelik yenileme ve iptal mağaza üzerinden. Sağlık veri izni geri çekilirse çekirdek özellikler duruyor.

[Çerez politikası](https://gutiq.app/cookies) zorunlu depolamayla isteğe bağlı ölçümü ayırıyor. [Hakkında](https://gutiq.app/about) sayfasında kamuya açık klinik doğrulama raporu veya isimlendirilmiş klinik ekip kanıtı görülmedi. [Blog dizini](https://gutiq.app/blog) IBS, FODMAP, günlük, uyku ve bağırsak-beyin ilişkisi konularını kapsıyor; bir anlatı açıkça birleşik eğitim hikâyesi diye işaretli. Blog varlığı klinik doğrulama sayılmaz. Makalelerin tüm kaynak zincirleri bu çalışmada tek tek denetlenmedi.

## Nazif’e uygulanan karşılıklar

| Ürün ihtiyacı | Uygulanan deneyim | İlave LLM tüketimi |
|---|---|---|
| Kişiyi tanıma | Mevcut altı adımlı amaç/semptom/tanı-şüphe/rutin profili, düzenlenebilir kaçınma listesi | Yerel $0; soru sıralaması isteğe bağlı |
| Market etiketi | Kamera/galeri, ikinci besin tablosu, kanıtlı açıklama, porsiyon | Tek Vision |
| Menü | Yalnız yazılı öğe ve birebir metin kanıtı; mutfağa sorular | Tek Vision |
| Tabak | Görünen bileşenleri belirsiz gözlem olarak sunma; kullanıcı tüketim teyidi | Tek Vision |
| Barkod | Kamera/elle GTIN, kontrol basamağı, Open Food Facts sorgusu, ambalaj fotoğrafına dönüş | LLM yok, katalog ağı var |
| Öğün sonrası takip | Tarama kimliğine bağlı öğün, bekleyen/belirtisiz/belirtili kontrol, şiddet, gecikme, bağlam, isteğe bağlı dışkı tipi | $0 |
| Kişisel gözlemler | 7/30 gün, tamamlanan kontrol paydaları, bileşenle/karşılaştırma grubuyla kayıt sayıları | $0 |
| Restoran kartı | Yalnız seçilen alerjen ve kendi kaçınma tercihleri; tanı paylaşılmaz | $0 |
| Görüşme raporu | Türkçe metin paylaşımı; native geçici PDF, web yazdırılabilir rapor | $0 |
| Ayrıntılı kişisel açıklama | Ayrı izin/düğmeyle mevcut Sonnet, ekonomi modunda Haiku | İsteğe bağlı |

Tabak görüntüsü gizli bileşenleri, miktarı veya çapraz teması göstermez. Menünün yemek adı tarif kanıtı değildir. Bu yüzden menüde yemek seçimi günlükte otomatik bileşen listesi üretmez; kullanıcı ayrıca girer. Etiket ve tabak bileşenleri de kayıt öncesi kullanıcı tarafından gözden geçirilir. Barkod katalog metni elindeki ambalajdan okunmuş gibi gösterilmez ve otomatik sağlık yorumu üretmez.

## Gözlem hesabı ve düşük gider kararı

Birden fazla gıda aynı öğünde bulunduğu için küçük günlükten “kesin tetikleyici” çıkarılamaz. Uygulanan sayaçlar aynı bileşeni bir öğünde bir kez sayar, Türkçe büyük/küçük harfi normalize eder, örnek kayıtları ve gelecekteki kayıtları dışlar. Henüz değerlendirilmeyen öğün belirtisiz sayılmaz. Bileşen listesi bilinmeyen öğün karşılaştırma grubuna eklenmez. Ayrıntılı karşılaştırma en az üç ilgili ve üç karşılaştırma kaydıyla görünür; bu bir klinik kanıt eşiği değildir. Yüzdeli güven veya “güvenli gıda” sınıflaması yoktur.

Bu yerel hesaplar aynı günlüğü her açışta sunucuya göndermeyi gerektirmez. Sağlık verisinin buluta aktarımı isteğe bağlı kalır. Arka planda otomatik kişisel model çağrısı, otomatik ücretli yeniden deneme ve sessiz pahalı modele yükseltme eklenmedi. Yeni fotoğraf türleri aynı mevcut Vision model ayarını kullanır. Önceki güçlü demo seçimi korunur; ekonomik çalıştırma ayrı komuttur.

## Parite dışı ve gerçek kabul bekleyenler

Bu teslim, rakibin tüm özelliklerini kullandığımız veya birebir eşlediğimiz iddiası değildir. Bulut sağlık senkronizasyonu, gerçek abonelik/tahsilat, push/OS zamanlanmış bildirim, klinik FODMAP miktar veritabanı ve rakibin güvenli/kaçın kararı yoktur. Günlük en fazla 100 öğün; uzun süreli takip için bu sınır ve rapor arşivi yeniden tasarlanmalı. Menü/tabak sonucu yalnız açık ekran boyunca tutulur, görsel arşivlenmez.

Anahtarlar yokken gerçek Vision/Sonnet kalitesi ölçülemez. Google OAuth, gerçek barkod kamerası, fiziksel cihazda PDF paylaşımı ve imzalı APK ayrı kabul gerektirir. Katalogda Türkiye ürün kapsamı ve güncelliği ayrıca saha örneklemiyle ölçülmelidir. Open Food Facts topluluk verisini klinik veya ambalaj doğrulaması olarak sunmayız. Dış servislerin kendi politikaları ve API kullanılabilirliği değişebilir.

Öncelik gerekçesi: bu uygulama ürünü bir kez açıklamanın ötesine taşıyor; kontrol ve gözlemi tekrar kullanım nedeni yapıyor. Giderin temel değişkeni ekran sayısı veya profil bağlamı değil, açıkça başlatılan fotoğraf/kişisel model çağrısı sayısıdır. Ticari sonuç için ödeme dönüşümü ve elde tutma gerçek kullanıcılarla ölçülmelidir; rakibin tek puanı üzerinden gelir tahmini yapılmaz.
