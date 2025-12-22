import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(userId)
          .get();

        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
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
  const crewCount = userData?.crewCount || 0;

  // Format crew count (show "1k" for 1000+)
  const formatCrewCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: photoURL }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
      {showCrewCount && (
        <Text style={styles.crewText}>Crew: {formatCrewCount(crewCount)}</Text>
      )}
    </View>
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
});

export default ProfileAvatarWithCrew;