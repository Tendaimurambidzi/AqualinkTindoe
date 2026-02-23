import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileAvatarWithCrewProps {
  userId: string;
  size?: number;
  showCrewCount?: boolean;
  showFleetCount?: boolean;
  style?: any;
  optimisticCrewCount?: number; // For instant UI feedback
}

const ProfileAvatarWithCrew: React.FC<ProfileAvatarWithCrewProps> = ({
  userId,
  size = 50,
  showCrewCount = true,
  showFleetCount = false,
  style,
  optimisticCrewCount,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cacheBustKey, setCacheBustKey] = useState(Date.now());
  const [crewCount, setCrewCount] = useState(0);
  const [fleetCount, setFleetCount] = useState(0);

  // Debug logging for state changes
  useEffect(() => {
    console.log(`[DEBUG] ProfileAvatarWithCrew fleetCount changed to ${fleetCount} for user ${userId}`);
  }, [fleetCount, userId]);

  useEffect(() => {
    if (!userId) {
      console.log(`[DEBUG] ProfileAvatarWithCrew: No userId provided`);
      return;
    }

    console.log(`[DEBUG] ProfileAvatarWithCrew: Setting up listeners for userId: ${userId}, showFleetCount: ${showFleetCount}, current fleetCount: ${fleetCount}`);

    // Reset counts when userId changes
    setCrewCount(0);
    setFleetCount(0);
    setLoading(true);

    // Set up real-time listener for user data changes
    const unsubscribeUser = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot((userDoc) => {
        if (userDoc.exists) {
          const newUserData = userDoc.data();
          console.log(`[ProfileAvatarWithCrew] Firestore update for user ${userId}:`, {
            oldPhoto: userData?.photoURL || userData?.userPhoto,
            newPhoto: newUserData?.photoURL || newUserData?.userPhoto,
            hasData: !!newUserData
          });
          setUserData(newUserData);
          
          // Update cache-busting key when photoURL changes
          const newPhotoURL = newUserData?.photoURL || newUserData?.userPhoto;
          const currentPhotoURL = userData?.photoURL || userData?.userPhoto;
          if (newPhotoURL !== currentPhotoURL && newPhotoURL) {
            console.log(`[ProfileAvatarWithCrew] Photo URL changed for user ${userId}, updating cache key`);
            setCacheBustKey(Date.now());
          }
        }
        setLoading(false);
      }, (error) => {
        console.error('[ProfileAvatarWithCrew] Error listening to user data:', error);
        setLoading(false);
      });

  // Set up real-time listener for crew count changes (followers)
    const unsubscribeCrew = firestore()
      .collection('users')
      .doc(userId)
      .collection('crew')
      .onSnapshot((crewSnapshot) => {
        const newCount = crewSnapshot.size;
        console.log(`[DEBUG] Crew count (followers) update for user ${userId}: ${crewCount} -> ${newCount} (docs: ${crewSnapshot.docs.length})`);
        setCrewCount(newCount);
      }, (error) => {
        console.error(`[DEBUG] Error listening to crew count for ${userId}:`, error);
      });

    // Set up real-time listener for fleet count changes (following)
    const unsubscribeFleet = firestore()
      .collection('users')
      .doc(userId)
      .collection('following')
      .onSnapshot((fleetSnapshot) => {
        const newCount = fleetSnapshot.size;
        console.log(`[DEBUG] ProfileAvatarWithCrew Fleet listener fired for user ${userId}: current fleetCount=${fleetCount}, newCount=${newCount}, docs:`, fleetSnapshot.docs.map(doc => ({ id: doc.id, exists: doc.exists })));
        console.log(`[DEBUG] Setting fleetCount to ${newCount} for user ${userId}`);
        setFleetCount(newCount);
        console.log(`[DEBUG] fleetCount has been set to ${newCount} for user ${userId}`);
      }, (error) => {
        console.error(`[DEBUG] Error listening to fleet count for ${userId}:`, error);
      });

    // Cleanup listeners on unmount or userId change
    return () => {
      unsubscribeUser();
      unsubscribeCrew();
      unsubscribeFleet();
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
        {showCrewCount && (
          <Text style={styles.crewText}>Crew: ...</Text>
        )}
        {showFleetCount && (
          <Text style={styles.fleetText}>Fleet: ...</Text>
        )}
      </View>
    );
  }

  const photoURL = userData?.photoURL || userData?.userPhoto || 'https://via.placeholder.com/50';
  // Use stable cache-busting key that only updates when photoURL actually changes
  const photoURLWithCacheBust = photoURL.includes('via.placeholder.com') 
    ? photoURL 
    : `${photoURL}?t=${cacheBustKey}`;

  // Format crew count (show "1k" for 1000+)
  const formatCrewCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  // Format fleet count (show "1k" for 1000+)
  const formatFleetCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  return (
    <>
      <View style={[styles.container, style]}>
        <Pressable 
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [
            { padding: 2 },
            pressed && {
              opacity: 0.8,
              transform: [{ scale: 0.95 }],
            }
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={{ uri: photoURLWithCacheBust }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          />
        </Pressable>
        <View style={styles.countsContainer}>
          {showCrewCount && (
            <Text style={styles.crewText}>Crew: {formatCrewCount(optimisticCrewCount !== undefined ? optimisticCrewCount : crewCount)}</Text>
          )}
          {showFleetCount && (
            <Text style={styles.fleetText}>Fleet: {formatFleetCount(fleetCount)}</Text>
          )}
        </View>
      </View>

      {/* Full-size profile picture modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Close button */}
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && {
                opacity: 0.8,
                transform: [{ scale: 0.9 }],
              }
            ]}
            onPress={() => setShowModal(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          {/* Image container */}
          <Pressable
            style={styles.modalContent}
            onPress={() => setShowModal(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={{ uri: photoURLWithCacheBust }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countsContainer: {
    marginLeft: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#00C2FF',
  },
  crewText: {
    fontSize: 12,
    color: '#DC143C',
    fontWeight: 'bold',
  },
  fleetText: {
    fontSize: 12,
    color: '#00C2FF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default ProfileAvatarWithCrew;