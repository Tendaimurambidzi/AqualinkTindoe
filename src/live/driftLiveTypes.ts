export type DriftLiveStatus = 'live' | 'ended';

export interface DriftLiveDoc {
  hostId: string;
  hostName: string;
  channelName: string;
  hostUid: number;
  status: DriftLiveStatus;
  startedAt: any;
  endedAt: any | null;
  thumbnail: string | null;
  viewerCount: number;
  allowComments: boolean;
}

export interface DriftLiveComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
  avatar: string | null;
  replyToId?: string | null;
  replyToUserName?: string | null;
  replyToText?: string | null;
}
