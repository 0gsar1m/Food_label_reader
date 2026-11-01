import type { ConfigContext, ExpoConfig } from 'expo/config';

/** Only a real configured iOS OAuth ID produces an iOS redirect scheme; Android autolinks. */
export default function configureApp({ config }: ConfigContext): ExpoConfig {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const plugins = (config.plugins ?? []).filter(
    (plugin) =>
      !['react-native-nitro-google-signin', 'expo-web-browser'].includes(
        typeof plugin === 'string' ? plugin : (plugin[0] ?? ''),
      ),
  );
  if (
    !plugins.some((plugin) => (typeof plugin === 'string' ? plugin : plugin[0]) === 'expo-sharing')
  )
    plugins.push('expo-sharing');
  if (iosClientId) {
    if (!/^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(iosClientId))
      throw new Error('Invalid Google iOS OAuth client ID.');
    plugins.push([
      'react-native-nitro-google-signin',
      { iosUrlScheme: iosClientId.split('.').reverse().join('.') },
    ]);
  }
  return {
    ...config,
    name: config.name ?? 'Etiket',
    slug: config.slug ?? 'etiket-food-label-reader',
    plugins,
  };
}
