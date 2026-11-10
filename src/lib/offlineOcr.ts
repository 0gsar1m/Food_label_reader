import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { extractLabelText } from '../../shared/labelText';
import type { PreparedPhoto } from './photo';

const ocr =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<{ recognize(uri: string): Promise<string> }>('NazifOcr')
    : null;

export async function readOfflineLabel(photo: PreparedPhoto, nutritionPhoto: PreparedPhoto | null) {
  if (!ocr) throw new Error('Offline reader unavailable.');
  const text = await ocr.recognize(photo.uri);
  const nutrition = nutritionPhoto ? await ocr.recognize(nutritionPhoto.uri) : '';
  return extractLabelText(text, nutrition);
}
