import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedSessionId = localStorage.getItem('sessionId');
        const storedUser = localStorage.getItem('user');

        if (storedSessionId && storedUser) {
            setSessionId(storedSessionId);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = (newSessionId, newUser) => {
        localStorage.setItem('sessionId', newSessionId);
        localStorage.setItem('user', JSON.stringify(newUser));
        setSessionId(newSessionId);
        setUser(newUser);
    };

    const logout = async () => {
        if (sessionId) {
            try {
                await authAPI.logout(sessionId);
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        setSessionId(null);
        setUser(null);
    };

    const value = {
        user,
        sessionId,
        loading,
        isAuthenticated: !!sessionId,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
