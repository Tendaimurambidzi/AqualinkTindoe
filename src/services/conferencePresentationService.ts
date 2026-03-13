import { NativeModules, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Asset, launchImageLibrary } from 'react-native-image-picker';

export type ConferenceSharedFileStatus = 'uploading' | 'presenting' | 'ended' | 'failed';

export type ConferenceSharedFile = {
  id: string;
  liveScope: string;
  name: string;
  size: number;
  mimeType: string;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: number;
  presenterUid?: string | null;
  currentPage?: number;
  status?: ConferenceSharedFileStatus;
  error?: string | null;
};

let RNFS: typeof import('react-native-fs') | null = null;
const resolveRNFS = () => {
  if (RNFS) return RNFS;
  try {
    // eslint-disable-next-line global-require
    RNFS = require('react-native-fs');
  } catch {
    RNFS = null;
  }
  return RNFS;
};

const sanitizeBaseName = (name: string) =>
  String(name || 'conference_file')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 90);

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
  const raw = String(uri || '').trim();
  if (Platform.OS === 'android' && raw.startsWith('file://')) {
    return { path: raw.replace('file://', '') };
  }
  if (Platform.OS === 'android' && /^content:/.test(raw)) {
    const rnfs = resolveRNFS();
    if (!rnfs) {
      throw new Error('react-native-fs is required for content:// conference uploads.');
    }
    const safeExt = String(ext || 'bin').replace(/[^A-Za-z0-9]/g, '') || 'bin';
    const tempPath = `${rnfs.CachesDirectoryPath}/conference_file_${Date.now()}.${safeExt}`;
    await rnfs.copyFile(raw, tempPath);
    return { path: tempPath, tempPath };
  }
  return { path: raw };
};

const conferenceCollection = () => firestore().collection('conference_presentations');

const mapConferenceDoc = (doc: any): ConferenceSharedFile => {
  const data = doc?.data?.() || {};
  return {
    id: String(doc?.id || data?.id || ''),
    liveScope: String(data?.liveScope || ''),
    name: String(data?.name || 'Shared file'),
    size: Number(data?.size || 0),
    mimeType: String(data?.mimeType || 'application/octet-stream'),
    storagePath: String(data?.storagePath || ''),
    downloadUrl: String(data?.downloadUrl || ''),
    uploadedBy: String(data?.uploadedBy || ''),
    uploadedByName: String(data?.uploadedByName || 'Presenter'),
    createdAt: Number(data?.createdAtMs || 0),
    presenterUid: data?.presenterUid ? String(data.presenterUid) : null,
    currentPage: Number(data?.currentPage || 1) || 1,
    status: (String(data?.status || 'presenting') as ConferenceSharedFileStatus) || 'presenting',
    error: data?.error ? String(data.error) : null,
  };
};

export function subscribeConferencePresentations(
  liveScope: string,
  onItems: (items: ConferenceSharedFile[]) => void,
  onError?: (error: any) => void,
): () => void {
  const trimmedScope = String(liveScope || '').trim();
  if (!trimmedScope) return () => {};
  return conferenceCollection()
    .where('liveScope', '==', trimmedScope)
    .onSnapshot(
      snap => {
        const items = snap.docs
          .map(mapConferenceDoc)
          .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        onItems(items);
      },
      err => {
        if (onError) onError(err);
      },
    );
}

