# Nazif / Yatırımcı demosu

## Sahne akışı

1. Sunumdan önce `npm run preview` ile yerel web paketini aç. [Nazif önizlemesi](http://localhost:8082) bilgisayarda çalışır. Bu komut önceden `npm run build:web` ile web paketi üretilmesini gerektirir.
2. **Hesapsız dene**, ardından **Şimdilik geç**. Ana ekranda **Örnek profille kişisel yorumu dene** seç.
3. Örnek bisküvi etiketini ve iki yulaf öğününü göster. Birinde 60 g ve şişkinlik kaydı, diğerinde suyla pişmiş 30 g ve tamamlanmış belirtisiz kayıt var.
4. **Hazır yanıtlarla prova yap**. Bu mod kurgu kayıt ve yanıt kullanır. İnternet ya da model çağrısı gerekmez.
5. Takip sorusuna **Yanında 200 ml süt içtim.** yaz. **Cevabı kaydet ve yeniden yorumla** düğmesine bas.
6. İkinci yorumda porsiyon ve sütün birlikte değiştiğini göster. Sahne cümlesi: “Nazif eksik ayrıntıyı soruyor, cevabı o öğüne ekliyor ve karşılaştırmayı güncelliyor.”
7. Mimari slaytında yerel eşleşme, fotoğraf okuma ve isteğe bağlı kişisel yorumun ayrımını göster. Maliyet slaytındaki eski Sonnet karşılaştırmasını güncel Flash-Lite varsayımıyla karıştırma. [Güncel maliyet hesabı](INVESTOR_COSTS.md)

## Canlı ek gösterim

Canlı mod için sunucu `npm run api` ve bir Gemini anahtarı gerekir. Aynı kurgu senaryoda **Kurgu profili ve örnek öğünleri Gemini’ye gönder** iznini aç ve **Bulut modeliyle ayrıntılandır** düğmesini kullan. Sahneye çıkmadan önce gerçek çağrıyı ve cevap sonrası ikinci çağrıyı aynı ağda tamamla. Google girişi ayrı OAuth kurulumu ister. [Canlı prova kaydı](PROD_FLOW_LOG.md)
