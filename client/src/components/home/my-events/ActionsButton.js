'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRefetch } from '@/lib/refetchContext';
import { DELETE_EVENT } from '@/lib/graphql/mutations';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import ReviewApplicationsModal from '@/components/home/my-events/ReviewApplicationsModal'; 

export default function ActionsButton({ eventId }) {
    const refetch = useRefetch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const translations = useTranslations('home/eventcard');

    const [deleteEvent] = useMutation(DELETE_EVENT, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            console.error('Error deleting event:', error);
        },
    });

    const handleDeleteEvent = async () => {
        try {
            await deleteEvent({ variables: { id: eventId } });
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (!translations) {
        return <LoadingIndicator />;
    }
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <ActionsButtonBase>
                <button
                    onClick={openModal}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    {translations.reviewApplications}
                </button>
                <button
                    onClick={handleDeleteEvent}
                    className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                >
                    {translations.deleteEvent}
                </button>
            </ActionsButtonBase>
            {isModalOpen && <ReviewApplicationsModal eventId={eventId} onClose={closeModal} />}
        </>
    );
}
