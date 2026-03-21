import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchResult = {
  kind: 'user' | 'vibe';
  id: string;
  label: string;
  extra?: Record<string, any>;
};

type LiveInviteJoinPreset = {
  liveId?: string | null;
  channel?: string | null;
  token?: string | null;
  title?: string | null;
  fromName?: string | null;
  hostUid?: string | null;
  autoJoin?: boolean;
  requireApproval?: boolean;
  nonce?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  searchOceanEntities: (term: string) => Promise<SearchResult[]>;
  inviteJoinPreset?: LiveInviteJoinPreset | null;
};

type UserRow = {
  uid: string;
  displayName: string;
  username?: string;
  photoURL?: string | null;
};

type CommentRow = {
  id: string;
  fromName: string;
  text: string;
  createdAtMs: number;
};

const ensureCamMicPermissionsAndroid = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return (
      result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
};

const mapRtcUidFromUserId = (value: string | null | undefined): number => {
  const seed = String(value || '').trim() || '0';
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return (hash % 2147483646) + 1;
};

const sanitizeChannel = (value: string, fallback = 'WaveCast'): string =>
  String(value || fallback)
    .trim()
    .replace(/[^A-Za-z0-9_]/g, '_')
    .slice(0, 64) || fallback;

const toMillis = (value: any): number => {
  try {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value?.toMillis === 'function') return Number(value.toMillis()) || 0;
    if (typeof value?.seconds === 'number') {
      return Math.floor(value.seconds * 1000 + (Number(value.nanoseconds || 0) / 1e6 || 0));
    }
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : 0;
  } catch {
    return 0;
  }
};

