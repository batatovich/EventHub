'use client';

import React from 'react';
import { useMutation } from '@apollo/client';
import { useRefetch } from '@/lib/refetchContext';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import handleApolloClientError from '@/lib/handleApolloClientError';
import { APPLY_TO_EVENT, CANCEL_APPLICATION } from '@/lib/graphql/mutations';


export default function ActionsButton({ event }) {
    const refetch = useRefetch();

    const translations = useTranslations('home/eventcard');

    const applicationStatus = event?.applicationStatus?.[0]?.status || null;
    const hasApplied = applicationStatus === 'PENDING' || applicationStatus === 'ACCEPTED';
    const isFullyBooked = event.attendance >= event.capacity;

    const [applyToEvent] = useMutation(APPLY_TO_EVENT, {
        onCompleted: () => refetch(),
        onError: (error) => handleApolloClientError(error),
    });

    const [cancelApplication] = useMutation(CANCEL_APPLICATION, {
        onCompleted: () => refetch(),
        onError: (error) => handleApolloClientError(error),
    });

    if (!translations) {
        return <LoadingIndicator />;
    }

    return (
        <ActionsButtonBase>
            {!hasApplied ? (
                <button
                    onClick={() => applyToEvent({ variables: { eventId: event.id } })}
                    className={`block w-full text-left px-4 py-2 ${isFullyBooked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    disabled={isFullyBooked}
                >
                    {isFullyBooked ? translations.eventFull : translations.sendApplication}
                </button>
            ) : (
                <button
                    onClick={() => cancelApplication({ variables: { eventId: event.id } })}
                    className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                >
                    {translations.cancelApplication}
                </button>
            )}
            <button
                onClick={() => console.log('Application History clicked')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
                {translations.applicationHistory}
            </button>
        </ActionsButtonBase>
    );
}
