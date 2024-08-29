'use client';

import React from 'react';

export default function ApplicationStatus({ status }) {
    switch (status) {
        case 'PENDING':
            return (
                <p className="text-sm bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded">
                    Pending
                </p>
            );
        case 'ACCEPTED':
            return (
                <p className="text-sm bg-green-200 text-green-800 font-bold px-2 py-1 rounded">
                    Accepted
                </p>
            );
        case 'REJECTED':
            return (
                <p className="text-sm bg-red-200 text-red-800 font-bold px-2 py-1 rounded">
                    Rejected
                </p>
            );
        default:
            return null;
    }
}
