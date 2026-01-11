import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

function FilterBar({ filters, setFilters }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value) {
            setFilters({ ...filters, search: value });
        } else {
            const { search, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleStatusFilter = (status) => {
        if (filters.status === status) {
            const { status, ...rest } = filters;
            setFilters(rest);
        } else {
            setFilters({ ...filters, status });
        }
    };

    return (
        <div className="card glass" style={{ marginBottom: '32px', padding: '16px 24px' }}>
            <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search */}
                <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by company or title..."
                        value={search}
                        onChange={handleSearch}
                        className="input"
                        style={{
                            paddingLeft: '44px',
                            background: 'var(--input-bg)',
                            borderRadius: '12px'
                        }}
                    />
                </div>

                {/* Status Filters */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', color: 'var(--text-muted)' }}>
                        <Filter size={16} />
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>Filter:</span>
                    </div>
                    {STATUSES.map(status => {
                        const isActive = filters.status === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    borderRadius: '10px',
                                    border: isActive ? 'none' : '1px solid var(--border-color)',
                                    boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none'
                                }}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>

                {/* Clear Filters */}
                {Object.keys(filters).length > 0 && (
                    <button
                        onClick={() => {
                            setFilters({});
                            setSearch('');
                        }}
                        className="btn btn-secondary"
                        style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            borderRadius: '10px',
                            color: 'var(--danger)',
                            borderColor: 'var(--border-color)'
                        }}
                    >
                        <X size={16} />
                        <span>Reset</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default FilterBar;
