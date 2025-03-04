'use client';

import Link from 'next/link';
import { useAuth } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function UserMenu() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="hidden sm:flex sm:items-center">
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-zinc-700 text-sm font-medium rounded-md text-zinc-100 bg-zinc-800 hover:bg-zinc-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center">
      <div className="ml-3 relative" ref={menuRef}>
        <div>
          <button
            className="bg-zinc-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="user-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <span className="inline-flex items-center">
              <span className="mr-2 text-zinc-300">{user?.name}</span>
              <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-zinc-700">
                <svg className="h-full w-full text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </span>
          </button>
        </div>
        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-zinc-800 ring-1 ring-zinc-700 ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu">
            <div className="px-4 py-3 text-sm text-zinc-500 border-b border-zinc-700">
              <p className="mb-1">Signed in as:</p>
              <p className="font-medium text-zinc-400 break-words">{user?.email}</p>
              <div className="mt-2 text-xs inline-flex items-center font-medium bg-indigo-900/30 text-indigo-400 rounded-full px-2 py-1">
                {user?.role}
              </div>
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Your Profile
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              role="menuitem"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
