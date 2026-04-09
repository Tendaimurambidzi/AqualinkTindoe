import { BACKEND_BASE_URL } from '../../liveConfig';

export interface CharteredDriftConfig {
  title: string;
  ticketNumber: string;
  priceUSD: number;
  durationMins: 30 | 60 | 120;
  access: 'paid-only';
  hostUid?: string;
  hostName?: string;
}

export interface CharteredDrift {
  id: string;
  title: string;
  ticketNumber: string;
  priceUSD: number;
  durationMins: number;
  access: string;
  hostUid: string;
  hostName: string;
  channel: string;
  startedAt: number;
  endsAt: number;
  status: 'live' | 'ended';
  chatEnabled: boolean;
}

export interface DriftEarnings {
  total: number;
  ticketsSold: number;
}

/**
 * Start a chartered (paid) drift session
 */
export async function startCharteredDrift(config: CharteredDriftConfig): Promise<{
  driftId: string;
  drift: CharteredDrift;
  channel: string;
  token: string | null;
}> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to start chartered drift');
    }

    return {
      driftId: data.driftId,
      drift: data.drift,
      channel: data.channel,
      token: data.token,
    };
  } catch (error: any) {
    console.error('Start chartered drift error:', error);
    // Don't show alert - let caller handle the error
    throw error;
  }
}

/**
 * End a chartered drift session
 */
export async function endCharteredDrift(driftId: string): Promise<{
  drift: CharteredDrift;
  earnings: DriftEarnings;
}> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driftId }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to end chartered drift');
    }

    return {
      drift: data.drift,
      earnings: data.earnings,
    };
  } catch (error: any) {
    console.error('End chartered drift error:', error);
    throw error;
  }
}

/**
 * Get list of pass holders (ticket holders) for a drift
 */
export async function getCharteredDriftPasses(driftId: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/chartered-drift/passes?driftId=${encodeURIComponent(driftId)}`
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to get passes');
    }

    return data.passes || [];
  } catch (error: any) {
    console.error('Get passes error:', error);
    return [];
  }
}

/**
 * Toggle chat in a chartered drift
 */
export async function toggleCharteredDriftChat(driftId: string, enabled: boolean): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/toggle-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driftId, enabled }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to toggle chat');
    }

    return data.chatEnabled;
  } catch (error: any) {
    console.error('Toggle chat error:', error);
    throw error;
  }
}

/**
 * Get earnings for a specific drift or all drifts by a host
 */
export async function getCharteredDriftEarnings(
  params: { driftId: string } | { hostUid: string }
): Promise<any> {
  try {
    const queryParam =
      'driftId' in params
        ? `driftId=${encodeURIComponent(params.driftId)}`
        : `hostUid=${encodeURIComponent(params.hostUid)}`;

    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/earnings?${queryParam}`);

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to get earnings');
    }

    return data;
  } catch (error: any) {
    console.error('Get earnings error:', error);
    throw error;
  }
}

/**
 * Share a promo link for a chartered drift
 */
export async function shareCharteredDriftPromo(
  driftId: string,
  title: string,
  priceUSD: number
): Promise<{
  shareUrl: string;
  webUrl: string;
  message: string;
}> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/share-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driftId, title, priceUSD }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to get promo link');
    }

    return {
      shareUrl: data.shareUrl,
      webUrl: data.webUrl,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Share promo error:', error);
    throw error;
  }
}

/**
 * Purchase a pass (ticket) to join a chartered drift
 */
export async function purchaseCharteredDriftPass(
  driftId: string,
  uid: string,
  paymentMethod?: string
): Promise<{
  drift: CharteredDrift;
  token: string | null;
  channel: string;
}> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chartered-drift/purchase-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driftId, uid, paymentMethod }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to purchase pass');
    }

    return {
      drift: data.drift,
      token: data.token,
      channel: data.channel,
    };
  } catch (error: any) {
    console.error('Purchase pass error:', error);
    throw error;
  }
}

/**
 * Request to join an open sea drift
 */
export async function requestToJoinDrift(
  liveId: string,
  fromUid: string,
  fromName: string
): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/drift/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, fromUid, fromName }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to request drift access');
    }
  } catch (error: any) {
    console.error('Request drift error:', error);
    throw error;
  }
}

/**
 * Accept a drift request
 */
export async function acceptDriftRequest(
  liveId: string,
  requesterUid: number,
  channel: string
): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/drift/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, requesterUid, channel }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to accept request');
    }

    return data.token || null;
  } catch (error: any) {
    console.error('Accept drift request error:', error);
    throw error;
  }
}

/**
 * Share a drift link
 */
export async function shareDriftLink(
  liveId: string,
  channel: string,
  title?: string
): Promise<{
  shareLink: string;
  webLink: string;
  message: string;
}> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/drift/share-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveId, channel, title }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to get share link');
    }

    return {
      shareLink: data.shareLink,
      webLink: data.webLink,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Share drift link error:', error);
    throw error;
  }
}
