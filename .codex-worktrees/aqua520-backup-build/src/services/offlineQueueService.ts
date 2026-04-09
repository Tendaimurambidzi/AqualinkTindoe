// src/services/offlineQueueService.ts
// Offline queue service for handling actions when connectivity is poor
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface QueuedAction {
  id: string;
  type: 'splash' | 'unsplash' | 'echo' | 'connect' | 'disconnect';
  waveId: string;
  userId: string;
  timestamp: number;
  retryCount: number;
  data?: any;
}

const QUEUE_KEY = 'offline_action_queue';
const MAX_RETRY_COUNT = 5;

class OfflineQueueService {
  private isProcessing = false;
  private queue: QueuedAction[] = [];

  constructor() {
    this.loadQueue();
    this.startProcessing();
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

  private startProcessing() {
    // Process queue every 30 seconds when online
    setInterval(async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected && !this.isProcessing) {
        this.processQueue();
      }
    }, 30000);
  }

  async addAction(type: QueuedAction['type'], waveId: string, data?: any) {
    const user = auth().currentUser;
    if (!user) return;

    const action: QueuedAction = {
      id: `${type}_${waveId}_${Date.now()}`,
      type,
      waveId,
      userId: user.uid,
      timestamp: Date.now(),
      retryCount: 0,
      data
    };

    this.queue.push(action);
    await this.saveQueue();

    // Try to process immediately if online
    const state = await NetInfo.fetch();
    if (state.isConnected && !this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        this.isProcessing = false;
        return;
      }

      const actionsToProcess = [...this.queue];
      const successfulActions: string[] = [];

      for (const action of actionsToProcess) {
        try {
          await this.executeAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Failed to execute queued action ${action.type}:`, error);
          action.retryCount++;

          if (action.retryCount >= MAX_RETRY_COUNT) {
            console.warn(`Removing action ${action.id} after ${MAX_RETRY_COUNT} retries`);
            successfulActions.push(action.id);
          }
        }
      }

      // Remove successful actions from queue
      this.queue = this.queue.filter(action => !successfulActions.includes(action.id));
      await this.saveQueue();

    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeAction(action: QueuedAction) {
    const { type, waveId, userId, data } = action;

    switch (type) {
      case 'splash':
        await this.executeSplash(waveId, userId);
        break;
      case 'unsplash':
        await this.executeUnsplash(waveId, userId);
        break;
      case 'echo':
        await this.executeEcho(waveId, userId, data);
        break;
      case 'connect':
        await this.executeConnect(waveId, userId);
        break;
      case 'disconnect':
        await this.executeDisconnect(waveId, userId);
        break;
    }
  }

  private async executeSplash(waveId: string, userId: string) {
    const splashRef = firestore()
      .collection('waves')
      .doc(waveId)
      .collection('splashes')
      .doc(userId);

    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const username = userData?.username || userData?.displayName || 'Unknown User';

    await splashRef.set({
      userUid: userId,
      waveId,
      userName: username,
      userPhoto: userData?.userPhoto || userData?.photoURL || null,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  private async executeUnsplash(waveId: string, userId: string) {
    const splashRef = firestore()
      .collection('waves')
      .doc(waveId)
      .collection('splashes')
      .doc(userId);

    await splashRef.delete();
  }

  private async executeEcho(waveId: string, userId: string, data: any) {
    const echoRef = firestore()
      .collection('waves')
      .doc(waveId)
      .collection('echoes')
      .doc();

    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const username = userData?.username || userData?.displayName || 'Unknown User';

    await echoRef.set({
      userUid: userId,
      waveId,
      text: data?.text || '',
      userName: username,
      userPhoto: userData?.userPhoto || userData?.photoURL || null,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  private async executeConnect(waveId: string, userId: string) {
    const waveDoc = await firestore().collection('waves').doc(waveId).get();
    if (!waveDoc.exists) return;

    const waveData = waveDoc.data();
    const creatorId = waveData?.ownerUid;

    if (!creatorId || creatorId === userId) return;

    // Add to following
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('following')
      .doc(creatorId)
      .set({
        userId: creatorId,
        followedAt: firestore.FieldValue.serverTimestamp()
      });

    // Add to followers
    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const followerName = userData?.username || userData?.displayName || 'Unknown User';

    await firestore()
      .collection('users')
      .doc(creatorId)
      .collection('followers')
      .doc(userId)
      .set({
        userId: userId,
        followedAt: firestore.FieldValue.serverTimestamp(),
        followerName: followerName
      });
  }

  private async executeDisconnect(waveId: string, userId: string) {
    const waveDoc = await firestore().collection('waves').doc(waveId).get();
    if (!waveDoc.exists) return;

    const waveData = waveDoc.data();
    const creatorId = waveData?.ownerUid;

    if (!creatorId) return;

    // Remove from following
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('following')
      .doc(creatorId)
      .delete();

    // Remove from followers
    await firestore()
      .collection('users')
      .doc(creatorId)
      .collection('followers')
      .doc(userId)
      .delete();
  }

  getQueueLength() {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const offlineQueueService = new OfflineQueueService();