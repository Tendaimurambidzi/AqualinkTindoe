// Optional helper for Firebase Storage -> HTTPS URL
export async function storagePathToUrl(storagePath: string): Promise<string> {
  try {
    // Lazy import to avoid requiring the module if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const storage = require('@react-native-firebase/storage').default;
    return await storage().ref(storagePath).getDownloadURL();
  } catch (e) {
    throw e;
  }
}

