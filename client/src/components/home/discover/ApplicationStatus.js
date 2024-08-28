'use client';

import React from 'react';

export default function ApplicationStatus({ status }) {
    switch (status) {
        case 'PENDING':
            return (
                <p className="bg-yellow-200 text-yellow-800 font-bold px-4 py-2 rounded">
                    Pending
                </p>
            );
        case 'ACCEPTED':
            return (
                <p className="bg-green-200 text-green-800 font-bold px-4 py-2 rounded">
                    Accepted
                </p>
            );
        case 'REJECTED':
            return (
                <p className="bg-red-200 text-red-800 font-bold px-4 py-2 rounded">
                    Rejected
                </p>
            );
        default:
            return null;
    }
}
