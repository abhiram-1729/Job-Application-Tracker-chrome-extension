# Job Application Tracker

A full-stack system to track job applications from job boards using a browser extension, backend API, and web dashboard. All data is stored in your personal Google Sheet.

![System Architecture](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Google%20Sheets-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

- **Browser Extension**: One-click save from LinkedIn, Indeed, Greenhouse, and Lever
- **Auto-Detection**: Automatically detects job pages and extracts data
- **Google Sheets**: Your data, your control - stored in your Google Drive
- **Web Dashboard**: Beautiful interface to manage applications
- **Offline Support**: Queue jobs when offline, sync when back online
- **Deduplication**: Prevents saving the same job twice
- **Real-time Stats**: Track your application progress

## 📁 Project Structure

```
job-tracker/
├── backend/          # Node.js + Express API
├── extension/        # Chrome/Firefox extension
└── dashboard/        # React web dashboard
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud Project with Sheets API enabled
- Chrome/Firefox browser

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Google OAuth credentials in .env
npm run dev
```

See [backend/README.md](backend/README.md) for detailed setup.

### 2. Extension Setup

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

See [extension/README.md](extension/README.md) for details.

### 3. Dashboard Setup

```bash
cd dashboard
npm install
npm run dev
```

Dashboard runs on `http://localhost:5173`

See [dashboard/README.md](dashboard/README.md) for details.

## 📖 How It Works

1. **Install Extension**: Load the browser extension
2. **Sign In**: Authenticate with Google OAuth
3. **Browse Jobs**: Visit LinkedIn, Indeed, Greenhouse, or Lever
4. **Save**: Click the floating "Save to Tracker" button
5. **Manage**: View and update applications in the dashboard

## 🏗️ Architecture

See [architecture.md](../../.gemini/antigravity/brain/25b79379-3751-4a64-9889-a04135161714/architecture.md) for complete system design.

**Key Components**:
- **Backend**: Handles OAuth, Google Sheets API, deduplication
- **Extension**: Scrapes job data, communicates with backend
- **Dashboard**: React UI for managing applications
- **Google Sheets**: Lightweight database

## 🔧 Configuration

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable:
   - Google Sheets API
   - Google Drive API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/auth/google/callback`

### Environment Variables

**Backend** (`.env`):
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 📊 Google Sheets Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| company | String | Company name |
| job_title | String | Position title |
| job_url | URL | Job posting link |
| status | Enum | Applied, Interview, Offer, Rejected, Ghosted |
| date_applied | Date | Application date |
| source | String | Job board (linkedin, indeed, etc.) |
| notes | Text | User notes |

## 🛠️ Development

### Adding New Job Boards

1. Create extractor in `extension/extractors/[board].js`
2. Add URL pattern to `manifest.json`
3. Update `content-script.js` detection logic

Example:
```javascript
import { BaseExtractor } from './base.js';

class MyBoardExtractor extends BaseExtractor {
  extract() {
    return {
      company: this.getCompany(),
      job_title: this.getJobTitle(),
      job_url: window.location.href,
      source: 'myboard'
    };
  }
}
```

## 🚢 Deployment

### Backend
- Railway, Render, or Heroku
- Update `GOOGLE_REDIRECT_URI` for production

### Dashboard
- Vercel or Netlify
- Update API URLs in `src/services/api.js`

### Extension
- Chrome Web Store (for public release)
- Firefox Add-ons (for Firefox users)

## 🔒 Security

- OAuth tokens encrypted at rest
- Session-based authentication
- CORS configured for specific origins
- No job data stored on backend (stateless)

## 📝 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📧 Support

For issues or questions, check the individual README files in each component folder.

---

**Built with ❤️ for job seekers**
