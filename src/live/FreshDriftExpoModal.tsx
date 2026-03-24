import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const LIVE_INVITE_WINDOW_MS = 3 * 60 * 1000;

type InviteJoinPreset = {
  liveId?: string | null;
  channel?: string | null;
  token?: string | null;
  title?: string | null;
  fromName?: string | null;
  requireApproval?: boolean;
  nonce?: number;
};

type CommentRow = {
  id: string;
  text: string;
  fromUid: string;
  fromName: string;
  fromPhoto?: string | null;
  replyToId?: string | null;
  replyToText?: string | null;
  replyToName?: string | null;
  createdAtMs: number;
};

type ParticipantRow = {
  uid: string;
  name: string;
  photo?: string | null;
  rtcUid: number;
  isHost?: boolean;
};

type SearchResultItem = {
  uid: string;
  name: string;
  photo?: string | null;
  username?: string | null;
  secondary?: string | null;
};

type RecentDriftItem = {
  id: string;
  title: string;
  hostName: string;
  playbackUrl?: string | null;
  status?: string | null;
  updatedAtMs: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  isChartered?: boolean;
  inviteJoinPreset?: InviteJoinPreset | null;
  searchOceanEntities: (term: string) => Promise<any[]>;
};

const mapRtcUidFromUserId = (value: string | null | undefined): number => {
  const seed = String(value || '').trim() || '0';
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 2147483646) + 1;
};

const toMillis = (value: any): number => {
  try {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value?.toMillis === 'function') return Number(value.toMillis()) || 0;
    if (typeof value?.toDate === 'function') return Number(value.toDate().getTime()) || 0;
    if (typeof value?.seconds === 'number') return value.seconds * 1000;
    return Number(new Date(value).getTime()) || 0;
  } catch {
    return 0;
  }
};

const formatTimestamp = (value: number): string => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
};

const normalizeSearchResult = (entry: any): SearchResultItem | null => {
  const kind = String(entry?.kind || '').trim().toLowerCase();
  if (kind && kind !== 'user') return null;
  const source = entry?.extra && typeof entry.extra === 'object' ? entry.extra : entry;
  const uid = String(
    source?.uid || entry?.uid || source?.id || entry?.id || source?.userId || entry?.userId || '',
  ).trim();
  if (!uid) return null;
  const displayName = String(
    source?.displayName ||
      source?.name ||
      source?.userName ||
      entry?.label ||
      source?.username ||
      source?.handle ||
      'User',
  ).trim();
  const username = String(source?.username || source?.handle || source?.userName || '').trim();
  return {
    uid,
    name: displayName || 'User',
    username: username || null,
    secondary:
      username && username !== displayName
        ? `@${username.replace(/^[@/]+/, '')}`
        : null,
    photo:
      source?.photo ||
      source?.photoURL ||
      source?.avatar ||
      source?.userPhoto ||
      null,
  };
};

