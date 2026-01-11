import express from 'express';
import { getAuthUrl, getTokensFromCode, getUserInfo } from '../services/auth.service.js';

const router = express.Router();

// In-memory token storage (replace with database in production)
const userSessions = new Map();

/**
 * GET /auth/google
 * Initiate Google OAuth flow
 */
router.get('/google', (req, res) => {
    try {
        const authUrl = getAuthUrl();
        res.json({ authUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

/**
 * GET /auth/google/callback
 * Handle OAuth callback
 */
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
        // Exchange code for tokens
        const tokens = await getTokensFromCode(code);

        // Get user info
        const userInfo = await getUserInfo(tokens.access_token);

        // Store tokens (in production, encrypt and store in database)
        const sessionId = `session_${Date.now()}_${Math.random()}`;
        userSessions.set(sessionId, {
            tokens,
            user: userInfo,
            sheetId: null // Will be set when sheet is created
        });

        // In production, set httpOnly cookie
        // For now, redirect to frontend with session info
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.searchParams.set('sessionId', sessionId);
        redirectUrl.searchParams.set('user', JSON.stringify(userInfo));

        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}?error=auth_failed`);
    }
});

/**
 * POST /auth/logout
 * Clear user session
 */
router.post('/logout', (req, res) => {
    const { sessionId } = req.body;

    if (sessionId && userSessions.has(sessionId)) {
        userSessions.delete(sessionId);
    }

    res.json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const session = userSessions.get(sessionId);
    res.json({ user: session.user });
});

// Export sessions for use in other routes
export { userSessions };
export default router;
