import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import database from '@react-native-firebase/database';

interface OnlineUser {
  uid: string;
  name: string;
  avatar?: string;
}

interface OnlineUsersListProps {
  myUid: string | null;
  onUserPress: (user: OnlineUser) => void;
}

const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ myUid, onUserPress }) => {
  const [allOnlineUsers, setAllOnlineUsers] = useState<OnlineUser[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<OnlineUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Fetch online users from Firebase
  useEffect(() => {
    if (!myUid) return;

    const presenceRef = database().ref('/presence');
    const unsubscribe = presenceRef.on('value', async (snapshot) => {
      if (!snapshot) return;

      const presenceData = snapshot.val();
      if (!presenceData) {
        setAllOnlineUsers([]);
        return;
      }

      const onlineUids = Object.keys(presenceData).filter(
        uid => uid !== myUid && presenceData[uid]?.online
      );

      // Fetch user names from Firestore
      const usersPromises = onlineUids.map(async (uid) => {
        try {
          const userDoc = await database().ref(`/users/${uid}`).once('value');
          const userData = userDoc.val();
          return {
            uid,
            name: userData?.name || userData?.displayName || 'User',
            avatar: userData?.avatar || null,
          };
        } catch (error) {
          return {
            uid,
            name: 'User',
            avatar: null,
          };
        }
      });

      const users = await Promise.all(usersPromises);
      setAllOnlineUsers(users);
    });

    return () => presenceRef.off('value', unsubscribe);
  }, [myUid]);

  // Rotate displayed users every 10 seconds
  useEffect(() => {
    if (allOnlineUsers.length === 0) {
      setDisplayedUsers([]);
      return;
    }

    // Initial display
    const getNextUsers = (startIdx: number) => {
      const users = [];
      for (let i = 0; i < 5; i++) {
        if (allOnlineUsers.length > 0) {
          users.push(allOnlineUsers[(startIdx + i) % allOnlineUsers.length]);
        }
      }
      return users;
    };

    setDisplayedUsers(getNextUsers(0));

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Update users
        setCurrentIndex((prev) => {
          const nextIdx = (prev + 5) % allOnlineUsers.length;
          setDisplayedUsers(getNextUsers(nextIdx));
          return nextIdx;
        });

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [allOnlineUsers, fadeAnim]);

  if (displayedUsers.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: 10,
        top: 80,
        zIndex: 10,
      }}
    >
      {/* Green dot */}
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: '#00FF00',
          marginBottom: 8,
        }}
      />

      {/* User list */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {displayedUsers.map((user, index) => (
          <Pressable
            key={`${user.uid}-${index}`}
            onPress={() => onUserPress(user)}
            style={({ pressed }) => [
              {
                marginBottom: 6,
                paddingVertical: 4,
                paddingHorizontal: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 4,
              },
              pressed && {
                backgroundColor: 'rgba(200, 200, 200, 0.9)',
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#000',
                fontWeight: '500',
              }}
              numberOfLines={1}
            >
              {user.name}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
};

export default OnlineUsersList;
