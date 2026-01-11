# Job Tracker - Browser Extension

Chrome/Firefox extension for tracking job applications from job boards.

## Features

- 🎯 Auto-detect job pages (LinkedIn, Indeed, Greenhouse, Lever)
- 💾 One-click save to Google Sheets
- 🔄 Offline queue (syncs when online)
- 📊 Quick stats in popup
- 🔐 Secure Google OAuth

## Installation

### Development Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder

### Usage

1. Click the extension icon and sign in with Google
2. Visit a job page on LinkedIn, Indeed, Greenhouse, or Lever
3. Click the floating "Save to Tracker" button
4. Job is automatically saved to your Google Sheet!

## Supported Job Boards

- ✅ LinkedIn Jobs
- ✅ Indeed
- ✅ Greenhouse
- ✅ Lever

## Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── background/
│   └── service-worker.js  # Background tasks, API calls
├── content/
│   └── content-script.js  # Page detection, save button
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
└── extractors/
    ├── base.js           # Base extractor class
    ├── linkedin.js       # LinkedIn scraper
    ├── indeed.js         # Indeed scraper
    ├── greenhouse.js     # Greenhouse scraper
    └── lever.js          # Lever scraper
```

## Adding New Job Boards

1. Create new extractor in `extractors/[board-name].js`
2. Extend `BaseExtractor` class
3. Implement `extract()` method
4. Add URL pattern to `manifest.json` and `content-script.js`

Example:
```javascript
import { BaseExtractor } from './base.js';

class MyBoardExtractor extends BaseExtractor {
  extract() {
    return {
      company: this.getCompany(),
      job_title: this.getJobTitle(),
      job_url: window.location.href,
      source: 'myboard',
      date_applied: new Date().toISOString().split('T')[0]
    };
  }
  
  getCompany() {
    return this.trySelectors(['.company-selector']);
  }
  
  getJobTitle() {
    return this.trySelectors(['h1.title']);
  }
}

export function extract() {
  return new MyBoardExtractor().extract();
}
```

## Configuration

Update `API_BASE_URL` in:
- `background/service-worker.js`
- `popup/popup.js`

For production, change to your deployed backend URL.

## Permissions

- `storage`: Store session and offline queue
- `activeTab`: Access current tab for scraping
- `scripting`: Inject content scripts
- Host permissions: Access job board domains

## Privacy

- No data is stored on our servers
- All job data goes directly to your Google Sheet
- Session tokens stored locally in extension storage
- Offline queue cleared after sync

## Troubleshooting

**Save button not appearing:**
- Check if you're on a supported job board
- Try refreshing the page
- Check browser console for errors

**Authentication failed:**
- Make sure backend is running
- Check OAuth credentials in backend `.env`
- Clear extension storage and try again

**Jobs not saving:**
- Check if you're logged in (click extension icon)
- Verify backend is accessible
- Check network tab for API errors
