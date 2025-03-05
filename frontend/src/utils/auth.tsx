'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'candidate' | 'admin' | 'editor' | 'viewer' | null;

// User information interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // Add other user properties as needed
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isCompanyUser: () => boolean;
  isCandidate: () => boolean;
  isAdmin: () => boolean;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  isCompanyUser: () => false,
  isCandidate: () => false,
  isAdmin: () => false,
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we're in development mode
  const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'dev';
  console.log('NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
  console.log('isDev:', isDev);

  // Development mode credentials
  const DEV_CREDENTIALS = {
    'candidate@example.com': { password: 'candidate', role: 'candidate' as const, name: 'Candidate', id: '1' },
    'admin@example.com': { password: 'admin', role: 'admin' as const, name: 'Admin', id: '2' },
    'editor@example.com': { password: 'editor', role: 'editor' as const, name: 'Editor', id: '3' },
    'viewer@example.com': { password: 'viewer', role: 'viewer' as const, name: 'Viewer', id: '4' },
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    // In a real app, you would check for a token in localStorage or a cookie
    // and validate it with your backend
    const checkUserAuthentication = async () => {
      try {
        // For demo purposes, we'll use localStorage
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Login attempt:', { email, password, isDev });

      // Always use development mode for now since production is not implemented
      console.log('Using development mode credentials');
      const emailLower = email.toLowerCase();
      const credentials = DEV_CREDENTIALS[emailLower];

      if (credentials && credentials.password === password) {
        const userData = {
          id: credentials.id,
          email: emailLower,
          name: credentials.name,
          role: credentials.role,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return;
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper functions to check user roles
  const isCompanyUser = () => {
    return user?.role === 'admin' || user?.role === 'editor' || user?.role === 'viewer';
  };

  const isCandidate = () => {
    return user?.role === 'candidate';
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        isCompanyUser,
        isCandidate,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
