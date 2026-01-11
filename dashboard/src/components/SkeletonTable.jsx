import React from 'react';

function SkeletonTable() {
    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="skeleton-pulse" style={{ height: '48px', width: '100%', background: '#f7fafc' }}></div>
            <div style={{ padding: '0 16px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                        padding: '16px 0',
                        borderBottom: i === 5 ? 'none' : '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '16px'
                    }}>
                        <div style={{ flex: 2 }}>
                            <div className="skeleton-pulse" style={{ width: '70%', height: '16px', marginBottom: '8px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '40%', height: '12px' }}></div>
                        </div>
                        <div style={{ flex: 2 }}>
                            <div className="skeleton-pulse" style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '30%', height: '11px' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="skeleton-pulse" style={{ width: '100%', height: '24px', borderRadius: '12px' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="skeleton-pulse" style={{ width: '60%', height: '14px' }}></div>
                        </div>
                        <div style={{ flex: 2 }}>
                            <div className="skeleton-pulse" style={{ width: '90%', height: '32px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SkeletonTable;
