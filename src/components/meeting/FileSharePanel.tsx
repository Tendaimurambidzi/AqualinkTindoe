import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  deleteMeetingFile,
  listMeetingFiles,
  MeetingSharedFile,
  pickMeetingFileForUpload,
  pinMeetingFile,
  uploadMeetingFile,
} from '../../services/meetingFileService';

type Props = {
  visible: boolean;
  liveId: string | null;
  currentUid: string;
  currentName?: string | null;
  isHost: boolean;
  isCoHost: boolean;
  onClose: () => void;
};

const formatFileSize = (bytes: number) => {
  const value = Number(bytes || 0);
  if (!value) return '0 B';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const formatWhen = (timestamp: number) => {
  if (!timestamp) return '';
  const diffMs = Date.now() - Number(timestamp);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function FileSharePanel({
  visible,
  liveId,
  currentUid,
  currentName,
  isHost,
  isCoHost,
  onClose,
}: Props) {
  const [files, setFiles] = useState<MeetingSharedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const canManage = isHost || isCoHost;

  const load = useCallback(async () => {
    if (!liveId) return;
    setLoading(true);
    try {
      const items = await listMeetingFiles(liveId);
      setFiles(items);
    } catch (err: any) {
      Alert.alert('Files', err?.message || 'Failed to load shared files.');
    } finally {
      setLoading(false);
    }
  }, [liveId]);

  useEffect(() => {
    if (!visible || !liveId) return;
    let active = true;
    const run = async () => {
      try {
        const items = await listMeetingFiles(liveId);
        if (active) setFiles(items);
      } catch {}
    };
    run();
    const interval = setInterval(run, 7000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [liveId, visible]);

  const onShare = useCallback(async () => {
    if (!liveId) return;
    setBusy(true);
    try {
      const picked = await pickMeetingFileForUpload();
      if (!picked) return;
      await uploadMeetingFile({
        liveId,
        file: picked,
        uploaderUid: currentUid,
        uploaderName: currentName,
      });
      await load();
    } catch (err: any) {
      Alert.alert('Share file', err?.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }, [currentName, currentUid, liveId, load]);

  const pinned = useMemo(
    () => files.find((item) => item.pinned),
    [files],
  );

  const onOpen = useCallback(async (url: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('File', 'Could not open this file on your device.');
    }
  }, []);

  const onDelete = useCallback(
    (file: MeetingSharedFile) => {
      Alert.alert('Delete file', `Remove "${file.name}" from this meeting?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              await deleteMeetingFile({
                liveId: String(liveId || ''),
                fileId: file.id,
                requesterUid: currentUid,
                isHost,
                isCoHost,
              });
              await load();
            } catch (err: any) {
              Alert.alert('Delete file', err?.message || 'Could not delete file.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]);
    },
    [currentUid, isCoHost, isHost, liveId, load],
  );

  const onPin = useCallback(
    async (file: MeetingSharedFile) => {
      try {
        setBusy(true);
        await pinMeetingFile({
          liveId: String(liveId || ''),
          fileId: file.id,
          requesterUid: currentUid,
          isHost,
          isCoHost,
        });
        await load();
      } catch (err: any) {
        Alert.alert('Pin file', err?.message || 'Could not pin file.');
      } finally {
        setBusy(false);
      }
    },
    [currentUid, isCoHost, isHost, liveId, load],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Shared Files</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Upload media/docs for everyone in this live session.
          </Text>

          {pinned ? (
            <View style={styles.pinnedCard}>
              <Text style={styles.pinnedLabel}>Pinned</Text>
              <Text numberOfLines={1} style={styles.pinnedName}>
                {pinned.name}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              onPress={onShare}
              disabled={busy || !liveId}
              style={[styles.primaryBtn, busy ? styles.disabledBtn : null]}
            >
              <Text style={styles.primaryBtnText}>
                {busy ? 'Working...' : 'Share File'}
              </Text>
            </Pressable>
            <Pressable
              onPress={load}
              disabled={busy || loading}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>
                {loading ? 'Loading...' : 'Refresh'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#00C2FF" />
            ) : files.length === 0 ? (
              <Text style={styles.emptyText}>No files shared yet.</Text>
            ) : (
              files.map((item) => {
                const canDelete = canManage || item.uploadedBy === currentUid;
                return (
                  <View key={item.id} style={styles.fileRow}>
                    <Pressable onPress={() => onOpen(item.downloadUrl)} style={styles.fileInfo}>
                      <Text numberOfLines={1} style={styles.fileName}>
                        {item.pinned ? '📌 ' : ''}
                        {item.name}
                      </Text>
                      <Text style={styles.fileMeta}>
                        {formatFileSize(item.size)} • {item.uploadedByName || 'Someone'} •{' '}
                        {formatWhen(item.createdAt)}
                      </Text>
                    </Pressable>
                    <View style={styles.rowActions}>
                      {canManage ? (
                        <Pressable
                          onPress={() => onPin(item)}
                          style={[styles.miniBtn, styles.pinBtn]}
                          disabled={busy}
                        >
                          <Text style={styles.miniBtnText}>Pin</Text>
                        </Pressable>
                      ) : null}
                      {canDelete ? (
                        <Pressable
                          onPress={() => onDelete(item)}
                          style={[styles.miniBtn, styles.deleteBtn]}
                          disabled={busy}
                        >
                          <Text style={styles.miniBtnText}>Delete</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'flex-end',
  },
  card: {
    maxHeight: '80%',
    backgroundColor: '#081427',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 18, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.76)', marginTop: 6, marginBottom: 10 },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  closeText: { color: 'white', fontWeight: '700' },
  pinnedCard: {
    backgroundColor: 'rgba(0,194,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.55)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  pinnedLabel: { color: '#9BDFFF', fontSize: 12, fontWeight: '700' },
  pinnedName: { color: 'white', fontSize: 14, fontWeight: '700', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#00C2FF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  primaryBtnText: { color: '#012033', fontWeight: '800' },
  secondaryBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minHeight: 40,
  },
  secondaryBtnText: { color: 'white', fontWeight: '700' },
  disabledBtn: { opacity: 0.6 },
  list: { flex: 1 },
  listContent: { gap: 8, paddingBottom: 20 },
  emptyText: { color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 20 },
  fileRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileInfo: { flex: 1 },
  fileName: { color: 'white', fontWeight: '700' },
  fileMeta: { color: 'rgba(255,255,255,0.66)', marginTop: 4, fontSize: 12 },
  rowActions: { flexDirection: 'row', gap: 6 },
  miniBtn: {
    borderRadius: 8,
    minWidth: 52,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pinBtn: { borderColor: 'rgba(0,194,255,0.7)', backgroundColor: 'rgba(0,194,255,0.2)' },
  deleteBtn: { borderColor: 'rgba(225,45,57,0.7)', backgroundColor: 'rgba(225,45,57,0.2)' },
  miniBtnText: { color: 'white', fontWeight: '700', fontSize: 12 },
});
