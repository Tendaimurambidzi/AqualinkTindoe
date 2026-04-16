import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert, Linking, TextInput, StyleSheet, Modal } from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatarWithCrew from '../components/ProfileAvatarWithCrew';
import PosterActionBar from '../components/PosterActionBar';
import VideoWithTapControls from '../components/VideoWithTapControls';
import ClickableTextWithLinks from '../components/ClickableTextWithLinks';
import OnlineUsersList from '../components/OnlineUsersList';
import ProfilePreviewModal from '../components/ProfilePreviewModal';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { formatPresenceLastSeenExact } from '../services/timeUtils';
import { Asset } from 'react-native-image-picker';
import { appTokens } from '../theme/tokens';
import {
  CaptionStylePreset,
  getTextOverlayPresetStyle,
} from '../components/MediaEditor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ui = {
  colors: {
    card: appTokens.colors.surface,
    border: appTokens.colors.border,
    heading: appTokens.colors.heading,
    body: appTokens.colors.body,
    subtle: appTokens.colors.subtle,
    link: appTokens.colors.link,
    accent: appTokens.colors.accent,
    accentSoft: appTokens.colors.surfaceMuted,
    success: appTokens.colors.success,
    danger: appTokens.colors.danger,
  },
  radius: { md: appTokens.radius.md, lg: appTokens.radius.lg, xl: appTokens.radius.xl },
  spacing: { xs: appTokens.spacing.xs, sm: appTokens.spacing.sm, md: appTokens.spacing.md, lg: appTokens.spacing.lg },
  type: { title: appTokens.type.title, body: appTokens.type.body, caption: appTokens.type.caption, meta: appTokens.type.meta },
};

const normalizeLinkTarget = (value?: string | null) => {
  const cleaned = String(value || '').trim().replace(/[),.;!?]+$/, '');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/^www\./i.test(cleaned)) return `https://${cleaned}`;
  return cleaned;
};
let RNVideo: any = null;
try {
  RNVideo = require('react-native-video').default;
} catch {}

const STORY_THEMES = [
  { colors: ['#0f172a', '#1e3a8a'] as [string, string], accent: '#bfdbfe' },
  { colors: ['#1f2937', '#0f766e'] as [string, string], accent: '#99f6e4' },
  { colors: ['#312e81', '#6d28d9'] as [string, string], accent: '#ddd6fe' },
  { colors: ['#3f1d2e', '#9a3412'] as [string, string], accent: '#fed7aa' },
];

const isAudioAsset = (asset: Asset | null | undefined): boolean => {
  if (!asset) return false;
  const t = String(asset.type || '').toLowerCase();
  if (t.includes('audio')) return true;
  const uri = String(asset.uri || '').toLowerCase();
  return /(\.(mp3|m4a|aac|wav|ogg|flac))($|\?)/i.test(uri);
};

const isImageAsset = (asset: Asset | null | undefined): boolean => {
  if (!asset) return false;
  const t = String(asset.type || '').toLowerCase();
  if (t.includes('image')) return true;
  const uri = String(asset.uri || '').toLowerCase();
  return /(\.(jpg|jpeg|png|gif|webp|heic))($|\?)/i.test(uri);
};

type Vibe = {
  id: string;
  media?: Asset | null;
  mediaItems?: Asset[] | null;
  audio?: { uri: string; name?: string } | null;
  postType?: string | null;
  mediaEdits?: {
    filter?: 'none' | 'warm' | 'cool' | 'mono' | 'vivid';
    brightness?: number;
    contrast?: number;
    vignette?: number;
    mirror?: boolean;
    flipVertical?: boolean;
    playbackRate?: number;
    volumeBoost?: number;
    voiceMode?: 'normal' | 'chipmunk' | 'deep' | 'robot';
    stickers?: Array<{ id: string; emoji: string; x: number; y: number; size: number; rotation?: number }>;
    textOverlay?: {
      text: string;
      x: number;
      y: number;
      fontSize: number;
      color: string;
      fontWeight?: '400' | '500' | '600' | '700' | '800';
      rotation?: number;
      textAlign?: 'left' | 'center' | 'right';
      stylePreset?: CaptionStylePreset;
      backgroundColor?: string | null;
      paddingHorizontal?: number;
      paddingVertical?: number;
      borderRadius?: number;
      shadow?: boolean;
      animationPreset?: 'none' | 'pulse' | 'float';
    } | null;
    mediaTextOverlays?: Array<{
      text: string;
      x: number;
      y: number;
      fontSize: number;
      color: string;
      fontWeight?: '400' | '500' | '600' | '700' | '800';
      rotation?: number;
      textAlign?: 'left' | 'center' | 'right';
      stylePreset?: CaptionStylePreset;
      backgroundColor?: string | null;
      paddingHorizontal?: number;
      paddingVertical?: number;
      borderRadius?: number;
      shadow?: boolean;
      animationPreset?: 'none' | 'pulse' | 'float';
    } | null>;
  } | null;
  captionText: string;
  playbackUrl?: string | null;
  muxStatus?: 'pending' | 'ready' | 'failed';
  authorName?: string | null;
  ownerUid?: string | null;
  user?: {
    name: string;
    avatar: string | null;
    bio?: string | null;
  } | null;
  image?: string | null;
  counts?: {
    splashes?: number;
    echoes?: number;
  };
};

type UserStatus = {
  type: 'here' | 'away' | 'composing';
  time?: string;
};

interface MainFeedItemProps {
  item: Vibe;
  index: number;
  myUid: string | null;
  profileName: string;
  profileBio: string;
  profileMinuteFameTitle?: string;
  userData: Record<string, { name: string; avatar: string; bio: string; lastSeen: Date | null; lastActiveAt?: Date | null; online?: boolean; minuteFameTitle?: string | null }>;
  ensureUserData: (uid: string) => Promise<any>;
  waveStats: Record<string, any>;
  isInUserCrew: Record<string, boolean>;
  optimisticCrewCounts: Record<string, number>;
  expandedPosts: Record<string, boolean>;
  revealedImages: Set<string>;
  isCurrentUserOnline: boolean;
  bufferingMap: Record<string, boolean>;
  postEchoLists: Record<string, any[]>;
  expandedEchoes: Record<string, boolean>;
  echoesPageSize: Record<string, number>;
  echoExpansionInProgress: Record<string, boolean>;
  reachCounts: Record<string, number>;
  isPaused: boolean;
  allowPlayback: boolean;
  showMakeWaves: boolean;
  showAudioModal: boolean;
  capturedMedia: any;
  showLive: boolean;
  activeVideoId: string | null;
  preloadedVideoIds: Set<string>;
  overlayReadyMap: Record<string, any>;
  isWifi: boolean;
  bridge: any;
  currentIndex: number;
  displayHandle: (uid: string, name?: string) => string;
  formatDefiniteTime: (date: any) => string;
  translate: (key: string, values?: Record<string, string | number>) => string;
  openWaveOptions: (item: Vibe) => void;
  handleToggleVibe: (targetUid: string, targetName?: string) => void;
  setExpandedPosts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setRevealedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  recordVideoReach: (id: string) => Promise<void>;
  recordImageReach: (id: string) => Promise<void>;
  markBuffering: (id: string, isBuffering: boolean) => void;
  recordTextReach?: (postId: string) => Promise<any>;
  onVideoPlaybackError: (id: string, code?: string) => void;
  setPreservedScrollPosition: (index: number) => void;
  navigation: any;
  ensureSplash: (id: string) => Promise<void>;
  removeSplash: (id: string) => Promise<void>;
  setWavesFeed: React.Dispatch<React.SetStateAction<Vibe[]>>;
  setVibesFeed: React.Dispatch<React.SetStateAction<Vibe[]>>;
  setPublicFeed: React.Dispatch<React.SetStateAction<Vibe[]>>;
  setPostFeed: React.Dispatch<React.SetStateAction<Vibe[]>>;
  setEchoWaveId: (id: string) => void;
  setCurrentIndex: (index: number) => void;
  setShowEchoes: (show: boolean) => void;
  setShowPearls: (show: boolean) => void;
  anchorWave: (item: Vibe) => void;
  onShareWave: (item: Vibe) => void;
  setEchoExpansionInProgress: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setExpandedEchoes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setEchoesPageSize: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  videoStyleFor: (id: string) => any;
  isVideoAsset: (asset: Asset | null | undefined) => boolean;
  onReplyToEcho: (waveId: string, echo: any) => void;
  onOpenCreatorProfile: (userId: string, userName?: string | null) => void;
  onOpenProfilePicture: (uri: string) => void;
  onOpenFleetDeck: () => void;
  fleetDeckBadgeCount?: number;
}

