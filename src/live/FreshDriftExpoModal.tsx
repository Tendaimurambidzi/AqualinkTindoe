import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
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
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
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

const LIVE_SOUND_EFFECTS = [
  {
    id: 'underwater_explosion',
    label: 'Large Underwater Explosion',
    icon: '🌊',
    file: 'large_underwater_explosion_190270',
  },
  {
    id: 'downfall',
    label: 'Downfall',
    icon: '💥',
    file: 'downfall_3_208028',
  },
  {
    id: 'falcon',
    label: 'Falcon',
    icon: '🦅',
    file: 'falcon',
  },
  {
    id: 'sci_fi',
    label: 'Sci-Fi',
    icon: '🛸',
    file: 'sci_fi_sound_effect_designed_circuits_hum_10_200831',
  },
] as const;

const PREMIUM_LIVE_VIDEO_DIMENSIONS = { width: 960, height: 540 };
const PREMIUM_LIVE_VIDEO_BITRATE = 1000000;
const PREMIUM_LIVE_VIDEO_MIN_BITRATE = 450000;
const PREMIUM_LIVE_VIDEO_FRAME_RATE = 24;
const PREMIUM_LIVE_VIDEO_MIN_FRAME_RATE = 12;
const PREMIUM_SCREEN_SHARE_DIMENSIONS = { width: 1280, height: 720 };
const PREMIUM_SCREEN_SHARE_BITRATE = 2200;
const PREMIUM_SCREEN_SHARE_FRAME_RATE = 15;
const DRIFT_EXPO_VIDEO_DIMENSIONS = { width: 854, height: 480 };
const DRIFT_EXPO_VIDEO_BITRATE = 1100000;
const DRIFT_EXPO_VIDEO_MIN_BITRATE = 650000;
const DRIFT_EXPO_VIDEO_FRAME_RATE = 20;
const DRIFT_EXPO_VIDEO_MIN_FRAME_RATE = 15;
const LARGE_SHARED_FILE_BYTES = 24 * 1024 * 1024;
const VERY_LARGE_SHARED_FILE_BYTES = 80 * 1024 * 1024;
const MAX_SHARED_FILE_BYTES = 180 * 1024 * 1024;
const MAX_CONVERTIBLE_FILE_BYTES = 48 * 1024 * 1024;
const MAX_VISIBLE_PREMIUM_GALLERY_TILES = 4;

type InviteJoinPreset = {
  liveId?: string | null;
  channel?: string | null;
  token?: string | null;
  title?: string | null;
  fromName?: string | null;
  requireApproval?: boolean;
  skipPremiumValidation?: boolean;
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
  muted?: boolean;
  purged?: boolean;
  raisedHand?: boolean;
  cameraOff?: boolean;
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

type SharedPdfDoc = {
  id: string;
  title: string;
  fileName: string;
  downloadUrl: string;
  storagePath: string;
  fileSizeBytes?: number | null;
  sharedByUid?: string | null;
  sharedByName: string;
  createdAtMs: number;
  status?: string;
  sourceKind?: string | null;
  errorMessage?: string | null;
};

type PickedFileEntry = {
  uri?: string | null;
  filePath?: string | null;
  fileCopyUri?: string | null;
  name?: string | null;
  type?: string | null;
  size?: number | null;
};

type PresentationToolMode = 'pointer' | 'highlight' | 'pen' | 'eraser' | null;

type SharedDocMarker = {
  mode: Exclude<PresentationToolMode, null>;
  x: number;
  y: number;
};

type SharedDocInkPoint = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  strokeId?: string;
};

type SharedDocShareStage =
  | 'choosing'
  | 'selected'
  | 'uploading'
  | 'converting'
  | 'ready'
  | 'error'
  | null;

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

