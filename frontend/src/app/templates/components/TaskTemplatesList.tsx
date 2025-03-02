'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchIcon, PlusIcon, ClipboardCopyIcon, TrashIcon } from '@/components/ui/icons';

// Mock data for task templates
const mockTaskTemplates = [
  {
    id: '1',
    name: 'Kubernetes Deployment',
    description: 'Deploy a simple application to Kubernetes',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    createdBy: 'Jane Smith',
    environment: 'Kubernetes',
    version: 3,
    clonedFrom: null
  },
  {
    id: '2',
    name: 'Database Optimization',
    description: 'Optimize PostgreSQL queries and indexes',
    createdAt: '2023-02-10T08:15:00Z',
    updatedAt: '2023-02-10T08:15:00Z',
    createdBy: 'John Doe',
    environment: 'Linux',
    version: 1,
    clonedFrom: null
  },
  {
    id: '3',
    name: 'Security Hardening',
    description: 'Implement security best practices for a Linux server',
    createdAt: '2023-03-05T16:20:00Z',
    updatedAt: '2023-04-12T11:10:00Z',
    createdBy: 'Michael Johnson',
    environment: 'Linux',
    version: 2,
    clonedFrom: '1'
  }
];

export function TaskTemplatesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(mockTaskTemplates);

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloneTemplate = (templateId: string) => {
    const templateToClone = templates.find(t => t.id === templateId);
    if (!templateToClone) return;

    const newTemplate = {
      ...templateToClone,
      id: (templates.length + 1).toString(),
      name: `${templateToClone.name} (Clone)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      clonedFrom: templateId
    };

    setTemplates([...templates, newTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-md bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/templates/task/new">
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="bg-zinc-800 rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Environment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-zinc-800 divide-y divide-zinc-700">
            {filteredTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-zinc-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">
                        <Link href={`/templates/task/${template.id}`}>{template.name}</Link>
                      </div>
                      <div className="text-sm text-zinc-400">{template.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.environment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  v{template.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.createdBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.clonedFrom ? (
                    <Link href={`/templates/task/${template.clonedFrom}`} className="text-indigo-400 hover:text-indigo-300">
                      Cloned from Template #{template.clonedFrom}
                    </Link>
                  ) : 'Original'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleCloneTemplate(template.id)}
                      className="text-indigo-400 hover:text-indigo-300"
                      title="Clone template"
                    >
                      <ClipboardCopyIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete template"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
