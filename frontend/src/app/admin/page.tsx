import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Qualifyd',
};

export default function AdminDashboard() {
  // This would be fetched from an API in a real implementation
  const statistics = {
    totalTemplates: 15,
    activeEvaluations: 8,
    completedEvaluations: 32,
    candidates: 45,
  };

  // Recent activities - would be fetched from an API
  const recentActivities = [
    {
      id: 1,
      action: 'New evaluation created',
      user: 'Jane Smith',
      date: '2 hours ago',
      description: 'Created a new Kubernetes troubleshooting evaluation',
    },
    {
      id: 2,
      action: 'Template updated',
      user: 'John Doe',
      date: '5 hours ago',
      description: 'Updated Docker Compose Challenge template',
    },
    {
      id: 3,
      action: 'Evaluation completed',
      user: 'Alice Johnson',
      date: 'Yesterday',
      description: 'Completed Linux Server Troubleshooting with score 85/100',
    },
    {
      id: 4,
      action: 'New template created',
      user: 'Bob Williams',
      date: '2 days ago',
      description: 'Created AWS Infrastructure as Code template',
    },
  ];

  return (
    <>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-100">Admin Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">Manage your technical assessment templates and evaluations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Total Templates</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.totalTemplates}</dd>
            </dl>
          </div>
          <div className="bg-zinc-800 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/templates" className="font-medium text-indigo-400 hover:text-indigo-300">
                View all<span className="sr-only"> templates</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Active Evaluations</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.activeEvaluations}</dd>
            </dl>
          </div>
          <div className="bg-zinc-800 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/evaluations" className="font-medium text-indigo-400 hover:text-indigo-300">
                View all<span className="sr-only"> evaluations</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Completed Evaluations</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.completedEvaluations}</dd>
            </dl>
          </div>
          <div className="bg-zinc-800 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/completed" className="font-medium text-indigo-400 hover:text-indigo-300">
                View all<span className="sr-only"> completed evaluations</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Candidates</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.candidates}</dd>
            </dl>
          </div>
          <div className="bg-zinc-800 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/candidates" className="font-medium text-indigo-400 hover:text-indigo-300">
                View all<span className="sr-only"> candidates</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link href="/admin/templates/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create New Template
          </Link>
          <Link href="/admin/evaluations/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create New Evaluation
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Recent Activity</h2>
        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <ul className="divide-y divide-zinc-800">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 rounded-full bg-zinc-800 p-1 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="flex">
                        <h3 className="text-sm font-medium text-zinc-100">{activity.action}</h3>
                        <span className="ml-1 text-sm text-zinc-500">&middot;</span>
                        <p className="ml-1 text-sm text-zinc-400">{activity.date}</p>
                      </div>
                      <div className="mt-1 flex">
                        <p className="text-sm text-zinc-300 mr-2">
                          <span className="font-medium text-zinc-300">{activity.user}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300">
                    {activity.description}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
