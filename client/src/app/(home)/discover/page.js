'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_OTHERS_EVENTS } from '@/lib/graphql/queries';
import EventCard from '@/components/home/discover/EventCard';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import ErrorMessage from '@/components/home/ErrorMessage';
import { RefetchProvider } from '@/lib/refetchContext';

export default function DiscoverPage() {
    const { loading, error, data, refetch } = useQuery(GET_OTHERS_EVENTS);

    if (loading) return <LoadingIndicator />;

    if (error) return <ErrorMessage message={`Error fetching events: ${error.message}`} />;

    const events = data?.othersEvents || [];

    return (
        <RefetchProvider refetch={refetch}>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Discover Events. Explore and join events hosted by others.</h1>
                </div>
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            No events found.
                        </p>
                        <p className="text-sm text-blue-500 hover:underline cursor-pointer">
                            Check back later!
                        </p>
                    </div>
                )}
            </div>
        </RefetchProvider>
    );
}
