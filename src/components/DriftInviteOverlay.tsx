import React from 'react';
import { DriftInviteNotificationPanel } from './DriftInviteNotificationPanel';
import { useDriftInviteNotifications } from '../hooks/useDriftInviteNotifications';

interface DriftInviteOverlayProps {
  onJoinLive: (liveId: string, channel?: string) => void;
}

export const DriftInviteOverlay: React.FC<DriftInviteOverlayProps> = ({ onJoinLive }) => {
  const { currentInvite, isVisible, handleAccept, handlePass } = useDriftInviteNotifications();

  if (!currentInvite || !isVisible) {
    return null;
  }

  return (
    <DriftInviteNotificationPanel
      visible={isVisible}
      fromName={currentInvite.fromName}
      fromPhoto={currentInvite.fromPhoto}
      fromUid={currentInvite.fromUid}
      liveTitle={currentInvite.liveTitle}
      inviteType={currentInvite.inviteType}
      onAccept={() => handleAccept(onJoinLive)}
      onPass={handlePass}
    />
  );
};
