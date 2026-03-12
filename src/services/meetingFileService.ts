import { NativeModules, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Asset, launchImageLibrary } from 'react-native-image-picker';

export type MeetingSharedFileStatus =
  | 'selecting'
  | 'uploading'
  | 'presenting'
  | 'ready'
  | 'failed';

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
  status?: MeetingSharedFileStatus;
  error?: string | null;
};

export type MeetingUploadInput = {
  liveId: string;
  file: Asset;
  uploaderUid: string;
  uploaderName?: string | null;
  selectionId?: string | null;
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

const toLocalFilePath = async (
  uri: string,
  ext: string,
): Promise<{ path: string; tempPath?: string }> => {
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

const mapMeetingFileDoc = (doc: any): MeetingSharedFile => {
  const data = doc?.data?.() || {};
  return {
    id: String(doc?.id || data?.id || ''),
    liveId: String(data?.liveId || ''),
    name: String(data?.name || 'Shared file'),
    size: Number(data?.size || 0),
    mimeType: String(data?.mimeType || 'application/octet-stream'),
    storagePath: String(data?.storagePath || ''),
    downloadUrl: String(data?.downloadUrl || ''),
    uploadedBy: String(data?.uploadedBy || ''),
    uploadedByName: String(data?.uploadedByName || 'Someone'),
    createdAt: Number(data?.createdAtMs || 0),
    pinned: !!data?.pinned,
    pinnedAt: Number(data?.pinnedAt || 0),
    status: (String(data?.status || 'ready') as MeetingSharedFileStatus) || 'ready',
    error: data?.error ? String(data.error) : null,
  };
};

const liveFilesCollection = () => firestore().collection('live_files');

export async function pickMeetingFileForUpload(): Promise<Asset | null> {
  const nativePicker = (NativeModules as any)?.AudioPicker;
  if (nativePicker?.pickAudio) {
    try {
      const result = await nativePicker.pickAudio();
      if (!result?.uri) return null;
      return {
        uri: String(result.uri),
        fileName: result.name ? String(result.name) : undefined,
        type: result.type ? String(result.type) : undefined,
        fileSize: Number(result.size || 0) || undefined,
      };
    } catch (err: any) {
      if (String(err?.code || '').toUpperCase() === 'CANCELLED') return null;
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
  const trimmedLiveId = String(liveId || '').trim();
  if (!trimmedLiveId) return [];
  const snap = await liveFilesCollection().where('liveId', '==', trimmedLiveId).get();
  const items = snap.docs.map(mapMeetingFileDoc);
  return items.sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return Number(b.createdAt || 0) - Number(a.createdAt || 0);
  });
}

export function subscribeMeetingFiles(
  liveId: string,
  onItems: (items: MeetingSharedFile[]) => void,
  onError?: (error: any) => void,
): () => void {
  const trimmedLiveId = String(liveId || '').trim();
  if (!trimmedLiveId) return () => {};
  return liveFilesCollection()
    .where('liveId', '==', trimmedLiveId)
    .onSnapshot(
      snap => {
        const items = snap.docs.map(mapMeetingFileDoc).sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
          return Number(b.createdAt || 0) - Number(a.createdAt || 0);
        });
        onItems(items);
      },
      err => {
        if (onError) onError(err);
      },
    );
}

