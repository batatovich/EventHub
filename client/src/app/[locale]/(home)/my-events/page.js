'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_EVENTS } from '@/lib/graphql/queries';
import { RefetchProvider } from '@/lib/refetchContext';
import CreateEventButton from '@/components/home/my-events/CreateEventButton';
import EventCard from '@/components/home/my-events/EventCard';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ErrorMessage from '@/components/home/ErrorMessage';
import { getUserLangFromCookie } from '@/lib/helpers/getUserLang'; 

export default function MyEventsPage() {
    const userLang = getUserLangFromCookie();

    // Dynamically import the translations based on the userLang
    const translations = require(`@/locales/${userLang}/home/my-events`).default;

    const { loading, error, data, refetch } = useQuery(GET_MY_EVENTS);

    if (loading) return <LoadingIndicator message={translations.loadingEvents} />;

    if (error && error.networkError && error.networkError.statusCode !== 401) {
        return <ErrorMessage message={translations.errorFetchingEvents} details={error.message} />;
    }

    const events = data?.myEvents || [];

    return (
        <RefetchProvider refetch={refetch}>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">{translations.manageYourEvents}</h1>
                    <CreateEventButton />
                </div>
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            {translations.noEventsFound}
                        </p>
                        <p className="text-sm text-blue-500 hover:underline cursor-pointer">
                            {translations.createYourFirstEvent}
                        </p>
                    </div>
                )}
            </div>
        </RefetchProvider>
    );
}
