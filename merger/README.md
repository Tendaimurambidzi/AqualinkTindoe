# drift-9f114 Merger Backend

This backend provides endpoints to upload video to Mux for video management.

## Features
- Upload audio and video files
- Mux integration (requires credentials)

## Requirements
- Node.js 18+
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
- `POST /mux/upload` — Upload video to Mux

---

Replace placeholder credentials and update endpoints as needed for your workflow.