export async function uploadMeetingFile({
  liveId,
  file,
  uploaderUid,
  uploaderName,
  selectionId,
}: MeetingUploadInput): Promise<MeetingSharedFile> {
  const trimmedLiveId = String(liveId || '').trim();
  const authUid = String(auth().currentUser?.uid || '').trim();
  const trimmedUid = String(uploaderUid || authUid).trim();
  const fileUri = String(file?.uri || '').trim();
  if (!trimmedLiveId) throw new Error('Missing liveId');
  if (!trimmedUid) throw new Error('Please sign in before sharing files.');
  if (authUid && trimmedUid !== authUid) {
    throw new Error('Session mismatch. Please re-open live and try again.');
  }
  if (!fileUri) throw new Error('Missing file uri');

  const rawName = String(file.fileName || 'shared_file');
  const mimeType = String(file.type || 'application/octet-stream');
  const safeName = sanitizeBaseName(rawName);
  const ext = safeName.includes('.')
    ? safeName.substring(safeName.lastIndexOf('.') + 1)
    : inferExtFromType(mimeType);
  const baseNoExt = safeName.includes('.')
    ? safeName.substring(0, safeName.lastIndexOf('.'))
    : safeName;

  const createdAtMs = Date.now();
  const trimmedSelectionId = String(selectionId || '').trim();
  const docRef = trimmedSelectionId
    ? liveFilesCollection().doc(trimmedSelectionId)
    : liveFilesCollection().doc();

  // Convert selecting placeholder (or create one) to uploading with real file metadata.
  await docRef.set(
    {
      id: docRef.id,
      liveId: trimmedLiveId,
      name: rawName,
      size: Number(file.fileSize || 0),
      mimeType,
      storagePath: '',
      downloadUrl: '',
      uploadedBy: trimmedUid,
      uploadedByName: String(uploaderName || 'Host'),
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs,
      pinned: false,
      pinnedAt: 0,
      status: 'uploading',
      error: null,
    },
    { merge: true },
  );

  let tempPathToDelete: string | undefined;
  try {
    const storagePath = `posts/${trimmedUid}/meetings/${trimmedLiveId}/files/${Date.now()}_${baseNoExt}.${ext}`;
    const resolved = await toLocalFilePath(fileUri, ext);
    tempPathToDelete = resolved.tempPath;
    await storage().ref(storagePath).putFile(resolved.path, {
      contentType: mimeType || 'application/octet-stream',
    });
    const downloadUrl = await storage().ref(storagePath).getDownloadURL();

    await docRef.set(
      {
        storagePath,
        downloadUrl,
        status: 'ready',
        error: null,
      },
      { merge: true },
    );

    if (tempPathToDelete) {
      try {
        const rnfs = resolveRNFS();
        if (rnfs?.exists && (await rnfs.exists(tempPathToDelete))) {
          await rnfs.unlink(tempPathToDelete);
        }
      } catch {}
    }

    return {
      id: docRef.id,
      liveId: trimmedLiveId,
      name: rawName,
      size: Number(file.fileSize || 0),
      mimeType,
      storagePath,
      downloadUrl,
      uploadedBy: trimmedUid,
      uploadedByName: String(uploaderName || 'Host'),
      createdAt: createdAtMs,
      pinned: false,
      pinnedAt: 0,
      status: 'ready',
      error: null,
    };
  } catch (error: any) {
    await docRef.set(
      {
        status: 'failed',
        error: String(error?.message || error || 'Upload failed'),
      },
      { merge: true },
    );
    throw error;
  }
}

export async function announceMeetingFileSelectionStart(params: {
  liveId: string;
  uploaderUid: string;
  uploaderName?: string | null;
}): Promise<string> {
  const trimmedLiveId = String(params.liveId || '').trim();
  const authUid = String(auth().currentUser?.uid || '').trim();
  const trimmedUid = String(params.uploaderUid || authUid).trim();
  if (!trimmedLiveId) throw new Error('Missing liveId');
  if (!trimmedUid) throw new Error('Please sign in before sharing files.');
  if (authUid && trimmedUid !== authUid) {
    throw new Error('Session mismatch. Please re-open live and try again.');
  }
  const ref = liveFilesCollection().doc();
  const createdAtMs = Date.now();
  await ref.set({
    id: ref.id,
    liveId: trimmedLiveId,
    name: 'Selecting file...',
    size: 0,
    mimeType: 'application/octet-stream',
    storagePath: '',
    downloadUrl: '',
    uploadedBy: trimmedUid,
    uploadedByName: String(params.uploaderName || 'Host'),
    createdAt: firestore.FieldValue.serverTimestamp(),
    createdAtMs,
    pinned: false,
    pinnedAt: 0,
    status: 'selecting',
    error: null,
  });
  return ref.id;
}

