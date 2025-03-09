import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - Qualifyd',
};

export default function Pricing() {
  return (
    <>
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800/50 shadow-xl mb-8">
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
            <span className="inline-block text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50 mb-6">Transparent Pricing</span>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="relative inline-block">
                <span className="relative z-10">Choose the</span>
                <span className="absolute -bottom-1.5 left-0 w-full h-[0.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></span>
              </span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
                Right Plan for You
              </span>
            </h1>

            <p className="mt-6 text-xl text-zinc-300/90 max-w-2xl mx-auto leading-relaxed">
              Flexible pricing options designed to match your team&apos;s needs, from startups to enterprises.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-10 overflow-hidden">
          <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-r from-transparent to-indigo-500/50"></div>
          <h2 className="text-2xl font-semibold text-zinc-100 mx-4 px-2">
            Plans & Pricing
          </h2>
          <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-l from-transparent to-indigo-500/50"></div>
        </div>

        {/* Pricing Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Starter Plan */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
              <div className="flex items-baseline text-white">
                <span className="text-3xl font-bold">$100</span>
                <span className="text-zinc-400 ml-2">/month</span>
              </div>
              <p className="mt-4 text-zinc-400">Perfect for small teams beginning with technical assessments</p>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Up to 10 assessments per month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Up to 10 team members</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">5 custom templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">2 concurrent environments</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">900 environment minutes/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Standard machine tier only</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Up to 2 hours environment runtime</span>
                </li>
              </ul>
              <div className="mt-8">
                <button className="w-full py-2 px-4 bg-indigo-600/50 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors duration-300 border border-indigo-400/30">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Team Plan */}
          <div className="bg-zinc-900/70 border border-indigo-500/50 rounded-xl shadow-lg overflow-hidden transform scale-105 z-10 shadow-indigo-500/20">
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-indigo-500 text-white text-xs font-semibold py-1 text-center">MOST RECOMMENDED</div>
            </div>
            <div className="p-6 border-b border-zinc-800 mt-4">
              <h3 className="text-xl font-semibold text-white mb-2">Team</h3>
              <div className="flex items-baseline text-white">
                <span className="text-3xl font-bold">$200</span>
                <span className="text-zinc-400 ml-2">/month</span>
              </div>
              <p className="mt-4 text-zinc-400">Ideal for growing teams with regular assessment needs</p>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Up to 40 assessments per month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Unlimited team members</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">20 custom templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">10 concurrent environments</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">3,600 environment minutes/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">All machine tiers (Basic, Standard, Performance)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Up to 8 hours environment runtime</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Custom machine sizes</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Priority support</span>
                </li>
              </ul>
              <div className="mt-8">
                <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors duration-300 border border-indigo-400/50">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline text-white">
                <span className="text-3xl font-bold">Custom</span>
              </div>
              <p className="mt-4 text-zinc-400">Tailored solutions for large organizations with specific needs</p>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Unlimited assessments</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Unlimited team members</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Unlimited custom templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Configurable environment minutes</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">All machine tiers + custom configurations</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Configurable environment runtime</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">99.9% SLA</span>
                </li>
              </ul>
              <div className="mt-8">
                <button className="w-full py-2 px-4 bg-indigo-600/50 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors duration-300 border border-indigo-400/30">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl shadow-lg overflow-hidden p-8 mb-16">
          <h3 className="text-xl font-semibold text-white mb-6">All Plans Include</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-zinc-300 font-medium mb-2">Basic Templates Library</h4>
              <p className="text-zinc-400 text-sm">Access to our curated collection of assessment templates</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-zinc-300 font-medium mb-2">Candidate Feedback Tools</h4>
              <p className="text-zinc-400 text-sm">Tools to gather and analyze candidate performance data</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-zinc-300 font-medium mb-2">SSO Integration</h4>
              <p className="text-zinc-400 text-sm">Secure single sign-on for your organization</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-zinc-300 font-medium mb-2">Dedicated Support</h4>
              <p className="text-zinc-400 text-sm">Expert assistance for all your assessment needs</p>
            </div>
          </div>
        </div>

        {/* Custom Needs Section */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-xl shadow-lg overflow-hidden p-8 mb-10">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Need a Custom Solution?</h3>
            <p className="text-zinc-300 mb-8">
            The offer doesn&apos;t match your needs? We offer custom solutions for organizations of all sizes. Contact our team to discuss your specific requirements and we&apos;ll tailor a solution that works for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors duration-300">
                Contact
              </button>
              <button className="py-2 px-6 bg-transparent hover:bg-zinc-800 rounded-lg text-white font-medium transition-colors duration-300 border border-zinc-700">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8 overflow-hidden">
            <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-r from-transparent to-indigo-500/50"></div>
            <h2 className="text-2xl font-semibold text-zinc-100 mx-4 px-2">
              Frequently Asked Questions
            </h2>
            <div className="h-[1px] flex-grow max-w-[100px] bg-gradient-to-l from-transparent to-indigo-500/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <h4 className="text-lg font-medium text-white mb-2">What are the available machine tiers?</h4>
              <p className="text-zinc-400">We offer three machine tiers to fit different assessment needs, each consuming minutes at different rates:</p>
              <ul className="mt-2 space-y-2 text-zinc-400 text-sm">
                <li>
                  <span className="font-medium text-zinc-300">Basic:</span> 1 CPU, 2GB RAM, 20GB storage
                  <div className="mt-1">Ideal for simple programming tasks and shell scripting</div>
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Standard:</span> 2 CPU, 4GB RAM, 50GB storage
                  <div className="mt-1">Perfect for general DevOps and containerized applications</div>
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Performance:</span> 4 CPU, 8GB RAM, 80GB storage
                  <div className="mt-1">Optimized for Kubernetes and data processing</div>
                </li>
              </ul>
              <p className="mt-2 text-zinc-400">Starter plans have access to Standard tier only, Team plans can use all three tiers, and Enterprise plans can also create custom configurations.</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <h4 className="text-lg font-medium text-white mb-2">How are environment minutes calculated?</h4>
              <p className="text-zinc-400">Minutes are based on actual environment&apos;s runtime, with machine startup time always free. They&apos;re consumed at rates specific to the tier:</p>
              <ul className="mt-2 space-y-2 text-zinc-400 text-sm">
                <li>
                  <span className="font-medium text-zinc-300">Basic:</span> 0.5× Standard rate
                  <div className="mt-1">30 minutes of usage consumes only 15 minutes from your plan</div>
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Standard:</span> 1.0× (baseline)
                  <div className="mt-1">30 minutes of usage consumes 30 minutes from your plan</div>
                </li>
                <li>
                  <span className="font-medium text-zinc-300">Performance:</span> 2.0× Standard rate
                  <div className="mt-1">30 minutes of usage consumes 60 minutes from your plan</div>
                </li>
              </ul>
              <p className="mt-3 text-zinc-400">The 3 tiers cover all the needs for most assessments. Exceeding your included minutes results in billing at your plan&apos;s overage rate.</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <h4 className="text-lg font-medium text-white mb-2">Can I upgrade my plan at any time?</h4>
              <p className="text-zinc-400">Yes, you can upgrade your plan at any time. The new plan and its benefits will be applied immediately, with prorated billing for the remainder of your billing cycle.</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <h4 className="text-lg font-medium text-white mb-2">What happens if I exceed my environment minutes?</h4>
              <p className="text-zinc-400">If you exceed your included environment minutes, additional usage will be billed at the overage rate specified in your plan. You&apos;ll receive notifications as you approach your limit.</p>
            </div>
          </div>

          {/* Help Center Link Section */}
          <div className="flex flex-col items-center justify-center mt-8 mb-4 text-center">
            <div className="max-w-2xl mx-auto px-4">
              <h3 className="text-xl font-medium text-zinc-100 mb-3">More questions?</h3>
              <p className="text-zinc-400 mb-6">
                Visit our Help Center for detailed information about our plans, features, and more frequently asked questions.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-100 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 font-medium text-sm group"
              >
                Visit Help Center
                <svg
                  className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
