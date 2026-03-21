import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
  hostUid?: string | null;
  autoJoin?: boolean;
  nonce?: number;
};

type SearchResultItem = { uid: string; name: string; secondary?: string | null };
type CommentRow = { id: string; text: string; fromName: string };
type FloatingReaction = { id: string; emoji: string; lane: number; anim: Animated.Value };

type Props = {
  visible: boolean;
  onClose: () => void;
  inviteJoinPreset?: InviteJoinPreset | null;
  searchOceanEntities: (term: string) => Promise<any[]>;
};

const INVITE_WINDOW_MS = 3 * 60 * 1000;
const REACTIONS = ['❤️', '🔥', '👏', '😍', '🎉'];

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
  return { uid, name: name || 'User', secondary: username && username !== name ? `@${username.replace(/^[@/]+/, '')}` : null };
};

const scoreSearchText = (term: string, ...values: Array<string | null | undefined>): number => {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return 0;
  const parts = normalizedTerm.split(/\s+/).filter(Boolean);
  let score = 0;
  values.forEach(value => {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return;
    if (text === normalizedTerm) score += 120;
    else if (text.startsWith(normalizedTerm)) score += 80;
    else if (text.includes(normalizedTerm)) score += 50;
    parts.forEach(part => {
      if (!part) return;
      if (text === part) score += 35;
      else if (text.startsWith(part)) score += 20;
      else if (text.includes(part)) score += 10;
    });
  });
  return score;
};

const extractRtcUid = (value: any, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const candidate =
    value?.localUid ??
    value?.uid ??
    value?.rtcUid ??
    value?.connection?.localUid ??
    value?.connection?.uid ??
    0;
  if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
    return candidate;
  }
  if (typeof candidate === 'string') {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
};

