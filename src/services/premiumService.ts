import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type PremiumShowStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'ended'
  | 'cancelled';

export type PremiumTicketStatus =
  | 'generated'
  | 'claimed'
  | 'used'
  | 'expired'
  | 'revoked';

export type PremiumAccessStatus = 'active' | 'expired' | 'revoked';

export type PremiumTokenRecord = {
  ticketId: string;
  code: string;
  codeLast4: string;
  status: PremiumTicketStatus;
  claimedByUid: string | null;
  intendedName: string | null;
};

export type PremiumShowRecord = {
  id: string;
  hostUid: string;
  hostName: string | null;
  title: string;
  description: string | null;
  status: PremiumShowStatus;
  startsAtMs: number;
  endsAtMs: number;
  capacity: number;
  ticketStats?: {
    generated: number;
    claimed: number;
    active: number;
    used: number;
    expired: number;
    revoked: number;
  };
};

const PREMIUM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const nowMs = () => Date.now();

const isFirestorePermissionError = (error: any): boolean => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code.includes('permission-denied') ||
    message.includes('permission-denied') ||
    message.includes('permission denied')
  );
};

const toFriendlyPremiumError = (
  error: any,
  fallback: string,
  stage?: string,
): Error => {
  const code = String(error?.code || '').trim() || 'unknown';
  const message = String(error?.message || '').trim();
  if (isFirestorePermissionError(error)) {
    console.warn('Aqua Premium Firestore permission error', {
      stage: stage || null,
      code: error?.code || null,
      message: error?.message || null,
    });
    return new Error(
      `Aqua Premium Firestore denied ${stage || 'request'} (${code}). ${message || fallback}`,
    );
  }
  return new Error(message || fallback);
};

const toMillis = (value: any): number => {
  try {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value?.toMillis === 'function') return Number(value.toMillis()) || 0;
    if (typeof value?.toDate === 'function') return Number(value.toDate().getTime()) || 0;
    if (typeof value?.seconds === 'number') return value.seconds * 1000;
    return Number(new Date(value).getTime()) || 0;
  } catch {
    return 0;
  }
};

