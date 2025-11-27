# drift-9f114 Merger Backend

This backend provides endpoints to upload audio and video, merge them using FFmpeg, and return the merged video. Mux integration is included for video management.

## Features
- Upload audio and video files
- Merge audio and video using FFmpeg
- Download merged video
- Mux integration (requires credentials)

## Requirements
- Node.js 18+
- FFmpeg installed and available in PATH
- Mux credentials (ID and token)

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set your Mux credentials in a `.env` file:
   ```env
   MUX_TOKEN_ID=your_token_id
   MUX_TOKEN_SECRET=your_token_secret
   ```
3. Start the server:
   ```sh
   npm start
   ```

## API
- `POST /merge` — Upload audio and video, returns merged video
- `POST /mux/upload` — Upload video to Mux

---

Replace placeholder credentials and update endpoints as needed for your workflow.