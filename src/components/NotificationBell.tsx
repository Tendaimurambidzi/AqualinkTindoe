import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebaseConfig';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface Notification {
  id: string;
  type: string;
  message: string;
  actorName: string;
  actorPhoto?: string;
  waveId?: string;
  waveTitle?: string;
  createdAt: any;
  read: boolean;
}

interface NotificationBellProps {
  onPress?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user?.uid) return;

    // Listen for notification count changes
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const data = doc.data();
        setUnreadCount(data?.notificationStats?.unreadCount || 0);
      });

    return unsubscribe;
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.bellContainer}>
      <Text style={{ fontSize: 24 }}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkRead
}) => {
  const handlePress = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    onPress(notification);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hug': return '💙';
      case 'echo': return '🔊';
      case 'echo_reply': return '💬';
      case 'connect': return '🤝';
      case 'mention': return '@';
      case 'share': return '📤';
      default: return '🔔';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.read && styles.unreadItem]}
      onPress={handlePress}
    >
      <Text style={styles.icon}>{getIcon(notification.type)}</Text>
      <View style={styles.content}>
        <Text style={[styles.message, !notification.read && styles.unreadText]}>
          {notification.message}
        </Text>
        {notification.waveTitle && (
          <Text style={styles.waveTitle}>{notification.waveTitle}</Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(notification.createdAt?.toDate?.() || notification.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

interface NotificationDropdownProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress: (notification: Notification) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  visible,
  onClose,
  onNotificationPress
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    const user = auth().currentUser;
    if (!user?.uid) return;

    setLoading(true);
    try {
      const getNotifications = httpsCallable(functions, 'getUserNotifications');
      const result = await getNotifications({ limit: 20, offset: 0 });
      setNotifications(result.data as Notification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const markRead = httpsCallable(functions, 'markNotificationRead');
      await markRead({ notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.dropdown}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ fontSize: 24, color: '#666' }}>✕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={onNotificationPress}
              onMarkRead={markAsRead}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 320,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    padding: 20,
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadItem: {
    backgroundColor: '#F8F9FF',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: '600',
  },
  waveTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});