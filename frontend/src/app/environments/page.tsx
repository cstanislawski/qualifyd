'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EnvironmentConfigList } from './components/EnvironmentConfigList';
import { ResourceAllocationList } from './components/ResourceAllocationList';
import { CustomImagesList } from './components/ImagesList';
import { EnvironmentMonitoring } from './components/EnvironmentMonitoring';

export default function EnvironmentsPage() {
  const [activeTab, setActiveTab] = useState('environment-config');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Environments</h1>
      </div>

      <Tabs
        defaultValue="environment-config"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="environment-config">Configuration</TabsTrigger>
          <TabsTrigger value="resource-allocation">Resource Allocation</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="environment-config" className="mt-6">
          <EnvironmentConfigList />
        </TabsContent>

        <TabsContent value="resource-allocation" className="mt-6">
          <ResourceAllocationList />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <CustomImagesList />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <EnvironmentMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
