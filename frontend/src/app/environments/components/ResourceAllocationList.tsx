'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Settings } from 'lucide-react';

// Mock data for resource allocation
const mockResourceData = {
  summary: {
    total: { cpu: 16, memory: 32, storage: 500 },
    used: { cpu: 9.5, memory: 18.5, storage: 320 },
    available: { cpu: 6.5, memory: 13.5, storage: 180 },
  },
  environments: [
    {
      id: 'env-1',
      name: 'Kubernetes Cluster',
      resources: {
        cpu: 4,
        memory: 8,
        storage: 120,
      },
      tier: 'Performance',
      status: 'Running',
    },
    {
      id: 'env-2',
      name: 'Linux Server',
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      tier: 'Standard',
      status: 'Running',
    },
    {
      id: 'env-3',
      name: 'Docker Environment',
      resources: {
        cpu: 2,
        memory: 4,
        storage: 80,
      },
      tier: 'Standard',
      status: 'Running',
    },
    {
      id: 'env-4',
      name: 'Cloud Development',
      resources: {
        cpu: 1.5,
        memory: 2.5,
        storage: 70,
      },
      tier: 'Basic',
      status: 'Stopped',
    },
  ],
};

export function ResourceAllocationList() {
  const [resourceData] = useState(mockResourceData);
  const [view, setView] = useState('table');

  // Calculate the percentage used for each resource
  const cpuPercentage = (resourceData.summary.used.cpu / resourceData.summary.total.cpu) * 100;
  const memoryPercentage = (resourceData.summary.used.memory / resourceData.summary.total.memory) * 100;
  const storagePercentage = (resourceData.summary.used.storage / resourceData.summary.total.storage) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Resource Allocation</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('table')}
            className={view === 'table' ? 'bg-zinc-800' : ''}>
            <Table className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('chart')}
            className={view === 'chart' ? 'bg-zinc-800' : ''}>
            <BarChart className="h-4 w-4 mr-1" />
            Charts
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Resource Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100 mb-2">
              {resourceData.summary.used.cpu} / {resourceData.summary.total.cpu} cores
            </div>
            <Progress value={cpuPercentage} className="h-2 bg-zinc-700" indicatorClassName="bg-indigo-500" />
            <div className="text-xs text-zinc-400 mt-2">
              {resourceData.summary.available.cpu} cores available
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100 mb-2">
              {resourceData.summary.used.memory} / {resourceData.summary.total.memory} GB
            </div>
            <Progress value={memoryPercentage} className="h-2 bg-zinc-700" indicatorClassName="bg-indigo-500" />
            <div className="text-xs text-zinc-400 mt-2">
              {resourceData.summary.available.memory} GB available
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100 mb-2">
              {resourceData.summary.used.storage} / {resourceData.summary.total.storage} GB
            </div>
            <Progress value={storagePercentage} className="h-2 bg-zinc-700" indicatorClassName="bg-indigo-500" />
            <div className="text-xs text-zinc-400 mt-2">
              {resourceData.summary.available.storage} GB available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Resource Table/Chart View */}
      {view === 'table' ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Environment</TableHead>
                  <TableHead className="text-zinc-400">Tier</TableHead>
                  <TableHead className="text-zinc-400">CPU</TableHead>
                  <TableHead className="text-zinc-400">Memory</TableHead>
                  <TableHead className="text-zinc-400">Storage</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resourceData.environments.map((env) => (
                  <TableRow key={env.id} className="border-zinc-800 hover:bg-zinc-800">
                    <TableCell className="font-medium text-zinc-100">{env.name}</TableCell>
                    <TableCell className="text-zinc-300">{env.tier}</TableCell>
                    <TableCell className="text-zinc-300">{env.resources.cpu} cores</TableCell>
                    <TableCell className="text-zinc-300">{env.resources.memory} GB</TableCell>
                    <TableCell className="text-zinc-300">{env.resources.storage} GB</TableCell>
                    <TableCell className="text-zinc-300">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        env.status === 'Running' ? 'bg-green-500' : 'bg-zinc-500'
                      }`}></span>
                      {env.status}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-400">
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="text-center text-zinc-400 p-8">
            Resource usage charts will be displayed here (visualization component to be implemented)
          </div>
        </Card>
      )}
    </div>
  );
}
