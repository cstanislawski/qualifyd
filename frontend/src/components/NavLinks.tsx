'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/utils/auth';

export default function NavLinks() {
  const pathname = usePathname();
  const { isLoggedIn, isCompanyUser, isCandidate } = useAuth();

  // Public links - always visible
  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/help', label: 'Help' },
  ];

  // Only visible to non-logged-in users
  const nonLoggedInLinks = [
    { href: '/pricing', label: 'Pricing' },
  ];

  // Only visible to logged-in company users
  const companyLinks = [
    { href: '/admin', label: 'Admin' },
    { href: '/team', label: 'Team' },
    { href: '/templates', label: 'Templates' },
    { href: '/environments', label: 'Environments' },
  ];

  // Assessment link is shown to all logged-in users, with label based on user role
  const assessmentLink = {
    href: '/assessments',
    label: isCandidate() ? 'My Assessments' : 'Assessments'
  };

  // Combine links based on authentication status and user role
  let navLinks = [...publicLinks];

  if (!isLoggedIn) {
    navLinks = [...navLinks, ...nonLoggedInLinks];
  } else {
    navLinks = [...navLinks, assessmentLink];

    // Add company-specific links for company users
    if (isCompanyUser()) {
      navLinks = [...navLinks, ...companyLinks];
    }
  }

  return (
    <>
      {navLinks.map((link) => {
        // Check if the current path matches the link's href
        // Special case for home page to avoid matching all paths
        const isActive =
          link.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              isActive
                ? 'border-indigo-500 text-zinc-200'
                : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
