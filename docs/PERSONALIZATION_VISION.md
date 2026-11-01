# Kişisel kullanım profili ve amaç odaklı yorum

1 Kasım 2026 kullanıcı yönlendirmesi. Durum: ürün tasarımı; henüz uygulanmadı.
Yeni amaç, etiket metnini kullanıcının hedefi, kendi deneyimi ve paylaştığı sağlık bağlamıyla anlamlandırmak.

## Yapılacaklar
- İlk kullanımda detaylandırılabilir profil: amaç, beslenme rutini, porsiyon alışkanlığı, alerjiler, kullanıcının bildirdiği tanı ve semptomlar.
- Tanı kaydı 'hekim tanısı bildirildi' ve 'kişinin şüphesi' olarak ayrılır; uygulama tanıyı doğrulamış sayılmaz.
- Amaçlar: kilo yönetimi, protein takibi, içerik farkındalığı ve yemek sonrası belirtileri izleme. Birden fazla amaç seçilebilir.
- Koşullu sorular: seçilen şişkinlik için öğün, miktar, başlangıç zamanı, sıklık ve eşlik eden besinler. Herkese aynı uzun soru listesi verilmez.
- Besin/belirti günlüğü: tüketim zamanı, yaklaşık porsiyon, belirtiler ve zamanlaması; birden fazla olası etken ve belirtisiz tüketimler de kaydedilir.
- Sonuçta 'Senin amacın açısından' bölümü: etiket bulgusu + profil/günlük dayanağı + anlaşılır yorum + eksik bilgi.
- Kalori/makro değerlendirmesi için besin tablosu ve gerçek porsiyon alınır; 100g/porsiyon hesabı model yerine kodla yapılır.
- Mikrobesin yalnız etikette veya doğrulanmış, doğru ürüne bağlı veri kaynağında varsa gösterilir. İçerik listesinden miktar üretilmez.

## Yes / no ve uygulanabilir alternatif

| İstek | Karar | Uygulama |
|---|---|---|
| Kişiye göre farklı sorular | Evet | LLM doğrulanmış soru havuzundan uygun takip sorusunu seçer; kullanıcı düzenleyebilir/atlayabilir |
| Hastalık ve semptom bağlamı | Evet | Bildirimin kaynağı ve belirsizliği korunur, yalnız ilgili bilgi kullanılır |
| Amaca göre katkı/besin yorumu | Evet | Etiket kanıtı, kişisel kayıt ve kaynaklı genel bilgi ayrı gösterilir |
| Kişisel tetikleyici olasılığını fark ettirme | Evet | Günlükteki gözlemler üzerinden, nedensellik iddiası olmadan |
| Tek 'şişkinlik' yanıtından 'yulaf sende şişkinlik yapar' sonucu | Hayır | Önce kişinin yulaflı öğün deneyimini ve miktarı sor; genel ilişkiyi kişisel gerçek gibi sunma |
| Egzama kaydından otomatik yasaklı gıda listesi | Hayır | Doğrulanmış alerjen/kişinin kayıtlı deneyimini belirt; kanıtsız eliminasyon önerme |
| Görünmeyen kalori, makro veya mikro miktarı | Hayır | Besin tablosunun ikinci fotoğrafını veya miktarı al; eksik alanı bilinmiyor bırak |
| Sağlık eğitimi olan LLM kullanmak | Değerlendirilecek | Türkçe doğruluk, kaynak sadakati, yanlış kişiselleştirme, hız ve veri işleme kabul setiyle model seç |

## Sonuç örnekleri
Etikette yulaf varsa, profil yalnız şişkinlik içeriyorsa:
'Yulaf içeriyor. Şişkinlik yaşadığını belirttin; bu tek başına yulafın sende tetikleyici olduğunu göstermez. Daha önce yulaflı öğünlerden sonra benzer bir durum yaşadın mı?'

Günlükte yulaflı öğünlerden sonra birkaç belirti kaydı varsa:
'Günlüğünde yulaflı öğünlerden sonra şişkinlik kaydetmişsin. Bu üründe de yulaf var. Porsiyon ve birlikte yediklerin de etkili olabilir; bu kayıtlar nedeni kanıtlamaz.'

Kilo yönetimi için sayısal örnek:
'Etikette 100g için 400 kcal yazıyor. Seçtiğin 40g porsiyon 160 kcal eder.'
Bu sayılar yalnız örnektir; gerçek sonuçta fotoğraftan okunan değerler kullanılır. Tek ürün günlük enerji dengesi yerine geçmez.

## Mimari
1. Vision yalnız ürünün görünen verilerini çıkarır.
2. Hesaplama ve kesin alerjen eşleşmesi deterministik katmandadır.
3. Kişisel yorum katmanı gerekli profil özeti ve sürümlenmiş güvenilir kaynaklarla çalışır.
4. Yanıt şeması her yorumu etiket / kullanıcı bildirimi / günlük gözlemi / genel kaynak olarak dayanaklandırır.
5. Model marka adına göre hastalık ilişkisi üretmez; kişisel korelasyonu kanıtlanmış nedene çevirmez.

Sağlık odaklı eğitim görmüş olması tek başına modelin klinik olarak doğrulandığı anlamına gelmez.
İlk sürümün alerjen tercihleri modele gönderilmez. Yeni sağlık profili için ayrı, açık aktarım tercihi ve veri minimizasyonu tasarlanmalıdır.
Hassas profil mevcut şifresiz geçmiş deposuna eklenmez; şifreli saklama, tüm veriyi silme ve dışa aktarma ayrıca uygulanır.

## Kaynaklar
- [NIH: IBS ve günlük tutma](https://health.nih.gov/health-topics-a-z/ibs): belirtilerle beslenme, ilaç ve yaşam olaylarının birlikte kaydı değerlendirmeyi destekleyebilir.
- [NHS: Şişkinlik](https://www.nhs.uk/symptoms/bloating/): farklı olası etkenler vardır; tek içerik üzerinden kişisel neden çıkarılmaz.
- [ASCIA: Egzama ve gıda alerjisi](https://www.allergy.org.au/patients/fast-facts/eczema-and-food-allergy): egzama kaydı tek başına gıda eliminasyonu için yeterli değildir.

Bu kaynaklar kişiselleştirme tasarımını destekler; uygulamanın klinik etkililiğinin kanıtı değildir.
