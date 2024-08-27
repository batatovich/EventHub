'use client';

import React from 'react';
import EventCardBase from '@/components/home/EventCardBase';
import ActionsButton from '@/components/home/my-events/ActionsButton';

export default function EventCard({ event }) {
    return (
        <EventCardBase
            event={event}
            actions={<ActionsButton eventId={event.id} />}
        />
    );
}
