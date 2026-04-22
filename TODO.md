# AqualinkTindoe Bug Fixes - Video/Images/Profile/Hugs/Posts
Status: ✅ Plan Approved | 📝 In Progress

## Step 1: Video Continuous Playback (High Priority) ✅
- [x] App.tsx: Expand preloadedVideoIds to ±3 items on scroll
- [ ] App.tsx: Add viewableItems offset crossfade for activeVideoId
- [x] videoCache.ts: Prefetch adjacent videos via onViewableItemsChanged
- [ ] MainFeedItem.tsx: Seamless pause/resume + retry fallback
- [ ] Test: Scroll feeds, verify no gaps/buffering

## Step 2: Instant Image Display (High Priority)
- [ ] Create src/services/imageCache.ts (RNFS thumbs + prefetch)
- [ ] MainFeedItem.tsx: Replace InstantImage with CachedImage (2x viewable)
- [ ] EditableProfileAvatar.tsx: Gen thumbs on upload
- [ ] Test: Measure first-paint load times

## Step 3: Profile Update Button (Medium)
- [ ] App.tsx: Add "Save Profile" button calling saveProfile()
- [ ] EditableProfileAvatar.tsx: Add username input + joint save
- [ ] App.tsx: Loading/error states + optimistic UI
- [ ] Test: Full photo/username update flow

## Step 4: Fleet Hugs/Posts Polish (Medium)
- [ ] OctopusHug.tsx: Add backend sync callback
- [ ] MainFeedItem.tsx: Batch Firestore hugs + realtime fleetBadgeCount
- [ ] App.tsx: Infinite scroll + "end of feed"
- [ ] Test: Cross-device hug sync + fleet badges

## Step 5: General Polish &amp; Tests
- [ ] Global error boundaries + retry prompts
- [ ] Perf: Bundle analyzer if needed
- [ ] Cross-device tests (videos/images/hugs)

Next: Start Step 1 edits. Commands: `npx react-native run-android` etc.

