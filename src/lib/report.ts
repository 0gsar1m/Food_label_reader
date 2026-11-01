import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File } from 'expo-file-system';

/** Native PDFs remain temporary and are removed after the share sheet closes. */
export async function exportReport(html: string): Promise<void> {
  if (Platform.OS === 'web') {
    const popup = window.open('', '_blank');
    if (!popup)
      throw new Error('Rapor penceresi engellendi. Tarayıcıda açılır pencereye izin ver.');
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    return;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Bu cihazda dosya paylaşımı açılamıyor.');
  const { uri } = await Print.printToFileAsync({ html });
  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: '.pdf',
      dialogTitle: 'Gözlem raporunu paylaş',
    });
  } finally {
    const file = new File(uri);
    if (file.exists) file.delete();
  }
}
