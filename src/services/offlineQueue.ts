import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

const QUEUE_KEY = '@offline_queue';

export interface QueuedAction {
  id: string;
  type: 'addSplash' | 'removeSplash' | 'addEcho' | 'addPearl' | 'anchor' | 'cast';
  data: any;
  timestamp: number;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedAction[] = [];
  private isOnline = true;
  private syncing = false;

  private constructor() {
    this.loadQueue();
    this.setupConnectivityListener();
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupConnectivityListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline && wasOffline) {
        this.syncQueue();
      }
    });
  }

  async addAction(type: QueuedAction['type'], data: any) {
    const action: QueuedAction = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
    };
    this.queue.push(action);
    await this.saveQueue();

    if (this.isOnline) {
      this.syncQueue();
    }
  }

  private async syncQueue() {
    if (this.syncing || !this.isOnline) return;
    this.syncing = true;

    const actionsToSync = [...this.queue];
    this.queue = [];
    await this.saveQueue();

    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Re-queue failed actions
        this.queue.push(action);
        await this.saveQueue();
      }
    }

    this.syncing = false;
  }

  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'addSplash':
        await firestore()
          .collection(`waves/${action.data.waveId}/splashes`)
          .doc(action.data.userId)
          .set({ createdAt: firestore.FieldValue.serverTimestamp() });
        break;
      case 'removeSplash':
        await firestore()
          .collection(`waves/${action.data.waveId}/splashes`)
          .doc(action.data.userId)
          .delete();
        break;
      case 'addEcho':
        const createEchoFn = functions().httpsCallable('createEcho', { region: 'us-central1' });
        await createEchoFn({
          waveId: action.data.waveId,
          text: action.data.text,
          fromName: action.data.userName,
          fromPhoto: action.data.userPhoto,
          replyToEchoId: action.data.replyToEchoId,
        });
        break;
      case 'addPearl':
        await firestore()
          .collection(`waves/${action.data.waveId}/pearls`)
          .doc(action.data.userId)
          .set({ createdAt: firestore.FieldValue.serverTimestamp() });
        break;
      case 'anchor':
        await firestore()
          .collection(`waves/${action.data.waveId}/anchors`)
          .doc(action.data.userId)
          .set({ createdAt: firestore.FieldValue.serverTimestamp() });
        break;
      case 'cast':
        await firestore()
          .collection(`waves/${action.data.waveId}/casts`)
          .doc(action.data.userId)
          .set({ createdAt: firestore.FieldValue.serverTimestamp() });
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}

export const offlineQueue = OfflineQueue.getInstance();