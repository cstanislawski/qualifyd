'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: 'Senior DevOps Engineer with 8+ years of experience in cloud infrastructure and containerization.',
    company: 'Tech Innovations Inc.',
    position: 'Senior DevOps Engineer',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    twitter: '@devops_pro',
    github: 'devops_pro',
    linkedin: 'in/devops-professional',
  });

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Load user data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [isLoggedIn, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    console.log('Profile data to update:', profileData);
    setIsEditing(false);
    // Show a success message or handle errors
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Profile</h3>
            <p className="mt-1 text-sm text-zinc-400">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-5">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center">
                          <svg className="h-10 w-10 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-zinc-100">{profileData.name}</h2>
                      <p className="text-sm text-zinc-400">{profileData.email}</p>
                      <p className="text-sm text-zinc-500">{profileData.position} at {profileData.company}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-auto inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="border-t border-zinc-800 pt-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-zinc-500">Bio</dt>
                        <dd className="mt-1 text-sm text-zinc-300">{profileData.bio}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Location</dt>
                        <dd className="mt-1 text-sm text-zinc-300">{profileData.location}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Website</dt>
                        <dd className="mt-1 text-sm text-zinc-300">
                          <a href={profileData.website} className="text-indigo-400 hover:text-indigo-300" target="_blank" rel="noopener noreferrer">
                            {profileData.website}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">Twitter</dt>
                        <dd className="mt-1 text-sm text-zinc-300">{profileData.twitter}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">GitHub</dt>
                        <dd className="mt-1 text-sm text-zinc-300">{profileData.github}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-zinc-500">LinkedIn</dt>
                        <dd className="mt-1 text-sm text-zinc-300">{profileData.linkedin}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="photo" className="block text-sm font-medium text-zinc-400">
                        Photo
                      </label>
                      <div className="mt-2 flex items-center space-x-5">
                        <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center">
                          <svg className="h-10 w-10 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-400">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-zinc-400">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={profileData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-zinc-400">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        id="position"
                        value={profileData.position}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-zinc-400">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={profileData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-2 text-sm text-zinc-500">
                        Brief description about yourself or your role.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-zinc-400">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-zinc-400">
                        Website
                      </label>
                      <input
                        type="text"
                        name="website"
                        id="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-zinc-400">
                          Twitter
                        </label>
                        <input
                          type="text"
                          name="twitter"
                          id="twitter"
                          value={profileData.twitter}
                          onChange={handleInputChange}
                          className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="github" className="block text-sm font-medium text-zinc-400">
                          GitHub
                        </label>
                        <input
                          type="text"
                          name="github"
                          id="github"
                          value={profileData.github}
                          onChange={handleInputChange}
                          className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-400">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          name="linkedin"
                          id="linkedin"
                          value={profileData.linkedin}
                          onChange={handleInputChange}
                          className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 text-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-zinc-700 shadow-sm text-sm font-medium rounded-md text-zinc-300 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-8">
          <div className="border-t border-zinc-800" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Account Security</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your password and account security settings.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-zinc-200">Update Password</h3>
                  <div className="mt-2 max-w-xl text-sm text-zinc-400">
                    <p>
                      Ensure your account is using a strong password to stay secure.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-md font-medium text-zinc-200">Two-Factor Authentication</h3>
                  <div className="mt-2 max-w-xl text-sm text-zinc-400">
                    <p>
                      Add additional security to your account by enabling two-factor authentication.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-md font-medium text-zinc-200">Sessions</h3>
                  <div className="mt-2 max-w-xl text-sm text-zinc-400">
                    <p>
                      Manage and log out your active sessions on other browsers and devices.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Manage Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
