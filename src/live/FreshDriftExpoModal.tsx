import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type InviteJoinPreset = {
  liveId?: string | null;
  channel?: string | null;
  title?: string | null;
  fromName?: string | null;
  nonce?: number;
};

type SearchResultItem = { uid: string; name: string; secondary?: string | null };
type CommentRow = { id: string; text: string; fromName: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  isChartered?: boolean;
  inviteJoinPreset?: InviteJoinPreset | null;
  searchOceanEntities: (term: string) => Promise<any[]>;
};

const LIVE_INVITE_WINDOW_MS = 3 * 60 * 1000;

const mapRtcUidFromUserId = (value: string | null | undefined): number => {
  const seed = String(value || '').trim() || '0';
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return (hash % 2147483646) + 1;
};

const normalizeSearchResult = (entry: any): SearchResultItem | null => {
  const source = entry?.extra && typeof entry.extra === 'object' ? entry.extra : entry;
  const uid = String(source?.uid || entry?.uid || source?.id || '').trim();
  if (!uid) return null;
  const name = String(source?.displayName || source?.name || source?.username || entry?.label || 'User').trim();
  const username = String(source?.username || source?.handle || '').trim();
  return { uid, name: name || 'User', secondary: username && username !== name ? `@${username}` : null };
};

const FreshDriftExpoModal = ({ visible, onClose, inviteJoinPreset, searchOceanEntities }: Props) => {
  const insets = useSafeAreaInsets();
  const Agora = useMemo(() => { try { return require('react-native-agora'); } catch { return null; } }, []);
  const cfg = useMemo(() => { try { return require('../../liveConfig'); } catch { return null; } }, []);
  const appId = String(cfg?.AGORA_APP_ID || '').trim();
  const me = auth().currentUser;
  const meUid = me?.uid || '';
  const meName = String(me?.displayName || (me?.email ? me.email.split('@')[0] : '') || 'Viber');
  const engineRef = useRef<any>(null);
  const joinedChannelRef = useRef<string | null>(null);

  const [engineReady, setEngineReady] = useState(false);
  const [statusText, setStatusText] = useState('Ready');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomChannel, setRoomChannel] = useState('');
  const [roomTitle, setRoomTitle] = useState('Drift Expo');
  const [myRtcUid, setMyRtcUid] = useState(0);
  const [joined, setJoined] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<SearchResultItem[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const searchInviteUsers = useCallback(
    async (term: string): Promise<SearchResultItem[]> => {
      const normalized = term.trim().replace(/^[@/]+/, '');
      if (!normalized) return [];
      const lowerTerm = normalized.toLowerCase();
      const usersRef = firestore().collection('users');
      const seen = new Set<string>();
      const rows: SearchResultItem[] = [];
      const pushDoc = (doc: any) => {
        const data = doc.data() || {};
        const uid = String(doc.id || data.uid || '').trim();
        if (!uid || uid === meUid || seen.has(uid)) return;
        seen.add(uid);
        const displayName = String(data.displayName || data.name || data.username || 'User').trim();
        const username = String(data.username || data.userName || '').trim();
        rows.push({
          uid,
          name: displayName || 'User',
          secondary: username && username !== displayName ? `@${username.replace(/^[@/]+/, '')}` : null,
        });
      };
      try {
        const displaySnap = await usersRef
          .where('displayName', '>=', normalized)
          .where('displayName', '<=', normalized + '\uf8ff')
          .limit(20)
          .get();
        displaySnap.forEach(pushDoc);
      } catch {}
      try {
        const usernameSnap = await usersRef
          .where('username_lc', '>=', lowerTerm)
          .where('username_lc', '<=', lowerTerm + '\uf8ff')
          .limit(20)
          .get();
        usernameSnap.forEach(pushDoc);
      } catch {}
      if (rows.length > 0) return rows;
      try {
        const fallback = (await searchOceanEntities(normalized))
          .map(normalizeSearchResult)
          .filter(Boolean) as SearchResultItem[];
        return fallback.filter(item => item.uid !== meUid);
      } catch {
        return [];
      }
    },
    [meUid, searchOceanEntities],
  );

  const ensurePermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const perms = [PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
    for (const permission of perms) {
      const granted = await PermissionsAndroid.request(permission);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }
    return true;
  }, []);

  const cleanupEngine = useCallback(async () => {
    try { engineRef.current?.leaveChannel?.(); } catch {}
    try { engineRef.current?.stopPreview?.(); } catch {}
    try { (engineRef.current?.release ?? engineRef.current?.destroy)?.(); } catch {}
    engineRef.current = null;
    joinedChannelRef.current = null;
  }, []);

  useEffect(() => {
    if (visible) return;
    cleanupEngine().catch(() => {});
    setEngineReady(false);
    setStatusText('Ready');
    setRoomId(null);
    setRoomChannel('');
    setRoomTitle('Drift Expo');
    setMyRtcUid(0);
    setJoined(false);
    setRemoteUids([]);
    setCommentText('');
    setComments([]);
    setInviteQuery('');
    setInviteResults([]);
    setShowInvitePanel(false);
    setInviteLoading(false);
  }, [cleanupEngine, visible]);

  useEffect(() => {
    if (!visible || !Agora || !appId || engineRef.current) return;
    let cancelled = false;
    (async () => {
      if (!(await ensurePermissions())) {
        setStatusText('Camera or mic permission denied');
        return;
      }
      try {
        const engine = Agora.createAgoraRtcEngine ? Agora.createAgoraRtcEngine() : await Agora.RtcEngine.create(appId);
        engine.initialize?.({ appId, channelProfile: Agora.ChannelProfileType?.ChannelProfileCommunication ?? 0 });
        engine.enableVideo?.();
        engine.enableAudio?.();
        engine.enableLocalVideo?.(true);
        engine.startPreview?.();
        engine.registerEventHandler?.({
          onJoinChannelSuccess: () => { if (!cancelled) { setJoined(true); setStatusText('Live'); } },
          onUserJoined: (_c: any, uid: number) => { if (!cancelled) setRemoteUids(prev => (prev.includes(uid) ? prev : [...prev, uid])); },
          onUserOffline: (_c: any, uid: number) => { if (!cancelled) setRemoteUids(prev => prev.filter(item => item !== uid)); },
          onError: (err: number) => { if (!cancelled) setStatusText(`Agora error ${err}`); },
        });
        engine.addListener?.('JoinChannelSuccess', () => { if (!cancelled) { setJoined(true); setStatusText('Live'); } });
        engine.addListener?.('UserJoined', (uid: number) => { if (!cancelled) setRemoteUids(prev => (prev.includes(uid) ? prev : [...prev, uid])); });
        engine.addListener?.('UserOffline', (uid: number) => { if (!cancelled) setRemoteUids(prev => prev.filter(item => item !== uid)); });
        engineRef.current = engine;
        if (!cancelled) setEngineReady(true);
      } catch (error: any) {
        if (!cancelled) setStatusText(String(error?.message || 'Agora init failed'));
      }
    })();
    return () => { cancelled = true; };
  }, [Agora, appId, ensurePermissions, visible]);

  const hydrateRoom = useCallback(async (liveId: string) => {
    const snap = await firestore().collection('live').doc(liveId).get();
    const data = snap.data() || {};
    const channel = String(data.channel || inviteJoinPreset?.channel || '').trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
    if (!channel) throw new Error('Invite has no channel.');
    setRoomId(liveId);
    setRoomChannel(channel);
    setRoomTitle(String(data.title || inviteJoinPreset?.title || 'Drift Expo'));
    setMyRtcUid(mapRtcUidFromUserId(meUid));
    setStatusText('Joining room');
  }, [inviteJoinPreset?.channel, inviteJoinPreset?.title, meUid]);

  const startRoom = useCallback(async () => {
    if (!meUid) throw new Error('Sign in required');
    const ref = firestore().collection('live').doc();
    const channel = `drift_${ref.id}`.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
    await ref.set({ title: 'Drift Expo', channel, hostUid: meUid, hostName: meName, status: 'live', createdAt: firestore.FieldValue.serverTimestamp(), updatedAt: firestore.FieldValue.serverTimestamp() });
    setRoomId(ref.id);
    setRoomChannel(channel);
    setRoomTitle('Drift Expo');
    setMyRtcUid(mapRtcUidFromUserId(meUid));
    setStatusText('Joining room');
  }, [meName, meUid]);

  useEffect(() => {
    if (!visible || !inviteJoinPreset?.liveId) return;
    hydrateRoom(String(inviteJoinPreset.liveId)).catch(error => Alert.alert('Could not open invite', String(error?.message || 'Try again.')));
  }, [hydrateRoom, inviteJoinPreset?.liveId, visible]);

  useEffect(() => {
    if (!visible || !roomId || !roomChannel || !myRtcUid || !engineRef.current) return;
    if (joinedChannelRef.current === roomChannel) return;
    let cancelled = false;
    (async () => {
      try {
        await engineRef.current.joinChannel?.(null, roomChannel, myRtcUid, { publishCameraTrack: true, publishMicrophoneTrack: true, autoSubscribeAudio: true, autoSubscribeVideo: true });
        if (cancelled) return;
        joinedChannelRef.current = roomChannel;
      } catch (error: any) {
        if (!cancelled) setStatusText(String(error?.message || 'Could not join channel'));
      }
    })();
    return () => { cancelled = true; };
  }, [myRtcUid, roomChannel, roomId, visible]);

  useEffect(() => {
    if (!visible || !roomId) return;
    const unsubComments = firestore().collection(`live/${roomId}/comments`).orderBy('createdAt', 'asc').limit(100).onSnapshot(snap => {
      setComments((snap.docs || []).map(doc => ({ id: doc.id, text: String(doc.data()?.text || ''), fromName: String(doc.data()?.fromName || 'User') })));
    });
    return () => { try { unsubComments(); } catch {} };
  }, [roomId, visible]);

  const sendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !roomId || !meUid) return;
    await firestore().collection(`live/${roomId}/comments`).add({ text, fromUid: meUid, fromName: meName, createdAt: firestore.FieldValue.serverTimestamp(), createdAtMs: Date.now() });
    setCommentText('');
  }, [commentText, meName, meUid, roomId]);

  const runInviteSearch = useCallback(async () => {
    const term = inviteQuery.trim();
    if (!term) return setInviteResults([]);
    setInviteLoading(true);
    try {
      const rows = await searchInviteUsers(term);
      setInviteResults(rows);
    } catch {
      setInviteResults([]);
    } finally {
      setInviteLoading(false);
    }
  }, [inviteQuery, searchInviteUsers]);

  const sendInvite = useCallback(async (target: SearchResultItem) => {
    if (!roomId || !roomChannel || !meUid) return;
    await firestore().collection(`users/${target.uid}/live_invites`).add({ liveId: roomId, liveChannel: roomChannel, liveTitle: roomTitle, fromUid: meUid, fromName: meName, status: 'pending', createdAt: firestore.FieldValue.serverTimestamp(), createdAtMs: Date.now(), expiresAtMs: Date.now() + LIVE_INVITE_WINDOW_MS });
    Alert.alert('Invite sent', `${target.name} can join now.`);
  }, [meName, meUid, roomChannel, roomId, roomTitle]);

  const renderLocalView = () => {
    const RtcTextureView = (Agora as any)?.RtcTextureView;
    const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
    const VideoRenderMode = Agora?.VideoRenderMode;
    const VideoSourceType = Agora?.VideoSourceType;
    const canvas = { uid: 0, channelId: roomChannel || undefined, sourceType: VideoSourceType?.VideoSourceCameraPrimary ?? VideoSourceType?.VideoSourceCamera ?? 0, renderMode: VideoRenderMode?.Fit ?? 2 };
    if (Platform.OS === 'android' && RtcTextureView) return <RtcTextureView style={styles.videoFill} canvas={canvas} />;
    if (RtcSurfaceView) return <RtcSurfaceView style={styles.videoFill} canvas={canvas} zOrderMediaOverlay />;
    return <View style={[styles.videoFill, styles.center]}><Text style={styles.dimText}>Opening camera...</Text></View>;
  };

  const renderRemoteView = (uid: number) => {
    const RtcTextureView = (Agora as any)?.RtcTextureView;
    const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
    const VideoRenderMode = Agora?.VideoRenderMode;
    const VideoSourceType = Agora?.VideoSourceType;
    const canvas = { uid, channelId: roomChannel || undefined, sourceType: VideoSourceType?.VideoSourceRemote, renderMode: VideoRenderMode?.Fit ?? 2 };
    if (Platform.OS === 'android' && RtcTextureView) return <RtcTextureView style={styles.videoFill} canvas={canvas} />;
    if (RtcSurfaceView) return <RtcSurfaceView style={styles.videoFill} canvas={canvas} />;
    return <View style={[styles.videoFill, styles.center]}><Text style={styles.dimText}>Waiting for remote video...</Text></View>;
  };

  const primaryRemoteUid = remoteUids.find(uid => uid > 0 && uid !== myRtcUid) || 0;
  if (!visible) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
        {!roomId || !engineReady ? (
          <View style={styles.lobby}>
            <Text style={styles.title}>Drift Expo</Text>
            <Text style={styles.body}>Send invite. Join room. Show remote video.</Text>
            {!!statusText && statusText !== 'Ready' ? <Text style={styles.status}>{statusText}</Text> : null}
            <Pressable style={styles.primaryBtn} onPress={() => (inviteJoinPreset?.liveId ? hydrateRoom(String(inviteJoinPreset.liveId)).catch(() => {}) : startRoom().catch(error => Alert.alert('Could not start room', String(error?.message || 'Try again.'))))}><Text style={styles.primaryBtnText}>{inviteJoinPreset?.liveId ? 'Join invited room' : 'Start room'}</Text></Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onClose}><Text style={styles.secondaryBtnText}>Close</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.stage}>
              {primaryRemoteUid ? renderRemoteView(primaryRemoteUid) : renderLocalView()}
              <View style={styles.topBar}>
                <View><Text style={styles.live}>LIVE</Text><Text style={styles.room}>{roomTitle}</Text></View>
                <View style={styles.row}><Pressable style={styles.chip} onPress={() => setShowInvitePanel(true)}><Text style={styles.chipText}>Invite</Text></Pressable><Pressable style={styles.chip} onPress={onClose}><Text style={styles.chipText}>Close</Text></Pressable></View>
              </View>
              {primaryRemoteUid ? <View style={styles.inset}>{renderLocalView()}</View> : null}
              {!joined ? <View style={styles.overlay}><Text style={styles.overlayText}>{statusText}</Text></View> : null}
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatWrap}>
              <FlatList data={comments} keyExtractor={item => item.id} style={styles.chatList} contentContainerStyle={{ padding: 12, gap: 8 }} renderItem={({ item }) => <View style={styles.comment}><Text style={styles.commentName}>{item.fromName}</Text><Text style={styles.commentText}>{item.text}</Text></View>} />
              <View style={styles.compose}><TextInput value={commentText} onChangeText={setCommentText} placeholder="Comment" placeholderTextColor="rgba(255,255,255,0.45)" style={styles.input} /><Pressable style={styles.send} onPress={sendComment}><Text style={styles.sendText}>Send</Text></Pressable></View>
            </KeyboardAvoidingView>
            <Modal visible={showInvitePanel} transparent animationType="fade" onRequestClose={() => setShowInvitePanel(false)}>
              <View style={styles.scrim}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInvitePanel(false)} />
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Invite user</Text>
                  <View style={styles.searchRow}><TextInput value={inviteQuery} onChangeText={setInviteQuery} placeholder="Search display name" placeholderTextColor="rgba(255,255,255,0.45)" style={styles.searchInput} /><Pressable style={styles.findBtn} onPress={runInviteSearch}><Text style={styles.findBtnText}>{inviteLoading ? 'Finding...' : 'Find'}</Text></Pressable></View>
                  <FlatList data={inviteResults} keyExtractor={item => item.uid} style={{ maxHeight: 260, marginTop: 12 }} keyboardShouldPersistTaps="always" renderItem={({ item }) => <View style={styles.inviteRow}><View style={{ flex: 1 }}><Text style={styles.inviteName}>{item.name}</Text>{!!item.secondary ? <Text style={styles.inviteSub}>{item.secondary}</Text> : null}</View><Pressable style={styles.inviteBtn} onPress={() => sendInvite(item)}><Text style={styles.inviteBtnText}>Invite</Text></Pressable></View>} ListEmptyComponent={inviteQuery.trim() ? <Text style={styles.emptyText}>{inviteLoading ? 'Searching...' : 'No display names found.'}</Text> : null} />
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050913' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dimText: { color: 'rgba(255,255,255,0.7)' },
  lobby: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  body: { color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 10 },
  status: { color: '#8edfff', textAlign: 'center', marginTop: 16 },
  primaryBtn: { marginTop: 24, backgroundColor: '#11c5ff', borderRadius: 22, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#031521', fontWeight: '800' },
  secondaryBtn: { marginTop: 12, borderRadius: 22, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },
  stage: { flex: 1, backgroundColor: '#000' },
  videoFill: { flex: 1 },
  topBar: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 30, elevation: 30 },
  live: { color: '#ff606c', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  room: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { backgroundColor: 'rgba(8,18,32,0.78)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { color: '#fff', fontWeight: '700' },
  inset: { position: 'absolute', right: 14, bottom: 14, width: 116, height: 168, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', zIndex: 20, elevation: 20 },
  overlay: { position: 'absolute', top: 88, alignSelf: 'center', backgroundColor: 'rgba(8,18,32,0.78)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, zIndex: 25, elevation: 25 },
  overlayText: { color: '#fff', fontWeight: '700' },
  chatWrap: { backgroundColor: '#07111f', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  chatList: { maxHeight: 180 },
  comment: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  commentName: { color: '#9ddcff', fontWeight: '700', marginBottom: 3 },
  commentText: { color: '#fff' },
  compose: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  send: { backgroundColor: '#11c5ff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  sendText: { color: '#031521', fontWeight: '800' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 18 },
  panel: { backgroundColor: '#0a1626', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  panelTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  findBtn: { backgroundColor: '#11c5ff', borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  findBtnText: { color: '#031521', fontWeight: '800' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  inviteName: { color: '#fff', fontWeight: '700' },
  inviteSub: { color: 'rgba(255,255,255,0.62)', marginTop: 2, fontSize: 12 },
  inviteBtn: { backgroundColor: 'rgba(17,197,255,0.18)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  inviteBtnText: { color: '#9de8ff', fontWeight: '800' },
  emptyText: { color: 'rgba(255,255,255,0.62)', textAlign: 'center', paddingVertical: 16 },
});

export default FreshDriftExpoModal;
