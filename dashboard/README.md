# Job Tracker Dashboard

React dashboard for managing job applications.

## Features

- 📊 Real-time stats and analytics
- 🔍 Search and filter applications
- ✏️ Inline editing
- 🎨 Modern, responsive UI
- 🔄 Auto-sync with Google Sheets

## Setup

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Dashboard will run on `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── LoginPage.jsx      # Login screen
│   │   ├── JobTable.jsx       # Job list table
│   │   ├── StatsOverview.jsx  # Stats cards
│   │   ├── FilterBar.jsx      # Search/filter
│   │   └── StatusBadge.jsx    # Status badge
│   ├── hooks/
│   │   ├── useAuth.js         # Auth hook
│   │   └── useJobs.js         # Job data hooks
│   ├── services/
│   │   └── api.js             # API client
│   ├── utils/
│   │   └── formatters.js      # Utility functions
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Usage

1. Sign in with Google
2. View all your tracked applications
3. Filter by status or search by company/title
4. Click "Edit" to update status or add notes
5. Track your progress with real-time stats

## Configuration

Update API base URL in `src/services/api.js` for production deployment.

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Tech Stack

- React 18
- Vite
- TanStack Query (React Query)
- Axios
