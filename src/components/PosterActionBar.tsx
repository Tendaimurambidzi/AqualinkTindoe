// Import necessary components and hooks
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

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
  onEcho: () => void;
  onPearl: () => void;
  onAnchor: () => void;
  onCast: () => void;
  creatorUserId: string;
}

// Main component
const PosterActionBar: React.FC<PosterActionBarProps> = ({
  waveId,
  currentUserId,
  splashesCount: initialSplashesCount,
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
  const [hasSplashed, setHasSplashed] = useState(false);
  const [hasEchoed, setHasEchoed] = useState(false);
  const [localSplashesCount, setLocalSplashesCount] = useState(initialSplashesCount);

  // State for creator user data
  const [creatorUserData, setCreatorUserData] = useState(null);

  // Track if a splash action is currently in progress
  const [splashActionInProgress, setSplashActionInProgress] = useState(false);

  // Initialize local count with props only once
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!isInitialized) {
      setLocalSplashesCount(initialSplashesCount);
      setIsInitialized(true);
    }
  }, [initialSplashesCount, isInitialized]);

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

  // Check if user has already interacted
  useEffect(() => {
    const checkInteractions = async () => {
      // Don't check Firestore if a splash action is currently in progress
      if (splashActionInProgress) return;
      
      try {
        const splashDoc = await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .get();
        setHasSplashed(splashDoc.exists);

        const echoQuery = await firestore()
          .collection(`waves/${waveId}/echoes`)
          .where('userUid', '==', currentUserId)
          .limit(1)
          .get();
        setHasEchoed(!echoQuery.empty);
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
    };
    checkInteractions();
  }, [waveId, currentUserId, splashActionInProgress]);

  const handleSplash = async () => {
    // Prevent multiple clicks while action is in progress
    if (splashActionInProgress) return;
    
    setSplashActionInProgress(true);
    
    try {
      if (hasSplashed) {
        // Immediately update local count for instant feedback
        setLocalSplashesCount(prev => Math.max(0, prev - 1));
        // Remove splash from backend
        await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .delete();
        setHasSplashed(false);
        onRemove();
      } else {
        // Immediately update local count for instant feedback
        setLocalSplashesCount(prev => prev + 1);
        // Add splash to backend
        await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .set({
            userUid: currentUserId,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        setHasSplashed(true);
        // Send notification if not self
        if (currentUserId !== creatorUserId) {
          try {
            // Get user name
            let fromName = 'Someone';
            try {
              const userDoc = await firestore()
                .collection('users')
                .doc(currentUserId)
                .get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                fromName = userData?.displayName || userData?.name || 'Someone';
              }
            } catch (e) {
              console.warn('Failed to get user name for notification:', e);
            }
            await functions().httpsCallable('addPing')({
              recipientUid: creatorUserId,
              type: 'hug',
              waveId: waveId,
              text: `${fromName} has hugged your SplashLine`,
              fromUid: currentUserId,
              fromName: fromName,
            });
          } catch (error) {
            console.error('Error sending hug notification:', error);
          }
        }
        onAdd();
      }
    } catch (error) {
      console.error('Error handling splash:', error);
      // Revert local count on error
      if (hasSplashed) {
        setLocalSplashesCount(prev => prev + 1);
      } else {
        setLocalSplashesCount(prev => Math.max(0, prev - 1));
      }
    } finally {
      // Always clear the action in progress flag
      setSplashActionInProgress(false);
    }
  };

  const handleEcho = () => {
    onEcho();
  };

  const handlePearl = () => {
    onPearl();
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionBar}>
      {/* Splashes Button */}
      <Pressable 
        style={styles.actionButton} 
        onPress={handleSplash} 
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        disabled={splashActionInProgress}
      >
        <Text style={[styles.actionText, localSplashesCount > 0 && styles.activeAction]}>
          🫂
        </Text>
        <Text style={styles.actionLabel}>Hugs</Text>
        <Text style={[styles.actionText, localSplashesCount > 0 && styles.activeAction]}>
          {localSplashesCount}
        </Text>
      </Pressable>

      {/* Echoes Button */}
      <Pressable style={styles.actionButton} onPress={handleEcho} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={[styles.actionText, echoesCount > 0 && styles.activeAction]}>
          📣
        </Text>
        <Text style={styles.actionLabel}>Echoes</Text>
        <Text style={[styles.actionText, echoesCount > 0 && styles.activeAction]}>
          {echoesCount}
        </Text>
      </Pressable>

      {/* Gems Button */}
      <Pressable style={styles.actionButton} onPress={handlePearl} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={[styles.actionText, pearlsCount > 0 && styles.activeAction]}>
          💎
        </Text>
        <Text style={styles.actionLabel}>Gems</Text>
      </Pressable>

      {/* Anchor Wave Button */}
      <Pressable style={styles.actionButton} onPress={handleAnchor} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={[styles.actionText, isAnchored && styles.activeAction]}>
          ⚓
        </Text>
        <Text style={styles.actionLabel}>Anchor</Text>
      </Pressable>

      {/* Cast Wave Button */}
      <Pressable style={styles.actionButton} onPress={handleCast} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={[styles.actionText, isCasted && styles.activeAction]}>
          📡
        </Text>
        <Text style={styles.actionLabel}>Cast</Text>
      </Pressable>

      {/* Placeholder Button 1 */}
      <Pressable style={styles.actionButton}>
        <Text style={styles.actionText}>🔱</Text>
        <Text style={styles.actionLabel}>Placeholder 1</Text>
      </Pressable>

      {/* Placeholder Button 2 */}
      <Pressable style={styles.actionButton}>
        <Text style={styles.actionText}>🐚</Text>
        <Text style={styles.actionLabel}>Placeholder 2</Text>
      </Pressable>

      {/* Placeholder Button 3 */}
      <Pressable style={styles.actionButton}>
        <Text style={styles.actionText}></Text>
        <Text style={styles.actionLabel}></Text>
      </Pressable>

      {/* Placeholder Button 4 */}
      <Pressable style={styles.actionButton}>
        <Text style={styles.actionText}></Text>
        <Text style={styles.actionLabel}></Text>
      </Pressable>
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
    padding: 10,
    marginHorizontal: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  activeAction: {
    color: '#00ff88', // Highlight active interactions
  },
  actionLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});

export default PosterActionBar;