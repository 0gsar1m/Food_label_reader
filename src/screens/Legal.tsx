import { Linking, ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../components/Controls';
import { ui } from '../theme';

const privacy = [
  [
    'Gözlemler, restoran kartı ve rapor',
    'Öğüne bağlı kontrol durumu, teyit edilen bileşenler, şiddet, isteğe bağlı dışkı tipi ve bağlam şifreli günlüğe eklenir. Gözlem sayıları cihazda hesaplanır. Restoran kartı yalnız seçili alerjenleri ve kendi kaçınma tercihlerini içerir. Paylaşım açık işlem gerektirir. PDF rapor cihazda geçici oluşturulur; paylaşım penceresi kapandığında uygulama geçici dosyayı siler. Paylaştığın veya yazdırdığın kopyaları uygulama geri alamaz. Webde rapor ayrı yazdırma penceresinde açılır.',
  ],
  [
    'Menü, tabak ve barkod',
    'Menü/tabak fotoğrafı yalnız gönder düğmesiyle aynı Google Gemini hizmetine aktarılır; sağlık profili eklenmez. Menü/tabak görsel sonucu geçmişe kaydedilmez; teyit ettiğin öğün günlüğe eklenebilir. Barkod araması sunucu üzerinden Open Food Facts açık kataloğuna yalnız barkodu gönderir. Bu servis barkod ve sunucu bağlantı bilgisini görür; fotoğraf, profil veya kullanıcı kimliği gönderilmez. Katalog verisi fotoğraftan okunmuş etiket yerine geçmez.',
  ],
  [
    'Google hesabı',
    'Google ile kayıt/girişte doğrulanmış temel kimlik bilgisi (Google hesap kimliği, ad, email) ve süreli uygulama oturumu kullanılır. Gmail mesajlarına erişilmez. Google kimliği sunucuda doğrulanır; uygulama oturumu cihazda güvenli depoda, webde sekme oturum deposunda tutulur. Sağlık profili, günlük ve okuma kayıtları hesaba göre ayrı tutulur. Bulut senkronizasyonu yoktur; çıkış verileri silmez. Google Identity Services giriş ekranı açıldığında Google ile teknik bağlantı kurabilir.',
  ],
  [
    'Profil ve günlük',
    'Amaç, bildirdiğin tanı veya şüphe, rutin ve öğün/belirti kayıtları hassas bilgidir. Native uygulamada ayrı AES-256-GCM şifreli depoda tutulur; anahtar işletim sisteminin güvenli deposundadır. Web demosunda bu bilgiler yalnız sekme oturumunda kalır. Profil ekranından açık JSON olarak dışa aktarabilir veya tüm profil/günlüğü ve şifreleme anahtarını silebilirsin.',
  ],
  [
    'Kişisel model yorumu',
    'Yalnız aktarım iznini açıp ilgili yorum veya soru özelleştirme düğmesine bastığında profil özeti, yorum için son 20 öğün kaydı ve etiket metni sunucu üzerinden Anthropic hizmetine gönderilir. Soru özelleştirmesinde öğün ve etiket gönderilmez. Alerjen tercihleri Google görsel isteğine eklenmez. Sunucu sağlık içeriğini kaydetmez. Sağlayıcının saklama koşulları kendi hesabının sözleşmesine bağlıdır. İzni kapatmak yeni aktarımı durdurur; daha önce sağlayıcıya aktarılan veriyi bu uygulamadan geri çekmez.',
  ],
  [
    'İşlenen veriler',
    'Seçtiğin fotoğraf, yalnız fotoğrafı gönderme işleminden sonra yapılandırılmış API sunucusuna, ardından Google Gemini API hizmetine gönderilir. Fotoğrafa kişisel bilgi eklememeni öneririz. API anahtarı yalnız sunucuda tutulur.',
  ],
  [
    'Cihazdaki kayıtlar',
    'Son 50 metin okuması ve alerjen tercihleri uygulama depolamasında tutulur. Fotoğraflar okuma geçmişine eklenmez. Geçmişte tek kaydı veya tamamını silebilirsin. Tercihleri seçimlerini kaldırarak temizleyebilirsin. Bu yerel metin deposu şifreli bir sağlık kasası değildir.',
  ],
  [
    'Fotoğraf ve sunucu',
    'Bu projenin API kodu fotoğrafları ve analiz içeriklerini dosyaya, veritabanına veya loga yazmaz. Görsel istek sırasında bellekte işlenir. Kamera ve dönüştürme işlemleri cihazın geçici önbelleğinde dosya oluşturabilir. Seçilen galeri aslı uygulama tarafından silinmez.',
  ],
  [
    'Üçüncü taraflar',
    'Google ve Anthropic tarafından veri işleme ve saklama, kullanılan Gemini hesabının planına ve geçerli şartlarına tabidir. Ücretsiz ve ücretli hizmet koşulları farklı olabilir. Barındırma sağlayıcısı IP ve teknik bağlantı günlükleri tutabilir. Yurt dışı işleme söz konusu olabilir.',
  ],
  [
    'İzinler ve erişim',
    'Kamera yalnız çekim ekranında açılır; galeri sistem seçicisi yalnız seçtiğin görsele erişir. Uygulama kodunda reklam veya analitik SDK bulunmaz. Sunucu erişim anahtarı mobilde işletim sisteminin güvenli deposunda, web önizlemesinde oturum belleğinde tutulur.',
  ],
  [
    'Yayın öncesi eksikler',
    'Taslak, hukuk incelemesi bekliyor. Veri sorumlusunun adı, iletişim adresi, hukuki dayanaklar, hak başvuru kanalı, gerçek barındırma bölgesi ve saklama düzeni işletmeci tarafından tamamlanmalıdır. Bu bilgiler olmadan ticari mağaza yayınına uygunluk iddia edilmez.',
  ],
];
const terms = [
  [
    'Uygulamanın amacı',
    'Nazif, fotoğrafta görülen gıda etiketi metnini okumaya ve sade dille açıklamaya yardımcı olur. Etiketin güncelliği veya tamlığı doğrulanamaz. Uygulama bir tıbbi cihaz veya kişisel beslenme tedavisi hizmeti değildir.',
  ],
  [
    'Sonucu kontrol et',
    'Otomatik okuma ve dil modeli hata yapabilir. Kesik, bulanık veya parlayan fotoğraflarda bilgi kaçabilir. Beyan bulunmaması alerjen bulunmadığı anlamına gelmez. Ciddi alerjin varsa ambalajı, üreticiyi ve sağlık uzmanının önerilerini esas al.',
  ],
  [
    'Örnekler ve geçmiş',
    'Örnek sonuçlar kurgu etiketlerden hazırlanır ve açıkça işaretlenir. Yeni bir fotoğraf analizi gibi gösterilmez. Kaydedilmiş sonuçlar eski ambalaj içeriğine ait olabilir; her yeni ambalajı yeniden kontrol et.',
  ],
  [
    'Bağlantı ve maliyet',
    'Gerçek fotoğraf okuması internet bağlantısı ve sunucuda geçerli Gemini API anahtarı gerektirir. Model sağlayıcısı ve barındırma maliyetleri yapılandırılan hesap sahibine aittir. Bu sürümde ödeme veya abonelik sistemi bulunmaz.',
  ],
  [
    'Uygun kullanım',
    'Yalnız işleme yetkin olan etiket fotoğraflarını gönder. Başkalarının kişisel verilerini kadraja alma. Sunucuyu kötüye kullanma veya erişim anahtarlarını paylaşma. Kullanıcıya ait olmayan hesap veya sır uygulama içine eklenmez.',
  ],
  [
    'Hukuki durum',
    'Taslak, hukuk incelemesi bekliyor. Hizmet sağlayıcının kimliği, iletişim bilgisi, uygulanacak hukuk ve kullanıcı haklarına ilişkin nihai maddeler yayın öncesinde yetkili kişi tarafından tamamlanmalıdır.',
  ],
];

/** Draft legal pages describe implemented behavior and explicitly identify missing operator details. */
export function Legal({ kind, onBack }: { kind: 'privacy' | 'terms'; onBack: () => void }) {
  return (
    <View style={ui.page}>
      <ScreenHeader
        title={kind === 'privacy' ? 'Gizlilik politikası' : 'Kullanım koşulları'}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>TASLAK / 1 KASIM 2026</Text>
        <Text accessibilityRole="header" style={ui.title}>
          {kind === 'privacy' ? 'Verin nerede kalır?' : 'Okumadan önce.'}
        </Text>
        {(kind === 'privacy' ? privacy : terms).map(([title, body]) => (
          <View key={title} style={{ gap: 10 }}>
            <Text style={ui.h2}>{title}</Text>
            <Text style={ui.body}>{body}</Text>
          </View>
        ))}
        {kind === 'privacy' && (
          <Text
            accessibilityRole="link"
            style={[ui.body, { textDecorationLine: 'underline', paddingVertical: 14 }]}
            onPress={() => {
              void Linking.openURL('https://ai.google.dev/gemini-api/terms').catch(() => undefined);
            }}
          >
            Google Gemini API hizmet koşulları
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