export async function pickConferencePresentationFile(): Promise<Asset | null> {
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
      if (Platform.OS !== 'android') {
        console.warn('Conference picker fallback:', err?.message || err);
      }
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

export async function presentConferenceFileLive(params: {
  liveScope: string;
  file: Asset;
  presenterUid: string;
  presenterName?: string | null;
}): Promise<ConferenceSharedFile> {
  const trimmedScope = String(params.liveScope || '').trim();
  const authUid = String(auth().currentUser?.uid || '').trim();
  const presenterUid = String(params.presenterUid || authUid).trim();
  const fileUri = String(params.file?.uri || '').trim();
  if (!trimmedScope) throw new Error('Missing conference scope.');
  if (!presenterUid) throw new Error('Please sign in before presenting.');
  if (authUid && authUid !== presenterUid) {
    throw new Error('Session mismatch. Re-open conference and try again.');
  }
  if (!fileUri) throw new Error('Selected file has no uri.');

  const now = Date.now();
  const rawName = String(params.file.fileName || 'Shared file');
  const mimeType = String(params.file.type || 'application/octet-stream');
  const safeName = sanitizeBaseName(rawName);
  const ext = safeName.includes('.')
    ? safeName.substring(safeName.lastIndexOf('.') + 1)
    : inferExtFromType(mimeType);
  const baseNoExt = safeName.includes('.')
    ? safeName.substring(0, safeName.lastIndexOf('.'))
    : safeName;
  const docRef = conferenceCollection().doc();

  await docRef.set(
    {
      id: docRef.id,
      liveScope: trimmedScope,
      name: rawName,
      size: Number(params.file.fileSize || 0),
      mimeType,
      storagePath: '',
      downloadUrl: '',
      uploadedBy: presenterUid,
      uploadedByName: String(params.presenterName || 'Presenter'),
      presenterUid,
      currentPage: 1,
      status: 'presenting',
      error: null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs: now,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  void (async () => {
    let tempPathToDelete: string | undefined;
    try {
      const storagePath = `posts/${presenterUid}/conference/${trimmedScope}/${Date.now()}_${baseNoExt}.${ext}`;
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
          status: 'presenting',
          error: null,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error: any) {
      await docRef.set(
        {
          status: 'failed',
          error: String(error?.message || error || 'Could not prepare shared file.'),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } finally {
      if (tempPathToDelete) {
        try {
          const rnfs = resolveRNFS();
          if (rnfs?.exists && (await rnfs.exists(tempPathToDelete))) {
            await rnfs.unlink(tempPathToDelete);
          }
        } catch {}
      }
    }
  })();

  return {
    id: docRef.id,
    liveScope: trimmedScope,
    name: rawName,
    size: Number(params.file.fileSize || 0),
    mimeType,
    storagePath: '',
    downloadUrl: '',
    uploadedBy: presenterUid,
    uploadedByName: String(params.presenterName || 'Presenter'),
    createdAt: now,
    presenterUid,
    currentPage: 1,
    status: 'presenting',
    error: null,
  };
}

export async function setConferencePresentationPage(params: {
  presentationId: string;
  requesterUid: string;
  page: number;
}) {
  const presentationId = String(params.presentationId || '').trim();
  const requesterUid = String(params.requesterUid || '').trim();
  const page = Math.max(1, Number(params.page || 1) || 1);
  if (!presentationId || !requesterUid) return;
  const docRef = conferenceCollection().doc(presentationId);
  const snap = await docRef.get();
  if (!snap.exists) return;
  const data = snap.data() || {};
  const presenterUid = String(data.presenterUid || data.uploadedBy || '').trim();
  if (presenterUid !== requesterUid) {
    throw new Error('Only presenter can change pages.');
  }
  await docRef.set(
    {
      currentPage: page,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function stopConferencePresentation(params: {
  presentationId: string;
  requesterUid: string;
}) {
  const presentationId = String(params.presentationId || '').trim();
  const requesterUid = String(params.requesterUid || '').trim();
  if (!presentationId || !requesterUid) return;
  const docRef = conferenceCollection().doc(presentationId);
  const snap = await docRef.get();
  if (!snap.exists) return;
  const data = snap.data() || {};
  const presenterUid = String(data.presenterUid || data.uploadedBy || '').trim();
  if (presenterUid !== requesterUid) {
    throw new Error('Only presenter can stop sharing.');
  }
  await docRef.set(
    {
      status: 'ended',
      presenterUid: null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
