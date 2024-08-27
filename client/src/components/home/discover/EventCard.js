'use client';

import React from 'react';
import EventCardBase from '@/components/home/EventCardBase';
import ActionsButton from '@/components/home/discover/ActionsButton';

export default function EventCard({ event }) {
    return (
        <EventCardBase
            event={event}
            actions={
                <ActionsButton event={event} />
            }
            applicationStatus={event.applicationStatus} 
        />
    );
}
