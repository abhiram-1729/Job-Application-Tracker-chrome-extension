import React from 'react';

function StatusBadge({ status }) {
    const getBadgeClass = () => {
        switch (status) {
            case 'Applied':
                return 'badge badge-blue';
            case 'Interview':
                return 'badge badge-yellow';
            case 'Offer':
                return 'badge badge-green';
            case 'Rejected':
                return 'badge badge-red';
            case 'Ghosted':
                return 'badge badge-gray';
            default:
                return 'badge badge-gray';
        }
    };

    return (
        <span className={getBadgeClass()}>
            {status}
        </span>
    );
}

export default StatusBadge;
