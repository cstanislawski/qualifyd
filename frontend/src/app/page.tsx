import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to Qualifyd
            </h1>
            <p className="mt-5 text-xl text-gray-500">
              The platform for creating and managing realistic technical assessment environments.
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900">
              Place candidates in practical testing scenarios
            </h2>
            <ul className="mt-4 ml-6 list-disc text-gray-600">
              <li className="mt-2">Troubleshooting Kubernetes configuration issues</li>
              <li className="mt-2">Diagnosing and resolving Linux server problems</li>
              <li className="mt-2">Creating docker-compose configurations for new services</li>
              <li className="mt-2">Writing Terraform configurations for cloud infrastructure</li>
              <li className="mt-2">And many more job-specific technical challenges</li>
            </ul>
          </div>

          <div className="mt-12 sm:flex sm:justify-center">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get started
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-xl font-semibold mb-2">For Recruiters</div>
              <p className="text-gray-600">
                Create evaluation paths with multiple testing scenarios. Choose from pre-defined templates or create your own. Set up readiness scripts and automatic scoring checks.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-xl font-semibold mb-2">For Candidates</div>
              <p className="text-gray-600">
                Access a realistic environment through a browser-based terminal. Complete practical tasks that simulate real job responsibilities within a specified time.
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-xl font-semibold mb-2">For Reviewers</div>
              <p className="text-gray-600">
                See everything created by the candidate, including bash history and automatic test results. Get objective insights into candidate capabilities.
              </p>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
