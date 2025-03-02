'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/candidate/assessments', label: 'Assessments' },
    { href: '/admin', label: 'Admin' },
    { href: '/team', label: 'Team' }
  ];

  return (
    <>
      {navLinks.map((link) => {
        // Check if the current path matches the link's href
        // Special case for home page to avoid matching all paths
        const isActive =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);

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
