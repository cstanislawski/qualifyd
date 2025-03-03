'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Settings, Trash2 } from 'lucide-react';

// Mock data for environment configurations
const mockEnvironmentConfigs = [
  {
    id: 'env-1',
    name: 'Kubernetes Cluster',
    description: 'Standard Kubernetes environment with common tools pre-installed',
    type: 'kubernetes',
    status: 'active',
    lastUsed: '2023-03-01T10:00:00Z',
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: 'env-2',
    name: 'Linux Server',
    description: 'Ubuntu 22.04 with development tools',
    type: 'linux',
    status: 'active',
    lastUsed: '2023-02-28T14:20:00Z',
    createdAt: '2023-01-10T09:45:00Z',
  },
  {
    id: 'env-3',
    name: 'Docker Environment',
    description: 'Docker environment with multiple containers',
    type: 'docker',
    status: 'active',
    lastUsed: '2023-02-25T11:10:00Z',
    createdAt: '2023-01-05T10:15:00Z',
  },
];

export function EnvironmentConfigList() {
  const [environments] = useState(mockEnvironmentConfigs);

  // Format date to readable format
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Environment Configurations</h2>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>New Environment</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {environments.map((env) => (
          <Card key={env.id} className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{env.name}</CardTitle>
                <Badge variant="outline" className="bg-zinc-800 text-indigo-400 border-indigo-400">
                  {env.type}
                </Badge>
              </div>
              <CardDescription className="text-zinc-400">{env.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-zinc-400 space-y-1">
                <div>Created: {formatDate(env.createdAt)}</div>
                <div>Last used: {formatDate(env.lastUsed)}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button variant="outline" size="sm" className="text-zinc-100">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
