# Önceki premium senaryo, varsayılan değildir

Kullanıcı maliyet itirazından sonra bu senaryo ekonomik varsayılanla değiştirildi. Güncel karar INVESTOR_COSTS.md içindedir.

# Yatırımcı demosu: dış servis maliyetleri

1 Kasım 2026 fiyat görüntüsü. Para birimi USD; vergi, kur ve sözleşme indirimleri hariç. Aşağıdaki token sayıları gerçek ölçüm değil, değiştirilebilir bütçe varsayımlarıdır.

## Birim fiyatlar

| Hizmet | 1 milyon girdi token | 1 milyon çıktı token |
|---|---:|---:|
| Gemini 3.8 Flash, 31 Aralık 2026'ya kadar | $0,75 | $3,75 |
| Gemini 3.8 Flash, 1 Ocak 2027 itibarıyla | $1,50 | $7,50 |
| Claude Opus 5.5, varsayılan yorum | $4 | $20 |
| Claude Sonnet 5.5, bütçe alternatifi | $2 | $10 |

Kaynaklar: [Google fiyatlandırma](https://ai.google.dev/gemini-api/docs/pricing.md), [Anthropic modeller ve fiyatlar](https://platform.claude.com/docs/en/models/overview).
Görsel girdiler token tüketir; model düşünme token'ları da çıktıya dahildir. Ham fotoğraf sayısı tek başına faturayı belirlemez.

## Aylık yük varsayımı
- Aktif kişi başına ayda 20 tarama.
- Vision istek başına 3000 girdi token (görsel dahil) ve 2000 çıktı token.
- Taramaların %50'sinde kullanıcı ayrıca kişisel yorum ister.
- Kişisel yorum/soru isteği ortalama 6000 girdi ve düşünme dahil 2000 çıktı token.
- Yeni profil sayısı aktiflerin %10'u; her biri için bir modelle soru özelleştirme çağrısı bütçelenir. Yerel soru seçimi ücretsizdir.
- Yeniden deneme/başarısız ücretli çağrılar için API giderine %15 pay.
- Cache, batch ve ücretsiz kredi indirimi uygulanmaz. Bu sürümde otomatik model retry yapılmaz; pay kullanıcı yeniden denemelerini de kapsar.

## Sunuma alınabilecek senaryolar

| Aktif kullanıcı | Aylık tarama | Opus ile API | Sonnet ile API | Barındırma bütçesi + EAS | Opus toplam | Sonnet toplam |
|---:|---:|---:|---:|---:|---:|---:|
| 100 | 2000 | $96,76 | $59,59 | $10 + $19 | $125,76 | $88,59 |
| 1000 | 20000 | $967,61 | $595,93 | $25 + $19 | $1011,61 | $639,93 |
| 10000 | 200000 | $9676,10 | $5959,30 | $150 + $19 | $9845,10 | $6128,30 |

Barındırma rakamları tedarikçi teklifi değildir; küçük API, ağ ve izleme için planlama ödeneğidir. Yük testi, bölge, ortak rate-limit deposu, yedekleme ve sözleşme gereksinimleriyle değişir. EAS Starter limiti yetmeyen build/OTA kullanımında ek ücret doğar.

Bu varsayımda API maliyeti tarama başına yaklaşık Opus ile $0,0484, Sonnet ile $0,0298; kişi başına ayda yaklaşık $0,97 / $0,60'tır. Sabit giderler hariçtir.
2027 Gemini liste fiyatıyla 1000 kişilik Opus toplamı yaklaşık $1235,86 olur. Her taramada kişisel yorum istenirse aynı kullanıcı sayısıyla 2026 toplamı yaklaşık $1747,61 olur.
Uzun günlükler veya daha fazla reasoning bu rakamları artırır. Opus çağrısının uygulamadaki çıktı tavanı 4096'dır; 2000 ortalama varsayımı tavan garantisi değildir.

## Abonelik ve diğer dış giderler
- API kullanımı tüketim bazlıdır. Tüketici sohbet aboneliğini uygulamadaki API faturası yerine varsaymıyoruz; olası promosyon/krediler temel bütçeden düşülmedi.
- [EAS](https://expo.dev/pricing): Free $0; Starter $19/ay + kullanım. Ücretsiz plan sınırlarıyla demo yapılabilir, tabloda Starter bütçelenmiştir.
- Veritabanı/vektör veritabanı aboneliği şu mimaride zorunlu değil. Profil ve günlük cihazda; kaynaklar sürümlü sabit metinler.
- SMS, e-posta, analitik veya görsel depolama servisi bu sürümde yok. Eklenirse ayrıca bütçelenir.
- Mağaza hesapları, hukuk/klinik değerlendirme, mühendislik, müşteri desteği, penetrasyon testi ve kurumsal veri sözleşmeleri tabloya dahil değildir. Bunlar sıfır maliyet kabul edilmemeli.

## Hesaplama ve gerçek ölçüm
`npm run costs` tabloları aynı fonksiyonla tekrar üretir. Kaynak: shared/costs.ts; bütün token/hacim oranları parametredir.
Formül: `(girdi token × girdi fiyatı + çıktı token × çıktı fiyatı) / 1.000.000 × çağrı sayısı`, sonra yeniden deneme payı ve sabit giderler.
Kişisel API yanıtı gerçek input_tokens/output_tokens sayısını döndürür. Vision yanıtında sağlayıcı usageMetadata verirse inputTokens/outputTokens (düşünme dahil) döndürülür; metadata yoksa sıfırmış gibi ölçüm raporlanmaz. Canlı anahtar sağlanınca en az 20 gerçek etikette görsel token'ları, düşünme dahil çıktı, iki fotoğraf ve günlük uzunluğunun etkisi ölçülmeli.
Sunumda kullanılacak ifade: **“Bu giderler tanımlı kullanım varsayımına dayalı bütçe senaryosudur; canlı fatura ölçümü değildir.”**

Google girişi doğrudan GIS/native SDK ve kendi JWT sunucusuyla kuruldu; ücretli bir auth SaaS aboneliği eklenmedi. Giriş doğrulama trafiği aynı API barındırma bütçesinde değerlendirilir. Google Cloud koşulları ve ileride eklenebilecek revocation/kota deposu ayrı kontrol edilmelidir.
