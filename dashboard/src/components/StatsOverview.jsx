import React from 'react';
import { BarChart3, CheckCircle2, Users, PartyPopper } from 'lucide-react';

function StatsOverview({ stats, onStatClick, activeFilter }) {
    const statCards = [
        {
            label: 'Total Applications',
            value: stats.total || 0,
            icon: BarChart3,
            status: undefined,
            color: 'var(--primary)'
        },
        {
            label: 'Applied',
            value: stats.by_status?.Applied || 0,
            icon: CheckCircle2,
            status: 'Applied',
            color: 'var(--success)'
        },
        {
            label: 'Interviews',
            value: stats.by_status?.Interview || 0,
            icon: Users,
            status: 'Interview',
            color: 'var(--primary-light)'
        },
        {
            label: 'Offers',
            value: stats.by_status?.Offer || 0,
            icon: PartyPopper,
            status: 'Offer',
            color: 'var(--warning)'
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
        }}>
            {statCards.map((stat, index) => {
                const isActive = activeFilter === stat.status;
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`card glass ${isActive ? 'active-stat' : ''}`}
                        onClick={() => onStatClick(stat.status)}
                        style={{
                            padding: '24px',
                            textAlign: 'left',
                            background: isActive ? stat.color : 'var(--surface-bg)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: isActive ? `2px solid ${stat.color}` : '1px solid var(--border-color)',
                            transform: isActive ? 'translateY(-4px)' : 'none',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: isActive ? 'rgba(255,255,255,0.2)' : `${stat.color}15`,
                                padding: '10px',
                                borderRadius: '12px',
                                color: isActive ? 'white' : stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: '800',
                            color: isActive ? 'white' : 'var(--text-primary)',
                            marginBottom: '4px',
                            letterSpacing: '-0.02em'
                        }}>
                            {stat.value}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: isActive ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-secondary)'
                        }}>
                            {stat.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatsOverview;
