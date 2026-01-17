// Import necessary components and hooks
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
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
  const [hasHugged, setHasHugged] = useState(false);
  const [hasEchoed, setHasEchoed] = useState(false);
  const [hugActionInProgress, setHugActionInProgress] = useState(false);
  const [echoActionInProgress, setEchoActionInProgress] = useState(false);
  const [pearlActionInProgress, setPearlActionInProgress] = useState(false);
  const [hugInitialized, setHugInitialized] = useState(false);

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
      if (hasHugged) {
        onRemove();
      } else {
        onAdd();
      }
    } else {
      // Queue action for offline processing
      const actionType = hasHugged ? 'unsplash' : 'splash';
      offlineQueueService.addAction(actionType, waveId);
    }

    // No blocking timeout - allow instant re-taps
  };

  const handleEcho = () => {
    if (echoActionInProgress) return; // Prevent concurrent actions

    setEchoActionInProgress(true);

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
    setEchoActionInProgress(false);
  };

  const handlePearl = () => {
    if (pearlActionInProgress) return; // Prevent concurrent actions

    setPearlActionInProgress(true);
    
    // Call the parent callback
    onPearl();
    
    // No blocking timeout - allow instant re-taps
    setPearlActionInProgress(false);
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
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.actionBar}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}
      contentContainerStyle={{ flexDirection: 'row' }}
    >
      {/* Splashes Button */}
      <View style={styles.actionButton}>
        <Text style={[styles.actionIcon, hasHugged && styles.hugActive]}>
          🫂
        </Text>
        <TouchableOpacity
          onPress={handleHug}
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}>Hugs</Text>
          <Text style={[styles.actionCount, Math.max(0, splashesCount) > 0 ? styles.activeCount : styles.inactiveCount]}>
            {Math.max(0, splashesCount)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Echoes Button */}
      <View style={styles.actionButton}>
        <Text style={[styles.actionIcon, hasEchoed && styles.echoActive]}>
          📣
        </Text>
        <TouchableOpacity
          onPress={handleEcho}
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}>Echoes</Text>
          <Text style={[styles.actionCount, echoesCount > 0 ? styles.activeCount : styles.inactiveCount]}>
            {echoesCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gems Button */}
      <View style={styles.actionButton}>
        <Text style={[styles.actionIcon, pearlsCount > 0 && styles.pearlActive]}>
          💎
        </Text>
        <TouchableOpacity
          onPress={handlePearl}
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}>Gems</Text>
        </TouchableOpacity>
      </View>

      {/* Anchor Wave Button - Only show for other users' posts */}
      {currentUserId !== creatorUserId && (
        <View style={styles.actionButton}>
          <Text style={[styles.actionIcon, isAnchored && styles.activeAction]}>
            ⚓
          </Text>
          <TouchableOpacity
            onPress={handleAnchor}
            style={styles.textButton}
            activeOpacity={0.7}
            delayPressIn={0}
          >
            <Text style={styles.actionLabel}>Anchor</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cast Wave Button - Only show for other users' posts */}
      {currentUserId !== creatorUserId && (
        <View style={styles.actionButton}>
          <Text style={[styles.actionIcon, isCasted && styles.activeAction]}>
            📡
          </Text>
          <TouchableOpacity
            onPress={handleCast}
            style={styles.textButton}
            activeOpacity={0.7}
            delayPressIn={0}
          >
            <Text style={styles.actionLabel}>Cast</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Placeholder Button 1 */}
      <View style={styles.actionButton}>
        <Text style={styles.actionIcon}>🔱</Text>
        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}>Placeholder 1</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder Button 2 */}
      <View style={styles.actionButton}>
        <Text style={styles.actionIcon}>🐚</Text>
        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}>Placeholder 2</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder Button 3 */}
      <View style={styles.actionButton}>
        <Text style={styles.actionIcon}></Text>
        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}></Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder Button 4 */}
      <View style={styles.actionButton}>
        <Text style={styles.actionIcon}></Text>
        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          <Text style={styles.actionLabel}></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  actionBar: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: 'grey',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 20, // Increased spacing between buttons to prevent accidental clicks
  },
  iconTouchable: {
    padding: 12, // Increased padding for better touch area
    minWidth: 48, // Increased minimum touch width
    minHeight: 48, // Increased minimum touch height
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    backgroundColor: '#ff4444', // Red background like Facebook buttons
    borderRadius: 20, // Smooth curved corners
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionIcon: {
    fontSize: 24, // Enlarged icons
    color: '#fff',
    fontWeight: 'bold',
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
    marginTop: 2,
    marginBottom: 2,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  activeCount: {
    color: '#00ff88', // Green for counts > 0
  },
  inactiveCount: {
    color: '#fff', // White for count = 0
  },
});

export default PosterActionBar;