import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
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

type FloatingComment = {
  id: string;
  fromName: string;
  text: string;
  anim: Animated.Value;
  lane: number;
};

type FloatingReaction = {
  id: string;
  emoji: string;
  fromName: string;
  anim: Animated.Value;
  lane: number;
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
  const [remoteVideoUid, setRemoteVideoUid] = useState<number | null>(null);
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
  const [replyingTo, setReplyingTo] = useState<CommentRow | null>(null);
  const [showReactionTray, setShowReactionTray] = useState(false);
  const [floatingComments, setFloatingComments] = useState<FloatingComment[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const remoteVideoWatchdogRef = useRef<any>(null);
  const seenCommentIdsRef = useRef<Set<string>>(new Set());
  const seenReactionIdsRef = useRef<Set<string>>(new Set());
  const reactionOptions = ['❤️', '🔥', '👏', '😂', '😍', '🎉'];

  const RtcTextureView = (Agora as any)?.RtcTextureView;
  const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
  const VideoRenderMode = Agora?.VideoRenderMode;

  const cleanupEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      if (remoteVideoWatchdogRef.current) {
        clearTimeout(remoteVideoWatchdogRef.current);
        remoteVideoWatchdogRef.current = null;
      }
    } catch {}
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

  const forceRemoteVideoRecovery = useCallback((uid: number | null) => {
    const engine = engineRef.current;
    const targetUid = Number(uid || 0);
    if (!engine || !targetUid) return;
    try { engine.enableVideo?.(); } catch {}
    try { engine.enableAudio?.(); } catch {}
    try {
      engine.updateChannelMediaOptions?.({
        clientRoleType: Agora?.ClientRoleType?.ClientRoleBroadcaster ?? 1,
        publishMicrophoneTrack: !micMuted,
        publishCameraTrack: !cameraMuted,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {}
    try { engine.muteRemoteVideoStream?.(targetUid, false); } catch {}
    try { engine.muteRemoteAudioStream?.(targetUid, false); } catch {}
    try { engine.setRemoteVideoStreamType?.(targetUid, 0); } catch {}
    setStatusText(`Fetching Crew video ${targetUid}...`);
  }, [Agora?.ClientRoleType, cameraMuted, micMuted]);

  const pushFloatingComment = useCallback((comment: CommentRow) => {
    const anim = new Animated.Value(0);
    const item: FloatingComment = {
      id: comment.id,
      fromName: comment.fromName,
      text: comment.text,
      anim,
      lane: 0,
    };
    setFloatingComments(prev => [item, ...prev.filter(entry => entry.id !== comment.id)].slice(0, 6));
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, []);

  const pushFloatingReaction = useCallback((id: string, emoji: string, fromName: string) => {
    const anim = new Animated.Value(0);
    const lane = Math.abs(id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % 5;
    const item: FloatingReaction = { id, emoji, fromName, anim, lane };
    setFloatingReactions(prev => [...prev.slice(-18), item]);
    Animated.timing(anim, {
      toValue: 1,
      duration: 3200,
      useNativeDriver: true,
    }).start(() => {
      setFloatingReactions(prev => prev.filter(entry => entry.id !== id));
    });
  }, []);

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
    setRoomId(nextRoomId);
    setRoomChannel(nextChannel);
    setRoomTitle(nextTitle || 'WaveCast');
    setIsHost(hostMode);
    setRemoteUid(null);
    setRemoteVideoUid(null);
    setErrorText(null);
    setStatusText(hostMode ? 'Starting WaveCast...' : 'Joining WaveCast...');
    const safeToken = String(token || staticToken || '').trim() || null;
    try {
      if (typeof Agora?.createAgoraRtcEngine === 'function') {
        const engine =
          engineRef.current ||
          (() => {
            const created = Agora.createAgoraRtcEngine();
            created.initialize?.({
              appId,
              channelProfile: Agora.ChannelProfileType?.ChannelProfileCommunication ?? 0,
            });
            engineRef.current = created;
            return created;
          })();
        ensurePublishedMedia(engine);
        engine.registerEventHandler?.({
          onJoinChannelSuccess: () => {
            setIsJoined(true);
            setStatusText(hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
            ensurePublishedMedia(engine);
            writeParticipant(nextRoomId);
          },
          onRejoinChannelSuccess: () => {
            setIsJoined(true);
            setStatusText(remoteUid ? `Crew live ${remoteUid}` : hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
            ensurePublishedMedia(engine);
            writeParticipant(nextRoomId);
          },
          onUserJoined: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            setRemoteUid(parsed);
            setRemoteVideoUid(parsed);
            setStatusText(`Fetching Crew video ${parsed}...`);
            try { engine.muteRemoteVideoStream?.(parsed, false); } catch {}
            try { engine.muteRemoteAudioStream?.(parsed, false); } catch {}
            forceRemoteVideoRecovery(parsed);
          },
          onUserOffline: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            setRemoteUid(prev => (prev === parsed ? null : prev));
            setRemoteVideoUid(prev => (prev === parsed ? null : prev));
            setStatusText(hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
          },
          onFirstRemoteVideoDecoded: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            setRemoteUid(parsed);
            setRemoteVideoUid(parsed);
            setStatusText(`Crew video live ${parsed}`);
          },
          onFirstRemoteVideoFrame: (_conn: any, uid: number) => {
            const parsed = Number(uid);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            setRemoteUid(parsed);
            setRemoteVideoUid(parsed);
            setStatusText(`Crew video live ${parsed}`);
          },
          onRemoteVideoStateChanged: (_conn: any, uid: number, state: number, reason: number) => {
            const parsed = Number(uid);
            const nextState = Number(state);
            const nextReason = Number(reason);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            if (nextState >= 2) {
              setRemoteUid(parsed);
              setRemoteVideoUid(parsed);
              setStatusText(`Crew video live ${parsed}`);
            } else {
              setStatusText(`Crew video ${parsed} ${nextState}:${nextReason}`);
            }
          },
          onRemoteAudioStateChanged: (_conn: any, uid: number, state: number, reason: number) => {
            const parsed = Number(uid);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            if (Number(state) >= 2 && !remoteVideoUid) {
              setStatusText(`Crew audio live ${parsed}`);
            }
          },
          onConnectionStateChanged: (_conn: any, state: number, reason: number) => {
            const s = Number(state);
            const r = Number(reason);
            if (s === 3 || s === 4) setStatusText(`Reconnecting ${s}:${r}`);
          },
          onError: (err: number) => {
            const code = Number(err);
            if (code === 1052 && remoteUid) {
              setStatusText(`Recovering video ${remoteUid}...`);
              forceRemoteVideoRecovery(remoteUid);
              return;
            }
            setErrorText(`Agora error ${code}`);
          },
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
        const engine = engineRef.current || (await Agora.RtcEngine.create(appId));
        engineRef.current = engine;
        ensurePublishedMedia(engine);
        engine.addListener?.('JoinChannelSuccess', () => {
          setIsJoined(true);
          setStatusText(hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
          ensurePublishedMedia(engine);
          writeParticipant(nextRoomId);
        });
        engine.addListener?.('RejoinChannelSuccess', () => {
          setIsJoined(true);
          setStatusText(remoteUid ? `Crew live ${remoteUid}` : hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
          ensurePublishedMedia(engine);
          writeParticipant(nextRoomId);
        });
        engine.addListener?.('UserJoined', (uid: number) => {
          const parsed = Number(uid);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          setRemoteUid(parsed);
          setRemoteVideoUid(parsed);
          setStatusText(`Fetching Crew video ${parsed}...`);
          try { engine.muteRemoteVideoStream?.(parsed, false); } catch {}
          try { engine.muteRemoteAudioStream?.(parsed, false); } catch {}
          forceRemoteVideoRecovery(parsed);
        });
        engine.addListener?.('UserOffline', (uid: number) => {
          const parsed = Number(uid);
          setRemoteUid(prev => (prev === parsed ? null : prev));
          setRemoteVideoUid(prev => (prev === parsed ? null : prev));
          setStatusText(hostMode ? 'Waiting for Crew...' : 'Connected to Wave Captain');
        });
        engine.addListener?.('FirstRemoteVideoDecoded', (uid: number) => {
          const parsed = Number(uid);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          setRemoteUid(parsed);
          setRemoteVideoUid(parsed);
          setStatusText(`Crew video live ${parsed}`);
        });
        engine.addListener?.('FirstRemoteVideoFrame', (uid: number) => {
          const parsed = Number(uid);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          setRemoteUid(parsed);
          setRemoteVideoUid(parsed);
          setStatusText(`Crew video live ${parsed}`);
        });
        engine.addListener?.('RemoteVideoStateChanged', (uid: number, state: number, reason: number) => {
          const parsed = Number(uid);
          const nextState = Number(state);
          const nextReason = Number(reason);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          if (nextState >= 2) {
            setRemoteUid(parsed);
            setRemoteVideoUid(parsed);
            setStatusText(`Crew video live ${parsed}`);
          } else {
            setStatusText(`Crew video ${parsed} ${nextState}:${nextReason}`);
          }
        });
        engine.addListener?.('RemoteAudioStateChanged', (uid: number, state: number) => {
          const parsed = Number(uid);
          if (!Number.isFinite(parsed) || parsed <= 0) return;
          if (Number(state) >= 2 && !remoteVideoUid) {
            setStatusText(`Crew audio live ${parsed}`);
          }
        });
        engine.addListener?.('ConnectionStateChanged', (state: number, reason: number) => {
          const s = Number(state);
          const r = Number(reason);
          if (s === 3 || s === 4) setStatusText(`Reconnecting ${s}:${r}`);
        });
        engine.addListener?.('Error', (err: number) => {
          const code = Number(err);
          if (code === 1052 && remoteUid) {
            setStatusText(`Recovering video ${remoteUid}...`);
            forceRemoteVideoRecovery(remoteUid);
            return;
          }
          setErrorText(`Agora error ${code}`);
        });
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
    forceRemoteVideoRecovery,
    micMuted,
    myRtcUid,
    remoteUid,
    remoteVideoUid,
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
      setRemoteVideoUid(null);
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
        next.forEach(comment => {
          if (seenCommentIdsRef.current.has(comment.id)) return;
          seenCommentIdsRef.current.add(comment.id);
          pushFloatingComment(comment);
        });
      });
    const unsubReactions = firestore()
      .collection(`wavecasts/${roomId}/reactions`)
      .orderBy('createdAt', 'asc')
      .limitToLast(40)
      .onSnapshot(snap => {
        (snap?.docs || []).forEach(doc => {
          const data = doc.data() || {};
          const reactionId = doc.id;
          if (seenReactionIdsRef.current.has(reactionId)) return;
          seenReactionIdsRef.current.add(reactionId);
          const emoji = String(data.emoji || '❤️').trim() || '❤️';
          const fromName = String(data.fromName || data.displayName || 'Someone').trim() || 'Someone';
          pushFloatingReaction(reactionId, emoji, fromName);
        });
      });
    const unsubParticipants = firestore()
      .collection(`wavecasts/${roomId}/participants`)
      .onSnapshot(snap => {
        const others = (snap?.docs || [])
          .map(doc => ({ id: doc.id, ...(doc.data() || {}) }))
          .filter((row: any) => String(row.uid || row.id) !== myUid);
        if (!others.length && !remoteUid) {
          setStatusText(isHost ? 'Waiting for Crew...' : 'Connected to Wave Captain');
        } else if (others.length && !remoteUid) {
          setStatusText(`Crew present ${others[0]?.rtcUid || others[0]?.uid || ''}`);
        }
      });
    return () => {
      try { unsubComments(); } catch {}
      try { unsubReactions(); } catch {}
      try { unsubParticipants(); } catch {}
    };
  }, [isHost, myUid, pushFloatingComment, pushFloatingReaction, remoteUid, roomId, visible]);

  useEffect(() => {
    try {
      if (remoteVideoWatchdogRef.current) {
        clearTimeout(remoteVideoWatchdogRef.current);
        remoteVideoWatchdogRef.current = null;
      }
    } catch {}
    if (!visible || !isJoined || !remoteUid || !!remoteVideoUid) return;
    remoteVideoWatchdogRef.current = setTimeout(() => {
      forceRemoteVideoRecovery(remoteUid);
    }, 700);
    return () => {
      try {
        if (remoteVideoWatchdogRef.current) {
          clearTimeout(remoteVideoWatchdogRef.current);
          remoteVideoWatchdogRef.current = null;
        }
      } catch {}
    };
  }, [forceRemoteVideoRecovery, isJoined, remoteUid, remoteVideoUid, visible]);

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
    const replyMeta = replyingTo
      ? {
          replyToId: replyingTo.id,
          replyToFrom: replyingTo.fromName,
          replyToText: replyingTo.text,
        }
      : {};
    setReplyingTo(null);
    try {
      await firestore().collection(`wavecasts/${roomId}/comments`).add({
        text,
        fromUid: myUid,
        fromName: myName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
        ...replyMeta,
      });
    } catch {}
  }, [commentText, myName, myUid, replyingTo, roomId]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!roomId || !myUid) return;
    setShowReactionTray(false);
    const reactionRef = firestore().collection(`wavecasts/${roomId}/reactions`).doc();
    const reactionId = reactionRef.id;
    seenReactionIdsRef.current.add(reactionId);
    pushFloatingReaction(reactionId, emoji, myName);
    try {
      await reactionRef.set({
        emoji,
        fromUid: myUid,
        fromName: myName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
      });
    } catch {}
  }, [myName, myUid, pushFloatingReaction, roomId]);

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

  const VideoViewImpl = RtcTextureView || RtcSurfaceView;

  if (!visible) return null;

  const renderMainVideo = () => {
    if (remoteVideoUid && VideoViewImpl) {
      return React.createElement(VideoViewImpl, {
        style: StyleSheet.absoluteFill,
        canvas: { uid: remoteVideoUid, renderMode: VideoRenderMode?.Fit ?? 2 },
      });
    }
    if (!roomId && !cameraMuted && VideoViewImpl) {
      return React.createElement(VideoViewImpl, {
        style: StyleSheet.absoluteFill,
        canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
      });
    }
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerStateText}>
          {remoteUid
            ? `Fetching Crew video ${remoteUid}...`
            : roomId
            ? isHost
              ? 'Waiting for Crew to join...'
              : 'Joining Wave Captain...'
            : 'Opening camera...'}
        </Text>
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
            <Text style={styles.topStatus}>{errorText || statusText}</Text>
          </View>
          {!!roomId && (
            <Pressable style={styles.closeBtn} onPress={leaveWaveCast}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          )}
        </View>

        {!inviteJoinPreset?.autoJoin && !roomId && (
          <View style={[styles.startCard, { top: insets.top + 90 }]}>
            <Text style={styles.startCardTitle}>Ready to Cast your wave!</Text>
            <Text style={styles.startCardText}>
              Your camera is open. Start WaveCast and bring your Crew on screen.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={startWaveCast}>
              <Text style={styles.primaryBtnText}>Start WaveCast</Text>
            </Pressable>
          </View>
        )}

        {!!roomId && !cameraMuted && VideoViewImpl && (
          <View style={[styles.localPip, { bottom: Math.max(insets.bottom + 110, 130) }]}>
            {React.createElement(VideoViewImpl, {
              style: StyleSheet.absoluteFill,
              canvas: { uid: 0, renderMode: VideoRenderMode?.Fit ?? 2 },
              zOrderMediaOverlay: true,
            })}
          </View>
        )}

        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {floatingComments.map((item, index) => {
            const opacity = item.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 1],
            });
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  const original = comments.find(comment => comment.id === item.id) || null;
                  if (original) {
                    setReplyingTo(original);
                    setCommentText(prev => (prev.trim() ? prev : `@${original.fromName} `));
                  }
                }}
                style={{ position: 'absolute', left: 10, bottom: insets.bottom + 126 + index * 28 }}
              >
                <Animated.View style={{ opacity }}>
                  <Text style={styles.floatingCommentText}>
                    <Text style={styles.floatingCommentAuthor}>{item.fromName}: </Text>
                    {item.text}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
          {floatingReactions.map(item => {
            const translateY = item.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -280],
            });
            const translateX = item.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, (item.lane - 2) * 22],
            });
            const opacity = item.anim.interpolate({
              inputRange: [0, 0.08, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            });
            const scale = item.anim.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0.7, 1.15, 0.9],
            });
            return (
              <Animated.View
                key={item.id}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: insets.bottom + 120,
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity,
                  marginLeft: -14,
                }}
              >
                <Text style={styles.floatingReactionText}>{item.emoji}</Text>
                <Text style={styles.floatingReactionName}>{item.fromName}</Text>
              </Animated.View>
            );
          })}
        </View>

        {!!roomId && (
          <View style={[styles.bottomDock, { bottom: Math.max(insets.bottom + 14, 24) }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.controlRow}
            >
              <Pressable style={[styles.controlBtn, styles.controlBtnMic, micMuted && styles.controlBtnMuted]} onPress={toggleMic}>
                <Text style={styles.controlBtnText}>{micMuted ? 'Mic Off' : 'Mic On'}</Text>
              </Pressable>
              <Pressable style={[styles.controlBtn, styles.controlBtnVideo, cameraMuted && styles.controlBtnMuted]} onPress={toggleCamera}>
                <Text style={styles.controlBtnText}>{cameraMuted ? 'Video Off' : 'Video On'}</Text>
              </Pressable>
              <Pressable style={[styles.controlBtn, styles.controlBtnSpeaker, !speakerEnabled && styles.controlBtnMuted]} onPress={toggleSpeaker}>
                <Text style={styles.controlBtnText}>{speakerEnabled ? 'Speaker' : 'Earpiece'}</Text>
              </Pressable>
              {isHost && (
                <Pressable style={[styles.controlBtn, styles.controlBtnInvite]} onPress={() => setShowInviteSheet(true)}>
                  <Text style={styles.controlBtnText}>Invite Crew</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.controlBtn, styles.controlBtnReact, showReactionTray && styles.controlBtnMuted]}
                onPress={() => setShowReactionTray(prev => !prev)}
              >
                <Text style={styles.controlBtnText}>React</Text>
              </Pressable>
            </ScrollView>
            {showReactionTray && (
              <View style={styles.reactionTray}>
                {['\u2764\uFE0F', '\uD83D\uDD25', '\uD83D\uDC4F', '\uD83D\uDE02', '\uD83D\uDE0D', '\uD83C\uDF89', '\uD83D\uDCAF', '\uD83D\uDE4C', '\uD83E\uDD73', '\uD83E\uDD29', '\uD83D\uDCA5', '\uD83D\uDC99'].map(emoji => (
                  <Pressable
                    key={emoji}
                    style={styles.reactionChip}
                    onPress={() => sendReaction(emoji)}
                  >
                    <Text style={styles.reactionChipText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.commentComposer}>
              {!!replyingTo && (
                <View style={styles.replyPill}>
                  <Text numberOfLines={1} style={styles.replyPillText}>
                    Replying to {replyingTo.fromName}
                  </Text>
                  <Pressable onPress={() => setReplyingTo(null)}>
                    <Text style={styles.replyPillClose}>x</Text>
                  </Pressable>
                </View>
              )}
              <View style={styles.commentComposerRow}>
                <TextInput
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={replyingTo ? `Reply to ${replyingTo.fromName}` : 'Comment'}
                  placeholderTextColor="rgba(255,255,255,0.55)"
                />
                <Pressable style={styles.sendBtn} onPress={sendComment}>
                  <Text style={styles.sendBtnText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

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
  topLabel: { color: '#62D7FF', fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
  topTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  topStatus: { color: 'rgba(255,255,255,0.78)', fontSize: 12, marginTop: 2 },
  closeBtn: { backgroundColor: '#D94141', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  closeBtnText: { color: '#fff', fontWeight: '700' },
  startCard: { position: 'absolute', left: 14, right: 14, zIndex: 11, borderRadius: 22, backgroundColor: 'rgba(6,12,20,0.9)', borderWidth: 1, borderColor: 'rgba(157,230,255,0.25)', padding: 16 },
  startCardTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  startCardText: { color: 'rgba(255,255,255,0.78)', marginTop: 6, marginBottom: 14 },
  primaryBtn: { backgroundColor: '#E34949', borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  localPip: { position: 'absolute', right: 12, width: 120, height: 170, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', backgroundColor: '#02060F' },
  bottomDock: { position: 'absolute', left: 12, right: 12, zIndex: 12 },
  controlRow: { gap: 8, paddingRight: 10 },
  controlBtn: { minWidth: 92, borderRadius: 999, backgroundColor: 'rgba(8,14,24,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  controlBtnMuted: { backgroundColor: 'rgba(81,19,19,0.92)' },
  controlBtnMic: { backgroundColor: '#1D6F56' },
  controlBtnVideo: { backgroundColor: '#2E5AAC' },
  controlBtnSpeaker: { backgroundColor: '#6C4FB0' },
  controlBtnInvite: { backgroundColor: '#1899C6' },
  controlBtnReact: { backgroundColor: '#A44F8D' },
  controlBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  reactionTray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 2 },
  reactionChip: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(8,14,24,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  reactionChipText: { fontSize: 24 },
  commentComposer: { marginTop: 10 },
  commentComposerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentInput: { flex: 1, borderRadius: 999, backgroundColor: 'rgba(8,14,24,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', color: '#fff', paddingHorizontal: 14, paddingVertical: 11 },
  sendBtn: { borderRadius: 999, backgroundColor: '#00C2FF', paddingHorizontal: 16, paddingVertical: 11 },
  sendBtnText: { color: '#04111C', fontWeight: '800' },
  replyPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 999, backgroundColor: 'rgba(8,14,24,0.92)', borderWidth: 1, borderColor: 'rgba(157,230,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  replyPillText: { flex: 1, color: '#9DE6FF', fontSize: 12, fontWeight: '700', marginRight: 10 },
  replyPillClose: { color: '#fff', fontWeight: '800' },
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
  floatingCommentText: { color: '#fff', fontSize: 14, fontWeight: '600', maxWidth: 240 },
  floatingCommentAuthor: { color: '#9DE6FF', fontWeight: '800' },
  floatingReactionText: { fontSize: 30 },
  floatingReactionName: { color: '#DDF6FF', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2 },
});

export default WaveCastModal;
