'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// Define proper type interfaces for settings categories
interface NotificationSettings {
  email: boolean;
  browser: boolean;
  slack: boolean;
  assessmentCreated: boolean;
  assessmentCompleted: boolean;
  teamUpdates: boolean;
  reportGenerated: boolean;
  securityAlerts: boolean;
  maintenanceUpdates: boolean;
}

interface AppearanceSettings {
  theme: string;
  codeTheme: string;
  density: string;
  fontSize: string;
}

interface TerminalSettings {
  defaultShell: string;
  fontFamily: string;
  fontSize: number;
  cursorStyle: string;
  cursorBlink: boolean;
  scrollback: number;
}

interface IntegrationSettings {
  github: boolean;
  gitlab: boolean;
  bitbucket: boolean;
  jira: boolean;
  slack: boolean;
  teams: boolean;
}

interface AdvancedSettings {
  apiAccess: boolean;
  betaFeatures: boolean;
  telemetry: boolean;
  autoSave: boolean;
  connectionTimeout: number;
}

interface UserSettings {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  terminal: TerminalSettings;
  integration: IntegrationSettings;
  advanced: AdvancedSettings;
}

export default function SettingsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      browser: true,
      slack: false,
      assessmentCreated: true,
      assessmentCompleted: true,
      teamUpdates: true,
      reportGenerated: true,
      securityAlerts: true,
      maintenanceUpdates: false,
    },
    appearance: {
      theme: 'dark',
      codeTheme: 'dracula',
      density: 'comfortable',
      fontSize: 'medium',
    },
    terminal: {
      defaultShell: 'bash',
      fontFamily: 'monospace',
      fontSize: 14,
      cursorStyle: 'block',
      cursorBlink: true,
      scrollback: 1000,
    },
    integration: {
      github: false,
      gitlab: false,
      bitbucket: false,
      jira: false,
      slack: false,
      teams: false,
    },
    advanced: {
      apiAccess: false,
      betaFeatures: false,
      telemetry: true,
      autoSave: true,
      connectionTimeout: 30,
    },
  });

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn, router]);

  const handleCheckboxChange = (category: keyof UserSettings, setting: string) => {
    setSettings(prev => {
      const categorySettings = { ...prev[category] };
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !categorySettings[setting as keyof typeof categorySettings],
        },
      };
    });
  };

  const handleRadioChange = (category: keyof UserSettings, setting: string, value: string) => {
    setSettings(prev => {
      const categorySettings = { ...prev[category] };
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: value,
        },
      };
    });
  };

  const handleNumberChange = (category: keyof UserSettings, setting: string, value: number) => {
    setSettings(prev => {
      const categorySettings = { ...prev[category] };
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: value,
        },
      };
    });
  };

  const handleSave = () => {
    // In a real app, you would save these settings to the backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Notifications</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Decide which communications you&apos;d like to receive and how.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-base font-medium text-zinc-200">By Email</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-email"
                          name="notifications-email"
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={() => handleCheckboxChange('notifications', 'email')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-email" className="font-medium text-zinc-300">Email notifications</label>
                        <p className="text-zinc-500">Get notified via email for important updates and alerts.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-base font-medium text-zinc-200">Push Notifications</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-browser"
                          name="notifications-browser"
                          type="checkbox"
                          checked={settings.notifications.browser}
                          onChange={() => handleCheckboxChange('notifications', 'browser')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-browser" className="font-medium text-zinc-300">Browser notifications</label>
                        <p className="text-zinc-500">Receive browser notifications when you&apos;re using the application.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-slack"
                          name="notifications-slack"
                          type="checkbox"
                          checked={settings.notifications.slack}
                          onChange={() => handleCheckboxChange('notifications', 'slack')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-slack" className="font-medium text-zinc-300">Slack notifications</label>
                        <p className="text-zinc-500">Get notifications via Slack (requires Slack integration).</p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-base font-medium text-zinc-200">Notification Events</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-assessment-created"
                          name="notifications-assessment-created"
                          type="checkbox"
                          checked={settings.notifications.assessmentCreated}
                          onChange={() => handleCheckboxChange('notifications', 'assessmentCreated')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-assessment-created" className="font-medium text-zinc-300">Assessment Created</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-assessment-completed"
                          name="notifications-assessment-completed"
                          type="checkbox"
                          checked={settings.notifications.assessmentCompleted}
                          onChange={() => handleCheckboxChange('notifications', 'assessmentCompleted')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-assessment-completed" className="font-medium text-zinc-300">Assessment Completed</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications-team-updates"
                          name="notifications-team-updates"
                          type="checkbox"
                          checked={settings.notifications.teamUpdates}
                          onChange={() => handleCheckboxChange('notifications', 'teamUpdates')}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications-team-updates" className="font-medium text-zinc-300">Team Updates</label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-zinc-800"></div>
        </div>
      </div>

      <div className="mt-10 sm:mt-0 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Appearance</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Customize the look and feel of the application.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-base font-medium text-zinc-200">Theme</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="theme-dark"
                        name="theme"
                        type="radio"
                        checked={settings.appearance.theme === 'dark'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'dark')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="theme-dark" className="ml-3 block text-sm font-medium text-zinc-300">
                        Dark
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-light"
                        name="theme"
                        type="radio"
                        checked={settings.appearance.theme === 'light'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'light')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="theme-light" className="ml-3 block text-sm font-medium text-zinc-300">
                        Light
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-system"
                        name="theme"
                        type="radio"
                        checked={settings.appearance.theme === 'system'}
                        onChange={() => handleRadioChange('appearance', 'theme', 'system')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="theme-system" className="ml-3 block text-sm font-medium text-zinc-300">
                        System
                      </label>
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-base font-medium text-zinc-200">Code Theme</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="code-theme-dracula"
                        name="code-theme"
                        type="radio"
                        checked={settings.appearance.codeTheme === 'dracula'}
                        onChange={() => handleRadioChange('appearance', 'codeTheme', 'dracula')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="code-theme-dracula" className="ml-3 block text-sm font-medium text-zinc-300">
                        Dracula
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="code-theme-github"
                        name="code-theme"
                        type="radio"
                        checked={settings.appearance.codeTheme === 'github'}
                        onChange={() => handleRadioChange('appearance', 'codeTheme', 'github')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="code-theme-github" className="ml-3 block text-sm font-medium text-zinc-300">
                        GitHub
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="code-theme-monokai"
                        name="code-theme"
                        type="radio"
                        checked={settings.appearance.codeTheme === 'monokai'}
                        onChange={() => handleRadioChange('appearance', 'codeTheme', 'monokai')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 bg-zinc-800"
                      />
                      <label htmlFor="code-theme-monokai" className="ml-3 block text-sm font-medium text-zinc-300">
                        Monokai
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-zinc-800"></div>
        </div>
      </div>

      <div className="mt-10 sm:mt-0 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Terminal Settings</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Configure your in-browser terminal experience for assessments.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="terminal-shell" className="block text-sm font-medium text-zinc-300">Default Shell</label>
                  <select
                    id="terminal-shell"
                    name="terminal-shell"
                    value={settings.terminal.defaultShell}
                    onChange={(e) => handleRadioChange('terminal', 'defaultShell', e.target.value)}
                    className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-zinc-300"
                  >
                    <option value="bash">Bash</option>
                    <option value="sh">Sh</option>
                    <option value="zsh">Zsh</option>
                    <option value="powershell">PowerShell</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="terminal-font" className="block text-sm font-medium text-zinc-300">Font Family</label>
                  <select
                    id="terminal-font"
                    name="terminal-font"
                    value={settings.terminal.fontFamily}
                    onChange={(e) => handleRadioChange('terminal', 'fontFamily', e.target.value)}
                    className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-zinc-300"
                  >
                    <option value="monospace">Monospace</option>
                    <option value="consolas">Consolas</option>
                    <option value="courier">Courier</option>
                    <option value="source-code-pro">Source Code Pro</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="terminal-fontsize" className="block text-sm font-medium text-zinc-300">Font Size</label>
                  <input
                    type="number"
                    name="terminal-fontsize"
                    id="terminal-fontsize"
                    min="8"
                    max="32"
                    value={settings.terminal.fontSize}
                    onChange={(e) => handleNumberChange('terminal', 'fontSize', parseInt(e.target.value))}
                    className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-zinc-300"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="terminal-scrollback" className="block text-sm font-medium text-zinc-300">Scrollback Lines</label>
                  <input
                    type="number"
                    name="terminal-scrollback"
                    id="terminal-scrollback"
                    min="100"
                    max="10000"
                    value={settings.terminal.scrollback}
                    onChange={(e) => handleNumberChange('terminal', 'scrollback', parseInt(e.target.value))}
                    className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-zinc-300"
                  />
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terminal-cursor-blink"
                        name="terminal-cursor-blink"
                        type="checkbox"
                        checked={settings.terminal.cursorBlink}
                        onChange={() => handleCheckboxChange('terminal', 'cursorBlink')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-zinc-700 rounded bg-zinc-800"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terminal-cursor-blink" className="font-medium text-zinc-300">Cursor Blink</label>
                      <p className="text-zinc-500">Enable cursor blinking in the terminal.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-zinc-800"></div>
        </div>
      </div>

      <div className="mt-10 sm:mt-0 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-zinc-100">Integrations</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Connect with other services and tools.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-zinc-900 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-medium text-zinc-200">GitHub</h3>
                    <p className="text-sm text-zinc-400">Connect your GitHub account to import repositories and share assessments.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Connect
                  </button>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium text-zinc-200">GitLab</h3>
                      <p className="text-sm text-zinc-400">Connect your GitLab account to import repositories and share assessments.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium text-zinc-200">Slack</h3>
                      <p className="text-sm text-zinc-400">Connect your Slack workspace to receive notifications and share results.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium text-zinc-200">Microsoft Teams</h3>
                      <p className="text-sm text-zinc-400">Connect your Microsoft Teams to collaborate and share assessment results.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        {saved && (
          <div className="mr-4 flex items-center text-sm font-medium text-green-500">
            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
