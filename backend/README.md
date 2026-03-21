# Personal Chatbot Backend

A Node.js Express server for the Personal Chatbot project.

## Tech Stack
- Node.js
- Express
- CORS
- dotenv

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Create a `.env` file with:
   ```env
   PORT=5001
   NODE_ENV=development
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

## API Endpoints (v1)
- `GET /api/v1/health`: Check server health.
- `POST /api/v1/chat`: Send a message and get an echo response.
  - Body: `{"message": "string"}`
