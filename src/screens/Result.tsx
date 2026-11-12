import { useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { allergenNames, type AllergenId, type ScanRecord } from '../../shared/analysis';
import { Button, IconButton, Notice, ScreenHeader } from '../components/Controls';
import { theme, ui } from '../theme';
import { copy } from '../content';
import { PersonalPanel } from '../components/PersonalPanel';
import { demoWeekScanId } from '../../shared/demoWeek';
import type { HealthVault } from '../../shared/profile';

/** Evidence is visible next to every explanation, including personalized allergen highlights. */
export function Result({
  record,
  vault,
  scenario,
  apiUrl,
  token,
  autoPersonal,
  mealRecorded,
  onDiary,
  preferences,
  onBack,
  onScan,
}: {
  record: ScanRecord;
  vault: HealthVault;
  scenario?: boolean;
  apiUrl: string;
  token: string;
  autoPersonal?: boolean;
  mealRecorded: boolean;
  onDiary: (notes: string) => void;
  preferences: AllergenId[];
  onBack: () => void;
  onScan: () => void;
}) {
  const [tab, setTab] = useState<'summary' | 'ingredients' | 'label'>('summary');
  const [error, setError] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const analysis = record.analysis;
  const matches = analysis.allergens.filter((item) => preferences.includes(item.id));
  async function share(): Promise<void> {
    try {
      await Share.share({
        title: 'Etiket okuması',
        message: `${record.demo ? 'ÖRNEK SONUÇ\n' : ''}${analysis.productName ?? 'Gıda etiketi'}\n\n${analysis.summary}\n\nAlerjen beyanları:\n${analysis.allergens.map((item) => `${allergenNames[item.id]}: ${item.presence === 'contains' ? 'İçerir' : 'Eser miktarda içerebilir'} (${item.evidence})`).join('\n') || 'Beyan bulunamadı. Bu, alerjen içermediği anlamına gelmez.'}\n\nOkunan metin:\n${analysis.rawText}\n\n${copy.safety}`,
      });
    } catch {
      setError('Paylaşım açılamadı. Okumayı bu ekranda incelemeye devam edebilirsin.');
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader
        title={record.demo ? 'Örnek okuma' : 'Etiket okuması'}
        onBack={onBack}
        action={
          <IconButton
            label="Okumayı paylaş"
            icon="share"
            onPress={() => {
              void share();
            }}
          />
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
        {record.demo && (
          <View style={{ padding: 12, backgroundColor: theme.color.pale }}>
            <Text style={[ui.small, { color: theme.color.green }]}>
              ÖRNEK SONUÇ / Kurgu bir etikettir. Fotoğraf analizi yapılmadı.
            </Text>
          </View>
        )}
        <View style={{ gap: 10 }}>
          <Text style={ui.eyebrow}>03 / OKUMA SONUCU</Text>
          <Text accessibilityRole="header" style={ui.title}>
            {analysis.productName ?? 'Gıda etiketi'}
          </Text>
          <Text style={ui.small}>
            {analysis.readability === 'clear'
              ? 'Etiket metni okundu'
              : analysis.readability === 'partial'
                ? 'Etiket kısmen okunabildi'
                : 'Etiket okunamadı'}
            {!record.demo ? ` · ${new Date(record.createdAt).toLocaleDateString('tr-TR')}` : ''}
          </Text>
        </View>
        {analysis.readability === 'unreadable' ? (
          <>
            <Notice>{analysis.summary}</Notice>
            <Button label="Etiketi yeniden çek" icon="scan" onPress={onScan} />
          </>
        ) : (
          <>
            {(analysis.readability === 'partial' || analysis.uncertainties.length > 0) && (
              <Notice>
                {['Eksik veya belirsiz alanlar var.', ...analysis.uncertainties].join(' ')}
              </Notice>
            )}
            {matches.length > 0 && (
              <Notice>
                Seçtiğin alerjenlerle eşleşen beyan var:{' '}
                {[...new Set(matches.map((item) => allergenNames[item.id]))].join(', ')}. Aşağıdaki
                içerir / eser miktarda ayrımını kontrol et.
              </Notice>
            )}
            {preferences.length > 0 && matches.length === 0 && (
              <Text style={ui.small}>
                Seçtiğin alerjenlere ait beyan bulunamadı. Bu, ürünün bu alerjenleri içermediğini
                göstermez.
              </Text>
            )}
            <View
              accessibilityRole="tablist"
              style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.color.line }}
            >
              {(
                [
                  ['summary', 'Özet'],
                  ['ingredients', 'İçerik'],
                  ['label', 'Etiket metni'],
                ] as const
              ).map(([value, label]) => (
                <Pressable
                  key={value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === value }}
                  aria-selected={tab === value}
                  onPress={() => setTab(value)}
                  style={{
                    flex: 1,
                    minHeight: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottomWidth: tab === value ? 2 : 0,
                    borderBottomColor: theme.color.green,
                  }}
                >
                  <Text
                    style={[
                      ui.small,
                      {
                        fontFamily: theme.font.bold,
                        color: tab === value ? theme.color.green : theme.color.muted,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={{ display: tab === 'summary' ? 'flex' : 'none' }}>
              {record.demo && !scenario ? (
                (record.id === 'example' || record.id === demoWeekScanId) && (
                  <View style={{ gap: 8 }}>
                    <Text style={ui.h2}>Örnek kişisel yorum</Text>
                    <Text style={ui.body}>
                      Bu bisküvide yulaf var. Örnek günlüğünde sütlü yulaftan sonra şişkinlik kaydı
                      var. Daha önce yulafı suyla yediğinde de şişkinlik olmuş muydu?
                    </Text>
                  </View>
                )
              ) : (
                <PersonalPanel
                  analysis={analysis}
                  vault={vault}
                  scenario={scenario}
                  apiUrl={apiUrl}
                  token={token}
                  autoPersonal={autoPersonal}
                />
              )}
              {!record.demo && (
                <View style={{ gap: 8, paddingVertical: 16 }}>
                  <Text style={ui.h2}>
                    {mealRecorded ? 'Öğün günlüğüne eklendi' : 'Bu ürünü tükettin mi?'}
                  </Text>
                  {!mealRecorded && (
                    <>
                      <Text style={ui.body}>
                        Tükettiysen sonrasında nasıl hissettin? Günlüğe eklediğin yanıtı sonraki
                        kişisel yorumlarda kullanırım.
                      </Text>
                      <TextInput
                        accessibilityLabel="Yedikten sonra nasıl hissettin?"
                        placeholder="Örn. Bir saat sonra şişkinlik hissettim"
                        placeholderTextColor={theme.color.muted}
                        style={ui.input}
                        multiline
                        maxLength={600}
                        value={mealNotes}
                        onChangeText={setMealNotes}
                      />
                    </>
                  )}
                  <Button
                    label={mealRecorded ? 'Öğün eklendi' : 'Öğün olarak ekle'}
                    secondary
                    disabled={mealRecorded}
                    onPress={() => onDiary(mealNotes.trim())}
                  />
                </View>
              )}
            </View>
            {tab === 'summary' && (
              <>
                <Text style={[ui.body, { fontSize: 17, lineHeight: 26 }]}>{analysis.summary}</Text>
                <View style={{ gap: 18 }}>
                  <Text style={ui.h2}>Alerjen beyanları</Text>
                  {analysis.allergens.length === 0 ? (
                    <Text style={ui.body}>
                      Okunan metinde alerjen beyanı bulunamadı. Ürünün alerjen içermediği sonucu
                      çıkarılamaz.
                    </Text>
                  ) : (
                    analysis.allergens.map((item, index) => (
                      <View
                        key={`${item.id}-${index}`}
                        style={{
                          gap: 7,
                          borderBottomWidth: 1,
                          borderColor: theme.color.line,
                          paddingBottom: 16,
                        }}
                      >
                        <View style={[ui.between, { alignItems: 'flex-start', flexWrap: 'wrap' }]}>
                          <Text style={[ui.strong, { maxWidth: '100%' }]}>
                            {allergenNames[item.id]}
                            {preferences.includes(item.id) ? ' · Seçimin' : ''}
                          </Text>
                          <Text
                            style={[
                              ui.small,
                              {
                                color:
                                  item.presence === 'contains'
                                    ? theme.color.red
                                    : theme.color.warning,
                                fontFamily: theme.font.bold,
                              },
                            ]}
                          >
                            {item.presence === 'contains' ? 'İçerir' : 'Eser miktarda içerebilir'}
                          </Text>
                        </View>
                        <Evidence text={item.evidence} />
                      </View>
                    ))
                  )}
                </View>
                <View style={{ gap: 16 }}>
                  <Text style={ui.h2}>Katkı maddeleri</Text>
                  {analysis.additives.length === 0 ? (
                    <Text style={ui.body}>
                      Okunan metinde katkı maddesi tanımlanmadı. Bu, katkısız ürün beyanı değildir.
                    </Text>
                  ) : (
                    analysis.additives.map((item, index) => (
                      <View key={index} style={{ gap: 8 }}>
                        <Text style={ui.strong}>
                          {item.code ? `${item.code} / ` : ''}
                          {item.name}
                        </Text>
                        <Text style={ui.body}>{item.purpose}</Text>
                        <Evidence text={item.evidence} />
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
            {tab === 'ingredients' && (
              <View style={{ gap: 24 }}>
                <Text style={ui.small}>
                  Etiketteki sırayla açıklanır. Miktarlar yalnız ambalajda okunabildiğinde
                  gösterilir.
                </Text>
                {analysis.ingredients.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      gap: 7,
                      paddingBottom: 20,
                      borderBottomWidth: 1,
                      borderColor: theme.color.line,
                    }}
                  >
                    <View style={ui.row}>
                      <Text style={[ui.eyebrow, { width: 24 }]}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                      <Text style={[ui.strong, { flex: 1 }]}>{item.name}</Text>
                    </View>
                    <Text style={ui.body}>{item.explanation}</Text>
                    <Evidence text={item.evidence} />
                  </View>
                ))}
              </View>
            )}
            {tab === 'label' && (
              <View style={{ gap: 16 }}>
                <Text style={ui.small}>
                  Fotoğraftan okunan kaynak metin. Harfler veya eksik satırlar hatalı okunmuş
                  olabilir. Ambalajla karşılaştır.
                </Text>
                <Text
                  selectable
                  style={[
                    ui.body,
                    { backgroundColor: theme.color.pale, padding: 20, lineHeight: 26 },
                  ]}
                >
                  {analysis.rawText}
                </Text>
              </View>
            )}
          </>
        )}
        {error ? <Notice>{error}</Notice> : null}
        <View style={ui.divider} />
        <Text style={ui.small}>{copy.safety}</Text>
        <Button label="Yeni etiket tara" icon="scan" secondary onPress={onScan} />
      </ScrollView>
    </View>
  );
}

function Evidence({ text }: { text: string }) {
  return (
    <Text
      selectable
      style={[ui.small, { borderLeftWidth: 2, borderColor: theme.color.line, paddingLeft: 10 }]}
    >
      Etikette: “{text}”
    </Text>
  );
}
