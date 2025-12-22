import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileAvatarWithCrewProps {
  userId: string;
  size?: number;
  showCrewCount?: boolean;
  style?: any;
}

const ProfileAvatarWithCrew: React.FC<ProfileAvatarWithCrewProps> = ({
  userId,
  size = 50,
  showCrewCount = true,
  style,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cacheBustKey, setCacheBustKey] = useState(Date.now());
  const [crewCount, setCrewCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time listener for user data changes
    const unsubscribeUser = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot((userDoc) => {
        if (userDoc.exists) {
          const newUserData = userDoc.data();
          setUserData(newUserData);
          
          // Update cache-busting key when photoURL changes
          const newPhotoURL = newUserData?.photoURL || newUserData?.userPhoto;
          const currentPhotoURL = userData?.photoURL || userData?.userPhoto;
          if (newPhotoURL !== currentPhotoURL && newPhotoURL) {
            setCacheBustKey(Date.now());
          }
        }
        setLoading(false);
      }, (error) => {
        console.error('Error listening to user data:', error);
        setLoading(false);
      });

    // Set up real-time listener for crew count changes
    const unsubscribeCrew = firestore()
      .collection('users')
      .doc(userId)
      .collection('crew')
      .onSnapshot((crewSnapshot) => {
        setCrewCount(crewSnapshot.size);
      }, (error) => {
        console.error('Error listening to crew count:', error);
      });

    // Cleanup listeners on unmount or userId change
    return () => {
      unsubscribeUser();
      unsubscribeCrew();
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
        {showCrewCount && (
          <Text style={styles.crewText}>Crew: ...</Text>
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

  return (
    <>
      <View style={[styles.container, style]}>
        <TouchableOpacity onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Image
            source={{ uri: photoURLWithCacheBust }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          />
        </TouchableOpacity>
        {showCrewCount && (
          <Text style={styles.crewText}>Crew: {formatCrewCount(crewCount)}</Text>
        )}
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Image container */}
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <Image
              source={{ uri: photoURLWithCacheBust }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
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
  avatar: {
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#00C2FF',
  },
  crewText: {
    marginLeft: 8,
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