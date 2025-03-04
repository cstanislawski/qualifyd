'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'candidate' | 'company' | 'admin' | null;

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

      // In a real app, you would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login

      // Development mode credentials
      if (isDev) {
        // Development credential mapping - use email/password combinations
        const devCredentials: { [key: string]: UserRole } = {
          'candidate@example.com': 'candidate',
          'admin@example.com': 'company',     // Admin role is just a special company user
          'editor@example.com': 'company',
          'viewer@example.com': 'company',
        };

        // Check if the provided email matches any of our dev credentials
        if (devCredentials[email.toLowerCase()] && password === email.split('@')[0].toLowerCase()) {
          // Generate a suitable name for display
          const username = email.split('@')[0];
          const displayName = username.charAt(0).toUpperCase() + username.slice(1);

          const userData: User = {
            id: Math.random().toString(36).substring(2, 15),
            email,
            name: displayName,
            role: devCredentials[email.toLowerCase()],
          };

          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return;
        }
      }

      // Regular login logic (for production or fallback)
      // Simulating different user roles based on email
      let role: UserRole = 'company';
      if (email.includes('candidate')) {
        role = 'candidate';
      } else if (email.includes('admin')) {
        role = 'admin';
      }

      const userData: User = {
        id: '123',
        email,
        name: email.split('@')[0],
        role,
      };

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
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
    return user?.role === 'company' || user?.role === 'admin';
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