const FreshDriftExpoModal = ({
  visible,
  onClose,
  inviteJoinPreset,
  searchOceanEntities,
}: Props) => {
  const insets = useSafeAreaInsets();
  const Agora = useMemo(() => {
    try {
      return require('react-native-agora');
    } catch {
      return null;
    }
  }, []);
  const cfg = useMemo(() => {
    try {
      return require('../../liveConfig');
    } catch {
      return null;
    }
  }, []);
  const RNVideo = useMemo(() => {
    try {
      return require('react-native-video').default;
    } catch {
      return null;
    }
  }, []);
  const appId = String(cfg?.AGORA_APP_ID || '').trim();
  const defaultChannel = String(cfg?.AGORA_CHANNEL_NAME || 'SplashlineDrift').trim();
  const engineRef = useRef<any>(null);
  const joinedChannelRef = useRef<string | null>(null);
  const joiningChannelRef = useRef<string | null>(null);
  const roomRef = useRef<{ id: string; channel: string; title: string; hostUid: string | null } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomChannel, setRoomChannel] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState<string>('Drift Expo');
  const [roomHostUid, setRoomHostUid] = useState<string | null>(null);
  const [roomHostName, setRoomHostName] = useState<string>('Host');
  const [myRtcUid, setMyRtcUid] = useState<number>(0);
  const [joined, setJoined] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<CommentRow | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<SearchResultItem[]>([]);
  const [onlineInvitees, setOnlineInvitees] = useState<SearchResultItem[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteBusyUid, setInviteBusyUid] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [recentDrifts, setRecentDrifts] = useState<RecentDriftItem[]>([]);
  const [replayItem, setReplayItem] = useState<RecentDriftItem | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [floatingComments, setFloatingComments] = useState<
    Array<{ id: string; text: string; fromName: string; anim: Animated.Value }>
  >([]);
  const [floatingReactions, setFloatingReactions] = useState<
    Array<{ id: string; emoji: string; anim: Animated.Value; lane: number }>
  >([]);
  const seenCommentIdsRef = useRef<Set<string>>(new Set());
  const seenReactionIdsRef = useRef<Set<string>>(new Set());

  const me = auth().currentUser;
  const meUid = me?.uid || '';
  const meName = String(me?.displayName || (me?.email ? me.email.split('@')[0] : '') || 'Viber');
  const mePhoto = me?.photoURL || null;
  useEffect(() => {
    roomRef.current =
      roomId && roomChannel
        ? { id: roomId, channel: roomChannel, title: roomTitle, hostUid: roomHostUid }
        : null;
  }, [roomChannel, roomHostUid, roomId, roomTitle]);

  const resetState = useCallback(() => {
    setIsBusy(false);
    setStatusText('Ready');
    setRoomId(null);
    setRoomChannel('');
    setRoomTitle('Drift Expo');
    setRoomHostUid(null);
    setRoomHostName('Host');
    setMyRtcUid(0);
    setJoined(false);
    setRemoteUids([]);
    setParticipants([]);
    setComments([]);
    setCommentText('');
    setReplyTarget(null);
    setMicMuted(false);
    setCameraOff(false);
    setShowComments(true);
    setShowInvitePanel(false);
    setInviteQuery('');
    setInviteResults([]);
    setOnlineInvitees([]);
    setInviteLoading(false);
    setInviteBusyUid(null);
    setShowReactionPicker(false);
    setRecentDrifts([]);
    setReplayItem(null);
    setEngineReady(false);
    setFloatingComments([]);
    setFloatingReactions([]);
    seenCommentIdsRef.current = new Set();
    seenReactionIdsRef.current = new Set();
    joinedChannelRef.current = null;
    joiningChannelRef.current = null;
  }, []);

  const cleanupEngine = useCallback(async () => {
    if (roomRef.current?.id && meUid) {
      try {
        await firestore()
          .collection(`live/${roomRef.current.id}/participants`)
          .doc(meUid)
          .delete();
      } catch {}
      if (roomHostUid === meUid) {
        try {
          await firestore().collection('live').doc(roomRef.current.id).set(
            {
              status: 'ended',
              endedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        } catch {}
      }
    }
    const engine = engineRef.current;
    if (engine) {
      try {
        engine.stopPreview?.();
      } catch {}
      try {
        if (
          typeof engine.leaveChannelEx === 'function' &&
          roomRef.current?.channel &&
          myRtcUid
        ) {
          engine.leaveChannelEx({
            channelId: roomRef.current.channel,
            localUid: myRtcUid,
          });
        }
      } catch {}
      try {
        engine.leaveChannel?.();
      } catch {}
      try {
        (engine.destroy ?? engine.release)?.();
      } catch {}
      engineRef.current = null;
    }
    joinedChannelRef.current = null;
    joiningChannelRef.current = null;
  }, [meUid, myRtcUid, roomHostUid]);

  useEffect(() => {
    if (visible) return;
    cleanupEngine().catch(() => {});
    resetState();
  }, [cleanupEngine, resetState, visible]);

  const ensurePermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const PermissionsAndroid = require('react-native').PermissionsAndroid;
      const permissions = [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
      ];
      for (const permission of permissions) {
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== 'granted') return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const upsertParticipant = useCallback(
    async (liveId: string, channel: string, rtcUid: number, isHost: boolean) => {
      if (!meUid) return;
      try {
        await firestore()
          .collection(`live/${liveId}/participants`)
          .doc(meUid)
          .set(
            {
              uid: meUid,
              name: meName,
              photo: mePhoto,
              rtcUid,
              isHost,
              channel,
              joinedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } catch {}
    },
    [meName, mePhoto, meUid],
  );

  const hydrateRoom = useCallback(
    async (liveId: string) => {
      const snap = await firestore().collection('live').doc(liveId).get();
      const data = snap?.data?.() || {};
      const channel = String(data.channel || data.liveChannel || defaultChannel || '')
        .trim()
        .replace(/[^A-Za-z0-9_]/g, '_')
        .slice(0, 64);
      if (!channel) {
        throw new Error('This Drift Expo room is missing a channel.');
      }
      const uid = mapRtcUidFromUserId(meUid);
      setRoomId(liveId);
      setRoomChannel(channel);
      setRoomTitle(String(data.title || data.liveTitle || inviteJoinPreset?.title || 'Drift Expo'));
      setRoomHostUid(String(data.hostUid || ''));
      setRoomHostName(String(data.hostName || inviteJoinPreset?.fromName || 'Host'));
      setMyRtcUid(uid);
      setJoined(false);
      setRemoteUids([]);
      joinedChannelRef.current = null;
      joiningChannelRef.current = null;
      setStatusText('Joining room');
    },
    [defaultChannel, inviteJoinPreset?.fromName, inviteJoinPreset?.title, meUid],
  );

  const startFreshRoom = useCallback(async () => {
    if (!meUid) {
      Alert.alert('Sign in required', 'Please sign in to start Drift Expo.');
      return;
    }
    setIsBusy(true);
    setStatusText(engineReady ? 'Creating room' : 'Preparing camera');
    try {
      const ref = firestore().collection('live').doc();
      const channel = `drift_${ref.id}`.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
      const uid = mapRtcUidFromUserId(meUid);
      const title = 'Drift Expo';
      await ref.set({
        title,
        liveTitle: title,
        channel,
        liveChannel: channel,
        hostUid: meUid,
        hostName: meName,
        hostPhoto: mePhoto,
        status: 'live',
        appId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      setRoomId(ref.id);
      setRoomChannel(channel);
      setRoomTitle(title);
      setRoomHostUid(meUid);
      setRoomHostName(meName);
      setMyRtcUid(uid);
      setJoined(false);
      setRemoteUids([]);
      joinedChannelRef.current = null;
      joiningChannelRef.current = null;
      setStatusText(engineReady ? 'Joining room' : 'Camera warming up');
    } catch (error: any) {
      Alert.alert('Could not start Drift Expo', String(error?.message || 'Try again.'));
    } finally {
      setIsBusy(false);
    }
  }, [appId, engineReady, meName, mePhoto, meUid]);

  useEffect(() => {
    if (!visible) return;
    if (!inviteJoinPreset?.liveId) return;
    hydrateRoom(String(inviteJoinPreset.liveId)).catch(error => {
      Alert.alert('Could not open invite', String(error?.message || 'This room is unavailable.'));
    });
  }, [hydrateRoom, inviteJoinPreset?.liveId, visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await firestore()
          .collection('live')
          .orderBy('updatedAt', 'desc')
          .limit(12)
          .get();
        if (cancelled) return;
        const rows = (snap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            title: String(data.title || data.liveTitle || 'Drift Expo'),
            hostName: String(data.hostName || 'Host'),
            playbackUrl: String(data.playbackUrl || data.recordingUrl || '').trim() || null,
            status: String(data.status || ''),
            updatedAtMs: toMillis(data.updatedAt) || toMillis(data.endedAt) || toMillis(data.createdAt),
          } as RecentDriftItem;
        });
        setRecentDrifts(rows);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !showInvitePanel) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await firestore()
          .collection('users')
          .orderBy('lastActiveAt', 'desc')
          .limit(24)
          .get();
        if (cancelled) return;
        const rows = (snap?.docs || [])
          .map(doc => {
            const data = doc.data() || {};
            if (doc.id === meUid) return null;
            if (data?.online !== true) return null;
            return normalizeSearchResult({
              kind: 'user',
              id: doc.id,
              label: data.displayName || data.name || data.username || 'User',
              extra: {
                uid: doc.id,
                displayName: data.displayName || data.name || null,
                username: data.username || data.userName || null,
                photoURL: data.userPhoto || data.photoURL || null,
              },
            });
          })
          .filter(Boolean) as SearchResultItem[];
        setOnlineInvitees(rows);
      } catch {
        if (!cancelled) setOnlineInvitees([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meUid, showInvitePanel, visible]);

  useEffect(() => {
    if (!visible || !Agora || !appId || engineRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const ok = await ensurePermissions();
        if (!ok) {
          setStatusText('Camera or mic permission denied');
          return;
        }
        const isV4 = typeof Agora?.createAgoraRtcEngine === 'function';
        const liveProfile =
          Agora.ChannelProfileType?.ChannelProfileLiveBroadcasting ??
          Agora.ChannelProfileType?.ChannelProfileCommunication ??
          1;
        const broadcasterRole =
          Agora.ClientRoleType?.ClientRoleBroadcaster ??
          Agora.ClientRole?.Broadcaster ??
          1;
        if (isV4) {
          const engine = Agora.createAgoraRtcEngine();
          engine.initialize?.({
            appId,
            channelProfile: liveProfile,
          });
          engine.enableVideo?.();
          engine.enableAudio?.();
          engine.enableLocalVideo?.(true);
          engine.setClientRole?.(broadcasterRole);
          engine.registerEventHandler?.({
            onJoinChannelSuccess: (connection: any) => {
              if (!cancelled) {
                setJoined(true);
                setStatusText('Live');
                if (connection?.localUid) {
                  setMyRtcUid(Number(connection.localUid) || 0);
                }
              }
            },
            onUserJoined: (connection: any, uid: number) => {
              const next = Number(uid);
              if (!Number.isFinite(next) || next <= 0) return;
              const activeChannel =
                String(connection?.channelId || roomRef.current?.channel || '').trim() || undefined;
              const localUid = Number(connection?.localUid || myRtcUid || 0) || undefined;
              if (typeof engine.setupRemoteVideoEx === 'function' && activeChannel && localUid) {
                engine.setupRemoteVideoEx(
                  {
                    uid: next,
                    channelId: activeChannel,
                    sourceType: Agora.VideoSourceType?.VideoSourceRemote,
                  },
                  {
                    channelId: activeChannel,
                    localUid,
                  },
                );
              } else {
                engine.setupRemoteVideo?.({
                  uid: next,
                  channelId: activeChannel,
                  sourceType: Agora.VideoSourceType?.VideoSourceRemote,
                });
              }
              setRemoteUids(prev => (prev.includes(next) ? prev : [...prev, next]));
            },
            onUserOffline: (_conn: any, uid: number) => {
              const next = Number(uid);
              setRemoteUids(prev => prev.filter(item => item !== next));
            },
            onError: (err: number) => {
              setStatusText(`Agora error ${err}`);
            },
          });
          engineRef.current = engine;
          if (!cancelled) setEngineReady(true);
        } else if (Agora?.RtcEngine && typeof Agora.RtcEngine.create === 'function') {
          const engine = await Agora.RtcEngine.create(appId);
          engine.enableVideo?.();
          engine.enableAudio?.();
          engine.enableLocalVideo?.(true);
          engine.startPreview?.();
          engine.setChannelProfile?.(
            Agora.ChannelProfile?.LiveBroadcasting ??
              Agora.ChannelProfile?.Communication ??
              Agora.ChannelProfile,
          );
          engine.setClientRole?.(
            Agora.ClientRole?.Broadcaster ?? Agora.ClientRole,
          );
          engine.addListener?.('JoinChannelSuccess', () => {
            if (!cancelled) {
              setJoined(true);
              setStatusText('Live');
            }
          });
          engine.addListener?.('UserJoined', (uid: number) => {
            const next = Number(uid);
            if (!Number.isFinite(next) || next <= 0) return;
            setRemoteUids(prev => (prev.includes(next) ? prev : [...prev, next]));
          });
          engine.addListener?.('UserOffline', (uid: number) => {
            const next = Number(uid);
            setRemoteUids(prev => prev.filter(item => item !== next));
          });
          engineRef.current = engine;
          if (!cancelled) setEngineReady(true);
        }
      } catch (error: any) {
        if (!cancelled) {
          setStatusText(String(error?.message || 'Agora init failed'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [Agora, appId, ensurePermissions, myRtcUid, visible]);

  useEffect(() => {
    if (!visible || !roomId || !roomChannel || !myRtcUid || !engineRef.current) return;
    if (joinedChannelRef.current === roomChannel) return;
    if (joiningChannelRef.current === roomChannel) return;
    let cancelled = false;
    (async () => {
      try {
        const engine = engineRef.current;
        const isHost = roomHostUid === meUid;
        const isV4 = typeof Agora?.createAgoraRtcEngine === 'function';
        joiningChannelRef.current = roomChannel;
        if (isV4) {
          const cameraSource =
            Agora.VideoSourceType?.VideoSourceCameraPrimary ??
            Agora.VideoSourceType?.VideoSourceCamera ??
            0;
          const connection = {
            channelId: roomChannel,
            localUid: myRtcUid,
          };
          const mediaOptions = {
            clientRoleType:
              Agora.ClientRoleType?.ClientRoleBroadcaster ??
              Agora.ClientRole?.Broadcaster ??
              1,
            publishCameraTrack: true,
            publishMicrophoneTrack: true,
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
          };
          engine.enableLocalVideo?.(true);
          engine.setupLocalVideo?.({
            uid: myRtcUid,
            channelId: roomChannel,
            sourceType: cameraSource,
          });
          engine.startPreview?.();
          if (typeof engine.joinChannelEx === 'function') {
            await engine.joinChannelEx(null, connection, mediaOptions);
          } else {
            engine.updateChannelMediaOptions?.(mediaOptions);
            await engine.joinChannel(null, roomChannel, myRtcUid, mediaOptions);
          }
        } else {
          engine.enableLocalVideo?.(true);
          engine.startPreview?.();
          await engine.joinChannel(null, roomChannel, myRtcUid);
        }
        if (cancelled) return;
        joinedChannelRef.current = roomChannel;
        joiningChannelRef.current = null;
        setJoined(true);
        setStatusText('Live');
        await upsertParticipant(roomId, roomChannel, myRtcUid, isHost);
      } catch (error: any) {
        joiningChannelRef.current = null;
        if (!cancelled) {
          setStatusText(String(error?.message || 'Could not join channel'));
        }
      }
    })();
    return () => {
      cancelled = true;
      if (joiningChannelRef.current === roomChannel) {
        joiningChannelRef.current = null;
      }
    };
  }, [Agora, meUid, myRtcUid, roomChannel, roomHostUid, roomId, upsertParticipant, visible]);

  useEffect(() => {
    if (!visible || !roomId) return;
    const unsubRoom = firestore()
      .collection('live')
      .doc(roomId)
      .onSnapshot(snap => {
        const data = snap?.data?.() || {};
        const nextStatus = String(data.status || 'live');
        if (nextStatus === 'ended' && roomHostUid !== meUid) {
          setStatusText('This drift has ended');
        }
        if (data.channel) {
          setRoomChannel(
            String(data.channel).trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64),
          );
        }
      });
    const unsubParticipants = firestore()
      .collection(`live/${roomId}/participants`)
      .onSnapshot(snap => {
        const rows = (snap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            uid: String(data.uid || doc.id),
            name: String(data.name || 'Viber'),
            photo: data.photo || null,
            rtcUid: Number(data.rtcUid || 0),
            isHost: !!data.isHost,
          } as ParticipantRow;
        });
        setParticipants(rows);
      });
    const unsubComments = firestore()
      .collection(`live/${roomId}/comments`)
      .orderBy('createdAt', 'asc')
      .limit(200)
      .onSnapshot(snap => {
        const rows = (snap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            text: String(data.text || ''),
            fromUid: String(data.fromUid || ''),
            fromName: String(data.fromName || 'User'),
            fromPhoto: data.fromPhoto || null,
            replyToId: data.replyToId ? String(data.replyToId) : null,
            replyToText: data.replyToText ? String(data.replyToText) : null,
            replyToName: data.replyToName ? String(data.replyToName) : null,
            createdAtMs: toMillis(data.createdAt) || Number(data.createdAtMs || 0) || Date.now(),
          } as CommentRow;
        });
        setComments(rows);
      });
    const unsubReactions = firestore()
      .collection(`live/${roomId}/reactions`)
      .orderBy('createdAt', 'asc')
      .limit(120)
      .onSnapshot(snap => {
        (snap?.docs || []).forEach((doc, index) => {
          if (seenReactionIdsRef.current.has(doc.id)) return;
          seenReactionIdsRef.current.add(doc.id);
          const data = doc.data() || {};
          const emoji = String(data.emoji || '').trim();
          if (!emoji) return;
          const anim = new Animated.Value(0);
          const lane = index % 3;
          setFloatingReactions(prev => [...prev, { id: doc.id, emoji, anim, lane }].slice(-18));
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            useNativeDriver: true,
          }).start(() => {
            setFloatingReactions(prev => prev.filter(item => item.id !== doc.id));
          });
        });
      });
    return () => {
      try {
        unsubRoom();
      } catch {}
      try {
        unsubParticipants();
      } catch {}
      try {
        unsubComments();
      } catch {}
      try {
        unsubReactions();
      } catch {}
    };
  }, [meUid, roomHostUid, roomId, visible]);

  const sendComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !roomId || !meUid) return;
    try {
      await firestore().collection(`live/${roomId}/comments`).add({
        text,
        fromUid: meUid,
        fromName: meName,
        fromPhoto: mePhoto,
        replyToId: replyTarget?.id || null,
        replyToText: replyTarget?.text || null,
        replyToName: replyTarget?.fromName || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
      });
      setCommentText('');
      setReplyTarget(null);
    } catch (error: any) {
      Alert.alert('Comment failed', String(error?.message || 'Try again.'));
    }
  }, [commentText, meName, mePhoto, meUid, replyTarget, roomId]);

  useEffect(() => {
    comments.forEach(comment => {
      if (seenCommentIdsRef.current.has(comment.id)) return;
      seenCommentIdsRef.current.add(comment.id);
      const anim = new Animated.Value(0);
      setFloatingComments(prev =>
        [...prev, { id: comment.id, text: comment.text, fromName: comment.fromName, anim }].slice(-8),
      );
      Animated.timing(anim, {
        toValue: 1,
        duration: 4200,
        useNativeDriver: true,
      }).start(() => {
        setFloatingComments(prev => prev.filter(item => item.id !== comment.id));
      });
    });
  }, [comments]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (!roomId || !meUid) return;
      setShowReactionPicker(false);
      try {
        await firestore().collection(`live/${roomId}/reactions`).add({
          emoji,
          fromUid: meUid,
          fromName: meName,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      } catch {}
    },
    [meName, meUid, roomId],
  );

  const searchInviteTargets = useCallback(async () => {
    const query = inviteQuery.trim();
    if (!query) {
      setInviteResults([]);
      return;
    }
    setInviteLoading(true);
    try {
      const raw = await searchOceanEntities(query);
      let next = (raw || [])
        .filter((entry: any) => String(entry?.kind || 'user').toLowerCase() === 'user')
        .map(normalizeSearchResult)
        .filter(Boolean)
        .filter((entry: any) => entry.uid !== meUid) as SearchResultItem[];
      if (next.length === 0) {
        const lower = query.toLowerCase();
        const fallbackSnap = await firestore()
          .collection('users')
          .orderBy('lastActiveAt', 'desc')
          .limit(60)
          .get();
        next = (fallbackSnap?.docs || [])
          .map(doc => {
            const data = doc.data() || {};
            const haystack = [
              data.displayName,
              data.name,
              data.username,
              data.userName,
              doc.id,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!haystack.includes(lower)) return null;
            return normalizeSearchResult({
              kind: 'user',
              id: doc.id,
              label: data.displayName || data.name || data.username || 'User',
              extra: {
                uid: doc.id,
                displayName: data.displayName || data.name || null,
                username: data.username || data.userName || null,
                photoURL: data.userPhoto || data.photoURL || null,
              },
            });
          })
          .filter(Boolean)
          .filter((entry: any) => entry.uid !== meUid) as SearchResultItem[];
      }
      setInviteResults(next);
    } catch {
      setInviteResults([]);
    } finally {
      setInviteLoading(false);
    }
  }, [inviteQuery, meUid, searchOceanEntities]);

  const sendInvite = useCallback(
    async (target: SearchResultItem) => {
      if (!roomId || !roomChannel || !meUid) return;
      setInviteBusyUid(target.uid);
      try {
        const liveInvitesRef = firestore().collection(`users/${target.uid}/live_invites`);
        const prunePendingFromMe = async (path: string) => {
          try {
            const snap = await firestore().collection(path).limit(50).get();
            const matches = (snap?.docs || []).filter((doc: any) => {
              const data = doc.data() || {};
              return (
                String(data.status || 'pending').toLowerCase() === 'pending' &&
                String(data.fromUid || '') === meUid
              );
            });
            await Promise.all(matches.map((doc: any) => doc.ref.delete().catch(() => {})));
          } catch {}
        };
        await prunePendingFromMe(`users/${target.uid}/live_invites`);
        const payload = {
          liveId: roomId,
          liveChannel: roomChannel,
          liveTitle: roomTitle,
          fromUid: meUid,
          fromName: meName,
          fromPhoto: mePhoto,
          badgeVariant: 'drift_room',
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdAtMs: Date.now(),
          expiresAtMs: Date.now() + LIVE_INVITE_WINDOW_MS,
        };
        await liveInvitesRef.add(payload);
        Alert.alert('Invite sent', `${target.name} will get the drift badge.`);
      } catch (error: any) {
        Alert.alert('Invite failed', String(error?.message || 'Try again.'));
      } finally {
        setInviteBusyUid(null);
      }
    },
    [meName, mePhoto, meUid, roomChannel, roomId, roomTitle],
  );

  const renderLocalView = useCallback(
    (fullScreen: boolean) => {
      const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
      const RtcTextureView = (Agora as any)?.RtcTextureView;
      const VideoRenderMode = Agora?.VideoRenderMode;
      const VideoSourceType = Agora?.VideoSourceType;
      const style = fullScreen ? styles.videoFill : styles.pictureInPictureVideo;
      const connection =
        roomChannel && myRtcUid
          ? {
              channelId: roomChannel,
              localUid: myRtcUid,
            }
          : undefined;
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style,
          connection,
          canvas: {
            uid: myRtcUid || 0,
            channelId: roomChannel || undefined,
            sourceType:
              VideoSourceType?.VideoSourceCameraPrimary ??
              VideoSourceType?.VideoSourceCamera ??
              0,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
          zOrderMediaOverlay: true,
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style,
          connection,
          canvas: {
            uid: myRtcUid || 0,
            channelId: roomChannel || undefined,
            sourceType:
              VideoSourceType?.VideoSourceCameraPrimary ??
              VideoSourceType?.VideoSourceCamera ??
              0,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
        });
      }
      return (
        <View style={[style, styles.videoFallback]}>
          <Text style={styles.videoFallbackText}>Starting camera...</Text>
        </View>
      );
    },
    [Agora, myRtcUid, roomChannel],
  );

  const renderRemoteView = useCallback(
    (uid: number) => {
      const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
      const RtcTextureView = (Agora as any)?.RtcTextureView;
      const VideoRenderMode = Agora?.VideoRenderMode;
      const VideoSourceType = Agora?.VideoSourceType;
      const connection =
        roomChannel && myRtcUid
          ? {
              channelId: roomChannel,
              localUid: myRtcUid,
            }
          : undefined;
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style: styles.videoFill,
          connection,
          canvas: {
            uid,
            channelId: roomChannel || undefined,
            sourceType: VideoSourceType?.VideoSourceRemote,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style: styles.videoFill,
          connection,
          canvas: {
            uid,
            channelId: roomChannel || undefined,
            sourceType: VideoSourceType?.VideoSourceRemote,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
        });
      }
      return (
        <View style={[styles.videoFill, styles.videoFallback]}>
          <Text style={styles.videoFallbackText}>Connecting remote video...</Text>
        </View>
      );
    },
    [Agora, myRtcUid, roomChannel],
  );

  const remoteRenderUids = useMemo(
    () =>
      Array.from(
        new Set(
          remoteUids.filter(uid => Number.isFinite(uid) && uid > 0 && uid !== myRtcUid),
        ),
      ),
    [myRtcUid, remoteUids],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.root}>
        {roomId && joined ? (
          <>
            <View style={styles.videoStage}>
              {cameraOff ? (
                <View style={[styles.videoFill, styles.cameraOffStage]}>
                  <Text style={styles.cameraOffText}>Camera off</Text>
                </View>
              ) : remoteRenderUids.length > 0 ? (
                renderRemoteView(remoteRenderUids[0])
              ) : (
                renderLocalView(true)
              )}
              {remoteRenderUids.length > 0 ? (
                <View style={styles.pictureInPicture}>{renderLocalView(false)}</View>
              ) : null}
              <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
                <View>
                  <Text style={styles.livePill}>LIVE</Text>
                  <Text style={styles.roomTitle}>{roomTitle}</Text>
                  <Text style={styles.roomMeta}>
                    {roomChannel} | {participants.length} in room
                  </Text>
                </View>
                <Pressable onPress={handleClose} style={styles.closeChip}>
                  <Text style={styles.closeChipText}>Close</Text>
                </Pressable>
              </View>
              <View style={styles.rightRail}>
                <Pressable style={styles.railButton} onPress={() => setShowInvitePanel(true)}>
                  <Text style={styles.railIcon}>Invite</Text>
                </Pressable>
                <Pressable style={styles.railButton} onPress={() => setShowReactionPicker(v => !v)}>
                  <Text style={styles.railIcon}>React</Text>
                </Pressable>
                <Pressable style={styles.railButton} onPress={() => setShowComments(v => !v)}>
                  <Text style={styles.railIcon}>Chat</Text>
                </Pressable>
                <Pressable
                  style={styles.railButton}
                  onPress={() => {
                    const next = !micMuted;
                    setMicMuted(next);
                    try {
                      engineRef.current?.muteLocalAudioStream?.(next);
                    } catch {}
                  }}
                >
                  <Text style={styles.railIcon}>{micMuted ? 'Unmute' : 'Mute'}</Text>
                </Pressable>
                <Pressable
                  style={styles.railButton}
                  onPress={() => {
                    const next = !cameraOff;
                    setCameraOff(next);
                    try {
                      engineRef.current?.muteLocalVideoStream?.(next);
                      engineRef.current?.enableLocalVideo?.(!next);
                    } catch {}
                  }}
                >
                  <Text style={styles.railIcon}>{cameraOff ? 'Show' : 'Hide'}</Text>
                </Pressable>
                <Pressable
                  style={styles.railButton}
                  onPress={() => {
                    try {
                      engineRef.current?.switchCamera?.();
                    } catch {}
                  }}
                >
                  <Text style={styles.railIcon}>Flip</Text>
                </Pressable>
              </View>
              {showReactionPicker ? (
                <View style={styles.reactionTray}>
                  {['❤️', '🔥', '👏', '😂', '💯', '😍'].map(emoji => (
                    <Pressable
                      key={emoji}
                      style={styles.reactionChip}
                      onPress={() => sendReaction(emoji)}
                    >
                      <Text style={styles.reactionChipText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {showComments ? (
                <View pointerEvents="box-none" style={styles.commentLane}>
                  <View style={styles.commentGuide} />
                  {floatingComments.map((comment, idx) => (
                    <Animated.View
                      key={comment.id}
                      style={[
                        styles.floatingCommentWrap,
                        {
                          bottom: 150 + idx * 42,
                          opacity: comment.anim.interpolate({
                            inputRange: [0, 0.15, 0.7, 1],
                            outputRange: [0, 1, 1, 0],
                          }),
                          transform: [
                            {
                              translateY: comment.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -(SCREEN_HEIGHT * 0.34)],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Pressable onPress={() => {
                        const full = comments.find(item => item.id === comment.id);
                        if (full) setReplyTarget(full);
                      }}>
                        <Text style={styles.floatingCommentAuthor}>{comment.fromName}</Text>
                        <Text style={styles.floatingCommentText} numberOfLines={2}>
                          {comment.text}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              ) : null}
              {floatingReactions.map(item => (
                <Animated.Text
                  key={item.id}
                  style={[
                    styles.floatingReaction,
                    {
                      right: 18 + item.lane * 26,
                      bottom: 140,
                      opacity: item.anim.interpolate({
                        inputRange: [0, 0.15, 0.8, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [
                        {
                          translateY: item.anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -(SCREEN_HEIGHT * 0.42)],
                          }),
                        },
                        {
                          scale: item.anim.interpolate({
                            inputRange: [0, 0.2, 1],
                            outputRange: [0.7, 1.08, 0.92],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {item.emoji}
                </Animated.Text>
              ))}
              <View style={[styles.bottomComposer, { paddingBottom: insets.bottom + 14 }]}>
                {replyTarget ? (
                  <View style={styles.replyPill}>
                    <Text style={styles.replyPillText} numberOfLines={1}>
                      Replying to {replyTarget.fromName}: {replyTarget.text}
                    </Text>
                    <Pressable onPress={() => setReplyTarget(null)}>
                      <Text style={styles.replyPillDismiss}>x</Text>
                    </Pressable>
                  </View>
                ) : null}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <View style={styles.composerRow}>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Say something to the room"
                      placeholderTextColor="rgba(255,255,255,0.55)"
                      style={styles.commentInput}
                    />
                    <Pressable style={styles.sendButton} onPress={sendComment}>
                      <Text style={styles.sendButtonText}>Send</Text>
                    </Pressable>
                  </View>
                </KeyboardAvoidingView>
              </View>
              <FlatList
                horizontal
                data={participants}
                keyExtractor={item => item.uid}
                style={[styles.participantStrip, { top: insets.top + 82 }]}
                contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
                renderItem={({ item }) => (
                  <View style={styles.participantChip}>
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.participantAvatar} />
                    ) : (
                      <View style={[styles.participantAvatar, styles.commentAvatarFallback]}>
                        <Text style={styles.commentAvatarFallbackText}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.participantName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />
            </View>
            <Modal visible={showInvitePanel} transparent animationType="fade" onRequestClose={() => setShowInvitePanel(false)}>
              <View style={styles.inviteBackdrop}>
                <View style={[styles.invitePanel, { paddingBottom: insets.bottom + 18 }]}>
                  <Text style={styles.inviteTitle}>Invite to this Drift Expo</Text>
                  <View style={styles.inviteSearchRow}>
                    <TextInput
                      value={inviteQuery}
                      onChangeText={setInviteQuery}
                      placeholder="Search a user"
                      placeholderTextColor="#7b8a9e"
                      style={styles.inviteInput}
                    />
                    <Pressable style={styles.inviteSearchButton} onPress={searchInviteTargets}>
                      <Text style={styles.inviteSearchButtonText}>Find</Text>
                    </Pressable>
                  </View>
                  {onlineInvitees.length > 0 ? (
                    <View style={styles.onlineSection}>
                      <Text style={styles.onlineSectionTitle}>Online now</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.onlineInviteRow}>
                          {onlineInvitees.map(item => (
                            <Pressable
                              key={`online-${item.uid}`}
                              style={styles.onlineInviteChip}
                              onPress={() => sendInvite(item)}
                              disabled={inviteBusyUid === item.uid}
                            >
                              {item.photo ? (
                                <Image source={{ uri: item.photo }} style={styles.onlineInviteAvatar} />
                              ) : (
                                <View style={[styles.onlineInviteAvatar, styles.commentAvatarFallback]}>
                                  <Text style={styles.commentAvatarFallbackText}>
                                    {item.name.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                              )}
                              <Text style={styles.onlineInviteName} numberOfLines={1}>
                                {item.name}
                              </Text>
                              <Text style={styles.onlineInviteHandle} numberOfLines={1}>
                                {inviteBusyUid === item.uid ? '...' : item.secondary || 'Invite'}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  ) : null}
                  {inviteLoading ? <ActivityIndicator color="#10c9ff" style={{ marginVertical: 12 }} /> : null}
                  <ScrollView style={{ maxHeight: 320 }}>
                    {inviteResults.map(item => (
                      <View key={item.uid} style={styles.inviteRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inviteResultName}>{item.name}</Text>
                          <Text style={styles.inviteResultUid}>
                            {item.secondary || item.uid}
                          </Text>
                        </View>
                        <Pressable
                          style={styles.inviteResultButton}
                          disabled={inviteBusyUid === item.uid}
                          onPress={() => sendInvite(item)}
                        >
                          <Text style={styles.inviteResultButtonText}>
                            {inviteBusyUid === item.uid ? '...' : 'Invite'}
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                  <Pressable style={styles.inviteCloseButton} onPress={() => setShowInvitePanel(false)}>
                    <Text style={styles.inviteCloseButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View style={[styles.lobby, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
            <View
              style={{
                width: '100%',
                minHeight: 220,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(8,18,32,0.72)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
                overflow: 'hidden',
              }}
            >
              <Text style={{ fontSize: 58, letterSpacing: 6 }}>🧑🏾‍💼 👩🏽‍💼 👨🏿‍💼</Text>
              <Text style={{ fontSize: 52, marginTop: 10, letterSpacing: 8 }}>💬 🎥 💬</Text>
              <Text style={{ fontSize: 58, marginTop: 10, letterSpacing: 6 }}>👩🏻‍💼 👨🏾‍💼 🧑🏼‍💼</Text>
            </View>
            {!!statusText && statusText !== 'Ready' ? (
              <Text style={[styles.lobbyBody, { marginBottom: 14 }]}>
                {statusText}
              </Text>
            ) : null}
            {isBusy ? <ActivityIndicator color="#10c9ff" style={{ marginTop: 20 }} /> : null}
            <Pressable
              style={styles.primaryStartButton}
              onPress={() => {
                if (inviteJoinPreset?.liveId) {
                  hydrateRoom(String(inviteJoinPreset.liveId)).catch(() => {});
                  return;
                }
                startFreshRoom();
              }}
            >
              <Text style={styles.primaryStartButtonText}>
                {inviteJoinPreset?.liveId ? 'Open invited room' : 'Start new Drift Expo'}
              </Text>
            </Pressable>
            {inviteJoinPreset?.liveId ? (
              <Pressable
                style={styles.secondaryStartButton}
                onPress={() => hydrateRoom(String(inviteJoinPreset.liveId)).catch(() => {})}
              >
                <Text style={styles.secondaryStartButtonText}>Join invite</Text>
              </Pressable>
            ) : null}
            {recentDrifts.length > 0 ? (
              <View style={styles.recentSection}>
                <Text style={styles.recentSectionTitle}>Recent Drift Expos</Text>
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {recentDrifts.map(item => (
                    <Pressable
                      key={item.id}
                      style={styles.recentCard}
                      onPress={() => {
                        if (item.playbackUrl && RNVideo) {
                          setReplayItem(item);
                        }
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentCardTitle}>
                          {item.hostName} was live
                        </Text>
                        <Text style={styles.recentCardMeta}>
                          {item.title}
                        </Text>
                      </View>
                      <Text style={styles.recentCardAction}>
                        {item.playbackUrl && RNVideo ? 'Play' : 'No replay'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <Pressable style={styles.secondaryStartButton} onPress={handleClose}>
              <Text style={styles.secondaryStartButtonText}>Close</Text>
            </Pressable>
          </View>
        )}
        <Modal
          visible={!!replayItem}
          transparent
          animationType="fade"
          onRequestClose={() => setReplayItem(null)}
        >
          <View style={styles.replayBackdrop}>
            <View style={styles.replayCard}>
              <Text style={styles.replayTitle}>{replayItem?.hostName || 'Drift replay'}</Text>
              {replayItem?.playbackUrl && RNVideo ? (
                <RNVideo
                  source={{ uri: replayItem.playbackUrl }}
                  style={styles.replayVideo}
                  resizeMode="contain"
                  controls
                  paused={false}
                />
              ) : (
                <Text style={styles.replayEmpty}>No replay file is available for this Drift Expo.</Text>
              )}
              <Pressable style={styles.inviteCloseButton} onPress={() => setReplayItem(null)}>
                <Text style={styles.inviteCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070d',
  },
  videoStage: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
  },
  pictureInPicture: {
    position: 'absolute',
    right: 14,
    top: 150,
    width: 110,
    height: 168,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: '#0c111a',
  },
  pictureInPictureVideo: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10141d',
  },
  videoFallbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  livePill: {
    color: '#061117',
    backgroundColor: '#30e6b6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '900',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginBottom: 8,
  },
  roomTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  roomMeta: {
    color: 'rgba(255,255,255,0.76)',
    marginTop: 4,
  },
  closeChip: {
    backgroundColor: 'rgba(0,0,0,0.56)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },
  closeChipText: {
    color: 'white',
    fontWeight: '700',
  },
  rightRail: {
    position: 'absolute',
    right: 14,
    bottom: 160,
    gap: 10,
  },
  railButton: {
    backgroundColor: 'rgba(6,15,24,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  railIcon: {
    color: 'white',
    fontWeight: '800',
  },
  reactionTray: {
    position: 'absolute',
    right: 82,
    bottom: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 160,
    gap: 8,
    backgroundColor: 'rgba(10,16,24,0.82)',
    borderRadius: 18,
    padding: 10,
  },
  reactionChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionChipText: {
    fontSize: 22,
  },
  commentLane: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 220,
  },
  commentGuide: {
    position: 'absolute',
    left: 8,
    bottom: 130,
    width: 2,
    height: SCREEN_HEIGHT * 0.38,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  floatingCommentWrap: {
    position: 'absolute',
    left: 16,
    maxWidth: 180,
  },
  floatingCommentAuthor: {
    color: '#9de8ff',
    fontWeight: '800',
    marginBottom: 2,
  },
  floatingCommentText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingReaction: {
    position: 'absolute',
    fontSize: 28,
  },
  commentAvatarWrap: {
    paddingTop: 2,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  commentAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243140',
  },
  commentAvatarFallbackText: {
    color: 'white',
    fontWeight: '800',
  },
  commentName: {
    color: 'white',
    fontWeight: '800',
    marginBottom: 2,
  },
  replySnippet: {
    color: '#8fdcff',
    fontSize: 11,
    marginBottom: 3,
  },
  commentText: {
    color: 'rgba(255,255,255,0.88)',
  },
  commentTime: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 10,
    marginTop: 4,
  },
  bottomComposer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: 'rgba(4,8,13,0.88)',
  },
  replyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(31,61,89,0.95)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  replyPillText: {
    color: '#d8f4ff',
    flex: 1,
    marginRight: 10,
  },
  replyPillDismiss: {
    color: 'white',
    fontWeight: '900',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButton: {
    backgroundColor: '#10c9ff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: '#03131e',
    fontWeight: '900',
  },
  participantStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  participantChip: {
    width: 58,
    alignItems: 'center',
  },
  participantAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 4,
  },
  participantName: {
    color: 'white',
    fontSize: 10,
  },
  inviteBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  invitePanel: {
    backgroundColor: '#091019',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  inviteTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  inviteSearchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: '#101b28',
    color: 'white',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inviteSearchButton: {
    backgroundColor: '#10c9ff',
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteSearchButtonText: {
    color: '#03131e',
    fontWeight: '900',
  },
  onlineSection: {
    marginBottom: 12,
  },
  onlineSectionTitle: {
    color: '#8fdcff',
    fontWeight: '800',
    marginBottom: 8,
  },
  onlineInviteRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  onlineInviteChip: {
    width: 96,
    borderRadius: 16,
    backgroundColor: '#101b28',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  onlineInviteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 8,
  },
  onlineInviteName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  onlineInviteHandle: {
    color: '#7ab9d2',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  inviteResultName: {
    color: 'white',
    fontWeight: '700',
  },
  inviteResultUid: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 11,
    marginTop: 3,
  },
  inviteResultButton: {
    backgroundColor: '#0fd08f',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inviteResultButtonText: {
    color: '#031313',
    fontWeight: '900',
  },
  inviteCloseButton: {
    marginTop: 14,
    backgroundColor: '#182434',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  inviteCloseButtonText: {
    color: 'white',
    fontWeight: '800',
  },
  lobby: {
    flex: 1,
    backgroundColor: '#07101a',
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  lobbyEyebrow: {
    color: '#10c9ff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  lobbyTitle: {
    color: 'white',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 12,
  },
  lobbyBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  lobbyCard: {
    backgroundColor: '#0d1825',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },
  lobbyMetaLabel: {
    color: '#7ab9d2',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  lobbyMetaValue: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 12,
  },
  primaryStartButton: {
    backgroundColor: '#10c9ff',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryStartButtonText: {
    color: '#04131d',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryStartButton: {
    backgroundColor: '#162333',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  secondaryStartButtonText: {
    color: 'white',
    fontWeight: '800',
  },
  recentSection: {
    marginBottom: 12,
  },
  recentSectionTitle: {
    color: '#9de8ff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0d1825',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  recentCardTitle: {
    color: 'white',
    fontWeight: '800',
    marginBottom: 2,
  },
  recentCardMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
  },
  recentCardAction: {
    color: '#10c9ff',
    fontWeight: '800',
  },
  replayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  replayCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#091019',
    borderRadius: 24,
    padding: 18,
  },
  replayTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  replayVideo: {
    width: '100%',
    height: 320,
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 14,
  },
  replayEmpty: {
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 14,
  },
  cameraOffStage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131a24',
  },
  cameraOffText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default FreshDriftExpoModal;
