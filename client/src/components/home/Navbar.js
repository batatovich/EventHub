'use client';

import React from "react";
import Link from "next/link";
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import LoadingIndicator from './LoadingIndicator';
import { useTranslations } from '@/lib/hooks/useTranslations';

const Navbar = () => {
    const client = useApolloClient();
    const router = useRouter();
  
    const translations = useTranslations('navbar');

    const handleSignOut = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                client.clearStore();
                router.push(`/${translations.lang}/signin`);
            } else {
                console.error('Sign-out failed');
            }
        } catch (error) {
            console.error('An error occurred during sign-out:', error);
        }
    };

    const pathname = usePathname();

    if (!translations) {
        return
      }   

    const navItems = [
        { name: translations.myEvents, path: '/my-events' },
        { name: translations.discover, path: '/discover' },
    ]; 

    return (
        <Header title="EventHub">
            <ul className="hidden md:flex gap-x-6 text-gray-800">
                {navItems.map(item => (
                    <li key={item.path}>
                        <Link href={`/${translations.lang}${item.path}`}>
                            <p
                                className={`${pathname === `/${translations.lang}${item.path}`
                                    ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                                    : 'font-normal text-gray-600'
                                    } hover:text-gray-900 hover:border-b-2 hover:border-gray-900 transition-colors duration-200`}
                            >
                                {item.name}
                            </p>
                        </Link>
                    </li>
                ))}
                <li>
                    <button
                        onClick={handleSignOut}
                        className="text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-900 transition-colors duration-200"
                    >
                        {translations.signOut}
                    </button>
                </li>
            </ul>
        </Header>
    );
};

export default Navbar;
