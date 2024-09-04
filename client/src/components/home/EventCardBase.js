'use client';

import React from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ApplicationStatus from '@/components/home/discover/ApplicationStatus';

export default function EventCardBase({ event, actions, showApplicationStatus }) {
    const translations = useTranslations('home/eventcard');

    if (!translations) {
        return <LoadingIndicator />;
    }
    
    let applicationStatus;
    if (showApplicationStatus) {
        applicationStatus = event.applicationStatus?.[0].status;
    }
    const isFullyBooked = event.attendance >= event.capacity;

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="absolute top-2 right-2 flex space-x-2 items-center">
                {showApplicationStatus && (
                    applicationStatus ? (
                        <ApplicationStatus status={applicationStatus} />
                    ) : isFullyBooked ? (
                        <span className="text-sm bg-orange-100 text-orange-800 font-bold px-2 py-1 rounded">
                            {translations.eventFull}
                        </span>
                    ) : (
                        <span className="text-sm bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">
                            {translations.applyNow}
                        </span>
                    )
                )}
                {actions}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-purple-700 mt-8">{event.name}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                    <p className="font-semibold">{translations.location}</p>
                    <p>{event.location}</p>
                </div>
                <div>
                    <p className="font-semibold">{translations.date}</p>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="font-semibold">{translations.attendance}</p>
                    <p>{event.attendance}/{event.capacity}</p>
                </div>
                <div>
                    <p className="font-semibold">{translations.fee}</p>
                    <p>{event.fee === 0 ? translations.free : `$${event.fee}`}</p>
                </div>
            </div>
        </div>
    );
}
