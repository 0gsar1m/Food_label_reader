import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { ScanRecord } from '../../shared/analysis';
import { Button, IconButton } from '../components/Controls';
import { Icon } from '../components/Icon';
import { ui, theme } from '../theme';

/** Search works offline against local transcriptions, including Turkish case variants. */
export function History({
  records,
  onOpen,
  onDelete,
  onClear,
  onScan,
}: {
  records: ScanRecord[];
  onOpen: (record: ScanRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onScan: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = records.filter((record) =>
    `${record.analysis.productName ?? ''} ${record.analysis.rawText}`
      .toLocaleLowerCase('tr-TR')
      .includes(query.toLocaleLowerCase('tr-TR').trim()),
  );
  return (
    <ScrollView contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled">
      <View style={ui.between}>
        <Text style={ui.eyebrow}>BU CİHAZDA</Text>
        <Text style={ui.small}>{records.length} / 50 okuma</Text>
      </View>
      <View style={{ gap: 12 }}>
        <Text accessibilityRole="header" style={ui.title}>
          Okuma geçmişin.
        </Text>
        <Text style={ui.body}>
          Daha önce baktığın etiketler, yeniden okumak istediğinde burada.
        </Text>
      </View>
      {records.length ? (
        <>
          <TextInput
            accessibilityLabel="Geçmişte ara"
            placeholder="Ürün veya içerik ara"
            placeholderTextColor={theme.color.muted}
            value={query}
            onChangeText={setQuery}
            style={ui.input}
            clearButtonMode="while-editing"
          />
          {filtered.length === 0 && <Text style={ui.body}>Bu aramayla eşleşen okuma yok.</Text>}
          {filtered.map((record) => (
            <View
              key={record.id}
              style={[
                ui.row,
                { borderBottomWidth: 1, borderColor: theme.color.line, paddingBottom: 16 },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${record.analysis.productName ?? 'Gıda etiketi'} okumasını aç`}
                onPress={() => onOpen(record)}
                style={{ flex: 1, gap: 7, paddingVertical: 6 }}
              >
                <Text style={ui.small}>
                  {new Date(record.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                  {record.demo ? ' · Örnek' : ''}
                </Text>
                <Text style={ui.strong}>{record.analysis.productName ?? 'Gıda etiketi'}</Text>
                <Text style={ui.small}>
                  {record.analysis.allergens.length} alerjen beyanı ·{' '}
                  {record.analysis.additives.length} katkı
                </Text>
              </Pressable>
              <IconButton
                label={`${record.analysis.productName ?? 'Etiket'} okumasını sil`}
                icon="trash"
                onPress={() => onDelete(record.id)}
              />
            </View>
          ))}
          <Button label="Tüm geçmişi sil" secondary icon="trash" onPress={onClear} />
        </>
      ) : (
        <View
          style={{ gap: 24, paddingVertical: 40, borderTopWidth: 1, borderColor: theme.color.line }}
        >
          <Icon name="history" size={40} color={theme.color.green} />
          <Text style={ui.h2}>İlk etiketin için hazır.</Text>
          <Text style={ui.body}>
            Tamamladığın okumalar otomatik eklenir. Fotoğraflar kaydedilmez. Kayıtları dilediğin
            zaman silebilirsin.
          </Text>
          <Button label="İlk etiketini tara" onPress={onScan} icon="scan" />
        </View>
      )}
      <Text style={ui.small}>
        Son 50 okuma yalnız bu cihazda tutulur. Eski sonuçlar ambalajın güncel halini temsil
        etmeyebilir.
      </Text>
    </ScrollView>
  );
}
