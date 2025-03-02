import Link from 'next/link';
import RolesCarousel from '../components/RolesCarousel';

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

          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-100 text-center mb-8">
              Place candidates in practical testing scenarios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kubernetes Scenario Card */}
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-indigo-500 transition-all hover:shadow-md hover:shadow-indigo-500/10 group">
                <div className="flex items-start">
                  <div className="bg-indigo-500/10 p-3 rounded-lg mr-4 group-hover:bg-indigo-500/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">Kubernetes Configuration</h3>
                    <p className="text-zinc-400">Troubleshoot real-world Kubernetes configuration issues and apply best practices to resolve them.</p>
                  </div>
                </div>
              </div>

              {/* Linux Server Card */}
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-indigo-500 transition-all hover:shadow-md hover:shadow-indigo-500/10 group">
                <div className="flex items-start">
                  <div className="bg-indigo-500/10 p-3 rounded-lg mr-4 group-hover:bg-indigo-500/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 16V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2z"></path>
                      <line x1="12" y1="7" x2="12" y2="16"></line>
                      <line x1="7" y1="11.5" x2="17" y2="11.5"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">Linux Systems Administration</h3>
                    <p className="text-zinc-400">Configure, optimize, and troubleshoot Linux environments from system performance to service deployment and maintenance.</p>
                  </div>
                </div>
              </div>

              {/* Docker Compose Card */}
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-indigo-500 transition-all hover:shadow-md hover:shadow-indigo-500/10 group">
                <div className="flex items-start">
                  <div className="bg-indigo-500/10 p-3 rounded-lg mr-4 group-hover:bg-indigo-500/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12.5a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 10 12.5a2.5 2.5 0 0 0 2.5 2.5h7a2.5 2.5 0 0 0 2.5-2.5z"></path>
                      <path d="M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                      <path d="M4 15v-3a6 6 0 0 1 6-6h3"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">Container Orchestration</h3>
                    <p className="text-zinc-400">Design, deploy, and troubleshoot containerized applications across different container technologies and orchestration systems.</p>
                  </div>
                </div>
              </div>

              {/* Security Card - Replacing Terraform Card */}
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-indigo-500 transition-all hover:shadow-md hover:shadow-indigo-500/10 group">
                <div className="flex items-start">
                  <div className="bg-indigo-500/10 p-3 rounded-lg mr-4 group-hover:bg-indigo-500/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">Security Hardening</h3>
                    <p className="text-zinc-400">Identify vulnerabilities and implement best practices to secure systems, networks, and cloud infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-indigo-400 font-medium">
                And many more job-specific technical challenges tailored to your needs
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Carousel Section */}
      <RolesCarousel />

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
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Organizations</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">Hire for real-world performance, not interview skills.</span> Transform your technical hiring with realistic assessments that reveal true capabilities.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Predictive hiring</span> — Observe candidates performing tasks they&apos;ll actually do on the job</li>
                <li><span className="text-white font-medium">Secure platform</span> — Multi-tenant isolation with role-based access control for your team</li>
                <li><span className="text-white font-medium">Flexible plans</span> — Scale resources based on your hiring volume and specific needs</li>
                <li><span className="text-white font-medium">Analytics dashboard</span> — Track assessment metrics and hiring efficiency across your organization</li>
              </ul>
            </div>

            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Hiring Managers</div>
              <p className="text-zinc-300 mb-3">
                <span className="text-indigo-400 font-medium">Craft assessments that truly predict job success.</span> Replace arbitrary coding exercises with meaningful technical challenges.
              </p>
              <ul className="list-disc pl-5 text-zinc-300 space-y-2">
                <li><span className="text-white font-medium">Custom templates</span> — Design role-specific evaluations that measure relevant skills</li>
                <li><span className="text-white font-medium">Realistic simulation</span> — Create environments that reflect your actual tech stack</li>
                <li><span className="text-white font-medium">Scoring automation</span> — Define objective criteria for consistent candidate evaluation</li>
                <li><span className="text-white font-medium">Time efficiency</span> — Reduce screening time while improving assessment quality</li>
              </ul>
            </div>

            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="text-xl font-semibold mb-2 text-zinc-100">For Technical Evaluators</div>
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
