import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
import {
  canCurrentUserJoinPremiumShow,
  recordPremiumEntry,
} from '../services/premiumService';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const LIVE_INVITE_WINDOW_MS = 3 * 60 * 1000;
const COMMENT_FLOAT_MAX = 5;
const COMMENT_FLOAT_LIFETIME_MS = 6800;
const COMMENT_STACK_GAP = 58;
const REACTION_EMOJIS = [
  '❤️',
  '💙',
  '🩵',
  '🫶',
  '🫂',
  '🤗',
  '💕',
  '💖',
  '😍',
  '😘',
  '🔥',
  '✨',
  '👏',
  '🙌',
  '💯',
  '😂',
  '🌊',
  '💎',
];

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

type PremiumRoomMeta = {
  title: string;
  description: string | null;
  status: string;
  startsAtMs: number;
  endsAtMs: number;
  hostName: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  isChartered?: boolean;
  premiumShowId?: string | null;
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

const formatCountdown = (diffMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
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
  isChartered,
  premiumShowId,
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
  const reactionTrayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef<{ id: string; channel: string; title: string; hostUid: string | null } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomChannel, setRoomChannel] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState<string>('Drift Expo');
  const [roomHostUid, setRoomHostUid] = useState<string | null>(null);
  const [roomPremiumShowId, setRoomPremiumShowId] = useState<string | null>(null);
  const [premiumMeta, setPremiumMeta] = useState<PremiumRoomMeta | null>(null);
  const [clockNowMs, setClockNowMs] = useState<number>(Date.now());
  const [pendingPremiumJoin, setPendingPremiumJoin] = useState<{
    liveId: string;
    showId: string;
  } | null>(null);
  const [roomHostName, setRoomHostName] = useState<string>('Host');
  const [myRtcUid, setMyRtcUid] = useState<number>(0);
  const [joined, setJoined] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [showAudiencePanel, setShowAudiencePanel] = useState(false);
  const [participantTicketLabels, setParticipantTicketLabels] = useState<Record<string, string>>({});
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
    Array<{
      id: string;
      text: string;
      fromName: string;
      replyToName?: string | null;
      replyToText?: string | null;
      stack: Animated.Value;
      fade: Animated.Value;
    }>
  >([]);
  const [floatingReactions, setFloatingReactions] = useState<
    Array<{ id: string; emoji: string; anim: Animated.Value; lane: number; xOffset: number }>
  >([]);
  const seenCommentIdsRef = useRef<Set<string>>(new Set());
  const seenReactionIdsRef = useRef<Set<string>>(new Set());

  const me = auth().currentUser;
  const meUid = me?.uid || '';
  const meName = String(me?.displayName || (me?.email ? me.email.split('@')[0] : '') || 'Viber');
  const mePhoto = me?.photoURL || null;
  const isPremiumRoom = !!roomPremiumShowId;
  const isPremiumHost = !!(roomPremiumShowId && roomHostUid && meUid && roomHostUid === meUid);
  const premiumCountdownLabel = useMemo(() => {
    if (!premiumMeta) return null;
    if (premiumMeta.status === 'scheduled' && premiumMeta.startsAtMs > clockNowMs) {
      return `Starts in ${formatCountdown(premiumMeta.startsAtMs - clockNowMs)}`;
    }
    if (premiumMeta.endsAtMs > clockNowMs) {
      return `Ends in ${formatCountdown(premiumMeta.endsAtMs - clockNowMs)}`;
    }
    return premiumMeta.status === 'ended' ? 'Show ended' : 'Closing soon';
  }, [clockNowMs, premiumMeta]);
  const premiumStatusLine = useMemo(() => {
    if (!premiumMeta) return null;
    const viewerLabel = isPremiumHost ? 'Host view' : 'Guest view';
    const windowLabel = premiumMeta.endsAtMs
      ? `Window: ${formatTimestamp(premiumMeta.startsAtMs)} - ${formatTimestamp(premiumMeta.endsAtMs)}`
      : null;
    return [viewerLabel, windowLabel].filter(Boolean).join(' | ');
  }, [isPremiumHost, premiumMeta]);
  const audienceRows = useMemo(
    () =>
      participants.map(item => ({
        uid: item.uid,
        label:
          item.isHost || item.uid === roomHostUid
            ? 'Host'
            : participantTicketLabels[item.uid] || `Ticket ${String(item.uid || '').slice(-4).toUpperCase()}`,
      })),
    [participantTicketLabels, participants, roomHostUid],
  );
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
    setRoomPremiumShowId(null);
    setPremiumMeta(null);
    setClockNowMs(Date.now());
    setPendingPremiumJoin(null);
    setRoomHostName('Host');
    setMyRtcUid(0);
    setJoined(false);
    setRemoteUids([]);
    setParticipants([]);
    setShowAudiencePanel(false);
    setParticipantTicketLabels({});
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
    if (reactionTrayTimerRef.current) {
      clearTimeout(reactionTrayTimerRef.current);
      reactionTrayTimerRef.current = null;
    }
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
      const premiumRequired = !!data.premiumRequired;
      const nextPremiumShowId = data.premiumShowId ? String(data.premiumShowId) : null;
      const nextHostUid = String(data.hostUid || '');
      if (premiumRequired && nextPremiumShowId) {
        const access = await canCurrentUserJoinPremiumShow(nextPremiumShowId, nextHostUid || null);
        if (!access.allowed) {
          setPendingPremiumJoin({ liveId, showId: nextPremiumShowId });
          setStatusText(access.reason || 'Redeem an Aqua Premium token to continue.');
          return;
        }
      }
      setPendingPremiumJoin(null);
      const channel = String(data.channel || data.liveChannel || defaultChannel || '')
        .trim()
        .replace(/[^A-Za-z0-9_]/g, '_')
        .slice(0, 64);
      if (!channel) {
        throw new Error('This Drift Expo room is missing a channel.');
      }
      const uid = mapRtcUidFromUserId(meUid);
      const fallbackTitle = nextPremiumShowId ? 'Aqua Premium Show' : 'Drift Expo';
      setRoomId(liveId);
      setRoomChannel(channel);
      setRoomTitle(String(data.title || data.liveTitle || inviteJoinPreset?.title || fallbackTitle));
      setRoomHostUid(nextHostUid);
      setRoomPremiumShowId(nextPremiumShowId);
      setRoomHostName(String(data.hostName || inviteJoinPreset?.fromName || 'Host'));
      setMyRtcUid(uid);
      setJoined(false);
      try {
        const participantSnap = await firestore()
          .collection(`live/${liveId}/participants`)
          .limit(12)
          .get();
        const seededRemoteUids = (participantSnap?.docs || [])
          .map((doc: any) => Number((doc.data() || {}).rtcUid || 0))
          .filter((rtcUid: number) => Number.isFinite(rtcUid) && rtcUid > 0 && rtcUid !== uid);
        setRemoteUids(Array.from(new Set(seededRemoteUids)));
      } catch {
        setRemoteUids([]);
      }
      joinedChannelRef.current = null;
      joiningChannelRef.current = null;
      setStatusText('Joining room');
    },
    [defaultChannel, inviteJoinPreset?.fromName, inviteJoinPreset?.title, meUid],
  );

  useEffect(() => {
    if (!visible || !pendingPremiumJoin?.showId || !pendingPremiumJoin.liveId || !meUid) return;
    const accessRef = firestore().doc(`users/${meUid}/premium_access/${pendingPremiumJoin.showId}`);
    const unsub = accessRef.onSnapshot(snap => {
      const data = snap?.data?.() || {};
      if (!snap.exists) return;
      if (String(data.status || 'active') !== 'active') return;
      setStatusText('Access granted. Opening camera...');
      setPendingPremiumJoin(null);
      hydrateRoom(String(pendingPremiumJoin.liveId)).catch(error => {
        setStatusText(String(error?.message || 'Could not open room'));
      });
    });
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [hydrateRoom, meUid, pendingPremiumJoin, visible]);

  useEffect(() => {
    if (!visible || !roomPremiumShowId) return;
    setClockNowMs(Date.now());
    const timer = setInterval(() => {
      setClockNowMs(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [roomPremiumShowId, visible]);

  useEffect(() => {
    if (!visible || !roomPremiumShowId) {
      setPremiumMeta(null);
      return;
    }
    const unsub = firestore()
      .collection('premium_shows')
      .doc(roomPremiumShowId)
      .onSnapshot(snap => {
        const data = snap?.data?.() || {};
        const nextTitle = String(data.title || 'Aqua Premium Show');
        setPremiumMeta({
          title: nextTitle,
          description: data.description ? String(data.description) : null,
          status: String(data.status || 'live'),
          startsAtMs: toMillis(data.startsAt),
          endsAtMs: toMillis(data.endsAt),
          hostName: data.hostName ? String(data.hostName) : null,
        });
        setRoomTitle(currentTitle =>
          currentTitle && currentTitle !== 'Drift Expo' ? currentTitle : nextTitle,
        );
        if (data.hostName) {
          setRoomHostName(currentName =>
            currentName && currentName !== 'Host' ? currentName : String(data.hostName || 'Host'),
          );
        }
      });
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [roomPremiumShowId, visible]);

  useEffect(() => {
    if (!visible || !roomPremiumShowId) {
      setParticipantTicketLabels({});
      return;
    }
    const unsub = firestore()
      .collection(`premium_shows/${roomPremiumShowId}/tickets`)
      .onSnapshot(snap => {
        const nextLabels: Record<string, string> = {};
        (snap?.docs || []).forEach(doc => {
          const data = doc.data() || {};
          const claimedByUid = String(data.claimedByUid || '').trim();
          if (!claimedByUid) return;
          const rawCode = String(data.code || '').trim();
          const codeLast4 = String(data.codeLast4 || '').trim();
          nextLabels[claimedByUid] =
            rawCode ||
            (codeLast4
              ? `Ticket ${codeLast4}`
              : `Ticket ${doc.id.slice(-4).toUpperCase()}`);
        });
        setParticipantTicketLabels(nextLabels);
      });
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [roomPremiumShowId, visible]);

  const startFreshRoom = useCallback(async () => {
    if (!meUid) {
      Alert.alert('Sign in required', 'Please sign in to start Drift Expo.');
      return;
    }
    setIsBusy(true);
    setStatusText(
      engineReady
        ? isChartered && premiumShowId
          ? 'Creating Aqua Premium show'
          : 'Creating room'
        : 'Preparing camera',
    );
    try {
      const ref = firestore().collection('live').doc();
      let premiumTitle = 'Aqua Premium Show';
      if (isChartered && premiumShowId) {
        try {
          const premiumSnap = await firestore().collection('premium_shows').doc(premiumShowId).get();
          const premiumData = premiumSnap?.data?.() || {};
          premiumTitle = String(premiumData.title || premiumTitle);
          setPremiumMeta({
            title: premiumTitle,
            description: premiumData.description ? String(premiumData.description) : null,
            status: String(premiumData.status || 'live'),
            startsAtMs: toMillis(premiumData.startsAt),
            endsAtMs: toMillis(premiumData.endsAt),
            hostName: premiumData.hostName ? String(premiumData.hostName) : meName,
          });
        } catch {}
      }
      const channelPrefix = isChartered && premiumShowId ? 'aqua_premium' : 'drift';
      const channel = `${channelPrefix}_${ref.id}`.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
      const uid = mapRtcUidFromUserId(meUid);
      const title = isChartered && premiumShowId ? premiumTitle : 'Drift Expo';
      await ref.set({
        title,
        liveTitle: title,
        channel,
        liveChannel: channel,
        hostUid: meUid,
        hostName: meName,
        hostPhoto: mePhoto,
        roomKind: isChartered && premiumShowId ? 'aqua-premium' : 'drift-expo',
        premiumRequired: !!(isChartered && premiumShowId),
        premiumShowId: isChartered ? premiumShowId || null : null,
        status: 'live',
        appId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      setRoomId(ref.id);
      setRoomChannel(channel);
      setRoomTitle(title);
      setRoomHostUid(meUid);
      setRoomPremiumShowId(isChartered ? premiumShowId || null : null);
      setRoomHostName(meName);
      setMyRtcUid(uid);
      setJoined(false);
      setRemoteUids([]);
      upsertParticipant(ref.id, channel, uid, true).catch(() => {});
      joinedChannelRef.current = null;
      joiningChannelRef.current = null;
      setStatusText(
        engineReady
          ? isChartered && premiumShowId
            ? 'Opening Aqua Premium camera'
            : 'Joining room'
          : 'Camera warming up',
      );
    } catch (error: any) {
      Alert.alert('Could not start Drift Expo', String(error?.message || 'Try again.'));
    } finally {
      setIsBusy(false);
    }
  }, [appId, engineReady, isChartered, meName, mePhoto, meUid, premiumShowId, upsertParticipant]);

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
                String(connection?.channelId || roomRef.current?.channel || '').trim() || '';
              if (activeChannel && connection?.localUid) {
                setMyRtcUid(prev => prev || Number(connection.localUid) || 0);
              }
              try {
                if (typeof engine.setupRemoteVideoEx === 'function' && activeChannel && connection?.localUid) {
                  engine.setupRemoteVideoEx(
                    {
                      uid: next,
                      channelId: activeChannel,
                      sourceType: Agora.VideoSourceType?.VideoSourceRemote,
                    },
                    {
                      channelId: activeChannel,
                      localUid: Number(connection.localUid) || 0,
                    },
                  );
                } else {
                  engine.setupRemoteVideo?.({
                    uid: next,
                    channelId: activeChannel || undefined,
                    sourceType: Agora.VideoSourceType?.VideoSourceRemote,
                  });
                }
              } catch {}
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
        if (roomPremiumShowId) {
          await recordPremiumEntry(roomPremiumShowId).catch(() => {});
        }
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
  }, [Agora, meUid, myRtcUid, roomChannel, roomHostUid, roomId, roomPremiumShowId, upsertParticipant, visible]);

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
        setRoomPremiumShowId(data.premiumShowId ? String(data.premiumShowId) : null);
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
          const lane = index % 6;
          const xOffsets = [-118, -72, -28, 28, 72, 118];
          setFloatingReactions(prev =>
            [...prev, { id: doc.id, emoji, anim, lane, xOffset: xOffsets[lane] }].slice(-6),
          );
          Animated.timing(anim, {
            toValue: 1,
            duration: 3600,
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

  const restackFloatingComments = useCallback(
    (
      items: Array<{
        id: string;
        text: string;
        fromName: string;
        replyToName?: string | null;
        replyToText?: string | null;
        stack: Animated.Value;
        fade: Animated.Value;
      }>,
    ) => {
      items.forEach((item, index) => {
        const stackIndex = items.length - 1 - index;
        Animated.spring(item.stack, {
          toValue: stackIndex,
          damping: 18,
          mass: 0.75,
          stiffness: 180,
          useNativeDriver: true,
        }).start();
      });
    },
    [],
  );

  useEffect(() => {
    comments.forEach(comment => {
      if (seenCommentIdsRef.current.has(comment.id)) return;
      seenCommentIdsRef.current.add(comment.id);
      const nextItem = {
        id: comment.id,
        text: comment.text,
        fromName: comment.fromName,
        replyToName: comment.replyToName || null,
        replyToText: comment.replyToText || null,
        stack: new Animated.Value(0),
        fade: new Animated.Value(0),
      };
      setFloatingComments(prev => {
        const next = [...prev, nextItem].slice(-COMMENT_FLOAT_MAX);
        restackFloatingComments(next);
        return next;
      });
      Animated.sequence([
        Animated.timing(nextItem.fade, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.delay(COMMENT_FLOAT_LIFETIME_MS),
        Animated.timing(nextItem.fade, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFloatingComments(prev => {
          const next = prev.filter(item => item.id !== comment.id);
          restackFloatingComments(next);
          return next;
        });
      });
    });
  }, [comments, restackFloatingComments]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (!roomId || !meUid) return;
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

  useEffect(() => {
    if (!showReactionPicker) {
      if (reactionTrayTimerRef.current) {
        clearTimeout(reactionTrayTimerRef.current);
        reactionTrayTimerRef.current = null;
      }
      return;
    }
    if (reactionTrayTimerRef.current) {
      clearTimeout(reactionTrayTimerRef.current);
    }
    reactionTrayTimerRef.current = setTimeout(() => {
      setShowReactionPicker(false);
      reactionTrayTimerRef.current = null;
    }, 4000);
    return () => {
      if (reactionTrayTimerRef.current) {
        clearTimeout(reactionTrayTimerRef.current);
        reactionTrayTimerRef.current = null;
      }
    };
  }, [showReactionPicker]);

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

  const attachRemoteVideo = useCallback(
    (uid: number) => {
      const engine = engineRef.current;
      const nextUid = Number(uid);
      if (!engine || !Number.isFinite(nextUid) || nextUid <= 0) return;
      const activeChannel = String(roomChannel || roomRef.current?.channel || '').trim();
      if (!activeChannel) return;
      try {
        if (typeof engine.setupRemoteVideoEx === 'function' && myRtcUid) {
          engine.setupRemoteVideoEx(
            {
              uid: nextUid,
              channelId: activeChannel,
              sourceType: Agora?.VideoSourceType?.VideoSourceRemote,
            },
            {
              channelId: activeChannel,
              localUid: myRtcUid,
            },
          );
          return;
        }
        engine.setupRemoteVideo?.({
          uid: nextUid,
          channelId: activeChannel,
          sourceType: Agora?.VideoSourceType?.VideoSourceRemote,
        });
      } catch {}
    },
    [Agora, myRtcUid, roomChannel],
  );

  useEffect(() => {
    if (!roomId || !joined) return;
    const participantRemoteUids = participants
      .map(item => Number(item.rtcUid || 0))
      .filter(uid => Number.isFinite(uid) && uid > 0 && uid !== myRtcUid);
    if (!participantRemoteUids.length) return;
    setRemoteUids(prev => Array.from(new Set([...participantRemoteUids, ...prev])));
    participantRemoteUids.forEach(uid => attachRemoteVideo(uid));
  }, [attachRemoteVideo, joined, myRtcUid, participants, roomId]);

  useEffect(() => {
    remoteRenderUids.forEach(uid => attachRemoteVideo(uid));
  }, [attachRemoteVideo, remoteRenderUids]);

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
              {remoteRenderUids.length > 0 ? (
                renderRemoteView(remoteRenderUids[0])
              ) : cameraOff ? (
                <View style={[styles.videoFill, styles.cameraOffStage]}>
                  <Text style={styles.cameraOffText}>Camera off</Text>
                </View>
              ) : (
                renderLocalView(true)
              )}
              {remoteRenderUids.length > 0 ? (
                <View style={styles.pictureInPicture}>
                  {cameraOff ? (
                    <View style={[styles.pictureInPictureVideo, styles.cameraOffStage]}>
                      <Text style={styles.cameraOffText}>Camera off</Text>
                    </View>
                  ) : (
                    renderLocalView(false)
                  )}
                </View>
              ) : null}
              <View
                style={[
                  styles.topBar,
                  {
                    paddingTop: insets.top + 10,
                    paddingLeft: insets.left + 12,
                    paddingRight: insets.right + 12,
                  },
                ]}
              >
                <View style={styles.topBarTitleWrap}>
                  {isPremiumRoom ? null : <Text style={styles.livePill}>LIVE</Text>}
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.roomTitle, isPremiumRoom ? styles.premiumRoomTitle : null]}
                  >
                    {roomTitle}
                  </Text>
                </View>
                <View style={styles.topBarCenter}>
                  {isPremiumRoom ? (
                    <View style={styles.premiumCountdownPill}>
                      <Text style={styles.premiumCountdownText}>
                        {premiumCountdownLabel || 'Premium stream active'}
                      </Text>
                    </View>
                  ) : null}
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
                  <Text style={styles.railEmojiLine}>💙 🫶 ❤️ ✨ 🤗</Text>
                </Pressable>
                <Pressable style={styles.railButton} onPress={() => setShowAudiencePanel(v => !v)}>
                  <Text style={styles.railIcon}>👥 ({participants.length})</Text>
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
              {showAudiencePanel ? (
                <View style={[styles.audiencePanel, { top: insets.top + 78, right: insets.right + 14 }]}>
                  <Text style={styles.audiencePanelTitle}>In The Room</Text>
                  {premiumStatusLine ? (
                    <Text style={styles.audiencePanelMeta}>{premiumStatusLine}</Text>
                  ) : null}
                  <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                    {audienceRows.map(item => (
                      <View key={item.uid} style={styles.audienceRow}>
                        <Text style={styles.audienceRowText}>{item.label}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
              {showReactionPicker ? (
                <View style={styles.reactionTray}>
                  {REACTION_EMOJIS.map(emoji => (
                    <Pressable
                      key={`react-${emoji}`}
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
                  {floatingComments.map(comment => (
                    <Animated.View
                      key={comment.id}
                      style={[
                        styles.floatingCommentWrap,
                        {
                          bottom: 148,
                          opacity: comment.fade,
                          transform: [
                            {
                              translateY: Animated.multiply(comment.stack, -COMMENT_STACK_GAP),
                            },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        style={styles.floatingCommentBubble}
                        onPress={() => {
                          const full = comments.find(item => item.id === comment.id);
                          if (full) setReplyTarget(full);
                        }}
                      >
                        <Text style={styles.floatingCommentAuthor}>{comment.fromName}</Text>
                        {comment.replyToName || comment.replyToText ? (
                          <Text style={styles.floatingReplyText} numberOfLines={1}>
                            Reply to {comment.replyToName || 'comment'}: {comment.replyToText || ''}
                          </Text>
                        ) : null}
                        <Text style={styles.floatingCommentText} numberOfLines={3}>
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
                      left: '50%',
                      marginLeft: -18,
                      bottom: SCREEN_HEIGHT * 0.26,
                      opacity: item.anim.interpolate({
                        inputRange: [0, 0.08, 0.9, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [
                        {
                          translateX: item.anim.interpolate({
                            inputRange: [0, 0.25, 1],
                            outputRange: [0, item.xOffset * 0.35, item.xOffset],
                          }),
                        },
                        {
                          translateY: item.anim.interpolate({
                            inputRange: [0, 0.22, 1],
                            outputRange: [0, -18, -(SCREEN_HEIGHT * 0.78)],
                          }),
                        },
                        {
                          scale: item.anim.interpolate({
                            inputRange: [0, 0.2, 1],
                            outputRange: [0.7, 1.08, 0.92],
                          }),
                        },
                        {
                          rotate: item.anim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: ['-10deg', '6deg', '-4deg'],
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
              style={[styles.primaryStartButton, premiumShowId ? styles.premiumPrimaryStartButton : null]}
              onPress={() => {
                if (inviteJoinPreset?.liveId) {
                  hydrateRoom(String(inviteJoinPreset.liveId)).catch(() => {});
                  return;
                }
                startFreshRoom();
              }}
            >
              <Text
                style={[
                  styles.primaryStartButtonText,
                  premiumShowId ? styles.premiumPrimaryStartButtonText : null,
                ]}
              >
                {inviteJoinPreset?.liveId
                  ? premiumShowId
                    ? 'Join Aqua Premium Show'
                    : 'Join room'
                  : premiumShowId
                  ? 'Start Aqua Premium Show'
                  : 'Start new Drift Expo'}
              </Text>
            </Pressable>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitleWrap: {
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
  },
  premiumRoomTitle: {
    color: '#B30000',
    fontSize: 16,
    fontWeight: '900',
  },
  premiumCountdownPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(141,0,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(179,0,0,0.58)',
  },
  premiumCountdownText: {
    color: '#FFD9D9',
    fontSize: 12,
    fontWeight: '900',
  },
  closeChip: {
    backgroundColor: '#0EA5D9',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0EA5D9',
    marginLeft: 12,
  },
  closeChipText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  rightRail: {
    position: 'absolute',
    right: 10,
    bottom: 160,
    gap: 8,
  },
  railButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  railIcon: {
    color: '#ff2a2a',
    fontWeight: '800',
    textShadowColor: 'rgba(75,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  railEmojiLine: {
    color: '#ff7a7a',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  audiencePanel: {
    position: 'absolute',
    width: 200,
    borderRadius: 18,
    backgroundColor: 'rgba(10,16,24,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 12,
  },
  audiencePanelTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  audiencePanelMeta: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8,
  },
  audienceRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  audienceRowText: {
    color: '#FFDADA',
    fontSize: 13,
    fontWeight: '700',
  },
  reactionTray: {
    position: 'absolute',
    right: 82,
    bottom: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 244,
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
    maxWidth: 218,
  },
  floatingCommentBubble: {
    backgroundColor: 'rgba(6,16,27,0.82)',
    borderColor: 'rgba(158,232,255,0.24)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  floatingCommentAuthor: {
    color: '#9de8ff',
    fontWeight: '800',
    marginBottom: 2,
  },
  floatingReplyText: {
    color: 'rgba(143,220,255,0.82)',
    fontSize: 11,
    marginBottom: 5,
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
    backgroundColor: '#0EA5D9',
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
  premiumPrimaryStartButton: {
    backgroundColor: '#8D0000',
  },
  premiumPrimaryStartButtonText: {
    color: '#FFFFFF',
  },
  secondaryStartButton: {
    backgroundColor: '#0EA5D9',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  secondaryStartButtonText: {
    color: '#FFFFFF',
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
