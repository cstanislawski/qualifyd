import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Management - Qualifyd',
};

export default function TeamManagement() {
  // This would be fetched from an API in a real implementation
  const teamStatistics = {
    totalMembers: 12,
    maxMembers: 15, // Maximum allowed team members in the current plan
    activeMembers: 10,
    pendingInvitations: 2,
    admins: 3,
    editors: 6,
    viewers: 3,
  };

  // Team members - would be fetched from an API
  const teamMembers = [
    {
      id: 1,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Admin',
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Editor',
      lastActive: '1 day ago',
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'Editor',
      lastActive: '3 hours ago',
    },
    {
      id: 4,
      name: 'Bob Williams',
      email: 'bob.williams@example.com',
      role: 'Viewer',
      lastActive: '5 days ago',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-900 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-white mb-6">Team Management</h1>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-zinc-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-zinc-400 truncate">Total Team Members</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">{teamStatistics.totalMembers}</div>
                      <div className="ml-1 text-lg text-zinc-500">/ {teamStatistics.maxMembers}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-zinc-400 truncate">Active Members</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">{teamStatistics.activeMembers}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-zinc-400 truncate">Pending Invitations</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">{teamStatistics.pendingInvitations}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Role Distribution (simplified) */}
          <div className="bg-zinc-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-zinc-400 truncate">Role Distribution</dt>
                    <dd className="grid grid-cols-3 gap-2 text-sm mt-1">
                      <div>
                        <span className="text-zinc-400">Admin:</span>
                        <span className="ml-1 text-white font-medium">{teamStatistics.admins}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Editor:</span>
                        <span className="ml-1 text-white font-medium">{teamStatistics.editors}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Viewer:</span>
                        <span className="ml-1 text-white font-medium">{teamStatistics.viewers}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-zinc-800 shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 border-b border-zinc-700 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">Team Members</h3>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Invite Member
            </button>
          </div>
          <ul className="divide-y divide-zinc-700">
            {teamMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{member.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{member.name}</div>
                        <div className="text-sm text-zinc-400">{member.email}</div>
                      </div>
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
