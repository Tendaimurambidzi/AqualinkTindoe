// Import necessary components and hooks
import React, { useState, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Pressable, Modal, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueueService } from '../services/offlineQueueService';

// Function to fetch user data by ID
const fetchUserData = async (userId: string) => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (userDoc.exists) {
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
  isCasted: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onEcho: (waveId: string) => void;
  onPearl: () => void;
  onAnchor: () => void;
  onCast: () => void;
  creatorUserId: string;
}

// Main component
const PosterActionBar: React.FC<PosterActionBarProps> = ({
  waveId,
  currentUserId,
  splashesCount,
  echoesCount,
  pearlsCount,
  isAnchored,
  isCasted,
  onAdd,
  onRemove,
  onEcho,
  onPearl,
  onAnchor,
  onCast,
  creatorUserId,
}) => {
  const [hasHugged, setHasHugged] = useState(false); // Initialize to false for instant response
  const [hasEchoed, setHasEchoed] = useState(false); // Initialize to false for instant response
  const [hugActionInProgress, setHugActionInProgress] = useState(false);
  const [hugInitialized, setHugInitialized] = useState(false);

  // State for huggers dropdown
  const [showHuggersDropdown, setShowHuggersDropdown] = useState(false);
  const [huggersList, setHuggersList] = useState([]);
  const [loadingHuggers, setLoadingHuggers] = useState(false);

  // State for creator user data
  const [creatorUserData, setCreatorUserData] = useState(null);

  // Connectivity state
  const [isOnline, setIsOnline] = useState(true);

  // Fetch user data for the creator of the post
  useEffect(() => {
    const fetchCreatorUserData = async () => {
      const userData = await fetchUserData(creatorUserId);
      setCreatorUserData(userData);
    };

    if (creatorUserId) {
      fetchCreatorUserData();
    }
  }, [creatorUserId]);

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
        setHugInitialized(true);

        const echoQuery = await firestore()
          .collection(`waves/${waveId}/echoes`)
          .where('userUid', '==', currentUserId)
          .limit(1)
          .get();
        
        // Add null check for echoQuery
        setHasEchoed(echoQuery && !echoQuery.empty);
      } catch (error) {
        console.error('Error checking interactions:', error);
        setHugInitialized(true); // Set to true even on error to allow interaction
      }
    };
    checkInteractions();
  }, [waveId, currentUserId]);

  const handleHug = () => {
    // Immediate visual feedback - no blocking
    const newHasHugged = !hasHugged;
    setHasHugged(newHasHugged);

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

  const handleEcho = () => {
    // Immediate visual feedback
    setHasEchoed(true);

    // Handle action based on connectivity
    if (isOnline) {
      // Call the parent callback for immediate sync
      onEcho(waveId);
    } else {
      // Queue action for offline processing (basic echo without text for now)
      offlineQueueService.addAction('echo', waveId, { text: '' });
    }

    // No blocking timeout - allow instant re-taps
  };

  const fetchHuggers = async () => {
    if (loadingHuggers) return;
    
    setLoadingHuggers(true);
    try {
      const splashesSnap = await firestore()
        .collection(`waves/${waveId}/splashes`)
        .orderBy('createdAt', 'desc')
        .get();
      
      const huggers = [];
      for (const doc of splashesSnap.docs) {
        const splashData = doc.data();
        const userId = doc.id; // The document ID is the user ID
        if (userId) {
          const userData = await fetchUserData(userId);
          if (userData) {
            huggers.push({
              id: userId,
              name: userData.displayName || userData.username || 'Unknown User',
              photo: userData.photoURL || userData.userPhoto,
              timestamp: splashData.createdAt,
            });
          }
        }
      }
      
      setHuggersList(huggers);
      setShowHuggersDropdown(true);
    } catch (error) {
      console.error('Error fetching huggers:', error);
      Alert.alert('Error', 'Failed to load huggers list');
    } finally {
      setLoadingHuggers(false);
    }
  };

  const handleHugPress = () => {
    // Show huggers list
    fetchHuggers();
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

  const handleCast = () => {
    onCast();
  };

  // Get creator profile picture URL, with fallback to default
  const creatorProfilePicture = creatorUserData?.userPhoto || creatorUserData?.photoURL || 'https://via.placeholder.com/100x100.png?text=No+Photo';

  return (
    <>
      {/* Icons Row */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.actionBar}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {/* Splashes Icon */}
        <View style={styles.iconButton}>
          <View style={styles.iconContainer}>
            <Pressable
              onPress={handleHugPress}
              style={styles.iconTouchable}
              hitSlop={{ top: 40, bottom: 40, left: 30, right: 30 }}
              pressRetentionOffset={{ top: 20, bottom: 20, left: 15, right: 15 }}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
              delayPressIn={0}
              delayPressOut={0}
            >
              <Text style={[styles.actionIcon, hasHugged && styles.hugActive]}>
                🫂
              </Text>
            </Pressable>
            <Text style={[styles.iconCount, Math.max(0, splashesCount) > 0 ? styles.activeIconCount : styles.inactiveIconCount]}>
              {Math.max(0, splashesCount)}
            </Text>
          </View>
        </View>

        {/* Echoes Icon */}
        <View style={styles.iconButton}>
          <View style={styles.iconContainer}>
            <Text style={[styles.actionIcon, hasEchoed && styles.echoActive]}>
              📣
            </Text>
            <Text style={[styles.iconCount, echoesCount > 0 ? styles.activeIconCount : styles.inactiveIconCount]}>
              {echoesCount}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Text Buttons Row */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.textButtonsBar}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {/* Splashes Button */}
        <Pressable
          onPress={handleHugAction} // Only update the hugs count - no list display
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text style={styles.actionLabel}>Hugs</Text>
        </Pressable>

        {/* Echoes Button */}
        <Pressable
          onPress={handleEcho}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text style={styles.actionLabel}>Echoes</Text>
        </Pressable>

        {/* Gems Button */}
        <Pressable
          onPress={handlePearl}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonIcon, pearlsCount > 0 && styles.pearlActive]}>💎</Text>
            <Text style={styles.actionLabel}>Gems</Text>
          </View>
        </Pressable>

        {/* Anchor Wave Button */}
        <Pressable
          onPress={handleAnchor}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonIcon, isAnchored && styles.activeAction]}>⚓</Text>
            <Text style={styles.actionLabel}>Anchor</Text>
          </View>
        </Pressable>

        {/* Cast Wave Button */}
        <Pressable
          onPress={handleCast}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonIcon, isCasted && styles.activeAction]}>📡</Text>
            <Text style={styles.actionLabel}>Cast</Text>
          </View>
        </Pressable>

        {/* Placeholder Button 1 */}
        <Pressable
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🔱</Text>
            <Text style={styles.actionLabel}>Placeholder 1</Text>
          </View>
        </Pressable>

        {/* Placeholder Button 2 */}
        <Pressable
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.pressedButton
          ]}
          hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
          pressRetentionOffset={{ top: 10, bottom: 10, left: 5, right: 5 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🐚</Text>
            <Text style={styles.actionLabel}>Placeholder 2</Text>
          </View>
        </Pressable>
      </ScrollView>

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
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          {loadingHuggers ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading huggers...</Text>
            </View>
          ) : huggersList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No one has hugged this post yet</Text>
            </View>
          ) : (
            <FlatList
              data={huggersList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.huggerItem}>
                  <Text style={styles.huggerName}>{item.name}</Text>
                  <Text style={styles.huggerTimestamp}>
                    {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleDateString() : 'Recently'}
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
    paddingVertical: 5,
    paddingHorizontal: 0,
    backgroundColor: 'grey',
    borderRadius: 0,
    marginHorizontal: -10,
    marginBottom: 1, // Reduced margin since we have text buttons below
  },
  textButtonsBar: {
    paddingVertical: 5,
    paddingHorizontal: 0,
    backgroundColor: 'grey',
    borderRadius: 0,
    marginHorizontal: -10,
    marginBottom: 10,
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
    backgroundColor: '#ff4444', // Red background like Facebook buttons
    borderRadius: 20, // Smooth curved corners
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10, // Add horizontal margin between buttons
  },
  pressedButton: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32, // Enlarged icons for better touch targets
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonIcon: {
    fontSize: 16, // Smaller icons for text buttons to fit without increasing size
    color: '#fff',
    marginRight: 6, // Space between icon and text
  },
  activeAction: {
    color: '#00ff88', // Highlight active interactions
  },
  hugActive: {
    color: '#0088ff', // Very blue for hugs
  },
  echoActive: {
    color: '#ff4444', // Extra red for echoes
  },
  pearlActive: {
    color: '#ff0088', // Red for pearls/gems
  },
  actionLabel: {
    fontSize: 12,
    color: '#ccc',
    marginRight: 4, // Space between text and count
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
    top: -8,
    right: -8,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    textAlign: 'center',
  },
  activeIconCount: {
    color: '#00ff88', // Green for counts > 0
  },
  inactiveIconCount: {
    color: '#ccc', // Grey for count = 0
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
    color: '#ccc',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
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
    color: '#ccc',
    marginTop: 2,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  hugButton: {
    backgroundColor: '#ff4444',
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