import { useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import type { HealthVault } from '../../shared/profile';
import { healthReport, observations, reportHtml } from '../../shared/observations';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { theme, ui } from '../theme';
import { exportReport } from '../lib/report';

/** A local observation dashboard shows denominators and preserves missing outcomes. */
export function Insights({
  vault,
  onBack,
  onDiary,
}: {
  vault: HealthVault;
  onBack: () => void;
  onDiary: () => void;
}) {
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const stats = observations(vault.diary, days);
  async function pdf(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await exportReport(reportHtml(healthReport(vault, days)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rapor oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Gözlemlerim" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.title}>{'Yediklerin ve\nnasıl hissettiğin.'}</Text>
        <View style={[ui.row, { flexWrap: 'wrap' }]}>
          {[7, 30].map((value) => (
            <Button
              key={value}
              label={`Son ${value} gün${days === value ? ' seçili' : ''}`}
              secondary
              onPress={() => setDays(value)}
            />
          ))}
        </View>
        <View
          style={{
            gap: 12,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.color.line,
            paddingVertical: 20,
          }}
        >
          <Text style={ui.h2}>{stats.total} öğün kaydı</Text>
          <Text style={ui.body}>
            {stats.completed} tamamlanan kontrol · {stats.symptomFree} belirtisiz
          </Text>
          <Text style={ui.body}>{stats.pending} öğün için kontrol bekliyor</Text>
        </View>
        <Button label="Öğün sonrası kontrol yap" onPress={onDiary} />
        {!stats.total && (
          <Text style={ui.body}>
            Henüz bu dönemde gerçek kayıt yok. Yediğin bir öğünü ekle, ardından nasıl hissettiğini
            kaydet. Örnek kayıtlar burada sayılmaz.
          </Text>
        )}
        <Text style={ui.h2}>Kaydettiğin belirtiler</Text>
        {stats.symptoms.map((item) => (
          <View key={item.name} style={ui.between}>
            <Text style={ui.body}>{item.name}</Text>
            <Text style={ui.strong}>{item.count} kayıt</Text>
          </View>
        ))}
        <Text style={ui.h2}>Bileşen gözlemleri</Text>
        <Text style={ui.body}>
          Yalnız teyit ettiğin bileşenler karşılaştırılır. Aynı öğünde başka bileşenler de vardır;
          porsiyon, uyku ve stres sonucu etkileyebilir. Bu sayılar neden veya güvenli gıda listesi
          oluşturmaz.
        </Text>
        {!stats.ingredients.length && (
          <Text style={ui.small}>
            Öğününe bileşen ekleyip kontrolünü tamamladığında sayılar burada görünür.
          </Text>
        )}
        {stats.ingredients.slice(0, 12).map((item) => (
          <View
            key={item.name}
            style={{ gap: 8, borderTopWidth: 1, borderColor: theme.color.line, paddingTop: 16 }}
          >
            <Text style={ui.strong}>{item.name}</Text>
            <Text style={ui.body}>
              {item.total} öğünde kayıtlı: {item.symptoms} belirtili, {item.total - item.symptoms}{' '}
              belirtisiz.
            </Text>
            {item.total >= 3 && item.comparison >= 3 ? (
              <Text style={ui.small}>
                Bu bileşenin listelenmediği {item.comparison} öğünün {item.comparisonSymptoms}{' '}
                tanesinde belirti kaydedilmiş. Listede bulunmaması gerçekten tüketilmediğini
                kanıtlamaz.
              </Text>
            ) : (
              <Text style={ui.small}>
                Karşılaştırma için en az 3 bileşenli kayıt ve bu bileşenin listelenmediği 3 kayıt
                gerekli. Şu anda {item.total} / {item.comparison} kayıt var.
              </Text>
            )}
          </View>
        ))}
        <Text style={ui.h2}>Görüşmene hazırlan</Text>
        <Text style={ui.body}>
          Seçtiğin dönemin öğün, belirti, porsiyon ve bağlam kayıtlarını dışa aktar. Rapor açık
          sağlık bilgisi içerir; kiminle paylaşacağına sen karar verirsin.
        </Text>
        <Button
          label="Raporu PDF olarak dışa aktar"
          disabled={busy}
          onPress={() => {
            void pdf();
          }}
        />
        <Button
          label="Rapor metnini paylaş"
          secondary
          onPress={() => {
            void Share.share({ message: healthReport(vault, days) }).catch(() =>
              setError('Paylaşım açılamadı.'),
            );
          }}
        />
        {error && <Notice>{error}</Notice>}
      </ScrollView>
    </View>
  );
}
