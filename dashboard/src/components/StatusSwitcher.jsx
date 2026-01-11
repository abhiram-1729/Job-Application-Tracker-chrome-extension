import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2, Users, PartyPopper, XCircle, Ghost } from 'lucide-react';

const STATUS_CONFIG = [
    { id: 'Saved', label: 'Saved', icon: Bookmark, color: '#94a3b8' },
    { id: 'Applied', label: 'Applied', icon: CheckCircle2, color: '#4f46e5' },
    { id: 'Interview', label: 'Interview', icon: Users, color: '#818cf8' },
    { id: 'Offer', label: 'Offer', icon: PartyPopper, color: '#10b981' },
    { id: 'Rejected', label: 'Rejected', icon: XCircle, color: '#f43f5e' },
    { id: 'Ghosted', label: 'Ghosted', icon: Ghost, color: '#64748b' }
];

function StatusSwitcher({ currentStatus, onStatusChange, isUpdating }) {
    const handleStatusClick = async (newStatus) => {
        if (newStatus === currentStatus || isUpdating) return;

        try {
            await onStatusChange(newStatus);
        } catch (error) {
            console.error('Status update failed');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-bg-alt)',
            borderRadius: '24px',
            padding: '3px',
            width: 'fit-content',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
            {STATUS_CONFIG.map((status) => {
                const isActive = status.id === currentStatus;
                const Icon = status.icon;

                return (
                    <motion.button
                        key={status.id}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleStatusClick(status.id)}
                        disabled={isUpdating}
                        title={status.label}
                        style={{
                            position: 'relative',
                            border: 'none',
                            background: isActive ? status.color : 'transparent',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            margin: '0 2px',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            boxShadow: isActive ? `0 4px 12px ${status.color}40` : 'none',
                            zIndex: isActive ? 1 : 0
                        }}
                    >
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />

                        {isActive && (
                            <motion.div
                                layoutId="status-active-glow"
                                style={{
                                    position: 'absolute',
                                    inset: '-2px',
                                    borderRadius: '50%',
                                    border: `2px solid ${status.color}`,
                                    zIndex: -1
                                }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default StatusSwitcher;
