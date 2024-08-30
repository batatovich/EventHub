'use client';

import React from 'react';
import { getUserLangFromCookie } from '@/lib/helpers/getUserLang'; 

export default function ApplicationStatus({ status }) {
    const userLang = getUserLangFromCookie();

    const translations = require(`@/locales/${userLang}/home/eventcard`).default;

    switch (status) {
        case 'PENDING':
            return (
                <p className="text-sm bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded">
                    {translations.pending}
                </p>
            );
        case 'ACCEPTED':
            return (
                <p className="text-sm bg-green-200 text-green-800 font-bold px-2 py-1 rounded">
                    {translations.accepted}
                </p>
            );
        case 'REJECTED':
            return (
                <p className="text-sm bg-red-200 text-red-800 font-bold px-2 py-1 rounded">
                    {translations.rejected}
                </p>
            );
        default:
            return null;
    }
}
