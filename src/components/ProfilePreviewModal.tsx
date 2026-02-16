import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, Image, ActivityIndicator } from 'react-native';
import database from '@react-native-firebase/database';
import ProfileAvatarWithCrew from './ProfileAvatarWithCrew';

interface ProfilePreviewModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  onChat: (userId: string, userName: string) => void;
}

const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  visible,
  userId,
  onClose,
  onChat,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId) {
      setUserData(null);
      return;
    }

    setLoading(true);
    const userRef = database().ref(`/users/${userId}`);
    
    userRef.once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        setUserData(data);
      })
      .catch((error) => {
        console.log('Error fetching user data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [visible, userId]);

  if (!visible || !userId) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            width: '85%',
            maxWidth: 400,
            alignItems: 'center',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#00C2FF" />
          ) : (
            <>
              {/* Profile Avatar */}
              <ProfileAvatarWithCrew
                userId={userId}
                size={80}
                showCrewCount={true}
                showFleetCount={false}
              />

              {/* Username */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#000',
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                {userData?.name || userData?.displayName || 'User'}
              </Text>

              {/* Bio */}
              {userData?.bio && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    marginTop: 8,
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {userData.bio}
                </Text>
              )}

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 24,
                  gap: 12,
                }}
              >
                {/* Chat Button */}
                <Pressable
                  onPress={() => {
                    onChat(userId, userData?.name || userData?.displayName || 'User');
                    onClose();
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: '#00C2FF',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      flex: 1,
                    },
                    pressed && {
                      opacity: 0.8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Chat
                  </Text>
                </Pressable>

                {/* Close Button */}
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    {
                      backgroundColor: '#E0E0E0',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      flex: 1,
                    },
                    pressed && {
                      opacity: 0.8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 16,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfilePreviewModal;
