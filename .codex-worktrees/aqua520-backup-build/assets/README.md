App icon and splash assets
--------------------------

Place these files in this folder and then follow the platform steps below.

Required files (suggested names):
- icon.png — square 1024×1024 image (your blue falcon + red moon). Used to generate app icons.
- moon.png — transparent PNG of the red moon for the animated splash.
- falcon.png — transparent PNG of the blue falcon for the animated splash.
- falcon.mp3 — short landing sound for the animated splash.

Hook animated splash assets in code
- Option A (keep current fallback shapes): leave code as-is. The splash runs with a red circle and text placeholder.
- Option B (use your real images + sound):
  - In `Drift/App.tsx`, pass the sources to `SplashMoonFalcon` like this:

    // import types only; then inside App component render:
    // <SplashMoonFalcon
    //   moonSource={require('./assets/moon.png')}
    //   falconSource={require('./assets/falcon.png')}
    //   soundSource={require('./assets/falcon.mp3')}
    //   onDone={() => setShowSplash(false)}
    // />

  - Note: Ensure the files exist before uncommenting requires or Metro will error.

Android app icon (replace APK default icon)
1) Prepare a 1024×1024 `icon.png`.
2) Generate mipmap icons (48,72,96,144,192,512) and place into:
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48×48)
   - `.../mipmap-hdpi/ic_launcher.png` (72×72)
   - `.../mipmap-xhdpi/ic_launcher.png` (96×96)
   - `.../mipmap-xxhdpi/ic_launcher.png` (144×144)
   - `.../mipmap-xxxhdpi/ic_launcher.png` (192×192)
   - Optional Play Store listing: 512×512 used on the store, not in project.
3) Also replace `ic_launcher_round.png` in each mipmap folder if you want the round variant.
4) Build Android; `AndroidManifest.xml` already points to `@mipmap/ic_launcher`.

Android adaptive icon (optional, Android 8+)
- Provide `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` that references a foreground and background.
- Provide `drawable/ic_launcher_foreground.xml` or PNG and a solid `color/ic_launcher_background`.

iOS app icon
1) In Xcode, open the iOS project.
2) Under `Images.xcassets` → `AppIcon`, drop generated icon set (e.g., via an online generator from `icon.png`).
3) Ensure the app target uses that `AppIcon` asset catalog.

Notes
- The animated splash you see on startup is in `Drift/SplashMoonFalcon.tsx`.
- No native splash plugin is required; it runs immediately after JS loads.
- If you want a native (pre-JS) splash too, we can add platform launch screens and transition into this animation.