const WaveCastModal = ({ visible, onClose, inviteJoinPreset, searchOceanEntities }: Props) => {
  const insets = useSafeAreaInsets();
  const Agora = useMemo(() => { try { return require('react-native-agora'); } catch { return null; } }, []);
  const cfg = useMemo(() => { try { return require('../../liveConfig'); } catch { return null; } }, []);
  const appId = String(cfg?.AGORA_APP_ID || '').trim();
  const staticToken = String(cfg?.AGORA_STATIC_TOKEN || '').trim() || null;
  const me = auth().currentUser;
  const meUid = me?.uid || '';
  const meName = String(me?.displayName || (me?.email ? me.email.split('@')[0] : '') || 'User');
  const engineRef = useRef<any>(null);
  const joinedChannelRef = useRef<string | null>(null);
  const seenReactionIdsRef = useRef<Set<string>>(new Set());

  const [engineReady, setEngineReady] = useState(false);
  const [statusText, setStatusText] = useState('Ready');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomChannel, setRoomChannel] = useState('');
  const [roomTitle, setRoomTitle] = useState('WaveCast');
  const [hostUid, setHostUid] = useState<string | null>(null);
  const [myRtcUid, setMyRtcUid] = useState(0);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<SearchResultItem[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [preJoinBusy, setPreJoinBusy] = useState(false);

  const writeParticipant = useCallback(async (rtcUidOverride?: number) => {
    if (!roomId || !meUid) return;
    const nextRtcUid = extractRtcUid(rtcUidOverride, extractRtcUid(myRtcUid, 0));
    await firestore().collection(`wavecasts/${roomId}/participants`).doc(meUid).set({
      uid: meUid,
      name: meName,
      rtcUid: nextRtcUid > 0 ? nextRtcUid : null,
      role: hostUid === meUid ? 'host' : 'guest',
      hostUid: hostUid || meUid,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      updatedAtMs: Date.now(),
    }, { merge: true });
  }, [hostUid, meName, meUid, myRtcUid, roomId]);

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
    setRoomTitle('WaveCast');
    setHostUid(null);
    setMyRtcUid(0);
    setJoined(false);
    setRemoteUid(null);
    setCommentText('');
    setComments([]);
    setInviteQuery('');
    setInviteResults([]);
    setShowInvitePanel(false);
    setInviteLoading(false);
    setShowReactions(false);
    setFloatingReactions([]);
    setPreJoinBusy(false);
    seenReactionIdsRef.current = new Set();
  }, [cleanupEngine, visible]);

  const ensurePublishedMedia = useCallback((engine: any) => {
    try { engine.enableAudio?.(); } catch {}
    try { engine.enableLocalAudio?.(true); } catch {}
    try { engine.muteLocalAudioStream?.(false); } catch {}
    try { engine.setEnableSpeakerphone?.(true); } catch {}
    try { engine.enableVideo?.(); } catch {}
    try { engine.enableLocalVideo?.(true); } catch {}
    try { engine.muteLocalVideoStream?.(false); } catch {}
    try { engine.startPreview?.(); } catch {}
    try {
      engine.updateChannelMediaOptions?.({
        clientRoleType: Agora?.ClientRoleType?.ClientRoleBroadcaster ?? 1,
        publishMicrophoneTrack: true,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {}
    try {
      engine.setClientRole?.(
        Agora?.ClientRoleType?.ClientRoleBroadcaster ??
          Agora?.ClientRole?.Broadcaster ??
          1,
      );
    } catch {}
  }, [Agora]);

  const searchInviteUsers = useCallback(async (term: string): Promise<SearchResultItem[]> => {
    const normalized = term.trim().replace(/^[@/]+/, '');
    if (!normalized) return [];
    const lowerTerm = normalized.toLowerCase();
    const usersRef = firestore().collection('users');
    const byUid = new Map<string, SearchResultItem>();
    const putRow = (row: SearchResultItem | null) => {
      if (!row?.uid || row.uid === meUid) return;
      byUid.set(row.uid, row);
    };
    const pushDoc = (doc: any) => {
      const data = doc.data() || {};
      const uid = String(doc.id || data.uid || '').trim();
      if (!uid || uid === meUid) return;
      const displayName = String(data.displayName || data.name || data.username || 'User').trim();
      const username = String(data.username || data.userName || '').trim();
      putRow({ uid, name: displayName || 'User', secondary: username && username !== displayName ? `@${username.replace(/^[@/]+/, '')}` : null });
    };
    try {
      const displaySnap = await usersRef.where('displayName', '>=', normalized).where('displayName', '<=', normalized + '\uf8ff').limit(20).get();
      displaySnap.forEach(pushDoc);
    } catch {}
    try {
      const usernameSnap = await usersRef.where('username_lc', '>=', lowerTerm).where('username_lc', '<=', lowerTerm + '\uf8ff').limit(20).get();
      usernameSnap.forEach(pushDoc);
    } catch {}
    if (byUid.size < 12) {
      try {
        const broadSnap = await usersRef.limit(120).get();
        broadSnap.forEach((doc: any) => {
          const data = doc.data() || {};
          const uid = String(doc.id || data.uid || '').trim();
          if (!uid || uid === meUid) return;
          const displayName = String(data.displayName || data.name || '').trim();
          const username = String(data.username || data.userName || data.username_lc || '').trim();
          const score = scoreSearchText(lowerTerm, displayName, username, uid);
          if (score <= 0) return;
          putRow({
            uid,
            name: displayName || username || 'User',
            secondary: username && username !== displayName ? `@${username.replace(/^[@/]+/, '')}` : null,
          });
        });
      } catch {}
    }
    try {
      ((await searchOceanEntities(normalized)).map(normalizeSearchResult).filter(Boolean) as SearchResultItem[])
        .filter(item => item.uid !== meUid)
        .forEach(item => putRow(item));
    } catch {
      // ignore fallback failure
    }
    return Array.from(byUid.values())
      .map(row => ({
        row,
        score: scoreSearchText(lowerTerm, row.name, row.secondary, row.uid),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
      .slice(0, 24)
      .map(item => item.row);
  }, [meUid, searchOceanEntities]);

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
        ensurePublishedMedia(engine);
        engine.registerEventHandler?.({
          onJoinChannelSuccess: (connection: any, uidOrElapsed?: any) => {
            const actualRtcUid = extractRtcUid(connection, extractRtcUid(uidOrElapsed, myRtcUid));
            if (!cancelled) {
              if (actualRtcUid > 0) setMyRtcUid(actualRtcUid);
              setJoined(true);
              setStatusText('On air');
              ensurePublishedMedia(engine);
            }
            writeParticipant(actualRtcUid).catch(() => {});
          },
          onRejoinChannelSuccess: (connection: any, uidOrElapsed?: any) => {
            const actualRtcUid = extractRtcUid(connection, extractRtcUid(uidOrElapsed, myRtcUid));
            if (!cancelled) {
              if (actualRtcUid > 0) setMyRtcUid(actualRtcUid);
              setJoined(true);
              setStatusText('On air');
              ensurePublishedMedia(engine);
            }
            writeParticipant(actualRtcUid).catch(() => {});
          },
          onUserJoined: (_c: any, uid: number) => {
            if (!cancelled) {
              setRemoteUid(Number(uid));
              setStatusText('Guest connected');
            }
            try { engine.muteRemoteAudioStream?.(uid, false); } catch {}
            try { engine.muteRemoteVideoStream?.(uid, false); } catch {}
          },
          onUserOffline: (_c: any, uid: number) => { if (!cancelled) setRemoteUid(prev => (prev === Number(uid) ? null : prev)); },
          onError: (err: number) => { if (!cancelled) setStatusText(`Agora error ${err}`); },
        });
        engine.addListener?.('JoinChannelSuccess', (channelOrConnection: any, uidOrElapsed?: any) => {
          const actualRtcUid = extractRtcUid(channelOrConnection, extractRtcUid(uidOrElapsed, myRtcUid));
          if (!cancelled) {
            if (actualRtcUid > 0) setMyRtcUid(actualRtcUid);
            setJoined(true);
            setStatusText('On air');
            ensurePublishedMedia(engine);
          }
          writeParticipant(actualRtcUid).catch(() => {});
        });
        engine.addListener?.('UserJoined', (uid: number) => {
          if (!cancelled) {
            setRemoteUid(Number(uid));
            setStatusText('Guest connected');
          }
          try { engine.muteRemoteAudioStream?.(uid, false); } catch {}
          try { engine.muteRemoteVideoStream?.(uid, false); } catch {}
        });
        engine.addListener?.('UserOffline', (uid: number) => { if (!cancelled) setRemoteUid(prev => (prev === Number(uid) ? null : prev)); });
        engineRef.current = engine;
        if (!cancelled) setEngineReady(true);
      } catch (error: any) {
        if (!cancelled) setStatusText(String(error?.message || 'WaveCast init failed'));
      }
    })();
    return () => { cancelled = true; };
  }, [Agora, appId, ensurePermissions, ensurePublishedMedia, myRtcUid, visible, writeParticipant]);

  const hydrateRoom = useCallback(async (waveCastId: string) => {
    const snap = await firestore().collection('wavecasts').doc(waveCastId).get();
    const data = snap.data() || {};
    const channel = String(data.channel || inviteJoinPreset?.channel || '').trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
    if (!channel) throw new Error('Invite has no valid channel.');
    setRoomId(waveCastId);
    setRoomChannel(channel);
    setRoomTitle(String(data.title || inviteJoinPreset?.title || 'WaveCast'));
    setHostUid(String(data.hostUid || inviteJoinPreset?.hostUid || '').trim() || null);
    setMyRtcUid(mapRtcUidFromUserId(meUid));
    setStatusText('Joining WaveCast');
  }, [inviteJoinPreset?.channel, inviteJoinPreset?.hostUid, inviteJoinPreset?.title, meUid]);

  const startRoom = useCallback(async () => {
    if (!meUid) throw new Error('Sign in required');
    const ref = firestore().collection('wavecasts').doc();
    const channel = `wavecast_${ref.id}`.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
    await ref.set({
      title: 'WaveCast',
      channel,
      hostUid: meUid,
      hostName: meName,
      status: 'live',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    setRoomId(ref.id);
    setRoomChannel(channel);
    setRoomTitle('WaveCast');
    setHostUid(meUid);
    setMyRtcUid(mapRtcUidFromUserId(meUid));
    setStatusText('Joining WaveCast');
  }, [meName, meUid]);

  useEffect(() => {
    if (!visible || !inviteJoinPreset?.liveId) return;
    hydrateRoom(String(inviteJoinPreset.liveId)).catch(error => {
      Alert.alert('Could not open WaveCast invite', String(error?.message || 'Try again.'));
    });
  }, [hydrateRoom, inviteJoinPreset?.liveId, visible]);

  useEffect(() => {
    if (!visible || !roomId || !roomChannel || !myRtcUid || !engineRef.current) return;
    if (joinedChannelRef.current === roomChannel) return;
    let cancelled = false;
    (async () => {
      const engine = engineRef.current;
      const uidCandidates = Array.from(new Set([Number(myRtcUid) || 0, 0]));
      const tokenCandidates = Array.from(new Set([null, staticToken].filter(v => v !== undefined))) as Array<string | null>;
      let lastErr: any = null;
      const isV4Engine = typeof Agora?.createAgoraRtcEngine === 'function';
      for (const token of tokenCandidates) {
        for (const uid of uidCandidates) {
          try {
            if (isV4Engine) {
              await engine.joinChannel?.(token, roomChannel, uid, {
                clientRoleType: Agora?.ClientRoleType?.ClientRoleBroadcaster ?? 1,
                publishMicrophoneTrack: true,
                publishCameraTrack: true,
                autoSubscribeAudio: true,
                autoSubscribeVideo: true,
              });
            } else {
              await engine.joinChannel?.(token, roomChannel, uid);
            }
            if (cancelled) return;
            joinedChannelRef.current = roomChannel;
            ensurePublishedMedia(engine);
            await writeParticipant(uid);
            return;
          } catch (error) {
            lastErr = error;
          }
        }
      }
      if (!cancelled) setStatusText(String(lastErr?.message || 'Could not join WaveCast'));
    })();
    return () => { cancelled = true; };
  }, [Agora, ensurePublishedMedia, myRtcUid, roomChannel, roomId, staticToken, visible, writeParticipant]);

  useEffect(() => {
    if (!visible || !roomId || !meUid) return;
    return () => {
      firestore()
        .collection(`wavecasts/${roomId}/participants`)
        .doc(meUid)
        .delete()
        .catch(() => {});
    };
  }, [meUid, roomId, visible]);

  useEffect(() => {
    if (!visible || !roomId) return;
    const unsubParticipants = firestore().collection(`wavecasts/${roomId}/participants`).onSnapshot(snap => {
      const others = (snap?.docs || [])
        .map(doc => ({ id: doc.id, ...(doc.data() || {}) }))
        .filter((row: any) => String(row.uid || row.id || '') !== meUid);
      const activeOther = others
        .map((row: any) => ({
          rtcUid: Number(row.rtcUid || 0) || 0,
          updatedAtMs: Number(row.updatedAtMs || 0) || 0,
        }))
        .filter((row: any) => row.rtcUid > 0)
        .sort((a: any, b: any) => b.updatedAtMs - a.updatedAtMs)[0];
      if (activeOther?.rtcUid) {
        setRemoteUid(prev => (prev && prev === activeOther.rtcUid ? prev : activeOther.rtcUid));
        setStatusText('Guest connected');
      }
    });
    const unsubComments = firestore().collection(`wavecasts/${roomId}/comments`).orderBy('createdAt', 'asc').limit(120).onSnapshot(snap => {
      setComments((snap.docs || []).map(doc => ({ id: doc.id, text: String(doc.data()?.text || ''), fromName: String(doc.data()?.fromName || 'User') })));
    });
    const unsubReactions = firestore().collection(`wavecasts/${roomId}/reactions`).orderBy('createdAt', 'asc').limit(80).onSnapshot(snap => {
      (snap.docs || []).forEach((doc, index) => {
        if (seenReactionIdsRef.current.has(doc.id)) return;
        seenReactionIdsRef.current.add(doc.id);
        const emoji = String(doc.data()?.emoji || '').trim();
        if (!emoji) return;
        const anim = new Animated.Value(0);
        const lane = index % 4;
        setFloatingReactions(prev => [...prev, { id: doc.id, emoji, lane, anim }].slice(-16));
        Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true }).start(() => {
          setFloatingReactions(prev => prev.filter(item => item.id !== doc.id));
        });
      });
    });
    return () => {
      try { unsubParticipants(); } catch {}
      try { unsubComments(); } catch {}
      try { unsubReactions(); } catch {}
    };
  }, [meUid, roomId, visible]);

  const runInviteSearch = useCallback(async () => {
    const term = inviteQuery.trim();
    if (!term) return setInviteResults([]);
    setInviteLoading(true);
    try {
      setInviteResults(await searchInviteUsers(term));
    } finally {
      setInviteLoading(false);
    }
  }, [inviteQuery, searchInviteUsers]);

  const sendInvite = useCallback(async (target: SearchResultItem) => {
    if (!roomId || !roomChannel || !meUid) return;
    await firestore().collection(`users/${target.uid}/wavecast_invites`).add({
      liveId: roomId,
      liveChannel: roomChannel,
      liveTitle: roomTitle,
      fromUid: meUid,
      fromName: meName,
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
      expiresAtMs: Date.now() + INVITE_WINDOW_MS,
    });
    Alert.alert('Invite sent', `${target.name} can join your WaveCast now.`);
  }, [meName, meUid, roomChannel, roomId, roomTitle]);

  const handlePrimaryAction = useCallback(async () => {
    if (preJoinBusy) return;
    setPreJoinBusy(true);
    try {
      if (inviteJoinPreset?.liveId) {
        await hydrateRoom(String(inviteJoinPreset.liveId));
      } else {
        await startRoom();
      }
    } catch (error: any) {
      Alert.alert(
        inviteJoinPreset?.liveId ? 'Could not join WaveCast' : 'Could not start WaveCast',
        String(error?.message || 'Try again.'),
      );
    } finally {
      setPreJoinBusy(false);
    }
  }, [hydrateRoom, inviteJoinPreset?.liveId, preJoinBusy, startRoom]);

  const sendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !roomId || !meUid) return;
    await firestore().collection(`wavecasts/${roomId}/comments`).add({
      text,
      fromUid: meUid,
      fromName: meName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
    });
    setCommentText('');
  }, [commentText, meName, meUid, roomId]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!roomId || !meUid) return;
    await firestore().collection(`wavecasts/${roomId}/reactions`).add({
      emoji,
      fromUid: meUid,
      fromName: meName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
    });
  }, [meName, meUid, roomId]);

  const renderLocalView = () => {
    const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
    const RtcTextureView = (Agora as any)?.RtcTextureView;
    const RtcLocalView = Agora?.RtcLocalView;
    const VideoRenderMode = Agora?.VideoRenderMode;
    if (RtcTextureView) return React.createElement(RtcTextureView, { style: styles.videoFill, canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 } });
    if (RtcSurfaceView) return React.createElement(RtcSurfaceView, { style: styles.videoFill, canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 } });
    if (RtcLocalView?.SurfaceView) return React.createElement(RtcLocalView.SurfaceView, { style: styles.videoFill, renderMode: VideoRenderMode?.Fit ?? 2 });
    return <View style={[styles.videoFill, styles.center]}><Text style={styles.dimText}>Opening camera...</Text></View>;
  };

  const renderRemoteView = () => {
    const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
    const RtcTextureView = (Agora as any)?.RtcTextureView;
    const RtcRemoteView = Agora?.RtcRemoteView;
    const VideoRenderMode = Agora?.VideoRenderMode;
    if (!remoteUid) return <View style={[styles.videoFill, styles.center]}><Text style={styles.dimText}>Waiting for guest video...</Text></View>;
    if (RtcTextureView) return React.createElement(RtcTextureView, { style: styles.videoFill, canvas: { uid: remoteUid, renderMode: VideoRenderMode?.Fit ?? 2 } });
    if (RtcSurfaceView) return React.createElement(RtcSurfaceView, { style: styles.videoFill, canvas: { uid: remoteUid, renderMode: VideoRenderMode?.Fit ?? 2 } });
    if (RtcRemoteView?.SurfaceView) return React.createElement(RtcRemoteView.SurfaceView, { style: styles.videoFill, uid: remoteUid, channelId: roomChannel, renderMode: VideoRenderMode?.Fit ?? 2 });
    return <View style={[styles.videoFill, styles.center]}><Text style={styles.dimText}>Guest video connected</Text></View>;
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
        {!engineReady ? (
          <View style={styles.lobby}>
            <Text style={styles.title}>WaveCast</Text>
            <Text style={styles.body}>Preparing camera and audio...</Text>
            {!!statusText && statusText !== 'Ready' ? <Text style={styles.status}>{statusText}</Text> : null}
            <Pressable style={styles.secondaryBtn} onPress={onClose}><Text style={styles.secondaryBtnText}>Close</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.stage}>
              {remoteUid ? renderRemoteView() : renderLocalView()}
              <View style={styles.topBar}>
                <View><Text style={styles.live}>LIVE</Text><Text style={styles.room}>{roomTitle}</Text><Text style={styles.meta}>{remoteUid ? 'Guest connected' : 'Waiting for guest'}</Text></View>
                <View style={styles.row}>
                  <Pressable style={styles.chip} onPress={() => setShowInvitePanel(true)}><Text style={styles.chipText}>Invite</Text></Pressable>
                  <Pressable style={styles.chip} onPress={() => setShowReactions(v => !v)}><Text style={styles.chipText}>React</Text></Pressable>
                  <Pressable style={styles.chip} onPress={onClose}><Text style={styles.chipText}>Close</Text></Pressable>
                </View>
              </View>
              {remoteUid ? <View style={styles.inset}>{renderLocalView()}</View> : null}
              {!roomId && !inviteJoinPreset?.autoJoin ? (
                <View style={styles.preJoinCard}>
                  <Text style={styles.preJoinTitle}>WaveCast</Text>
                  <Text style={styles.preJoinBody}>Camera is ready. Start your room or join the invite.</Text>
                  <Pressable style={styles.primaryBtn} onPress={handlePrimaryAction}>
                    <Text style={styles.primaryBtnText}>
                      {preJoinBusy
                        ? inviteJoinPreset?.liveId
                          ? 'Joining...'
                          : 'Starting...'
                        : inviteJoinPreset?.liveId
                        ? 'Join WaveCast'
                        : 'Start WaveCast'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} onPress={onClose}>
                    <Text style={styles.secondaryBtnText}>Close</Text>
                  </Pressable>
                </View>
              ) : !joined ? (
                <View style={styles.overlay}><Text style={styles.overlayText}>{statusText}</Text></View>
              ) : null}
              {showReactions ? <View style={styles.reactionTray}>{REACTIONS.map(emoji => <Pressable key={emoji} style={styles.reactionBtn} onPress={() => sendReaction(emoji)}><Text style={styles.reactionEmoji}>{emoji}</Text></Pressable>)}</View> : null}
              {floatingReactions.map(item => (
                <Animated.View key={item.id} style={[styles.floatReaction, { left: 18 + item.lane * 56, opacity: item.anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }), transform: [{ translateY: item.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -300] }) }] }]}>
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </Animated.View>
              ))}
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatWrap}>
              <FlatList data={comments} keyExtractor={item => item.id} style={styles.chatList} contentContainerStyle={{ padding: 12, gap: 8 }} renderItem={({ item }) => <View style={styles.comment}><Text style={styles.commentName}>{item.fromName}</Text><Text style={styles.commentText}>{item.text}</Text></View>} />
              <View style={styles.compose}><TextInput value={commentText} onChangeText={setCommentText} placeholder="Comment" placeholderTextColor="rgba(255,255,255,0.45)" style={styles.input} /><Pressable style={styles.send} onPress={sendComment}><Text style={styles.sendText}>Send</Text></Pressable></View>
            </KeyboardAvoidingView>
            <Modal visible={showInvitePanel} transparent animationType="fade" onRequestClose={() => setShowInvitePanel(false)}>
              <View style={styles.scrim}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInvitePanel(false)} />
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Invite to WaveCast</Text>
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
  root: { flex: 1, backgroundColor: '#08111b' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dimText: { color: 'rgba(255,255,255,0.7)' },
  lobby: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  body: { color: 'rgba(255,255,255,0.74)', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  status: { color: '#8de7ff', textAlign: 'center', marginTop: 16 },
  primaryBtn: { marginTop: 24, backgroundColor: '#13d7b8', borderRadius: 22, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#052018', fontWeight: '900' },
  secondaryBtn: { marginTop: 12, borderRadius: 22, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },
  stage: { flex: 1, backgroundColor: '#000' },
  videoFill: { flex: 1 },
  topBar: { position: 'absolute', top: 12, left: 12, right: 12, zIndex: 30, elevation: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  live: { color: '#ff6a73', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  room: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 2 },
  meta: { color: 'rgba(255,255,255,0.72)', marginTop: 2, fontSize: 12 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { backgroundColor: 'rgba(8,18,32,0.8)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { color: '#fff', fontWeight: '700' },
  inset: { position: 'absolute', right: 14, bottom: 14, width: 120, height: 170, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', zIndex: 20, elevation: 20 },
  overlay: { position: 'absolute', top: 88, alignSelf: 'center', backgroundColor: 'rgba(8,18,32,0.78)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, zIndex: 25, elevation: 25 },
  overlayText: { color: '#fff', fontWeight: '700' },
  preJoinCard: { position: 'absolute', left: 18, right: 18, bottom: 30, backgroundColor: 'rgba(8,18,32,0.82)', borderRadius: 24, padding: 18, zIndex: 25, elevation: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  preJoinTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  preJoinBody: { color: 'rgba(255,255,255,0.74)', textAlign: 'center', marginTop: 8, marginBottom: 16, lineHeight: 20 },
  reactionTray: { position: 'absolute', right: 14, top: 110, zIndex: 30, gap: 8 },
  reactionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  reactionEmoji: { fontSize: 20 },
  floatReaction: { position: 'absolute', bottom: 110, zIndex: 18 },
  chatWrap: { backgroundColor: '#07111f', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  chatList: { maxHeight: 180 },
  comment: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  commentName: { color: '#8de7ff', fontWeight: '700', marginBottom: 3 },
  commentText: { color: '#fff' },
  compose: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  send: { backgroundColor: '#13d7b8', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  sendText: { color: '#052018', fontWeight: '900' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'center', padding: 18 },
  panel: { backgroundColor: '#0a1626', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  panelTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  findBtn: { backgroundColor: '#13d7b8', borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center' },
  findBtnText: { color: '#052018', fontWeight: '900' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  inviteName: { color: '#fff', fontWeight: '700' },
  inviteSub: { color: 'rgba(255,255,255,0.62)', marginTop: 2, fontSize: 12 },
  inviteBtn: { backgroundColor: 'rgba(19,215,184,0.18)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  inviteBtnText: { color: '#9ff5e8', fontWeight: '900' },
  emptyText: { color: 'rgba(255,255,255,0.62)', textAlign: 'center', paddingVertical: 16 },
});

export default WaveCastModal;
