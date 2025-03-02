'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchIcon, PlusIcon, ClipboardCopyIcon, TrashIcon } from '@/components/ui/icons';

// Mock data for assessment templates
const mockAssessmentTemplates = [
  {
    id: '1',
    name: 'Platform Engineer Assessment',
    description: 'Complete assessment for platform engineering roles',
    createdAt: '2023-01-20T11:30:00Z',
    updatedAt: '2023-03-25T15:45:00Z',
    createdBy: 'Jane Smith',
    taskCount: 4,
    estimatedDuration: '120 minutes',
    version: 2,
    clonedFrom: null
  },
  {
    id: '2',
    name: 'DevOps Engineer Evaluation',
    description: 'Comprehensive evaluation for DevOps engineers',
    createdAt: '2023-02-15T09:15:00Z',
    updatedAt: '2023-02-15T09:15:00Z',
    createdBy: 'John Doe',
    taskCount: 3,
    estimatedDuration: '90 minutes',
    version: 1,
    clonedFrom: null
  },
  {
    id: '3',
    name: 'SRE Assessment (Junior)',
    description: 'Junior-level Site Reliability Engineer assessment',
    createdAt: '2023-03-10T14:20:00Z',
    updatedAt: '2023-04-18T10:10:00Z',
    createdBy: 'Michael Johnson',
    taskCount: 2,
    estimatedDuration: '60 minutes',
    version: 3,
    clonedFrom: '1'
  }
];

export function AssessmentTemplatesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(mockAssessmentTemplates);

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
        <Link href="/templates/assessment/new">
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
                Tasks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Version
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
                        <Link href={`/templates/assessment/${template.id}`}>{template.name}</Link>
                      </div>
                      <div className="text-sm text-zinc-400">{template.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.taskCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.estimatedDuration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  v{template.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                  {template.clonedFrom ? (
                    <Link href={`/templates/assessment/${template.clonedFrom}`} className="text-indigo-400 hover:text-indigo-300">
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
