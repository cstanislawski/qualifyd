'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, PlusCircle, Tag, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data for custom images
const mockCustomImages = [
  {
    id: 'img-1',
    name: 'Custom Kubernetes',
    description: 'Custom Kubernetes environment with proprietary tools',
    baseImage: 'kubernetes:1.26',
    size: '4.2 GB',
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
    status: 'building',
    createdAt: '2023-03-01T16:20:00Z',
    lastUsed: null,
    tags: ['security', 'testing', 'kali'],
  },
];

export function CustomImagesList() {
  const [images] = useState(mockCustomImages);
  const [isEnterpriseFeature] = useState(true); // Toggle to false to simulate Enterprise access

  // Format date to readable format
  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // If not on Enterprise plan, show upgrade message
  if (isEnterpriseFeature) {
    return (
      <div className="space-y-6">
        <Alert className="bg-zinc-800 border-amber-500 text-zinc-100">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Enterprise Feature</AlertTitle>
          <AlertDescription className="text-zinc-300">
            Custom machine images are available on the Enterprise plan.
            Please contact sales to upgrade your subscription.
          </AlertDescription>
        </Alert>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Custom Machine Images</CardTitle>
            <CardDescription className="text-zinc-400">
              Create and manage custom machine images with your own software, configurations, and tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-zinc-300">
              <h3 className="font-medium mb-2">Benefits of Custom Images:</h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Tailor environments to your specific tech stack</li>
                <li>Pre-install proprietary tools and software</li>
                <li>Configure security settings to your organization&apos;s standards</li>
                <li>Ensure consistent testing environments</li>
                <li>Reduce environment provisioning time</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              Contact Sales to Upgrade
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Enterprise user view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Custom Machine Images</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Import Image</span>
          </Button>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create New</span>
          </Button>
        </div>
      </div>

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
              <Button variant="outline" size="sm" disabled={image.status !== 'ready'}>
                Use Image
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
