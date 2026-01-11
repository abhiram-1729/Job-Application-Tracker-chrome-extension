import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJobs, useJobStats } from '../hooks/useJobs';
import StatsOverview from './StatsOverview';
import JobTable from './JobTable';
import FilterBar from './FilterBar';
import SkeletonStats from './SkeletonStats';
import SkeletonTable from './SkeletonTable';
import ThemeToggle from './ThemeToggle';

function Dashboard() {
    const { user, logout } = useAuth();
    const [filters, setFilters] = useState({});

    const { data: jobsData, isLoading: jobsLoading } = useJobs(filters);
    const { data: stats, isLoading: statsLoading } = useJobStats();

    const jobs = jobsData?.jobs || [];

    const handleStatClick = (status) => {
        setFilters(prev => ({
            ...prev,
            status: prev.status === status ? undefined : status
        }));
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            <Toaster position="top-right" />
            {/* Header */}
            <header style={{
                background: 'var(--header-bg)',
                backdropFilter: 'var(--blur)',
                WebkitBackdropFilter: 'var(--blur)',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: 'var(--primary)',
                                padding: '8px',
                                borderRadius: '10px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                JobTracker
                            </h1>
                        </div>
                        <ThemeToggle />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {user?.name}
                                </p>
                                <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' }}>
                                    {user?.email}
                                </p>
                            </div>
                            {user?.picture && (
                                <img
                                    src={user.picture}
                                    alt="User"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '2px solid var(--primary-light)',
                                        objectFit: 'cover'
                                    }}
                                />
                            )}
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '10px' }}
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container" style={{ marginTop: '32px' }}>
                {/* Stats */}
                {statsLoading ? (
                    <SkeletonStats />
                ) : (
                    <StatsOverview
                        stats={stats}
                        onStatClick={handleStatClick}
                        activeFilter={filters.status}
                    />
                )}

                {/* Filters */}
                <FilterBar filters={filters} setFilters={setFilters} />

                {/* Jobs Table */}
                {jobsLoading ? (
                    <SkeletonTable />
                ) : (
                    <JobTable jobs={jobs} />
                )}
            </div>
        </div>
    );
}

export default Dashboard;
