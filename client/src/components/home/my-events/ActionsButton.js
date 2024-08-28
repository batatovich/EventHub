'use client';

import React, { useState } from 'react';
import { useRefetch } from '@/lib/refetchContext';
import { useMutation } from '@apollo/client';
import { DELETE_EVENT } from '@/lib/graphql/mutations';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import ReviewApplicationsModal from '@/components/home/my-events/ReviewApplicationsModal'; 

export default function ActionsButton({ eventId }) {
    const refetch = useRefetch();
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <ActionsButtonBase>
                <button
                    onClick={openModal}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    Review Applications
                </button>
                <button
                    onClick={handleDeleteEvent}
                    className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                >
                    Delete Event
                </button>
            </ActionsButtonBase>
            {isModalOpen && <ReviewApplicationsModal eventId={eventId} onClose={closeModal} />}
        </>
    );
}
