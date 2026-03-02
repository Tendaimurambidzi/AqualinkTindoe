import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert, Share, Linking, TextInput, StyleSheet } from 'react-native';
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
  userData: Record<string, { name: string; avatar: string; bio: string; lastSeen: Date | null; online?: boolean }>;
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
  openWaveOptions: (item: Vibe) => void;
  handleToggleVibe: (targetUid: string, targetName?: string) => void;
  setExpandedPosts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setRevealedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  recordVideoReach: (id: string) => Promise<void>;
  recordImageReach: (id: string) => Promise<void>;
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
}

const MainFeedItem = memo<MainFeedItemProps>(({
  item,
  index,
  myUid,
  profileName,
  profileBio,
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
  openWaveOptions,
  handleToggleVibe,
  setExpandedPosts,
  setRevealedImages,
  recordVideoReach,
  recordImageReach,
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

    const ONLINE_GRACE_MS = 60 * 1000;
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
      setStatus('Away Since: ...');
      return;
    }

    const fallbackLastSeen = userData[ownerUid]?.lastSeen || postFallbackTs;
    let firestoreOnline = userData[ownerUid]?.online === true;
    let rtdbOnline = false;
    let firestoreLastSeen: any = fallbackLastSeen;
    let rtdbLastSeen: any = null;
    let firestoreLastActiveAt: any = null;
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
        setStatus('Here Now!');
        return;
      }
      const resolvedLastSeen = mostRecentLastSeen || mostRecentActive || null;
      const exact =
        formatPresenceLastSeenExact(resolvedLastSeen) ||
        formatPresenceLastSeenExact(userData[ownerUid]?.lastSeen || null);
      setIsHereNow(false);
      setStatus(exact ? `Away Since: ${exact}` : 'Away Since: ...');
    };

    refreshStatus();
    const freshnessTimer = setInterval(refreshStatus, 30000);

    const unsubscribeFs = firestore().doc(`users/${ownerUid}`).onSnapshot((doc) => {
      const data = doc?.data() || {};
      firestoreOnline = data?.online === true;
      firestoreLastSeen = data?.lastSeen || fallbackLastSeen;
      firestoreLastActiveAt = data?.lastActiveAt || data?.lastHeartbeat || null;
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
  }, [item.ownerUid, myUid, userData]);

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

  const mediaUri = String(item.media?.uri || '').trim();
  const mediaType = String(item.media?.type || '').toLowerCase();
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
    isVideoAsset(item.media) ||
    (!isExplicitImage && !isImageAsset(item.media) && !!item.playbackUrl && playbackLooksVideo) ||
    (mediaUri.length > 0 && mediaType.startsWith('video/'));
  const hasImageMedia =
    mediaUri.length > 0 &&
    (isExplicitImage || isImageAsset(item.media) || (!hasVideoMedia && mediaType.startsWith('image/')));
  const audioOnlyPost =
    (isExplicitAudio ||
      (!item.playbackUrl && !!item.audio?.uri && !hasVideoMedia && !hasImageMedia) ||
      (!item.playbackUrl && !!item.media && isAudioAsset(item.media) && !hasVideoMedia && !hasImageMedia)) &&
    !hasVideoMedia &&
    !hasImageMedia;
  const primaryVideoSource =
    item.playbackUrl && playbackLooksVideo ? String(item.playbackUrl) : String(item.media?.uri || '');
  const fallbackVideoSource =
    item.playbackUrl && playbackLooksVideo && item.media?.uri && item.media.uri !== item.playbackUrl
      ? String(item.media.uri)
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
  const hasUnknownMediaFile =
    !!item.media && mediaUri.length > 0 && !hasVideoMedia && !hasImageMedia && !audioOnlyPost;
  const hasRenderableMedia = hasVideoMedia || audioOnlyPost || hasImageMedia || hasUnknownMediaFile;
  const textOnlyStory = !item.media && !item.image && !item.audio?.uri;
  const mediaEdits = item.mediaEdits || null;
  const fallbackAwayText = (() => {
    const exact = formatPresenceLastSeenExact(userData[item.ownerUid || '']?.lastSeen || null);
    return exact ? `Away Since: ${exact}` : 'Away Since: ...';
  })();
  const storyTheme = useMemo(() => {
    const seed = String(item.id || '')
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return STORY_THEMES[seed % STORY_THEMES.length];
  }, [item.id]);

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

  const handleProfilePress = useCallback(() => {
    if (item.ownerUid === myUid) {
      navigation.navigate('Profile');
    } else {
      // Navigate to user profile or show user modal
      console.log('Pressed user avatar for:', item.ownerUid);
    }
  }, [item.ownerUid, myUid, navigation]);

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
      Alert.alert('Error', 'Could not open chat');
    }
  }, []);

  const handleBioPress = useCallback(() => {
    const bioToShow = item.ownerUid === myUid ? profileBio : userData[item.ownerUid]?.bio;
    if (bioToShow) {
      Share.share({
        message: `Check out this bio: "${bioToShow}"`,
      }).catch(err => console.log('Share failed', err));
    }
  }, [item.ownerUid, myUid, profileBio, userData]);

  // Ensure user data is fetched for the post owner
  useEffect(() => {
    if (item.ownerUid && !userData[item.ownerUid]) {
      ensureUserData(item.ownerUid);
    }
  }, [item.ownerUid, userData, ensureUserData]);

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

  const handleTextPostPress = useCallback(() => {
    setPreservedScrollPosition(currentIndex);
    navigation.navigate('PostDetail', { post: item });
  }, [currentIndex, item, navigation, setPreservedScrollPosition]);

  const handleLinkPress = useCallback(() => {
    if (item.link) {
      Linking.openURL(item.link).catch(err => console.log('Failed to open link:', err));
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
    // Open the main echo modal, but pass context that this is a reply
    // The modal will handle saving to the replies subcollection
    setEchoWaveId(item.id);
    setCurrentIndex(index);
    // Store the echo ID we're replying to in a way the modal can access
    // For now, we'll use the same modal but the logic will be in App.tsx
    setShowEchoes(true);
  }, [item.id, index, setEchoWaveId, setCurrentIndex, setShowEchoes]);

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
    const replyPreview = replyPreviews[echo.id];
    const hasReplies = (echo.replyCount || 0) > 0;
    const isExpanded = expandedReplies[echo.id];
    
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
          onPress={() =>
            setActiveEchoActionId(prev => (prev === echo.id ? null : echo.id))
          }
        >
          <Text style={{ color: 'black', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
            {displayHandle(echo.uid, echo.userName || echo.uid)}
          </Text>
          <Text style={{ color: 'black', fontSize: 14 }}>
            {echo.text}
          </Text>
          <Text style={{ color: 'gray', fontSize: 10 }}>
            {echo.createdAt ? formatDefiniteTime(echo.createdAt) : 'just now'}
          </Text>
        </Pressable>

        {/* Reply Preview - Show most recent reply if exists and not expanded */}
        {hasReplies && !isExpanded && replyPreview && (
          <View style={{ marginTop: 8, marginLeft: 16, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#1e88e5' }}>
            <Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>
              {displayHandle(replyPreview.uid, replyPreview.userName || replyPreview.uid)}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              {replyPreview.text}
            </Text>
            <Text style={{ color: 'gray', fontSize: 9 }}>
              {replyPreview.createdAt ? formatDefiniteTime(replyPreview.createdAt) : 'just now'}
            </Text>
          </View>
        )}

        {/* View More Replies Button */}
        {hasReplies && !isExpanded && (echo.replyCount || 0) > 1 && (
          <Pressable
            onPress={() => toggleReplies(echo.id)}
            style={{ marginTop: 6, marginLeft: 16 }}
          >
            <Text style={{ color: '#1e88e5', fontSize: 11, fontWeight: '600' }}>
              View {(echo.replyCount || 0) - 1} more {(echo.replyCount || 0) - 1 === 1 ? 'reply' : 'replies'}
            </Text>
          </Pressable>
        )}

        {/* Expanded Replies */}
        {isExpanded && replies.length > 0 && (
          <View style={{ marginTop: 8, marginLeft: 16 }}>
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
                  {reply.createdAt ? formatDefiniteTime(reply.createdAt) : 'just now'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Collapse Replies Button */}
        {isExpanded && hasReplies && (
          <Pressable
            onPress={() => toggleReplies(echo.id)}
            style={{ marginTop: 6, marginLeft: 16 }}
          >
            <Text style={{ color: '#1e88e5', fontSize: 11, fontWeight: '600' }}>
              Hide replies
            </Text>
          </Pressable>
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
                {hugged ? `Hugged (${hugs})` : `Hug (${hugs})`}
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
                Echo ({echo.replyCount || 0})
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }, [activeEchoActionId, getEchoHugState, handleEchoReply, toggleEchoHug, formatDefiniteTime, displayHandle, echoReplies, replyPreviews, expandedReplies, toggleReplies]);

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
            <View style={styles.menuButtonWrap}>
              <Pressable
                onPress={() => openWaveOptions(item)}
                style={({ pressed }) => [
                  styles.iconPress,
                  pressed && styles.iconPressActive,
                ]}
                hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
                delayPressIn={0}
                delayPressOut={0}
                activeOpacity={0.7}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
              >
                <Text style={styles.menuIcon}>⋮</Text>
              </Pressable>
            </View>

            {/* Centered Profile Info */}
            <View style={styles.centeredHeader}>
              <View style={styles.headerTopRow}>
                {/* Connect/Disconnect Button */}
                {item.ownerUid !== myUid && (
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
                      {isInUserCrew[item.ownerUid!] ? 'Leave Tide' : 'Join Tide'}
                    </Text>
                  </Pressable>
                )}

                {/* Profile Avatar */}
                <Pressable
                  onPress={handleProfilePress}
                  style={({ pressed }) => [
                    pressed && {
                      opacity: 0.8,
                      transform: [{ scale: 0.95 }],
                    }
                  ]}
                  hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                  delayPressIn={0}
                  delayPressOut={0}
                  activeOpacity={0.7}
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
              </View>

              {/* Username and Bio directly under avatar */}
              <Text style={{
                fontWeight: '700',
                fontSize: ui.type.title,
                color: ui.colors.heading,
                textAlign: 'center',
                marginBottom: 2
              }}>
                {(() => {
                  const isCurrentUserPost = item.ownerUid === myUid;
                  if (isCurrentUserPost) {
                    return profileName || 'User';
                  }
                  const userInfo = userData[item.ownerUid!];
                  const displayName = userInfo?.name || item.authorName || 'User';
                  return displayName;
                })()}
              </Text>
              {(() => {
                const isCurrentUserPost = item.ownerUid === myUid;
                const bioToShow = isCurrentUserPost ? profileBio : userData[item.ownerUid!]?.bio;
                return bioToShow ? (
                  <Pressable
                    onPress={handleBioPress}
                    style={({ pressed }) => [
                      { marginTop: 2 },
                      pressed && { opacity: 0.7 }
                    ]}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    delayPressIn={0}
                    delayPressOut={0}
                    activeOpacity={0.7}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
                  >
                    <Text style={{
                      color: ui.colors.subtle,
                      fontSize: ui.type.caption,
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      {bioToShow}
                    </Text>
                  </Pressable>
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

          {/* Post Content - Text or Media */}
          {hasRenderableMedia ? (
            <>
              {/* Post Text (if any) */}
              {item.captionText && (
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
              {hasVideoMedia ? (
                <View style={{ marginHorizontal: 0, position: 'relative', backgroundColor: '#000' }}>
                  {videoSourceUri ? (
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
                      onError={() => {
                        if (!preferFallbackVideoSource && fallbackVideoSource) {
                          setPreferFallbackVideoSource(true);
                        }
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
                  {RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || item.media?.uri || '') }}
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
                  <Text style={{ fontSize: 40 }}>📄</Text>
                </View>
              ) : (
                <Pressable onPress={handleImageReveal}>
                  <View
                    style={{
                      position: 'relative',
                      marginHorizontal: 0,
                      width: SCREEN_WIDTH,
                      backgroundColor: '#000',
                    }}
                  >
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
                <ClickableTextWithLinks
                  text={
                    expandedPosts[item.id]
                      ? item.captionText
                      : item.captionText.length > 500
                      ? item.captionText.substring(0, 500) + '...'
                      : item.captionText
                  }
                  style={styles.textStoryBody}
                />
                {item.captionText && item.captionText.length > 500 && !expandedPosts[item.id] ? (
                  <Pressable onPress={handleReadMore}>
                    <Text style={[styles.textStoryMore, { color: storyTheme.accent }]}>Read More</Text>
                  </Pressable>
                ) : null}
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
          {textOnlyStory && item.captionText && item.captionText.length > 500 && (
            <Pressable onPress={handleReadMore} style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>{expandedPosts[item.id] ? 'Read Less' : 'Read More'}</Text>
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
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <Pressable
            onPress={handleReachPress}
            style={({ pressed }) => [styles.statChip, pressed && styles.buttonPressed]}
          >
            <Text style={styles.statLabel}>👁 Reach: </Text>
            <Text style={styles.statValue}>{reachCounts[item.id] || 0}</Text>
          </Pressable>
          {item.ownerUid !== myUid && (
            <Text style={[styles.presenceText, { color: isHereNow ? ui.colors.success : ui.colors.subtle }]}>
              {isHereNow ? 'Here Now!' : (status || fallbackAwayText)}
            </Text>
          )}
          {item.user?.name !== "Tendaimurambidzi" && <Text style={styles.moreFromCreator}>📚 More from creator</Text>}
        </ScrollView>

        {(postEchoLists[item.id] && postEchoLists[item.id].length > 0) ? (
        <View style={styles.echoSection}>
          {/* Echoes Section */}
          {postEchoLists[item.id] && postEchoLists[item.id].length > 0 && (
            <View style={{ marginTop: 10 }}>
              {expandedEchoes[item.id] ? (
                (() => {
                  const allEchoes = postEchoLists[item.id];
                  const pageSize = echoesPageSize[item.id] || 5;
                  const visibleEchoes = allEchoes.slice(0, pageSize);
                  const hasMoreEchoes = allEchoes.length > pageSize;

                  return (
                    <>
                      {visibleEchoes.map((echo, idx) => renderEchoItem(echo, idx))}

                      {hasMoreEchoes && (
                        <Pressable
                          onPress={handleLoadMoreEchoes}
                          style={({ pressed }) => [styles.loadMoreEchoesBtn, pressed && styles.buttonPressed]}
                          hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                          disabled={echoExpansionInProgress[item.id]}
                        >
                          <Text style={styles.loadMoreEchoesText}>
                            Load {Math.min(5, allEchoes.length - pageSize)} more echoes
                          </Text>
                        </Pressable>
                      )}
                    </>
                  );
                })()
              ) : (
                (() => {
                  const mostRecentEcho = postEchoLists[item.id][0];
                  return renderEchoItem(mostRecentEcho, 0);
                })()
              )}

              {postEchoLists[item.id].length > 1 && (
                <Pressable
                  onPress={handleEchoToggle}
                  style={({ pressed }) => [styles.echoToggleBtn, pressed && styles.buttonPressed]}
                  hitSlop={{top: 40, bottom: 40, left: 40, right: 40}}
                  disabled={echoExpansionInProgress[item.id]}
                >
                  <Text style={styles.echoToggleText}>
                    {expandedEchoes[item.id] ? 'View less' : `View all ${postEchoLists[item.id].length} echoes`}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

        </View>
        ) : null}
      </View>
    </Pressable>
  );
});

MainFeedItem.displayName = 'MainFeedItem';

const styles = StyleSheet.create({
  feedCard: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 12,
    elevation: 0,
  },
  postBody: {
    backgroundColor: 'transparent',
  },
  postHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: ui.spacing.sm,
    paddingHorizontal: ui.spacing.md,
  },
  menuButtonWrap: {
    position: 'absolute',
    top: 0,
    right: ui.spacing.sm,
  },
  iconPress: {
    padding: 10,
    borderRadius: ui.radius.md,
  },
  iconPressActive: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  menuIcon: {
    fontSize: 28,
    color: ui.colors.body,
    fontWeight: '700',
  },
  centeredHeader: {
    alignItems: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ui.spacing.sm,
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

