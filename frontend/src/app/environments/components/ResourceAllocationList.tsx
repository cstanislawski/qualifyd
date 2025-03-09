'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Settings, Clock, Play, Trash2, ListFilter, History } from 'lucide-react';

// Mock data for resource allocation
const mockResourceData = {
  summary: {
    total: { cpu: 16, memory: 32, storage: 500 },
    used: { cpu: 9.5, memory: 18.5, storage: 320 },
    available: { cpu: 6.5, memory: 13.5, storage: 180 },
    minutes: {
      total: 3600,
      used: 2150,
      available: 1450
    }
  },
  environments: [
    {
      id: 'env-1',
      name: 'Kubernetes Cluster',
      resources: {
        cpu: 4,
        memory: 8,
        storage: 100,
      },
      minutes: 820,
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
      minutes: 450,
      tier: 'Standard',
      status: 'Running',
    },
    {
      id: 'env-3',
      name: 'Docker Environment',
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      minutes: 580,
      tier: 'Standard',
      status: 'Running',
    },
    {
      id: 'env-4',
      name: 'Cloud Development',
      resources: {
        cpu: 1,
        memory: 2,
        storage: 20,
      },
      minutes: 300,
      tier: 'Basic',
      status: 'Stopped',
    },
  ],
  // Mock data for usage history
  history: [
    {
      id: 'hist-1',
      configId: 'env-1',
      instanceId: 'k8s-cluster-001',
      startTime: '2023-03-01T08:30:00Z',
      endTime: '2023-03-01T13:45:00Z',
      minutes: 315,
      resources: {
        cpu: 4,
        memory: 8,
        storage: 100,
      },
      tier: 'Performance',
    },
    {
      id: 'hist-2',
      configId: 'env-1',
      instanceId: 'k8s-cluster-002',
      startTime: '2023-03-01T14:30:00Z',
      endTime: '2023-03-01T18:15:00Z',
      minutes: 225,
      resources: {
        cpu: 4,
        memory: 8,
        storage: 100,
      },
      tier: 'Performance',
    },
    {
      id: 'hist-3',
      configId: 'env-2',
      instanceId: 'linux-server-001',
      startTime: '2023-03-01T09:00:00Z',
      endTime: '2023-03-01T15:30:00Z',
      minutes: 390,
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      tier: 'Standard',
    },
    {
      id: 'hist-4',
      configId: 'env-3',
      instanceId: 'docker-env-001',
      startTime: '2023-03-01T10:15:00Z',
      endTime: '2023-03-01T19:45:00Z',
      minutes: 570,
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      tier: 'Standard',
    },
    {
      id: 'hist-5',
      configId: 'env-4',
      instanceId: 'cloud-dev-001',
      startTime: '2023-02-28T14:00:00Z',
      endTime: '2023-02-28T19:00:00Z',
      minutes: 300,
      resources: {
        cpu: 1,
        memory: 2,
        storage: 20,
      },
      tier: 'Basic',
    },
    {
      id: 'hist-6',
      configId: 'env-2',
      instanceId: 'linux-server-002',
      startTime: '2023-02-28T08:45:00Z',
      endTime: '2023-02-28T09:30:00Z',
      minutes: 45,
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      tier: 'Standard',
    },
    {
      id: 'hist-7',
      configId: 'env-3',
      instanceId: 'docker-env-002',
      startTime: '2023-02-27T13:20:00Z',
      endTime: '2023-02-27T13:30:00Z',
      minutes: 10,
      resources: {
        cpu: 2,
        memory: 4,
        storage: 50,
      },
      tier: 'Standard',
    },
  ],
  // Mock data for usage over time
  usageHistory: {
    "7d": [
      { date: "2023-02-24", cpu: 8.2, memory: 16.3, storage: 300, minutes: 1800 },
      { date: "2023-02-25", cpu: 8.5, memory: 17.0, storage: 305, minutes: 1900 },
      { date: "2023-02-26", cpu: 8.8, memory: 17.5, storage: 310, minutes: 1950 },
      { date: "2023-02-27", cpu: 9.0, memory: 17.8, storage: 315, minutes: 2000 },
      { date: "2023-02-28", cpu: 9.2, memory: 18.0, storage: 318, minutes: 2050 },
      { date: "2023-03-01", cpu: 9.4, memory: 18.2, storage: 319, minutes: 2100 },
      { date: "2023-03-02", cpu: 9.5, memory: 18.5, storage: 320, minutes: 2150 }
    ],
    "30d": [
      // Would include 30 days of data points
      { date: "2023-02-01", cpu: 6.5, memory: 14.0, storage: 250, minutes: 1300 },
      { date: "2023-02-08", cpu: 7.0, memory: 15.0, storage: 270, minutes: 1500 },
      { date: "2023-02-15", cpu: 8.0, memory: 16.0, storage: 290, minutes: 1700 },
      { date: "2023-02-22", cpu: 9.0, memory: 17.5, storage: 310, minutes: 1950 },
      { date: "2023-03-02", cpu: 9.5, memory: 18.5, storage: 320, minutes: 2150 }
    ],
    "90d": [
      // Would include 90 days of data points
      { date: "2022-12-02", cpu: 5.0, memory: 12.0, storage: 200, minutes: 1000 },
      { date: "2023-01-01", cpu: 6.0, memory: 13.5, storage: 230, minutes: 1200 },
      { date: "2023-01-31", cpu: 7.5, memory: 15.5, storage: 260, minutes: 1600 },
      { date: "2023-02-15", cpu: 8.5, memory: 17.0, storage: 290, minutes: 1900 },
      { date: "2023-03-02", cpu: 9.5, memory: 18.5, storage: 320, minutes: 2150 }
    ]
  }
};

