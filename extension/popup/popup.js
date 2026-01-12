const API_BASE_URL = 'https://job-application-tracker-chrome-extension.onrender.com'; // TODO: Replace with your actual Render URL
const DASHBOARD_URL = 'https://job-application-tracker-chrome-extension-eroh-1jqyw0fyk.vercel.app';

// DOM elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const loadingView = document.getElementById('loading-view');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboardBtn = document.getElementById('dashboard-btn');
const sheetBtn = document.getElementById('sheet-btn');

const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const totalJobs = document.getElementById('total-jobs');
const weekJobs = document.getElementById('week-jobs');

/**
 * Show specific view
 */
function showView(view) {
    [loginView, mainView, loadingView].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
}

/**
 * Initialize popup
 */
async function init() {
    showView(loadingView);

    const { sessionId, user, sheetId } = await chrome.storage.local.get(['sessionId', 'user', 'sheetId']);

    if (sessionId && user) {
        // User is logged in
        displayUserInfo(user);
        await loadStats(sessionId);
        showView(mainView);

        // Store sheetId for sheet button
        if (sheetId) {
            sheetBtn.dataset.sheetId = sheetId;
        }
    } else {
        // User not logged in
        showView(loginView);
    }
}

/**
 * Display user information
 */
function displayUserInfo(user) {
    userAvatar.src = user.picture || '';
    userName.textContent = user.name || 'User';
    userEmail.textContent = user.email || '';
}

/**
 * Load statistics
 */
async function loadStats(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/stats`, {
            headers: { 'x-session-id': sessionId }
        });

        if (response.ok) {
            const stats = await response.json();
            totalJobs.textContent = stats.total || 0;
            weekJobs.textContent = stats.this_week || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Handle login
 */
loginBtn.addEventListener('click', async () => {
    try {
        showView(loadingView);

        // Get auth URL from backend
        const response = await fetch(`${API_BASE_URL}/auth/google`);
        const { authUrl } = await response.json();

        // Open auth URL in new tab - Service worker will catch the redirect
        chrome.tabs.create({ url: authUrl });

        // The popup will usually close here as user switches to the new tab
        // When they re-open it, it will be logged in thanks to the background script
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to initiate login. Please try again.');
        showView(loginView);
    }
});

/**
 * Initialize Google Sheet
 */
async function initializeSheet(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/init`, {
            method: 'POST',
            headers: { 'x-session-id': sessionId }
        });

        const data = await response.json();

        if (data.sheetId) {
            await chrome.storage.local.set({ sheetId: data.sheetId });
        }
    } catch (error) {
        console.error('Sheet initialization error:', error);
    }
}

/**
 * Handle logout
 */
logoutBtn.addEventListener('click', async () => {
    const { sessionId } = await chrome.storage.local.get('sessionId');

    if (sessionId) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local storage
    await chrome.storage.local.clear();

    // Reload popup
    init();
});

/**
 * Open dashboard
 */
dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
});

/**
 * Open Google Sheet
 */
sheetBtn.addEventListener('click', async () => {
    const { sheetId } = await chrome.storage.local.get('sheetId');

    if (sheetId) {
        chrome.tabs.create({
            url: `https://docs.google.com/spreadsheets/d/${sheetId}`
        });
    } else {
        alert('Sheet not initialized. Please try logging in again.');
    }
});

// Listen for storage changes (when background script captures session)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.sessionId || changes.user)) {
        init();
    }
});

// Initialize on load
init();
