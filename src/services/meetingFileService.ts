import { NativeModules, Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { BACKEND_BASE_URL } from '../../liveConfig';

export type MeetingSharedFile = {
  id: string;
  liveId: string;
  name: string;
  size: number;
  mimeType: string;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: number;
  pinned?: boolean;
  pinnedAt?: number;
};

export type MeetingUploadInput = {
  liveId: string;
  file: Asset;
  uploaderUid: string;
  uploaderName?: string | null;
};

let RNFS: typeof import('react-native-fs') | null = null;
const resolveRNFS = () => {
  if (RNFS) return RNFS;
  try {
    // eslint-disable-next-line global-require
    RNFS = require('react-native-fs');
  } catch (err) {
    console.warn('react-native-fs unavailable in meetingFileService:', err);
    RNFS = null;
  }
  return RNFS;
};

const sanitizeBaseName = (name: string) =>
  String(name || 'shared_file')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 80);

const inferExtFromType = (type: string) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('pdf')) return 'pdf';
  if (t.includes('word') || t.includes('doc')) return 'docx';
  if (t.includes('powerpoint') || t.includes('presentation')) return 'pptx';
  if (t.includes('excel') || t.includes('sheet')) return 'xlsx';
  if (t.startsWith('image/')) return 'jpg';
  if (t.startsWith('video/')) return 'mp4';
  if (t.startsWith('audio/')) return 'm4a';
  return 'bin';
};

const toLocalFilePath = async (uri: string, ext: string): Promise<{ path: string; tempPath?: string }> => {
  let raw = String(uri || '');
  try {
    raw = decodeURI(raw);
  } catch {}

  if (Platform.OS === 'android' && raw.startsWith('file://')) {
    return { path: raw.replace('file://', '') };
  }
  if (Platform.OS === 'android' && /^content:/.test(raw)) {
    const rnfs = resolveRNFS();
    if (!rnfs) {
      throw new Error('react-native-fs is required for content:// uploads.');
    }
    const safeExt = String(ext || 'bin').replace(/[^A-Za-z0-9]/g, '') || 'bin';
    const tempPath = `${rnfs.CachesDirectoryPath}/meeting_file_${Date.now()}.${safeExt}`;
    await rnfs.copyFile(uri, tempPath);
    return { path: tempPath, tempPath };
  }
  return { path: raw };
};

export async function pickMeetingFileForUpload(): Promise<Asset | null> {
  const nativePicker = (NativeModules as any)?.AudioPicker;
  if (nativePicker?.pickAudio) {
    try {
      const result = await nativePicker.pickAudio();
      if (!result?.uri) return null;
      const picked: Asset = {
        uri: String(result.uri),
        fileName: result.name ? String(result.name) : undefined,
        type: result.type ? String(result.type) : undefined,
        fileSize: Number(result.size || 0) || undefined,
      };
      return picked;
    } catch (err: any) {
      if (String(err?.code || '').toUpperCase() === 'CANCELLED') return null;
      // Fall back to gallery picker if native document picker fails unexpectedly.
      console.warn('AudioPicker failed, falling back to image library:', err?.message || err);
    }
  }

  const res = await launchImageLibrary({
    mediaType: 'mixed',
    selectionLimit: 1,
    includeExtra: false,
    quality: 0.9,
  });
  if (res.didCancel) return null;
  if (res.errorCode) {
    throw new Error(res.errorMessage || res.errorCode);
  }
  const file = res.assets?.[0] || null;
  if (!file?.uri) return null;
  return file;
}

export async function listMeetingFiles(liveId: string): Promise<MeetingSharedFile[]> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/meeting/files?liveId=${encodeURIComponent(String(liveId || '').trim())}`,
  );
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'Failed to load shared files');
  }
  return Array.isArray(data.items) ? data.items : [];
}

export async function uploadMeetingFile({
  liveId,
  file,
  uploaderUid,
  uploaderName,
}: MeetingUploadInput): Promise<MeetingSharedFile> {
  const trimmedLiveId = String(liveId || '').trim();
  const trimmedUid = String(uploaderUid || '').trim();
  const fileUri = String(file?.uri || '').trim();
  if (!trimmedLiveId) throw new Error('Missing liveId');
  if (!trimmedUid) throw new Error('Missing uploader');
  if (!fileUri) throw new Error('Missing file uri');

  const rawName = String(file.fileName || 'shared_file');
  const mimeType = String(file.type || 'application/octet-stream');
  const safeName = sanitizeBaseName(rawName);
  const ext =
    safeName.includes('.')
      ? safeName.substring(safeName.lastIndexOf('.') + 1)
      : inferExtFromType(mimeType);
  const baseNoExt = safeName.includes('.')
    ? safeName.substring(0, safeName.lastIndexOf('.'))
    : safeName;
  const storagePath = `live/${trimmedLiveId}/files/${Date.now()}_${baseNoExt}.${ext}`;

  let tempPathToDelete: string | undefined;
  const resolved = await toLocalFilePath(fileUri, ext);
  tempPathToDelete = resolved.tempPath;
  await storage().ref(storagePath).putFile(resolved.path, {
    contentType: mimeType || 'application/octet-stream',
  });
  const downloadUrl = await storage().ref(storagePath).getDownloadURL();

  if (tempPathToDelete) {
    try {
      const rnfs = resolveRNFS();
      if (rnfs?.exists && (await rnfs.exists(tempPathToDelete))) {
        await rnfs.unlink(tempPathToDelete);
      }
    } catch {}
  }

  const response = await fetch(`${BACKEND_BASE_URL}/meeting/files/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      liveId: trimmedLiveId,
      name: rawName,
      size: Number(file.fileSize || 0),
      mimeType,
      storagePath,
      downloadUrl,
      uploadedBy: trimmedUid,
      uploadedByName: String(uploaderName || 'Host'),
    }),
  });
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'Failed to share file');
  }
  return data.item as MeetingSharedFile;
}

export async function deleteMeetingFile(params: {
  liveId: string;
  fileId: string;
  requesterUid: string;
  isHost?: boolean;
  isCoHost?: boolean;
}) {
  const response = await fetch(`${BACKEND_BASE_URL}/meeting/files/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      liveId: params.liveId,
      fileId: params.fileId,
      requesterUid: params.requesterUid,
      isHost: !!params.isHost,
      isCoHost: !!params.isCoHost,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'Failed to delete file');
  }
}

export async function pinMeetingFile(params: {
  liveId: string;
  fileId: string;
  requesterUid: string;
  isHost?: boolean;
  isCoHost?: boolean;
}) {
  const response = await fetch(`${BACKEND_BASE_URL}/meeting/files/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      liveId: params.liveId,
      fileId: params.fileId,
      requesterUid: params.requesterUid,
      isHost: !!params.isHost,
      isCoHost: !!params.isCoHost,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'Failed to pin file');
  }
}
