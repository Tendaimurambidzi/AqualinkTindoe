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
  const [hugState, setHugState] = useState<'hugged' | 'unhugged'>('unhugged');
  const [hasEchoed, setHasEchoed] = useState(false);
  const [localSplashesCount, setLocalSplashesCount] = useState(0); // Start at 0, will be updated based on user state
  const [realTimeSplashesCount, setRealTimeSplashesCount] = useState(initialSplashesCount); // Real-time total count
  const [hugActionInProgress, setHugActionInProgress] = useState(false);
  const [echoActionInProgress, setEchoActionInProgress] = useState(false);
  const [pearlActionInProgress, setPearlActionInProgress] = useState(false);

  // State for creator user data
  const [creatorUserData, setCreatorUserData] = useState(null);

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
      // Don't check Firestore if a hug action is currently in progress
      if (hugActionInProgress) return;
      
      try {
        const splashDoc = await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .get();
        
        const userHasHugged = splashDoc.exists;
        setHugState(userHasHugged ? 'hugged' : 'unhugged');
        setLocalSplashesCount(userHasHugged ? 1 : 0); // Set local count based on user's hug state

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
  }, [waveId, currentUserId]); // Removed hugActionInProgress from dependencies to avoid race conditions

  // Real-time listener for the total splashes count
  useEffect(() => {
    const unsubscribe = firestore()
      .doc(`waves/${waveId}`)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const currentCount = data?.counts?.splashes || 0;
          // Ensure count never goes below 0
          setRealTimeSplashesCount(Math.max(0, currentCount));
        }
      }, (error) => {
        console.error('Error listening to wave updates:', error);
      });

    return unsubscribe;
  }, [waveId]);

  const handleHug = () => {
    if (hugActionInProgress) return; // Prevent concurrent actions

    setHugActionInProgress(true);

    // Immediate visual feedback - toggle state instantly
    const isCurrentlyHugged = hugState === 'hugged';
    setHugState(isCurrentlyHugged ? 'unhugged' : 'hugged');
    setLocalSplashesCount(isCurrentlyHugged ? 0 : 1);

    // Handle backend operations asynchronously
    if (isCurrentlyHugged) {
      // User is unhugging
      firestore()
        .collection(`waves/${waveId}/splashes`)
        .doc(currentUserId)
        .delete()
        .then(async () => {
          // Update the wave's count in Firestore
          try {
            await firestore().doc(`waves/${waveId}`).update({
              'counts.splashes': firestore.FieldValue.increment(-1)
            });
          } catch (error) {
            console.error('Error updating hug count:', error);
          }

          onRemove();
        })
        .catch((error) => {
          console.error('Error removing hug:', error);
          // Revert on error
          setLocalSplashesCount(1);
          setHugState('hugged');
        })
        .finally(() => {
          setHugActionInProgress(false);
        });
    } else {
      // User is hugging
      firestore()
        .collection(`waves/${waveId}/splashes`)
        .doc(currentUserId)
        .set({
          userUid: currentUserId,
          createdAt: firestore.FieldValue.serverTimestamp(),
        })
        .then(async () => {
          // Update the wave's count in Firestore
          try {
            await firestore().doc(`waves/${waveId}`).update({
              'counts.splashes': firestore.FieldValue.increment(1)
            });
          } catch (error) {
            console.error('Error updating hug count:', error);
          }

          onAdd();

          // Send notification if not self
          if (currentUserId !== creatorUserId) {
            // Get user name and send notification
            firestore()
              .collection('users')
              .doc(currentUserId)
              .get()
              .then((userDoc) => {
                if (userDoc.exists) {
                  const userData = userDoc.data();
                  const fromName = userData?.displayName || userData?.name || 'Someone';
                  return functions().httpsCallable('addPing')({
                    recipientUid: creatorUserId,
                    type: 'hug',
                    waveId: waveId,
                    text: `/${fromName} hugged your wave!`,
                    fromUid: currentUserId,
                    fromName: fromName,
                  });
                }
              })
              .catch((error) => {
                console.error('Error sending hug notification:', error);
              });
          }
        })
        .catch((error) => {
          console.error('Error adding hug:', error);
          // Revert on error
          setLocalSplashesCount(0);
          setHugState('unhugged');
        })
        .finally(() => {
          setHugActionInProgress(false);
        });
    }
  };

  const handleEcho = () => {
    if (echoActionInProgress) return; // Prevent concurrent actions

    setEchoActionInProgress(true);
    
    // Immediate visual feedback
    setHasEchoed(true);
    
    // Call the parent callback
    onEcho();
    
    // Reset action in progress after a short delay
    setTimeout(() => {
      setEchoActionInProgress(false);
    }, 500);
  };

  const handlePearl = () => {
    if (pearlActionInProgress) return; // Prevent concurrent actions

    setPearlActionInProgress(true);
    
    // Call the parent callback
    onPearl();
    
    // Reset action in progress after a short delay
    setTimeout(() => {
      setPearlActionInProgress(false);
    }, 500);
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
      <View style={styles.actionButton}>
        <Pressable
          onPress={handleHug}
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={[styles.actionIcon, hugState === 'hugged' && styles.hugActive]}>
            🫂
          </Text>
        </Pressable>
        <Text style={styles.actionLabel}>Hugs</Text>
        <Text style={[styles.actionCount, realTimeSplashesCount > 0 ? styles.activeCount : styles.inactiveCount]}>
          {realTimeSplashesCount}
        </Text>
      </View>

      {/* Echoes Button */}
      <View style={styles.actionButton}>
        <Pressable
          onPress={handleEcho}
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={[styles.actionIcon, hasEchoed && styles.echoActive]}>
            📣
          </Text>
        </Pressable>
        <Text style={styles.actionLabel}>Echoes</Text>
        <Text style={[styles.actionCount, echoesCount > 0 ? styles.activeCount : styles.inactiveCount]}>
          {echoesCount}
        </Text>
      </View>

      {/* Gems Button */}
      <View style={styles.actionButton}>
        <Pressable
          onPress={handlePearl}
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={[styles.actionIcon, pearlsCount > 0 && styles.pearlActive]}>
            💎
          </Text>
        </Pressable>
        <Text style={styles.actionLabel}>Gems</Text>
      </View>

      {/* Anchor Wave Button */}
      <View style={styles.actionButton}>
        <Pressable
          onPress={handleAnchor}
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={[styles.actionIcon, isAnchored && styles.activeAction]}>
            ⚓
          </Text>
        </Pressable>
        <Text style={styles.actionLabel}>Anchor</Text>
        <Text style={styles.actionCount}></Text>
      </View>

      {/* Cast Wave Button */}
      <View style={styles.actionButton}>
        <Pressable
          onPress={handleCast}
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={[styles.actionIcon, isCasted && styles.activeAction]}>
            📡
          </Text>
        </Pressable>
        <Text style={styles.actionLabel}>Cast</Text>
        <Text style={styles.actionCount}></Text>
      </View>

      {/* Placeholder Button 1 */}
      <View style={styles.actionButton}>
        <Pressable
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={styles.actionIcon}>🔱</Text>
        </Pressable>
        <Text style={styles.actionLabel}>Placeholder 1</Text>
        <Text style={styles.actionCount}></Text>
      </View>

      {/* Placeholder Button 2 */}
      <View style={styles.actionButton}>
        <Pressable
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={styles.actionIcon}>🐚</Text>
        </Pressable>
        <Text style={styles.actionLabel}>Placeholder 2</Text>
        <Text style={styles.actionCount}></Text>
      </View>

      {/* Placeholder Button 3 */}
      <View style={styles.actionButton}>
        <Pressable
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={styles.actionIcon}></Text>
        </Pressable>
        <Text style={styles.actionLabel}></Text>
        <Text style={styles.actionCount}></Text>
      </View>

      {/* Placeholder Button 4 */}
      <View style={styles.actionButton}>
        <Pressable
          style={styles.iconTouchable}
          android_ripple={{color: 'rgba(255,255,255,0.1)'}}
          hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
        >
          <Text style={styles.actionIcon}></Text>
        </Pressable>
        <Text style={styles.actionLabel}></Text>
        <Text style={styles.actionCount}></Text>
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
    marginHorizontal: 15, // Increased spacing between buttons to prevent accidental clicks
  },
  iconTouchable: {
    padding: 8, // Increased padding for better touch area
    minWidth: 40, // Minimum touch width
    minHeight: 40, // Minimum touch height
    alignItems: 'center',
    justifyContent: 'center',
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