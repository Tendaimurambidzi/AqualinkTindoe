import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureAudioReadPermission(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const api = typeof Platform.Version === 'number' ? Platform.Version : 0;
    const perm = api >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    await PermissionsAndroid.request(perm);
  } catch {
    // no-op
  }
}

