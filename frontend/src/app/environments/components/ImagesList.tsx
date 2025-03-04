'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

// Mock data
const imagesList = [
  {
    id: 'img-1',
    name: 'Ubuntu 24.04',
    description: 'Latest Ubuntu LTS release',
    versions: ['24.04.2', '24.04.1'],
    size: 'Standard',
    type: 'linux',
    lastUsed: '2023-02-28T14:20:00Z',
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: 'img-2',
    name: 'Ubuntu 22.04',
    description: 'Previous Ubuntu LTS release',
    versions: ['22.04.5', '22.04.4'],
    size: 'Standard',
    type: 'linux',
    lastUsed: '2023-02-25T11:10:00Z',
    createdAt: '2022-06-10T09:45:00Z',
  },
  {
    id: 'img-3',
    name: 'Debian 12',
    description: 'Latest Debian stable release',
    versions: ['12.9', '12.8'],
    size: 'Standard',
    type: 'linux',
    lastUsed: '2023-02-20T16:35:00Z',
    createdAt: '2022-11-05T10:15:00Z',
  },
  {
    id: 'img-4',
    name: 'Debian 11',
    description: 'Previous Debian stable release',
    versions: ['11.11', '11.10'],
    size: 'Standard',
    type: 'linux',
    lastUsed: null,
    createdAt: '2022-05-12T11:20:00Z',
  }
];

type PlanType = 'starter' | 'team' | 'enterprise';

export function ImagesList() {
  const [images] = useState(imagesList);
  // Assume current plan is Team
  const currentPlan: PlanType = 'team';
  const [showTooltip, setShowTooltip] = useState(false);

  // Format date for display
  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Get restrictions based on plan
  function getPlanRestrictions() {
    switch(currentPlan) {
      case 'starter':
        return {
          allowedImages: ['Ubuntu'],
          allowedSizes: ['Standard'],
          canImport: false,
          canCreate: false,
        };
      case 'team':
        return {
          allowedImages: ['Ubuntu', 'Debian'],
          allowedSizes: ['Basic', 'Standard', 'Performance'],
          canImport: false,
          canCreate: false,
        };
      case 'enterprise':
        return {
          allowedImages: ['Ubuntu', 'Debian', 'CentOS', 'Fedora', 'Alpine', 'Custom'],
          allowedSizes: ['Basic', 'Standard', 'Performance', 'Custom'],
          canImport: true,
          canCreate: true,
        };
      default:
        return {
          allowedImages: ['Ubuntu', 'Debian'],
          allowedSizes: ['Standard'],
          canImport: false,
          canCreate: false,
        };
    }
  }

  const planRestrictions = getPlanRestrictions();

  // Custom tooltip implementation
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-100">Images</h2>
        <div
          className="relative inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Button
            disabled={!planRestrictions.canCreate}
            className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 cursor-not-allowed"
          >
            {planRestrictions.canCreate ? (
              <PlusCircle className="h-4 w-4 mr-1" />
            ) : (
              <Lock className="h-4 w-4 mr-1" />
            )}
            New Image
          </Button>
          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 p-2 bg-zinc-800 text-zinc-200 text-xs rounded shadow-lg z-20 whitespace-nowrap">
              This feature is only available to Enterprise plan members
            </div>
          )}
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400 w-[150px]">Name</TableHead>
                <TableHead className="text-zinc-400">Description</TableHead>
                <TableHead className="text-zinc-400">Versions</TableHead>
                <TableHead className="text-zinc-400">Last Used</TableHead>
                <TableHead className="text-zinc-400">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image) => (
                <TableRow key={image.id} className="border-zinc-800 hover:bg-zinc-800">
                  <TableCell className="font-medium text-zinc-100">
                    {image.name}
                  </TableCell>
                  <TableCell className="text-zinc-300">{image.description}</TableCell>
                  <TableCell className="text-zinc-300">
                    {image.versions.join(', ')}
                  </TableCell>
                  <TableCell className="text-zinc-300">{formatDate(image.lastUsed)}</TableCell>
                  <TableCell className="text-zinc-300">{formatDate(image.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Also export with the old name for backwards compatibility
export const CustomImagesList = ImagesList;