export async function cancelMeetingFileSelection(params: {
  fileId: string;
  uploaderUid: string;
}) {
  const fileId = String(params.fileId || '').trim();
  const uploaderUid = String(params.uploaderUid || '').trim();
  if (!fileId || !uploaderUid) return;
  const ref = liveFilesCollection().doc(fileId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data() || {};
  if (String(data.uploadedBy || '') !== uploaderUid) return;
  if (String(data.status || '').toLowerCase() !== 'selecting') return;
  await ref.delete();
}

export async function presentMeetingFileLive({
  liveId,
  file,
  uploaderUid,
  uploaderName,
  selectionId,
}: MeetingUploadInput): Promise<MeetingSharedFile> {
  const trimmedLiveId = String(liveId || '').trim();
  const authUid = String(auth().currentUser?.uid || '').trim();
  const trimmedUid = String(uploaderUid || authUid).trim();
  const fileUri = String(file?.uri || '').trim();
  if (!trimmedLiveId) throw new Error('Missing liveId');
  if (!trimmedUid) throw new Error('Please sign in before sharing files.');
  if (authUid && trimmedUid !== authUid) {
    throw new Error('Session mismatch. Please re-open live and try again.');
  }
  if (!fileUri) throw new Error('Missing file uri');

  const rawName = String(file.fileName || 'shared_file');
  const mimeType = String(file.type || 'application/octet-stream');
  const createdAtMs = Date.now();
  const trimmedSelectionId = String(selectionId || '').trim();
  const docRef = trimmedSelectionId
    ? liveFilesCollection().doc(trimmedSelectionId)
    : liveFilesCollection().doc();

  // Live-present mode: no cloud upload/download step; presenter opens locally while others watch the live feed.
  await docRef.set(
    {
      id: docRef.id,
      liveId: trimmedLiveId,
      name: rawName,
      size: Number(file.fileSize || 0),
      mimeType,
      storagePath: '',
      downloadUrl: '',
      uploadedBy: trimmedUid,
      uploadedByName: String(uploaderName || 'Host'),
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs,
      pinned: false,
      pinnedAt: 0,
      status: 'presenting',
      error: null,
    },
    { merge: true },
  );

  return {
    id: docRef.id,
    liveId: trimmedLiveId,
    name: rawName,
    size: Number(file.fileSize || 0),
    mimeType,
    storagePath: '',
    downloadUrl: '',
    uploadedBy: trimmedUid,
    uploadedByName: String(uploaderName || 'Host'),
    createdAt: createdAtMs,
    pinned: false,
    pinnedAt: 0,
    status: 'presenting',
    error: null,
  };
}

export async function deleteMeetingFile(params: {
  liveId: string;
  fileId: string;
  requesterUid: string;
  isHost?: boolean;
  isCoHost?: boolean;
}) {
  const docRef = liveFilesCollection().doc(String(params.fileId || '').trim());
  const snap = await docRef.get();
  if (!snap.exists) return;
  const data = snap.data() || {};
  const ownerUid = String(data.uploadedBy || '');
  const canDelete = !!params.isHost || !!params.isCoHost || ownerUid === String(params.requesterUid || '');
  if (!canDelete) {
    throw new Error('Not allowed to delete this file.');
  }
  await docRef.delete();
}

export async function pinMeetingFile(params: {
  liveId: string;
  fileId: string;
  requesterUid: string;
  isHost?: boolean;
  isCoHost?: boolean;
}) {
  if (!params.isHost && !params.isCoHost) {
    throw new Error('Only host/co-host can pin files.');
  }
  const trimmedLiveId = String(params.liveId || '').trim();
  const fileId = String(params.fileId || '').trim();
  if (!trimmedLiveId || !fileId) {
    throw new Error('Missing liveId or fileId.');
  }
  const snap = await liveFilesCollection().where('liveId', '==', trimmedLiveId).get();
  const batch = firestore().batch();
  const now = Date.now();
  snap.docs.forEach(doc => {
    const pin = doc.id === fileId;
    batch.set(
      doc.ref,
      {
        pinned: pin,
        pinnedAt: pin ? now : 0,
      },
      { merge: true },
    );
  });
  await batch.commit();
}
