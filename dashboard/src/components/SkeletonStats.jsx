import React from 'react';

function SkeletonStats() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
        }}>
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="card"
                    style={{
                        height: '140px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 12px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '60%', height: '28px', margin: '0 auto 8px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '40%', height: '14px', margin: '0 auto' }}></div>
                </div>
            ))}
        </div>
    );
}

export default SkeletonStats;
