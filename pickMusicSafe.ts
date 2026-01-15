import { Platform, PermissionsAndroid } from "react-native";
// import removed for fresh setup
import RNFS from "react-native-fs";

async function requestAudioPermissionAndroid() {
  if (Platform.OS !== "android") return true;

  // Android 13+ uses READ_MEDIA_AUDIO
  if (Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // Android 12 and below
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function pickMusicFromDeviceSafe() {
  try {
    const ok = await requestAudioPermissionAndroid();
    if (!ok) {
      throw new Error("Permission not granted");
    }

    const file = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.audio],
      copyTo: "cachesDirectory",
      presentationStyle: "fullScreen",
    });

    let uri = file.fileCopyUri || file.uri;

    if (uri.startsWith("content://")) {
      const dest =
        `${RNFS.CachesDirectoryPath}/music_${Date.now()}_${file.name || "audio"}`;
      await RNFS.copyFile(uri, dest);
      uri = "file://" + dest;
    }

    if (!uri.startsWith("file://")) uri = "file://" + uri;

    return {
      path: uri,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  } catch (e: any) {
    // If user cancels picker, DON'T show your error
    if (DocumentPicker.isCancel(e)) {
      return null;
    }

    console.log("pickMusicFromDeviceSafe ERROR:", e);
    throw e;
  }
}
