import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { AuthProvider } from "@/utils/auth";
import UserMenu from "@/components/UserMenu";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Qualifyd - Technical Assessment Platform",
  description: "Platform for creating and managing realistic technical assessments",
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
        <AuthProvider>
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

                {/* User menu component */}
                <UserMenu />

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
        </AuthProvider>
      </body>
    </html>
  );
}
