'use client';

import React from 'react';
import ActionsButtonBase from '@/components/home/ActionsButtonBase';
import { useMutation } from '@apollo/client';
import { APPLY_TO_EVENT, CANCEL_APPLICATION } from '@/lib/graphql/mutations';
import { useRefetch } from '@/lib/refetchContext';


export default function ActionsButton({ event }) {
    const refetch = useRefetch();

    const applicationStatus = event?.applicationStatus?.[0]?.status || null;
    const hasApplied = applicationStatus === 'PENDING' || applicationStatus === 'ACCEPTED';

    // Mutation to apply to the event
    const [applyToEvent] = useMutation(APPLY_TO_EVENT, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            console.error('Error applying to event:', error);
        },
    });

    // Mutation to cancel the application
    const [cancelApplication] = useMutation(CANCEL_APPLICATION, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            console.error('Error canceling application:', error);
        },
    });

    const handleApplyToEvent = async () => {
        try {
            await applyToEvent({ variables: { eventId: event.id } });
        } catch (error) {
            console.error('Error applying to event:', error);
        }
    };

    const handleCancelApplication = async () => {
        try {
            await cancelApplication({ variables: { eventId: event.id } }); //
        } catch (error) {
            console.error('Error applying to event:', error);
        }
    };
    return (
        <ActionsButtonBase>
            {!hasApplied ? (
                <button
                    onClick={handleApplyToEvent} 
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    Send Application
                </button>
            ) : (
                <button
                    onClick={handleCancelApplication}  
                    className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                >
                    Cancel Application
                </button>
            )}
            <button
                onClick={() => console.log('Application History clicked')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
                Application History
            </button>
        </ActionsButtonBase>
    );
}
