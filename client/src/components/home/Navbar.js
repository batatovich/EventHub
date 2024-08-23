'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import Header from '@/components/Header'; // Update this path based on your project structure

const Navbar = () => {
    const client = useApolloClient();
    const router = useRouter();

    const handleSignOut = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                client.clearStore();
                router.push('/signin');
            } else {
                console.error('Sign-out failed');
            }
        } catch (error) {
            console.error('An error occurred during sign-out:', error);
        }
    };

    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Events', path: '/my-events' },
        { name: 'Discover', path: '/discover' },
    ];

    return (
        <Header title="EventHub">
            <ul className="hidden md:flex gap-x-6 text-gray-800">
                {navItems.map(item => (
                    <li key={item.path}>
                        <Link href={item.path}>
                            <p
                                className={`${pathname === item.path
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
                        Sign Out
                    </button>
                </li>
            </ul>
        </Header>
    );
};

export default Navbar;
