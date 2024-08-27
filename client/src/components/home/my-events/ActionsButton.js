'use client';

import React from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_EVENT } from '@/lib/graphql/mutations';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import { useRefetch } from '@/lib/refetchContext';

export default function ActionsButton({ eventId }) {
    const refetch = useRefetch();

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


    const handleReviewApplications = async () => { };

    return (
        <ActionsButtonBase>
            <button
                onClick={() => { handleReviewApplications }}
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
    );
}
