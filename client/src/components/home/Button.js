'use client';

import React from 'react';

export default function Button({ text, color, onClick, disabled, icon: Icon }) {
    return (
        <button
            onClick={onClick}
            className={`${color} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center`}
            disabled={disabled}
        >
            {Icon && <Icon className="mr-2" />}
            {text}
        </button>
    );
}
