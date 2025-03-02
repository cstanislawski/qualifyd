import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "../components/NavLinks";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Qualifyd - Technical Assessment Platform",
  description: "Platform for creating and managing realistic technical assessment environments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-zinc-950 flex flex-col`}>
        <header className="bg-zinc-900 shadow-md border-b border-zinc-800">
          <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-indigo-400">Qualifyd</Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLinks />
                </div>
              </div>
              {/* User menu */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative group">
                  <div>
                    <button className="bg-zinc-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu" aria-expanded="false" aria-haspopup="true">
                      <span className="sr-only">Open user menu</span>
                      <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-zinc-700">
                        <svg className="h-full w-full text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <div
                    className="hidden group-hover:block origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-zinc-800 ring-1 ring-zinc-700 ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700" role="menuitem">Your Profile</Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700" role="menuitem">Settings</Link>
                    <Link href="/logout" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700" role="menuitem">Sign out</Link>
                  </div>
                </div>
              </div>
              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center sm:hidden">
                <button type="button" className="bg-zinc-800 inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
                  <span className="sr-only">Open main menu</span>
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow w-full">
          {children}
        </main>

        <footer className="bg-zinc-900 border-t border-zinc-800">
          <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-zinc-400">
              &copy; {currentYear} Qualifyd. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