const hashToken = (input: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fnv_${(hash >>> 0).toString(16)}`;
};

const generateTokenCode = (): string => {
  let left = '';
  let right = '';
  for (let i = 0; i < 4; i += 1) {
    left += PREMIUM_CODE_ALPHABET[Math.floor(Math.random() * PREMIUM_CODE_ALPHABET.length)];
    right += PREMIUM_CODE_ALPHABET[Math.floor(Math.random() * PREMIUM_CODE_ALPHABET.length)];
  }
  return `${left}-${right}`;
};

export const getCurrentUserIdentity = () => {
  const me = auth().currentUser;
  return {
    uid: me?.uid || '',
    name:
      me?.displayName ||
      (me?.email ? String(me.email).split('@')[0] : '') ||
      'Viber',
  };
};

export async function createPremiumShowWithTokens(params: {
  title: string;
  description?: string | null;
  priceUSD: number;
  durationMins: number;
  capacity: number;
  tokenCount: number;
  category?: string | null;
}): Promise<{
  show: PremiumShowRecord;
  tokens: PremiumTokenRecord[];
}> {
  const me = auth().currentUser;
  if (!me?.uid) throw new Error('Sign in required');
  const startsAtMs = nowMs();
  const endsAtMs = startsAtMs + Math.max(15, Number(params.durationMins || 60)) * 60 * 1000;
  const showRef = firestore().collection('premium_shows').doc();
  const tokens: PremiumTokenRecord[] = [];
  await showRef.set({
    hostUid: me.uid,
    hostName:
      me.displayName ||
      (me.email ? String(me.email).split('@')[0] : '') ||
      'Viber',
    title: params.title.trim(),
    description: params.description?.trim() || null,
    priceUSD: Number(params.priceUSD || 0),
    category: params.category || null,
    status: 'scheduled',
    startsAt: new Date(startsAtMs),
    endsAt: new Date(endsAtMs),
    redeemOpenAt: new Date(startsAtMs),
    redeemCloseAt: new Date(endsAtMs),
    entryOpenAt: new Date(startsAtMs),
    entryCloseAt: new Date(endsAtMs),
    capacity: Math.max(1, Number(params.capacity || params.tokenCount || 1)),
    requiresTicket: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    createdByUid: me.uid,
    ticketStats: {
      generated: Math.max(0, Number(params.tokenCount || 0)),
      claimed: 0,
      active: 0,
      used: 0,
      expired: 0,
      revoked: 0,
    },
  });
  const batch = firestore().batch();
  for (let i = 0; i < params.tokenCount; i += 1) {
    const code = generateTokenCode();
    const ticketRef = showRef.collection('tickets').doc();
    tokens.push({
      ticketId: ticketRef.id,
      code,
      codeLast4: code.slice(-4),
      status: 'generated',
      claimedByUid: null,
      intendedName: null,
    });
    batch.set(ticketRef, {
      code,
      codeHash: hashToken(code),
      codeLast4: code.slice(-4),
      issuedByUid: me.uid,
      intendedUid: null,
      intendedName: null,
      claimedByUid: null,
      claimedAt: null,
      validFrom: new Date(startsAtMs),
      validUntil: new Date(endsAtMs),
      maxUses: 1,
      useCount: 0,
      status: 'generated',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      notes: null,
    });
  }
  await batch.commit();
  return {
    show: {
      id: showRef.id,
      hostUid: me.uid,
      hostName:
        me.displayName ||
        (me.email ? String(me.email).split('@')[0] : '') ||
        'Viber',
      title: params.title.trim(),
      description: params.description?.trim() || null,
      status: 'scheduled',
      startsAtMs,
      endsAtMs,
      capacity: Math.max(1, Number(params.capacity || params.tokenCount || 1)),
      ticketStats: {
        generated: tokens.length,
        claimed: 0,
        active: 0,
        used: 0,
        expired: 0,
        revoked: 0,
      },
    },
    tokens,
  };
}

export async function listPremiumTokens(showId: string): Promise<PremiumTokenRecord[]> {
  try {
    const snap = await firestore()
      .collection(`premium_shows/${showId}/tickets`)
      .orderBy('createdAt', 'asc')
      .get();
    return (snap?.docs || []).map(doc => {
      const data = doc.data() || {};
      return {
        ticketId: doc.id,
        code: String(data.code || ''),
        codeLast4: String(data.codeLast4 || ''),
        status: String(data.status || 'generated') as PremiumTicketStatus,
        claimedByUid: data.claimedByUid ? String(data.claimedByUid) : null,
        intendedName: data.intendedName ? String(data.intendedName) : null,
      };
    });
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not load Aqua Premium tokens.',
      'premium_shows.tickets.list',
    );
  }
}

export async function redeemPremiumCode(rawCode: string) {
  const me = auth().currentUser;
  if (!me?.uid) throw new Error('Sign in required');
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) throw new Error('Enter a token');
  const codeHash = hashToken(code);
  let snap: any;
  try {
    snap = await firestore()
      .collectionGroup('tickets')
      .where('codeHash', '==', codeHash)
      .limit(2)
      .get();
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not redeem Aqua Premium token.',
      'tickets.collectionGroup.lookup',
    );
  }

  const match = snap?.docs?.[0];
  if (!match) throw new Error('Token not found');
  const ticketData = match.data() || {};
  const showRef = match.ref.parent.parent;
  if (!showRef) throw new Error('Show not found');

  let showSnap: any;
  try {
    showSnap = await showRef.get();
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not load Premium show.',
      'premium_shows.doc.get',
    );
  }

  const showData = showSnap.data() || {};
  const validUntilMs = toMillis(ticketData.validUntil) || toMillis(showData.endsAt);
  const validFromMs = toMillis(ticketData.validFrom) || toMillis(showData.startsAt);
  const status = String(ticketData.status || 'generated') as PremiumTicketStatus;
  if (status === 'revoked' || status === 'expired') {
    throw new Error('This token is no longer valid');
  }
  if (ticketData.claimedByUid && String(ticketData.claimedByUid) !== me.uid) {
    throw new Error('This token has already been claimed');
  }
  if (validFromMs && nowMs() < validFromMs - 24 * 60 * 60 * 1000) {
    throw new Error('This token is not active yet');
  }
  if (validUntilMs && nowMs() > validUntilMs) {
    throw new Error('This token has expired');
  }

  const batch = firestore().batch();
  batch.set(
    match.ref,
    {
      claimedByUid: me.uid,
      claimedAt: firestore.FieldValue.serverTimestamp(),
      status: 'claimed',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  batch.set(
    firestore().doc(`users/${me.uid}/premium_access/${showRef.id}`),
    {
      showId: showRef.id,
      ticketId: match.id,
      grantedAt: firestore.FieldValue.serverTimestamp(),
      validFrom: ticketData.validFrom || showData.startsAt || new Date(),
      validUntil: ticketData.validUntil || showData.endsAt || new Date(),
      status: 'active',
      hostUid: String(showData.hostUid || ''),
      showTitle: String(showData.title || 'Aqua Premium'),
    },
    { merge: true },
  );
  batch.set(firestore().doc(`users/${me.uid}/premium_redemptions/${match.id}`), {
    showId: showRef.id,
    ticketId: match.id,
    redeemedAt: firestore.FieldValue.serverTimestamp(),
    codeLast4: String(ticketData.codeLast4 || code.slice(-4)),
    status: 'success',
  });

  try {
    await batch.commit();
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not save Premium access.',
      'premium.batch.commit',
    );
  }

  return {
    showId: showRef.id,
    showTitle: String(showData.title || 'Aqua Premium'),
  };
}

export async function listMyPremiumAccess() {
  const me = auth().currentUser;
  if (!me?.uid) return [];
  try {
    const snap = await firestore()
      .collection(`users/${me.uid}/premium_access`)
      .orderBy('grantedAt', 'desc')
      .limit(20)
      .get();
    return (snap?.docs || []).map(doc => {
      const data = doc.data() || {};
      return {
        showId: doc.id,
        showTitle: String(data.showTitle || 'Aqua Premium'),
        hostUid: String(data.hostUid || ''),
        status: String(data.status || 'active') as PremiumAccessStatus,
        validFromMs: toMillis(data.validFrom),
        validUntilMs: toMillis(data.validUntil),
        ticketId: String(data.ticketId || ''),
      };
    });
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not load Aqua Premium access.',
      'users.premium_access.list',
    );
  }
}

export async function startPremiumShow(showId: string) {
  await firestore().collection('premium_shows').doc(showId).set(
    {
      status: 'live',
      startsAt: firestore.FieldValue.serverTimestamp(),
      entryOpenAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function endPremiumShow(showId: string) {
  await firestore().collection('premium_shows').doc(showId).set(
    {
      status: 'ended',
      endsAt: firestore.FieldValue.serverTimestamp(),
      entryCloseAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function canCurrentUserJoinPremiumShow(showId: string, hostUid?: string | null) {
  const me = auth().currentUser;
  if (!me?.uid) {
    return { allowed: false, reason: 'Sign in required' };
  }
  if (hostUid && me.uid === hostUid) {
    return { allowed: true, reason: null, ticketId: null };
  }
  try {
    const accessSnap = await firestore().doc(`users/${me.uid}/premium_access/${showId}`).get();
    if (!accessSnap.exists) {
      return { allowed: false, reason: 'Enter a valid Aqua Premium token first.' };
    }
    const accessData = accessSnap.data() || {};
    const status = String(accessData.status || 'active');
    const validUntilMs = toMillis(accessData.validUntil);
    if (status !== 'active') {
      return { allowed: false, reason: 'Your Aqua Premium access is not active.' };
    }
    if (validUntilMs && nowMs() > validUntilMs) {
      return { allowed: false, reason: 'Your Aqua Premium access has expired.' };
    }
    return {
      allowed: true,
      reason: null,
      ticketId: String(accessData.ticketId || ''),
    };
  } catch (error: any) {
    if (isFirestorePermissionError(error)) {
      return {
        allowed: false,
        reason:
          `Aqua Premium Firestore denied users.premium_access.get (${String(error?.code || 'unknown')}). ${String(error?.message || '').trim()}`,
      };
    }
    throw error;
  }
}

export async function recordPremiumEntry(showId: string) {
  const me = auth().currentUser;
  if (!me?.uid) return;
  try {
    const accessSnap = await firestore().doc(`users/${me.uid}/premium_access/${showId}`).get();
    const accessData = accessSnap.data() || {};
    await firestore()
      .collection(`premium_shows/${showId}/entries`)
      .add({
        uid: me.uid,
        ticketId: String(accessData.ticketId || ''),
        enteredAt: firestore.FieldValue.serverTimestamp(),
        exitedAt: null,
        deviceId: null,
        status: 'entered',
      });
  } catch (error: any) {
    throw toFriendlyPremiumError(
      error,
      'Could not record Aqua Premium entry.',
      'premium_shows.entries.add',
    );
  }
}
