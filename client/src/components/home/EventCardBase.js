'use client';

import React from 'react';
import ApplicationStatus from '@/components/home/discover/ApplicationStatus';

export default function EventCardBase({ event, actions, applicationStatus }) {
    return (
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="absolute top-2 right-2 flex space-x-2 items-center">
                {applicationStatus !== undefined && (
                    applicationStatus ? (
                        <ApplicationStatus status={applicationStatus} />
                    ) : (
                        <span className="text-sm bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">
                            Apply Now!
                        </span>
                    )
                )}
                {actions}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-purple-700 mt-8">{event.name}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                    <p className="font-semibold">Location:</p>
                    <p>{event.location}</p>
                </div>
                <div>
                    <p className="font-semibold">Date:</p>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="font-semibold">Capacity:</p>
                    <p>{event.capacity}</p>
                </div>
                <div>
                    <p className="font-semibold">Fee:</p>
                    <p>{event.fee === 0 ? 'Free' : `$${event.fee}`}</p>
                </div>
            </div>
        </div>
    );
}
