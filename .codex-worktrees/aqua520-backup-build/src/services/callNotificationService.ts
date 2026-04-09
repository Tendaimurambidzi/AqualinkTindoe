import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { CallNotification } = NativeModules;

class CallNotificationManager {
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android' && CallNotification) {
      this.eventEmitter = new NativeEventEmitter(CallNotification);
    }
  }

  showIncomingCallNotification(callerName: string, callId: string, callType: 'audio' | 'video') {
    if (Platform.OS === 'android' && CallNotification) {
      CallNotification.showIncomingCallNotification(callerName, callId, callType);
    }
  }

  hideIncomingCallNotification() {
    if (Platform.OS === 'android' && CallNotification) {
      CallNotification.hideIncomingCallNotification();
    }
  }

  addCallEventListener(eventName: 'onCallAnswered' | 'onCallDeclined', callback: (data: { callId: string }) => void) {
    if (this.eventEmitter) {
      return this.eventEmitter.addListener(eventName, callback);
    }
    return { remove: () => {} };
  }
}

export default new CallNotificationManager();
