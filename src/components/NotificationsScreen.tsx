import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';

interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorPhoto?: string;
  type: string;
  entityId: string;
  entityType: string;
  message: string;
  waveId?: string;
  waveTitle?: string;
  isRead: boolean;
  createdAt: any;
}

interface NotificationsScreenProps {
  onClose: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const getNotificationsFn = httpsCallable(functions, 'getUserNotifications');
      const result = await getNotificationsFn({ limit: 50 });
      setNotifications(result.data as NotificationItem[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const markReadFn = httpsCallable(functions, 'markNotificationRead');
      await markReadFn({ notificationId });

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // TODO: Navigate to relevant screen based on notification type
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        {item.actorPhoto ? (
          <Image source={{ uri: item.actorPhoto }} style={styles.actorPhoto} />
        ) : (
          <View style={styles.defaultPhoto}>
            <Text style={styles.defaultPhotoText}>
              {item.actorName.charAt(1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.notificationText}>
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>NOTIFICATIONS</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NOTIFICATIONS</Text>
        <View style={{ width: 30 }} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>When someone interacts with your content, you'll see it here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#111',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
  },
  unreadNotification: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 3,
    borderLeftColor: '#00C2FF',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  defaultPhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationText: {
    flex: 1,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C2FF',
  },
});

export default NotificationsScreen;