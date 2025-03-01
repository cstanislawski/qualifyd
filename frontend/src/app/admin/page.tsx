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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your technical assessment templates and evaluations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Templates</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{statistics.totalTemplates}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/templates" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> templates</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Active Evaluations</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{statistics.activeEvaluations}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/evaluations" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> evaluations</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Completed Evaluations</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{statistics.completedEvaluations}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/evaluations?status=completed" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> completed evaluations</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Candidates</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{statistics.candidates}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/candidates" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> candidates</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Link
                href="/admin/templates/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Template
              </Link>
            </div>
            <div>
              <Link
                href="/admin/evaluations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Evaluation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <li key={activity.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {activity.action}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {activity.date}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {activity.user}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>{activity.description}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
