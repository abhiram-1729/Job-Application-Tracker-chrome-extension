const API_BASE_URL = 'http://localhost:3000';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SAVE_JOB') {
        handleSaveJob(request.data)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Keep channel open for async response
    }
});

/**
 * Save job to backend
 */
async function handleSaveJob(jobData) {
    try {
        // Get session ID from storage
        const { sessionId } = await chrome.storage.local.get('sessionId');

        if (!sessionId) {
            console.error('❌ Save failed: No sessionId found');
            throw new Error('Not authenticated. Please log in from the extension popup.');
        }

        console.log('📤 Sending job to backend...', jobData.company);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`${API_BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(jobData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Session expired. Please log in again from the extension popup.');
            }

            let errorMessage = 'Failed to save job';
            try {
                // Try to get JSON first
                const clone = response.clone();
                const errorData = await clone.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // If not JSON, get the text body
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Save successful:', result);

        // If duplicate, still return success but with message
        if (result.duplicate) {
            return {
                ...result,
                message: 'This job is already in your tracker'
            };
        }

        // Update badge to show saved count
        updateBadge();

        return result;
    } catch (error) {
        console.error('Error saving job:', error);

        // If offline or server down, queue for later
        if (error.message.includes('fetch')) {
            await queueJobForLater(jobData);
            throw new Error('Saved offline. Will sync when connection is restored.');
        }

        throw error;
    }
}

/**
 * Queue job for offline sync
 */
async function queueJobForLater(jobData) {
    const { offlineQueue = [] } = await chrome.storage.local.get('offlineQueue');
    offlineQueue.push({
        ...jobData,
        queued_at: new Date().toISOString()
    });
    await chrome.storage.local.set({ offlineQueue });
}

/**
 * Process offline queue
 */
async function processOfflineQueue() {
    const { offlineQueue = [], sessionId } = await chrome.storage.local.get(['offlineQueue', 'sessionId']);

    if (!sessionId || offlineQueue.length === 0) {
        return;
    }

    const processed = [];

    for (const job of offlineQueue) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                },
                body: JSON.stringify(job)
            });

            if (response.ok) {
                processed.push(job);
            }
        } catch (error) {
            console.error('Failed to sync job:', error);
            break; // Stop if still offline
        }
    }

    // Remove processed jobs from queue
    const remaining = offlineQueue.filter(job => !processed.includes(job));
    await chrome.storage.local.set({ offlineQueue: remaining });

    if (processed.length > 0) {
        console.log(`✅ Synced ${processed.length} offline jobs`);
    }
}

/**
 * Update extension badge with job count
 */
async function updateBadge() {
    try {
        const { sessionId } = await chrome.storage.local.get('sessionId');

        if (!sessionId) {
            chrome.action.setBadgeText({ text: '' });
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/jobs/stats`, {
            headers: { 'x-session-id': sessionId }
        });

        if (response.ok) {
            const stats = await response.json();
            const count = stats.this_week || 0;
            chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
            chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Try to sync offline queue every 5 minutes
setInterval(processOfflineQueue, 5 * 60 * 1000);

// Update badge on startup
updateBadge();

// Listen for URL changes to catch OAuth callbacks or dashboard redirects
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Check if we have a URL to work with (either in changeInfo or tab)
    const urlString = changeInfo.url || tab.url;
    if (!urlString) return;

    try {
        const url = new URL(urlString);

        // Case 1: Dashboard redirect after login (http://localhost:5173/?sessionId=...&user=...)
        if (url.origin === 'http://localhost:5173' && url.searchParams.has('sessionId')) {
            const sessionId = url.searchParams.get('sessionId');
            const userStr = url.searchParams.get('user');

            if (sessionId && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    await chrome.storage.local.set({ sessionId, user });
                    console.log('✅ Session captured from dashboard redirect');

                    // Initialize sheet (silent)
                    await initializeSheet(sessionId);
                    updateBadge();
                } catch (e) {
                    console.error('Failed to parse user from dashboard URL', e);
                }
            }
        }

        // Case 2: Direct backend callback
        if (url.origin === API_BASE_URL && url.pathname === '/auth/google/callback') {
            const code = url.searchParams.get('code');
            if (code) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${code}`);
                    const data = await response.json();

                    if (data.sessionId && data.user) {
                        await chrome.storage.local.set({
                            sessionId: data.sessionId,
                            user: data.user
                        });
                        console.log('✅ Session captured from backend callback');

                        await initializeSheet(data.sessionId);
                        updateBadge();
                    }
                } catch (e) {
                    console.error('Failed to handle backend callback', e);
                }
            }
        }
    } catch (e) {
        // Not a valid URL, ignore
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

