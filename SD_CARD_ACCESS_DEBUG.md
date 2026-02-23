# SD Card Access - Enhanced Permissions & Debugging

## What Was Done

### 1. Runtime Permission Requests
Added comprehensive runtime permission handling in `handleUnifiedGallerySelect` function (App.tsx line 8663):

- **Android 13+ (API 33+)**: Requests granular media permissions
  - `READ_MEDIA_IMAGES`
  - `READ_MEDIA_VIDEO`
  
- **Android 12 and below**: Requests
  - `READ_EXTERNAL_STORAGE`

### 2. Permission Denied Handling
If permissions are denied, the app now:
- Shows a clear alert explaining why the permission is needed
- Provides an "Open Settings" button to take users directly to app settings
- Mentions SD card access explicitly in the permission message

### 3. Comprehensive Logging
Added detailed console logs at every step:
- `[SD Card Access] Gallery button pressed` - When user taps Gallery
- `[SD Card Access] Android version: X` - Shows Android API level
- `[SD Card Access] Android 13+ permissions: {...}` - Permission results for Android 13+
- `[SD Card Access] READ_EXTERNAL_STORAGE result: ...` - Permission result for Android 12-
- `[SD Card Access] Opening image library with fullScreen presentation` - Before opening picker
- `[SD Card Access] Response: {...}` - Full response from image picker
- `[SD Card Access] Media selected: uri` - When media is successfully selected
- `[SD Card Access] User cancelled` - When user cancels
- `[SD Card Access] Error: code, message` - Any errors that occur

### 4. Error Alerts
Added user-friendly error alerts:
- Permission errors show specific messages
- Gallery errors display the error message to the user

## How to Check Logs

### Using ADB Logcat
Connect your device and run:
```bash
adb -s 100383734L003937 logcat | findstr "SD Card Access"
```

This will show only the SD card access related logs.

### Full React Native Logs
To see all React Native logs:
```bash
adb -s 100383734L003937 logcat | findstr "ReactNativeJS"
```

## Testing Steps

1. **Open the app** and navigate to "Drop a Wave" → "Say Something"
2. **Tap the 🖼️ Gallery button**
3. **Watch for permission dialog**:
   - If it appears, grant the permission
   - If it doesn't appear, permissions may already be granted
4. **Check if SD card media appears** in the picker
5. **If SD card media doesn't appear**, check the logs using the commands above

## Expected Log Output (Success)

```
[SD Card Access] Gallery button pressed
[SD Card Access] Android version: 33
[SD Card Access] Android 13+ permissions: {android.permission.READ_MEDIA_IMAGES: granted, android.permission.READ_MEDIA_VIDEO: granted}
[SD Card Access] Opening image library with fullScreen presentation
[SD Card Access] Response: {assets: [...]}
[SD Card Access] Media selected: file:///storage/emulated/0/DCIM/...
```

## Expected Log Output (Permission Denied)

```
[SD Card Access] Gallery button pressed
[SD Card Access] Android version: 33
[SD Card Access] Android 13+ permissions: {android.permission.READ_MEDIA_IMAGES: denied, android.permission.READ_MEDIA_VIDEO: denied}
```

## Manifest Permissions

The following permissions are already in AndroidManifest.xml:
- `READ_EXTERNAL_STORAGE` (Android ≤ 12)
- `READ_MEDIA_IMAGES` (Android 13+)
- `READ_MEDIA_VIDEO` (Android 13+)
- `READ_MEDIA_AUDIO` (Android 13+)
- `MANAGE_EXTERNAL_STORAGE` (Android 11+, for full file access)
- `requestLegacyExternalStorage="true"` (for Android 10 compatibility)

## Troubleshooting

### If SD card media still doesn't appear:

1. **Check app permissions in Settings**:
   - Go to Settings → Apps → Aqualink → Permissions
   - Ensure "Photos and videos" or "Storage" is allowed

2. **Check if media is indexed**:
   - Some devices need time to scan SD card media
   - Try opening the device's Gallery app first to trigger media scanning

3. **Check SD card mount status**:
   - Ensure SD card is properly mounted
   - Try accessing SD card files in the device's file manager

4. **Check logs for errors**:
   - Use the logcat commands above to see what's happening
   - Look for error codes or messages

5. **Try MANAGE_EXTERNAL_STORAGE**:
   - On Android 11+, some devices require this permission for SD card access
   - This permission must be granted manually in Settings → Apps → Aqualink → Permissions → Files and media → Allow management of all files

## Code Location

- **Function**: `handleUnifiedGallerySelect`
- **File**: `c:\Aqualink\App.tsx`
- **Line**: 8663-8743
- **Called from**: Unified Post Modal → 🖼️ Gallery button (line 11734)
