import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold text-zinc-100 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to Qualifyd
            </h1>
            <p className="mt-5 text-xl text-zinc-400">
              The platform for creating and managing realistic technical assessment environments.
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-100">
              Place candidates in practical testing scenarios
            </h2>
            <ul className="mt-4 ml-6 list-disc text-zinc-300">
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
                className="w-full flex items-center justify-center px-8 py-3 border border-zinc-700 text-base font-medium rounded-md text-zinc-100 bg-zinc-800 hover:bg-zinc-700 md:py-4 md:text-lg md:px-10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-800">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Candidates</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">Stop solving puzzles. Start showcasing real skills.</span> Qualifyd puts you in environments that mirror actual work, not artificial challenges.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Real environments</span> — Show your skills in the same tools and interfaces you&apos;d use on the job</li>
                <li><span className="text-white font-medium">Practical challenges</span> — Troubleshoot, solve, and build using industry-standard technologies</li>
                <li><span className="text-white font-medium">Fair assessment</span> — Be evaluated on what matters: your ability to solve real-world problems</li>
                <li><span className="text-white font-medium">Meaningful feedback</span> — Receive insights that actually help you grow professionally</li>
              </ul>
            </div>

            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Companies</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">Hire for real-world performance, not interview skills.</span> See candidates demonstrate exactly what they&apos;ll do in the role.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Predictive hiring</span> — Observe candidates performing tasks they&apos;ll actually do in the job</li>
                <li><span className="text-white font-medium">Reduced risk</span> — Validate skills objectively before making costly hiring decisions</li>
                <li><span className="text-white font-medium">Customizable scenarios</span> — Evaluate candidates in environments that match your tech stack</li>
                <li><span className="text-white font-medium">Data-driven decisions</span> — Make hiring choices based on performance, not gut feeling</li>
              </ul>
            </div>

            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Recruiters</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">Craft assessments that truly predict job success.</span> Replace arbitrary coding exercises with meaningful technical challenges.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Powerful templates</span> — Design multi-stage evaluations that reveal true capabilities</li>
                <li><span className="text-white font-medium">Realistic simulation</span> — Create environments that mimic your production systems</li>
                <li><span className="text-white font-medium">Automatic validation</span> — Let custom scripts objectively measure candidate performance</li>
                <li><span className="text-white font-medium">Total control</span> — Configure every aspect from time limits to environment specifications</li>
              </ul>
            </div>

            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Reviewers</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">See beyond the code to understand the engineer.</span> Gain unprecedented visibility into a candidate&apos;s problem-solving approach.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Complete visibility</span> — Review every command, action, and decision the candidate makes</li>
                <li><span className="text-white font-medium">Process insight</span> — Understand how candidates approach problems, not just their solutions</li>
                <li><span className="text-white font-medium">Objective metrics</span> — Evaluate performance based on measurable criteria, not subjective opinions</li>
                <li><span className="text-white font-medium">Comparative analysis</span> — Assess candidates against each other using consistent, fair standards</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
