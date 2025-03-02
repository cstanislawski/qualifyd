import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Qualifyd',
};

export default function Register() {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Or
            <Link href="/login" className="ml-1 font-medium text-indigo-400 hover:text-indigo-300">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-700 placeholder-zinc-500 bg-zinc-800 text-zinc-100 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-700 placeholder-zinc-500 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-700 placeholder-zinc-500 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="sr-only">Confirm password</label>
              <input
                id="password-confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-700 placeholder-zinc-500 bg-zinc-800 text-zinc-100 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm mb-2">
              <input
                type="radio"
                name="account_type"
                value="candidate"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 bg-zinc-800"
                defaultChecked
              />
              <span className="ml-2 text-zinc-300">
                I&apos;m a candidate taking an assessment
              </span>
            </label>
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="account_type"
                value="recruiter"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 bg-zinc-800"
              />
              <span className="ml-2 text-zinc-300">
                I&apos;m a recruiter creating assessments
              </span>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 bg-zinc-800 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-zinc-300">
              I agree to the
              <Link href="/terms" className="mx-1 font-medium text-indigo-400 hover:text-indigo-300">
                Terms of Service
              </Link>
              and
              <Link href="/privacy" className="ml-1 font-medium text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              Create account
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-900 text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div>
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-700">
                <span className="sr-only">Sign up with Google</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.449,1.9-2.153,3.312-4.144,3.312
                  c-2.36,0-4.286-1.928-4.286-4.286c0-2.358,1.926-4.286,4.286-4.286c1.081,0,2.112,0.401,2.913,1.146l2.098-2.307
                  c-1.346-1.238-3.105-1.982-5.01-1.982c-4.12,0-7.429,3.31-7.429,7.429c0,4.119,3.309,7.428,7.429,7.428
                  c4.079,0,7.332-3.158,7.428-7.122l0.003-1.241H14.454C13.399,12.151,12.545,11.296,12.545,12.151z" />
                </svg>
              </a>
            </div>

            <div>
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-700">
                <span className="sr-only">Sign up with GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            <div>
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-zinc-700 rounded-md shadow-sm bg-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-700">
                <span className="sr-only">Sign up with Microsoft</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
