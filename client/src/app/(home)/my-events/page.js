'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_EVENTS } from '@/lib/graphql/queries';
import CreateEventButton from '@/components/home/CreateEventButton';
import EventCard from '@/components/home/EventCard';

export default function MyEventsPage() {
  const { loading, error, data, refetch } = useQuery(GET_MY_EVENTS);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <p className="text-lg font-medium text-blue-600 animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (error && error.networkError && error.networkError.statusCode !== 401) return (
    <div className="flex justify-center items-center h-48">
      <p className="text-lg font-medium text-red-600">
        Error fetching events: {error.message}
      </p>
    </div>
  );

  const events = data?.myEvents || [];

  const handleReviewApplications = (eventId) => {
    // Implement the logic for reviewing applications
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Your delete event logic here
      await refetch(); // Refresh the events list after deletion
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Manage Your Events. Create events and review applications.</h1>
        <CreateEventButton refetch={refetch} />
      </div>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onReviewApplications={() => handleReviewApplications(event.id)}
              onDeleteEvent={() => handleDeleteEvent(event.id)}
            />
          ))}
        </div>
      ) : (
        <p>No events found. Create your first event!</p>
      )}
    </div>
  );
}
