# Nazif: AI Slop Avoidance Guide

Kullanıcının sağladığı rehber mobil ürüne uyarlanmıştır. Tasarım rolü: kıdemli mobil ürün tasarımcısı ve React Native mühendisi.

Ürün: gıda etiketi fotoğrafından içerik, alerjen ve katkı açıklaması.
Kitle: markette veya evde ambalajı anlamak isteyen Türkçe konuşan kullanıcı.
Ana aksiyon: etiketi kadraja alıp okumak. Referans ilkesi: Apple ürün sayfalarının ölçülü tipografi, boşluk ve ürün odağı; özgün Etiket kimliği.
Gerçek içerik: kamera/galeri görüntüsü ve çalışan sonuç akışı. Kurgu etiketler her ekranda 'Örnek' olarak belirtilir.
Ekranlar: Google/hesapsız giriş, altı adımlı kullanım profili, tara, önizle/aktar, kişisel sonuç, öğün/belirti günlüğü, geçmiş, alerjen tercihleri, gizlilik ve kullanım koşulları.

## Görsel yön
- Zemin #F6F4ED, koyu metin #202820, birincil vurgu #455B36. Uyarı rengi yalnız risk/eksik bilgi için.
- Hiyerarşi tipografi, hizalama ve boşlukla. Marka/ana başlıkta Newsreader, gövde/işlevlerde DM Sans; Türkçe glifler yerel font varlıklarıyla.
- Asıl ürün merkezde: etiket çerçevesi, okunmuş metin ve sonuç. Dekoratif yiyecek görselleri yok.
- İnce ayırıcılar; yalnız etkileşim/uyarı gruplarında kutu. Her satırı karta çevirme.
- Küçük köşe yarıçapı; hap biçimi yalnız seçenek etiketi gibi işlevsel kontrollerde.
- Harsh gradient, gökkuşağı, neon, mor/siyah, jenerik pastel, saf beyaz sayfa, orb/blob, dot grid ve glass yok.
- Emoji, sparkle, animasyonlu ok, dekoratif şerit, yaygın gölge, bento grid, üç özellik kartı yok.
- Inter, Geist, Space Grotesk ve Lucide yok. Az sayıda özgün çizgi ikon yalnız işlevi açıklar.

## Metin ve davranış
- 'Etikette ne var?' gibi somut kısa başlıklar. Pazarlama sloganı, uydurma istatistik/yorum/sağlık puanı yok.
- Uzun/orta tire ve 'X değil Y' kalıbı arayüz metninde yok.
- Renk tek bilgi taşıyıcısı olamaz: içerir/eser miktarda/eksik bilgi metinle belirtilir.
- Animasyon yalnız gerçek bekleme ve geçişte; yapay tarama gecikmesi yok; az hareket tercihi korunur.
- 48dp dokunma hedefi, etiketli alan, görünür web odağı, normal kaydırma, boş/hata/izin reddi durumları.
- Gizlilik ve koşullar uygulamanın gerçek veri pratiklerine dayanır. İşletmeci/hukuk bilgisi eksikse taslak.

## İş akışı ve kabul
Önce ana ekranın görsel yönünü kur, telefon ve geniş önizlemede çalıştırıp incele, sonra diğer ekranları aynı token'larla genişlet.
360px satır kırılması, 320px sınır, büyük font, kontrast, alt güvenli alan, uzun Türkçe adlar ve ana akış kontrol edilir.
Yalnız gerçekten çalıştırılan testleri raporla; fiziksel telefon, canlı Gemini ve imzalı APK testlerini ayrı yaz.

## My GutIQ uyarlaması
Gözlemler alt menüde erişilir; sayılar paydalarıyla gösterilir. Restoran kartı ve menü/tabak ekranları aynı tipografi/renkleri kullanır. Rakibin marka varlıkları, dekoratif daireleri, güven yüzdeleri ve güvenli/kaçın sınıflaması aktarılmaz. Referans ekran görüntüleri docs içinde yalnız araştırma belgesine aittir; uygulama bundle'ına girmez. Yeni uzun Türkçe düğmeler satır kırabilir, 7/30 gün seçicisi dar ekranda sarar.
