# Call Notification Integration Instructions

## Overview
This fix adds proper incoming call notifications with ringtone support for Android. The callee will now receive:
1. A full-screen notification when a call comes in (even when app is in background/killed)
2. A default ringtone that plays automatically
3. Answer/Decline buttons on the notification
4. Proper call modal display when the app is opened

## Files Created
1. `android/app/src/main/java/com/aqualink/tindo/CallNotificationService.kt` - Foreground service for call notifications
2. `android/app/src/main/java/com/aqualink/tindo/CallActionReceiver.kt` - Handles answer/decline button clicks
3. `android/app/src/main/java/com/aqualink/tindo/CallEventService.kt` - Headless JS service for background events
4. `android/app/src/main/java/com/aqualink/tindo/CallNotificationModule.kt` - Native module bridge
5. `android/app/src/main/java/com/aqualink/tindo/CallNotificationPackage.kt` - Package registration
6. `src/services/callNotificationService.ts` - React Native wrapper
7. `src/services/incomingCallHandler.ts` - Call notification handler

## Files Modified
1. `android/app/src/main/java/com/aqualink/tindo/MainApplication.kt` - Added CallNotificationPackage
2. `android/app/src/main/AndroidManifest.xml` - Added service and receiver declarations

## Integration Steps

### Step 1: Add to App.tsx

Add this import at the top of App.tsx (around line 70-80):
```typescript
import { initializeCallNotifications, showIncomingCallNotification, hideCallNotification } from './src/services/incomingCallHandler';
```

### Step 2: Initialize in useEffect

Add this useEffect hook in the InnerApp component (around line 800-900, after other useEffect hooks):
```typescript
// Initialize call notification handlers
useEffect(() => {
  const cleanup = initializeCallNotifications();
  return cleanup;
}, []);
```

### Step 3: Show notification when incoming call is detected

Find the code where `incomingDirectCall` state is set (search for "setIncomingDirectCall").
Add this code right after setting the state:

```typescript
// Around line 1500-1600 where incoming calls are handled
useEffect(() => {
  if (incomingDirectCall && incomingDirectCall.status === 'ringing') {
    const callerName = incomingDirectCall.callerName || 'Unknown';
    const callType = incomingDirectCall.callType || 'audio';
    
    // Show notification with ringtone
    showIncomingCallNotification(callerName, incomingDirectCall.id, callType);
  } else {
    // Hide notification when call is no longer ringing
    hideCallNotification();
  }
}, [incomingDirectCall]);
```

### Step 4: Hide notification when call is answered/declined

Find the functions that handle call acceptance and decline (search for "acceptDirectCall" or "declineDirectCall").
Add `hideCallNotification()` at the start of these functions:

```typescript
const acceptDirectCall = async () => {
  hideCallNotification(); // Add this line
  // ... rest of the function
};

const declineDirectCall = async () => {
  hideCallNotification(); // Add this line
  // ... rest of the function
};
```

### Step 5: Update Firebase Cloud Messaging handler

Find the Firebase messaging setup in index.js (already exists) and ensure it sends proper data:

The backend should send FCM messages with this structure:
```json
{
  "data": {
    "type": "call_invite",
    "callId": "unique-call-id",
    "callerName": "John Doe",
    "callType": "audio",
    "fromName": "John Doe"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "aqualink_calls_lg_cat_ring",
      "sound": "lg_cat_ring_freetone_org",
      "priority": "max",
      "visibility": "public"
    }
  }
}
```

## Testing

1. Build the release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. Install on a test device:
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

3. Test scenarios:
   - App in foreground: Should show modal + notification with ringtone
   - App in background: Should show notification with ringtone, tapping opens app with modal
   - App killed: Should show notification with ringtone, tapping opens app with modal
   - Answer from notification: Should open app and connect call
   - Decline from notification: Should dismiss notification and update call status

## Troubleshooting

If ringtone doesn't play:
1. Check that notification permissions are granted
2. Check that Do Not Disturb is off
3. Check that the notification channel has sound enabled in Android settings
4. Verify the sound file exists in `android/app/src/main/res/raw/`

If notification doesn't show:
1. Check that POST_NOTIFICATIONS permission is granted (Android 13+)
2. Check that the app has notification permissions
3. Check logcat for errors: `adb logcat | grep CallNotification`

## Default Ringtone

The system uses the device's default ringtone (RingtoneManager.TYPE_RINGTONE).
To use a custom ringtone, add the audio file to `android/app/src/main/res/raw/` and update the sound URI in CallNotificationService.kt.

Current ringtone options already configured in MainApplication.kt:
- lg_cat_ring_freetone_org (default for calls)
- call_progress
- notification
- falcon
- downfall_3_208028
- large_underwater_explosion_190270
- sci_fi_sound_effect_designed_circuits_hum_10_200831
