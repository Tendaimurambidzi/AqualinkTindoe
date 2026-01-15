# Video Watermarking Setup

## Required Dependencies


To enable SPL watermark on downloaded videos, install these packages:

```bash
npm install react-native-fs
npm install @react-native-camera-roll/camera-roll
```

### For iOS:
```bash
cd ios && pod install && cd ..
```

### For Android:


## Adding Your SPL Logo

1. **Prepare your logo:**
   - Create a PNG image of your SPL logo
   - Recommended size: 200x200px or similar (will be scaled to 15% of video height)
   - Transparent background recommended
   - Name it: `spl_logo.png`

2. **Add to Android:**
   - Place `spl_logo.png` in `android/app/src/main/assets/`
   - Create the `assets` folder if it doesn't exist

3. **Add to iOS:**
   - Place `spl_logo.png` in `ios/Drift/` folder
   - Add it to your Xcode project (right-click → Add Files to "Drift")
   - Make sure "Copy items if needed" is checked

## Watermark Position

The watermark appears:
- **Position:** Right vertical side of the video
- **Size:** 15% of video height
- **Margin:** 10px from right edge
- **Vertical alignment:** Centered

## Fallback Behavior



## Testing

1. Try downloading a wave with "Save to device"
2. Video should process with watermark
3. Check Downloads folder or Camera Roll
4. Verify SPL logo appears on right side of video

## Troubleshooting


**No watermark appearing:**
- Check that `spl_logo.png` is in the correct folder
- Check app permissions for storage access

**Download fails:**
- Ensure storage permissions are granted
- Check internet connection for video download
- Verify video URL is accessible

**Performance:**
- Watermarking adds 5-30 seconds depending on video length
- Processing happens on device
- Users see "Adding SPL watermark..." alert during processing
