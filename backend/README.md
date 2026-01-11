# Job Tracker Backend

Backend API for the Job Application Tracker system. Handles Google OAuth authentication and Google Sheets integration.

## Features

- Google OAuth 2.0 authentication
- Google Sheets API integration
- Job CRUD operations
- Automatic deduplication
- Rate limiting
- RESTful API

## Setup

### Prerequisites

- Node.js 18+
- Google Cloud Project with Sheets API enabled
- OAuth 2.0 credentials

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Download credentials and note the Client ID and Client Secret

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Google OAuth credentials in `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `GET /auth/google` - Get OAuth URL
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Jobs

All job endpoints require `x-session-id` header.

- `POST /api/jobs/init` - Initialize Google Sheet
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Add new job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/stats` - Get statistics

### Health

- `GET /health` - Health check

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── jobs.js           # Job routes
│   │   └── health.js         # Health check
│   ├── services/
│   │   ├── auth.service.js   # OAuth logic
│   │   └── sheets.service.js # Sheets operations
│   └── middleware/
│       └── error.middleware.js
├── package.json
└── .env.example
```

## Development Notes

- Session storage is in-memory (replace with Redis/database for production)
- Tokens are not encrypted (add encryption for production)
- CORS is configured for `http://localhost:5173` (update for production)

## Next Steps

- Add Redis for session storage
- Implement token encryption
- Add request logging
- Add unit tests
- Deploy to Railway/Render