const fmt = (ms: number) => {
  if (!ms) return '';
  try {
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const WaveCastModal = ({ visible, onClose, searchOceanEntities, inviteJoinPreset }: Props) => {
  const insets = useSafeAreaInsets();
  const Agora = useMemo(() => {
    try {
      return require('react-native-agora');
    } catch {
      return null;
    }
  }, []);
  const cfg = (() => {
    try {
      return require('../../liveConfig');
    } catch {
      return null;
    }
  })();
  const appId: string = String(cfg?.AGORA_APP_ID || '').trim();
  const staticToken: string | null = String(cfg?.AGORA_STATIC_TOKEN || '').trim() || null;
  const defaultChannel = sanitizeChannel(String(cfg?.AGORA_CHANNEL_NAME || 'WaveCast'));

  const me = auth().currentUser;
  const myUid = String(me?.uid || '').trim();
  const myName = String(
    me?.displayName || (me?.email ? String(me.email).split('@')[0] : '') || 'You',
  ).trim();
  const myRtcUid = useMemo(() => mapRtcUidFromUserId(myUid), [myUid]);

  const engineRef = useRef<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomChannel, setRoomChannel] = useState(defaultChannel);
  const [roomTitle, setRoomTitle] = useState('WaveCast');
  const [isHost, setIsHost] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [statusText, setStatusText] = useState('Opening camera...');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState<UserRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');

  const AVView = Agora?.AgoraVideoView;
  const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
  const RtcTextureView = (Agora as any)?.RtcTextureView;
  const RtcLocalView = Agora?.RtcLocalView;
  const RtcRemoteView = Agora?.RtcRemoteView;
  const VideoRenderMode = Agora?.VideoRenderMode;
  const VideoSourceType = Agora?.VideoSourceType;

  const cleanupEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try { engine.leaveChannel?.(); } catch {}
    try { engine.stopPreview?.(); } catch {}
    try { (engine.destroy ?? engine.release)?.(); } catch {}
    engineRef.current = null;
  }, []);

  const writeParticipant = useCallback(async (id: string) => {
    if (!id || !myUid) return;
    try {
      await firestore().collection(`wavecasts/${id}/participants`).doc(myUid).set({
        uid: myUid,
        rtcUid: myRtcUid,
        displayName: myName,
        photoURL: me?.photoURL || null,
        cameraMuted,
        micMuted,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        joinedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch {}
  }, [cameraMuted, me?.photoURL, micMuted, myName, myRtcUid, myUid]);

  const ensurePublishedMedia = useCallback((engine: any) => {
    try { engine.enableAudio?.(); } catch {}
    try { engine.enableLocalAudio?.(!micMuted); } catch {}
    try { engine.muteLocalAudioStream?.(!!micMuted); } catch {}
    try { engine.setEnableSpeakerphone?.(speakerEnabled); } catch {}
    try { engine.enableVideo?.(); } catch {}
    try { engine.enableLocalVideo?.(!cameraMuted); } catch {}
    try { engine.muteLocalVideoStream?.(!!cameraMuted); } catch {}
    try { engine.startPreview?.(); } catch {}
    try {
      engine.updateChannelMediaOptions?.({
        clientRoleType: Agora?.ClientRoleType?.ClientRoleBroadcaster ?? 1,
        publishMicrophoneTrack: !micMuted,
        publishCameraTrack: !cameraMuted,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {}
  }, [Agora?.ClientRoleType, cameraMuted, micMuted, speakerEnabled]);

  const joinWaveCast = useCallback(async ({
    nextRoomId,
    nextChannel,
    nextTitle,
    hostMode,
    token,
  }: {
    nextRoomId: string;
    nextChannel: string;
    nextTitle?: string;
    hostMode: boolean;
    token?: string | null;
  }) => {
    if (!visible || !Agora || !appId) return;
    const ok = await ensureCamMicPermissionsAndroid();
    if (!ok) {
      setErrorText('Camera and microphone permissions are required.');
      return;
    }
    cleanupEngine();
    setRoomId(nextRoomId);
    setRoomChannel(nextChannel);
    setRoomTitle(nextTitle || 'WaveCast');
    setIsHost(hostMode);
    setRemoteUid(null);
    setErrorText(null);
    setStatusText(hostMode ? 'Starting WaveCast...' : 'Joining WaveCast...');
    const safeToken = String(token || staticToken || '').trim() || null;
    try {
      if (typeof Agora?.createAgoraRtcEngine === 'function') {
        const engine = Agora.createAgoraRtcEngine();
        engineRef.current = engine;
        engine.initialize?.({
          appId,
          channelProfile: Agora.ChannelProfileType?.ChannelProfileCommunication ?? 0,
        });
        ensurePublishedMedia(engine);
        engine.registerEventHandler?.({
          onJoinChannelSuccess: () => {
            setIsJoined(true);
            setStatusText(hostMode ? 'Waiting for guest...' : 'Connected');
            ensurePublishedMedia(engine);
            writeParticipant(nextRoomId);
          },
          onRejoinChannelSuccess: () => {
            setIsJoined(true);
            setStatusText(remoteUid ? `Guest live ${remoteUid}` : 'Connected');
            ensurePublishedMedia(engine);
            writeParticipant(nextRoomId);
          },
          onUserJoined: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            setRemoteUid(parsed);
            setStatusText(`Guest live ${parsed}`);
            try { engine.muteRemoteVideoStream?.(parsed, false); } catch {}
            try { engine.muteRemoteAudioStream?.(parsed, false); } catch {}
          },
          onUserOffline: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            setRemoteUid(prev => (prev === parsed ? null : prev));
            setStatusText(hostMode ? 'Waiting for guest...' : 'Connected');
          },
          onConnectionStateChanged: (_conn: any, state: number, reason: number) => {
            const s = Number(state);
            const r = Number(reason);
            if (s === 3 || s === 4) setStatusText(`Reconnecting ${s}:${r}`);
          },
          onError: (err: number) => setErrorText(`Agora error ${err}`),
        });
        await engine.joinChannel(safeToken, nextChannel, myRtcUid, {
          clientRoleType: Agora.ClientRoleType?.ClientRoleBroadcaster ?? 1,
          publishMicrophoneTrack: !micMuted,
          publishCameraTrack: !cameraMuted,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
        return;
      }
      if (Agora?.RtcEngine?.create) {
        const engine = await Agora.RtcEngine.create(appId);
        engineRef.current = engine;
        ensurePublishedMedia(engine);
        engine.addListener?.('JoinChannelSuccess', () => {
          setIsJoined(true);
          setStatusText(hostMode ? 'Waiting for guest...' : 'Connected');
          ensurePublishedMedia(engine);
          writeParticipant(nextRoomId);
        });
        engine.addListener?.('RejoinChannelSuccess', () => {
          setIsJoined(true);
          setStatusText(remoteUid ? `Guest live ${remoteUid}` : 'Connected');
          ensurePublishedMedia(engine);
          writeParticipant(nextRoomId);
        });
        engine.addListener?.('UserJoined', (uid: number) => {
          const parsed = Number(uid);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          setRemoteUid(parsed);
          setStatusText(`Guest live ${parsed}`);
          try { engine.muteRemoteVideoStream?.(parsed, false); } catch {}
          try { engine.muteRemoteAudioStream?.(parsed, false); } catch {}
        });
        engine.addListener?.('UserOffline', (uid: number) => {
          const parsed = Number(uid);
          setRemoteUid(prev => (prev === parsed ? null : prev));
          setStatusText(hostMode ? 'Waiting for guest...' : 'Connected');
        });
        engine.addListener?.('ConnectionStateChanged', (state: number, reason: number) => {
          const s = Number(state);
          const r = Number(reason);
          if (s === 3 || s === 4) setStatusText(`Reconnecting ${s}:${r}`);
        });
        engine.addListener?.('Error', (err: number) => setErrorText(`Agora error ${err}`));
        await engine.joinChannel(safeToken, nextChannel, myRtcUid);
        return;
      }
      setErrorText('WaveCast unavailable: Agora engine missing.');
    } catch (error: any) {
      console.warn('WaveCast join failed', error);
      setErrorText(String(error?.message || 'Could not join WaveCast.'));
    }
  }, [
    Agora,
    appId,
    cameraMuted,
    cleanupEngine,
    ensurePublishedMedia,
    micMuted,
    myRtcUid,
    remoteUid,
    staticToken,
    visible,
    writeParticipant,
  ]);

  useEffect(() => {
    if (!visible) {
      cleanupEngine();
      setRoomId(null);
      setRoomChannel(defaultChannel);
      setRoomTitle('WaveCast');
      setIsHost(false);
      setIsJoined(false);
      setRemoteUid(null);
      setMicMuted(false);
      setCameraMuted(false);
      setSpeakerEnabled(true);
      setStatusText('Opening camera...');
      setErrorText(null);
      setShowInviteSheet(false);
      setSearchQuery('');
      setSearchResults([]);
      setComments([]);
      setCommentText('');
      return;
    }
    let mounted = true;
    (async () => {
      const ok = await ensureCamMicPermissionsAndroid();
      if (!mounted) return;
      if (!ok) {
        setErrorText('Camera and microphone permissions are required.');
        return;
      }
      try {
        if (Agora && appId) {
          if (typeof Agora?.createAgoraRtcEngine === 'function') {
            const engine = Agora.createAgoraRtcEngine();
            engineRef.current = engine;
            engine.initialize?.({
              appId,
              channelProfile: Agora.ChannelProfileType?.ChannelProfileCommunication ?? 0,
            });
            ensurePublishedMedia(engine);
          } else if (Agora?.RtcEngine?.create) {
            const engine = await Agora.RtcEngine.create(appId);
            engineRef.current = engine;
            ensurePublishedMedia(engine);
          }
          setStatusText('Camera ready');
        }
      } catch (error: any) {
        setErrorText(String(error?.message || 'Could not open camera.'));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [Agora, appId, cleanupEngine, defaultChannel, ensurePublishedMedia, visible]);

  useEffect(() => {
    if (!visible || !inviteJoinPreset?.autoJoin || !inviteJoinPreset?.liveId) return;
    const liveId = String(inviteJoinPreset.liveId || '').trim();
    if (!liveId) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await firestore().collection('wavecasts').doc(liveId).get();
        const data = snap?.data() || {};
        if (cancelled) return;
        await joinWaveCast({
          nextRoomId: liveId,
          nextChannel: sanitizeChannel(
            String(data.channel || inviteJoinPreset.channel || defaultChannel),
            defaultChannel,
          ),
          nextTitle: String(data.title || inviteJoinPreset.title || 'WaveCast'),
          hostMode: false,
          token: inviteJoinPreset.token || null,
        });
      } catch (error: any) {
        setErrorText(String(error?.message || 'Could not open invited WaveCast.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    defaultChannel,
    inviteJoinPreset?.autoJoin,
    inviteJoinPreset?.channel,
    inviteJoinPreset?.liveId,
    inviteJoinPreset?.title,
    inviteJoinPreset?.token,
    joinWaveCast,
    visible,
  ]);

  useEffect(() => {
    if (!visible || !roomId) return;
    const unsubComments = firestore()
      .collection(`wavecasts/${roomId}/comments`)
      .orderBy('createdAt', 'asc')
      .limitToLast(40)
      .onSnapshot(snap => {
        const next = (snap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            fromName: String(data.fromName || data.displayName || 'User'),
            text: String(data.text || ''),
            createdAtMs: Math.max(Number(data.createdAtMs || 0), toMillis(data.createdAt)),
          } as CommentRow;
        });
        setComments(next);
      });
    const unsubParticipants = firestore()
      .collection(`wavecasts/${roomId}/participants`)
      .onSnapshot(snap => {
        const others = (snap?.docs || [])
          .map(doc => ({ id: doc.id, ...(doc.data() || {}) }))
          .filter((row: any) => String(row.uid || row.id) !== myUid);
        if (!others.length && !remoteUid) {
          setStatusText(isHost ? 'Waiting for guest...' : 'Connected');
        } else if (others.length && !remoteUid) {
          setStatusText(`Guest present ${others[0]?.rtcUid || others[0]?.uid || ''}`);
        }
      });
    return () => {
      try { unsubComments(); } catch {}
      try { unsubParticipants(); } catch {}
    };
  }, [isHost, myUid, remoteUid, roomId, visible]);

  useEffect(() => {
    if (!visible || !roomId || !isJoined) return;
    writeParticipant(roomId).catch(() => {});
  }, [cameraMuted, isJoined, micMuted, roomId, speakerEnabled, visible, writeParticipant]);

  useEffect(() => {
    if (!visible || !roomChannel || !isJoined) return;
    ensurePublishedMedia(engineRef.current);
  }, [cameraMuted, ensurePublishedMedia, isJoined, micMuted, roomChannel, speakerEnabled, visible]);

  const startWaveCast = useCallback(async () => {
    if (!myUid) {
      Alert.alert('Sign in required');
      return;
    }
    const ref = firestore().collection('wavecasts').doc();
    const nextRoomId = ref.id;
    const nextChannel = sanitizeChannel(`wavecast_${nextRoomId}`, defaultChannel);
    try {
      await ref.set(
        {
          channel: nextChannel,
          title: 'WaveCast',
          hostUid: myUid,
          hostName: myName,
          status: 'live',
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await joinWaveCast({
        nextRoomId,
        nextChannel,
        nextTitle: 'WaveCast',
        hostMode: true,
      });
    } catch (error: any) {
      setErrorText(String(error?.message || 'Could not start WaveCast.'));
    }
  }, [defaultChannel, joinWaveCast, myName, myUid]);

  const searchUsers = useCallback(async () => {
    const term = String(searchQuery || '').trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      return;
    }
    setSearchBusy(true);
    try {
      const rows = new Map<string, UserRow>();
      const snap = await firestore().collection('users').limit(80).get().catch(() => null);
      (snap?.docs || []).forEach((doc: any) => {
        const data = doc.data() || {};
        const displayName = String(data.displayName || data.name || data.username || doc.id);
        const username = String(data.username || data.username_lc || '').trim();
        const hay = `${displayName} ${username}`.toLowerCase();
        if (!hay.includes(term)) return;
        rows.set(doc.id, {
          uid: doc.id,
          displayName,
          username: username || undefined,
          photoURL: data.photoURL || data.avatar || null,
        });
      });
      if (!rows.size) {
        const fallback = await searchOceanEntities(term);
        fallback.filter(item => item.kind === 'user').forEach(item => {
          rows.set(item.id, { uid: item.id, displayName: String(item.label || item.id) });
        });
      }
      setSearchResults(Array.from(rows.values()).filter(item => item.uid !== myUid));
    } finally {
      setSearchBusy(false);
    }
  }, [myUid, searchOceanEntities, searchQuery]);

  const sendInvite = useCallback(async (target: UserRow) => {
    if (!roomId || !myUid) return;
    try {
      await firestore().collection(`users/${target.uid}/wavecast_invites`).add({
        fromUid: myUid,
        fromName: myName,
        liveId: roomId,
        liveChannel: roomChannel,
        liveTitle: roomTitle,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
        expiresAtMs: Date.now() + 2 * 60 * 1000,
      });
      await firestore()
        .collection(`wavecasts/${roomId}/invite_status`)
        .doc(target.uid)
        .set(
          {
            uid: target.uid,
            status: 'pending',
            fromUid: myUid,
            fromName: myName,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      setShowInviteSheet(false);
    } catch (error: any) {
      Alert.alert('Invite failed', String(error?.message || 'Could not send invite.'));
    }
  }, [myName, myUid, roomChannel, roomId, roomTitle]);

  const sendComment = useCallback(async () => {
    const text = String(commentText || '').trim();
    if (!text || !roomId || !myUid) return;
    setCommentText('');
    try {
      await firestore().collection(`wavecasts/${roomId}/comments`).add({
        text,
        fromUid: myUid,
        fromName: myName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
      });
    } catch {}
  }, [commentText, myName, myUid, roomId]);

  const leaveWaveCast = useCallback(async () => {
    const activeRoomId = roomId;
    cleanupEngine();
    if (activeRoomId && myUid) {
      try {
        await firestore().collection(`wavecasts/${activeRoomId}/participants`).doc(myUid).delete();
      } catch {}
      if (isHost) {
        try {
          await firestore().collection('wavecasts').doc(activeRoomId).set(
            {
              status: 'ended',
              endedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        } catch {}
      }
    }
    onClose();
  }, [cleanupEngine, isHost, myUid, onClose, roomId]);

  const toggleMic = useCallback(() => {
    const next = !micMuted;
    setMicMuted(next);
    try { engineRef.current?.muteLocalAudioStream?.(next); } catch {}
    try { engineRef.current?.enableLocalAudio?.(!next); } catch {}
  }, [micMuted]);

  const toggleCamera = useCallback(() => {
    const next = !cameraMuted;
    setCameraMuted(next);
    try { engineRef.current?.muteLocalVideoStream?.(next); } catch {}
    try { engineRef.current?.enableLocalVideo?.(!next); } catch {}
    try { if (!next) engineRef.current?.startPreview?.(); } catch {}
  }, [cameraMuted]);

  const toggleSpeaker = useCallback(() => {
    const next = !speakerEnabled;
    setSpeakerEnabled(next);
    try { engineRef.current?.setEnableSpeakerphone?.(next); } catch {}
    try { engineRef.current?.setDefaultAudioRouteToSpeakerphone?.(next); } catch {}
  }, [speakerEnabled]);

  if (!visible) return null;

  const renderMainVideo = () => {
    if (remoteUid) {
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style: StyleSheet.absoluteFill,
          canvas: { uid: remoteUid, renderMode: VideoRenderMode?.Fit ?? 2 },
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style: StyleSheet.absoluteFill,
          canvas: { uid: remoteUid, renderMode: VideoRenderMode?.Fit ?? 2 },
        });
      }
      if (RtcRemoteView?.SurfaceView) {
        return React.createElement(RtcRemoteView.SurfaceView, {
          style: StyleSheet.absoluteFill,
          uid: remoteUid,
          channelId: roomChannel,
          renderMode: VideoRenderMode?.Fit ?? 2,
        });
      }
    }
    if (!cameraMuted) {
      if (AVView) {
        return (
          <AVView
            style={StyleSheet.absoluteFill}
            showLocalVideo={true}
            videoSourceType={
              (VideoSourceType &&
                (VideoSourceType.VideoSourceCameraPrimary ??
                  VideoSourceType.VideoSourceCamera)) ||
              0
            }
            renderMode={(VideoRenderMode && VideoRenderMode.Fit) || 2}
          />
        );
      }
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style: StyleSheet.absoluteFill,
          canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style: StyleSheet.absoluteFill,
          canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
        });
      }
      if (RtcLocalView?.SurfaceView) {
        return React.createElement(RtcLocalView.SurfaceView, {
          style: StyleSheet.absoluteFill,
          renderMode: VideoRenderMode?.Fit ?? 2,
        });
      }
    }
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerStateText}>{remoteUid ? 'Remote video connected' : 'Opening camera...'}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={leaveWaveCast}>
      <View style={styles.root}>
        <View style={styles.stage}>{renderMainVideo()}</View>
        <View style={[styles.topBar, { top: insets.top + 10 }]}>
          <View style={styles.topMeta}>
            <Text style={styles.topLabel}>WAVECAST</Text>
            <Text style={styles.topTitle}>{roomTitle}</Text>
            <Text style={styles.topStatus}>{errorText || statusText}</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={leaveWaveCast}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>

        {!inviteJoinPreset?.autoJoin && !roomId && (
          <View style={[styles.startCard, { top: insets.top + 90 }]}>
            <Text style={styles.startCardTitle}>Ready to go live</Text>
            <Text style={styles.startCardText}>
              Your camera is open. Start WaveCast, then invite someone to join.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={startWaveCast}>
              <Text style={styles.primaryBtnText}>Start WaveCast</Text>
            </Pressable>
          </View>
        )}

        {roomId && (
          <Pressable style={[styles.inviteBtn, { top: insets.top + 90 }]} onPress={() => setShowInviteSheet(true)}>
            <Text style={styles.inviteBtnText}>Invite</Text>
          </Pressable>
        )}

        {remoteUid && !cameraMuted && (
          <View style={[styles.localPip, { bottom: Math.max(insets.bottom + 110, 130) }]}>
            {AVView ? (
              <AVView
                style={StyleSheet.absoluteFill}
                showLocalVideo={true}
                videoSourceType={
                  (VideoSourceType &&
                    (VideoSourceType.VideoSourceCameraPrimary ??
                      VideoSourceType.VideoSourceCamera)) ||
                  0
                }
                renderMode={(VideoRenderMode && VideoRenderMode.Fit) || 2}
              />
            ) : RtcSurfaceView ? (
              React.createElement(RtcSurfaceView, {
                style: StyleSheet.absoluteFill,
                canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
                zOrderMediaOverlay: true,
              })
            ) : RtcTextureView ? (
              React.createElement(RtcTextureView, {
                style: StyleSheet.absoluteFill,
                canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
              })
            ) : RtcLocalView?.SurfaceView ? (
              React.createElement(RtcLocalView.SurfaceView, {
                style: StyleSheet.absoluteFill,
                renderMode: VideoRenderMode?.Fit ?? 2,
              })
            ) : null}
          </View>
        )}

        <View style={[styles.commentsRail, { left: 12, bottom: insets.bottom + 110 }]}>
          <FlatList
            data={comments.slice(-8)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentBubble}>
                <Text style={styles.commentAuthor}>{item.fromName}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
                <Text style={styles.commentTime}>{fmt(item.createdAtMs)}</Text>
              </View>
            )}
          />
        </View>

        <View style={[styles.bottomDock, { bottom: Math.max(insets.bottom + 14, 24) }]}>
          <View style={styles.controlRow}>
            <Pressable style={[styles.controlBtn, micMuted && styles.controlBtnMuted]} onPress={toggleMic}>
              <Text style={styles.controlBtnText}>{micMuted ? 'Mic Off' : 'Mic On'}</Text>
            </Pressable>
            <Pressable style={[styles.controlBtn, cameraMuted && styles.controlBtnMuted]} onPress={toggleCamera}>
              <Text style={styles.controlBtnText}>{cameraMuted ? 'Video Off' : 'Video On'}</Text>
            </Pressable>
            <Pressable style={[styles.controlBtn, !speakerEnabled && styles.controlBtnMuted]} onPress={toggleSpeaker}>
              <Text style={styles.controlBtnText}>{speakerEnabled ? 'Speaker' : 'Earpiece'}</Text>
            </Pressable>
          </View>
          {roomId && (
            <View style={styles.commentComposer}>
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Comment"
                placeholderTextColor="rgba(255,255,255,0.55)"
              />
              <Pressable style={styles.sendBtn} onPress={sendComment}>
                <Text style={styles.sendBtnText}>Send</Text>
              </Pressable>
            </View>
          )}
        </View>

        {showInviteSheet && (
          <View style={styles.sheetBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInviteSheet(false)} />
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
              <Text style={styles.sheetTitle}>Invite to WaveCast</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Find display name"
                  placeholderTextColor="rgba(255,255,255,0.48)"
                />
                <Pressable style={styles.findBtn} onPress={searchUsers}>
                  <Text style={styles.findBtnText}>{searchBusy ? 'Finding...' : 'Find'}</Text>
                </Pressable>
              </View>
              <FlatList
                data={searchResults}
                keyExtractor={item => item.uid}
                keyboardShouldPersistTaps="always"
                renderItem={({ item }) => (
                  <Pressable style={styles.resultRow} onPress={() => sendInvite(item)}>
                    {item.photoURL ? (
                      <Image source={{ uri: item.photoURL }} style={styles.resultAvatar} />
                    ) : (
                      <View style={styles.resultAvatarFallback}>
                        <Text style={styles.resultAvatarFallbackText}>
                          {item.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{item.displayName}</Text>
                      {!!item.username && <Text style={styles.resultMeta}>@{item.username}</Text>}
                    </View>
                    <Text style={styles.resultAction}>Invite</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  !searchBusy && !!searchQuery.trim() ? (
                    <Text style={styles.emptyResults}>No display names found.</Text>
                  ) : null
                }
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  stage: { ...StyleSheet.absoluteFillObject, backgroundColor: '#02060F' },
  topBar: { position: 'absolute', left: 12, right: 12, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topMeta: { flex: 1, paddingRight: 12 },
  topLabel: { color: '#9DE6FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.9 },
  topTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  topStatus: { color: 'rgba(255,255,255,0.78)', fontSize: 12, marginTop: 2 },
  closeBtn: { backgroundColor: 'rgba(10,17,28,0.82)', borderColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  closeBtnText: { color: '#fff', fontWeight: '700' },
  startCard: { position: 'absolute', left: 14, right: 14, zIndex: 11, borderRadius: 22, backgroundColor: 'rgba(6,12,20,0.9)', borderWidth: 1, borderColor: 'rgba(157,230,255,0.25)', padding: 16 },
  startCardTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  startCardText: { color: 'rgba(255,255,255,0.78)', marginTop: 6, marginBottom: 14 },
  primaryBtn: { backgroundColor: '#00C2FF', borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#04111C', fontWeight: '800' },
  inviteBtn: { position: 'absolute', right: 14, zIndex: 12, backgroundColor: 'rgba(0,194,255,0.92)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  inviteBtnText: { color: '#04111C', fontWeight: '800' },
  localPip: { position: 'absolute', right: 12, width: 120, height: 170, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', backgroundColor: '#02060F' },
  commentsRail: { position: 'absolute', width: '68%', maxHeight: 230 },
  commentBubble: { marginBottom: 8, backgroundColor: 'rgba(7,12,19,0.55)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  commentAuthor: { color: '#9DE6FF', fontWeight: '700', fontSize: 12 },
  commentText: { color: '#fff', marginTop: 2 },
  commentTime: { color: 'rgba(255,255,255,0.48)', fontSize: 10, marginTop: 3 },
  bottomDock: { position: 'absolute', left: 12, right: 12, zIndex: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  controlBtn: { flex: 1, borderRadius: 999, backgroundColor: 'rgba(8,14,24,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 12, alignItems: 'center' },
  controlBtnMuted: { backgroundColor: 'rgba(81,19,19,0.92)' },
  controlBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  commentComposer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentInput: { flex: 1, borderRadius: 999, backgroundColor: 'rgba(8,14,24,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', color: '#fff', paddingHorizontal: 14, paddingVertical: 11 },
  sendBtn: { borderRadius: 999, backgroundColor: '#00C2FF', paddingHorizontal: 16, paddingVertical: 11 },
  sendBtnText: { color: '#04111C', fontWeight: '800' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 30 },
  sheet: { backgroundColor: '#09121C', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingHorizontal: 16, maxHeight: '70%' },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', paddingHorizontal: 14, paddingVertical: 11 },
  findBtn: { borderRadius: 999, backgroundColor: '#00C2FF', paddingHorizontal: 16, justifyContent: 'center' },
  findBtnText: { color: '#04111C', fontWeight: '800' },
  resultRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, gap: 10 },
  resultAvatar: { width: 42, height: 42, borderRadius: 21 },
  resultAvatarFallback: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(157,230,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  resultAvatarFallbackText: { color: '#fff', fontWeight: '800' },
  resultName: { color: '#fff', fontWeight: '700' },
  resultMeta: { color: 'rgba(255,255,255,0.62)', fontSize: 12, marginTop: 2 },
  resultAction: { color: '#9DE6FF', fontWeight: '800' },
  emptyResults: { color: 'rgba(255,255,255,0.68)', textAlign: 'center', paddingVertical: 16 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerStateText: { color: '#fff', fontSize: 15 },
});

export default WaveCastModal;
