import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/** Re-rendered, bounded JPEG; source metadata and full-resolution photos are not uploaded. */
export type PreparedPhoto = { uri: string; base64: string; width: number; height: number };

/** Downsamples before decoding on native and re-encodes instead of forwarding original files. */
export async function preparePhoto(
  uri: string,
  width: number,
  height: number,
): Promise<PreparedPhoto> {
  if (!width || !height || width * height > 100_000_000)
    throw new Error('Bu görsel çok büyük veya geçersiz. Başka bir fotoğraf seç.');
  const context = ImageManipulator.manipulate(uri, { maxWidth: 1800, maxHeight: 1800 });
  if (Math.max(width, height) > 1800)
    context.resize(width >= height ? { width: 1800 } : { height: 1800 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85, base64: true });
  if (!saved.base64 || saved.base64.length > 6_666_664)
    throw new Error('Fotoğraf çok büyük. Daha küçük bir görsel seç.');
  return { uri: saved.uri, base64: saved.base64, width: saved.width, height: saved.height };
}

/** The system picker grants access only to the chosen image, without broad library access. */
export async function pickPhoto(): Promise<PreparedPhoto | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
    exif: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  if (asset.fileSize && asset.fileSize > 30_000_000)
    throw new Error('En fazla 30 MB kaynak fotoğraf seç.');
  return preparePhoto(asset.uri, asset.width, asset.height);
}
