import { Alert } from 'react-native';

/**
 * Block a user
 */
export async function blockUser(uid: string, targetUid: string): Promise<boolean> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Error', 'Backend not configured');
      return false;
    }

    const response = await fetch(`${backendBase}/block-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, targetUid }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert('User Blocked', 'User has been blocked successfully');
      return true;
    } else {
      Alert.alert('Block Failed', 'Could not block user');
      return false;
    }
  } catch (error) {
    console.error('Block user error:', error);
    Alert.alert('Error', 'Could not block user. Please try again.');
    return false;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(uid: string, targetUid: string): Promise<boolean> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Error', 'Backend not configured');
      return false;
    }

    const response = await fetch(`${backendBase}/unblock-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, targetUid }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert('User Unblocked', 'User has been unblocked');
      return true;
    } else {
      Alert.alert('Unblock Failed', 'Could not unblock user');
      return false;
    }
  } catch (error) {
    console.error('Unblock user error:', error);
    Alert.alert('Error', 'Could not unblock user. Please try again.');
    return false;
  }
}

/**
 * Mute a user in drift
 */
export async function muteUser(liveId: string, targetUid: string, duration: number = 300): Promise<boolean> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Error', 'Backend not configured');
      return false;
    }

    const response = await fetch(`${backendBase}/mute-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, targetUid, duration }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      const minutes = Math.floor(duration / 60);
      Alert.alert('User Muted', `User has been muted for ${minutes} minute(s)`);
      return true;
    } else {
      Alert.alert('Mute Failed', 'Could not mute user');
      return false;
    }
  } catch (error) {
    console.error('Mute user error:', error);
    Alert.alert('Error', 'Could not mute user. Please try again.');
    return false;
  }
}

/**
 * Unmute a user in drift
 */
export async function unmuteUser(liveId: string, targetUid: string): Promise<boolean> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Error', 'Backend not configured');
      return false;
    }

    const response = await fetch(`${backendBase}/unmute-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, targetUid }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert('User Unmuted', 'User can now participate again');
      return true;
    } else {
      Alert.alert('Unmute Failed', 'Could not unmute user');
      return false;
    }
  } catch (error) {
    console.error('Unmute user error:', error);
    Alert.alert('Error', 'Could not unmute user. Please try again.');
    return false;
  }
}

/**
 * Remove a user from drift
 */
export async function removeFromDrift(liveId: string, targetUid: string): Promise<boolean> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Error', 'Backend not configured');
      return false;
    }

    const response = await fetch(`${backendBase}/remove-from-drift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, targetUid }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert('User Removed', 'User has been removed from the drift');
      return true;
    } else {
      Alert.alert('Remove Failed', 'Could not remove user');
      return false;
    }
  } catch (error) {
    console.error('Remove from drift error:', error);
    Alert.alert('Error', 'Could not remove user. Please try again.');
    return false;
  }
}

/**
 * Get viewer count for a drift
 */
export async function getViewerCount(liveId: string): Promise<number> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      return 0;
    }

    const response = await fetch(`${backendBase}/drift/viewer-count?liveId=${encodeURIComponent(liveId)}`);
    const result = await response.json();

    if (response.ok && typeof result.count === 'number') {
      return result.count;
    }
    
    return 0;
  } catch (error) {
    console.error('Get viewer count error:', error);
    return 0;
  }
}

/**
 * Notify backend when viewer joins
 */
export async function notifyViewerJoin(liveId: string): Promise<void> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) return;

    await fetch(`${backendBase}/drift/viewer-join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId }),
    });
  } catch (error) {
    console.error('Notify viewer join error:', error);
  }
}

/**
 * Notify backend when viewer leaves
 */
export async function notifyViewerLeave(liveId: string): Promise<void> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) return;

    await fetch(`${backendBase}/drift/viewer-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId }),
    });
  } catch (error) {
    console.error('Notify viewer leave error:', error);
  }
}

/**
 * Get blocked users list
 */
export async function getBlockedUsers(uid: string): Promise<string[]> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      return [];
    }

    const response = await fetch(`${backendBase}/blocked-users?uid=${encodeURIComponent(uid)}`);
    const result = await response.json();

    if (response.ok && Array.isArray(result.blocked)) {
      return result.blocked;
    }
    
    return [];
  } catch (error) {
    console.error('Get blocked users error:', error);
    return [];
  }
}
