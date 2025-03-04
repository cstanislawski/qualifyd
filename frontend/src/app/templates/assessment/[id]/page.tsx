'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronRightIcon, ClipboardCopyIcon, ClockIcon, HistoryIcon } from '@/components/ui/icons';

// Mock data for an assessment template
const mockAssessmentTemplate = {
  id: '1',
  name: 'Platform Engineer Assessment',
  description: 'Complete assessment for platform engineering roles',
  createdAt: '2023-01-20T11:30:00Z',
  updatedAt: '2023-03-25T15:45:00Z',
  createdBy: 'Jane Smith',
  estimatedDuration: '120 minutes',
  version: 2,
  clonedFrom: null,
  tasks: [
    {
      id: '101',
      name: 'Kubernetes Deployment',
      description: 'Deploy a simple application to Kubernetes',
      estimatedTime: '30 minutes',
      environment: 'Kubernetes',
      dependsOn: []
    },
    {
      id: '102',
      name: 'Database Configuration',
      description: 'Configure a PostgreSQL database with proper indexes and optimizations',
      estimatedTime: '45 minutes',
      environment: 'Linux',
      dependsOn: []
    },
    {
      id: '103',
      name: 'Service Integration',
      description: 'Connect the deployed application to the configured database',
      estimatedTime: '45 minutes',
      environment: 'Kubernetes + Linux',
      dependsOn: ['101', '102']
    }
  ]
};

// Mock data for version history
const mockVersionHistory = [
  {
    version: 2,
    updatedAt: '2023-03-25T15:45:00Z',
    updatedBy: 'Jane Smith',
    changeDescription: 'Added service integration task and rearranged dependency structure'
  },
  {
    version: 1,
    updatedAt: '2023-01-20T11:30:00Z',
    updatedBy: 'Jane Smith',
    changeDescription: 'Initial assessment template creation'
  }
];

export default function AssessmentTemplateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('details');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [template, setTemplate] = useState(mockAssessmentTemplate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [versionHistory, setVersionHistory] = useState(mockVersionHistory);

  // In a real app, you would fetch the template based on the ID
  useEffect(() => {
    // Fetch template data
    // For now using mock data
  }, [id]);

  const handleCloneTemplate = () => {
    // Clone template logic would go here
    alert(`Assessment template "${template.name}" cloned successfully!`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center text-sm text-zinc-400 mb-4">
          <Link href="/templates" className="hover:text-zinc-200">Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <Link href="/templates" className="hover:text-zinc-200">Assessment Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <span className="text-zinc-200">{template.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-zinc-100">{template.name}</h1>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleCloneTemplate}
            >
              <ClipboardCopyIcon className="h-5 w-5 mr-1" />
              Clone
            </Button>
            <Link href={`/templates/assessment/${id}/edit`}>
              <Button>Edit Template</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center mt-2 text-zinc-400">
          <span className="bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-sm mr-3">
            v{template.version}
          </span>
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm mr-4">
            Updated {new Date(template.updatedAt).toLocaleString()}
          </span>
          <span className="text-sm">
            Created by {template.createdBy}
          </span>
        </div>
      </div>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-8">
          <TabsTrigger value="details">Assessment Details</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="bg-zinc-800 rounded-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Description</h2>
            <p className="text-zinc-300 mb-6">{template.description}</p>

            <div className="flex items-center mb-6">
              <ClockIcon className="h-5 w-5 text-zinc-400 mr-2" />
              <h2 className="text-xl font-semibold text-zinc-100">
                Estimated Duration: {template.estimatedDuration}
              </h2>
            </div>

            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Tasks</h2>
            <div className="space-y-4">
              {template.tasks.map((task) => (
                <div key={task.id} className="bg-zinc-700 rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-100">
                        {task.name}
                      </h3>
                      <p className="text-zinc-300 mt-2">{task.description}</p>
                    </div>
                    <div className="bg-zinc-600 text-zinc-200 px-2 py-1 rounded text-sm">
                      {task.estimatedTime}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-600">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-zinc-300 mr-2">Environment:</span>
                        <span className="text-sm bg-zinc-600 text-zinc-200 px-2 py-1 rounded">
                          {task.environment}
                        </span>
                      </div>

                      {task.dependsOn.length > 0 && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-zinc-300 mr-2">Depends on:</span>
                          <div className="flex space-x-1">
                            {task.dependsOn.map(depId => {
                              const depTask = template.tasks.find(t => t.id === depId);
                              return (
                                <span
                                  key={depId}
                                  className="text-sm bg-indigo-800 text-indigo-200 px-2 py-1 rounded"
                                  title={depTask?.name}
                                >
                                  Task {depId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="bg-zinc-800 rounded-md p-6">
            <div className="flex items-center mb-6">
              <HistoryIcon className="h-5 w-5 text-zinc-400 mr-2" />
              <h2 className="text-xl font-semibold text-zinc-100">Version History</h2>
            </div>

            <div className="space-y-6">
              {versionHistory.map((version, index) => (
                <div
                  key={version.version}
                  className={`relative pl-8 ${
                    index < versionHistory.length - 1 ? 'pb-6 border-l-2 border-zinc-700' : ''
                  }`}
                >
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500" />
                  <div className="bg-zinc-700 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="bg-zinc-600 text-zinc-200 px-2 py-1 rounded text-sm mr-3">
                          v{version.version}
                        </span>
                        <span className="text-sm text-zinc-300">
                          {new Date(version.updatedAt).toLocaleString()} by {version.updatedBy}
                        </span>
                      </div>
                      {version.version !== template.version && (
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                          View this version
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-300">{version.changeDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
