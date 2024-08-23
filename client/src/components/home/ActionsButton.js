'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_EVENT } from '@/lib/graphql/mutations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

export default function ActionsButton({ eventId, refetch }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [deleteEvent] = useMutation(DELETE_EVENT, {
        onCompleted: () => {
            refetch();
        },
        onError: (error) => {
            console.error('Error deleting event:', error);
        },
    });

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleDeleteEvent = async () => {
        try {
            await deleteEvent({ variables: { id: eventId } });
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none"
                aria-label="Actions"
            >
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            refetch();
                        }}
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
                </div>
            )}
        </div>
    );
}
