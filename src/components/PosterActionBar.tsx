// Import necessary components and hooks
import React, { useState, useEffect, memo, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Modal, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueueService } from '../services/offlineQueueService';
import { appTokens } from '../theme/tokens';

// Function to fetch user data by ID
const fetchUserData = async (userId: string) => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  return null;
};

// Types for the component props
interface PosterActionBarProps {
  waveId: string;
  currentUserId: string;
  splashesCount: number;
  echoesCount: number;
  pearlsCount: number;
  isAnchored: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onEcho: (waveId: string) => void | Promise<void>;
  onPearl: () => void;
  onAnchor: () => void;
  creatorUserId: string;
  splashSyncStatus?: 'idle' | 'saving' | 'error';
  onRetrySplash?: () => void;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

// Main component
const PosterActionBar: React.FC<PosterActionBarProps> = ({
  waveId,
  currentUserId,
  splashesCount,
  echoesCount,
  pearlsCount,
  isAnchored,
  onAdd,
  onRemove,
  onEcho,
  onPearl,
  onAnchor,
  creatorUserId,
  splashSyncStatus = 'idle',
  onRetrySplash,
  translate,
}) => {
  const [hasHugged, setHasHugged] = useState(false); // Initialize to false for instant response
  const [hasEchoed, setHasEchoed] = useState(false); // Initialize to false for instant response
  const [localHugsCount, setLocalHugsCount] = useState(Math.max(0, splashesCount));
  const [localEchoesCount, setLocalEchoesCount] = useState(Math.max(0, echoesCount));

  // State for huggers dropdown
  const [showHuggersDropdown, setShowHuggersDropdown] = useState(false);
  type Hugger = { id: string; name: string; photo: string; timestamp: any };
  const [huggersList, setHuggersList] = useState<Hugger[]>([]);
  const [loadingHuggers, setLoadingHuggers] = useState(false);

  // Connectivity state
  const [isOnline, setIsOnline] = useState(true);
  const lastHugAtRef = useRef(0);

  // Monitor connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  // Check if user has already interacted
  useEffect(() => {
    const checkInteractions = async () => {
      try {
        const splashDoc = await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .get();
        
        setHasHugged(splashDoc.exists);

        const echoQuery = await firestore()
          .collection(`waves/${waveId}/echoes`)
          .where('userUid', '==', currentUserId)
          .limit(1)
          .get();
        
        // Add null check for echoQuery
        setHasEchoed(echoQuery && !echoQuery.empty);
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
    };
    checkInteractions();
  }, [waveId, currentUserId]);

  useEffect(() => {
    setLocalHugsCount(Math.max(0, splashesCount));
  }, [splashesCount]);

  useEffect(() => {
    setLocalEchoesCount(Math.max(0, echoesCount));
  }, [echoesCount]);

  const handleHug = () => {
    const now = Date.now();
    if (now - lastHugAtRef.current < 280) {
      return;
    }
    lastHugAtRef.current = now;
    // Immediate visual feedback - no blocking
    const newHasHugged = !hasHugged;
    setHasHugged(newHasHugged);
    setLocalHugsCount(prev => Math.max(0, prev + (newHasHugged ? 1 : -1)));

    // Handle action based on connectivity - fire and forget
    if (isOnline) {
      // Call the parent callback for immediate sync
      if (newHasHugged) {
        // We just hugged, so this was an add action
        onAdd();
      } else {
        // We just unhugged, so this was a remove action
        onRemove();
      }
    } else {
      // Queue action for offline processing
      const actionType = newHasHugged ? 'splash' : 'unsplash';
      offlineQueueService.addAction(actionType, waveId);
    }

    // No blocking timeout - allow instant re-taps
  };

  const handleEcho = async () => {
    if (hasEchoed) return;
    if (!isOnline) {
      offlineQueueService.addAction('echo', waveId, { text: '' });
      return;
    }
    try {
      await Promise.resolve(onEcho(waveId));
      setHasEchoed(true);
      setLocalEchoesCount(prev => Math.max(0, prev + 1));
    } catch (error) {
      console.error('Echo failed:', error);
    }
  };

  const fetchHuggers = async () => {
    if (loadingHuggers) return;
    
    setLoadingHuggers(true);
    try {
      const splashesSnap = await firestore()
        .collection(`waves/${waveId}/splashes`)
        .orderBy('createdAt', 'desc')
        .get();
      
      const huggers = await Promise.all(
        splashesSnap.docs.map(async doc => {
          const splashData = doc.data();
          const userId = doc.id;
          if (!userId) return null;
          const userData = await fetchUserData(userId);
          if (!userData) return null;
          return {
            id: userId,
            name: userData.displayName || userData.username || 'User',
            photo: userData.photoURL || userData.userPhoto,
            timestamp: splashData.createdAt,
          };
        }),
      );
      setHuggersList(huggers.filter(Boolean) as Hugger[]);
      setShowHuggersDropdown(true);
    } catch (error) {
      console.error('Error fetching huggers:', error);
      Alert.alert(
        translate('feed.loadHuggersFailedTitle'),
        translate('feed.loadHuggersFailedBody'),
      );
    } finally {
      setLoadingHuggers(false);
    }
  };

  const handleHugAction = () => {
    // Perform the hug action (increment/decrement count)
    handleHug();
  };

  const handlePearl = () => {
    // Call the parent callback
    onPearl();
    
    // No blocking timeout - allow instant re-taps
  };

  const handleAnchor = () => {
    onAnchor();
  };

  return (

    <>
    <View style={[styles.textButtonsBar, { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }]}>
      {/* Hugs Button (with icon and count) */}
      <Pressable
        onPress={handleHugAction}
        delayPressIn={0}
        style={({ pressed }) => [
          styles.textButton,
          
          pressed && styles.pressedButton
        ]}
        accessibilityRole="button"
        accessibilityLabel={(hasHugged && Math.max(0, localHugsCount) > 0)
          ? translate('feed.removeHug')
          : translate('feed.hugThisPost')}
        hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
        pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.actionIcon, (hasHugged && localHugsCount > 0) && styles.hugActive]}>
            {'\uD83E\uDEC2'}
          </Text>
          <Text style={[styles.actionLabel, (hasHugged && localHugsCount > 0) ? styles.blueCount : styles.whiteCount]}>
            {(hasHugged && localHugsCount > 0)
              ? translate('feed.hugged')
              : translate('feed.hug')} ({localHugsCount})
          </Text>
        </View>
      </Pressable>

      {splashSyncStatus === 'error' && (
        <Pressable
          onPress={onRetrySplash}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressedButton
          ]}
          accessibilityRole="button"
          accessibilityLabel={translate('feed.retryHugSync')}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.actionIconSmall}>{'\u21BB'}</Text>
            <Text style={styles.actionLabel}>{translate('feed.retryHug')}</Text>
          </View>
        </Pressable>
      )}

      {/* Echoes Button (with icon and count) */}
      <Pressable
        onPress={handleEcho}
        style={({ pressed }) => [
          styles.textButton,
          pressed && styles.pressedButton
        ]}
        accessibilityRole="button"
        accessibilityLabel={translate('feed.echoThisPost')}
        hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
        pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.actionIcon, hasEchoed && styles.echoActive]}>
            {'\uD83D\uDCE3'}
          </Text>
          <Text style={[styles.actionLabel, hasEchoed ? styles.blueCount : styles.whiteCount]}>
            {hasEchoed ? translate('feed.echoed') : translate('feed.echo')} ({localEchoesCount})
          </Text>
        </View>
      </Pressable>

      {/* Gems Button */}
      {currentUserId !== creatorUserId && (
        <Pressable
          onPress={handlePearl}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          accessibilityRole="button"
          accessibilityLabel={translate('feed.sendGem')}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.actionIconSmall}>{'\uD83D\uDC8E'}</Text>
            <Text style={styles.actionLabel}>{translate('feed.gems')}</Text>
          </View>
        </Pressable>
      )}

      {/* Anchor Wave Button - Only show for other users' posts */}
      {currentUserId !== creatorUserId && (
        <Pressable
          onPress={handleAnchor}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          accessibilityRole="button"
          accessibilityLabel={translate('feed.anchorThisPost')}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.actionIconSmall}>{'\u2693\uFE0F'}</Text>
            <Text style={styles.actionLabel}>{translate('feed.anchor')}</Text>
          </View>
        </Pressable>
      )}
    </View>

    {/* Huggers Dropdown Modal */}
    <Modal
      visible={showHuggersDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowHuggersDropdown(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowHuggersDropdown(false)}
      >
        <View style={styles.modalContent}>
          <Pressable
            onPress={() => setShowHuggersDropdown(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>{'\u2715'}</Text>
          </Pressable>
          {loadingHuggers ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{translate('feed.loadingHuggers')}</Text>
            </View>
          ) : huggersList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{translate('feed.noHuggersYet')}</Text>
            </View>
          ) : (
            <FlatList
              data={huggersList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.huggerItem}>
                  <Text style={styles.huggerName}>{item.name}</Text>
                  <Text style={styles.huggerTimestamp}>
                    {item.timestamp
                      ? new Date(item.timestamp.toDate()).toLocaleDateString()
                      : translate('feed.recently')}
                  </Text>
                </View>
              )}
              style={styles.huggersList}
            />
          )}
        </View>
      </Pressable>
    </Modal>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  actionBar: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: '#4b5563',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    minHeight: 32,
    height: 38,
    width: '100%',
  },
  textButtonsBar: {
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    minHeight: 34,
    height: 42,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 20, // Increased spacing between buttons to prevent accidental clicks
  },
  iconButton: {
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 20,
  },
  iconTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 0,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  pressedButton: {
    opacity: 0.68,
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    opacity: 0.65,
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 0,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionIcon: {
    fontSize: 18,
    color: '#8D0000',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeAction: {
    color: '#00ff88', // Highlight active interactions
  },
  hugActive: {
    color: '#6FD6FF',
  },
  echoActive: {
    color: '#6FD6FF',
  },
  pearlActive: {
    color: '#ff0088', // Red for pearls/gems
  },
  actionLabel: {
    fontSize: 13,
    color: '#8D0000',
    marginRight: 2,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.82)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  huggedLabel: {
    color: '#1e88e5',
  },
  greenCount: {
    color: '#00ff88',
  },
  blueCount: {
    color: '#6FD6FF',
  },
  whiteCount: {
    color: '#8D0000',
  },
  actionIconSmall: {
    fontSize: 16,
    color: '#8D0000',
    marginRight: 2,
    textShadowColor: 'rgba(0,0,0,0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCount: {
    color: '#00ff88', // Green for counts > 0
  },
  inactiveCount: {
    color: '#fff', // White for count = 0
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  iconCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#333',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 0,
    minWidth: 12,
    textAlign: 'center',
  },
  activeIconCount: {
    color: '#00ff88', // Green for counts > 0
  },
  inactiveIconCount: {
    color: '#fff', // Grey for count = 0
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  huggersList: {
    maxHeight: 300,
  },
  huggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  huggerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  huggerEmoji: {
    fontSize: 20,
  },
  huggerInfo: {
    flex: 1,
  },
  huggerName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  huggerTimestamp: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  hugButton: {
    backgroundColor: '#8D0000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  hugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PosterActionBar;