const MainFeedItem = memo<MainFeedItemProps>(({
  item,
  index,
  myUid,
  profileName,
  profileBio,
  profileMinuteFameTitle,
  userData,
  ensureUserData,
  waveStats,
  isInUserCrew,
  optimisticCrewCounts,
  expandedPosts,
  revealedImages,
  isCurrentUserOnline,
  bufferingMap,
  postEchoLists,
  expandedEchoes,
  echoesPageSize,
  echoExpansionInProgress,
  reachCounts,
  isPaused,
  allowPlayback,
  showMakeWaves,
  showAudioModal,
  capturedMedia,
  showLive,
  activeVideoId,
  preloadedVideoIds,
  overlayReadyMap,
  isWifi,
  bridge,
  currentIndex,
  displayHandle,
  formatDefiniteTime,
  translate,
  openWaveOptions,
  handleToggleVibe,
  setExpandedPosts,
  setRevealedImages,
  recordVideoReach,
  recordImageReach,
  markBuffering,
  onVideoPlaybackError,
  setPreservedScrollPosition,
  navigation,
  ensureSplash,
  removeSplash,
  setWavesFeed,
  setVibesFeed,
  setPublicFeed,
  setPostFeed,
  setEchoWaveId,
  setCurrentIndex,
  setShowEchoes,
  setShowPearls,
  anchorWave,
  onShareWave,
  setEchoExpansionInProgress,
  setExpandedEchoes,
  setEchoesPageSize,
  videoStyleFor,
  isVideoAsset,
  onReplyToEcho,
  onOpenCreatorProfile,
  onOpenProfilePicture,
  onOpenFleetDeck,
  fleetDeckBadgeCount = 0,
  recordTextReach,
}) => {
  const [status, setStatus] = useState<string>('');
  const [isHereNow, setIsHereNow] = useState<boolean>(false);
  const [activeEchoActionId, setActiveEchoActionId] = useState<string | null>(null);
  const [localEchoHugs, setLocalEchoHugs] = useState<Record<string, { hugs: number; hugged: boolean }>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [echoReplies, setEchoReplies] = useState<Record<string, any[]>>({});
  const [replyPreviews, setReplyPreviews] = useState<Record<string, any>>({});
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [audioControlsVisible, setAudioControlsVisible] = useState(false);
  const [overlayAudioLoaded, setOverlayAudioLoaded] = useState(false);
  const [overlayAudioStarted, setOverlayAudioStarted] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [activeGridVideoIndex, setActiveGridVideoIndex] = useState<number>(-1);
  const [splashSyncStatus, setSplashSyncStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [lastSplashAction, setLastSplashAction] = useState<'add' | 'remove' | null>(null);
  const [preferFallbackVideoSource, setPreferFallbackVideoSource] = useState(false);
  const audioControlsTimerRef = useRef<any>(null);

  useEffect(() => {
    setPreferFallbackVideoSource(false);
  }, [item.id, item.playbackUrl, item.media?.uri]);

  useEffect(() => {
    setOverlayAudioLoaded(false);
    setOverlayAudioStarted(false);
  }, [item.id, item.audio?.uri]);

  const revealAudioControlsTemporarily = useCallback(() => {
    setAudioControlsVisible(true);
    if (audioControlsTimerRef.current) {
      try {
        clearTimeout(audioControlsTimerRef.current);
      } catch {}
    }
    audioControlsTimerRef.current = setTimeout(() => {
      setAudioControlsVisible(false);
      audioControlsTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (audioControlsTimerRef.current) {
        try {
          clearTimeout(audioControlsTimerRef.current);
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    const ownerUid = item.ownerUid;
    if (ownerUid === myUid) {
      setIsHereNow(false);
      setStatus('');
      return;
    }

    const ONLINE_GRACE_MS = 20 * 1000;
    const postFallbackTs = (item as any)?.createdAt || (item as any)?.timestamp || new Date();

    const toMillis = (input: any): number => {
      if (!input) return 0;
      if (typeof input?.toDate === 'function') return input.toDate().getTime();
      if (typeof input === 'number') return input < 1e12 ? input * 1000 : input;
      if (typeof input === 'object') {
        const seconds =
          typeof input.seconds === 'number'
            ? input.seconds
            : typeof input._seconds === 'number'
            ? input._seconds
            : null;
        const nanoseconds =
          typeof input.nanoseconds === 'number'
            ? input.nanoseconds
            : typeof input._nanoseconds === 'number'
            ? input._nanoseconds
            : 0;
        if (seconds !== null) return seconds * 1000 + Math.floor(nanoseconds / 1e6);
      }
      const d = new Date(input);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    if (!ownerUid) {
      setIsHereNow(false);
      setStatus(translate('feed.awayUnknown'));
      return;
    }

    const fallbackLastSeen = userData[ownerUid]?.lastSeen || postFallbackTs;
    let firestoreOnline = userData[ownerUid]?.online === true;
    let rtdbOnline = false;
    let firestoreLastSeen: any = fallbackLastSeen;
    let rtdbLastSeen: any = null;
    let firestoreLastActiveAt: any = userData[ownerUid]?.lastActiveAt || null;
    let rtdbLastActiveAt: any = null;

    const chooseMostRecent = (a: any, b: any) => {
      return toMillis(a) >= toMillis(b) ? a : b;
    };

    const refreshStatus = () => {
      const mostRecentLastSeen = chooseMostRecent(firestoreLastSeen, rtdbLastSeen);
      const mostRecentActive = chooseMostRecent(firestoreLastActiveAt, rtdbLastActiveAt);
      const referenceActiveTs = mostRecentActive || mostRecentLastSeen;
      const onlineByFreshSignal =
        (rtdbOnline || firestoreOnline) &&
        toMillis(referenceActiveTs) > 0 &&
        Date.now() - toMillis(referenceActiveTs) <= ONLINE_GRACE_MS;
      const online = onlineByFreshSignal;
      if (online) {
        setIsHereNow(true);
        setStatus(translate('feed.hereNow'));
        return;
      }
      const resolvedLastSeen = mostRecentLastSeen || mostRecentActive || null;
      const exact =
        formatPresenceLastSeenExact(resolvedLastSeen) ||
        formatPresenceLastSeenExact(userData[ownerUid]?.lastSeen || null);
      setIsHereNow(false);
      setStatus(
        exact
          ? translate('feed.awaySince', { time: exact })
          : translate('feed.awayUnknown'),
      );
    };

    refreshStatus();
    const freshnessTimer = setInterval(refreshStatus, 30000);

    const unsubscribeFs = firestore().doc(`users/${ownerUid}`).onSnapshot((doc) => {
      const data = doc?.data() || {};
      firestoreOnline = data?.online === true;
      firestoreLastSeen = data?.lastSeen || fallbackLastSeen;
      firestoreLastActiveAt =
        data?.lastActiveAt || data?.lastHeartbeat || userData[ownerUid]?.lastActiveAt || null;
      refreshStatus();
    });
    const presenceRef = database().ref(`/presence/${ownerUid}`);
    const onPresence = presenceRef.on('value', snap => {
      const val = snap.val() || {};
      rtdbOnline = val?.online === true;
      rtdbLastSeen = val?.lastSeen || null;
      rtdbLastActiveAt = val?.lastActiveAt || val?.lastHeartbeat || null;
      refreshStatus();
    });

    return () => {
      clearInterval(freshnessTimer);
      unsubscribeFs();
      presenceRef.off('value', onPresence);
    };
  }, [item.ownerUid, myUid, translate, userData]);

  // Calculate play conditions
  const isAnyModalOpen = showMakeWaves || showAudioModal || !!capturedMedia || showLive;
  const shouldPlay = !isPaused && allowPlayback && !isAnyModalOpen;

  const maxBr = isWifi
    ? 1_500_000
    : Math.min(
        bridge.dataSaverDefaultOnCell
          ? Math.min(bridge.cellularMaxBitrateH264, bridge.cellularMaxBitrateHEVC)
          : bridge.cellularMaxBitrateH264,
        600_000,
      );

  const galleryMediaItems = useMemo(() => {
    if (Array.isArray(item.mediaItems) && item.mediaItems.length > 0) {
      return item.mediaItems.filter(asset => !!asset?.uri);
    }
    if (Array.isArray((item as any).galleryItems) && (item as any).galleryItems.length > 0) {
      return (item as any).galleryItems.filter((asset: any) => !!asset?.uri);
    }
    return item.media?.uri ? [item.media] : [];
  }, [item.media, item.mediaItems, (item as any).galleryItems]);
  const primaryMedia = (galleryMediaItems[0] || item.media || null) as Asset | null;
  const mediaUri = String(primaryMedia?.uri || '').trim();
  const mediaType = String(primaryMedia?.type || '').toLowerCase();
  const hasMultiMediaGrid = galleryMediaItems.length > 1;
  const previewGridItems = galleryMediaItems.slice(0, 6);
  const hiddenGridCount = Math.max(0, galleryMediaItems.length - 6);
  const latestGridVideoIndex = useMemo(
    () =>
      [...galleryMediaItems]
        .map((mediaItem, mediaIndex) => (isVideoAsset(mediaItem) ? mediaIndex : -1))
        .filter(mediaIndex => mediaIndex >= 0)
        .pop() ?? -1,
    [galleryMediaItems, isVideoAsset],
  );
  const gridVideoCount = useMemo(
    () => galleryMediaItems.filter(mediaItem => isVideoAsset(mediaItem)).length,
    [galleryMediaItems, isVideoAsset],
  );
  const explicitPostType = String(item.postType || '').toLowerCase();
  const isExplicitVideo = explicitPostType === 'video';
  const isExplicitImage = explicitPostType === 'image';
  const isExplicitAudio = explicitPostType === 'audio';
  const playbackUri = String(item.playbackUrl || '');
  const playbackLooksVideo =
    isExplicitVideo ||
    /(\.m3u8|\.mp4|\.mov|\.webm|\.mkv)(\?|$)/i.test(playbackUri.toLowerCase()) ||
    /\/video\//i.test(playbackUri) ||
    mediaType.includes('video/');
  const hasVideoMedia =
    isExplicitVideo ||
    isVideoAsset(primaryMedia) ||
    (!isExplicitImage && !isImageAsset(primaryMedia) && !!item.playbackUrl && playbackLooksVideo) ||
    (mediaUri.length > 0 && mediaType.startsWith('video/'));
  const hasImageMedia =
    mediaUri.length > 0 &&
    (isExplicitImage || isImageAsset(primaryMedia) || (!hasVideoMedia && mediaType.startsWith('image/')));
  const audioOnlyPost =
    (isExplicitAudio ||
      (!item.playbackUrl && !!item.audio?.uri && !hasVideoMedia && !hasImageMedia) ||
      (!item.playbackUrl && !!primaryMedia && isAudioAsset(primaryMedia) && !hasVideoMedia && !hasImageMedia)) &&
    !hasVideoMedia &&
    !hasImageMedia;
  const primaryVideoSource =
    item.playbackUrl && playbackLooksVideo ? String(item.playbackUrl) : String(primaryMedia?.uri || '');
  const fallbackVideoSource =
    item.playbackUrl && playbackLooksVideo && primaryMedia?.uri && primaryMedia.uri !== item.playbackUrl
      ? String(primaryMedia.uri)
      : '';
  const videoSourceUri =
    (preferFallbackVideoSource ? fallbackVideoSource || primaryVideoSource : primaryVideoSource || fallbackVideoSource) ||
    '';
  // Always honor overlay audio on visual posts so image/video + audio plays as intended.
  const hasOverlayAudio = !!item.audio?.uri && !audioOnlyPost && (hasVideoMedia || hasImageMedia);
  const overlayReady = !hasOverlayAudio || overlayAudioLoaded;
  const audioPlaySynced = shouldPlay && item.id === activeVideoId && overlayReady;
  const videoPlaySynced =
    shouldPlay &&
    item.id === activeVideoId &&
    (!hasOverlayAudio || !hasVideoMedia || overlayAudioStarted);
  const shouldPreload = preloadedVideoIds.has(item.id);
  const near = Math.abs(index - currentIndex) <= 1;
  const isGridPostInFocus = shouldPlay && index === currentIndex;
  const hasUnknownMediaFile =
    !!primaryMedia && mediaUri.length > 0 && !hasVideoMedia && !hasImageMedia && !audioOnlyPost;
  const hasRenderableMedia = hasVideoMedia || audioOnlyPost || hasImageMedia || hasUnknownMediaFile;
  const textOnlyStory = !primaryMedia && !item.image && !item.audio?.uri;
  const mediaEdits = item.mediaEdits || null;
  const fallbackAwayText = (() => {
    const exact = formatPresenceLastSeenExact(userData[item.ownerUid || '']?.lastSeen || null);
    return exact
      ? translate('feed.awaySince', { time: exact })
      : translate('feed.awayUnknown');
  })();
  const storyTheme = useMemo(() => {
    const seed = String(item.id || '')
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return STORY_THEMES[seed % STORY_THEMES.length];
  }, [item.id]);

  useEffect(() => {
    setActiveGridVideoIndex(latestGridVideoIndex);
  }, [item.id, latestGridVideoIndex]);

  const filterOverlayStyle = (() => {
    const f = mediaEdits?.filter || 'none';
    if (f === 'warm') return { backgroundColor: 'rgba(255,155,84,0.20)' };
    if (f === 'cool') return { backgroundColor: 'rgba(90,170,255,0.18)' };
    if (f === 'mono') return { backgroundColor: 'rgba(0,0,0,0.30)' };
    if (f === 'vivid') return { backgroundColor: 'rgba(255,0,120,0.10)' };
    return null;
  })();

  const brightnessOverlayStyle =
    mediaEdits && Number(mediaEdits.brightness || 0) !== 0
      ? {
          backgroundColor:
            Number(mediaEdits.brightness) > 0
              ? `rgba(255,255,255,${Math.min(0.4, Number(mediaEdits.brightness) / 100)})`
              : `rgba(0,0,0,${Math.min(0.45, Math.abs(Number(mediaEdits.brightness)) / 90)})`,
        }
      : null;

  const contrastOverlayStyle =
    mediaEdits && Number(mediaEdits.contrast || 0) !== 0
      ? {
          backgroundColor:
            Number(mediaEdits.contrast) > 0
              ? `rgba(255,255,255,${Math.min(0.22, Number(mediaEdits.contrast) / 260)})`
              : `rgba(0,0,0,${Math.min(0.28, Math.abs(Number(mediaEdits.contrast)) / 220)})`,
        }
      : null;

  const vignetteOverlayStyle =
    mediaEdits && Number(mediaEdits.vignette || 0) > 0
      ? {
          backgroundColor: `rgba(0,0,0,${Math.min(0.34, Number(mediaEdits.vignette) / 180)})`,
        }
      : null;
  const textOverlay = mediaEdits?.textOverlay;
  const buildFeedTextOverlay = useCallback(
    (
      overlay: NonNullable<NonNullable<Vibe['mediaEdits']>['textOverlay']>,
      frameWidth: number,
      frameHeight: number,
    ) => {
      const presetStyle = getTextOverlayPresetStyle(overlay || undefined);
      const overlayWidth = Math.max(96, Math.min(frameWidth * 0.8, frameWidth - 16));
      return {
        containerStyle: {
          position: 'absolute' as const,
          left: Math.max(
            8,
            Math.min(
              frameWidth - overlayWidth - 8,
              Number(overlay?.x ?? 0.5) * frameWidth - overlayWidth / 2,
            ),
          ),
          top: Math.max(
            8,
            Math.min(
              frameHeight - 56,
              Number(overlay?.y ?? 0.72) * frameHeight - (overlay?.fontSize || 28),
            ),
          ),
          width: overlayWidth,
          alignItems: 'center' as const,
          paddingHorizontal:
            overlay?.paddingHorizontal ?? presetStyle.paddingHorizontal,
          paddingVertical:
            overlay?.paddingVertical ?? presetStyle.paddingVertical,
          borderRadius: overlay?.borderRadius ?? presetStyle.borderRadius,
          backgroundColor:
            overlay?.backgroundColor ??
            presetStyle.backgroundColor ??
            'transparent',
        },
        textStyle: {
          color: overlay?.color || presetStyle.textColor,
          fontSize: overlay?.fontSize || 28,
          fontWeight: overlay?.fontWeight || '800',
          textAlign: overlay?.textAlign || ('center' as const),
          lineHeight: Math.round((overlay?.fontSize || 28) * 1.18),
          transform: [{ rotate: `${Number(overlay?.rotation || 0)}deg` }],
          textShadowColor:
            typeof overlay?.shadow === 'boolean'
              ? overlay.shadow
                ? 'rgba(0,0,0,0.45)'
                : 'transparent'
              : presetStyle.shadow
              ? 'rgba(0,0,0,0.45)'
              : 'transparent',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius:
            typeof overlay?.shadow === 'boolean'
              ? overlay.shadow
                ? 10
                : 0
              : presetStyle.shadow
              ? 10
              : 0,
        },
      };
    },
    [],
  );

  const handleProfilePress = useCallback(() => {
    if (!item.ownerUid) return;
    if (item.ownerUid === myUid) {
      navigation.navigate('Profile');
    } else {
      onOpenCreatorProfile(item.ownerUid, item.authorName || item.user?.name || null);
    }
  }, [item.authorName, item.ownerUid, item.user?.name, myUid, navigation, onOpenCreatorProfile]);

  const handleAvatarPress = useCallback(() => {
    handleProfilePress();
  }, [handleProfilePress]);

  const handleAvatarLongPress = useCallback(() => {
    const avatarUri =
      (item.ownerUid ? userData[item.ownerUid]?.avatar : null) ||
      item.user?.avatar ||
      null;
    if (avatarUri) {
      onOpenProfilePicture(avatarUri);
    }
  }, [item.ownerUid, item.user?.avatar, onOpenProfilePicture, userData]);

  const normalizeHandleLabel = useCallback((raw?: string | null) => {
    const cleaned = String(raw || '').trim().replace(/^[@/]+/, '');
    return cleaned ? displayHandle(item.ownerUid, cleaned) : '@User';
  }, [displayHandle, item.ownerUid]);

  const handleOnlineUserPress = useCallback((user: { uid: string; name: string }) => {
    setSelectedUserId(user.uid);
    setShowProfilePreview(true);
  }, []);

  const handleChatWithUser = useCallback(async (userId: string, userName: string) => {
    // Open inbox and set the selected thread
    try {
      // Fetch user avatar
      const userRef = database().ref(`/users/${userId}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();
      
      // Navigate to inbox with this user's thread
      // This will be handled by the parent component (App.tsx)
      // For now, we'll just log it
      console.log('Opening chat with:', userId, userName);
      
      // You'll need to pass a callback from App.tsx to handle this
      // For now, let's just show an alert
      Alert.alert('Chat', `Opening chat with ${userName}`);
    } catch (error) {
      console.log('Error opening chat:', error);
      Alert.alert(
        translate('feed.openChatFailedTitle'),
        translate('feed.openChatFailedBody'),
      );
    }
  }, [translate]);

  // Ensure user data is fetched for the post owner
  useEffect(() => {
    if (item.ownerUid && !userData[item.ownerUid]) {
      ensureUserData(item.ownerUid);
    }
  }, [item.ownerUid, userData, ensureUserData]);

  const isLongTextStory = !!item.captionText && item.captionText.length > 500;
  const collapsedTextPreview = useMemo(
    () => (item.captionText ? item.captionText.substring(0, 500).trimEnd() : ''),
    [item.captionText],
  );
  const handleReadMore = useCallback(() => {
    setExpandedPosts(prev => ({ ...prev, [item.id]: !prev[item.id] }));
  }, [item.id, setExpandedPosts]);

  const handleImageReveal = useCallback(() => {
    if (!hasImageMedia) return;
    if (!revealedImages.has(item.id)) {
      setRevealedImages(prev => new Set(prev).add(item.id));
      recordImageReach(item.id).catch(error => {
        console.log('Image reach recording failed:', error.message);
      });
    }
  }, [hasImageMedia, item.id, revealedImages, setRevealedImages, recordImageReach]);
  const openMediaViewer = useCallback((startIndex: number) => {
    setViewerIndex(Math.max(0, Math.min(startIndex, galleryMediaItems.length - 1)));
    setViewerZoom(1);
    setViewerVisible(true);
  }, [galleryMediaItems.length]);

  const handleTextPostPress = useCallback(() => {
    setPreservedScrollPosition(currentIndex);
    navigation.navigate('PostDetail', { post: item });
  }, [currentIndex, item, navigation, setPreservedScrollPosition]);

  const handleLinkPress = useCallback(() => {
    if (item.link) {
      Linking.openURL(normalizeLinkTarget(item.link)).catch(err => console.log('Failed to open link:', err));
    }
  }, [item.link]);

  const handleAddSplash = useCallback(() => {
    setLastSplashAction('add');
    setSplashSyncStatus('saving');
    // IMMEDIATE UI UPDATE - no delay
    const updateFeeds = (feed: Vibe[]) =>
      feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: (v.counts?.splashes || 0) + 1 } } : v);

    setWavesFeed(updateFeeds);
    setVibesFeed(updateFeeds);
    setPublicFeed(updateFeeds);
    setPostFeed(updateFeeds);

    // Database operation in background
    ensureSplash(item.id)
      .then(() => {
        setSplashSyncStatus('idle');
      })
      .catch((error) => {
        console.error('Error adding splash:', error);
        // Revert UI on error
        const revertFeeds = (feed: Vibe[]) =>
          feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: Math.max(0, (v.counts?.splashes || 0) - 1) } } : v);

        setWavesFeed(revertFeeds);
        setVibesFeed(revertFeeds);
        setPublicFeed(revertFeeds);
        setPostFeed(revertFeeds);
        setSplashSyncStatus('error');
      });
  }, [item.id, ensureSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);

  const handleRemoveSplash = useCallback(() => {
    setLastSplashAction('remove');
    setSplashSyncStatus('saving');
    // IMMEDIATE UI UPDATE - no delay
    const updateFeeds = (feed: Vibe[]) =>
      feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: Math.max(0, (v.counts?.splashes || 0) - 1) } } : v);

    setWavesFeed(updateFeeds);
    setVibesFeed(updateFeeds);
    setPublicFeed(updateFeeds);
    setPostFeed(updateFeeds);

    // Database operation in background
    removeSplash(item.id)
      .then(() => {
        setSplashSyncStatus('idle');
      })
      .catch((error) => {
        console.error('Error removing splash:', error);
        // Revert UI on error
        const revertFeeds = (feed: Vibe[]) =>
          feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: (v.counts?.splashes || 0) + 1 } } : v);

        setWavesFeed(revertFeeds);
        setVibesFeed(revertFeeds);
        setPublicFeed(revertFeeds);
        setPostFeed(revertFeeds);
        setSplashSyncStatus('error');
      });
  }, [item.id, removeSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);

  const handleRetrySplashSync = useCallback(() => {
    if (lastSplashAction === 'add') {
      handleAddSplash();
    } else if (lastSplashAction === 'remove') {
      handleRemoveSplash();
    }
  }, [lastSplashAction, handleAddSplash, handleRemoveSplash]);

  const handleEcho = useCallback(() => {
    setEchoWaveId(item.id);
    setCurrentIndex(index);
    setShowEchoes(true);
  }, [item.id, index, setEchoWaveId, setCurrentIndex, setShowEchoes]);

  const handlePearl = useCallback(() => {
    setShowPearls(true);
  }, [setShowPearls]);

  const handleAnchor = useCallback(() => {
    anchorWave(item);
  }, [item, anchorWave]);

  const handleCast = useCallback(() => {
    onShareWave(item);
  }, [item, onShareWave]);

  const handleReachPress = useCallback(() => {
    recordVideoReach(item.id).catch(error => {
      console.log('Reach recording failed:', error.message);
    });
  }, [item.id, recordVideoReach]);

  const handleEchoToggle = useCallback(() => {
    if (echoExpansionInProgress[item.id]) return;

    setEchoExpansionInProgress(prev => ({ ...prev, [item.id]: true }));
    setExpandedEchoes(prev => ({ ...prev, [item.id]: !prev[item.id] }));

    setTimeout(() => {
      setEchoExpansionInProgress(prev => ({ ...prev, [item.id]: false }));
    }, 300);
  }, [item.id, echoExpansionInProgress, setEchoExpansionInProgress, setExpandedEchoes]);

  const handleLoadMoreEchoes = useCallback(() => {
    if (echoExpansionInProgress[item.id]) return;

    setEchoExpansionInProgress(prev => ({ ...prev, [item.id]: true }));
    setEchoesPageSize(prev => ({ ...prev, [item.id]: (prev[item.id] || 5) + 5 }));

    setTimeout(() => {
      setEchoExpansionInProgress(prev => ({ ...prev, [item.id]: false }));
    }, 200);
  }, [item.id, echoExpansionInProgress, setEchoExpansionInProgress, setEchoesPageSize]);

  const getEchoHugState = useCallback((echo: any) => {
    const local = echo?.id ? localEchoHugs[echo.id] : null;
    if (local) {
      return { hugs: Math.max(0, local.hugs), hugged: !!local.hugged };
    }
    const hugs = Math.max(0, Number(echo?.hugs || 0));
    const hugged = !!(myUid && echo?.huggedBy && echo.huggedBy[myUid]);
    return { hugs, hugged };
  }, [localEchoHugs, myUid]);

  const toggleEchoHug = useCallback(async (echo: any) => {
    if (!echo?.id || !myUid) return;
    const { hugs, hugged } = getEchoHugState(echo);
    const nextHugs = Math.max(0, hugs + (hugged ? -1 : 1));
    setLocalEchoHugs(prev => ({
      ...prev,
      [echo.id]: { hugs: nextHugs, hugged: !hugged },
    }));

    try {
      const ref = firestore()
        .collection(`waves/${item.id}/echoes`)
        .doc(echo.id);
      const FieldValue = (firestore as any).FieldValue;
      if (hugged) {
        await ref.update({
          hugs: FieldValue.increment(-1),
          [`huggedBy.${myUid}`]: FieldValue.delete(),
        });
      } else {
        await ref.set(
          {
            hugs: FieldValue.increment(1),
            huggedBy: { [myUid]: true },
          },
          { merge: true },
        );
      }
      console.log('Hug state persisted successfully');
    } catch (e) {
      console.log('Hug persistence error:', e);
      // Revert UI on error
      setLocalEchoHugs(prev => ({
        ...prev,
        [echo.id]: { hugs, hugged },
      }));
    }
  }, [getEchoHugState, item.id, myUid]);

  const handleEchoReply = useCallback((echo: any) => {
    onReplyToEcho(item.id, echo);
  }, [item.id, onReplyToEcho]);

  // Fetch replies for a specific echo
  const fetchRepliesForEcho = useCallback(async (echoId: string) => {
    try {
      const repliesSnap = await firestore()
        .collection(`waves/${item.id}/echoes`)
        .where('replyToEchoId', '==', echoId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const replies = repliesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uid: doc.data().userUid,
      }));
      
      setEchoReplies(prev => ({ ...prev, [echoId]: replies }));
      
      // Set most recent reply as preview
      if (replies.length > 0) {
        setReplyPreviews(prev => ({ ...prev, [echoId]: replies[0] }));
      }
    } catch (error) {
      console.log('Error fetching replies:', error);
    }
  }, [item.id]);

  // Toggle replies expansion
  const toggleReplies = useCallback((echoId: string) => {
    setExpandedReplies(prev => {
      const isExpanding = !prev[echoId];
      if (isExpanding && !echoReplies[echoId]) {
        fetchRepliesForEcho(echoId);
      }
      return { ...prev, [echoId]: isExpanding };
    });
  }, [echoReplies, fetchRepliesForEcho]);

  // Fetch reply previews for all echoes
  useEffect(() => {
    const echoes = postEchoLists[item.id] || [];
    echoes.forEach(echo => {
      if (echo.replyCount > 0 && !replyPreviews[echo.id]) {
        fetchRepliesForEcho(echo.id);
      }
    });
  }, [postEchoLists, item.id, replyPreviews, fetchRepliesForEcho]);

  const renderEchoItem = useCallback((echo: any, idx: number) => {
    const { hugs, hugged } = getEchoHugState(echo);
    const showActions = activeEchoActionId === echo.id;
    const replies = echoReplies[echo.id] || [];
    const hasReplies = (echo.replyCount || 0) > 0;
    const isExpanded = expandedReplies[echo.id];
    const replyCountLabel = `${translate('feed.replyAction')}(${echo.replyCount || 0})`;
    const hugCountLabel = `${translate('feed.hugAction')}(${hugs})`;
    
    return (
      <View
        key={echo.id || idx}
        style={{
          marginBottom: 8,
          padding: 8,
          backgroundColor: 'rgba(255,235,59,0.95)',
          borderRadius: 8,
        }}
      >
        <Pressable
          onPress={() => {
            const nextIsActive = activeEchoActionId !== echo.id;
            setActiveEchoActionId(prev => (prev === echo.id ? null : echo.id));
            if (hasReplies && nextIsActive) {
              setExpandedReplies(prev => {
                const isExpanding = !prev[echo.id];
                if (isExpanding && !echoReplies[echo.id]) {
                  fetchRepliesForEcho(echo.id);
                }
                return { ...prev, [echo.id]: isExpanding };
              });
            } else if (hasReplies && !nextIsActive) {
              setExpandedReplies(prev => ({ ...prev, [echo.id]: false }));
            }
          }}
        >
          <Text style={{ color: 'black', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
            {displayHandle(echo.uid, echo.userName || echo.uid)}
          </Text>
          <Text style={{ color: 'black', fontSize: 14 }}>
            {echo.text}
          </Text>
          <Text style={{ color: 'gray', fontSize: 10 }}>
            {echo.createdAt ? formatDefiniteTime(echo.createdAt) : translate('feed.justNow')}
          </Text>
        </Pressable>

        {/* Expanded Replies */}
        {isExpanded && replies.length > 0 && (
          <View style={{ marginTop: 8, marginLeft: 16, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 10, paddingVertical: 8, paddingRight: 10 }}>
            {replies.map((reply, replyIdx) => (
              <View
                key={reply.id || replyIdx}
                style={{
                  marginBottom: 6,
                  paddingLeft: 12,
                  borderLeftWidth: 2,
                  borderLeftColor: '#1e88e5',
                }}
              >
                <Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>
                  {displayHandle(reply.uid, reply.userName || reply.uid)}
                </Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {reply.text}
                </Text>
                <Text style={{ color: 'gray', fontSize: 9 }}>
                  {reply.createdAt ? formatDefiniteTime(reply.createdAt) : translate('feed.justNow')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {showActions && (
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <Pressable
              onPress={() => toggleEchoHug(echo)}
              style={{
                backgroundColor: 'rgba(255,235,59,0.95)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: hugged ? '#1e88e5' : '#d32f2f' }}>
                {hugCountLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleEchoReply(echo)}
              style={{
                backgroundColor: 'rgba(255,235,59,0.95)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e88e5' }}>
                {replyCountLabel}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }, [activeEchoActionId, displayHandle, echoReplies, expandedReplies, fetchRepliesForEcho, formatDefiniteTime, getEchoHugState, handleEchoReply, toggleEchoHug, translate]);

  return (
    <Pressable>
      <View style={styles.feedCard}>
        {/* Online Users List - Only show on video posts */}
        {hasVideoMedia && (
          <OnlineUsersList
            myUid={myUid}
            onUserPress={handleOnlineUserPress}
          />
        )}

        {/* Profile Preview Modal */}
        <ProfilePreviewModal
          visible={showProfilePreview}
          userId={selectedUserId}
          onClose={() => setShowProfilePreview(false)}
          onChat={handleChatWithUser}
        />
        <View style={styles.postBody}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            {/* Menu button positioned absolutely in top-right */}
            <View pointerEvents="box-none" style={styles.menuButtonWrap}>
              <Pressable
                onPress={() => openWaveOptions(item)}
                style={({ pressed }) => [
                  styles.iconPress,
                  pressed && styles.iconPressActive,
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                delayPressIn={0}
                delayPressOut={0}
              >
                <Text style={styles.menuIcon}>⋮</Text>
              </Pressable>
            </View>

            {/* Centered Profile Info */}
            <Pressable
              style={styles.centeredHeader}
              onPress={handleProfilePress}
              hitSlop={{ top: 14, bottom: 14, left: 18, right: 18 }}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.14)', borderless: false }}
            >
              <View style={styles.headerTopRow}>
                {/* Profile Row: Fleet Deck button (left), Avatar (center), Crew Count (right) */}
                {item.ownerUid === myUid ? (
                  <View style={styles.sideButtonRail}>
                  <Pressable
                    onPress={onOpenFleetDeck}
                    style={({ pressed }) => [
                      {
                      backgroundColor: '#00C2FF',
                      borderRadius: 18,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      marginRight: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 44,
                      position: 'relative',
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 15 }}>FLEET DECKS</Text>
                    {fleetDeckBadgeCount > 0 ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          paddingHorizontal: 5,
                          backgroundColor: '#FFD54A',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(8, 51, 88, 0.22)',
                        }}
                      >
                        <Text style={{ color: '#111827', fontWeight: '900', fontSize: 10 }}>
                          {fleetDeckBadgeCount > 99 ? '99+' : fleetDeckBadgeCount}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                  </View>
                ) : null}
                {/* Avatar and profile info remain unchanged */}

                {/* Connect/Disconnect Button */}
                {item.ownerUid !== myUid && (
                  <View style={styles.sideButtonRail}>
                  <Pressable
                    onPress={() => handleToggleVibe(item.ownerUid!, item.authorName || item.user?.name)}
                    style={({ pressed }) => [
                      styles.joinButton,
                      isInUserCrew[item.ownerUid!] ? styles.joinButtonLeave : styles.joinButtonJoin,
                      pressed && styles.buttonPressed,
                    ]}
                    hitSlop={{ top: 30, bottom: 30, left: 20, right: 20 }}
                    delayPressIn={0}
                    delayPressOut={0}
                    activeOpacity={0.7}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
                    >
                      <Text style={styles.joinButtonText}>
                      {isInUserCrew[item.ownerUid!]
                        ? translate('feed.leaveTide')
                        : translate('feed.joinTide')}
                    </Text>
                  </Pressable>
                  </View>
                )}

                <View style={styles.profileColumn}>
                  <Pressable
                    onPress={handleProfilePress}
                    onLongPress={handleAvatarLongPress}
                    delayLongPress={320}
                    style={styles.avatarRail}
                    hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                    delayPressIn={0}
                    delayPressOut={0}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
                  >
                  <ProfileAvatarWithCrew
                    key={item.ownerUid}
                    userId={item.ownerUid!}
                    size={50}
                    showCrewCount={true}
                    showFleetCount={false}
                    optimisticCrewCount={optimisticCrewCounts[item.ownerUid!]}
                  />
                  </Pressable>
                  <View style={styles.profileTextWrap}>
                  <Text style={{
                    fontWeight: '700',
                    fontSize: ui.type.title,
                    color: ui.colors.heading,
                    textAlign: 'center',
                    marginTop: 8,
                    marginBottom: 2
                  }}>
                {(() => {
                  const isCurrentUserPost = item.ownerUid === myUid;
                  if (isCurrentUserPost) {
                    return normalizeHandleLabel(profileName || 'User');
                  }
                  const userInfo = userData[item.ownerUid!];
                  const displayName = userInfo?.name || item.authorName || item.user?.name || 'User';
                  return normalizeHandleLabel(displayName);
                })()}
                  </Text>
              {(() => {
                const isCurrentUserPost = item.ownerUid === myUid;
                const titleToShow = isCurrentUserPost
                  ? profileMinuteFameTitle
                  : userData[item.ownerUid!]?.minuteFameTitle;
                const rawTitle = String(titleToShow || '').trim().toLowerCase();
                const badgeToShow =
                  rawTitle === 'fresh_face' || rawTitle.includes('fresh face')
                    ? '✨'
                    : rawTitle === 'rising_star' || rawTitle.includes('rising star')
                    ? '⭐'
                    : rawTitle === 'crowd_favorite' || rawTitle.includes('crowd favorite')
                    ? '🔥'
                    : rawTitle === 'wave_king' || rawTitle.includes('wave king')
                    ? '👑'
                    : rawTitle === 'trend_storm' || rawTitle.includes('trend storm')
                    ? '⚡'
                    : rawTitle === 'ocean_legend' || rawTitle.includes('ocean legend')
                    ? '🦈'
                    : String(titleToShow || '').trim().split(/\s+/)[0] || '';
                return badgeToShow ? (
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 17,
                      fontWeight: '900',
                      marginBottom: 4,
                    }}
                  >
                    {badgeToShow}
                  </Text>
                ) : null;
              })()}
              {(() => {
                const isCurrentUserPost = item.ownerUid === myUid;
                const bioToShow = isCurrentUserPost ? profileBio : userData[item.ownerUid!]?.bio;
                return bioToShow ? (
                  <View style={{ marginTop: 2 }}>
                    <Text style={{
                      color: ui.colors.subtle,
                      fontSize: ui.type.caption,
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      {bioToShow}
                    </Text>
                  </View>
                ) : null;
              })()}
              <Text style={{
                color: ui.colors.subtle,
                fontSize: ui.type.caption,
                textAlign: 'center'
              }}>
                {formatDefiniteTime(waveStats[item.id]?.createdAt || item.createdAt || null)}
              </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Post Content - Text or Media */}
          {hasRenderableMedia ? (
            // ...existing media rendering code...
            <></>
          ) : (
            /* Text-only posts */
            <Pressable
              onPress={handleTextPostPress}
              style={[
                styles.textStoryWrap,
                expandedPosts[item.id] ? styles.textStoryWrapExpanded : null,
              ]}
              onLayout={() => {
                if (recordTextReach) {
                  recordTextReach(item.id).catch(error => {
                    console.log('Text reach recording failed:', error?.message || error);
                  });
                }
              }}
            >
              <LinearGradient
                colors={storyTheme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.textStoryCard}
              >
                {/* MoMo badge removed */}
                {isLongTextStory && !expandedPosts[item.id] ? (
                  <Pressable onPress={handleReadMore}>
                    <Text style={styles.textStoryBody}>
                      {collapsedTextPreview}
                      <Text style={[styles.textStoryMore, { color: storyTheme.accent }]}>
                        ... Read More
                      </Text>
                    </Text>
                  </Pressable>
                ) : (
                  <ClickableTextWithLinks
                    text={item.captionText}
                    style={styles.textStoryBody}
                  />
                )}
              </LinearGradient>
            </Pressable>
          )}
            <>
              {/* Post Text (if any) */}
              {item.captionText && !textOnlyStory && (
                <View style={styles.captionWrap}>
                  <ClickableTextWithLinks
                    text={
                      expandedPosts[item.id]
                        ? item.captionText
                        : item.captionText.length > 500
                        ? item.captionText.substring(0, 500) + '...'
                        : item.captionText
                    }
                    style={styles.captionText}
                  />
                </View>
              )}

              {/* Post Link (if any) */}
              {item.link && (
                <View style={styles.linkWrap}>
                  <Pressable
                    onPress={handleLinkPress}
                    style={({ pressed }) => [styles.linkPill, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.linkText}>
                      {item.link}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Post Media */}
              {hasMultiMediaGrid ? (
                <View style={{ marginHorizontal: 0, width: SCREEN_WIDTH, backgroundColor: '#000', paddingHorizontal: 4, paddingVertical: 4 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {previewGridItems.map((mediaItem, mediaIndex) => {
                      const isImage = isImageAsset(mediaItem);
                      const isVideo = isVideoAsset(mediaItem);
                      const isLastVisibleTile =
                        mediaIndex === previewGridItems.length - 1 && hiddenGridCount > 0;
                      const tileOverlay =
                        mediaEdits?.mediaTextOverlays?.[mediaIndex] || null;
                      const tileOverlayRender =
                        tileOverlay?.text?.trim()
                          ? buildFeedTextOverlay(tileOverlay, SCREEN_WIDTH / 2 - 10, SCREEN_WIDTH / 2 - 10)
                          : null;
                      return (
                        <View
                          key={`${mediaItem.uri || 'media'}_${mediaIndex}`}
                          style={{
                            width: '50%',
                            flexBasis: '50%',
                            maxWidth: '50%',
                            padding: 2,
                          }}
                        >
                          <View
                            style={{
                              width: '100%',
                              aspectRatio: 1,
                              backgroundColor: '#111',
                              borderRadius: 10,
                              overflow: 'hidden',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {/* MoMo badge removed */}
                            {isImage ? (
                              <Pressable onPress={() => openMediaViewer(mediaIndex)} style={{ width: '100%', height: '100%' }}>
                                <Image
                                  source={{ uri: String(mediaItem.uri) }}
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                />
                              </Pressable>
                            ) : isVideo ? (
                              <VideoWithTapControls
                                source={{ uri: String(mediaItem.uri) }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                                paused={!(isGridPostInFocus && activeGridVideoIndex === mediaIndex)}
                                isActive={isGridPostInFocus && activeGridVideoIndex === mediaIndex}
                                shouldPreload={near || mediaIndex === latestGridVideoIndex}
                                hideTimeout={4000}
                                muted={activeGridVideoIndex !== mediaIndex}
                                onTap={() => setActiveGridVideoIndex(mediaIndex)}
                              />
                            ) : (
                              <Pressable
                                onPress={() => openMediaViewer(mediaIndex)}
                                style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', padding: 10 }}
                              >
                                <Text style={{ fontSize: 28, color: '#fff' }}>File</Text>
                                <Text style={{ color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center' }} numberOfLines={2}>
                                  {mediaItem.fileName || `Item ${mediaIndex + 1}`}
                                </Text>
                              </Pressable>
                            )}
                            {isLastVisibleTile ? (
                              <View
                                style={{
                                  ...StyleSheet.absoluteFillObject,
                                  backgroundColor: 'rgba(0,0,0,0.56)',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>+{hiddenGridCount}</Text>
                              </View>
                            ) : null}
                            {mediaIndex === 0 && galleryMediaItems.length > 1 ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  left: 8,
                                  bottom: 8,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 999,
                                  backgroundColor: 'rgba(0,0,0,0.52)',
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                                  {galleryMediaItems.length} media{gridVideoCount > 0 ? ` • ${gridVideoCount} video${gridVideoCount > 1 ? 's' : ''}` : ''}
                                </Text>
                              </View>
                            ) : null}
                            {isVideo && mediaIndex !== activeGridVideoIndex ? (
                              <Pressable
                                onPress={() => setActiveGridVideoIndex(mediaIndex)}
                                style={{
                                  position: 'absolute',
                                  right: 8,
                                  bottom: 8,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 999,
                                  backgroundColor: 'rgba(3,7,18,0.64)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(255,255,255,0.14)',
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Play</Text>
                              </Pressable>
                            ) : null}
                            {isVideo && mediaIndex === activeGridVideoIndex ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  left: 8,
                                  top: 8,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 999,
                                  backgroundColor: isGridPostInFocus ? 'rgba(14,165,233,0.88)' : 'rgba(15,23,42,0.82)',
                                }}
                              >
                                <Text style={{ color: isGridPostInFocus ? '#082f49' : '#e2e8f0', fontSize: 10, fontWeight: '900' }}>
                                  {isGridPostInFocus ? 'Playing' : 'Ready'}
                                </Text>
                              </View>
                            ) : null}
                            {tileOverlayRender ? (
                              <View pointerEvents="none" style={tileOverlayRender.containerStyle}>
                                <Text style={tileOverlayRender.textStyle}>
                                  {tileOverlay?.text?.trim()}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : hasVideoMedia ? (
                <View style={{ marginHorizontal: 0, position: 'relative', backgroundColor: '#000' }}>
                  {/* MoMo badge removed */}
                  {!allowPlayback ? (
                    <View
                      style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68, alignItems: 'center', justifyContent: 'center' },
                      ]}
                    >
                      {item.image ? (
                        <Image
                          source={{ uri: String(item.image) }}
                          style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
                          resizeMode="cover"
                        />
                      ) : null}
                      <Text style={{ color: '#fff', fontSize: 28, marginBottom: 8 }}>📴</Text>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>Video unavailable offline</Text>
                    </View>
                  ) : videoSourceUri ? (
                    <VideoWithTapControls
                      source={{ uri: videoSourceUri }}
                      style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68 },
                        {
                          transform: [
                            { scaleX: mediaEdits?.mirror ? -1 : 1 },
                            { scaleY: mediaEdits?.flipVertical ? -1 : 1 },
                          ],
                        },
                      ]}
                      resizeMode={'cover'}
                      paused={!videoPlaySynced}
                      playbackRate={Math.max(0.5, Math.min(2, Number(mediaEdits?.playbackRate || 1)))}
                      audioVolume={Math.max(0, Math.min(2, Number(mediaEdits?.volumeBoost || 1)))}
                      muted={hasOverlayAudio}
                      playInBackground={false}
                      isActive={item.id === activeVideoId}
                      videoId={item.id}
                      shouldPreload={shouldPreload}
                      poster={item.image || undefined}
                      posterResizeMode="cover"
                      bufferConfig={{
                        minBufferMs: 3500,
                        maxBufferMs: 30000,
                        bufferForPlaybackMs: 220,
                        bufferForPlaybackAfterRebufferMs: 500,
                      }}
                      onBuffer={(bufferData: any) => {
                        markBuffering(item.id, !!bufferData?.isBuffering);
                      }}
                      onLoad={() => {
                        markBuffering(item.id, false);
                      }}
                      onError={(err: any) => {
                        markBuffering(item.id, false);
                        if (!preferFallbackVideoSource && fallbackVideoSource) {
                          setPreferFallbackVideoSource(true);
                          return;
                        }
                        const code = String(
                          err?.error?.errorCode ||
                            err?.error?.code ||
                            err?.errorString ||
                            err?.code ||
                            '',
                        ).trim();
                        onVideoPlaybackError(item.id, code || undefined);
                      }}
                      onPlay={() => {
                        recordVideoReach(item.id).catch(error => {
                          console.log('Video reach recording failed:', error.message);
                        });
                      }}
                    />
                  ) : (
                    <View
                      style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68 },
                        {
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#000',
                        },
                      ]}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                        Video source unavailable
                      </Text>
                    </View>
                  )}
                  {filterOverlayStyle ? (
                    <View
                      pointerEvents="none"
                      style={[StyleSheet.absoluteFillObject as any, filterOverlayStyle]}
                    />
                  ) : null}
                  {brightnessOverlayStyle ? (
                    <View
                      pointerEvents="none"
                      style={[StyleSheet.absoluteFillObject as any, brightnessOverlayStyle]}
                    />
                  ) : null}
                  {contrastOverlayStyle ? (
                    <View
                      pointerEvents="none"
                      style={[StyleSheet.absoluteFillObject as any, contrastOverlayStyle]}
                    />
                  ) : null}
                  {vignetteOverlayStyle ? (
                    <View
                      pointerEvents="none"
                      style={[StyleSheet.absoluteFillObject as any, vignetteOverlayStyle]}
                    />
                  ) : null}
                  {(mediaEdits?.stickers || []).map(s => (
                    <Text
                      key={s.id}
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: `${s.x * 100}%`,
                        top: `${s.y * 100}%`,
                        fontSize: s.size || 34,
                        transform: [
                          { translateX: -(s.size || 34) / 2 },
                          { translateY: -(s.size || 34) / 2 },
                          { rotate: `${s.rotation || 0}deg` },
                        ],
                      }}
                    >
                      {s.emoji}
                    </Text>
                  ))}
                  {(() => {
                    if (!textOverlay?.text?.trim()) return null;
                    const overlayRender = buildFeedTextOverlay(
                      textOverlay,
                      SCREEN_WIDTH,
                      Math.min(SCREEN_HEIGHT * 0.68, SCREEN_WIDTH * 1.28),
                    );
                    return (
                      <View pointerEvents="none" style={overlayRender.containerStyle}>
                        <Text style={overlayRender.textStyle}>
                          {textOverlay.text.trim()}
                        </Text>
                      </View>
                    );
                  })()}
                  {hasOverlayAudio && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || '') }}
                      audioOnly
                      paused={!audioPlaySynced}
                      rate={Math.max(0.5, Math.min(2, Number(mediaEdits?.playbackRate || 1)))}
                      volume={Math.max(0, Math.min(2, Number(mediaEdits?.volumeBoost || 1)))}
                      style={{ width: 1, height: 1, opacity: 0 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
                      onLoad={() => setOverlayAudioLoaded(true)}
                      onError={() => setOverlayAudioLoaded(true)}
                      onProgress={(e: any) => {
                        if (!overlayAudioStarted && Number(e?.currentTime || 0) > 0) {
                          setOverlayAudioStarted(true);
                        }
                      }}
                    />
                  ) : null}
                </View>
              ) : audioOnlyPost ? (
                <Pressable
                  onPress={revealAudioControlsTemporarily}
                  style={{
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    minHeight: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    paddingVertical: 20,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🎵</Text>
                  {/* MoMo badge removed */}
                  {RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || primaryMedia?.uri || '') }}
                      audioOnly
                      controls={audioControlsVisible}
                      paused={!audioPlaySynced}
                      rate={Math.max(0.5, Math.min(2, Number(mediaEdits?.playbackRate || 1)))}
                      volume={Math.max(0, Math.min(2, Number(mediaEdits?.volumeBoost || 1)))}
                      style={{ width: SCREEN_WIDTH - 28, height: 64 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
                    />
                  ) : (
                    <Text style={{ color: '#9ab4cf' }}>Audio player unavailable</Text>
                  )}
                </Pressable>
              ) : hasUnknownMediaFile ? (
                <View
                  style={{
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    minHeight: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    paddingVertical: 20,
                    paddingHorizontal: 14,
                  }}
                >
                  {renderMoMoBadge()}
                  <Text style={{ fontSize: 40 }}>📄</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    handleImageReveal();
                    openMediaViewer(0);
                  }}
                >
                  <View
                    style={{
                      position: 'relative',
                      marginHorizontal: 0,
                      width: SCREEN_WIDTH,
                      backgroundColor: '#000',
                    }}
                  >
                    {renderMoMoBadge()}
                    <Image
                      source={{ uri: mediaUri }}
                      style={[
                        videoStyleFor(item.id),
                        { backgroundColor: '#000' },
                        {
                          transform: [
                            { scaleX: mediaEdits?.mirror ? -1 : 1 },
                            { scaleY: mediaEdits?.flipVertical ? -1 : 1 },
                          ],
                        },
                      ]}
                      resizeMode="contain"
                    />
                    {filterOverlayStyle ? (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject as any, filterOverlayStyle]}
                      />
                    ) : null}
                    {brightnessOverlayStyle ? (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject as any, brightnessOverlayStyle]}
                      />
                    ) : null}
                    {contrastOverlayStyle ? (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject as any, contrastOverlayStyle]}
                      />
                    ) : null}
                    {vignetteOverlayStyle ? (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFillObject as any, vignetteOverlayStyle]}
                      />
                    ) : null}
                    {(mediaEdits?.stickers || []).map(s => (
                      <Text
                        key={s.id}
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          left: `${s.x * 100}%`,
                          top: `${s.y * 100}%`,
                          fontSize: s.size || 34,
                          transform: [
                            { translateX: -(s.size || 34) / 2 },
                            { translateY: -(s.size || 34) / 2 },
                            { rotate: `${s.rotation || 0}deg` },
                          ],
                        }}
                      >
                        {s.emoji}
                      </Text>
                    ))}
                    {(() => {
                      if (!textOverlay?.text?.trim()) return null;
                      const overlayRender = buildFeedTextOverlay(
                        textOverlay,
                        SCREEN_WIDTH,
                        Math.min(SCREEN_HEIGHT * 0.68, SCREEN_WIDTH * 1.28),
                      );
                      return (
                        <View pointerEvents="none" style={overlayRender.containerStyle}>
                          <Text style={overlayRender.textStyle}>
                            {textOverlay.text.trim()}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                  {hasOverlayAudio && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || '') }}
                      audioOnly
                      paused={!audioPlaySynced}
                      style={{ width: 1, height: 1, opacity: 0 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
                      onLoad={() => setOverlayAudioLoaded(true)}
                      onError={() => setOverlayAudioLoaded(true)}
                      onProgress={(e: any) => {
                        if (!overlayAudioStarted && Number(e?.currentTime || 0) > 0) {
                          setOverlayAudioStarted(true);
                        }
                      }}
                    />
                  ) : null}
                </Pressable>
              )}
            </>
          ) : (
            /* Text-only posts */
            <Pressable
              onPress={handleTextPostPress}
              style={[
                styles.textStoryWrap,
                expandedPosts[item.id] ? styles.textStoryWrapExpanded : null,
              ]}
            >
              <LinearGradient
                colors={storyTheme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.textStoryCard}
              >
                {/* MoMo badge removed */}
                {isLongTextStory && !expandedPosts[item.id] ? (
                  <Pressable onPress={handleReadMore}>
                    <Text style={styles.textStoryBody}>
                      {collapsedTextPreview}
                      <Text style={[styles.textStoryMore, { color: storyTheme.accent }]}>
                        ... Read More
                      </Text>
                    </Text>
                  </Pressable>
                ) : (
                  <ClickableTextWithLinks
                    text={item.captionText}
                    style={styles.textStoryBody}
                  />
                )}
              </LinearGradient>
            </Pressable>
          )}

          {bufferingMap[item.id] && shouldPlay && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color="#00C2FF" />
            </View>
          )}

          {/* Read More - positioned above footer */}
          {textOnlyStory && isLongTextStory && expandedPosts[item.id] && (
            <Pressable onPress={handleReadMore} style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read Less</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.posterActionWrap}>
          <PosterActionBar
            waveId={item.id}
            currentUserId={myUid || ''}
            splashesCount={item.counts?.splashes || 0}
            echoesCount={item.counts?.echoes || 0}
            pearlsCount={0}
            isAnchored={false}
            isCasted={false}
            creatorUserId={item.ownerUid!}
            onAdd={handleAddSplash}
            onRemove={handleRemoveSplash}
            onEcho={handleEcho}
            onPearl={handlePearl}
            onAnchor={handleAnchor}
            onCast={handleCast}
            splashSyncStatus={splashSyncStatus}
            onRetrySplash={handleRetrySplashSync}
            translate={translate}
          />
        </View>

        <Modal
          visible={viewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setViewerZoom(1);
            setViewerVisible(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' }}>
            {galleryMediaItems[viewerIndex] ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 72, paddingBottom: 172 }}>
                <Pressable
                  onPress={() => {
                    setViewerZoom(1);
                    setViewerVisible(false);
                  }}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 14,
                    zIndex: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(8,16,28,0.66)',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                </Pressable>
                {isImageAsset(galleryMediaItems[viewerIndex]) ? (
                  <ScrollView
                    style={{ width: '100%' }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <ScrollView
                      horizontal
                      contentContainerStyle={{
                        minWidth: '100%',
                        minHeight: SCREEN_HEIGHT * 0.72,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      showsHorizontalScrollIndicator={false}
                    >
                      <Image
                        source={{ uri: String(galleryMediaItems[viewerIndex].uri) }}
                        style={{
                          width: SCREEN_WIDTH * viewerZoom,
                          height: SCREEN_HEIGHT * 0.72 * viewerZoom,
                        }}
                        resizeMode="contain"
                      />
                    </ScrollView>
                  </ScrollView>
                ) : isVideoAsset(galleryMediaItems[viewerIndex]) && RNVideo ? (
                  <RNVideo
                    source={{ uri: String(galleryMediaItems[viewerIndex].uri) }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.72 }}
                    resizeMode="contain"
                    controls
                    paused={false}
                  />
                ) : (
                  <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 42, marginBottom: 12 }}>File</Text>
                    <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
                      {galleryMediaItems[viewerIndex].fileName || 'Attachment'}
                    </Text>
                  </View>
                )}
                <Text style={{ color: 'rgba(255,255,255,0.82)', marginTop: 12 }}>
                  {viewerIndex + 1} / {galleryMediaItems.length}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  {galleryMediaItems.length > 1 ? (
                    <Pressable
                      onPress={() => {
                        setViewerZoom(1);
                        setViewerIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={viewerIndex <= 0}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerIndex <= 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Prev</Text>
                    </Pressable>
                  ) : null}
                  {isImageAsset(galleryMediaItems[viewerIndex]) ? (
                    <Pressable
                      onPress={() => setViewerZoom(prev => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                      disabled={viewerZoom <= 1}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerZoom <= 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Zoom -</Text>
                    </Pressable>
                  ) : null}
                  {isImageAsset(galleryMediaItems[viewerIndex]) ? (
                    <Pressable
                      onPress={() => setViewerZoom(prev => Math.min(4, Number((prev + 0.5).toFixed(1))))}
                      disabled={viewerZoom >= 4}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerZoom >= 4 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Zoom +</Text>
                    </Pressable>
                  ) : null}
                  {galleryMediaItems.length > 1 ? (
                    <Pressable
                      onPress={() => {
                        setViewerZoom(1);
                        setViewerIndex(prev => Math.min(galleryMediaItems.length - 1, prev + 1));
                      }}
                      disabled={viewerIndex >= galleryMediaItems.length - 1}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerIndex >= galleryMediaItems.length - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Next</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : null}
            {galleryMediaItems.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 76, paddingHorizontal: 12 }}
                contentContainerStyle={{ gap: 8, paddingRight: 12 }}
              >
                {galleryMediaItems.map((mediaItem, idx) => (
                  <Pressable
                    key={`${mediaItem.uri || 'thumb'}_${idx}`}
                    onPress={() => {
                      setViewerZoom(1);
                      setViewerIndex(idx);
                    }}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: viewerIndex === idx ? 2 : 1,
                      borderColor: viewerIndex === idx ? '#00C2FF' : 'rgba(255,255,255,0.18)',
                      backgroundColor: '#111',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isImageAsset(mediaItem) ? (
                      <Image
                        source={{ uri: String(mediaItem.uri) }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 }}>
                        {isVideoAsset(mediaItem) ? 'Video' : 'File'}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 18 }}>
              <PosterActionBar
                waveId={item.id}
                currentUserId={myUid || ''}
                splashesCount={item.counts?.splashes || 0}
                echoesCount={item.counts?.echoes || 0}
                pearlsCount={0}
                isAnchored={false}
                isCasted={false}
                creatorUserId={item.ownerUid!}
                onAdd={handleAddSplash}
                onRemove={handleRemoveSplash}
                onEcho={handleEcho}
                onPearl={handlePearl}
                onAnchor={handleAnchor}
                onCast={handleCast}
                splashSyncStatus={splashSyncStatus}
                onRetrySplash={handleRetrySplashSync}
                translate={translate}
              />
            </View>
          </View>
        </Modal>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <Pressable
            onPress={handleReachPress}
            style={({ pressed }) => [styles.statChip, pressed && styles.buttonPressed]}
          >
            <Text style={styles.statLabel}>👁 {translate('feed.reach')}: </Text>
            <Text style={styles.statValue}>{reachCounts[item.id] || 0}</Text>
          </Pressable>
          {item.ownerUid !== myUid && (
            <Text style={[styles.presenceText, { color: isHereNow ? ui.colors.success : ui.colors.subtle }]}>
              {isHereNow ? translate('feed.hereNow') : (status || fallbackAwayText)}
            </Text>
          )}
        </ScrollView>

        {(postEchoLists[item.id] && postEchoLists[item.id].length > 0) ? (
        <View style={styles.echoSection}>
          {/* Echoes Section */}
          {postEchoLists[item.id] && postEchoLists[item.id].length > 0 && (
            <View style={{ marginTop: 10 }}>
              {expandedEchoes[item.id] ? (
                (() => {
                  // Use PosterActionBar logic for echo hug/echo actions for full consistency
                  // ...existing code for rendering echo item...
                  // Replace all local hug/echo logic with calls to PosterActionBar's logic and UI
                  // This ensures 100% consistent behavior and UI
                  // ...existing code...
  },
  postHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: ui.spacing.sm,
    paddingHorizontal: ui.spacing.md,
  },
  menuButtonWrap: {
    position: 'absolute',
    top: 4,
    right: ui.spacing.sm,
    zIndex: 30,
    elevation: 8,
  },
  iconPress: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.24)',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconPressActive: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  menuIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 22,
  },
  centeredHeader: {
    alignItems: 'center',
    width: '100%',
    minHeight: 118,
    paddingHorizontal: 10,
    paddingRight: 58,
    paddingVertical: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    marginBottom: ui.spacing.sm,
  },
  sideButtonRail: {
    minHeight: 58,
    justifyContent: 'center',
  },
  profileColumn: {
    flex: 1,
    alignItems: 'center',
  },
  avatarRail: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextWrap: {
    width: '100%',
    alignItems: 'center',
  },
  joinButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ui.radius.xl,
    borderWidth: 1,
    marginRight: 10,
  },
  joinButtonJoin: {
    borderColor: ui.colors.accent,
    backgroundColor: ui.colors.accent,
  },
  joinButtonLeave: {
    borderColor: ui.colors.danger,
    backgroundColor: ui.colors.danger,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: ui.type.caption,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  captionWrap: {
    paddingHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.md,
  },
  captionText: {
    fontSize: ui.type.body,
    lineHeight: 23,
    color: ui.colors.body,
  },
  linkWrap: {
    paddingHorizontal: ui.spacing.md,
    marginBottom: ui.spacing.md,
  },
  linkPill: {
    backgroundColor: ui.colors.accentSoft,
    paddingHorizontal: ui.spacing.md,
    paddingVertical: ui.spacing.sm,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  linkText: {
    color: ui.colors.link,
    fontSize: ui.type.body,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  readMoreButton: {
    marginTop: ui.spacing.xs,
    marginBottom: 0,
    alignSelf: 'center',
    paddingHorizontal: ui.spacing.md,
    paddingVertical: 6,
    borderRadius: ui.radius.xl,
    backgroundColor: '#EEF4FF',
  },
  readMoreText: {
    color: ui.colors.link,
    fontSize: 13,
    fontWeight: '700',
  },
  textStoryWrap: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  textStoryWrapExpanded: {
    minHeight: 0,
  },
  textStoryCard: {
    width: '100%',
    minHeight: 260,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStoryBody: {
    color: '#F8FAFC',
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  textStoryMore: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  posterActionWrap: {
    marginTop: 0,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: ui.colors.border,
    width: '100%',
    marginTop: ui.spacing.sm,
  },
  statsRow: {
    marginTop: 6,
    paddingHorizontal: ui.spacing.md,
    paddingBottom: ui.spacing.xs,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ui.spacing.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.xl,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 13,
    color: ui.colors.subtle,
    marginRight: 6,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 13,
    color: ui.colors.heading,
    fontWeight: '700',
  },
  presenceText: {
    fontSize: ui.type.meta,
    marginRight: ui.spacing.md,
    fontWeight: '700',
    alignSelf: 'center',
  },
  moreFromCreator: {
    fontSize: 13,
    color: ui.colors.subtle,
    marginRight: ui.spacing.md,
    alignSelf: 'center',
    fontWeight: '600',
  },
  echoSection: {
    marginTop: ui.spacing.md,
    paddingHorizontal: ui.spacing.md,
  },
  loadMoreEchoesBtn: {
    marginTop: ui.spacing.xs,
    marginBottom: ui.spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: ui.spacing.md,
    paddingVertical: 8,
    borderRadius: ui.radius.md,
    backgroundColor: '#EEF6FF',
  },
  loadMoreEchoesText: {
    color: ui.colors.link,
    fontSize: 13,
    fontWeight: '700',
  },
  echoToggleBtn: {
    marginTop: ui.spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: ui.spacing.md,
    paddingVertical: 8,
    borderRadius: ui.radius.md,
    backgroundColor: '#EEF6FF',
  },
  echoToggleText: {
    color: ui.colors.link,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyEchoHint: {
    color: ui.colors.subtle,
    fontSize: ui.type.caption,
    textAlign: 'center',
    marginTop: ui.spacing.sm,
    fontStyle: 'italic',
  },
});

export default MainFeedItem;

