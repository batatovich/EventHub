'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRefetch } from '@/lib/refetchContext';
import { DELETE_EVENT } from '@/lib/graphql/mutations';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import handleApolloClientError from '@/lib/handleApolloClientError';
import ReviewApplicationsModal from '@/components/home/my-events/ReviewApplicationsModal';

export default function ActionsButton({ eventId }) {
    const translations = useTranslations('home/eventcard');
    const refetch = useRefetch();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [deleteEvent] = useMutation(DELETE_EVENT, {
        onCompleted: () => refetch(),
        onError: (error) => handleApolloClientError(error),
    });

    if (!translations) {
        return <LoadingIndicator />;
    }

    return (
        <>
            <ActionsButtonBase>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    {translations.reviewApplications}
                </button>
                <button
                    onClick={() => deleteEvent({ variables: { id: eventId } })}
                    className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                >
                    {translations.deleteEvent}
                </button>
            </ActionsButtonBase>
            {isModalOpen && <ReviewApplicationsModal eventId={eventId} onClose={() => setIsModalOpen(false)} />}
        </>
    );
}