export function ResourceAllocationList() {
  const [resourceData] = useState(mockResourceData);
  const [view, setView] = useState('table');
  const [timeframe, setView2] = useState('7d');
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate the percentage used for minutes
  const minutesPercentage = (resourceData.summary.minutes.used / resourceData.summary.minutes.total) * 100;

  // Format minutes to hours and minutes display
  function formatMinutes(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Format hours for more readable display (35h -> 35h, 60h -> 60h 0m)
  function formatHours(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? minutes + 'm' : '0m'}`;
  }

  // Format ISO date to readable format
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get paginated history items
  const paginatedHistory = resourceData.history.slice(
    (historyPage - 1) * itemsPerPage,
    historyPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Resource Allocation</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 hidden sm:flex items-center gap-3 min-w-[300px]">
            <Clock className="h-4 w-4 text-indigo-400" />
            <div className="flex-1">
              <Progress
                value={minutesPercentage}
                className="h-2 bg-zinc-700"
                indicatorClassName="bg-indigo-500"
              />
            </div>
            <div className="text-sm text-zinc-300 whitespace-nowrap">
              {formatHours(resourceData.summary.minutes.used)} / {formatHours(resourceData.summary.minutes.total)}
              <span className="ml-2 text-indigo-400">{Math.round(minutesPercentage)}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('table')}
              className={view === 'table' ? 'bg-zinc-800' : ''}>
              <ListFilter className="h-4 w-4 mr-1" />
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
      </div>

      {/* Mobile minutes display - only visible on small screens */}
      <div className="flex sm:hidden items-center gap-3">
        <Clock className="h-4 w-4 text-indigo-400" />
        <div className="flex-1">
          <Progress
            value={minutesPercentage}
            className="h-2 bg-zinc-700"
            indicatorClassName="bg-indigo-500"
          />
        </div>
        <div className="text-sm text-zinc-300 whitespace-nowrap">
          {formatHours(resourceData.summary.minutes.used)} / {formatHours(resourceData.summary.minutes.total)}
          <span className="ml-2 text-indigo-400">{Math.round(minutesPercentage)}%</span>
        </div>
      </div>

      {/* Environment Resource Table/Chart View */}
      {view === 'table' ? (
        <div className="space-y-6">
          {/* Summary Table */}
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
                    <TableHead className="text-zinc-400">Minutes Used</TableHead>
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {formatMinutes(env.minutes)}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          env.status === 'Running' ? 'bg-green-500' : 'bg-zinc-500'
                        }`}></span>
                        {env.status}
                      </TableCell>
                      <TableCell>
                        {env.status === 'Running' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-zinc-400 hover:text-red-500 hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-zinc-400 hover:text-green-500 hover:bg-green-950/30"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* History Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                <History className="h-4 w-4" />
                Usage History
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                  disabled={historyPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-zinc-400">
                  Page {historyPage} of {Math.ceil(resourceData.history.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryPage(Math.min(Math.ceil(resourceData.history.length / itemsPerPage), historyPage + 1))}
                  disabled={historyPage >= Math.ceil(resourceData.history.length / itemsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                      <TableHead className="text-zinc-400">Environment</TableHead>
                      <TableHead className="text-zinc-400">Instance ID</TableHead>
                      <TableHead className="text-zinc-400">Start Time</TableHead>
                      <TableHead className="text-zinc-400">End Time</TableHead>
                      <TableHead className="text-zinc-400">Resources</TableHead>
                      <TableHead className="text-zinc-400">Minutes Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.map((history) => {
                      // Find the corresponding environment
                      const env = resourceData.environments.find(e => e.id === history.configId);
                      return (
                        <TableRow key={history.id} className="border-zinc-800 hover:bg-zinc-800">
                          <TableCell className="font-medium text-zinc-100">
                            {env?.name || 'Unknown Environment'}
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            <span className="font-mono text-xs bg-zinc-800 py-0.5 px-1.5 rounded">
                              {history.instanceId}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-300">{formatDate(history.startTime)}</TableCell>
                          <TableCell className="text-zinc-300">{formatDate(history.endTime)}</TableCell>
                          <TableCell className="text-zinc-300">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs">{history.resources.cpu} CPU, {history.resources.memory} GB RAM</span>
                              <span className="text-xs">{history.resources.storage} GB Storage</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-zinc-400" />
                              {formatMinutes(history.minutes)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-medium text-zinc-100">Resource Usage Over Time</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={timeframe === '7d' ? 'primary' : 'outline'}
                onClick={() => setView2('7d')}
              >
                7d
              </Button>
              <Button
                size="sm"
                variant={timeframe === '30d' ? 'primary' : 'outline'}
                onClick={() => setView2('30d')}
              >
                30d
              </Button>
              <Button
                size="sm"
                variant={timeframe === '90d' ? 'primary' : 'outline'}
                onClick={() => setView2('90d')}
              >
                90d
              </Button>
            </div>
          </div>

          <div className="text-center text-zinc-400 p-8 h-[300px] flex items-center justify-center border border-dashed border-zinc-800 rounded-md">
            <div className="max-w-md">
              <p className="mb-4">Resource usage chart for {timeframe} timeframe will be displayed here</p>
              <p className="text-sm text-zinc-500">
                Chart would show the progression of resource usage over the selected time period ({resourceData.usageHistory[timeframe].length} data points).
                First value: {formatMinutes(resourceData.usageHistory[timeframe][0].minutes)} minutes used,
                Latest value: {formatMinutes(resourceData.usageHistory[timeframe][resourceData.usageHistory[timeframe].length-1].minutes)} minutes used.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
