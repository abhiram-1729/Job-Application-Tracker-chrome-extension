import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="btn btn-secondary glass"
            style={{
                width: '40px',
                height: '40px',
                padding: '0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color)',
                color: theme === 'dark' ? '#fbbf24' : '#6366f1',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'light' ? (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, y: 10 }}
                        animate={{ opacity: 1, rotate: 0, y: 0 }}
                        exit={{ opacity: 0, rotate: 90, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <Sun size={20} strokeWidth={2.5} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, y: 10 }}
                        animate={{ opacity: 1, rotate: 0, y: 0 }}
                        exit={{ opacity: 0, rotate: 90, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <Moon size={20} strokeWidth={2.5} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export default ThemeToggle;
