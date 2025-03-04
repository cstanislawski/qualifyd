'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Tag, Upload, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Mock data for custom images
const mockCustomImages = [
  {
    id: 'img-1',
    name: 'Custom Kubernetes',
    description: 'Custom Kubernetes environment with proprietary tools',
    baseImage: 'kubernetes:1.26',
    size: '4.2 GB',
    machineSize: 'Performance',
    status: 'ready',
    createdAt: '2023-02-15T08:30:00Z',
    lastUsed: '2023-03-01T10:00:00Z',
    tags: ['k8s', 'custom', 'production'],
  },
  {
    id: 'img-2',
    name: 'Development Ubuntu',
    description: 'Ubuntu 22.04 with custom development packages',
    baseImage: 'ubuntu:22.04',
    size: '2.8 GB',
    machineSize: 'Standard',
    status: 'ready',
    createdAt: '2023-01-20T14:45:00Z',
    lastUsed: '2023-02-28T09:15:00Z',
    tags: ['ubuntu', 'development'],
  },
  {
    id: 'img-3',
    name: 'Security Testing',
    description: 'Environment for security assessments with scanning tools',
    baseImage: 'kali:latest',
    size: '5.1 GB',
    machineSize: 'Performance',
    status: 'building',
    createdAt: '2023-03-01T16:20:00Z',
    lastUsed: null,
    tags: ['security', 'testing', 'kali'],
  },
];

// Available base images for different plans
const baseImages = {
  starter: ['debian:12', 'ubuntu:22.04'],
  team: ['debian:12', 'ubuntu:22.04'],
  enterprise: ['debian:12', 'ubuntu:22.04', 'alpine:3.18', 'centos:7', 'kali:latest', 'fedora:latest']
};

// Available machine sizes for different plans
const machineSizes = {
  starter: ['Standard'],
  team: ['Basic', 'Standard', 'Performance'],
  enterprise: ['Basic', 'Standard', 'Performance', 'Custom']
};

export function CustomImagesList() {
  const [images] = useState(mockCustomImages);
  // This would come from the user's context/authentication in a real app
  const [currentPlan, setCurrentPlan] = useState<'starter'|'team'|'enterprise'>('starter');
  const [activeTab, setActiveTab] = useState('available-images');

  // Format date to readable format
  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Get text for plan restrictions
  function getPlanRestrictions() {
    switch(currentPlan) {
      case 'starter':
        return "Starter plan allows only Standard machine size with Debian or Ubuntu base images.";
      case 'team':
        return "Team plan allows Basic, Standard, and Performance machine sizes with Debian or Ubuntu base images.";
      case 'enterprise':
        return "Enterprise plan allows all machine sizes (including custom), and all base images.";
      default:
        return "";
    }
  }

  // Check if user has access to a specific machine size
  function hasAccessToSize(size: string) {
    return machineSizes[currentPlan].includes(size);
  }

  // Simulate changing the plan - in a real app, this would be based on the user's subscription
  const handlePlanChange = (plan: 'starter'|'team'|'enterprise') => {
    setCurrentPlan(plan);
  };

  return (
    <div className="space-y-6">
      {/* Demo control panel - would not exist in production */}
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 border-2 border-dashed border-amber-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Demo Controls - Select Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            size="sm"
            variant={currentPlan === 'starter' ? 'default' : 'outline'}
            onClick={() => handlePlanChange('starter')}
          >
            Starter
          </Button>
          <Button
            size="sm"
            variant={currentPlan === 'team' ? 'default' : 'outline'}
            onClick={() => handlePlanChange('team')}
          >
            Team
          </Button>
          <Button
            size="sm"
            variant={currentPlan === 'enterprise' ? 'default' : 'outline'}
            onClick={() => handlePlanChange('enterprise')}
          >
            Enterprise
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Machine Images</h2>
        <div className="flex gap-2">
          {currentPlan === 'enterprise' && (
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Import Image</span>
            </Button>
          )}
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Image</span>
          </Button>
        </div>
      </div>

      <Alert className="bg-zinc-800 border-indigo-500/30 text-zinc-100">
        <InfoIcon className="h-4 w-4 text-indigo-400" />
        <AlertTitle className="text-indigo-400">Plan Restrictions</AlertTitle>
        <AlertDescription className="text-zinc-300">
          {getPlanRestrictions()}
        </AlertDescription>
      </Alert>

      <Tabs
        defaultValue="available-images"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="available-images">Available Images</TabsTrigger>
          <TabsTrigger value="base-images">Base Images</TabsTrigger>
        </TabsList>

        <TabsContent value="available-images" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{image.name}</CardTitle>
                    <Badge variant={image.status === 'ready' ? 'default' : 'outline'}
                      className={image.status === 'ready' ? 'bg-green-600' : 'bg-amber-600 text-zinc-100'}>
                      {image.status === 'ready' ? 'Ready' : 'Building'}
                    </Badge>
                  </div>
                  <CardDescription className="text-zinc-400">{image.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm text-zinc-400 space-y-2">
                    <div><span className="text-zinc-300">Base Image:</span> {image.baseImage}</div>
                    <div><span className="text-zinc-300">Size:</span> {image.size}</div>
                    <div><span className="text-zinc-300">Machine Size:</span>
                      <Badge className={`ml-2 ${hasAccessToSize(image.machineSize) ? 'bg-indigo-600' : 'bg-zinc-700 text-zinc-400'}`}>
                        {image.machineSize}
                      </Badge>
                      {!hasAccessToSize(image.machineSize) && (
                        <span className="ml-2 text-amber-500 text-xs">Not available on your plan</span>
                      )}
                    </div>
                    <div><span className="text-zinc-300">Created:</span> {formatDate(image.createdAt)}</div>
                    <div><span className="text-zinc-300">Last Used:</span> {formatDate(image.lastUsed)}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.tags.map((tag, index) => (
                        <div key={index} className="inline-flex items-center bg-zinc-800 px-2 py-1 rounded-full text-xs">
                          <Tag className="h-3 w-3 mr-1 text-zinc-400" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={image.status !== 'ready' || !hasAccessToSize(image.machineSize)}
                  >
                    Use Image
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="base-images" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseImages[currentPlan].map((image, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{image.split(':')[0]}</CardTitle>
                    <Badge variant="outline" className="bg-zinc-800 text-indigo-400 border-indigo-400">
                      Base Image
                    </Badge>
                  </div>
                  <CardDescription className="text-zinc-400">
                    {image.includes('ubuntu') ? 'Ubuntu Linux distribution' :
                     image.includes('debian') ? 'Debian Linux distribution' :
                     image.includes('alpine') ? 'Alpine Linux (minimal)' :
                     image.includes('centos') ? 'CentOS Linux distribution' :
                     image.includes('fedora') ? 'Fedora Linux distribution' :
                     image.includes('kali') ? 'Kali Linux (security focused)' :
                     'Linux distribution'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm text-zinc-400 space-y-2">
                    <div><span className="text-zinc-300">Tag:</span> {image.split(':')[1]}</div>
                    <div className="pt-2">
                      <span className="text-zinc-300">Available Machine Sizes:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {machineSizes[currentPlan].map((size, idx) => (
                          <Badge key={idx} className="bg-indigo-600">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Create From Base
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
