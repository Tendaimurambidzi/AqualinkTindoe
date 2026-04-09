import { Platform, PermissionsAndroid } from "react-native";
// import removed for fresh setup
import RNFS from "react-native-fs";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

async function requestAudioPermission() {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 33) {
    const res = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
    return res === RESULTS.GRANTED;
  }

  const res = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  );
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

export async function pickMusicFromPhoneOrSD() {
  const ok = await requestAudioPermission();
  if (!ok) throw new Error("Permission denied");

  // SAF picker lets user browse internal + SD card

  let file;
  try {
    file = await DocumentPicker.pickSingle({
      type: [DocumentTypes.audio],
      copyTo: "cachesDirectory", // v9+ still supports this
      presentationStyle: "fullScreen",
    });
  } catch (err) {
    if (isCancel(err)) throw new Error("User cancelled");
    throw err;
  }

  // Prefer safe cached copy from SAF
  let uri = file.fileCopyUri || file.uri;
  // If still content://, force-copy to internal cache (rare, but robust)
  if (uri && uri.startsWith("content://")) {
    const dest = `${RNFS.CachesDirectoryPath}/music_${Date.now()}_${file.name || "audio"}`;
    try {
      await RNFS.copyFile(uri, dest);
      uri = "file://" + dest;
    } catch (e) {
      // fallback: just use the original uri
    }
  }
  // Normalize to file://
  if (uri && !uri.startsWith("file://")) uri = "file://" + uri;
  return {
    path: uri,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}
