import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert, Share, Linking, TextInput } from 'react-native';
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
import { formatAwaySince } from '../services/timeUtils';
import { Asset } from 'react-native-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
let RNVideo: any = null;
try {
  RNVideo = require('react-native-video').default;
} catch {}

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
  userData: Record<string, { name: string; avatar: string; bio: string; lastSeen: Date }>;
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
  activeVideoId: string;
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
  const [activeEchoActionId, setActiveEchoActionId] = useState<string | null>(null);
  const [localEchoHugs, setLocalEchoHugs] = useState<Record<string, { hugs: number; hugged: boolean }>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [echoReplies, setEchoReplies] = useState<Record<string, any[]>>({});
  const [replyPreviews, setReplyPreviews] = useState<Record<string, any>>({});
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [audioControlsVisible, setAudioControlsVisible] = useState(false);
  const audioControlsTimerRef = useRef<any>(null);

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
    if (item.ownerUid !== myUid) {
      const presenceRef = database().ref(`/presence/${item.ownerUid}`);
      const unsubscribe = presenceRef.on('value', (snapshot) => {
        if (!snapshot) return;
        const presence = snapshot.val();
        if (presence?.online) {
          setStatus('Here now!');
        } else if (presence?.lastSeen) {
          const awayStr = formatAwaySince(presence.lastSeen);
          setStatus(awayStr ? `Away since ${awayStr}` : '');
        } else {
          setStatus('');
        }
      });
      return unsubscribe;
    }
  }, [item.ownerUid, myUid]);

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

  const audioOnlyPost =
    (!item.playbackUrl && !!item.audio?.uri && !isVideoAsset(item.media)) ||
    (!item.playbackUrl && !!item.media && isAudioAsset(item.media));
  const hasOverlayAudio = !!item.audio?.uri && !item.playbackUrl && !audioOnlyPost;
  const playSynced = shouldPlay && item.id === activeVideoId;
  const shouldPreload = preloadedVideoIds.has(item.id);
  const near = Math.abs(index - currentIndex) <= 1;
  const textOnlyStory = !item.media && !item.image && !item.audio?.uri;

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
    if (!revealedImages.has(item.id)) {
      setRevealedImages(prev => new Set(prev).add(item.id));
      recordImageReach(item.id).catch(error => {
        console.log('Image reach recording failed:', error.message);
      });
    }
  }, [item.id, revealedImages, setRevealedImages, recordImageReach]);

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
    // IMMEDIATE UI UPDATE - no delay
    const updateFeeds = (feed: Vibe[]) =>
      feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: (v.counts?.splashes || 0) + 1 } } : v);

    setWavesFeed(updateFeeds);
    setVibesFeed(updateFeeds);
    setPublicFeed(updateFeeds);
    setPostFeed(updateFeeds);

    // Database operation in background
    ensureSplash(item.id).catch((error) => {
      console.error('Error adding splash:', error);
      // Revert UI on error
      const revertFeeds = (feed: Vibe[]) =>
        feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: Math.max(0, (v.counts?.splashes || 0) - 1) } } : v);

      setWavesFeed(revertFeeds);
      setVibesFeed(revertFeeds);
      setPublicFeed(revertFeeds);
      setPostFeed(revertFeeds);
    });
  }, [item.id, ensureSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);

  const handleRemoveSplash = useCallback(() => {
    // IMMEDIATE UI UPDATE - no delay
    const updateFeeds = (feed: Vibe[]) =>
      feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: Math.max(0, (v.counts?.splashes || 0) - 1) } } : v);

    setWavesFeed(updateFeeds);
    setVibesFeed(updateFeeds);
    setPublicFeed(updateFeeds);
    setPostFeed(updateFeeds);

    // Database operation in background
    removeSplash(item.id).catch((error) => {
      console.error('Error removing splash:', error);
      // Revert UI on error
      const revertFeeds = (feed: Vibe[]) =>
        feed.map(v => v.id === item.id ? { ...v, counts: { ...v.counts, splashes: (v.counts?.splashes || 0) + 1 } } : v);

      setWavesFeed(revertFeeds);
      setVibesFeed(revertFeeds);
      setPublicFeed(revertFeeds);
      setPostFeed(revertFeeds);
    });
  }, [item.id, removeSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);

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
      <View
        style={{
          marginHorizontal: 0,
          marginVertical: 5,
          borderRadius: 0,
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Online Users List - Only show on video posts */}
        {item.media && isVideoAsset(item.media) && (
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
        <View style={{
          backgroundColor: 'transparent',
          marginHorizontal: 0,
          paddingHorizontal: 0,
          marginTop: 0,
          paddingTop: 0,
          marginBottom: 0,
          paddingBottom: 0
        }}>
          {/* Post Header */}
          <View style={{
            position: 'relative',
            alignItems: 'center',
            marginBottom: 10,
            paddingHorizontal: 10
          }}>
            {/* Menu button positioned absolutely in top-right */}
            <View style={{ position: 'absolute', top: 0, right: 10 }}>
              <Pressable
                onPress={() => openWaveOptions(item)}
                style={({ pressed }) => [
                  { padding: 10 },
                  pressed && {
                    opacity: 0.7,
                    transform: [{ scale: 0.9 }],
                    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Add dark background when pressed
                  }
                ]}
                hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
                delayPressIn={0}
                delayPressOut={0}
                activeOpacity={0.7}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
              >
                <Text style={{ fontSize: 32 }}>⋮</Text>
              </Pressable>
            </View>

            {/* Centered Profile Info */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {/* Connect/Disconnect Button */}
                {item.ownerUid !== myUid && (
                  <Pressable
                    onPress={() => handleToggleVibe(item.ownerUid!, item.authorName || item.user?.name)}
                    style={({ pressed }) => [
                      {
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: isInUserCrew[item.ownerUid!] ? '#ff4444' : '#00C2FF',
                        backgroundColor: isInUserCrew[item.ownerUid!] ? '#ff4444' : '#00C2FF',
                        marginRight: 10,
                      },
                      pressed && {
                        opacity: 0.7,
                        transform: [{ scale: 0.95 }],
                      }
                    ]}
                    hitSlop={{ top: 30, bottom: 30, left: 20, right: 20 }}
                    delayPressIn={0}
                    delayPressOut={0}
                    activeOpacity={0.7}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
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
                fontWeight: 'bold',
                fontSize: 14,
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
                      color: '#8B0000',
                      fontSize: 12,
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      {bioToShow}
                    </Text>
                  </Pressable>
                ) : null;
              })()}
              <Text style={{
                color: 'gray',
                fontSize: 12,
                textAlign: 'center'
              }}>
                {formatDefiniteTime(waveStats[item.id]?.createdAt || item.createdAt || null)}
              </Text>
            </View>
          </View>

          {/* Post Content - Text or Media */}
          {(item.media || item.audio?.uri) ? (
            <>
              {/* Post Text (if any) */}
              {item.captionText && (
                <View style={{ marginBottom: 10 }}>
                  <ClickableTextWithLinks
                    text={
                      expandedPosts[item.id]
                        ? item.captionText
                        : item.captionText.length > 500
                        ? item.captionText.substring(0, 500) + '...'
                        : item.captionText
                    }
                    style={{ fontSize: 16, lineHeight: 20 }}
                  />
                </View>
              )}

              {/* Post Link (if any) */}
              {item.link && (
                <View style={{ marginBottom: 10 }}>
                  <Pressable
                    onPress={handleLinkPress}
                    style={{
                      backgroundColor: '#E3F2FD',
                      padding: 8,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: '#2196F3'
                    }}
                  >
                    <Text style={{
                      color: '#1976D2',
                      fontSize: 16,
                      textDecorationLine: 'underline'
                    }}>
                      {item.link}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Post Media */}
              {isVideoAsset(item.media) ? (
                <View style={{ marginHorizontal: -10 }}>
                  <VideoWithTapControls
                    source={{ uri: item.media.uri }}
                    style={videoStyleFor(item.id)}
                    resizeMode={'contain'}
                    paused={!playSynced}
                    muted={hasOverlayAudio}
                    playInBackground={false}
                    isActive={item.id === activeVideoId}
                    videoId={item.id}
                    shouldPreload={shouldPreload}
                    bufferConfig={{
                      minBufferMs: 0,
                      maxBufferMs: 1000,
                      bufferForPlaybackMs: 0,
                      bufferForPlaybackAfterRebufferMs: 0,
                    }}
                    onPlay={() => {
                      recordVideoReach(item.id).catch(error => {
                        console.log('Video reach recording failed:', error.message);
                      });
                    }}
                  />
                  {hasOverlayAudio && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || '') }}
                      audioOnly
                      paused={!playSynced}
                      style={{ width: 1, height: 1, opacity: 0 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
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
                    backgroundColor: '#0f1724',
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
                      paused={!playSynced}
                      style={{ width: SCREEN_WIDTH - 28, height: 64 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
                    />
                  ) : (
                    <Text style={{ color: '#9ab4cf' }}>Audio player unavailable</Text>
                  )}
                </Pressable>
              ) : item.media && !isImageAsset(item.media) ? (
                <View
                  style={{
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    minHeight: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0f1724',
                    paddingVertical: 20,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontSize: 40 }}>📄</Text>
                </View>
              ) : (
                <Pressable onPress={handleImageReveal}>
                  <View style={{ position: 'relative', marginHorizontal: 0, width: SCREEN_WIDTH }}>
                    <Image
                      source={{ uri: item.media.uri }}
                      style={videoStyleFor(item.id)}
                      resizeMode="contain"
                    />
                    {!revealedImages.has(item.id) && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 0, 0.3)',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                          Tap to reveal
                        </Text>
                      </View>
                      )}
                  </View>
                  {hasOverlayAudio && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(item.audio?.uri || '') }}
                      audioOnly
                      paused={!playSynced}
                      style={{ width: 1, height: 1, opacity: 0 }}
                      playInBackground={false}
                      playWhenInactive={false}
                      ignoreSilentSwitch="ignore"
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
                expandedPosts[item.id] ? { minHeight: ((SCREEN_WIDTH) / (9/16)) * 0.5 } : videoStyleFor(item.id),
                expandedPosts[item.id] ? {} : { overflow: 'hidden' }
              ]}
            >
              <Text style={{ fontSize: 16, lineHeight: 20, flex: expandedPosts[item.id] ? 0 : 1 }}>
                {expandedPosts[item.id]
                  ? item.captionText
                  : item.captionText.length > 500
                  ? item.captionText.substring(0, 500) + '... '
                  : item.captionText}
                {item.captionText && item.captionText.length > 500 && !expandedPosts[item.id] && (
                  <Text
                    style={{ color: '#00C2FF', fontSize: 16, fontWeight: '600' }}
                    onPress={handleReadMore}
                  >
                    Read More
                  </Text>
                )}
              </Text>
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
          {item.captionText && item.captionText.length > 500 && (
            <Pressable onPress={handleReadMore} style={{ marginTop: 5, marginBottom: 10, alignSelf: 'center' }}>
              <Text style={{ color: 'blue', fontSize: 14 }}>{expandedPosts[item.id] ? 'Read Less' : 'Read More'}</Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 2, backgroundColor: 'darkblue', width: '100%', marginHorizontal: -20 }} />

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
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingHorizontal: 15 }}>
          <Pressable
            onPress={handleReachPress}
            style={{ flexDirection: 'row', marginRight: 20 }}
          >
            <Text style={{ fontSize: 14, color: 'red' }}>👁️ Reach: </Text>
            <Text style={{ fontSize: 14, color: 'black' }}>{reachCounts[item.id] || 0}</Text>
          </Pressable>
          {status && <Text style={{ fontSize: 14, color: 'grey', marginRight: 20 }}>{status}</Text>}
          {item.user?.name !== "Tendaimurambidzi" && <Text style={{ fontSize: 14, color: 'red', marginRight: 20 }}>📚 More from creator</Text>}
        </ScrollView>

        <View style={{ marginTop: 15, paddingHorizontal: 15 }}>
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
                          style={{ marginTop: 5, marginBottom: 10, alignSelf: 'center' }}
                          hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                          disabled={echoExpansionInProgress[item.id]}
                        >
                          <Text style={{ color: '#00C2FF', fontSize: 14, fontWeight: '600' }}>
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
                  style={{ marginTop: 5, alignSelf: 'flex-start' }}
                  hitSlop={{top: 40, bottom: 40, left: 40, right: 40}}
                  disabled={echoExpansionInProgress[item.id]}
                >
                  <Text style={{ color: '#00C2FF', fontSize: 14, fontWeight: '600' }}>
                    {expandedEchoes[item.id] ? 'View less' : `View all ${postEchoLists[item.id].length} echoes`}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {(!postEchoLists[item.id] || postEchoLists[item.id].length === 0) && (
            <Text style={{
              color: 'navy',
              fontSize: 12,
              textAlign: 'center',
              marginTop: 10,
              fontStyle: 'italic'
            }}>
              SPL@2026
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

MainFeedItem.displayName = 'MainFeedItem';

export default MainFeedItem;
