# Drift Invite Popup Feature

## Overview
The drift invite notification system has been updated to display invites as persistent popups in the feed screen, rather than sending them to the vibe alerts (notifications) section.

## Changes Made

### 1. Modified App.tsx
- **Import Added**: Added `DriftInviteOverlay` component import
- **Component Integration**: Integrated `DriftInviteOverlay` into the main feed view after the ocean effects section
- **Handler Function**: Added `onJoinLive` handler that:
  - Sets the live invite join preset with liveId and channel
  - Opens the live stream view by setting `showLive` to true

### 2. Existing Components Used
- **DriftInviteNotificationPanel**: Beautiful animated popup component with:
  - Slide-in animation from bottom
  - Pulsing effect to draw attention
  - Semi-transparent backdrop
  - User avatar with "LIVE" indicator
  - Accept and Pass buttons
  - Invite type indicator (single/group)

- **DriftInviteOverlay**: Wrapper component that:
  - Uses `useDriftInviteNotifications` hook
  - Manages invite queue
  - Handles accept/decline actions
  - Only renders when there's an active invite

- **useDriftInviteNotifications Hook**: Manages:
  - Real-time subscription to drift invites
  - Invite queue management
  - Accept/decline logic
  - Automatic progression through invite queue

- **driftInviteService**: Provides:
  - `sendDriftInvite()` - Send invite to single user
  - `sendDriftInvitesToSelected()` - Send to multiple users
  - `acceptDriftInvite()` - Accept an invite
  - `declineDriftInvite()` - Decline an invite
  - `subscribeToDriftInvites()` - Real-time listener

## How It Works

### For Invite Senders
1. When going live, users can send invites to specific users
2. Invites are stored in Firestore under `users/{uid}/drift_invites`
3. A ping notification is also created for backup

### For Invite Recipients
1. The `DriftInviteOverlay` component listens for incoming invites
2. When an invite arrives, it appears as a popup overlay on the feed
3. The popup persists until the user takes action (Accept or Pass)
4. Multiple invites are queued and shown one at a time
5. Accepting an invite:
   - Marks the invite as accepted in Firestore
   - Opens the live stream camera/viewer
   - Shows the next invite in queue (if any)
6. Passing an invite:
   - Marks the invite as declined in Firestore
   - Shows the next invite in queue (if any)

## User Experience Benefits

1. **Immediate Visibility**: Invites appear directly in the feed where users are already engaged
2. **No Navigation Required**: Users don't need to navigate to notifications to see invites
3. **Persistent**: The popup stays visible until action is taken
4. **Non-Intrusive**: Semi-transparent backdrop allows seeing the feed content
5. **Queue Management**: Multiple invites are handled gracefully
6. **Visual Appeal**: Animated popup with pulsing effect draws attention

## Technical Details

### Firestore Structure
```
users/{userId}/drift_invites/{inviteId}
  - liveId: string
  - fromUid: string
  - fromName: string
  - fromPhoto: string | null
  - toUid: string
  - liveTitle: string | null
  - liveChannel: string | null
  - inviteType: 'single' | 'selected'
  - status: 'pending' | 'accepted' | 'declined'
  - createdAt: timestamp
```

### Component Hierarchy
```
App.tsx
  └─ DriftInviteOverlay
      ├─ useDriftInviteNotifications (hook)
      │   └─ subscribeToDriftInvites (service)
      └─ DriftInviteNotificationPanel (UI)
```

## Build and Installation

The release APK has been built and installed with these changes:
- **Build Command**: `cd android && gradlew assembleRelease`
- **APK Location**: `android/app/build/outputs/apk/release/app-universal-release.apk`
- **Installation**: `adb install -r app-universal-release.apk`

## Testing

To test the feature:
1. Have two users logged in on different devices
2. User A starts a drift expo (live stream)
3. User A sends an invite to User B
4. User B should see the invite popup appear in their feed
5. User B can Accept (joins the live stream) or Pass (dismisses the invite)
6. If multiple invites are sent, they appear one at a time

## Future Enhancements

Potential improvements:
- Sound notification when invite arrives
- Vibration feedback
- Customizable invite expiry time
- Invite preview (thumbnail of live stream)
- Group invite participant count
- Invite history/log
