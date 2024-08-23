'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

export default function ActionsButton({ onReviewApplications, onDeleteEvent }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
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
                        onClick={onReviewApplications}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Review Applications
                    </button>
                    <button
                        onClick={onDeleteEvent}
                        className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100"
                    >
                        Delete Event
                    </button>
                </div>
            )}
        </div>
    );
}