const DEFAULT_PRESENTATION_SLIDE_SECONDS = 10;
const SHARED_DOC_MAX_INK_POINTS = 480;
const SHARED_DOC_INK_POINT_SPACING_PX = 2;
const SHARED_DOC_ERASER_RADIUS_PX = 52;

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
  const { AudioPicker, PdfRenderer, AgoraRtcNg } = NativeModules as {
    AudioPicker?: {
      pickFiles?: () => Promise<any[] | any>;
    };
    PdfRenderer?: {
      getPageCount?: (localPath: string) => Promise<{ pageCount: number }>;
      renderPage?: (
        localPath: string,
        pageIndex: number,
        targetWidth: number,
      ) => Promise<{ uri: string; pageCount: number; pageIndex: number }>;
    };
    AgoraRtcNg?: {
      requestAndroidScreenProjection?: () => Promise<string>;
    };
  };
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
  const defaultChannel = String(cfg?.AGORA_CHANNEL_NAME || 'MoMoDrift').trim();
  const engineRef = useRef<any>(null);
  const joinedChannelRef = useRef<string | null>(null);
  const joiningChannelRef = useRef<string | null>(null);
  const premiumValidationBypassShowIdRef = useRef<string | null>(null);
  const reactionTrayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef<{ id: string; channel: string; title: string; hostUid: string | null } | null>(null);
  const activeInkPointRef = useRef<{ x: number; y: number } | null>(null);
  const activeInkStrokeIdRef = useRef<string | null>(null);
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
  const [recentSpeakerAt, setRecentSpeakerAt] = useState<Record<number, number>>({});
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [showAudiencePanel, setShowAudiencePanel] = useState(false);
  const [participantTicketLabels, setParticipantTicketLabels] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<CommentRow | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [networkWarning, setNetworkWarning] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<SearchResultItem[]>([]);
  const [onlineInvitees, setOnlineInvitees] = useState<SearchResultItem[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteBusyUid, setInviteBusyUid] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [soundBadgeLabel, setSoundBadgeLabel] = useState<string | null>(null);
  const [showDocsPanel, setShowDocsPanel] = useState(false);
  const [sharedDocs, setSharedDocs] = useState<SharedPdfDoc[]>([]);
  const [currentSharedDocId, setCurrentSharedDocId] = useState<string | null>(null);
  const [currentSharedDocStage, setCurrentSharedDocStage] = useState<SharedDocShareStage>(null);
  const [currentSharedDocPreviewTitle, setCurrentSharedDocPreviewTitle] = useState<string | null>(null);
  const [currentSharedDocPreviewKind, setCurrentSharedDocPreviewKind] = useState<string | null>(null);
  const [currentSharedDocDownloadUrl, setCurrentSharedDocDownloadUrl] = useState<string | null>(null);
  const [currentSharedDocStoragePath, setCurrentSharedDocStoragePath] = useState<string | null>(null);
  const [currentSharedDocFileName, setCurrentSharedDocFileName] = useState<string | null>(null);
  const [currentSharedDocFileSizeBytes, setCurrentSharedDocFileSizeBytes] = useState<number | null>(null);
  const [currentSharedDocPage, setCurrentSharedDocPage] = useState(0);
  const [currentSharedDocSlideShow, setCurrentSharedDocSlideShow] = useState(false);
  const [currentSharedDocSlideSeconds, setCurrentSharedDocSlideSeconds] = useState(
    DEFAULT_PRESENTATION_SLIDE_SECONDS,
  );
  const [currentPresentationTool, setCurrentPresentationTool] = useState<PresentationToolMode>(null);
  const [sharedDocMarker, setSharedDocMarker] = useState<SharedDocMarker | null>(null);
  const [sharedDocStatusText, setSharedDocStatusText] = useState<string | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const [activeDoc, setActiveDoc] = useState<SharedPdfDoc | null>(null);
  const [isDocMinimized, setIsDocMinimized] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [screenShareOwnerUid, setScreenShareOwnerUid] = useState<string | null>(null);
  const [screenShareOwnerName, setScreenShareOwnerName] = useState<string | null>(null);
  const [screenShareOwnerRtcUid, setScreenShareOwnerRtcUid] = useState<number>(0);
  const [screenShareStarting, setScreenShareStarting] = useState(false);
  const [localScreenShareActive, setLocalScreenShareActive] = useState(false);
  const [pdfLocalPath, setPdfLocalPath] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [pdfPageIndex, setPdfPageIndex] = useState(0);
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [pdfPreviewWidth, setPdfPreviewWidth] = useState(0);
  const [pdfPreviewHeight, setPdfPreviewHeight] = useState(0);
  const [pdfZoomLevel, setPdfZoomLevel] = useState(1);
  const [currentSharedDocZoom, setCurrentSharedDocZoom] = useState(1);
  const [currentSharedDocPanX, setCurrentSharedDocPanX] = useState(0);
  const [currentSharedDocPanY, setCurrentSharedDocPanY] = useState(0);
  const [sharedDocInkPoints, setSharedDocInkPoints] = useState<SharedDocInkPoint[]>([]);
  const [pdfFrameWidth, setPdfFrameWidth] = useState(0);
  const [pdfFrameHeight, setPdfFrameHeight] = useState(0);
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
  const handledSoundEventIdsRef = useRef<Set<string>>(new Set());
  const soundBadgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docsStatusPulseAnim = useRef(new Animated.Value(0)).current;
  const lastAutoOpenedDocIdRef = useRef<string | null>(null);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const openingPdfDocIdRef = useRef<string | null>(null);
  const currentShareUploadTaskRef = useRef<any>(null);
  const currentShareAttemptIdRef = useRef(0);
  const docsPanelAutoOpenedRef = useRef(false);
  const localSharedDocPathRef = useRef<Record<string, string>>({});
  const primedPdfDocIdsRef = useRef<Set<string>>(new Set());
  const pdfPageCacheRef = useRef<
    Record<
      string,
      {
        uri: string;
        pageCount: number;
        pageIndex: number;
        width: number;
        height: number;
      }
    >
  >({});
  const pdfPagePrefetchingRef = useRef<Record<string, boolean>>({});
  const pendingScreenShareStartRef = useRef(false);
  const pdfVerticalScrollRef = useRef<ScrollView | null>(null);
  const pdfHorizontalScrollRef = useRef<ScrollView | null>(null);
  const pendingViewportRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const me = auth().currentUser;
  const meUid = me?.uid || '';
  const meName = String(me?.displayName || (me?.email ? me.email.split('@')[0] : '') || 'Viber');
  const mePhoto = me?.photoURL || null;
  const isPremiumRoom = !!roomPremiumShowId;
  const isPremiumHost = !!(roomPremiumShowId && roomHostUid && meUid && roomHostUid === meUid);
  const resolvedPremiumShowId = roomPremiumShowId || premiumShowId || null;
  const isCurrentUserScreenSharer = useMemo(
    () => !!(screenShareActive && screenShareOwnerUid && meUid && screenShareOwnerUid === meUid),
    [meUid, screenShareActive, screenShareOwnerUid],
  );
  const screenShareRenderRtcUid = useMemo(() => {
    if (screenShareOwnerRtcUid > 0) return screenShareOwnerRtcUid;
    if (!screenShareOwnerUid) return 0;
    return Number(
      participants.find(item => item.uid === screenShareOwnerUid)?.rtcUid ||
        mapRtcUidFromUserId(screenShareOwnerUid) ||
        0,
    );
  }, [participants, screenShareOwnerRtcUid, screenShareOwnerUid]);
  const rtcConnection = useMemo(
    () =>
      roomChannel
        ? {
            channelId: roomChannel,
            localUid: myRtcUid || 0,
          }
        : undefined,
    [myRtcUid, roomChannel],
  );
  const canControlCurrentSharedDoc = useMemo(
    () =>
      !!(
        meUid &&
        currentSharedDocId &&
        activeDoc &&
        activeDoc.id === currentSharedDocId &&
        activeDoc.sharedByUid &&
        activeDoc.sharedByUid === meUid
      ),
    [activeDoc, currentSharedDocId, meUid],
  );

  const premiumCountdownLabel = useMemo(() => {
    if (!premiumMeta) return null;
    if (premiumMeta.status === 'scheduled' && premiumMeta.startsAtMs > clockNowMs) {
      return `Starts ${formatCountdown(premiumMeta.startsAtMs - clockNowMs)}`;
    }
    if (premiumMeta.endsAtMs > clockNowMs) {
      return `Ends ${formatCountdown(premiumMeta.endsAtMs - clockNowMs)}`;
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
            : `${participantTicketLabels[item.uid] || `Ticket ${String(item.uid || '').slice(-4).toUpperCase()}`}${item.muted ? ' • muted' : ''}`,
      })),
    [participantTicketLabels, participants, roomHostUid],
  );
  const premiumChatRows = useMemo(() => comments.slice(-12), [comments]);
  const raisedHandParticipants = useMemo(
    () => participants.filter(item => item.raisedHand && item.uid !== meUid),
    [meUid, participants],
  );
  const isGuestViewingSharedDoc = useMemo(
    () => !!currentSharedDocId && !canControlCurrentSharedDoc,
    [canControlCurrentSharedDoc, currentSharedDocId],
  );
  const sharedDocProgressCard = useMemo(() => {
    if (!sharedDocStatusText || activeDoc) return null;
    const stage = currentSharedDocStage || (currentSharedDocId ? 'uploading' : 'selected');
    const title = String(currentSharedDocPreviewTitle || '').trim();
    const kind = String(currentSharedDocPreviewKind || '').trim().toUpperCase();
    let detail = sharedDocStatusText;
    if (stage === 'choosing') detail = `${meUid === roomHostUid ? 'Choosing a file...' : sharedDocStatusText}`;
    if (stage === 'selected' && title) detail = `Selected ${title}${kind ? ` (${kind})` : ''}`;
    if (stage === 'uploading' && title) detail = `Uploading ${title}${kind ? ` (${kind})` : ''}`;
    if (stage === 'converting' && title) detail = `Converting ${title}${kind ? ` (${kind})` : ''}`;
    if (stage === 'ready' && title) detail = `${title} is ready to open`;
    return {
      title: title || 'Shared file',
      detail,
    };
  }, [
    activeDoc,
    currentSharedDocId,
    currentSharedDocPreviewKind,
    currentSharedDocPreviewTitle,
    currentSharedDocStage,
    meUid,
    roomHostUid,
    sharedDocStatusText,
  ]);
  const applyStrongRtcProfile = useCallback(
    (engine: any, opts?: { presentationAudioOnly?: boolean }) => {
      if (!engine) return;
      const isPremiumProfile = isPremiumRoom;
      const presentationAudioOnly = !!opts?.presentationAudioOnly;
      const videoDimensions = isPremiumProfile
        ? PREMIUM_LIVE_VIDEO_DIMENSIONS
        : DRIFT_EXPO_VIDEO_DIMENSIONS;
      const videoBitrate = isPremiumProfile
        ? PREMIUM_LIVE_VIDEO_BITRATE
        : DRIFT_EXPO_VIDEO_BITRATE;
      const videoMinBitrate = isPremiumProfile
        ? PREMIUM_LIVE_VIDEO_MIN_BITRATE
        : DRIFT_EXPO_VIDEO_MIN_BITRATE;
      const videoFrameRate = isPremiumProfile
        ? PREMIUM_LIVE_VIDEO_FRAME_RATE
        : DRIFT_EXPO_VIDEO_FRAME_RATE;
      const videoMinFrameRate = isPremiumProfile
        ? PREMIUM_LIVE_VIDEO_MIN_FRAME_RATE
        : DRIFT_EXPO_VIDEO_MIN_FRAME_RATE;
      const config = {
        dimensions: videoDimensions,
        frameRate: videoFrameRate,
        minFrameRate: videoMinFrameRate,
        bitrate: videoBitrate,
        minBitrate: videoMinBitrate,
        orientationMode: Agora?.OrientationMode?.OrientationModeAdaptive ?? 0,
        degradationPreference:
          Agora?.DegradationPreference?.MaintainBalanced ??
          Agora?.DegradationPreference?.MaintainQuality ??
          0,
      };
      const audioProfile =
        Agora?.AudioProfileType?.AudioProfileMusicHighQualityStereo ??
        Agora?.AudioProfileType?.AudioProfileMusicHighQuality ??
        Agora?.AudioProfileType?.AudioProfileDefault ??
        Agora?.AudioProfile?.MusicHighQualityStereo ??
        Agora?.AudioProfile?.MusicHighQuality ??
        Agora?.AudioProfile?.Default ??
        0;
      const audioScenario =
        (isPremiumProfile
          ? Agora?.AudioScenarioType?.AudioScenarioMeeting
          : Agora?.AudioScenarioType?.AudioScenarioChatroom) ??
        Agora?.AudioScenarioType?.AudioScenarioDefault ??
        (isPremiumProfile
          ? Agora?.AudioScenario?.Meeting
          : Agora?.AudioScenario?.Chatroom) ??
        Agora?.AudioScenario?.Default ??
        0;
      try {
        engine.setVideoEncoderConfiguration?.(config);
      } catch {}
      try {
        engine.enableDualStreamMode?.(true, {
          width: isPremiumProfile ? 480 : 360,
          height: isPremiumProfile ? 270 : 202,
          framerate: 12,
          bitrate: isPremiumProfile ? 320 : 240,
        });
      } catch {}
      try {
        engine.setRemoteSubscribeFallbackOption?.(
          Agora?.StreamFallbackOptions?.StreamFallbackOptionVideoStreamLow ?? 1,
        );
      } catch {}
      try {
        engine.setRemoteDefaultVideoStreamType?.(1);
      } catch {}
      try {
        engine.setLocalPublishFallbackOption?.(
          presentationAudioOnly
            ? Agora?.StreamFallbackOptions?.StreamFallbackOptionDisabled ?? 0
            : Agora?.StreamFallbackOptions?.StreamFallbackOptionVideoStreamLow ?? 1,
        );
      } catch {}
      try {
        engine.setAudioProfile?.(audioProfile, audioScenario);
      } catch {}
      try {
        engine.setAudioScenario?.(audioScenario);
      } catch {}
      try {
        engine.setAINSMode?.(true, Agora?.AudioAinsMode?.AINSModeAggressive ?? 2);
      } catch {}
      try {
        engine.setParameters?.('{"che.video.adaptive_bitrate":true}');
      } catch {}
      try {
        engine.setParameters?.('{"rtc.video.enable_hw_encoder":true}');
      } catch {}
      try {
        engine.setParameters?.('{"rtc.video.enable_hw_decoder":true}');
      } catch {}
      try {
        engine.setParameters?.('{"che.audio.force_bluetooth_a2dp":false}');
      } catch {}
    },
    [
      Agora?.AudioAinsMode,
      Agora?.AudioProfile,
      Agora?.AudioProfileType,
      Agora?.AudioScenario,
      Agora?.AudioScenarioType,
      Agora?.DegradationPreference,
      Agora?.OrientationMode,
      Agora?.StreamFallbackOptions,
      isPremiumRoom,
    ],
  );
  const sharedDocInkSegments = useMemo(() => {
    const segments: Array<{
      id: string;
      left: number;
      top: number;
      width: number;
      angle: string;
      color: string;
      thickness: number;
    }> = [];
    for (let index = 1; index < sharedDocInkPoints.length; index += 1) {
      const previous = sharedDocInkPoints[index - 1];
      const current = sharedDocInkPoints[index];
      const sameStroke =
        previous?.strokeId && current?.strokeId
          ? previous.strokeId === current.strokeId
          : Math.abs(previous.x - current.x) * pdfFrameWidth <= 18 &&
            Math.abs(previous.y - current.y) * pdfFrameHeight <= 18;
      if (!sameStroke) continue;
      const fromX = previous.x * pdfFrameWidth;
      const fromY = previous.y * pdfFrameHeight;
      const toX = current.x * pdfFrameWidth;
      const toY = current.y * pdfFrameHeight;
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (width < 1) continue;
      const thickness = Math.max(previous.size, current.size);
      segments.push({
        id: `${previous.id}_${current.id}`,
        left: (fromX + toX) / 2 - width / 2,
        top: (fromY + toY) / 2 - thickness / 2,
        width,
        angle: `${(Math.atan2(deltaY, deltaX) * 180) / Math.PI}deg`,
        color: current.color || previous.color || '#E11D48',
        thickness,
      });
    }
    return segments;
  }, [pdfFrameHeight, pdfFrameWidth, sharedDocInkPoints]);
  const currentSharedDocEntry = useMemo(
    () => {
      if (!currentSharedDocId) return null;
      const fromList = sharedDocs.find(doc => doc.id === currentSharedDocId) || null;
      if (fromList) return fromList;
      if (!currentSharedDocPreviewTitle && !currentSharedDocFileName) return null;
      return {
        id: currentSharedDocId,
        title: String(currentSharedDocPreviewTitle || currentSharedDocFileName || 'Shared PDF'),
        fileName: String(currentSharedDocFileName || 'shared.pdf'),
        downloadUrl: String(currentSharedDocDownloadUrl || ''),
        storagePath: String(currentSharedDocStoragePath || ''),
        fileSizeBytes: currentSharedDocFileSizeBytes,
        sharedByName: 'Host',
        createdAtMs: Date.now(),
        status: String(currentSharedDocStage || 'uploading'),
        sourceKind: currentSharedDocPreviewKind,
        errorMessage: null,
      } as SharedPdfDoc;
    },
    [
      currentSharedDocDownloadUrl,
      currentSharedDocFileName,
      currentSharedDocFileSizeBytes,
      currentSharedDocId,
      currentSharedDocPreviewKind,
      currentSharedDocPreviewTitle,
      currentSharedDocStage,
      currentSharedDocStoragePath,
      sharedDocs,
    ],
  );
  const visibleSharedDocs = useMemo(() => [], []);
  const pdfDisplayMetrics = useMemo(() => {
    const frameWidth = Math.max(0, pdfFrameWidth - 20);
    const frameHeight = Math.max(0, pdfFrameHeight - 20);
    if (!pdfPreviewWidth || !pdfPreviewHeight || !frameWidth || !frameHeight) {
      return {
        width: '100%' as const,
        height: '100%' as const,
      };
    }
    const fitScale = Math.min(frameWidth / pdfPreviewWidth, frameHeight / pdfPreviewHeight);
    const safeScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
    return {
      width: Math.max(220, Math.round(pdfPreviewWidth * safeScale * pdfZoomLevel)),
      height: Math.max(300, Math.round(pdfPreviewHeight * safeScale * pdfZoomLevel)),
    };
  }, [pdfFrameHeight, pdfFrameWidth, pdfPreviewHeight, pdfPreviewWidth, pdfZoomLevel]);
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
    setNetworkWarning(null);
    setShowComments(true);
    setShowInvitePanel(false);
    setInviteQuery('');
    setInviteResults([]);
    setOnlineInvitees([]);
    setInviteLoading(false);
    setInviteBusyUid(null);
    setShowReactionPicker(false);
    setSoundBadgeLabel(null);
    setShowDocsPanel(false);
    setSharedDocs([]);
    setSharedDocStatusText(null);
    setScreenShareActive(false);
    setScreenShareOwnerUid(null);
    setScreenShareOwnerName(null);
    setScreenShareOwnerRtcUid(0);
    setScreenShareStarting(false);
    setLocalScreenShareActive(false);
    pendingScreenShareStartRef.current = false;
    setCurrentSharedDocId(null);
    setCurrentSharedDocStage(null);
    setCurrentSharedDocPreviewTitle(null);
    setCurrentSharedDocPreviewKind(null);
    setCurrentSharedDocPage(0);
    setCurrentSharedDocSlideShow(false);
    setDocBusy(false);
    setActiveDoc(null);
    setPdfLocalPath(null);
    setPdfPageCount(0);
    setPdfPageIndex(0);
    setPdfPreviewUri(null);
    setPdfPreviewWidth(0);
    setPdfPreviewHeight(0);
    setPdfZoomLevel(1);
    setCurrentSharedDocZoom(1);
    setCurrentSharedDocPanX(0);
    setCurrentSharedDocPanY(0);
    setSharedDocInkPoints([]);
    setCurrentPresentationTool(null);
    setSharedDocMarker(null);
    setPdfFrameWidth(0);
    setPdfFrameHeight(0);
    setRecentDrifts([]);
    setReplayItem(null);
    setEngineReady(false);
    setFloatingComments([]);
    setFloatingReactions([]);
    docsPanelAutoOpenedRef.current = false;
    seenCommentIdsRef.current = new Set();
    seenReactionIdsRef.current = new Set();
    handledSoundEventIdsRef.current = new Set();
    lastAutoOpenedDocIdRef.current = null;
    activeInkPointRef.current = null;
    activeInkStrokeIdRef.current = null;
    if (reactionTrayTimerRef.current) {
      clearTimeout(reactionTrayTimerRef.current);
      reactionTrayTimerRef.current = null;
    }
    if (soundBadgeTimerRef.current) {
      clearTimeout(soundBadgeTimerRef.current);
      soundBadgeTimerRef.current = null;
    }
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
    if (viewportSyncTimerRef.current) {
      clearTimeout(viewportSyncTimerRef.current);
      viewportSyncTimerRef.current = null;
    }
    pdfPageCacheRef.current = {};
    pdfPagePrefetchingRef.current = {};
    joinedChannelRef.current = null;
    joiningChannelRef.current = null;
  }, []);

  useEffect(() => {
    Sound.setCategory('Playback');
  }, []);

  const playRoomSoundEffect = useCallback((effectId: string) => {
    const effect = LIVE_SOUND_EFFECTS.find(item => item.id === effectId);
    if (!effect) return;
    const player = new Sound(effect.file, Sound.MAIN_BUNDLE, (error: any) => {
      if (error) {
        console.log('live sound load failed', effect.label, error);
        return;
      }
      player.setVolume(1);
      player.play(() => {
        player.release();
      });
    });
    setSoundBadgeLabel(null);
  }, []);

  const triggerRoomSoundEffect = useCallback(
    async (effectId: string) => {
      if (!roomId || !meUid) return;
      const effect = LIVE_SOUND_EFFECTS.find(item => item.id === effectId);
      if (!effect) return;
      const eventId = `${effect.id}_${Date.now()}_${meUid.slice(-5)}`;
      handledSoundEventIdsRef.current.add(eventId);
      playRoomSoundEffect(effect.id);
      try {
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              lastSoundEffect: {
                eventId,
                effectId: effect.id,
                effectLabel: effect.label,
                triggeredByUid: meUid,
                triggeredByName: meName,
                createdAt: firestore.FieldValue.serverTimestamp(),
                createdAtMs: Date.now(),
              },
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } catch (error: any) {
        handledSoundEventIdsRef.current.delete(eventId);
        Alert.alert('Sound failed', String(error?.message || 'Could not trigger sound.'));
      }
    },
    [meName, meUid, playRoomSoundEffect, roomId],
  );

  const openSoundBoard = useCallback(() => {
    Alert.alert(
      'Live Sounds',
      'Choose a room sound:',
      [
        ...LIVE_SOUND_EFFECTS.map(effect => ({
          text: `${effect.icon} ${effect.label}`,
          onPress: () => {
            void triggerRoomSoundEffect(effect.id);
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, [triggerRoomSoundEffect]);

  const resolvePdfCachePath = useCallback((doc: SharedPdfDoc) => {
    const safeName = (doc.fileName || doc.id || 'shared.pdf').replace(/[^A-Za-z0-9._-]/g, '_');
    return `${RNFS.CachesDirectoryPath}/${roomId || 'live'}_${doc.id}_${safeName}`;
  }, [roomId]);

  const getPdfPageCacheKey = useCallback(
    (docId: string | null | undefined, localPath: string, pageIndex: number) =>
      `${String(docId || 'doc')}::${String(localPath || '')}::${Math.max(0, Number(pageIndex || 0))}`,
    [],
  );

  const normalizePdfUploadPath = useCallback(async (rawUri: string, fileName: string, localFilePath?: string | null) => {
    let localPath = String(localFilePath || rawUri || '').trim();
    try {
      localPath = decodeURI(localPath);
    } catch {}
    if (Platform.OS === 'android' && localPath.startsWith('file://')) {
      localPath = localPath.replace('file://', '');
    }
    if (Platform.OS === 'android' && /^content:/.test(localPath)) {
      try {
        const stats = await RNFS.stat(String(rawUri || localPath));
        const originalPath = String((stats as any)?.originalFilepath || '').trim();
        if (originalPath) {
          localPath = originalPath.startsWith('file://')
            ? originalPath.replace('file://', '')
            : originalPath;
          return localPath;
        }
      } catch {}
      const safeName = (fileName || 'shared.pdf').replace(/[^A-Za-z0-9._-]/g, '_');
      const copyDest = `${RNFS.CachesDirectoryPath}/premium_pdf_${Date.now()}_${safeName}`;
      await RNFS.copyFile(String(rawUri), copyDest);
      localPath = copyDest;
    }
    return localPath;
  }, []);

  const getSharedFileSizeBytes = useCallback(async (filePath: string | null | undefined) => {
    const normalizedPath = String(filePath || '').trim();
    if (!normalizedPath) return 0;
    try {
      const stats = await RNFS.stat(normalizedPath);
      return Math.max(0, Number((stats as any)?.size || 0));
    } catch {
      return 0;
    }
  }, []);

  const getPdfRenderSize = useCallback((sizeBytes?: number | null) => {
    const normalizedSize = Math.max(0, Number(sizeBytes || 0));
    if (normalizedSize >= VERY_LARGE_SHARED_FILE_BYTES) return 980;
    if (normalizedSize >= LARGE_SHARED_FILE_BYTES) return 1160;
    return 1440;
  }, []);

  const markSpeakerActivity = useCallback((uids: Array<number | string | null | undefined>) => {
    const normalizedUids = Array.from(
      new Set(
        uids
          .map(uid => Number(uid || 0))
          .filter(uid => Number.isFinite(uid) && uid > 0),
      ),
    );
    if (normalizedUids.length === 0) return;
    const now = Date.now();
    setRecentSpeakerAt(prev => {
      const next = { ...prev };
      normalizedUids.forEach(uid => {
        next[uid] = now;
      });
      return next;
    });
  }, []);

  const ensureSharedPdfCached = useCallback(
    async (doc: SharedPdfDoc) => {
      const localPath = resolvePdfCachePath(doc);
      const exists = await RNFS.exists(localPath);
      if (!exists) {
        const download = RNFS.downloadFile({
          fromUrl: doc.downloadUrl,
          toFile: localPath,
          background: true,
        });
        const result = await download.promise;
        if (Number(result?.statusCode || 0) >= 400) {
          throw new Error('Could not download PDF.');
        }
      }
      return localPath;
    },
    [resolvePdfCachePath],
  );

  const renderActivePdfPage = useCallback(
    async (
      localPath: string,
      pageIndex: number,
      options?: {
        docId?: string | null;
        preferCache?: boolean;
        prefetchAdjacent?: boolean;
        renderSize?: number;
      },
    ) => {
      if (!PdfRenderer?.renderPage) {
        throw new Error('PDF renderer is not available on this device.');
      }
      const normalizedPageIndex = Math.max(0, Number(pageIndex || 0));
      const cacheKey = getPdfPageCacheKey(options?.docId, localPath, normalizedPageIndex);
      const cachedPage = options?.preferCache ? pdfPageCacheRef.current[cacheKey] : null;
      const applyPage = (page: {
        uri?: string;
        pageCount?: number;
        pageIndex?: number;
        width?: number;
        height?: number;
      }) => {
        setPdfPreviewUri(String(page?.uri || ''));
        setPdfPageCount(Number(page?.pageCount || 0));
        setPdfPageIndex(Number(page?.pageIndex || normalizedPageIndex));
        setPdfPreviewWidth(Number(page?.width || 0));
        setPdfPreviewHeight(Number(page?.height || 0));
      };
      if (cachedPage) {
        applyPage(cachedPage);
        return;
      }
      const renderSize = Math.max(920, Math.min(1560, Number(options?.renderSize || 1440)));
      const page: any = await PdfRenderer.renderPage(localPath, normalizedPageIndex, renderSize);
      const normalizedPage = {
        uri: String(page?.uri || ''),
        pageCount: Number(page?.pageCount || 0),
        pageIndex: Number(page?.pageIndex || normalizedPageIndex),
        width: Number(page?.width || 0),
        height: Number(page?.height || 0),
      };
      pdfPageCacheRef.current[cacheKey] = normalizedPage;
      applyPage(normalizedPage);
      if (options?.prefetchAdjacent && options?.docId) {
        const totalPages = Math.max(0, normalizedPage.pageCount || 0);
        const neighbors = [normalizedPage.pageIndex - 1, normalizedPage.pageIndex + 1].filter(
          candidate => candidate >= 0 && candidate < totalPages,
        );
        neighbors.forEach(candidate => {
          const neighborKey = getPdfPageCacheKey(options.docId, localPath, candidate);
          if (pdfPageCacheRef.current[neighborKey] || pdfPagePrefetchingRef.current[neighborKey]) {
            return;
          }
          pdfPagePrefetchingRef.current[neighborKey] = true;
          Promise.resolve()
            .then(async () => {
               const prefetched: any = await PdfRenderer.renderPage(localPath, candidate, renderSize);
              pdfPageCacheRef.current[neighborKey] = {
                uri: String(prefetched?.uri || ''),
                pageCount: Number(prefetched?.pageCount || normalizedPage.pageCount || 0),
                pageIndex: Number(prefetched?.pageIndex || candidate),
                width: Number(prefetched?.width || normalizedPage.width || 0),
                height: Number(prefetched?.height || normalizedPage.height || 0),
              };
            })
            .catch(() => {})
            .finally(() => {
              delete pdfPagePrefetchingRef.current[neighborKey];
            });
        });
      }
    },
    [PdfRenderer, getPdfPageCacheKey],
  );

  const isBenignPdfOpenError = useCallback((error: any) => {
    const message = String(error?.message || error || '').toLowerCase();
    return (
      message.includes('not in pdf format') ||
      message.includes('corrupt') ||
      message.includes('corrupted') ||
      message.includes('file not found') ||
      message.includes('pdf file not found')
    );
  }, []);

  const openSharedPdf = useCallback(
    async (
      doc: SharedPdfDoc,
      options?: {
        silentIfPending?: boolean;
      },
    ) => {
      const normalizedSourceKind = String(doc.sourceKind || '').toLowerCase();
      if (normalizedSourceKind === 'blank') {
        setIsDocMinimized(false);
        setActiveDoc(doc);
        setPdfLocalPath(null);
        setPdfPreviewUri(null);
        setPdfPreviewWidth(1080);
        setPdfPreviewHeight(1440);
        setPdfPageCount(1);
        setPdfPageIndex(0);
        setPdfZoomLevel(currentSharedDocZoom || 1);
        return true;
      }
      if (!doc.downloadUrl) {
        if (!options?.silentIfPending) {
          Alert.alert('Not ready', 'This file is still converting to PDF.');
        }
        return false;
      }
      if (!PdfRenderer?.getPageCount || !PdfRenderer?.renderPage) {
        Alert.alert('PDF unavailable', 'This build does not include the in-app PDF viewer.');
        return false;
      }
      if (openingPdfDocIdRef.current === doc.id) {
        return false;
      }
      openingPdfDocIdRef.current = doc.id;
      setDocBusy(true);
      try {
        const localPath = await ensureSharedPdfCached(doc);
        const localBytes =
          Math.max(Number(doc.fileSizeBytes || 0), await getSharedFileSizeBytes(localPath));
        if (localBytes > MAX_SHARED_FILE_BYTES) {
          throw new Error('This file is too large to render safely on this device.');
        }
        const renderSize = getPdfRenderSize(localBytes);
        const meta = await PdfRenderer.getPageCount(localPath);
        const targetPage =
          currentSharedDocId && currentSharedDocId === doc.id
            ? Math.max(0, Math.min(currentSharedDocPage, Math.max(0, Number(meta?.pageCount || 1) - 1)))
            : 0;
        await renderActivePdfPage(localPath, targetPage, {
          docId: doc.id,
          preferCache: true,
          prefetchAdjacent: localBytes < VERY_LARGE_SHARED_FILE_BYTES,
          renderSize,
        });
        setIsDocMinimized(false);
        setActiveDoc({
          ...doc,
          sourceKind: 'pdf',
        });
        setPdfLocalPath(localPath);
        setPdfZoomLevel(1);
        setPdfPageCount(Number(meta?.pageCount || 0));
        return true;
      } catch (error: any) {
        setActiveDoc(null);
        setPdfLocalPath(null);
        setPdfPreviewUri(null);
        if (!isBenignPdfOpenError(error)) {
          Alert.alert('PDF open failed', String(error?.message || 'Could not open PDF.'));
        }
        return false;
      } finally {
        openingPdfDocIdRef.current = null;
        setDocBusy(false);
      }
    },
    [
      PdfRenderer,
      currentSharedDocId,
      currentSharedDocPage,
      ensureSharedPdfCached,
      getPdfRenderSize,
      getSharedFileSizeBytes,
      isBenignPdfOpenError,
      renderActivePdfPage,
    ],
  );

  const resetSharedDocLocalState = useCallback(() => {
    setIsDocMinimized(false);
    setActiveDoc(null);
    setPdfLocalPath(null);
    setPdfPageCount(0);
    setPdfPageIndex(0);
    setPdfPreviewUri(null);
    setPdfPreviewWidth(0);
    setPdfPreviewHeight(0);
    setPdfZoomLevel(1);
    setCurrentSharedDocId(null);
    setCurrentSharedDocStage(null);
    setCurrentSharedDocPreviewTitle(null);
    setCurrentSharedDocPreviewKind(null);
    setCurrentSharedDocPage(0);
    setCurrentSharedDocSlideShow(false);
    setCurrentSharedDocSlideSeconds(DEFAULT_PRESENTATION_SLIDE_SECONDS);
    setCurrentSharedDocZoom(1);
    setCurrentSharedDocPanX(0);
    setCurrentSharedDocPanY(0);
    setSharedDocInkPoints([]);
    setCurrentPresentationTool(null);
    setSharedDocMarker(null);
    setSharedDocStatusText(null);
  }, []);

  const clearCurrentSharedDocSession = useCallback(
    async (options?: { keepPanelOpen?: boolean; deleteCurrentDoc?: boolean }) => {
      const activeDocId = String(currentSharedDocId || '').trim();
      const shouldDeleteCurrentDoc =
        options?.deleteCurrentDoc ?? !!activeDocId;
      try {
        setDocBusy(true);
        const uploadTask = currentShareUploadTaskRef.current;
        currentShareUploadTaskRef.current = null;
        currentShareAttemptIdRef.current += 1;
        if (uploadTask && typeof uploadTask.cancel === 'function') {
          try {
            await uploadTask.cancel();
          } catch {}
        }
        openingPdfDocIdRef.current = null;
        lastAutoOpenedDocIdRef.current = null;
        if (activeDocId) {
          delete localSharedDocPathRef.current[activeDocId];
        }
        resetSharedDocLocalState();
        setShowDocsPanel(!!options?.keepPanelOpen);
        if (!roomId) return;
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: null,
              currentSharedDocStage: firestore.FieldValue.delete(),
              currentSharedDocPreviewTitle: firestore.FieldValue.delete(),
              currentSharedDocPreviewKind: firestore.FieldValue.delete(),
              currentSharedDocDownloadUrl: firestore.FieldValue.delete(),
              currentSharedDocStoragePath: firestore.FieldValue.delete(),
              currentSharedDocFileName: firestore.FieldValue.delete(),
              currentSharedDocFileSizeBytes: firestore.FieldValue.delete(),
              currentSharedDocStatusText: null,
              currentSharedDocPage: 0,
              currentSharedDocSlideShow: false,
              currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
              currentSharedDocZoom: 1,
              currentSharedDocPanX: 0,
              currentSharedDocPanY: 0,
              currentSharedDocInkPoints: [],
              currentSharedDocMarker: null,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        if (activeDocId && shouldDeleteCurrentDoc) {
          await firestore()
            .collection(`live/${roomId}/shared_docs`)
            .doc(activeDocId)
            .delete()
            .catch(() => {});
        }
      } finally {
        setDocBusy(false);
      }
    },
    [currentSharedDocId, currentSharedDocStage, resetSharedDocLocalState, roomId],
  );

  const syncScreenShareRoomState = useCallback(
    async (active: boolean, ownerRtcUid?: number) => {
      if (!roomId) return;
      await firestore()
        .collection('live')
        .doc(roomId)
        .set(
          active
            ? {
                currentScreenShareActive: true,
                currentScreenShareOwnerUid: meUid,
                currentScreenShareOwnerName: meName,
                currentScreenShareOwnerRtcUid: Number(ownerRtcUid || myRtcUid || mapRtcUidFromUserId(meUid)),
                currentScreenShareStartedAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              }
            : {
                currentScreenShareActive: false,
                currentScreenShareOwnerUid: firestore.FieldValue.delete(),
                currentScreenShareOwnerName: firestore.FieldValue.delete(),
                currentScreenShareOwnerRtcUid: firestore.FieldValue.delete(),
                currentScreenShareStartedAt: firestore.FieldValue.delete(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              },
          { merge: true },
        );
    },
    [meName, meUid, myRtcUid, roomId],
  );

  const handleLocalScreenShareReady = useCallback(() => {
    if (!pendingScreenShareStartRef.current) return;
    pendingScreenShareStartRef.current = false;
    try {
      engineRef.current?.updateChannelMediaOptions?.({
        publishCameraTrack: false,
        publishMicrophoneTrack: !micMuted,
        publishScreenCaptureVideo: true,
        publishScreenCaptureAudio: false,
        publishScreenTrack: true,
        publishSecondaryScreenTrack: false,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {}
    setScreenShareActive(true);
    setScreenShareOwnerUid(meUid);
    setScreenShareOwnerName(meName);
    setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
    setStatusText('Screen sharing is live');
    void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
  }, [meName, meUid, micMuted, myRtcUid, syncScreenShareRoomState]);

  const handleLocalScreenShareFailure = useCallback(
    (reason?: number) => {
      if (!pendingScreenShareStartRef.current && !localScreenShareActive) return;
      pendingScreenShareStartRef.current = false;
      setLocalScreenShareActive(false);
      setScreenShareActive(false);
      setScreenShareOwnerUid(null);
      setScreenShareOwnerName(null);
      setScreenShareOwnerRtcUid(0);
      setStatusText('Screen share failed');
      void syncScreenShareRoomState(false);
      Alert.alert(
        'Screen share failed',
        reason === 22
          ? 'MoMo could not start screen sharing after permission was granted. Please try again.'
          : 'MoMo could not start screen sharing on this device. Please try again.',
      );
    },
    [localScreenShareActive, syncScreenShareRoomState],
  );

  const stopScreenShare = useCallback(
    async (options?: { syncRoom?: boolean }) => {
      const engine = engineRef.current;
      try {
        engine?.stopScreenCapture?.();
      } catch {}
      try {
        engine?.stopPreview?.(Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2);
      } catch {}
      try {
        engine?.updateChannelMediaOptions?.({
          publishCameraTrack: !(!!activeDoc || cameraOff),
          publishMicrophoneTrack: !micMuted,
          publishScreenCaptureVideo: false,
          publishScreenCaptureAudio: false,
          publishScreenTrack: false,
          publishSecondaryScreenTrack: false,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      } catch {}
      setLocalScreenShareActive(false);
      pendingScreenShareStartRef.current = false;
      if (options?.syncRoom !== false && isCurrentUserScreenSharer) {
        await syncScreenShareRoomState(false).catch(() => {});
      }
      if (!activeDoc && !cameraOff) {
        try {
          engine?.enableLocalVideo?.(true);
          engine?.startPreview?.();
        } catch {}
      }
      setStatusText('Live');
    },
    [Agora?.VideoSourceType, activeDoc, cameraOff, isCurrentUserScreenSharer, micMuted, syncScreenShareRoomState],
  );

  const startScreenShare = useCallback(async () => {
    if (!isPremiumRoom || !joined) return;
    if (Platform.OS !== 'android') {
      Alert.alert('Screen sharing unavailable', 'Aqua Premium screen sharing is currently available on Android only.');
      return;
    }
    if (activeDoc || currentSharedDocId) {
      Alert.alert('Close shared file first', 'Stop the current shared file before starting screen sharing.');
      return;
    }
    if (screenShareActive && !isCurrentUserScreenSharer) {
      Alert.alert(
        'Screen already shared',
        `${screenShareOwnerName || 'Another guest'} is already sharing a screen in this Aqua Premium room.`,
      );
      return;
    }
    const engine = engineRef.current;
    if (!engine) {
      Alert.alert('Screen sharing unavailable', 'The live engine is not ready yet.');
      return;
    }
    setScreenShareStarting(true);
    try {
      pendingScreenShareStartRef.current = true;
      const projectionResult = await AgoraRtcNg?.requestAndroidScreenProjection?.();
      if (typeof projectionResult === 'string' && projectionResult.trim()) {
        try {
          const parsedProjectionResult = JSON.parse(projectionResult);
          if (typeof parsedProjectionResult?.result === 'number' && parsedProjectionResult.result < 0) {
            throw new Error(
              `Screen projection could not attach (${parsedProjectionResult.result}).`,
            );
          }
        } catch (parseError) {
          if (parseError instanceof Error) {
            throw parseError;
          }
        }
      }
      const captureResult = engine.startScreenCapture?.({
        captureAudio: false,
        captureVideo: true,
        videoParams: {
          dimensions: PREMIUM_SCREEN_SHARE_DIMENSIONS,
          frameRate: PREMIUM_SCREEN_SHARE_FRAME_RATE,
          bitrate: PREMIUM_SCREEN_SHARE_BITRATE,
        },
      });
      if (typeof captureResult === 'number' && captureResult < 0) {
        throw new Error('Screen capture could not start (' + captureResult + ').');
      }
      try {
        engine.setScreenCaptureOrientation?.(
          Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2,
          Agora?.VideoOrientation?.VideoOrientationPortrait ?? 0,
        );
      } catch {}
      try {
        engine.startPreview?.(Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2);
      } catch {}
      try {
        engine.updateChannelMediaOptions?.({
          publishCameraTrack: false,
          publishMicrophoneTrack: !micMuted,
          publishScreenCaptureVideo: true,
          publishScreenCaptureAudio: false,
          publishScreenTrack: true,
          publishSecondaryScreenTrack: false,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      } catch {}
      setLocalScreenShareActive(true);
      setScreenShareActive(true);
      setScreenShareOwnerUid(meUid);
      setScreenShareOwnerName(meName);
      setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
      void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
      setStatusText('Waiting for screen share...');
      Alert.alert(
        'Screen sharing started',
        'Open any app on your phone. Everyone in Aqua Premium will see your screen.',
      );
    } catch (error) {
      pendingScreenShareStartRef.current = false;
      try {
        engine.stopScreenCapture?.();
      } catch {}
      setLocalScreenShareActive(false);
      setScreenShareActive(false);
      setStatusText('Live');
      Alert.alert('Screen share failed', String(error?.message || 'Could not start screen sharing.'));
    } finally {
      setScreenShareStarting(false);
    }
  }, [
    Agora?.VideoOrientation,
    Agora?.VideoSourceType,
    AgoraRtcNg,
    activeDoc,
    currentSharedDocId,
    isCurrentUserScreenSharer,
    isPremiumRoom,
    joined,
    meName,
    meUid,
    micMuted,
    myRtcUid,
    screenShareActive,
    screenShareOwnerName,
    syncScreenShareRoomState,
  ]);

  const closePdfViewer = useCallback(() => {
    setIsDocMinimized(false);
    setActiveDoc(null);
    setPdfLocalPath(null);
    setPdfPageCount(0);
    setPdfPageIndex(0);
    setPdfPreviewUri(null);
    setPdfPreviewWidth(0);
    setPdfPreviewHeight(0);
    setPdfZoomLevel(1);
    setCurrentSharedDocZoom(1);
    setCurrentSharedDocPanX(0);
    setCurrentSharedDocPanY(0);
    setSharedDocInkPoints([]);
    setCurrentSharedDocSlideShow(false);
    setCurrentPresentationTool(null);
    setSharedDocMarker(null);
    if (canControlCurrentSharedDoc && activeDoc && currentSharedDocId && activeDoc.id === currentSharedDocId) {
      void clearCurrentSharedDocSession({ keepPanelOpen: true, deleteCurrentDoc: true });
    }
  }, [activeDoc, canControlCurrentSharedDoc, clearCurrentSharedDocSession, currentSharedDocId]);

  const pushSharedDocState = useCallback(
    async (next: {
      docId?: string | null;
      shareStage?: SharedDocShareStage;
      shareTitle?: string | null;
      shareKind?: string | null;
      page?: number;
      slideShow?: boolean;
      slideSeconds?: number;
      marker?: SharedDocMarker | null;
      zoom?: number;
      panX?: number;
      panY?: number;
      inkPoints?: SharedDocInkPoint[];
      statusText?: string | null;
    }) => {
      if (!roomId) return;
      const payload: Record<string, any> = {
        currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      if (typeof next.docId !== 'undefined') {
        payload.currentSharedDocId = next.docId;
      }
      if (typeof next.shareStage !== 'undefined') {
        payload.currentSharedDocStage = next.shareStage || firestore.FieldValue.delete();
      }
      if (typeof next.shareTitle !== 'undefined') {
        payload.currentSharedDocPreviewTitle = next.shareTitle || firestore.FieldValue.delete();
      }
      if (typeof next.shareKind !== 'undefined') {
        payload.currentSharedDocPreviewKind = next.shareKind || firestore.FieldValue.delete();
      }
      if (typeof next.page === 'number') {
        payload.currentSharedDocPage = Math.max(0, next.page);
      }
      if (typeof next.slideShow === 'boolean') {
        payload.currentSharedDocSlideShow = next.slideShow;
      }
      if (typeof next.slideSeconds === 'number') {
        payload.currentSharedDocSlideSeconds = Math.max(6, Math.min(20, Math.round(next.slideSeconds)));
      }
      if (typeof next.marker !== 'undefined') {
        payload.currentSharedDocMarker = next.marker
          ? {
              mode: next.marker.mode,
              x: Math.max(0, Math.min(1, next.marker.x)),
              y: Math.max(0, Math.min(1, next.marker.y)),
            }
          : firestore.FieldValue.delete();
      }
      if (typeof next.zoom === 'number') {
        payload.currentSharedDocZoom = Math.max(1, Math.min(3, Number(next.zoom)));
      }
      if (typeof next.panX === 'number') {
        payload.currentSharedDocPanX = Math.max(0, Math.min(1, Number(next.panX)));
      }
      if (typeof next.panY === 'number') {
        payload.currentSharedDocPanY = Math.max(0, Math.min(1, Number(next.panY)));
      }
      if (typeof next.inkPoints !== 'undefined') {
        payload.currentSharedDocInkPoints = Array.isArray(next.inkPoints)
          ? next.inkPoints.slice(-SHARED_DOC_MAX_INK_POINTS).map(point => ({
              id: String(point.id || `${Date.now()}`),
              x: Math.max(0, Math.min(1, Number(point.x))),
              y: Math.max(0, Math.min(1, Number(point.y))),
              size: Math.max(2, Math.min(12, Number(point.size || 4))),
              color: String(point.color || '#EF4444'),
              strokeId: point.strokeId ? String(point.strokeId) : null,
            }))
          : [];
      }
      if (typeof next.statusText !== 'undefined') {
        payload.currentSharedDocStatusText = next.statusText;
      }
      await firestore()
        .collection('live')
        .doc(roomId)
        .set(payload, { merge: true });
    },
    [roomId],
  );

  const changePdfPage = useCallback(
    async (direction: -1 | 1) => {
      if (!pdfLocalPath) return;
      const nextIndex = pdfPageIndex + direction;
      if (nextIndex < 0 || nextIndex >= pdfPageCount) return;
      if (canControlCurrentSharedDoc) {
        try {
          await pushSharedDocState({ page: nextIndex });
        } catch (error: any) {
          Alert.alert('PDF page failed', String(error?.message || 'Could not turn page.'));
        }
      } else {
        setDocBusy(true);
        try {
          await renderActivePdfPage(pdfLocalPath, nextIndex, {
            docId: activeDoc?.id || currentSharedDocId,
            preferCache: true,
            prefetchAdjacent: true,
            renderSize: getPdfRenderSize(activeDoc?.fileSizeBytes),
          });
        } catch (error: any) {
          Alert.alert('PDF page failed', String(error?.message || 'Could not turn page.'));
        } finally {
          setDocBusy(false);
        }
      }
    },
    [
      activeDoc?.id,
      canControlCurrentSharedDoc,
      currentSharedDocId,
      pdfLocalPath,
      pdfPageCount,
      pdfPageIndex,
      pushSharedDocState,
      renderActivePdfPage,
      getPdfRenderSize,
    ],
  );

  const queueSharedViewportSync = useCallback(
    (nextX: number, nextY: number, nextZoom: number = pdfZoomLevel) => {
      pendingViewportRef.current = {
        x: Math.max(0, Math.min(1, nextX)),
        y: Math.max(0, Math.min(1, nextY)),
      };
      if (viewportSyncTimerRef.current) {
        clearTimeout(viewportSyncTimerRef.current);
      }
      viewportSyncTimerRef.current = setTimeout(() => {
        viewportSyncTimerRef.current = null;
        void pushSharedDocState({
          zoom: nextZoom,
          panX: pendingViewportRef.current.x,
          panY: pendingViewportRef.current.y,
        });
      }, 90);
    },
    [pdfZoomLevel, pushSharedDocState],
  );

  const applySharedInkAtPoint = useCallback(
    (x: number, y: number) => {
      if (!canControlCurrentSharedDoc || !currentPresentationTool || pdfFrameWidth <= 0 || pdfFrameHeight <= 0) {
        return;
      }
      const normalizedX = Math.max(0, Math.min(1, x / pdfFrameWidth));
      const normalizedY = Math.max(0, Math.min(1, y / pdfFrameHeight));
      if (currentPresentationTool === 'pointer' || currentPresentationTool === 'highlight') {
        const marker: SharedDocMarker = {
          mode: currentPresentationTool,
          x: normalizedX,
          y: normalizedY,
        };
        setSharedDocMarker(marker);
        void pushSharedDocState({ marker });
        return;
      }
      if (currentPresentationTool === 'pen') {
        const lastPoint = activeInkPointRef.current;
        const strokeId =
          activeInkStrokeIdRef.current ||
          `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        activeInkStrokeIdRef.current = strokeId;
        const distancePx = lastPoint
          ? Math.sqrt(
              Math.pow((normalizedX - lastPoint.x) * pdfFrameWidth, 2) +
                Math.pow((normalizedY - lastPoint.y) * pdfFrameHeight, 2),
            )
          : 0;
        const steps = lastPoint
          ? Math.max(1, Math.ceil(distancePx / SHARED_DOC_INK_POINT_SPACING_PX))
          : 1;
        const appendedPoints: SharedDocInkPoint[] = [];
        for (let step = 1; step <= steps; step += 1) {
          const ratio = step / steps;
          const pointX = lastPoint ? lastPoint.x + (normalizedX - lastPoint.x) * ratio : normalizedX;
          const pointY = lastPoint ? lastPoint.y + (normalizedY - lastPoint.y) * ratio : normalizedY;
          appendedPoints.push({
            id: `${Date.now()}_${step}_${Math.random()}`,
            x: pointX,
            y: pointY,
            size: 4,
            color: '#E11D48',
            strokeId,
          });
        }
        const nextPoints = [...sharedDocInkPoints, ...appendedPoints].slice(-SHARED_DOC_MAX_INK_POINTS);
        activeInkPointRef.current = { x: normalizedX, y: normalizedY };
        setSharedDocInkPoints(nextPoints);
        void pushSharedDocState({ inkPoints: nextPoints });
        return;
      }
      if (currentPresentationTool === 'eraser') {
        const nextPoints = sharedDocInkPoints.filter(point => {
          const dx = (point.x - normalizedX) * pdfFrameWidth;
          const dy = (point.y - normalizedY) * pdfFrameHeight;
          return Math.sqrt(dx * dx + dy * dy) > SHARED_DOC_ERASER_RADIUS_PX;
        });
        activeInkPointRef.current = { x: normalizedX, y: normalizedY };
        setSharedDocInkPoints(nextPoints);
        void pushSharedDocState({ inkPoints: nextPoints });
      }
    },
    [
      canControlCurrentSharedDoc,
      currentPresentationTool,
      pdfFrameHeight,
      pdfFrameWidth,
      pushSharedDocState,
      sharedDocInkPoints,
    ],
  );

  useEffect(() => {
    activeInkPointRef.current = null;
    activeInkStrokeIdRef.current = null;
  }, [currentPresentationTool, currentSharedDocId]);

  const pauseSharedDocSlideShow = useCallback(() => {
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
    if (canControlCurrentSharedDoc) {
      void pushSharedDocState({ slideShow: false });
    }
  }, [canControlCurrentSharedDoc, pushSharedDocState]);

  const startSharedDocSlideShow = useCallback(() => {
    if (!canControlCurrentSharedDoc || pdfPageCount <= 1) return;
    void pushSharedDocState({ slideShow: true });
  }, [canControlCurrentSharedDoc, pdfPageCount, pushSharedDocState]);

  const togglePresentationTool = useCallback(
    (mode: Exclude<PresentationToolMode, null>) => {
      if (!canControlCurrentSharedDoc) return;
      setCurrentPresentationTool(prev => {
        const nextMode = prev === mode ? null : mode;
        if (!nextMode) {
          void pushSharedDocState({ marker: null });
        }
        return nextMode;
      });
    },
    [canControlCurrentSharedDoc, pushSharedDocState],
  );

  const placePresentationMarker = useCallback(
    (x: number, y: number) => {
      applySharedInkAtPoint(x, y);
    },
    [applySharedInkAtPoint],
  );

  const ensureParticipantPresenceForShare = useCallback(
    async (rtcUid: number) => {
      if (!roomId || !meUid) return;
      try {
        await firestore()
          .collection(`live/${roomId}/participants`)
          .doc(meUid)
          .set(
            {
              uid: meUid,
              name: meName,
              photo: mePhoto,
              rtcUid,
              isHost: !!(roomHostUid && meUid && roomHostUid === meUid),
              muted: false,
              purged: false,
              raisedHand: false,
              cameraOff: false,
              channel: roomChannel || 'premium_room',
              joinedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } catch {}
    },
    [meName, mePhoto, meUid, roomChannel, roomHostUid, roomId],
  );

  const handleShareFile = useCallback(async () => {
    if (!roomId || !isPremiumRoom) return;
    if (currentSharedDocId || currentSharedDocStage) {
      Alert.alert('File already sharing', 'Close the current shared file before sharing another one.');
      return;
    }
    if (!AudioPicker?.pickFiles) {
      Alert.alert('File picker unavailable', 'This build cannot pick PDF files yet.');
      return;
    }
    const shareAttemptId = currentShareAttemptIdRef.current + 1;
    currentShareAttemptIdRef.current = shareAttemptId;
    let createdDocId: string | null = null;
    setDocBusy(true);
    setShowDocsPanel(true);
    try {
      await firestore()
        .collection('live')
        .doc(roomId)
        .set(
          {
            currentSharedDocId: null,
            currentSharedDocStage: 'choosing',
            currentSharedDocPreviewTitle: null,
            currentSharedDocPreviewKind: null,
            currentSharedDocDownloadUrl: null,
            currentSharedDocStoragePath: null,
            currentSharedDocFileName: null,
            currentSharedDocFileSizeBytes: null,
            currentSharedDocStatusText: `${meName} is choosing a file`,
            currentSharedDocPage: 0,
            currentSharedDocSlideShow: false,
            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
            currentSharedDocZoom: 1,
            currentSharedDocPanX: 0,
            currentSharedDocPanY: 0,
            currentSharedDocInkPoints: [],
            currentSharedDocMarker: null,
            currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      const result = await AudioPicker.pickFiles();
      const pickedItems = (Array.isArray(result) ? result : result ? [result] : []) as PickedFileEntry[];
      const selectedEntry = pickedItems.find((entry: PickedFileEntry) => {
        const name = String(entry?.name || entry?.uri || '').trim();
        const type = String(entry?.type || '').trim().toLowerCase();
        return (
          type === 'application/pdf' ||
          /\.pdf$/i.test(name) ||
          /\.ppt$/i.test(name) ||
          /\.pptx$/i.test(name) ||
          /\.doc$/i.test(name) ||
          /\.docx$/i.test(name)
        );
      });
      if (!selectedEntry?.uri) {
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: null,
              currentSharedDocStage: firestore.FieldValue.delete(),
              currentSharedDocPreviewTitle: firestore.FieldValue.delete(),
              currentSharedDocPreviewKind: firestore.FieldValue.delete(),
              currentSharedDocDownloadUrl: firestore.FieldValue.delete(),
              currentSharedDocStoragePath: firestore.FieldValue.delete(),
              currentSharedDocFileName: firestore.FieldValue.delete(),
              currentSharedDocFileSizeBytes: firestore.FieldValue.delete(),
              currentSharedDocStatusText: null,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          )
          .catch(() => {});
        Alert.alert('Supported files only', 'Choose a PDF, PPT, PPTX, DOC, or DOCX file.');
        return;
      }
      const localUri = String(selectedEntry.uri);
      const fileName = String(selectedEntry.name || 'shared_file').trim() || 'shared_file';
      const isPdf = /\.pdf$/i.test(fileName) || String(selectedEntry.type || '').toLowerCase() === 'application/pdf';
      const sourceKind = /\.pptx$/i.test(fileName)
        ? 'pptx'
        : /\.ppt$/i.test(fileName)
        ? 'ppt'
        : /\.docx$/i.test(fileName)
        ? 'docx'
        : /\.doc$/i.test(fileName)
        ? 'doc'
        : 'pdf';
      const title = fileName.replace(/\.(pdf|ppt|pptx|doc|docx)$/i, '');
      const docRef = firestore().collection(`live/${roomId}/shared_docs`).doc();
      createdDocId = docRef.id;
      const pickedSizeBytes = Math.max(0, Number(selectedEntry.size || 0));
      if (pickedSizeBytes > MAX_SHARED_FILE_BYTES) {
        Alert.alert(
          'File too large',
          'This file is too large to open safely on phones. Choose a smaller file or split it first.',
        );
        return;
      }
      if (!isPdf && pickedSizeBytes > MAX_CONVERTIBLE_FILE_BYTES) {
        Alert.alert(
          'Presentation too large',
          'Large PowerPoint and Word files can crash phones during conversion. Keep presentation files under 48 MB.',
        );
        return;
      }
      const uploadPath = await normalizePdfUploadPath(localUri, fileName);
      const sourceSizeBytes = await getSharedFileSizeBytes(uploadPath);
      if (sourceSizeBytes > MAX_SHARED_FILE_BYTES) {
        Alert.alert(
          'File too large',
          'This file is too large to open safely on phones. Choose a smaller file or split it first.',
        );
        return;
      }
      if (!isPdf && sourceSizeBytes > MAX_CONVERTIBLE_FILE_BYTES) {
        Alert.alert(
          'Presentation too large',
          'Large PowerPoint and Word files can crash phones during conversion. Keep presentation files under 48 MB.',
        );
        return;
      }
      await Promise.all([
        docRef.set({
          title,
          fileName,
          downloadUrl: '',
          storagePath: '',
          sourcePath: '',
          sourceKind,
          status: 'uploading',
          sharedByUid: meUid,
          sharedByName: meName,
          fileSizeBytes: sourceSizeBytes,
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdAtMs: Date.now(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedAtMs: Date.now(),
        }),
        firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: docRef.id,
              currentSharedDocStage: 'selected',
              currentSharedDocPreviewTitle: title,
              currentSharedDocPreviewKind: sourceKind,
              currentSharedDocDownloadUrl: null,
              currentSharedDocStoragePath: null,
              currentSharedDocFileName: fileName,
              currentSharedDocFileSizeBytes: sourceSizeBytes,
              currentSharedDocStatusText: `${meName} selected ${title}`,
              currentSharedDocPage: 0,
              currentSharedDocSlideShow: false,
              currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
              currentSharedDocZoom: 1,
              currentSharedDocPanX: 0,
              currentSharedDocPanY: 0,
              currentSharedDocInkPoints: [],
              currentSharedDocMarker: null,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          ),
      ]);
      const sharedDocPayloadBase = {
        id: docRef.id,
        title,
        fileName,
        downloadUrl: '',
        storagePath: '',
        sharedByName: meName,
        createdAtMs: Date.now(),
        status: isPdf ? 'uploading' : 'converting',
        sourceKind,
        fileSizeBytes: sourceSizeBytes,
        errorMessage: null,
      } as SharedPdfDoc;
      const storagePath = isPdf
        ? `premium_docs/${roomId}/${Date.now()}_${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}`
        : `premium_presentations/${roomId}/${Date.now()}_${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}`;
      const uploadRef = storage().ref(storagePath);
      const uploadTask = uploadRef.putFile(uploadPath, {
        contentType: isPdf
          ? 'application/pdf'
          : /\.pptx$/i.test(fileName)
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : /\.ppt$/i.test(fileName)
          ? 'application/vnd.ms-powerpoint'
          : /\.docx$/i.test(fileName)
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/msword',
      });
      currentShareUploadTaskRef.current = uploadTask;
      await firestore()
        .collection('live')
        .doc(roomId)
        .set(
          {
            currentSharedDocId: docRef.id,
            currentSharedDocStage: 'uploading',
            currentSharedDocPreviewTitle: title,
            currentSharedDocPreviewKind: sourceKind,
            currentSharedDocDownloadUrl: null,
            currentSharedDocStoragePath: storagePath,
            currentSharedDocFileName: fileName,
            currentSharedDocFileSizeBytes: sourceSizeBytes,
            currentSharedDocStatusText: `${meName} is uploading ${title}`,
            currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      if (isPdf) {
        void (async () => {
          try {
            const localCachePath = resolvePdfCachePath(sharedDocPayloadBase);
            const exists = await RNFS.exists(localCachePath);
            if (!exists) {
              await RNFS.copyFile(uploadPath, localCachePath);
            }
            primedPdfDocIdsRef.current.add(sharedDocPayloadBase.id);
            const renderSize = getPdfRenderSize(sourceSizeBytes);
            const meta = await PdfRenderer?.getPageCount?.(localCachePath);
            await renderActivePdfPage(localCachePath, 0, {
              docId: sharedDocPayloadBase.id,
              preferCache: true,
              prefetchAdjacent: sourceSizeBytes < VERY_LARGE_SHARED_FILE_BYTES,
              renderSize,
            });
            setIsDocMinimized(false);
            setActiveDoc({
              ...sharedDocPayloadBase,
              sourceKind: 'pdf',
            });
            setPdfLocalPath(localCachePath);
            setPdfZoomLevel(1);
            setPdfPageCount(Number(meta?.pageCount || 0));
          } catch {}
        })();
      }
      await uploadTask;
      if (currentShareUploadTaskRef.current === uploadTask) {
        currentShareUploadTaskRef.current = null;
      }
      const downloadUrl = await uploadRef.getDownloadURL();
      const sharedDocPayload = {
        id: docRef.id,
        title,
        fileName,
        downloadUrl: isPdf ? downloadUrl : '',
        storagePath: isPdf ? storagePath : '',
        sharedByName: meName,
        createdAtMs: Date.now(),
        status: isPdf ? 'ready' : 'converting',
        sourceKind,
        fileSizeBytes: sourceSizeBytes,
        errorMessage: null,
      } as SharedPdfDoc;
      await docRef.set({
        title: sharedDocPayload.title,
        fileName,
        downloadUrl: isPdf ? downloadUrl : '',
        storagePath: isPdf ? storagePath : '',
        sourcePath: !isPdf ? storagePath : '',
        sourceKind,
        status: isPdf ? 'ready' : 'converting',
        sharedByUid: meUid,
        sharedByName: meName,
        fileSizeBytes: sourceSizeBytes,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now(),
      });
      if (isPdf) {
        try {
          const localCachePath = resolvePdfCachePath(sharedDocPayload);
          const exists = await RNFS.exists(localCachePath);
          if (!exists) {
            await RNFS.copyFile(uploadPath, localCachePath);
          }
          primedPdfDocIdsRef.current.add(sharedDocPayload.id);
          await Promise.all([
            PdfRenderer?.getPageCount?.(localCachePath),
            renderActivePdfPage(localCachePath, 0, {
              docId: sharedDocPayload.id,
              preferCache: true,
              prefetchAdjacent: sourceSizeBytes < VERY_LARGE_SHARED_FILE_BYTES,
              renderSize: getPdfRenderSize(sourceSizeBytes),
            }),
          ]);
        } catch {}
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: docRef.id,
              currentSharedDocStage: 'ready',
              currentSharedDocPreviewTitle: sharedDocPayload.title,
              currentSharedDocPreviewKind: 'pdf',
              currentSharedDocDownloadUrl: downloadUrl,
              currentSharedDocStoragePath: storagePath,
              currentSharedDocFileName: fileName,
              currentSharedDocFileSizeBytes: sourceSizeBytes,
              currentSharedDocStatusText: `${meName} shared ${sharedDocPayload.title}`,
              currentSharedDocPage: 0,
              currentSharedDocSlideShow: false,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } else {
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: docRef.id,
              currentSharedDocStage: 'converting',
              currentSharedDocPreviewTitle: sharedDocPayload.title,
              currentSharedDocPreviewKind: 'pdf',
              currentSharedDocDownloadUrl: null,
              currentSharedDocStoragePath: storagePath,
              currentSharedDocFileName: fileName,
              currentSharedDocFileSizeBytes: sourceSizeBytes,
              currentSharedDocStatusText: `${meName} is preparing ${sharedDocPayload.title}`,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        const requestConversion = functions().httpsCallable('requestPresentationConversion');
        requestConversion({
          roomId,
          docId: docRef.id,
          sourcePath: storagePath,
          fileName,
          sourceKind,
        }).catch(async (error: any) => {
          await Promise.all([
            docRef.set(
              {
                status: 'error',
                errorMessage: String(error?.message || 'Presentation conversion failed.'),
                updatedAt: firestore.FieldValue.serverTimestamp(),
                updatedAtMs: Date.now(),
              },
              { merge: true },
            ),
            firestore()
              .collection('live')
              .doc(roomId)
              .set(
                {
                  currentSharedDocId: docRef.id,
                  currentSharedDocStage: 'error',
                  currentSharedDocPreviewTitle: sharedDocPayload.title,
                  currentSharedDocPreviewKind: sourceKind,
                  currentSharedDocDownloadUrl: firestore.FieldValue.delete(),
                  currentSharedDocStoragePath: storagePath,
                  currentSharedDocFileName: fileName,
                  currentSharedDocFileSizeBytes: sourceSizeBytes,
                  currentSharedDocStatusText: `${meName}'s file could not be shared`,
                  currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              ),
          ]);
        });
      }
      setShowDocsPanel(true);
    } catch (error: any) {
      currentShareUploadTaskRef.current = null;
      if (shareAttemptId === currentShareAttemptIdRef.current && roomId) {
        await firestore()
          .collection('live')
          .doc(roomId)
          .set(
            {
              currentSharedDocId: null,
              currentSharedDocStage: firestore.FieldValue.delete(),
              currentSharedDocPreviewTitle: firestore.FieldValue.delete(),
              currentSharedDocPreviewKind: firestore.FieldValue.delete(),
              currentSharedDocDownloadUrl: firestore.FieldValue.delete(),
              currentSharedDocStoragePath: firestore.FieldValue.delete(),
              currentSharedDocFileName: firestore.FieldValue.delete(),
              currentSharedDocFileSizeBytes: firestore.FieldValue.delete(),
              currentSharedDocStatusText: null,
              currentSharedDocPage: 0,
              currentSharedDocSlideShow: false,
              currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
              currentSharedDocZoom: 1,
              currentSharedDocPanX: 0,
              currentSharedDocPanY: 0,
              currentSharedDocInkPoints: [],
              currentSharedDocMarker: null,
              currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          )
          .catch(() => {});
        if (createdDocId) {
          await firestore()
            .collection(`live/${roomId}/shared_docs`)
            .doc(createdDocId)
            .delete()
            .catch(() => {});
        }
      }
      const message = String(error?.message || error || '');
      if (!/cancel/i.test(message)) {
        Alert.alert('Share failed', message || 'Could not share the PDF.');
      }
    } finally {
      setDocBusy(false);
    }
  }, [
    AudioPicker,
    PdfRenderer,
    isPremiumRoom,
    currentSharedDocId,
    currentSharedDocStage,
    meName,
    meUid,
    normalizePdfUploadPath,
    renderActivePdfPage,
    resolvePdfCachePath,
    roomId,
    getPdfRenderSize,
    getSharedFileSizeBytes,
  ]);

  const handleShareBlankDoc = useCallback(async () => {
    if (screenShareActive) {
      Alert.alert(
        'Stop screen sharing first',
        'End the live screen share before starting the in-room file presenter.',
      );
      return;
    }
    if (!roomId || !isPremiumRoom || currentSharedDocId || currentSharedDocStage) return;
    setDocBusy(true);
    try {
      const participantRtcUid = myRtcUid || mapRtcUidFromUserId(meUid);
      await ensureParticipantPresenceForShare(participantRtcUid);
      const docRef = firestore().collection(`live/${roomId}/shared_docs`).doc();
      const title = 'Blank Page';
      await docRef.set({
        title,
        fileName: 'blank-page.pdf',
        downloadUrl: '',
        storagePath: '',
        sourceKind: 'blank',
        status: 'ready',
        sharedByUid: meUid,
        sharedByName: meName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdAtMs: Date.now(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now(),
      });
      await firestore()
        .collection('live')
        .doc(roomId)
        .set(
          {
            currentSharedDocId: docRef.id,
            currentSharedDocStage: 'ready',
            currentSharedDocPreviewTitle: title,
            currentSharedDocPreviewKind: 'blank',
            currentSharedDocPage: 0,
            currentSharedDocSlideShow: false,
            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
            currentSharedDocStatusText: `${meName} shared a blank page`,
            currentSharedDocZoom: 1,
            currentSharedDocPanX: 0,
            currentSharedDocPanY: 0,
            currentSharedDocInkPoints: [],
            currentSharedDocUpdatedAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      setShowDocsPanel(true);
    } catch (error: any) {
      Alert.alert('Blank page failed', String(error?.message || 'Could not start a blank page.'));
    } finally {
      setDocBusy(false);
    }
  }, [
    currentSharedDocId,
    currentSharedDocStage,
    ensureParticipantPresenceForShare,
    isPremiumRoom,
    meName,
    meUid,
    myRtcUid,
    roomChannel,
    roomHostUid,
    roomId,
    screenShareActive,
  ]);

  const handleCloseSharedPresentation = useCallback(async () => {
    if (!roomId) return;
    try {
      await clearCurrentSharedDocSession({ keepPanelOpen: true, deleteCurrentDoc: false });
    } catch (error: any) {
      Alert.alert('Could not close shared file', String(error?.message || 'Try again.'));
    }
  }, [clearCurrentSharedDocSession, roomId]);

  const autoOpenSharedPdf = useCallback(
    async (docId: string | null | undefined) => {
      const normalizedDocId = String(docId || '').trim();
      if (!normalizedDocId) return;
      if (lastAutoOpenedDocIdRef.current === normalizedDocId) return;
      let targetDoc =
        (currentSharedDocEntry && currentSharedDocEntry.id === normalizedDocId
          ? currentSharedDocEntry
          : null) ||
        sharedDocs.find(item => item.id === normalizedDocId) ||
        null;
      if (!targetDoc && roomId) {
        try {
          const snap = await firestore()
            .collection(`live/${roomId}/shared_docs`)
            .doc(normalizedDocId)
            .get();
          if (snap.exists) {
            const data = snap.data() || {};
            targetDoc = {
              id: snap.id,
              title: String(data.title || data.fileName || 'Shared PDF'),
              fileName: String(data.fileName || 'shared.pdf'),
              downloadUrl: String(data.downloadUrl || ''),
              storagePath: String(data.storagePath || ''),
              fileSizeBytes: Math.max(0, Number(data.fileSizeBytes || 0)) || null,
              sharedByUid: data.sharedByUid ? String(data.sharedByUid) : null,
              sharedByName: String(data.sharedByName || 'Host'),
              createdAtMs: Number(data.createdAtMs || 0) || Date.now(),
              status: String(data.status || 'ready'),
              sourceKind: data.sourceKind ? String(data.sourceKind) : null,
              errorMessage: data.errorMessage ? String(data.errorMessage) : null,
            } as SharedPdfDoc;
          }
        } catch {}
      }
      if (!targetDoc) return;
      const opened = await openSharedPdf(targetDoc, { silentIfPending: true });
      if (!opened) {
        setShowDocsPanel(true);
        return;
      }
      lastAutoOpenedDocIdRef.current = normalizedDocId;
      setShowDocsPanel(false);
    },
    [currentSharedDocEntry, openSharedPdf, roomId, sharedDocs],
  );

  const cleanupEngine = useCallback(async () => {
    if (localScreenShareActive) {
      try {
        await stopScreenShare({ syncRoom: false });
      } catch {}
    }
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
              status: 'live',
              hostDisconnectedAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        } catch {}
      } else if (screenShareOwnerUid === meUid) {
        try {
          await firestore().collection('live').doc(roomRef.current.id).set(
            {
              currentScreenShareActive: false,
              currentScreenShareOwnerUid: firestore.FieldValue.delete(),
              currentScreenShareOwnerName: firestore.FieldValue.delete(),
              currentScreenShareOwnerRtcUid: firestore.FieldValue.delete(),
              currentScreenShareStartedAt: firestore.FieldValue.delete(),
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
  }, [localScreenShareActive, meUid, myRtcUid, roomHostUid, screenShareOwnerUid, stopScreenShare]);

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

  const minimizePdfViewer = useCallback(() => {
    if (!activeDoc) return;
    setIsDocMinimized(true);
  }, [activeDoc]);

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
              muted: false,
              purged: false,
              raisedHand: false,
              cameraOff: false,
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

  const updateMyParticipantState = useCallback(
    async (patch: Record<string, any>) => {
      if (!roomId || !meUid) return;
      try {
        await firestore()
          .doc(`live/${roomId}/participants/${meUid}`)
          .set(
            {
              ...patch,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      } catch {}
    },
    [meUid, roomId],
  );

  const toggleRaisedHand = useCallback(async () => {
    const next = !handRaised;
    setHandRaised(next);
    await updateMyParticipantState({ raisedHand: next });
  }, [handRaised, updateMyParticipantState]);

  const hydrateRoom = useCallback(
    async (liveId: string) => {
      const snap = await firestore().collection('live').doc(liveId).get();
      const data = snap?.data?.() || {};
      const premiumRequired = !!data.premiumRequired;
      const nextPremiumShowId = data.premiumShowId ? String(data.premiumShowId) : null;
      const nextHostUid = String(data.hostUid || '');
      const skipPremiumValidation =
        inviteJoinPreset?.skipPremiumValidation ||
        (nextPremiumShowId &&
          premiumValidationBypassShowIdRef.current === nextPremiumShowId);
      if (premiumRequired && nextPremiumShowId && !skipPremiumValidation) {
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
      setRemoteUids([]);
      firestore()
        .collection(`live/${liveId}/participants`)
        .limit(12)
        .get()
        .then(participantSnap => {
          const seededRemoteUids = (participantSnap?.docs || [])
            .map((doc: any) => Number((doc.data() || {}).rtcUid || 0))
            .filter((rtcUid: number) => Number.isFinite(rtcUid) && rtcUid > 0 && rtcUid !== uid);
          setRemoteUids(Array.from(new Set(seededRemoteUids)));
        })
        .catch(() => {
          setRemoteUids([]);
        });
      joinedChannelRef.current = null;
      joiningChannelRef.current = null;
      if (nextPremiumShowId && premiumValidationBypassShowIdRef.current === nextPremiumShowId) {
        premiumValidationBypassShowIdRef.current = null;
      }
      setStatusText('Joining room');
    },
    [
      defaultChannel,
      inviteJoinPreset?.fromName,
      inviteJoinPreset?.skipPremiumValidation,
      inviteJoinPreset?.title,
      meUid,
    ],
  );

  useEffect(() => {
    if (!visible || !pendingPremiumJoin?.showId || !pendingPremiumJoin.liveId || !meUid) return;
    const accessRef = firestore().doc(`users/${meUid}/premium_access/${pendingPremiumJoin.showId}`);
    const unsub = accessRef.onSnapshot(snap => {
      const data = snap?.data?.() || {};
      if (!snap.exists) return;
      if (String(data.status || 'active') !== 'active') return;
      setStatusText('Access granted');
      premiumValidationBypassShowIdRef.current = String(pendingPremiumJoin.showId);
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
    if (!visible || !resolvedPremiumShowId) return;
    setClockNowMs(Date.now());
    const timer = setInterval(() => {
      setClockNowMs(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [resolvedPremiumShowId, visible]);

  useEffect(() => {
    if (!visible || !resolvedPremiumShowId) {
      setPremiumMeta(null);
      return;
    }
    const unsub = firestore()
      .collection('premium_shows')
      .doc(resolvedPremiumShowId)
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
  }, [resolvedPremiumShowId, visible]);

  useEffect(() => {
    if (!visible || !resolvedPremiumShowId || inviteJoinPreset?.liveId || roomId) return;
    let cancelled = false;
    (async () => {
      try {
        const premiumSnap = await firestore()
          .collection('premium_shows')
          .doc(resolvedPremiumShowId)
          .get();
        if (cancelled) return;
        const premiumData = premiumSnap?.data?.() || {};
        const premiumHostUid = String(premiumData.hostUid || '').trim();
        if (premiumHostUid && premiumHostUid === meUid) {
          return;
        }
        const liveSnap = await firestore()
          .collection('live')
          .where('premiumShowId', '==', resolvedPremiumShowId)
          .limit(8)
          .get();
        if (cancelled) return;
        const liveRows = (liveSnap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            liveId: doc.id,
            status: String(data.status || '').toLowerCase(),
            updatedAtMs:
              toMillis(data.updatedAt) || toMillis(data.createdAt) || Date.now(),
          };
        });
        const activeLive =
          liveRows.find(item => item.status === 'live') ||
          liveRows
            .filter(item => item.status !== 'ended' && item.status !== 'cancelled')
            .sort((a, b) => b.updatedAtMs - a.updatedAtMs)[0] ||
          null;
        if (activeLive?.liveId) {
          await hydrateRoom(activeLive.liveId);
        } else {
          setStatusText('Waiting for the host to open Aqua Premium.');
        }
      } catch (error: any) {
        if (!cancelled) {
          setStatusText(String(error?.message || 'Could not find the Aqua Premium room.'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateRoom, inviteJoinPreset?.liveId, meUid, resolvedPremiumShowId, roomId, visible]);

  useEffect(() => {
    if (!visible || !resolvedPremiumShowId) {
      setParticipantTicketLabels({});
      return;
    }
    const unsub = firestore()
      .collection(`premium_shows/${resolvedPremiumShowId}/tickets`)
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
  }, [resolvedPremiumShowId, visible]);

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
          engine.setDefaultAudioRouteToSpeakerphone?.(true);
          engine.setEnableSpeakerphone?.(true);
          engine.setDefaultMuteAllRemoteAudioStreams?.(false);
          engine.setDefaultMuteAllRemoteVideoStreams?.(false);
          engine.adjustPlaybackSignalVolume?.(100);
          engine.adjustRecordingSignalVolume?.(100);
          engine.enableAudioVolumeIndication?.(300, 3, false);
          engine.enableLocalVideo?.(true);
          engine.setClientRole?.(broadcasterRole);
          applyStrongRtcProfile(engine);
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
            onFirstLocalVideoFrame: (source: number) => {
              const screenSource = Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2;
              if (Number(source) !== Number(screenSource)) return;
              handleLocalScreenShareReady();
            },
            onLocalVideoStateChanged: (source: number, state: number, reason: number) => {
              const screenSource = Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2;
              if (Number(source) !== Number(screenSource)) return;
              if (Number(state) === 1 || Number(state) === 2) {
                handleLocalScreenShareReady();
                return;
              }
              if (Number(state) === 3) {
                handleLocalScreenShareFailure(Number(reason));
              }
            },
            onUserJoined: (connection: any, uid: number) => {
              const next = Number(uid);
              if (!Number.isFinite(next) || next <= 0) return;
              if (connection?.localUid) {
                setMyRtcUid(prev => prev || Number(connection.localUid) || 0);
              }
              try {
                engineRef.current?.muteRemoteAudioStream?.(next, false);
                engineRef.current?.muteRemoteVideoStream?.(next, false);
                (engineRef.current as any)?.subscribeRemoteAudioStream?.(next, true);
                (engineRef.current as any)?.subscribeRemoteVideoStream?.(next, true);
                engineRef.current?.setRemoteVideoStreamType?.(next, 0);
                // Also subscribe to screen share stream if this user is screen sharing
                try {
                  (engineRef.current as any)?.subscribeRemoteVideoStream?.(next, true);
                  engineRef.current?.setRemoteVideoStreamType?.(next, 0);
                } catch {}
              } catch {}
              setRemoteUids(prev => (prev.includes(next) ? prev : [...prev, next]));
            },
            onUserOffline: (_conn: any, uid: number) => {
              const next = Number(uid);
              setRemoteUids(prev => prev.filter(item => item !== next));
            },
            onNetworkQuality: (_conn: any, _uid: number, txQuality: number, rxQuality: number) => {
              const worstQuality = Math.max(Number(txQuality), Number(rxQuality));
              if (worstQuality >= 5) {
                setNetworkWarning('Your network is poor to support livestreaming.');
              } else if (worstQuality <= 3) {
                setNetworkWarning(null);
              }
              if (worstQuality >= 4) {
                setStatusText('Connection is unstable. Keeping audio on.');
              }
            },
            onRemoteVideoStateChanged: (_conn: any, remoteUid: number, state: number, reason: number) => {
              if (Number(state) === 3 || Number(state) === 4) {
                try {
                  engineRef.current?.setRemoteVideoStreamType?.(Number(remoteUid), 0);
                  (engineRef.current as any)?.subscribeRemoteVideoStream?.(Number(remoteUid), true);
                } catch {}
                setStatusText(
                  Number(reason) === 1 ? 'Video is recovering from network strain.' : 'Refreshing remote video...',
                );
              } else if (Number(state) === 2) {
                setStatusText('Live');
              }
            },
            onRemoteAudioStateChanged: (_conn: any, _remoteUid: number, state: number) => {
              if (Number(state) === 3 || Number(state) === 4) {
                setStatusText('Audio is recovering...');
              }
            },
            onAudioVolumeIndication: (_conn: any, speakers: any[]) => {
              const activeUids = Array.isArray(speakers)
                ? speakers
                    .filter(item => Number(item?.volume || 0) >= 8)
                    .map(item => Number(item?.uid || 0))
                : [];
              markSpeakerActivity(activeUids);
            },
            onConnectionStateChanged: (_connection: any, state: number) => {
              const next = Number(state);
              if (next === 2) {
                setNetworkWarning(null);
                setStatusText('Live');
              } else if (next === 3 || next === 4) {
                setStatusText('Reconnecting video...');
              }
            },
            onError: (err: number) => {
              if (Number(err) === 1052) {
                return;
              }
              setStatusText(`Agora error ${err}`);
            },
          });
          engineRef.current = engine;
          if (!cancelled) setEngineReady(true);
        } else if (Agora?.RtcEngine && typeof Agora.RtcEngine.create === 'function') {
          const engine = await Agora.RtcEngine.create(appId);
          engine.enableVideo?.();
          engine.enableAudio?.();
          engine.setDefaultAudioRouteToSpeakerphone?.(true);
          engine.setEnableSpeakerphone?.(true);
          engine.adjustPlaybackSignalVolume?.(100);
          engine.adjustRecordingSignalVolume?.(100);
          engine.enableAudioVolumeIndication?.(300, 3, false);
          engine.enableLocalVideo?.(true);
          engine.startPreview?.();
          applyStrongRtcProfile(engine);
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
          engine.addListener?.('FirstLocalVideoFrame', (source: number) => {
            const screenSource = Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2;
            if (Number(source) !== Number(screenSource)) return;
            if (!pendingScreenShareStartRef.current) return;
            pendingScreenShareStartRef.current = false;
            setScreenShareActive(true);
            setScreenShareOwnerUid(meUid);
            setScreenShareOwnerName(meName);
            setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
            setStatusText('Screen sharing is live');
            handleLocalScreenShareReady();
          });
          engine.addListener?.('LocalVideoStateChanged', (source: number, state: number, reason: number) => {
            const screenSource = Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2;
            if (Number(source) !== Number(screenSource)) return;
            if (Number(state) === 1 || Number(state) === 2) {
              handleLocalScreenShareReady();
              return;
            }
            if (Number(state) === 3) {
              handleLocalScreenShareFailure(Number(reason));
            }
          });
          engine.addListener?.('UserJoined', (uid: number) => {
            const next = Number(uid);
            if (!Number.isFinite(next) || next <= 0) return;
            try {
              engineRef.current?.muteRemoteAudioStream?.(next, false);
              engineRef.current?.muteRemoteVideoStream?.(next, false);
              engineRef.current?.setRemoteVideoStreamType?.(next, 0);
            } catch {}
            setRemoteUids(prev => (prev.includes(next) ? prev : [...prev, next]));
          });
          engine.addListener?.('UserOffline', (uid: number) => {
            const next = Number(uid);
            setRemoteUids(prev => prev.filter(item => item !== next));
          });
          engine.addListener?.('NetworkQuality', (_uid: number, txQuality: number, rxQuality: number) => {
            const worstQuality = Math.max(Number(txQuality), Number(rxQuality));
            if (worstQuality >= 5) {
              setNetworkWarning('Your network is poor to support livestreaming.');
            } else if (worstQuality <= 3) {
              setNetworkWarning(null);
            }
            if (worstQuality >= 4) {
              setStatusText('Connection is unstable. Keeping audio on.');
            }
          });
          engine.addListener?.('RemoteVideoStateChanged', (uid: number, state: number, reason: number) => {
            if (Number(state) === 3 || Number(state) === 4) {
              try {
                engineRef.current?.setRemoteVideoStreamType?.(Number(uid), 0);
                (engineRef.current as any)?.subscribeRemoteVideoStream?.(Number(uid), true);
              } catch {}
              setStatusText(
                Number(reason) === 1 ? 'Video is recovering from network strain.' : 'Refreshing remote video...',
              );
            } else if (Number(state) === 2) {
              setStatusText('Live');
            }
          });
          engine.addListener?.('RemoteAudioStateChanged', (_uid: number, state: number) => {
            if (Number(state) === 3 || Number(state) === 4) {
              setStatusText('Audio is recovering...');
            }
          });
          engine.addListener?.('AudioVolumeIndication', (speakers: any[]) => {
            const activeUids = Array.isArray(speakers)
              ? speakers
                  .filter(item => Number(item?.volume || 0) >= 8)
                  .map(item => Number(item?.uid || 0))
              : [];
            markSpeakerActivity(activeUids);
          });
          engine.addListener?.('ConnectionStateChanged', (state: number) => {
            const next = Number(state);
            if (next === 2) {
              setStatusText('Live');
            } else if (next === 3 || next === 4) {
              setStatusText('Reconnecting video...');
            }
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
  }, [Agora, appId, applyStrongRtcProfile, ensurePermissions, markSpeakerActivity, myRtcUid, roomChannel, visible]);

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
          engine.startPreview?.();
          applyStrongRtcProfile(engine);
          engine.updateChannelMediaOptions?.(mediaOptions);
          await engine.joinChannel(null, roomChannel, myRtcUid, mediaOptions);
          engine.muteAllRemoteAudioStreams?.(false);
        } else {
          engine.enableLocalVideo?.(true);
          engine.startPreview?.();
          applyStrongRtcProfile(engine);
          await engine.joinChannel(null, roomChannel, myRtcUid);
          engine.muteAllRemoteAudioStreams?.(false);
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
  }, [Agora, applyStrongRtcProfile, meUid, myRtcUid, roomChannel, roomHostUid, roomId, roomPremiumShowId, upsertParticipant, visible]);

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
        if (nextStatus === 'ended') {
          setScreenShareActive(false);
          setScreenShareOwnerUid(null);
          setScreenShareOwnerName(null);
          setScreenShareOwnerRtcUid(0);
          setLocalScreenShareActive(false);
          pendingScreenShareStartRef.current = false;
        }
        if (data.channel) {
          setRoomChannel(
            String(data.channel).trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64),
          );
        }
        setRoomPremiumShowId(data.premiumShowId ? String(data.premiumShowId) : null);
        const currentSharedDocIdValue = String(data.currentSharedDocId || '').trim();
        setCurrentSharedDocId(currentSharedDocIdValue || null);
        const nextSharedDocStage = String(data.currentSharedDocStage || '').trim().toLowerCase();
        setCurrentSharedDocStage(
          nextSharedDocStage === 'choosing' ||
            nextSharedDocStage === 'selected' ||
            nextSharedDocStage === 'uploading' ||
            nextSharedDocStage === 'converting' ||
            nextSharedDocStage === 'ready' ||
            nextSharedDocStage === 'error'
            ? (nextSharedDocStage as SharedDocShareStage)
            : null,
        );
        if (
          isPremiumRoom &&
          ((currentSharedDocIdValue &&
          (nextSharedDocStage === 'selected' ||
            nextSharedDocStage === 'uploading' ||
            nextSharedDocStage === 'converting' ||
            nextSharedDocStage === 'ready' ||
            nextSharedDocStage === 'error')) ||
            nextSharedDocStage === 'choosing')
        ) {
          docsPanelAutoOpenedRef.current = true;
          setShowDocsPanel(true);
        } else if (
          isPremiumRoom &&
          !currentSharedDocIdValue &&
          !nextSharedDocStage &&
          docsPanelAutoOpenedRef.current
        ) {
          docsPanelAutoOpenedRef.current = false;
          setShowDocsPanel(false);
        }
        setCurrentSharedDocPreviewTitle(
          data.currentSharedDocPreviewTitle
            ? String(data.currentSharedDocPreviewTitle)
            : null,
        );
        setCurrentSharedDocPreviewKind(
          data.currentSharedDocPreviewKind
            ? String(data.currentSharedDocPreviewKind)
            : null,
        );
        setCurrentSharedDocDownloadUrl(
          data.currentSharedDocDownloadUrl
            ? String(data.currentSharedDocDownloadUrl)
            : null,
        );
        setCurrentSharedDocStoragePath(
          data.currentSharedDocStoragePath
            ? String(data.currentSharedDocStoragePath)
            : null,
        );
        setCurrentSharedDocFileName(
          data.currentSharedDocFileName
            ? String(data.currentSharedDocFileName)
            : null,
        );
        setCurrentSharedDocFileSizeBytes(
          Math.max(0, Number(data.currentSharedDocFileSizeBytes || 0)) || null,
        );
        setScreenShareActive(!!data.currentScreenShareActive);
        setScreenShareOwnerUid(
          data.currentScreenShareOwnerUid ? String(data.currentScreenShareOwnerUid) : null,
        );
        setScreenShareOwnerName(
          data.currentScreenShareOwnerName ? String(data.currentScreenShareOwnerName) : null,
        );
        setScreenShareOwnerRtcUid(
          Math.max(0, Number(data.currentScreenShareOwnerRtcUid || 0)),
        );
        setCurrentSharedDocPage(Math.max(0, Number(data.currentSharedDocPage || 0)));
        setCurrentSharedDocSlideShow(!!data.currentSharedDocSlideShow);
        setCurrentSharedDocZoom(
          Math.max(1, Math.min(3, Number(data.currentSharedDocZoom || 1))),
        );
        setCurrentSharedDocPanX(
          Math.max(0, Math.min(1, Number(data.currentSharedDocPanX || 0))),
        );
        setCurrentSharedDocPanY(
          Math.max(0, Math.min(1, Number(data.currentSharedDocPanY || 0))),
        );
        setSharedDocStatusText(
          data.currentSharedDocStatusText ? String(data.currentSharedDocStatusText) : null,
        );
        setCurrentSharedDocSlideSeconds(
          Math.max(
            6,
            Math.min(
              20,
              Number(data.currentSharedDocSlideSeconds || DEFAULT_PRESENTATION_SLIDE_SECONDS),
            ),
          ),
        );
        const markerData =
          data.currentSharedDocMarker && typeof data.currentSharedDocMarker === 'object'
            ? data.currentSharedDocMarker
            : null;
        if (
          markerData &&
          (markerData.mode === 'pointer' || markerData.mode === 'highlight')
        ) {
          setSharedDocMarker({
            mode: markerData.mode,
            x: Math.max(0, Math.min(1, Number(markerData.x || 0))),
            y: Math.max(0, Math.min(1, Number(markerData.y || 0))),
          });
        } else {
          setSharedDocMarker(null);
        }
        const inkPoints = Array.isArray(data.currentSharedDocInkPoints)
          ? data.currentSharedDocInkPoints
              .map((point: any) => ({
                id: String(point?.id || `${Date.now()}`),
                x: Math.max(0, Math.min(1, Number(point?.x || 0))),
                y: Math.max(0, Math.min(1, Number(point?.y || 0))),
                size: Math.max(2, Math.min(12, Number(point?.size || 4))),
                color: String(point?.color || '#EF4444'),
                strokeId: point?.strokeId ? String(point.strokeId) : undefined,
              }))
              .slice(-SHARED_DOC_MAX_INK_POINTS)
          : [];
        setSharedDocInkPoints(inkPoints);
        const previewKind = String(data.currentSharedDocPreviewKind || '').trim().toLowerCase();
        if (currentSharedDocIdValue && (nextSharedDocStage === 'ready' || previewKind === 'blank')) {
          setTimeout(() => {
            autoOpenSharedPdf(currentSharedDocIdValue).catch(() => {});
          }, 0);
        }
        const soundEvent =
          data.lastSoundEffect && typeof data.lastSoundEffect === 'object'
            ? data.lastSoundEffect
            : null;
        const soundEventId = String(soundEvent?.eventId || '').trim();
        const soundEffectId = String(soundEvent?.effectId || '').trim();
        if (
          soundEventId &&
          soundEffectId &&
          !handledSoundEventIdsRef.current.has(soundEventId)
        ) {
          handledSoundEventIdsRef.current.add(soundEventId);
          playRoomSoundEffect(soundEffectId);
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
            muted: !!data.muted,
            purged: !!data.purged,
            raisedHand: !!data.raisedHand,
            cameraOff: !!data.cameraOff,
          } as ParticipantRow;
        });
        setParticipants(rows);
        const meRow = rows.find(item => item.uid === meUid);
        if (meRow?.purged && !meRow.isHost) {
          Alert.alert('Removed by host', 'The host removed you from this Aqua Premium room.');
          onClose();
          return;
        }
        if (meRow) {
          setHandRaised(!!meRow.raisedHand);
        }
        if (meRow && !meRow.isHost) {
          const shouldMute = !!meRow.muted;
          setMicMuted(shouldMute);
          try {
            engineRef.current?.muteLocalAudioStream?.(shouldMute);
          } catch {}
        }
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
    const unsubSharedDocs = firestore()
      .collection(`live/${roomId}/shared_docs`)
      .orderBy('createdAt', 'desc')
      .limit(24)
      .onSnapshot(snap => {
        const rows = (snap?.docs || []).map(doc => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            title: String(data.title || data.fileName || 'Shared PDF'),
            fileName: String(data.fileName || 'shared.pdf'),
            downloadUrl: String(data.downloadUrl || ''),
            storagePath: String(data.storagePath || ''),
            fileSizeBytes: Math.max(0, Number(data.fileSizeBytes || 0)) || null,
            sharedByUid: data.sharedByUid ? String(data.sharedByUid) : null,
            sharedByName: String(data.sharedByName || 'Host'),
            createdAtMs: toMillis(data.createdAt) || Number(data.createdAtMs || 0) || 0,
            status: String(data.status || 'ready'),
            sourceKind: data.sourceKind ? String(data.sourceKind) : null,
            errorMessage: data.errorMessage ? String(data.errorMessage) : null,
          } as SharedPdfDoc;
        });
        setSharedDocs(rows);
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
      try {
        unsubSharedDocs();
      } catch {}
    };
  }, [autoOpenSharedPdf, isPremiumRoom, meUid, playRoomSoundEffect, roomHostUid, roomId, visible]);

  useEffect(() => {
    if (!currentSharedDocId || sharedDocs.length === 0) return;
    const currentDoc = sharedDocs.find(item => item.id === currentSharedDocId);
    if (!currentDoc) return;
    const sourceKind = String(currentDoc.sourceKind || '').toLowerCase();
    if (currentDoc.status !== 'ready' && sourceKind !== 'blank') return;
    autoOpenSharedPdf(currentSharedDocId).catch(() => {});
  }, [autoOpenSharedPdf, currentSharedDocId, sharedDocs]);

  useEffect(() => {
    if (!isPremiumRoom) return;
    if (!currentSharedDocId && !currentSharedDocStage) {
      if (showDocsPanel && docsPanelAutoOpenedRef.current) {
        docsPanelAutoOpenedRef.current = false;
        setShowDocsPanel(false);
      }
      return;
    }
    if (showDocsPanel) return;
    if (
      ((currentSharedDocId &&
      (currentSharedDocStage === 'selected' ||
        currentSharedDocStage === 'uploading' ||
        currentSharedDocStage === 'converting' ||
        currentSharedDocStage === 'ready' ||
        currentSharedDocStage === 'error')) ||
        currentSharedDocStage === 'choosing')
    ) {
      docsPanelAutoOpenedRef.current = true;
      setShowDocsPanel(true);
    }
  }, [currentSharedDocId, currentSharedDocStage, isPremiumRoom, showDocsPanel]);

  useEffect(() => {
    if (currentSharedDocId) return;
    if (!activeDoc) return;
    setIsDocMinimized(false);
    setActiveDoc(null);
    setPdfLocalPath(null);
    setPdfPageCount(0);
    setPdfPageIndex(0);
    setPdfPreviewUri(null);
    setPdfPreviewWidth(0);
    setPdfPreviewHeight(0);
    setPdfZoomLevel(1);
    setCurrentSharedDocZoom(1);
    setCurrentSharedDocPanX(0);
    setCurrentSharedDocPanY(0);
    setSharedDocInkPoints([]);
    setCurrentSharedDocSlideShow(false);
    setCurrentPresentationTool(null);
    setSharedDocMarker(null);
    lastAutoOpenedDocIdRef.current = null;
  }, [activeDoc, currentSharedDocId]);

  useEffect(() => {
    if (!activeDoc || !pdfLocalPath) return;
    if (!currentSharedDocId || activeDoc.id !== currentSharedDocId) return;
    if (pdfPageIndex === currentSharedDocPage) return;
    setDocBusy(true);
    renderActivePdfPage(pdfLocalPath, currentSharedDocPage, {
      docId: activeDoc.id,
      preferCache: true,
      prefetchAdjacent: true,
      renderSize: getPdfRenderSize(activeDoc.fileSizeBytes),
    })
      .catch(() => {})
      .finally(() => {
        setDocBusy(false);
      });
  }, [
    activeDoc,
    currentSharedDocId,
    currentSharedDocPage,
    pdfLocalPath,
    pdfPageIndex,
    renderActivePdfPage,
    getPdfRenderSize,
  ]);

  useEffect(() => {
    if (!activeDoc || activeDoc.id !== currentSharedDocId) return;
    if (Math.abs(pdfZoomLevel - currentSharedDocZoom) < 0.01) return;
    setPdfZoomLevel(currentSharedDocZoom);
  }, [activeDoc, currentSharedDocId, currentSharedDocZoom, pdfZoomLevel]);

  useEffect(() => {
    if (!activeDoc || activeDoc.id !== currentSharedDocId) return;
    const previewWidth = typeof pdfDisplayMetrics.width === 'number' ? pdfDisplayMetrics.width : pdfFrameWidth;
    const previewHeight = typeof pdfDisplayMetrics.height === 'number' ? pdfDisplayMetrics.height : pdfFrameHeight;
    const maxX = Math.max(0, previewWidth - pdfFrameWidth);
    const maxY = Math.max(0, previewHeight - pdfFrameHeight);
    const targetX = maxX * currentSharedDocPanX;
    const targetY = maxY * currentSharedDocPanY;
    try {
      pdfHorizontalScrollRef.current?.scrollTo({ x: targetX, animated: false });
      pdfVerticalScrollRef.current?.scrollTo({ y: targetY, animated: false });
    } catch {}
  }, [
    activeDoc,
    currentSharedDocId,
    currentSharedDocPanX,
    currentSharedDocPanY,
    pdfDisplayMetrics.height,
    pdfDisplayMetrics.width,
    pdfFrameHeight,
    pdfFrameWidth,
  ]);

  useEffect(() => {
    if (!isPremiumRoom) return;
    setShowInvitePanel(false);
    setShowReactionPicker(false);
    setShowComments(false);
  }, [isPremiumRoom]);

  useEffect(() => {
    if (!sharedDocStatusText || !!activeDoc) {
      docsStatusPulseAnim.stopAnimation();
      docsStatusPulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(docsStatusPulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: false,
        }),
        Animated.timing(docsStatusPulseAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      docsStatusPulseAnim.stopAnimation();
      docsStatusPulseAnim.setValue(0);
    };
  }, [activeDoc, docsStatusPulseAnim, sharedDocStatusText]);

  useEffect(() => {
    const shouldHideCamera = !!activeDoc || !!localScreenShareActive;
    try {
      engineRef.current?.muteLocalVideoStream?.(shouldHideCamera || cameraOff);
      engineRef.current?.enableLocalVideo?.(!(shouldHideCamera || cameraOff));
    } catch {}
  }, [activeDoc, cameraOff, localScreenShareActive]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !joined) return;
    applyStrongRtcProfile(engine, { presentationAudioOnly: !!activeDoc });
  }, [
    activeDoc,
    applyStrongRtcProfile,
    joined,
  ]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !joined) return;
    try {
      engine.updateChannelMediaOptions?.({
        publishCameraTrack: !(!!activeDoc || cameraOff || localScreenShareActive),
        publishMicrophoneTrack: !micMuted,
        publishScreenCaptureVideo: !!localScreenShareActive,
        publishScreenCaptureAudio: false,
        publishScreenTrack: !!localScreenShareActive,
        publishSecondaryScreenTrack: false,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {}
  }, [activeDoc, cameraOff, joined, localScreenShareActive, micMuted]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!visible || !joined || !localScreenShareActive) return;
    const subscription = AppState.addEventListener('change', nextState => {
      const engine = engineRef.current;
      if (!engine) return;
      try {
        engine.updateChannelMediaOptions?.({
          publishCameraTrack: false,
          publishMicrophoneTrack: !micMuted,
          publishScreenCaptureVideo: true,
          publishScreenCaptureAudio: false,
          publishScreenTrack: true,
          publishSecondaryScreenTrack: false,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        });
      } catch {}
      if (nextState === 'active') {
        try {
          engine.updateScreenCapture?.({
            captureAudio: false,
            captureVideo: true,
            videoParams: {
              dimensions: PREMIUM_SCREEN_SHARE_DIMENSIONS,
              frameRate: PREMIUM_SCREEN_SHARE_FRAME_RATE,
              bitrate: PREMIUM_SCREEN_SHARE_BITRATE,
            },
          });
        } catch {}
        try {
          engine.startPreview?.(Agora?.VideoSourceType?.VideoSourceScreenPrimary ?? 2);
        } catch {}
        setStatusText('Screen sharing is live');
        void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
      }
    });
    return () => {
      subscription.remove();
    };
  }, [
    Agora?.VideoSourceType,
    joined,
    localScreenShareActive,
    meUid,
    micMuted,
    myRtcUid,
    syncScreenShareRoomState,
    visible,
  ]);

  useEffect(() => {
    if (!roomId || !meUid) return;
    updateMyParticipantState({
      muted: !!micMuted,
      cameraOff: !!cameraOff || !!activeDoc || !!localScreenShareActive,
      raisedHand: !!handRaised,
      rtcUid: myRtcUid || 0,
    });
  }, [
    activeDoc,
    cameraOff,
    handRaised,
    localScreenShareActive,
    meUid,
    micMuted,
    myRtcUid,
    roomId,
    updateMyParticipantState,
  ]);

  useEffect(() => {
    if (!canControlCurrentSharedDoc || !activeDoc || activeDoc.id !== currentSharedDocId) {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
      return;
    }
    if (!currentSharedDocSlideShow) {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
      return;
    }
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }
    slideshowTimerRef.current = setInterval(() => {
      const nextPage = currentSharedDocPage + 1;
      if (nextPage >= pdfPageCount) {
        pushSharedDocState({ slideShow: false }).catch(() => {});
        return;
      }
      pushSharedDocState({ page: nextPage }).catch(() => {});
    }, Math.max(6, currentSharedDocSlideSeconds) * 1000);
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    };
  }, [
    activeDoc,
    currentSharedDocId,
    currentSharedDocPage,
    currentSharedDocSlideSeconds,
    currentSharedDocSlideShow,
    canControlCurrentSharedDoc,
    pdfPageCount,
    pushSharedDocState,
  ]);

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

  const moderateParticipant = useCallback(
    async (participant: ParticipantRow, action: 'mute' | 'unmute' | 'purge') => {
      if (!roomId || !isPremiumHost) return;
      const participantRef = firestore().doc(`live/${roomId}/participants/${participant.uid}`);
      if (action === 'purge') {
        await participantRef.set(
          {
            purged: true,
            purgedAt: firestore.FieldValue.serverTimestamp(),
            purgedByUid: meUid,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return;
      }
      await participantRef.set(
        {
          muted: action === 'mute',
          mutedAt: firestore.FieldValue.serverTimestamp(),
          mutedByUid: meUid,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    },
    [isPremiumHost, meUid, roomId],
  );

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
      const AVView = Agora?.AgoraVideoView;
      const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
      const RtcTextureView = (Agora as any)?.RtcTextureView;
      const RtcLocalView = Agora?.RtcLocalView;
      const VideoRenderMode = Agora?.VideoRenderMode;
      const VideoSourceType = Agora?.VideoSourceType;
      const filledRenderMode = VideoRenderMode?.Hidden ?? VideoRenderMode?.Fit ?? 1;
      const style = fullScreen ? styles.videoFill : styles.pictureInPictureVideo;
      if (AVView) {
        return (
          <AVView
            style={style}
            showLocalVideo={true}
            videoSourceType={
              (VideoSourceType &&
                (VideoSourceType.VideoSourceCameraPrimary ??
                  VideoSourceType.VideoSourceCamera)) ||
              0
            }
            renderMode={filledRenderMode}
          />
        );
      }
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style,
          canvas: {
            uid: 0,
            renderMode: filledRenderMode,
          },
          zOrderMediaOverlay: true,
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style,
          canvas: {
            uid: 0,
            renderMode: filledRenderMode,
          },
        });
      }
      if (RtcLocalView?.SurfaceView) {
        return React.createElement(RtcLocalView.SurfaceView, {
          style,
          renderMode: filledRenderMode,
        });
      }
      return (
        <View style={[style, styles.videoFallback]}>
          <Text style={styles.videoFallbackText}>Starting camera...</Text>
        </View>
      );
    },
    [Agora],
  );

  const renderRemoteView = useCallback(
    (uid: number) => {
      const RtcRemoteView = Agora?.RtcRemoteView;
      const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
      const RtcTextureView = (Agora as any)?.RtcTextureView;
      const VideoRenderMode = Agora?.VideoRenderMode;
      const filledRenderMode = VideoRenderMode?.Hidden ?? VideoRenderMode?.Fit ?? 1;
      const remoteCanvas = {
        uid,
        channelId: roomChannel || undefined,
        renderMode: filledRenderMode,
        sourceType: Agora?.VideoSourceType?.VideoSourceRemote,
      };
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          key: `remote_texture_${uid}`,
          style: styles.videoFill,
          connection: rtcConnection,
          canvas: remoteCanvas,
        });
      }
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          key: `remote_surface_${uid}`,
          style: styles.videoFill,
          connection: rtcConnection,
          canvas: remoteCanvas,
        });
      }
      if (RtcRemoteView?.SurfaceView) {
        return React.createElement(RtcRemoteView.SurfaceView, {
          key: `remote_legacy_${uid}`,
          style: styles.videoFill,
          uid,
          channelId: roomChannel || undefined,
          renderMode: filledRenderMode,
        });
      }
      return (
        <View style={[styles.videoFill, styles.videoFallback]}>
          <Text style={styles.videoFallbackText}>Connecting remote video...</Text>
        </View>
      );
    },
    [Agora, roomChannel, rtcConnection],
  );

  const renderLocalScreenShareView = useCallback(() => (
    <View style={[styles.videoFill, styles.screenShareHostStage]}>
      <Text style={styles.screenShareHostTitle}>
        {screenShareStarting && !screenShareActive ? 'Starting screen share...' : 'Screen sharing is live'}
      </Text>
      <Text style={styles.screenShareHostMeta}>
        {screenShareStarting && !screenShareActive
          ? 'Grant permission, then open any app or file on your phone.'
          : 'Open any app or file on your phone. Other users will see your screen.'}
      </Text>
    </View>
  ), [screenShareActive, screenShareStarting]);

  const renderRemoteScreenShareView = useCallback(
    (uid: number) => {
      const RtcRemoteView = Agora?.RtcRemoteView;
      const RtcSurfaceView = (Agora as any)?.RtcSurfaceView;
      const RtcTextureView = (Agora as any)?.RtcTextureView;
      const VideoRenderMode = Agora?.VideoRenderMode;
      // Render the sender's active published video stream directly. On Android,
      // this screen-share path replaces the active video stream with the shared screen.
      if (RtcSurfaceView) {
        return React.createElement(RtcSurfaceView, {
          style: styles.videoFill,
          connection: rtcConnection,
          canvas: {
            uid,
            channelId: roomChannel || undefined,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
        });
      }
      if (RtcTextureView) {
        return React.createElement(RtcTextureView, {
          style: styles.videoFill,
          connection: rtcConnection,
          canvas: {
            uid,
            channelId: roomChannel || undefined,
            renderMode: VideoRenderMode?.Fit ?? 2,
          },
        });
      }
      // v3 fallback - render normally
      if (RtcRemoteView?.SurfaceView) {
        return React.createElement(RtcRemoteView.SurfaceView, {
          style: styles.videoFill,
          uid,
          channelId: roomChannel || undefined,
          renderMode: VideoRenderMode?.Fit ?? 2,
        });
      }
      return renderRemoteView(uid);
    },
    [Agora, renderRemoteView, roomChannel, rtcConnection],
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

  const roomHostRtcUid = useMemo(() => {
    if (!roomHostUid) return 0;
    return Number(
      participants.find(item => item.uid === roomHostUid)?.rtcUid ||
        mapRtcUidFromUserId(roomHostUid) ||
        0,
    );
  }, [participants, roomHostUid]);

  const prioritizedRemoteRenderUids = useMemo(
    () =>
      [...remoteRenderUids].sort((a, b) => {
        const aIsHost = a === roomHostRtcUid ? 1 : 0;
        const bIsHost = b === roomHostRtcUid ? 1 : 0;
        if (aIsHost !== bIsHost) return bIsHost - aIsHost;
        const aSpeakerAt = recentSpeakerAt[a] || 0;
        const bSpeakerAt = recentSpeakerAt[b] || 0;
        if (aSpeakerAt !== bSpeakerAt) return bSpeakerAt - aSpeakerAt;
        return a - b;
      }),
    [recentSpeakerAt, remoteRenderUids, roomHostRtcUid],
  );

  const visibleRemoteVideoUids = useMemo(() => {
    const limit = Math.max(1, MAX_VISIBLE_PREMIUM_GALLERY_TILES - 1);
    const visible = prioritizedRemoteRenderUids.slice(0, limit);
    if (screenShareOwnerRtcUid > 0 && !visible.includes(screenShareOwnerRtcUid)) {
      return [...visible, screenShareOwnerRtcUid];
    }
    return visible;
  }, [prioritizedRemoteRenderUids, screenShareOwnerRtcUid]);

  const premiumGalleryTiles = useMemo(() => {
    const remoteTiles = prioritizedRemoteRenderUids.map(uid => ({ kind: 'remote' as const, uid }));
    const localTile = { kind: 'local' as const, uid: myRtcUid || 0 };
    return [...remoteTiles, localTile];
  }, [myRtcUid, prioritizedRemoteRenderUids]);

  const screenShareStageVisible = useMemo(
    () =>
      !!(
        isPremiumRoom &&
        ((screenShareActive && screenShareRenderRtcUid > 0) ||
          (localScreenShareActive && isCurrentUserScreenSharer))
      ),
    [isCurrentUserScreenSharer, isPremiumRoom, localScreenShareActive, screenShareActive, screenShareRenderRtcUid],
  );
  const sharedFileStageVisible = useMemo(
    () =>
      !!(
        isPremiumRoom &&
        !activeDoc &&
        !screenShareStageVisible &&
        !localScreenShareStageVisible &&
        currentSharedDocStage &&
        (currentSharedDocId || currentSharedDocPreviewTitle || sharedDocStatusText)
      ),
    [
      activeDoc,
      currentSharedDocId,
      currentSharedDocPreviewTitle,
      currentSharedDocStage,
      isPremiumRoom,
      localScreenShareStageVisible,
      screenShareStageVisible,
      sharedDocStatusText,
    ],
  );

  const screenShareInsetUid = useMemo(() => {
    if (!screenShareStageVisible) return 0;
    return prioritizedRemoteRenderUids.find(uid => uid !== screenShareRenderRtcUid) || 0;
  }, [prioritizedRemoteRenderUids, screenShareRenderRtcUid, screenShareStageVisible]);
  const localScreenShareStageVisible = useMemo(
    () => !!(isPremiumRoom && (screenShareStarting || localScreenShareActive)),
    [isPremiumRoom, localScreenShareActive, screenShareStarting],
  );

  const renderPremiumGallery = useCallback(() => {
    const visibleTiles = premiumGalleryTiles.slice(0, MAX_VISIBLE_PREMIUM_GALLERY_TILES);
    const hiddenCount = Math.max(0, premiumGalleryTiles.length - visibleTiles.length);
    const tileCount = visibleTiles.length;
    const columns = tileCount <= 1 ? 1 : 2;
    const tileWidth = columns === 1 ? '100%' : '50%';
    const tileHeight = tileCount <= 1 ? '100%' : tileCount === 2 ? '44%' : '36%';
    return (
      <View style={styles.galleryGrid}>
        {visibleTiles.map((tile, index) => {
          const isLastVisible = index === visibleTiles.length - 1 && hiddenCount > 0;
          return (
            <View
              key={`${tile.kind}_${tile.uid}`}
              style={[
                styles.galleryTile,
                {
                  width: tileWidth,
                  height: tileHeight,
                },
              ]}
            >
                <View style={styles.galleryTileInner}>
                  {tile.kind === 'remote'
                    ? renderRemoteView(tile.uid)
                    : cameraOff
                  ? (
                    <View style={[styles.videoFill, styles.cameraOffStage]}>
                      <Text style={styles.cameraOffText}>Camera off</Text>
                    </View>
                  )
                  : renderLocalView(true)}
                <View style={styles.galleryTileLabelWrap}>
                  <Text style={styles.galleryTileLabel}>
                    {tile.kind === 'remote'
                      ? participants.find(item => Number(item.rtcUid || 0) === tile.uid)?.name || `Guest ${tile.uid}`
                      : 'You'}
                  </Text>
                </View>
                {isLastVisible ? (
                  <View style={styles.galleryOverflowBadge}>
                    <Text style={styles.galleryOverflowText}>+{hiddenCount}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [cameraOff, participants, premiumGalleryTiles, renderLocalView, renderRemoteView]);

  const renderSharedFileStage = useCallback(() => {
    const title = String(
      currentSharedDocPreviewTitle || currentSharedDocEntry?.title || currentSharedDocFileName || 'Shared file',
    ).trim();
    const stage = String(currentSharedDocStage || 'uploading').trim().toLowerCase();
    const detail =
      sharedDocStatusText ||
      (stage === 'choosing'
        ? 'Choosing file...'
        : stage === 'selected'
        ? 'Preparing upload...'
        : stage === 'uploading'
        ? 'Uploading to everyone now...'
        : stage === 'converting'
        ? 'Converting to PDF for all devices...'
        : stage === 'error'
        ? 'File share failed.'
        : 'Opening shared file...');
    const badgeText =
      stage === 'error'
        ? 'Share failed'
        : stage === 'ready'
        ? 'Opening file'
        : 'File sharing live';
    return (
      <View style={[styles.videoFill, styles.sharedFileStage]}>
        <View style={styles.sharedFileStageBadge}>
          <Text style={styles.sharedFileStageBadgeText}>{badgeText}</Text>
        </View>
        <Text style={styles.sharedFileStageTitle} numberOfLines={2}>
          {title || 'Shared file'}
        </Text>
        <Text style={styles.sharedFileStageMeta} numberOfLines={2}>
          {detail}
        </Text>
      </View>
    );
  }, [
    currentSharedDocEntry?.title,
    currentSharedDocFileName,
    currentSharedDocPreviewTitle,
    currentSharedDocStage,
    sharedDocStatusText,
  ]);

  useEffect(() => {
    if (!roomId || !joined) return;
    const participantRemoteUids = participants
      .map(item => Number(item.rtcUid || 0))
      .filter(uid => Number.isFinite(uid) && uid > 0 && uid !== myRtcUid);
    if (!participantRemoteUids.length) return;
    setRemoteUids(prev => Array.from(new Set([...participantRemoteUids, ...prev])));
  }, [joined, myRtcUid, participants, roomId]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !joined || remoteRenderUids.length === 0) return;
    const visibleSet = new Set(visibleRemoteVideoUids);
    remoteRenderUids.forEach(uid => {
      try {
        engine.muteRemoteAudioStream?.(uid, false);
        (engine as any)?.subscribeRemoteAudioStream?.(uid, true);
        if (visibleSet.has(uid)) {
          engine.muteRemoteVideoStream?.(uid, false);
          (engine as any)?.subscribeRemoteVideoStream?.(uid, true);
          engine.setRemoteVideoStreamType?.(uid, 0);
        } else {
          engine.muteRemoteVideoStream?.(uid, true);
        }
      } catch {}
    });
  }, [joined, remoteRenderUids, visibleRemoteVideoUids]);

  useEffect(() => {
    if (!localScreenShareActive) return;
    if (screenShareActive && screenShareOwnerUid === meUid) return;
    void stopScreenShare({ syncRoom: false });
  }, [localScreenShareActive, meUid, screenShareActive, screenShareOwnerUid, stopScreenShare]);

  // When remote screen share activates, force-subscribe to that user's video stream
  useEffect(() => {
    if (!screenShareActive || !screenShareOwnerRtcUid || screenShareOwnerUid === meUid) return;
    const engine = engineRef.current;
    if (!engine) return;
    try {
      engine.muteRemoteVideoStream?.(screenShareOwnerRtcUid, false);
      (engine as any)?.subscribeRemoteVideoStream?.(screenShareOwnerRtcUid, true);
      engine.setRemoteVideoStreamType?.(screenShareOwnerRtcUid, 0);
    } catch {}
  }, [meUid, screenShareActive, screenShareOwnerRtcUid, screenShareOwnerUid]);

  useEffect(() => {
    if (!roomId || !screenShareActive || !screenShareOwnerUid) return;
    if (screenShareOwnerUid === meUid) return;
    const ownerStillPresent = participants.some(item => item.uid === screenShareOwnerUid);
    if (ownerStillPresent) return;
    void firestore()
      .collection('live')
      .doc(roomId)
      .set(
        {
          currentScreenShareActive: false,
          currentScreenShareOwnerUid: firestore.FieldValue.delete(),
          currentScreenShareOwnerName: firestore.FieldValue.delete(),
          currentScreenShareOwnerRtcUid: firestore.FieldValue.delete(),
          currentScreenShareStartedAt: firestore.FieldValue.delete(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      .catch(() => {});
  }, [meUid, participants, roomId, screenShareActive, screenShareOwnerUid]);

  useEffect(() => {
    if (!roomId || !screenShareActive) return;
    if (screenShareOwnerUid) return;
    void firestore()
      .collection('live')
      .doc(roomId)
      .set(
        {
          currentScreenShareActive: false,
          currentScreenShareOwnerUid: firestore.FieldValue.delete(),
          currentScreenShareOwnerName: firestore.FieldValue.delete(),
          currentScreenShareOwnerRtcUid: firestore.FieldValue.delete(),
          currentScreenShareStartedAt: firestore.FieldValue.delete(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      .catch(() => {});
  }, [roomId, screenShareActive, screenShareOwnerUid]);

  useEffect(() => {
    if (joined) return;
    if (!roomId || !roomChannel || !myRtcUid) return;
    if (remoteRenderUids.length === 0) return;
    setJoined(true);
    setStatusText('Live');
  }, [joined, myRtcUid, remoteRenderUids.length, roomChannel, roomId]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.root}>
        {roomId ? (
          <>
            <View style={styles.videoStage}>
              {screenShareStageVisible || localScreenShareStageVisible ? (
                isCurrentUserScreenSharer || localScreenShareStageVisible
                  ? renderLocalScreenShareView()
                  : renderRemoteScreenShareView(screenShareRenderRtcUid)
              ) : sharedFileStageVisible ? (
                renderSharedFileStage()
              ) : !activeDoc && premiumGalleryTiles.length > 1 ? (
                renderPremiumGallery()
              ) : prioritizedRemoteRenderUids.length > 0 ? (
                renderRemoteView(prioritizedRemoteRenderUids[0])
              ) : cameraOff ? (
                <View style={[styles.videoFill, styles.cameraOffStage]}>
                  <Text style={styles.cameraOffText}>Camera off</Text>
                </View>
              ) : (
                renderLocalView(true)
              )}
              {screenShareStageVisible || localScreenShareStageVisible ? (
                <View
                  style={[
                    styles.pictureInPicture,
                    {
                      right: insets.right + 4,
                      bottom: insets.bottom + 316,
                    },
                  ]}
                >
                  {screenShareInsetUid > 0
                    ? renderRemoteView(screenShareInsetUid)
                    : cameraOff
                    ? (
                      <View style={[styles.pictureInPictureVideo, styles.cameraOffStage]}>
                        <Text style={styles.cameraOffText}>Camera off</Text>
                      </View>
                    )
                    : isCurrentUserScreenSharer || localScreenShareStageVisible
                    ? (
                      <View style={[styles.pictureInPictureVideo, styles.screenShareInsetStage]}>
                        <Text style={styles.screenShareInsetText}>Live</Text>
                      </View>
                    )
                    : renderLocalView(false)}
                </View>
              ) : sharedFileStageVisible ? null : prioritizedRemoteRenderUids.length > 0 && !(!activeDoc && premiumGalleryTiles.length > 1) ? (
                <View
                  style={[
                    styles.pictureInPicture,
                    {
                      right: insets.right + 4,
                      bottom: insets.bottom + 316,
                    },
                  ]}
                >
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
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.roomTitle,
                      isPremiumRoom ? styles.premiumRoomTitle : styles.driftRoomTitle,
                    ]}
                  >
                    {roomTitle}
                  </Text>
                </View>
                <View style={styles.topBarCenter}>
                  {isPremiumRoom ? (
                    <View style={styles.premiumCountdownPill}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.premiumCountdownText}>
                        {screenShareStageVisible
                          || localScreenShareStageVisible
                          ? 'Screen sharing live'
                          : premiumCountdownLabel || 'Premium stream active'}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.topBarActions}>
                  {activeDoc && isDocMinimized ? (
                    <Pressable onPress={() => setIsDocMinimized(false)} style={styles.topIconChip}>
                      <Text style={styles.topIconChipText}>+</Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={handleClose} style={styles.closeChip}>
                    <Text style={styles.closeChipText}>x</Text>
                  </Pressable>
                </View>
              </View>
              <View style={[styles.stageBrandChip, { left: insets.left + 12, top: insets.top + 54 }]}>
                <Text style={styles.stageBrandChipText}>MoMo</Text>
              </View>
              {networkWarning ? (
                <View
                  style={[
                    styles.networkWarningBanner,
                    {
                      top: insets.top + 88,
                      left: insets.left + 12,
                      right: insets.right + 12,
                    },
                  ]}
                >
                  <Text style={styles.networkWarningText}>{networkWarning}</Text>
                </View>
              ) : null}
              {activeDoc && isDocMinimized ? (
                <Pressable
                  style={[styles.maximizeDocChip, { left: insets.left + 14, bottom: insets.bottom + 92 }]}
                  onPress={() => setIsDocMinimized(false)}
                >
                  <Text style={styles.maximizeDocChipText}>Maximize File</Text>
                </Pressable>
              ) : null}
              <View style={[styles.rightRail, { right: insets.right + 8, bottom: insets.bottom + 78 }]}>
                {!isPremiumRoom ? <Pressable style={styles.railButton} onPress={() => setShowInvitePanel(true)}>
                  <Text style={styles.railIcon}>Invite</Text>
                </Pressable> : <Pressable style={styles.railButton} onPress={() => setShowComments(v => !v)}>
                  <Text style={styles.railIcon}>{`Chat (${comments.length})`}</Text>
                </Pressable>}
                {!isPremiumRoom ? <Pressable style={styles.railButton} onPress={() => setShowReactionPicker(v => !v)}>
                  <Text style={styles.railIcon}>React</Text>
                  <Text style={styles.railEmojiLine}>💙 🫶 ❤️ ✨ 🤗</Text>
                </Pressable> : null}
                <Pressable style={styles.railButton} onPress={() => setShowAudiencePanel(v => !v)}>
                  <Text style={styles.railIcon}>👥 ({participants.length})</Text>
                </Pressable>
                {isPremiumRoom ? (
                  <Pressable style={styles.railButton} onPress={() => void toggleRaisedHand()}>
                    <Text style={styles.railIcon}>{handRaised ? 'Lower Hand' : 'Raise Hand'}</Text>
                  </Pressable>
                ) : null}
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
                  <Text style={styles.railIcon}>{micMuted ? 'Join Audio' : 'Mute Audio'}</Text>
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
                  <Text style={styles.railIcon}>{cameraOff ? 'Start Video' : 'Stop Video'}</Text>
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
                {!isPremiumRoom ? <Pressable style={styles.railButton} onPress={openSoundBoard}>
                  <Text style={styles.railIcon}>Sounds</Text>
                </Pressable> : null}
                {isPremiumRoom ? (
                  <Pressable
                    style={styles.railButton}
                    onPress={() => {
                      docsPanelAutoOpenedRef.current = false;
                      setShowDocsPanel(true);
                    }}
                  >
                    <Text style={styles.railIcon}>Share Files</Text>
                  </Pressable>
                ) : null}
                {isPremiumRoom ? (
                  <Pressable
                    style={styles.railButton}
                    onPress={() => {
                      if (isCurrentUserScreenSharer) {
                        void stopScreenShare();
                      } else {
                        void startScreenShare();
                      }
                    }}
                  >
                    <Text style={styles.railIcon}>
                      {screenShareStarting
                        ? 'Starting...'
                        : isCurrentUserScreenSharer
                        ? 'Stop Share'
                        : 'Share Screen'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {soundBadgeLabel && !isPremiumRoom ? (
                <View style={styles.soundBadge}>
                  <Text style={styles.soundBadgeText}>{soundBadgeLabel}</Text>
                </View>
              ) : null}
              {isPremiumRoom && raisedHandParticipants.length > 0 ? (
                <View style={styles.meetingStatusOverlay}>
                  {raisedHandParticipants.length > 0 ? (
                    <Text style={styles.meetingStatusText}>
                      {raisedHandParticipants.length} hand{raisedHandParticipants.length === 1 ? '' : 's'} raised
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {showAudiencePanel ? (
                <View style={[styles.audiencePanel, { top: insets.top + 132, right: insets.right + 14 }]}>
                  <Text style={styles.audiencePanelTitle}>In The Room</Text>
                  {premiumStatusLine ? (
                    <Text style={styles.audiencePanelMeta}>{premiumStatusLine}</Text>
                  ) : null}
                  <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                    {audienceRows.map(item => (
                      <Pressable
                        key={item.uid}
                        style={styles.audienceRow}
                        disabled={!isPremiumHost || item.uid === meUid || item.label === 'Host'}
                        onPress={() => {
                          if (!isPremiumHost) return;
                          const participant = participants.find(row => row.uid === item.uid);
                          if (!participant || participant.uid === meUid || participant.isHost) return;
                          Alert.alert(
                            'Participant controls',
                            item.label,
                            [
                              {
                                text: participant.muted ? 'Unmute' : 'Mute',
                                onPress: () => {
                                  void moderateParticipant(participant, participant.muted ? 'unmute' : 'mute');
                                },
                              },
                              ...(participant.raisedHand
                                ? [
                                    {
                                      text: 'Lower Hand',
                                      onPress: () => {
                                        void firestore()
                                          .doc(`live/${roomId}/participants/${participant.uid}`)
                                          .set(
                                            {
                                              raisedHand: false,
                                              updatedAt: firestore.FieldValue.serverTimestamp(),
                                            },
                                            { merge: true },
                                          );
                                      },
                                    },
                                  ]
                                : []),
                              {
                                text: 'Purge',
                                style: 'destructive',
                                onPress: () => {
                                  void moderateParticipant(participant, 'purge');
                                },
                              },
                              { text: 'Cancel', style: 'cancel' },
                            ],
                          );
                        }}
                      >
                        <Text style={styles.audienceRowText}>{item.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {raisedHandParticipants.length > 0 ? (
                    <View style={styles.raisedHandsWrap}>
                      <Text style={styles.raisedHandsTitle}>Raised Hands</Text>
                      {raisedHandParticipants.slice(0, 4).map(item => (
                        <Text key={item.uid} style={styles.raisedHandsText}>
                          {item.name || 'Guest'} wants to speak
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
              {showComments && isPremiumRoom ? (
                <View
                  style={[
                    styles.premiumCommentPanel,
                    {
                      left: insets.left + 12,
                      right: insets.right + 96,
                      bottom: insets.bottom + 92,
                    },
                  ]}
                >
                  <View style={styles.premiumCommentHeader}>
                    <Text style={styles.premiumCommentTitle}>Chat</Text>
                    <Pressable onPress={() => setShowComments(false)}>
                      <Text style={styles.premiumCommentClose}>Hide</Text>
                    </Pressable>
                  </View>
                  <ScrollView
                    style={styles.premiumCommentScroll}
                    contentContainerStyle={styles.premiumCommentScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {premiumChatRows.length === 0 ? (
                      <Text style={styles.premiumCommentEmpty}>No messages yet.</Text>
                    ) : (
                      premiumChatRows.map(item => (
                        <Pressable
                          key={item.id}
                          style={styles.premiumCommentBubble}
                          onPress={() => setReplyTarget(item)}
                        >
                          <Text style={styles.premiumCommentAuthor}>{item.fromName}</Text>
                          {item.replyToName || item.replyToText ? (
                            <Text style={styles.premiumCommentReply} numberOfLines={1}>
                              Reply to {item.replyToName || 'message'}: {item.replyToText || ''}
                            </Text>
                          ) : null}
                          <Text style={styles.premiumCommentText}>{item.text}</Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : null}
              {showDocsPanel && isPremiumRoom ? (
                <View style={[styles.docsPanel, { top: insets.top + 114, left: insets.left + 6 }]}>
                  <View style={styles.docsPanelHeader}>
                    <Pressable
                      onPress={() => {
                        docsPanelAutoOpenedRef.current = false;
                        setShowDocsPanel(false);
                      }}
                      hitSlop={10}
                    >
                      <Text style={styles.docsPanelClose}>x</Text>
                    </Pressable>
                  </View>
                  {!activeDoc ? (
                    <>
                      <Animated.View
                        style={[
                          styles.docsShareButtonWrap,
                          {
                            borderColor: docsStatusPulseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['rgba(255,255,255,0.14)', '#FFD7D7'],
                            }),
                          },
                        ]}
                      >
                        <Pressable style={styles.docsShareButton} onPress={() => void handleShareFile()}>
                          <Text numberOfLines={1} style={styles.docsShareButtonText}>{docBusy ? 'Sharing...' : 'Share File'}</Text>
                        </Pressable>
                      </Animated.View>
                      <Pressable style={[styles.docsShareButton, { marginTop: 8, backgroundColor: '#2563EB' }]} onPress={() => void handleShareBlankDoc()}>
                        <Text numberOfLines={1} style={styles.docsShareButtonText}>Share Blank PDF</Text>
                      </Pressable>
                      {currentSharedDocId ? (
                        <Pressable
                          style={[styles.docsShareButton, { marginTop: 8, backgroundColor: '#8D0000' }]}
                          onPress={() =>
                            void clearCurrentSharedDocSession({
                              keepPanelOpen: true,
                              deleteCurrentDoc: true,
                            })
                          }
                        >
                          <Text numberOfLines={1} style={styles.docsShareButtonText}>
                            {currentSharedDocStage === 'uploading' || currentSharedDocStage === 'selected'
                              ? 'Stop Current Upload'
                              : currentSharedDocStage === 'error'
                              ? 'Clear Failed Share'
                              : 'Close Shared File'}
                          </Text>
                        </Pressable>
                      ) : null}
                      {sharedDocProgressCard ? (
                        <View style={styles.docsProgressCard}>
                          <Text style={styles.docsProgressTitle} numberOfLines={1}>
                            {sharedDocProgressCard.title}
                          </Text>
                          <Text style={styles.docsProgressMeta} numberOfLines={2}>
                            {sharedDocProgressCard.detail}
                          </Text>
                        </View>
                      ) : null}
                      {currentSharedDocEntry ? (
                        <View style={styles.docsProgressCard}>
                          <Text style={styles.docsProgressTitle} numberOfLines={1}>
                            {currentSharedDocEntry.title}
                          </Text>
                          <Text style={styles.docsProgressMeta} numberOfLines={2}>
                            {currentSharedDocEntry.status === 'uploading'
                              ? 'Uploading now...'
                              : currentSharedDocEntry.status === 'converting'
                              ? 'Preparing PDF...'
                              : currentSharedDocEntry.status === 'error'
                              ? currentSharedDocEntry.errorMessage || 'Share failed'
                              : 'Current shared file'}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                  <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                    {visibleSharedDocs.length === 0 ? (
                      <Text style={styles.docsEmptyText}>Ready to share a file.</Text>
                    ) : (
                      visibleSharedDocs.map(doc => (
                        <Pressable
                          key={doc.id}
                          style={styles.docsRow}
                          onPress={() => {
                            if (doc.status === 'ready') {
                              void openSharedPdf(doc);
                            }
                          }}
                          disabled={docBusy || doc.status !== 'ready'}
                        >
                          <Text style={styles.docsRowTitle} numberOfLines={1}>{doc.title}</Text>
                          <Text style={styles.docsRowMeta} numberOfLines={1}>
                            {doc.status === 'uploading'
                              ? `Uploading ${String(doc.sourceKind || '').toUpperCase()}...`
                              : doc.status === 'converting'
                              ? `Converting ${String(doc.sourceKind || '').toUpperCase()}...`
                              : doc.status === 'error'
                              ? doc.errorMessage || 'Conversion failed'
                              : `${doc.sharedByName} · ${formatTimestamp(doc.createdAtMs)}`}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : null}
              {showReactionPicker && !isPremiumRoom ? (
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
              {showComments && !isPremiumRoom ? (
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
              {!isPremiumRoom ? floatingReactions.map(item => (
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
              )) : null}
              {!joined ? (
                <View style={styles.roomJoiningOverlay}>
                  <ActivityIndicator color="#10c9ff" />
                </View>
              ) : null}
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
                      placeholder={isPremiumRoom ? 'Message the room' : 'Say something to the room'}
                      placeholderTextColor="rgba(255,255,255,0.55)"
                      style={styles.commentInput}
                    />
                    <Pressable style={styles.sendButton} onPress={sendComment}>
                      <Text numberOfLines={1} style={styles.sendButtonText}>Send</Text>
                    </Pressable>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </View>
            {!isPremiumRoom ? (
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
                      <Text numberOfLines={1} style={styles.inviteSearchButtonText}>Find</Text>
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
                          <Text numberOfLines={1} style={styles.inviteResultButtonText}>
                            {inviteBusyUid === item.uid ? '...' : 'Invite'}
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                  <Pressable style={styles.inviteCloseButton} onPress={() => setShowInvitePanel(false)}>
                    <Text numberOfLines={1} style={styles.inviteCloseButtonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            ) : null}
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
                numberOfLines={1}
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
              <Text numberOfLines={1} style={styles.secondaryStartButtonText}>Close</Text>
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
                <Text numberOfLines={1} style={styles.inviteCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          visible={!!activeDoc && !isDocMinimized}
          transparent
          animationType="fade"
          onRequestClose={closePdfViewer}
        >
          <View style={styles.pdfBackdrop}>
              <View style={styles.pdfCard}>
                <View style={styles.pdfHeader}>
                <Text style={styles.pdfTitle} numberOfLines={1}>
                  {activeDoc?.title || 'Shared PDF'}
                </Text>
                <View style={styles.pdfHeaderActions}>
                  <Pressable style={styles.pdfIconButton} onPress={minimizePdfViewer}>
                    <Text style={styles.pdfIconButtonText}>-</Text>
                  </Pressable>
                  <Pressable style={styles.pdfCloseButton} onPress={closePdfViewer}>
                    <Text style={styles.pdfCloseButtonText}>x</Text>
                  </Pressable>
                </View>
              </View>
                <View
                  style={styles.pdfPreviewFrame}
                onLayout={event => {
                  const { width, height } = event.nativeEvent.layout;
                  setPdfFrameWidth(width);
                  setPdfFrameHeight(height);
                }}
                >
                  <View style={styles.pdfBrandChip}>
                    <Text style={styles.pdfBrandChipText}>MoMo</Text>
                  </View>
                  {docBusy ? <ActivityIndicator color="#8D0000" size="large" /> : null}
                {!docBusy && (pdfPreviewUri || String(activeDoc?.sourceKind || '').toLowerCase() === 'blank') ? (
                  <ScrollView
                    ref={ref => {
                      pdfVerticalScrollRef.current = ref;
                    }}
                    style={styles.pdfPreviewScroll}
                    contentContainerStyle={styles.pdfPreviewScrollContent}
                    maximumZoomScale={1}
                    minimumZoomScale={1}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={event => {
                      if (!canControlCurrentSharedDoc) return;
                      const previewHeight =
                        typeof pdfDisplayMetrics.height === 'number'
                          ? pdfDisplayMetrics.height
                          : pdfFrameHeight;
                      const maxY = Math.max(0, previewHeight - pdfFrameHeight);
                      const nextY = maxY > 0 ? event.nativeEvent.contentOffset.y / maxY : 0;
                      queueSharedViewportSync(currentSharedDocPanX, nextY, pdfZoomLevel);
                    }}
                  >
                    <ScrollView
                      ref={ref => {
                        pdfHorizontalScrollRef.current = ref;
                      }}
                      horizontal
                      contentContainerStyle={styles.pdfPreviewScrollContent}
                      showsHorizontalScrollIndicator={false}
                      scrollEventThrottle={16}
                      onScroll={event => {
                        if (!canControlCurrentSharedDoc) return;
                        const previewWidth =
                          typeof pdfDisplayMetrics.width === 'number'
                            ? pdfDisplayMetrics.width
                            : pdfFrameWidth;
                        const maxX = Math.max(0, previewWidth - pdfFrameWidth);
                        const nextX = maxX > 0 ? event.nativeEvent.contentOffset.x / maxX : 0;
                        queueSharedViewportSync(nextX, currentSharedDocPanY, pdfZoomLevel);
                      }}
                    >
                      {String(activeDoc?.sourceKind || '').toLowerCase() === 'blank' ? (
                        <View
                          style={[
                            styles.pdfPreviewImage,
                            {
                              width: pdfDisplayMetrics.width,
                              height: pdfDisplayMetrics.height,
                              backgroundColor: '#FFFFFF',
                              borderRadius: 14,
                            },
                          ]}
                        />
                      ) : (
                        <Image
                          source={{ uri: pdfPreviewUri || '' }}
                          style={[
                            styles.pdfPreviewImage,
                            {
                              width: pdfDisplayMetrics.width,
                              height: pdfDisplayMetrics.height,
                            },
                          ]}
                          resizeMode="contain"
                        />
                      )}
                    </ScrollView>
                  </ScrollView>
                ) : !docBusy && activeDoc ? (
                  <View style={styles.sharedFileFallbackCard}>
                    <Text style={styles.sharedFileFallbackType}>
                      {String(activeDoc.sourceKind || 'file').toUpperCase()}
                    </Text>
                    <Text style={styles.sharedFileFallbackTitle} numberOfLines={2}>
                      {activeDoc.title || activeDoc.fileName || 'Shared File'}
                    </Text>
                    <Text style={styles.sharedFileFallbackMeta} numberOfLines={2}>
                      {activeDoc.fileName || 'File shared in this Aqua Premium room'}
                    </Text>
                    <Text style={styles.sharedFileFallbackHint}>
                      Everyone in this show can now see this shared file on screen.
                    </Text>
                  </View>
                ) : null}
                {sharedDocInkSegments.map(segment => (
                  <View
                    key={segment.id}
                    pointerEvents="none"
                    style={[
                      styles.pdfInkSegment,
                      {
                        left: segment.left,
                        top: segment.top,
                        width: segment.width,
                        height: segment.thickness,
                        borderRadius: segment.thickness / 2,
                        backgroundColor: segment.color,
                        transform: [{ rotate: segment.angle }],
                      },
                    ]}
                  />
                ))}
                {sharedDocInkPoints.map(point => (
                  <View
                    key={point.id}
                    pointerEvents="none"
                    style={[
                      styles.pdfInkPoint,
                      {
                        left: Math.max(8, Math.min(Math.max(8, pdfFrameWidth - 20), point.x * pdfFrameWidth - point.size / 2)),
                        top: Math.max(8, Math.min(Math.max(8, pdfFrameHeight - 20), point.y * pdfFrameHeight - point.size / 2)),
                        width: point.size,
                        height: point.size,
                        borderRadius: point.size / 2,
                        backgroundColor: point.color,
                      },
                    ]}
                  />
                ))}
                {sharedDocMarker ? (
                  <View
                    pointerEvents="none"
                    style={[
                      sharedDocMarker.mode === 'highlight'
                        ? styles.pdfHighlightMarker
                        : styles.pdfPointerMarker,
                      {
                        left:
                          sharedDocMarker.mode === 'highlight'
                            ? Math.max(12, Math.min(Math.max(12, pdfFrameWidth - 164), sharedDocMarker.x * pdfFrameWidth - 76))
                            : Math.max(12, Math.min(Math.max(12, pdfFrameWidth - 32), sharedDocMarker.x * pdfFrameWidth - 10)),
                        top:
                          sharedDocMarker.mode === 'highlight'
                            ? Math.max(12, Math.min(Math.max(12, pdfFrameHeight - 58), sharedDocMarker.y * pdfFrameHeight - 18))
                            : Math.max(12, Math.min(Math.max(12, pdfFrameHeight - 32), sharedDocMarker.y * pdfFrameHeight - 10)),
                      },
                    ]}
                  />
                ) : null}
                {canControlCurrentSharedDoc && currentPresentationTool ? (
                  <View
                    style={StyleSheet.absoluteFill}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={event => {
                      if (currentPresentationTool === 'pen') {
                        activeInkStrokeIdRef.current = `${Date.now()}_${Math.random()
                          .toString(36)
                          .slice(2, 10)}`;
                      }
                      placePresentationMarker(
                        event.nativeEvent.locationX,
                        event.nativeEvent.locationY,
                      );
                    }}
                    onResponderMove={event => {
                      placePresentationMarker(
                        event.nativeEvent.locationX,
                        event.nativeEvent.locationY,
                      );
                    }}
                    onResponderRelease={() => {
                      activeInkPointRef.current = null;
                      activeInkStrokeIdRef.current = null;
                    }}
                    onResponderTerminate={() => {
                      activeInkPointRef.current = null;
                      activeInkStrokeIdRef.current = null;
                    }}
                  />
                ) : null}
              </View>
              {['pdf', 'blank', 'image'].includes(String(activeDoc?.sourceKind || '').toLowerCase()) ? (
              <View style={styles.pdfPagerRow}>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    (!canControlCurrentSharedDoc || pdfPageIndex <= 0 || isGuestViewingSharedDoc)
                      ? styles.pdfPagerButtonDisabled
                      : null,
                  ]}
                  onPress={() => {
                    if (canControlCurrentSharedDoc) {
                      void pushSharedDocState({ page: 0, slideShow: false });
                    }
                  }}
                  disabled={!canControlCurrentSharedDoc || docBusy || pdfPageIndex <= 0 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'|<'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    pdfPageIndex <= 0 || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => void changePdfPage(-1)}
                  disabled={docBusy || pdfPageIndex <= 0 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'<'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    !canControlCurrentSharedDoc || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={startSharedDocSlideShow}
                  disabled={!canControlCurrentSharedDoc || docBusy || pdfPageCount <= 1 || currentSharedDocSlideShow || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'▶'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    (!canControlCurrentSharedDoc || !currentSharedDocSlideShow || isGuestViewingSharedDoc)
                      ? styles.pdfPagerButtonDisabled
                      : null,
                  ]}
                  onPress={pauseSharedDocSlideShow}
                  disabled={!canControlCurrentSharedDoc || !currentSharedDocSlideShow || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'⏸'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => void changePdfPage(1)}
                  disabled={docBusy || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'>'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    (!canControlCurrentSharedDoc || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc)
                      ? styles.pdfPagerButtonDisabled
                      : null,
                  ]}
                  onPress={() => {
                    if (canControlCurrentSharedDoc && pdfPageCount > 0) {
                      void pushSharedDocState({ page: Math.max(0, pdfPageCount - 1), slideShow: false });
                    }
                  }}
                  disabled={!canControlCurrentSharedDoc || docBusy || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'>|'}</Text>
                </Pressable>
                <Pressable
                  style={[styles.pdfPagerButton, isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null]}
                  onPress={() => {
                    const nextZoom = Math.max(1, Number((pdfZoomLevel - 0.25).toFixed(2)));
                    setPdfZoomLevel(nextZoom);
                    if (canControlCurrentSharedDoc) {
                      void pushSharedDocState({ zoom: nextZoom });
                    }
                  }}
                  disabled={docBusy || pdfZoomLevel <= 1 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>−</Text>
                </Pressable>
                <Pressable
                  style={[styles.pdfPagerButton, isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null]}
                  onPress={() => {
                    const nextZoom = Math.min(3, Number((pdfZoomLevel + 0.25).toFixed(2)));
                    setPdfZoomLevel(nextZoom);
                    if (canControlCurrentSharedDoc) {
                      void pushSharedDocState({ zoom: nextZoom });
                    }
                  }}
                  disabled={docBusy || pdfZoomLevel >= 3 || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>+</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    currentPresentationTool === 'pointer' ? styles.pdfPagerButtonActive : null,
                    isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => togglePresentationTool('pointer')}
                  disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'⌖'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    currentPresentationTool === 'highlight' ? styles.pdfPagerButtonActive : null,
                    isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => togglePresentationTool('highlight')}
                  disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'✎'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    currentPresentationTool === 'pen' ? styles.pdfPagerButtonActive : null,
                    isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => togglePresentationTool('pen')}
                  disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'🖊'}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pdfPagerButton,
                    currentPresentationTool === 'eraser' ? styles.pdfPagerButtonActive : null,
                    isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
                  ]}
                  onPress={() => togglePresentationTool('eraser')}
                  disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}
                >
                  <Text style={styles.pdfPagerButtonText}>{'⌫'}</Text>
                </Pressable>
                <Text style={styles.pdfPageCounterText}>
                  {Math.min(pdfPageCount || 0, pdfPageIndex + 1)} / {pdfPageCount || 0}
                </Text>
                <Text style={styles.pdfSlideSpeedText}>{currentSharedDocSlideSeconds}s</Text>
              </View>
              ) : null}
              {!canControlCurrentSharedDoc && currentSharedDocId && ['pdf', 'blank', 'image'].includes(String(activeDoc?.sourceKind || '').toLowerCase()) ? (
                <>
                  <View style={styles.pdfGuestUtilityRow}>
                    <Pressable
                      style={styles.pdfGuestUtilityButton}
                      onPress={() => {
                        if (activeDoc) {
                          void openSharedPdf(activeDoc, { silentIfPending: true });
                        }
                      }}
                    >
                      <Text numberOfLines={1} style={styles.pdfGuestUtilityButtonText}>Refresh</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.pdfGuestHint}>
                    Live presenter controls stay with the sharer. Your view follows the live document.
                  </Text>
                </>
              ) : null}
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
  galleryGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 92,
    paddingHorizontal: 8,
    paddingBottom: 132,
    alignContent: 'flex-start',
  },
  galleryTile: {
    padding: 4,
  },
  galleryTileInner: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#081019',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  galleryTileLabelWrap: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(4,10,16,0.72)',
  },
  tileBrandChip: {
    position: 'absolute',
    left: 8,
    top: 8,
    zIndex: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,16,27,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.34)',
  },
  tileBrandChipText: {
    color: '#E0F2FE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  galleryTileLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  galleryOverflowBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(8,20,36,0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(80,146,255,0.28)',
  },
  galleryOverflowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
  },
  pictureInPicture: {
    position: 'absolute',
    width: 92,
    height: 136,
    borderRadius: 14,
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
    paddingRight: 8,
    minWidth: 0,
  },
  topBarCenter: {
    flexShrink: 0,
    minWidth: 0,
    maxWidth: 144,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
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
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  driftRoomTitle: {
    color: '#30e6b6',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  premiumCountdownPill: {
    minWidth: 0,
    maxWidth: 144,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#0EA5D9',
    borderWidth: 1,
    borderColor: '#0EA5D9',
  },
  premiumCountdownText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
    flexShrink: 1,
  },
  closeChip: {
    backgroundColor: '#111827',
    minWidth: 50,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.28)',
    alignItems: 'center',
  },
  closeChipText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 18,
  },
  topIconChip: {
    minWidth: 50,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  topIconChipText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 18,
  },
  rightRail: {
    position: 'absolute',
    gap: 8,
  },
  railButton: {
    minWidth: 108,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.18)',
    backgroundColor: 'rgba(7,18,29,0.78)',
    shadowColor: '#020617',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    alignItems: 'center',
  },
  railIcon: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  railEmojiLine: {
    color: '#7DD3FC',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  soundBadge: {
    position: 'absolute',
    left: 14,
    right: 96,
    bottom: 134,
    borderRadius: 16,
    backgroundColor: 'rgba(141,0,0,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  soundBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  screenShareBanner: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 132,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(4,18,32,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.45)',
  },
  screenShareBannerText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  meetingStatusOverlay: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 182,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(4,18,32,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.4)',
    gap: 4,
  },
  meetingStatusText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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
  raisedHandsWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  raisedHandsTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  raisedHandsText: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '700',
  },
  docsPanel: {
    position: 'absolute',
    width: 260,
    zIndex: 14,
    elevation: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(10,16,24,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 12,
  },
  docsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  docsPanelClose: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 4,
  },
  docsPanelStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  docsShareButtonWrap: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  roomJoiningOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 58,
    height: 58,
    marginLeft: -29,
    marginTop: -29,
    borderRadius: 29,
    backgroundColor: 'rgba(6,13,22,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  docsShareButton: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.24)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  docsShareButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  docsProgressCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  docsProgressTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  docsProgressMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  docsEmptyText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
  screenShareHostStage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1220',
    paddingHorizontal: 28,
  },
  sharedFileStage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07111D',
    paddingHorizontal: 28,
  },
  sharedFileStageBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.36)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    marginBottom: 14,
  },
  sharedFileStageBadgeText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sharedFileStageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    maxWidth: 340,
  },
  sharedFileStageMeta: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 340,
  },
  screenShareHostTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  screenShareHostMeta: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 320,
  },
  screenShareInsetStage: {
    backgroundColor: 'rgba(11,18,32,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenShareInsetText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sharedFileFallbackCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 10,
  },
  sharedFileFallbackType: {
    color: '#8D0000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sharedFileFallbackTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  sharedFileFallbackMeta: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  sharedFileFallbackHint: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  docsRow: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  docsRowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  docsRowMeta: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 11,
    marginTop: 4,
  },
  premiumCommentPanel: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'rgba(6,13,22,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 10,
    maxHeight: SCREEN_HEIGHT * 0.24,
  },
  premiumCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  premiumCommentTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  premiumCommentClose: {
    color: '#9de8ff',
    fontSize: 11,
    fontWeight: '800',
  },
  premiumCommentScroll: {
    maxHeight: SCREEN_HEIGHT * 0.18,
  },
  premiumCommentScrollContent: {
    paddingBottom: 4,
  },
  premiumCommentEmpty: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 14,
  },
  premiumCommentBubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 7,
  },
  premiumCommentAuthor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  premiumCommentReply: {
    color: '#8fdcff',
    fontSize: 11,
    marginBottom: 4,
  },
  premiumCommentText: {
    color: '#F7FBFF',
    fontSize: 12,
    lineHeight: 17,
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
    flexShrink: 1,
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
    flexShrink: 1,
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
    flexShrink: 1,
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
    flexShrink: 1,
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
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  primaryStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    flexShrink: 1,
  },
  premiumPrimaryStartButton: {
    backgroundColor: '#8D0000',
  },
  premiumPrimaryStartButtonText: {
    color: '#FFFFFF',
  },
  secondaryStartButton: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.26)',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  secondaryStartButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    flexShrink: 1,
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
  pdfBackdrop: {
    flex: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pdfCard: {
    width: '100%',
    maxWidth: 980,
    height: '100%',
    backgroundColor: '#05070d',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  pdfHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  pdfTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  pdfIconButton: {
    backgroundColor: '#0F172A',
    minWidth: 52,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 18,
  },
  pdfCloseButton: {
    backgroundColor: '#1E293B',
    minWidth: 52,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 18,
  },
  pdfPreviewFrame: {
    flex: 1,
    minHeight: 420,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 12,
  },
  pdfBrandChip: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 3,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(6,16,27,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
  },
  pdfBrandChipText: {
    color: '#0EA5E9',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  pdfPreviewScroll: {
    width: '100%',
    flex: 1,
  },
  pdfPreviewScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfPreviewImage: {
    borderRadius: 12,
  },
  pdfPagerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pdfPagerRowDisabled: {
    opacity: 0.46,
  },
  pdfPagerButton: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  pdfPagerButtonDisabled: {
    backgroundColor: 'rgba(15,23,42,0.38)',
    borderColor: 'rgba(148,163,184,0.14)',
  },
  pdfPagerButtonActive: {
    backgroundColor: '#0B3B57',
    borderColor: 'rgba(34,211,238,0.38)',
  },
  pdfPagerButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  pdfPageCounterText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 8,
  },
  pdfSlideSpeedText: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
  },
  pdfGuestHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  pdfGuestUtilityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  pdfGuestUtilityButton: {
    backgroundColor: '#0F172A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  pdfGuestUtilityButtonText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  stageBrandChip: {
    position: 'absolute',
    zIndex: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(6,16,27,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
  },
  stageBrandChipText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  networkWarningBanner: {
    position: 'absolute',
    zIndex: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(127,29,29,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(254,202,202,0.34)',
  },
  networkWarningText: {
    color: '#FEE2E2',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  maximizeDocChip: {
    position: 'absolute',
    backgroundColor: 'rgba(14,165,217,0.96)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    zIndex: 6,
  },
  maximizeDocChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  pdfPointerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D30000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pdfHighlightMarker: {
    position: 'absolute',
    width: 152,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 230, 0, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.72)',
  },
  pdfInkSegment: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pdfInkPoint: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
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
