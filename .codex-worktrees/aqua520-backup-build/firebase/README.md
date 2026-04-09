Backend scaffolding for Waves, Splashes, and Echoes

What’s included
- Firestore structure and client expectations
- Security Rules enforcing one-splash-per-user and echo ownership
- Cloud Functions that keep wave counters accurate (splashes/echoes)

How to use
1) In the Firebase Console, create a Firestore database (native mode) for your project.
2) Copy the rules from `Drift/firebase/firestore.rules` into your project’s Firestore Rules.
3) Deploy the Cloud Functions in `Drift/firebase/functions` (requires Node 18+).
   - From `Drift/firebase/functions` run: `npm i` then `npm run deploy` (or `firebase deploy --only functions`).
4) In your app, write `splashes` and `echoes` as described below. Counters will update automatically.

Firestore structure (recommended)
- Collection: `waves/{waveId}`
  - Fields: `ownerUid: string`, `createdAt: timestamp`, `counts: { splashes: number, echoes: number }`

- Subcollection: `waves/{waveId}/splashes/{uid}`
  - Fields: `userUid: string`, `userName?: string`, `userPhoto?: string`, `createdAt: timestamp`
  - Doc ID = the user’s UID. Guarantees one splash per user and makes unsplash a delete.

- Subcollection: `waves/{waveId}/echoes/{echoId}`
  - Fields: `userUid: string`, `userName?: string`, `userPhoto?: string`, `text: string`, `createdAt: timestamp`

Client write patterns
- Splash a wave: `set(waveRef.collection('splashes').doc(currentUid), { userUid: currentUid, createdAt: serverTimestamp() }, { merge: false })`
- Unsplash: `delete(waveRef.collection('splashes').doc(currentUid))`
- Echo: `add(waveRef.collection('echoes'), { userUid: currentUid, text, createdAt: serverTimestamp() })`
- Delete own echo: `delete(waveRef.collection('echoes').doc(echoId))`

Notes
- Counters: the Cloud Functions listen to `onCreate/onDelete` for `splashes` and `echoes` and atomically increment/decrement `waves/{id}.counts.*` via transactions.
- Notifications: if you have a Pings/FCM flow, add it inside the `onCreate` handlers in `functions/index.js` where indicated.

