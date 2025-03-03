'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCcw, Settings, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock data for environment monitoring
const mockMonitoringData = {
  summary: {
    healthy: 5,
    degraded: 1,
    unhealthy: 0,
    utilization: 68,
    uptime: 99.98,
  },
  environments: [
    {
      id: 'env-1',
      name: 'Kubernetes Cluster',
      status: 'healthy',
      uptime: 99.99,
      lastCheck: '2023-03-02T09:45:00Z',
      responseTime: 250,
      cpu: 62,
      memory: 58,
      issues: [],
    },
    {
      id: 'env-2',
      name: 'Linux Server',
      status: 'healthy',
      uptime: 100,
      lastCheck: '2023-03-02T09:48:00Z',
      responseTime: 120,
      cpu: 35,
      memory: 42,
      issues: [],
    },
    {
      id: 'env-3',
      name: 'Docker Environment',
      status: 'degraded',
      uptime: 98.5,
      lastCheck: '2023-03-02T09:47:30Z',
      responseTime: 780,
      cpu: 86,
      memory: 72,
      issues: ['High resource utilization', 'Slow response time'],
    },
    {
      id: 'env-4',
      name: 'Cloud Development',
      status: 'healthy',
      uptime: 99.97,
      lastCheck: '2023-03-02T09:46:15Z',
      responseTime: 180,
      cpu: 28,
      memory: 45,
      issues: [],
    },
    {
      id: 'env-5',
      name: 'Testing Environment',
      status: 'healthy',
      uptime: 100,
      lastCheck: '2023-03-02T09:44:45Z',
      responseTime: 200,
      cpu: 40,
      memory: 38,
      issues: [],
    },
    {
      id: 'env-6',
      name: 'Security Lab',
      status: 'healthy',
      uptime: 99.95,
      lastCheck: '2023-03-02T09:43:30Z',
      responseTime: 220,
      cpu: 45,
      memory: 52,
      issues: [],
    },
  ],
  incidents: [
    {
      id: 'inc-1',
      environmentId: 'env-3',
      environmentName: 'Docker Environment',
      startTime: '2023-03-01T14:22:00Z',
      endTime: '2023-03-01T15:45:00Z',
      duration: '1h 23m',
      description: 'High CPU utilization causing degraded performance',
      status: 'resolved',
    },
    {
      id: 'inc-2',
      environmentId: 'env-1',
      environmentName: 'Kubernetes Cluster',
      startTime: '2023-02-28T08:15:00Z',
      endTime: '2023-02-28T09:30:00Z',
      duration: '1h 15m',
      description: 'Network connectivity issues between nodes',
      status: 'resolved',
    },
    {
      id: 'inc-3',
      environmentId: 'env-3',
      environmentName: 'Docker Environment',
      startTime: '2023-03-02T08:30:00Z',
      endTime: null,
      duration: 'Ongoing',
      description: 'Memory pressure affecting response times',
      status: 'investigating',
    },
  ],
};

export function EnvironmentMonitoring() {
  const [monitoringData] = useState(mockMonitoringData);
  const [activeTab, setActiveTab] = useState('status');

  // Format date to readable format
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Get status badge color
  function getStatusBadge(status: string) {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-600 hover:bg-green-700">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-600 hover:bg-amber-700">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-600 hover:bg-red-700">Unhealthy</Badge>;
      case 'resolved':
        return <Badge className="bg-green-600 hover:bg-green-700">Resolved</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Investigating</Badge>;
      default:
        return <Badge className="bg-zinc-600 hover:bg-zinc-700">{status}</Badge>;
    }
  }

  // Get response time color
  function getResponseTimeClass(time: number) {
    if (time < 300) return 'text-green-500';
    if (time < 500) return 'text-amber-500';
    return 'text-red-500';
  }

  // Get utilization color
  function getUtilizationClass(percent: number) {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-red-500';
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Environment Monitoring</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-zinc-400">Environment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-zinc-800 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-100">{monitoringData.summary.healthy}</div>
                <div className="text-xs text-zinc-400">Healthy</div>
              </div>
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-zinc-800 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-100">{monitoringData.summary.degraded}</div>
                <div className="text-xs text-zinc-400">Degraded</div>
              </div>
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-zinc-800 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-100">{monitoringData.summary.unhealthy}</div>
                <div className="text-xs text-zinc-400">Unhealthy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-zinc-400">Overall Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-zinc-800 mb-2">
                <Clock className="h-7 w-7 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-zinc-100">{monitoringData.summary.uptime}%</div>
              <div className="text-xs text-zinc-400">Last 30 days</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-zinc-400">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="pt-2">
              <div className="text-3xl font-bold text-zinc-100 text-center mb-2">
                {monitoringData.summary.utilization}%
              </div>
              <Progress
                value={monitoringData.summary.utilization}
                className="h-3 bg-zinc-700"
                indicatorClassName={getUtilizationClass(monitoringData.summary.utilization)}
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-zinc-400">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-zinc-800 mb-2">
                <Activity className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-zinc-100">{monitoringData.incidents.length}</div>
              <div className="text-xs text-zinc-400">Last 7 days</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="status"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="status">Environment Status</TabsTrigger>
          <TabsTrigger value="incidents">Incident History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="text-zinc-400">Environment</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Response Time</TableHead>
                    <TableHead className="text-zinc-400 text-center">CPU</TableHead>
                    <TableHead className="text-zinc-400 text-center">Memory</TableHead>
                    <TableHead className="text-zinc-400">Last Check</TableHead>
                    <TableHead className="text-zinc-400">Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoringData.environments.map((env) => (
                    <TableRow key={env.id} className="border-zinc-800 hover:bg-zinc-800">
                      <TableCell className="font-medium">{env.name}</TableCell>
                      <TableCell>{getStatusBadge(env.status)}</TableCell>
                      <TableCell className={getResponseTimeClass(env.responseTime)}>
                        {env.responseTime} ms
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Progress
                            value={env.cpu}
                            className="h-2 w-16 bg-zinc-700"
                            indicatorClassName={getUtilizationClass(env.cpu)}
                          />
                          <span className="ml-2 text-sm">{env.cpu}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Progress
                            value={env.memory}
                            className="h-2 w-16 bg-zinc-700"
                            indicatorClassName={getUtilizationClass(env.memory)}
                          />
                          <span className="ml-2 text-sm">{env.memory}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">{formatDate(env.lastCheck)}</TableCell>
                      <TableCell>
                        {env.issues.length > 0 ? (
                          <div className="text-red-400 text-sm">
                            {env.issues.map((issue, index) => (
                              <div key={index}>{issue}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-500 text-sm">No issues</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900">
                    <TableHead className="text-zinc-400">Environment</TableHead>
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400">Start Time</TableHead>
                    <TableHead className="text-zinc-400">End Time</TableHead>
                    <TableHead className="text-zinc-400">Duration</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoringData.incidents.map((incident) => (
                    <TableRow key={incident.id} className="border-zinc-800 hover:bg-zinc-800">
                      <TableCell className="font-medium">{incident.environmentName}</TableCell>
                      <TableCell className="max-w-md">{incident.description}</TableCell>
                      <TableCell className="text-zinc-300">{formatDate(incident.startTime)}</TableCell>
                      <TableCell className="text-zinc-300">
                        {incident.endTime ? formatDate(incident.endTime) : '–'}
                      </TableCell>
                      <TableCell className="text-zinc-300">{incident.duration}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
