import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for Google Sheets access
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Generate Google OAuth URL for user authentication
 */
export function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force consent screen to get refresh token
    });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return tokens;
    } catch (error) {
        console.error('Error getting tokens:', error);
        throw new Error('Failed to exchange authorization code for tokens');
    }
}

/**
 * Get user info from Google
 */
export async function getUserInfo(accessToken) {
    try {
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        oauth2Client.setCredentials({ access_token: accessToken });

        const { data } = await oauth2.userinfo.get();
        return {
            id: data.id,
            email: data.email,
            name: data.name,
            picture: data.picture
        };
    } catch (error) {
        console.error('Error getting user info:', error);
        throw new Error('Failed to get user information');
    }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
    try {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        return credentials;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Failed to refresh access token');
    }
}

/**
 * Create OAuth client with user tokens
 */
export function getAuthenticatedClient(tokens) {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    client.setCredentials(tokens);
    return client;
}

export { oauth2Client };
