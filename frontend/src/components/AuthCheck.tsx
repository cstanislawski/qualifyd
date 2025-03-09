'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';

interface AuthCheckProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'company' | 'any'; // 'admin', 'company', or 'any' for any authenticated user
  redirectTo?: string;
}

export default function AuthCheck({
  children,
  requiredRole = 'any',
  redirectTo = '/login'
}: AuthCheckProps) {
  const { isLoggedIn, isLoading, isAdmin, isCompanyUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (isLoading) return;

    // Redirect if not logged in
    if (!isLoggedIn) {
      router.push(redirectTo);
      return;
    }

    // Check for required role if specified
    if (requiredRole === 'admin' && !isAdmin()) {
      router.push('/');
      return;
    }

    if (requiredRole === 'company' && !isCompanyUser()) {
      router.push('/');
      return;
    }
  }, [isLoggedIn, isLoading, isAdmin, isCompanyUser, router, requiredRole, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Don't render children if user doesn't have the required role
  if (!isLoggedIn) return null;
  if (requiredRole === 'admin' && !isAdmin()) return null;
  if (requiredRole === 'company' && !isCompanyUser()) return null;

  // Render children if authorized
  return <>{children}</>;
}
