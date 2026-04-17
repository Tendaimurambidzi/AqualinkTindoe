# XapXap Fix & Enhancement TODO
Current: Phase 2 of 3 approved. Tracking progress here.

## Phase 1: Rebrand (CMEE → XapXap) + Icons/Logo
- [x] App name/displayName in app.json/android/ios
- [x] Launcher icons copied to all mipmap densities
- [x] In-app logo → assets/xapxap_logo.png
- [x] All CMEE strings → XapXap (search confirmed 0 matches)

## Phase 2: Fleet Decks Buttons + Admin/Owner Tools (IN PROGRESS)
1. [x] MainFeedItem.tsx: Fleet Deck button - Add haptic feedback (onPressIn/Out), loading spinner (3 flickers/processing color), disable other buttons during press.
2. [ ] App.tsx: Rename "Fleet Deck" → "FLEET DECKS" red font (#B91C1C) in strings/alerts/routes.
3. [ ] Copy VibeHuntUserSearch.tsx → src/components/AdminUserSearch.tsx: Search by displayName/email (no default list).
4. [ ] New src/components/AdminUserToolsModal.tsx: On user select → options (short Remove/Ban/Suspend/Unsuspend/Promote/Demote/Delete). Owner extras.
5. [ ] App.tsx: Integrate AdminUserSearch into owner/admin sections (command centre).
6. [ ] Firestore: users/{uid} updates (status: 'banned/suspended/removed', byUid/timestamp).
7. [ ] Test: `npx react-native run-android`

## Phase 3: Video/PDF/Fleet Routing + Checks (PENDING APPROVAL)
1. WaveCard.tsx: Fix stuck playback (buffer/seek/retry), old video loading, spinner → image during swipe.
2. Upload: PDF/doc preview (react-native-pdf-viewer?).
3. App.tsx: Route Fleet posts (audience:'fleet') to fleet feed.
4. App-wide: Button responsiveness, eslint/flow check (`npm run lint`).

**Next: Phase 2 Step 1 → Confirm → Step 2...**

