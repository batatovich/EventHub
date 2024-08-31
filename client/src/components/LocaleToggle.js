"use client";

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

export default function LocaleToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleLocale = (newLocale) => {
    document.cookie = `user-lang=${newLocale}; path=/`;
    const newPathname = `/${newLocale}${pathname.replace(/^\/(en|es)/, '')}`;

    const search = searchParams.toString();
    const fullPath = search ? `${newPathname}?${search}` : newPathname;

    router.push(fullPath);
  };

  return (
    <div className="flex">
      <button
        onClick={() => toggleLocale('en')}
        className={`px-3 py-1 text-sm rounded-l border border-gray-300 transition-colors duration-300 ${pathname.startsWith('/en')
            ? 'bg-blue-500 text-white cursor-default opacity-50'
            : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
          }`}
        disabled={pathname.startsWith('/en')}
      >
        En
      </button>
      <button
        onClick={() => toggleLocale('es')}
        className={`px-3 py-1 text-sm rounded-r border border-gray-300 transition-colors duration-300 ${pathname.startsWith('/es')
            ? 'bg-blue-500 text-white cursor-default opacity-50'
            : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
          }`}
        disabled={pathname.startsWith('/es')}
      >
        Es
      </button>
    </div>
  );
}
