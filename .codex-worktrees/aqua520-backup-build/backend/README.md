Backend for Go Drift (Agora Token)

- Provides a tiny HTTP API to generate Agora RTC tokens for publishing during Go Drift.
- Use this if your preview starts but joining the channel fails or if devices require a valid token to keep the camera open.

Endpoints
- GET /agora/token
  - Query params: channel (required), uid (optional, default 0), role (optional, publisher|audience, default publisher), expire (seconds, default 3600)
  - Returns: { token, channel, uid, role, expire }

Quick Start (local)
- Prereqs: Node 18+
- Set env vars:
  - AGORA_APP_ID: Your Agora App ID
  - AGORA_APP_CERTIFICATE: Your Agora App Certificate (for token signing)
- Install and run:
  - cd Drift/backend/server
  - npm i
  - npm start
  - Server listens on http://localhost:4000

Android emulator note
- Use http://10.0.2.2:4000 from the Android emulator to reach your host machine.

Wire up the app
- Edit Drift/liveConfig.ts and set AGORA_TOKEN_ENDPOINT to your server URL, example:
  - export const AGORA_TOKEN_ENDPOINT = 'http://10.0.2.2:4000/agora/token';

Deploy options
- Any Node host works (Render, Railway, Fly.io, Heroku, etc.).
- For serverless, port the handler to your provider (same logic). Keep the same JSON response shape.
# Backend Transcoding Settings (The Bridge)

This directory contains the ABR ladder config used by your transcoder.

- abr-ladders.json defines H.264, HEVC and AV1 rungs that hit the Data Saver targets used in the app.
- Use 2-second segments and generate an I-frame-only playlist for 3–4s previews.
- Prefer AV1/HEVC in the master manifest when devices support them; include proper CODECS tags.

Typical H.264 rungs:
- 240p @ 200 kbps
- 360p @ 350 kbps
- 480p @ 600–800 kbps (cellular default)
- 720p @ 1,000–1,200 kbps (Wi‑Fi)

HEVC/AV1 rungs:
- 360p @ 220–260 kbps
- 480p @ 380–520 kbps
- 720p @ 700–900 kbps

Audio: AAC 64–96 kbps.

Packaging tips:
- Use byte-range HLS if possible for tighter fetching.
- Provide an I-frame playlist for scrubbing previews.

Wire your Cloud Function/Run transcoder to load `abr-ladders.json` and emit an HLS master with these renditions.

