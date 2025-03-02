"use client";

import { useEffect, useState } from 'react';

/**
 * A carousel component that cycles through job roles with a fade effect
 * Implements a slow-cycling carousel for displaying different job roles that can be hired for using Qualifyd
 */
export default function RolesCarousel() {
  // List of job roles to display in the carousel
  const roles = [
    'Platform Engineers',
    'DevOps Engineers',
    'Site Reliability Engineers',
    'Infrastructure Engineers',
    'Cloud Engineers',
    'Network Engineers',
    'DevSecOps Engineers',
    'Security Engineers',
    'Database Administrators',
    'System Administrators',
    'Solutions Architects',
    'Software Engineers',
  ];

  // State for the current role index and visibility
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Effect to handle the carousel animation and timing
  useEffect(() => {
    // First fade out the current role
    const fadeOutTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Show each role for 2 seconds before starting fade out

    // Then change to the next role and fade in
    const changeRoleTimeout = setTimeout(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
      setIsVisible(true);
    }, 2500); // 500ms for fade out, then change the role

    // Clean up timeouts on component unmount or role change
    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(changeRoleTimeout);
    };
  }, [currentRoleIndex, roles.length]);

  return (
    <div className="mt-8 bg-zinc-900/80 overflow-hidden shadow-lg rounded-lg border border-zinc-800 backdrop-blur-sm">
      <div className="px-4 py-12 sm:px-6 relative">
        {/* Background gradient decorations */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-indigo-500/50 mr-6"></div>
            <h2 className="text-3xl font-bold text-zinc-100">
              Hire great
            </h2>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-indigo-500/50 ml-6"></div>
          </div>

          <div className="h-20 flex items-center justify-center overflow-hidden">
            <div
              className={`relative text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {roles[currentRoleIndex]}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-500/70 to-purple-500/70 rounded-full"></div>
            </div>
          </div>

          <p className="mt-10 text-zinc-400 max-w-2xl mx-auto text-lg">
            Create real-world technical challenges that accurately assess candidates&apos;
            abilities in infrastructure and engineering roles.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {roles.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentRoleIndex
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 scale-150 shadow-md shadow-indigo-500/20'
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }`}
                onClick={() => {
                  setCurrentRoleIndex(index);
                  setIsVisible(true);
                }}
                aria-label={`Show ${roles[index]}`}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center items-center text-zinc-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Realistic scenarios for technical roles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
