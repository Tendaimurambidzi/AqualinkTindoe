import { AppState, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import CallNotificationManager from './callNotificationService';
import firestore from '@react-native-firebase/firestore';

let currentCallNotificationId: string | null = null;

/**
 * Initialize call notification handlers
 * This should be called once when the app starts
 */
export function initializeCallNotifications() {
  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground FCM message:', remoteMessage);
    
    if (remoteMessage.data?.type === 'call_invite') {
      const callerName = remoteMessage.data.callerName || remoteMessage.data.fromName || 'Unknown';
      const callId = remoteMessage.data.callId || '';
      const callType = remoteMessage.data.callType || 'audio';
      
      if (callId && Platform.OS === 'android') {
        // Show notification even in foreground to ensure ringtone plays
        CallNotificationManager.showIncomingCallNotification(callerName, callId, callType as 'audio' | 'video');
        currentCallNotificationId = callId;
      }
    }
  });

  // Handle notification opened (user tapped on notification)
  const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened:', remoteMessage);
    
    if (remoteMessage.data?.type === 'call_invite') {
      const callId = remoteMessage.data.callId || '';
      if (callId) {
        // The app will handle showing the call modal
        // Just hide the notification
        hideCallNotification();
      }
    }
  });

  // Check if app was opened from a notification (when app was quit)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data?.type === 'call_invite') {
        const callId = remoteMessage.data.callId || '';
        if (callId) {
          // The app will handle showing the call modal
          hideCallNotification();
        }
      }
    });

  // Listen for call answered/declined from notification actions
  const answerListener = CallNotificationManager.addCallEventListener('onCallAnswered', ({ callId }) => {
    console.log('Call answered from notification:', callId);
    hideCallNotification();
    // The app will handle the rest
  });

  const declineListener = CallNotificationManager.addCallEventListener('onCallDeclined', ({ callId }) => {
    console.log('Call declined from notification:', callId);
    hideCallNotification();
    // Update call status in Firestore
    updateCallStatus(callId, 'declined');
  });

  // Hide notification when app comes to foreground
  const appStateListener = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active' && currentCallNotificationId) {
      // Give a small delay to let the app show its own modal
      setTimeout(() => {
        hideCallNotification();
      }, 500);
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeNotificationOpened();
    answerListener.remove();
    declineListener.remove();
    appStateListener.remove();
  };
}

/**
 * Show incoming call notification
 */
export function showIncomingCallNotification(
  callerName: string,
  callId: string,
  callType: 'audio' | 'video'
) {
  if (Platform.OS === 'android') {
    CallNotificationManager.showIncomingCallNotification(callerName, callId, callType);
    currentCallNotificationId = callId;
  }
}

/**
 * Hide incoming call notification
 */
export function hideCallNotification() {
  if (Platform.OS === 'android' && currentCallNotificationId) {
    CallNotificationManager.hideIncomingCallNotification();
    currentCallNotificationId = null;
  }
}

/**
 * Update call status in Firestore
 */
async function updateCallStatus(callId: string, status: 'declined' | 'missed' | 'ended') {
  try {
    await firestore()
      .collection('direct_calls')
      .doc(callId)
      .update({
        status,
        endedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error updating call status:', error);
  }
}
