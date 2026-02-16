# Online Users Feature Implementation

## Overview
Added a real-time online users list that displays 5 users at a time, rotating every 10 seconds. Users can tap on names to view profile previews and initiate chats.

## Components Created

### 1. OnlineUsersList.tsx (`src/components/OnlineUsersList.tsx`)
- Displays a green dot indicator at the top
- Shows 5 online user names vertically below the dot
- Rotates displayed users every 10 seconds with fade animation
- Positioned in the left white space of the feed
- Fetches online users from Firebase Realtime Database `/presence` node
- Filters out current user from the list
- Auto-updates when users go online/offline

**Key Features:**
- Real-time presence tracking
- Smooth fade transitions between user rotations
- Tappable user names
- Responsive to online status changes

### 2. ProfilePreviewModal.tsx (`src/components/ProfilePreviewModal.tsx`)
- Modal that appears when user taps an online user's name
- Shows user profile information:
  - Profile avatar with crew count
  - Username
  - Bio (if available)
- Action buttons:
  - "Chat" - Opens chat with the user
  - "Close" - Dismisses the modal
- Center-positioned overlay with semi-transparent background
- Loading state while fetching user data

## Integration Points

### MainFeedItem.tsx
- Imported OnlineUsersList and ProfilePreviewModal components
- Added state management for profile preview modal
- Added handlers:
  - `handleOnlineUserPress` - Opens profile preview when user name is tapped
  - `handleChatWithUser` - Initiates chat with selected user
- Positioned OnlineUsersList absolutely in the left white space

### App.tsx
- Added heartbeat mechanism to keep user online status updated every 30 seconds
- Updates `/presence/{uid}` with:
  - `online: true`
  - `lastSeen: null`
  - `lastHeartbeat: timestamp`
- Heartbeat only runs when user is active and online

## Firebase Structure

### Presence Node (`/presence/{uid}`)
```json
{
  "online": true,
  "lastSeen": null,
  "lastHeartbeat": 1234567890
}
```

When user goes offline:
```json
{
  "online": false,
  "lastSeen": 1234567890
}
```

### User Node (`/users/{uid}`)
```json
{
  "name": "User Name",
  "displayName": "Display Name",
  "avatar": "url",
  "bio": "User bio text"
}
```

## Visual Layout

```
┌─────────────────────────────────────┐
│ White Space │  Video Content Area   │
│             │                        │
│             │ ┌──────────────────┐  │
│             │ │                  │  │
│   🟢        │ │                  │  │ ← Green dot
│   John      │ │     VIDEO        │  │
│   Sarah     │ │                  │  │
│   Mike      │ │                  │  │
│   Lisa      │ │                  │  │
│   Tom       │ │                  │  │
│             │ │                  │  │
│             │ └──────────────────┘  │
│             │                        │
└─────────────────────────────────────┘
```

## User Flow

1. User opens feed
2. OnlineUsersList component loads and fetches online users
3. Green dot appears in left white space
4. 5 user names appear below the dot
5. Every 10 seconds, names fade out and new names fade in
6. User taps a name
7. ProfilePreviewModal opens showing user profile
8. User can tap "Chat" to open conversation or "Close" to dismiss

## Technical Details

### Rotation Logic
- Fetches all online users from Firebase
- Displays 5 at a time
- Every 10 seconds:
  - Fade out current names (300ms)
  - Update to next 5 users (circular rotation)
  - Fade in new names (300ms)
- If fewer than 5 users online, shows all available

### Performance Considerations
- Single Firebase listener for all online users
- Local rotation (no repeated queries)
- Efficient fade animations using native driver
- Automatic cleanup on unmount

### Online Status Detection
- User is "online" if:
  - `presence.online === true`
  - Last heartbeat within 2-3 minutes (configurable)
- Heartbeat updates every 30 seconds
- Automatic offline on disconnect (Firebase onDisconnect)

## Future Enhancements

1. **Contact Prioritization**: Show contacts first, then other users
2. **Activity Indicators**: Show what users are doing (viewing post, typing, etc.)
3. **Mutual Friends**: Display mutual connections
4. **Quick Actions**: Add quick actions like "Wave" or "Follow"
5. **Customization**: Allow users to hide/show online list
6. **Filters**: Filter by interests, location, or activity
7. **Direct Chat**: Implement full chat functionality from profile preview

## Testing Checklist

- [ ] Online users list appears in feed
- [ ] Green dot is visible
- [ ] User names rotate every 10 seconds
- [ ] Tapping name opens profile preview
- [ ] Profile preview shows correct user data
- [ ] Chat button shows alert (placeholder)
- [ ] Close button dismisses modal
- [ ] Online status updates in real-time
- [ ] Heartbeat keeps user online
- [ ] User goes offline when app closes
- [ ] No performance issues with many online users

## Known Limitations

1. Chat functionality shows alert placeholder - needs full implementation
2. No contact filtering yet - shows all online users
3. No activity indicators - only shows online/offline
4. Fixed position - may need adjustment for different screen sizes
5. No user preferences - always visible

## Files Modified

1. `src/components/OnlineUsersList.tsx` - NEW
2. `src/components/ProfilePreviewModal.tsx` - NEW
3. `src/feed/MainFeedItem.tsx` - MODIFIED
4. `App.tsx` - MODIFIED (added heartbeat)

## Dependencies

- `@react-native-firebase/database` - Real-time presence tracking
- `react-native` - Animated API for transitions
- Existing components: ProfileAvatarWithCrew

## Configuration

No additional configuration required. Feature is enabled by default for all users.
