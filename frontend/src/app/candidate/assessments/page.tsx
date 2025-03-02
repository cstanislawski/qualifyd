import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Assessments - Qualifyd',
};

export default function AssessmentsPage() {
  // This would be fetched from an API in a real implementation
  const assessments = [
    {
      id: '123',
      title: 'Kubernetes Troubleshooting Assessment',
      company: 'TechCorp Inc.',
      duration: '90 minutes',
      scheduledDate: 'Tomorrow at 2:30 PM',
      status: 'Scheduled',
      statusColor: 'green',
    },
    {
      id: '456',
      title: 'Linux Server Troubleshooting',
      company: 'DevOps Solutions Ltd.',
      duration: '60 minutes',
      scheduledDate: 'Available until Mar 15, 2025',
      status: 'Available Now',
      statusColor: 'blue',
    },
    {
      id: '789',
      title: 'Docker Compose Challenge',
      company: 'Cloud Innovations Inc.',
      score: '92/100',
      completedDate: 'Completed on Feb 28, 2025',
      status: 'Completed',
      statusColor: 'gray',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">My Assessments</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">View your scheduled and completed technical assessments.</p>
      </div>

      <div className="bg-zinc-900 shadow overflow-hidden rounded-lg border border-zinc-800 mb-8">
        <ul className="divide-y divide-zinc-800">
          {assessments.map((assessment) => (
            <li key={assessment.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <Link href={`/candidate/terminal/${assessment.id}`}>
                        <span className="text-lg font-medium text-zinc-100 truncate hover:text-indigo-400 hover:underline">
                          {assessment.title}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      assessment.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                      assessment.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                      'bg-zinc-700 text-zinc-300'
                    }`}>
                      {assessment.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-zinc-400">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {assessment.company}
                    </p>
                    {assessment.duration && (
                      <p className="mt-2 flex items-center text-sm text-zinc-400 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {assessment.duration}
                      </p>
                    )}
                    {assessment.score && (
                      <p className="mt-2 flex items-center text-sm text-zinc-400 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {assessment.score}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-zinc-400 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p>
                      {assessment.scheduledDate || assessment.completedDate}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
