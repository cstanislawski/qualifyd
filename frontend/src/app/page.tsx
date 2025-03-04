'use client';

import Link from 'next/link';
import RolesCarousel from '../components/RolesCarousel';

export default function Home() {
  return (
    <>
      {/* Enhanced Hero Section with Animated Elements */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800/50 shadow-xl">
        {/* Animated background mesh */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -inset-[100px] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '15s' }}></div>
          <div className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[80px] animate-pulse" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-[10%] left-[15%] h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[70px] animate-pulse" style={{ animationDuration: '18s' }}></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0icmdiYSg5OSwgMTAyLCAyNDEsIDAuMDgpIiBzdHJva2Utb3BhY2l0eT0iMC40IiBjeD0iMTAiIGN5PSIxMCIgcj0iOSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* Decorative element: Left side line */}
          <div className="absolute left-0 top-1/4 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>

          {/* Decorative element: Right side line */}
          <div className="absolute right-0 top-1/4 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>

          {/* Title with subtle effect */}
          <div className="max-w-3xl mx-auto text-center relative">
            <span className="inline-block text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50 mb-6">Technical Assessment Platform</span>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="relative inline-block">
                <span className="relative z-10">Welcome to</span>
                <span className="absolute -bottom-1.5 left-0 w-full h-[0.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></span>
              </span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">Qualifyd</span>
            </h1>

            <p className="mt-6 text-xl text-zinc-300/90 max-w-2xl mx-auto leading-relaxed">
              The platform for creating and managing realistic technical assessment environments.
            </p>
          </div>

          {/* Cards section with enhanced styling */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-8 overflow-hidden">
              <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-r from-transparent to-indigo-500/50"></div>
              <h2 className="text-xl font-semibold text-zinc-100 mx-4 px-2">
                Place candidates in practical testing scenarios
              </h2>
              <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-l from-transparent to-indigo-500/50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Kubernetes Scenario Card - Enhanced */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></div>
                <div className="relative bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/80 group-hover:border-zinc-600 transition-all overflow-hidden h-full flex flex-col">
                  {/* Removed background pattern */}

                  <div className="flex items-start relative z-10">
                    <div className="relative mr-4">
                      <div className="absolute -inset-1.5 bg-blue-500/20 rounded-lg blur-sm"></div>
                      <div className="bg-zinc-800 relative p-3 rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Kubernetes Configuration</h3>
                      <p className="text-zinc-400">Troubleshoot real-world Kubernetes configuration issues, provision and manage clusters, and apply best practices to maintain resilient infrastructure.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linux Server Card - Enhanced with yellow color */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></div>
                <div className="relative bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/80 group-hover:border-zinc-600 transition-all overflow-hidden h-full flex flex-col">
                  {/* Removed background pattern */}

                  <div className="flex items-start relative z-10">
                    <div className="relative mr-4">
                      <div className="absolute -inset-1.5 bg-yellow-500/20 rounded-lg blur-sm"></div>
                      <div className="bg-zinc-800 relative p-3 rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 16V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2z"></path>
                          <line x1="12" y1="7" x2="12" y2="16"></line>
                          <line x1="7" y1="11.5" x2="17" y2="11.5"></line>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Linux Systems Administration</h3>
                      <p className="text-zinc-400">Configure, optimize, and troubleshoot Linux environments from system performance to service deployment and maintenance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Container Orchestration Card - Updated icon */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></div>
                <div className="relative bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/80 group-hover:border-zinc-600 transition-all overflow-hidden h-full flex flex-col">
                  {/* Removed background pattern */}

                  <div className="flex items-start relative z-10">
                    <div className="relative mr-4">
                      <div className="absolute -inset-1.5 bg-indigo-500/20 rounded-lg blur-sm"></div>
                      <div className="bg-zinc-800 relative p-3 rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="6" height="6" rx="1"></rect>
                          <rect x="16" y="2" width="6" height="6" rx="1"></rect>
                          <rect x="2" y="16" width="6" height="6" rx="1"></rect>
                          <rect x="16" y="16" width="6" height="6" rx="1"></rect>
                          <path d="M5 8v8"></path>
                          <path d="M19 8v8"></path>
                          <path d="M8 5h8"></path>
                          <path d="M8 19h8"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Container Orchestration</h3>
                      <p className="text-zinc-400">Design, deploy, and troubleshoot containerized applications across different container technologies and orchestration systems.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Hardening Card - Enhanced */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></div>
                <div className="relative bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/80 group-hover:border-zinc-600 transition-all overflow-hidden h-full flex flex-col">
                  {/* Removed background pattern */}

                  <div className="flex items-start relative z-10">
                    <div className="relative mr-4">
                      <div className="absolute -inset-1.5 bg-green-500/20 rounded-lg blur-sm"></div>
                      <div className="bg-zinc-800 relative p-3 rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Security Hardening</h3>
                      <p className="text-zinc-400">Identify vulnerabilities and implement best practices to secure systems, networks, and cloud infrastructure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-indigo-400 font-medium opacity-90 bg-indigo-950/30 inline-block px-4 py-2 rounded-full border border-indigo-500/10">
                And many more job-specific technical challenges tailored to your needs
              </p>
            </div>
          </div>

          {/* CTA Button with enhanced style */}
          <div className="mt-14 flex justify-center">
            <div className="relative group">
              {/* Enhanced glow effect with higher opacity and stronger blur */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-lg opacity-80 group-hover:opacity-100 blur-md group-hover:blur-lg transition duration-300 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <Link
                href="/register"
                className="relative flex items-center justify-center px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-lg font-semibold rounded-lg text-white group-hover:from-indigo-500 group-hover:to-purple-500 md:py-5 md:text-xl md:px-12 transition-all duration-300 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40"
              >
                Get started
                <svg className="ml-2 -mr-1 w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Redesigned and moved up */}
      <div className="mt-8 bg-zinc-900/80 overflow-hidden shadow-lg rounded-lg border border-zinc-800 backdrop-blur-sm">
        <div className="px-4 py-8 sm:py-12 sm:px-10 md:px-12 lg:px-16">
          <div className="flex items-center justify-center mb-10">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-indigo-500/50 mr-6"></div>
            <h2 className="text-3xl font-bold text-zinc-100">
              How It Works
            </h2>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-indigo-500/50 ml-6"></div>
          </div>

          <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-0 sm:px-2 md:px-4">
            {/* For Candidates */}
            <div className="relative group transition-all duration-300 transform hover:scale-102 hover:z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur-sm group-hover:opacity-30 group-hover:blur-sm transition duration-300"></div>
              <div className="relative bg-zinc-800/80 rounded-xl p-5 h-full border border-transparent group-hover:border-indigo-500/20 group-hover:shadow-sm group-hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">For Candidates</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  <span className="text-indigo-400 font-medium">Stop solving puzzles. Start showcasing real skills.</span> Qualifyd puts you in environments that mirror actual work, not artificial challenges.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Real environments</span> — Show your skills in the same tools and interfaces you&apos;d use on the job</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Practical challenges</span> — Troubleshoot, solve, and build using industry-standard technologies</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Fair assessment</span> — Be evaluated on what matters: your ability to solve real-world problems</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Meaningful feedback</span> — Receive insights that actually help you grow professionally</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* For Organizations */}
            <div className="relative group transition-all duration-300 transform hover:scale-102 hover:z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur-sm group-hover:opacity-30 group-hover:blur-sm transition duration-300"></div>
              <div className="relative bg-zinc-800/80 rounded-xl p-5 h-full border border-transparent group-hover:border-indigo-500/20 group-hover:shadow-sm group-hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">For Organizations</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  <span className="text-indigo-400 font-medium">Hire for real-world performance, not interview skills.</span> Transform your technical hiring with realistic assessments that reveal true capabilities.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Predictive hiring</span> — Observe candidates performing tasks they&apos;ll actually do on the job</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Secure platform</span> — Multi-tenant isolation with role-based access control for your team</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Flexible plans</span> — Scale resources based on your hiring volume and specific needs</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Analytics dashboard</span> — Track assessment metrics and hiring efficiency across your organization</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* For Hiring Managers */}
            <div className="relative group transition-all duration-300 transform hover:scale-102 hover:z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur-sm group-hover:opacity-30 group-hover:blur-sm transition duration-300"></div>
              <div className="relative bg-zinc-800/80 rounded-xl p-5 h-full border border-transparent group-hover:border-indigo-500/20 group-hover:shadow-sm group-hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">For Hiring Managers</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  <span className="text-indigo-400 font-medium">Craft assessments that truly predict job success.</span> Replace arbitrary coding exercises with meaningful technical challenges.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Custom templates</span> — Design role-specific evaluations that measure relevant skills</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Realistic simulation</span> — Create environments that reflect your actual tech stack</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Scoring automation</span> — Define objective criteria for consistent candidate evaluation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Time efficiency</span> — Reduce screening time while improving assessment quality</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* For Technical Evaluators */}
            <div className="relative group transition-all duration-300 transform hover:scale-102 hover:z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur-sm group-hover:opacity-30 group-hover:blur-sm transition duration-300"></div>
              <div className="relative bg-zinc-800/80 rounded-xl p-5 h-full border border-transparent group-hover:border-indigo-500/20 group-hover:shadow-sm group-hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500/10 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">For Technical Evaluators</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  <span className="text-indigo-400 font-medium">See beyond the code to understand the engineer.</span> Gain unprecedented visibility into a candidate&apos;s problem-solving approach.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Complete visibility</span> — Review every decision and action the candidate makes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Process insight</span> — Understand how candidates approach problems, not just their solutions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Objective metrics</span> — Evaluate performance based on measurable criteria, not subjective opinions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><span className="text-white font-medium">Comparative analysis</span> — Assess candidates against each other using consistent, fair standards</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Carousel Section */}
      <RolesCarousel />
    </>
  );
}
