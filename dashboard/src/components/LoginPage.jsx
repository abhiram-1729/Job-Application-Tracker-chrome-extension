import React, { useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import api from '../services/api';

function LoginPage() {
    const { login } = useAuth();

    useEffect(() => {
        // Check if we're returning from OAuth callback via backend redirect
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');
        const userStr = urlParams.get('user');

        if (sessionId && userStr) {
            try {
                const user = JSON.parse(userStr);
                login(sessionId, user);

                // Initialize sheet (silent)
                api.post('/api/jobs/init').catch(err => console.error('Silent sheet init error:', err));

                // Clear URL params and redirect to dashboard home
                window.history.replaceState({}, document.title, '/');
            } catch (err) {
                console.error('Failed to parse user info:', err);
            }
            return;
        }

        // Check if we're in the old code flow (optional, for safety)
        const code = urlParams.get('code');
        if (code) {
            handleOAuthCallback(code);
        }
    }, []);

    const handleOAuthCallback = async (code) => {
        try {
            const response = await api.get(`/auth/google/callback?code=${code}`);
            const data = response.data;

            if (data.sessionId && data.user) {
                login(data.sessionId, data.user);

                // Initialize sheet (silent)
                api.post('/api/jobs/init').catch(err => console.error('Silent sheet init error:', err));

                // Clear URL params and redirect to home
                window.history.replaceState({}, document.title, '/');
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            alert('Authentication failed. Please try again.');
            window.location.href = '/';
        }
    };

    const handleLogin = async () => {
        try {
            const { data } = await authAPI.getAuthUrl();
            window.location.href = data.authUrl;
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to initiate login. Please try again.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    marginBottom: '8px',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    letterSpacing: '-0.025em'
                }}>
                    <div style={{
                        background: '#1e293b',
                        padding: '6px',
                        borderRadius: '8px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(30, 41, 59, 0.2)'
                    }}>
                        <Briefcase size={20} strokeWidth={2.5} />
                    </div>
                    JobTracker
                </h1>
                <p style={{ fontSize: '16px', color: '#718096', marginBottom: '32px' }}>
                    Track your job applications effortlessly
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
                        Sign in with Google to start tracking your job applications across LinkedIn, Indeed, Greenhouse, and Lever.
                    </p>
                </div>

                <button onClick={handleLogin} className="btn btn-primary" style={{ width: '100%' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>

                <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#718096', lineHeight: '1.5' }}>
                        <strong>Features:</strong><br />
                        ✓ Auto-save from job boards<br />
                        ✓ Track application status<br />
                        ✓ Google Sheets integration<br />
                        ✓ Browser extension included
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
