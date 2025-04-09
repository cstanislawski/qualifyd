'use client';

import { useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TeamManagement() {
  const { isLoggedIn, hasAnyCompanyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!hasAnyCompanyRole()) {
      router.push('/');
      return;
    }
  }, [isLoggedIn, hasAnyCompanyRole, router]);

  // Team members - would be fetched from an API
  const teamMembers = [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'Admin',
      lastActive: '2 hours ago',
      avatar: null
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      role: 'Template Editor',
      lastActive: '1 day ago',
      avatar: null
    },
    {
      id: '3',
      name: 'Marcus Wilson',
      email: 'marcus@example.com',
      role: 'Recruiter',
      lastActive: '3 days ago',
      avatar: null
    },
    {
      id: '4',
      name: 'Priya Patel',
      email: 'priya@example.com',
      role: 'Reviewer',
      lastActive: '5 hours ago',
      avatar: null
    }
  ];

  return (
    <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-zinc-100">Team Management</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage team members and their access levels to your Qualifyd workspace.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-zinc-200">Team Members</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Invite Team Member
          </button>
        </div>

        <div className="bg-zinc-900 overflow-hidden rounded-lg shadow border border-zinc-800">
          <ul className="divide-y divide-zinc-800">
            {teamMembers.map((member) => (
              <li key={member.id}>
                <div className="px-6 py-5 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-zinc-700">
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={`${member.name}'s avatar`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg className="h-full w-full text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-zinc-200">{member.name}</h3>
                        <p className="text-sm text-zinc-400">{member.email}</p>
                      </div>

                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {member.role}
                        </span>
                        <div className="ml-4 text-sm text-zinc-400">
                          Last active: {member.lastActive}
                        </div>
                        <button className="ml-4 text-zinc-400 hover:text-zinc-200">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
