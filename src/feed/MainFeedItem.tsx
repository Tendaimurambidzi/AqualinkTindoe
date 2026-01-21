import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert, Share, Linking } from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatarWithCrew from '../components/ProfileAvatarWithCrew';
import PosterActionBar from '../components/PosterActionBar';
import VideoWithTapControls from '../components/VideoWithTapControls';
import ClickableTextWithLinks from '../components/ClickableTextWithLinks';
import database from '@react-native-firebase/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  useEffect(() => {
    if (item.ownerUid !== myUid) {
      const presenceRef = database().ref(`/presence/${item.ownerUid}`);
      const unsubscribe = presenceRef.on('value', (snapshot) => {
        if (!snapshot) return;
        const presence = snapshot.val();
        if (presence?.online) {
          setStatus('Here now!');
        } else if (presence?.lastSeen) {
          const displayTime = new Date(presence.lastSeen);
          const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
          const localeOptions = Intl.DateTimeFormat().resolvedOptions();
          if (localeOptions.hour12) {
            options.hour12 = true;
          }
          const timeStr = displayTime.toLocaleTimeString([], options);
          setStatus(`Away since:${timeStr}`);
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

  const overlayState = overlayReadyMap[item.id] || {};
  const hasOverlayAudio = !!item.audio?.uri && !item.playbackUrl;
  const overlayVideoReady = overlayState.video === true || !isVideoAsset(item.media);
  const overlayPairReady = !hasOverlayAudio || (overlayVideoReady && overlayState.audio === true);
  const playSynced = shouldPlay && overlayPairReady && item.id === activeVideoId;
  const shouldPreload = preloadedVideoIds.has(item.id) && overlayPairReady;
  const near = Math.abs(index - currentIndex) <= 1;
  const textOnlyStory = !item.media && !item.image;

  const handleProfilePress = useCallback(() => {
    if (item.ownerUid === myUid) {
      navigation.navigate('Profile');
    } else {
      // Navigate to user profile or show user modal
      console.log('Pressed user avatar for:', item.ownerUid);
    }
  }, [item.ownerUid, myUid, navigation]);

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
                      color: 'gray',
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
          {item.media ? (
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
                    resizeMode={'cover'}
                    paused={!playSynced}
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
                      {visibleEchoes.map((echo, idx) => (
                        <View key={echo.id || idx} style={{
                          flexDirection: 'row',
                          marginBottom: 8,
                          padding: 8,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          borderRadius: 8,
                        }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: 'black', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                              {displayHandle(echo.uid, echo.userName || echo.uid)}
                            </Text>
                            <Text style={{ color: 'black', fontSize: 14 }}>
                              {echo.text}
                            </Text>
                            <Text style={{ color: 'gray', fontSize: 10 }}>
                              {echo.createdAt ? formatDefiniteTime(echo.createdAt) : 'just now'}
                            </Text>
                          </View>
                        </View>
                      ))}

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
                  return (
                    <View style={{
                      flexDirection: 'row',
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: 8,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'black', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                          {displayHandle(mostRecentEcho.uid, mostRecentEcho.userName || mostRecentEcho.uid)}
                        </Text>
                        <Text style={{ color: 'black', fontSize: 14 }}>
                          {mostRecentEcho.text}
                        </Text>
                        <Text style={{ color: 'gray', fontSize: 10 }}>
                          {mostRecentEcho.createdAt ? formatDefiniteTime(mostRecentEcho.createdAt) : 'just now'}
                        </Text>
                      </View>
                    </View>
                  );
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