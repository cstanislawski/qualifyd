import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidate Dashboard - Qualifyd',
};

export default function CandidateDashboard() {
  // This would be fetched from an API in a real implementation
  const statistics = {
    completedAssessments: 2,
    upcomingAssessments: 1,
    availableAssessments: 3,
    averageScore: '87%',
  };

  // Upcoming assessments
  const upcomingAssessments = [
    {
      id: '123',
      title: 'Kubernetes Troubleshooting',
      company: 'TechCorp Inc.',
      date: 'Tomorrow at 2:30 PM',
      duration: '90 minutes',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Candidate Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">View your upcoming and completed technical assessments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Completed Assessments</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.completedAssessments}</dd>
            </dl>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Upcoming Assessments</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.upcomingAssessments}</dd>
            </dl>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Available Assessments</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.availableAssessments}</dd>
            </dl>
          </div>
        </div>

        <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-zinc-400 truncate">Average Score</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-400">{statistics.averageScore}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Upcoming Assessments */}
      <div className="bg-zinc-900 shadow overflow-hidden rounded-lg border border-zinc-800 mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Upcoming Assessments</h2>
        </div>
        {upcomingAssessments.length > 0 ? (
          <ul className="divide-y divide-zinc-800">
            {upcomingAssessments.map((assessment) => (
              <li key={assessment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-400 truncate">
                      {assessment.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Scheduled
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-zinc-400">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                        {assessment.company}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-zinc-400 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {assessment.duration}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-zinc-400 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{assessment.date}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center text-zinc-400">
            No upcoming assessments.
          </div>
        )}
        <div className="bg-zinc-800 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/candidate/assessments" className="font-medium text-indigo-400 hover:text-indigo-300">
              View all assessments
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 shadow rounded-lg border border-zinc-800 mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Quick Actions</h2>
        </div>
        <div className="border-t border-zinc-800 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Link
                href="/candidate/assessments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View All Assessments
              </Link>
            </div>
            <div>
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 border border-zinc-700 shadow-sm text-sm font-medium rounded-md text-zinc-100 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
