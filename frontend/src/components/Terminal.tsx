'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// Dynamically import xterm.js components with ssr:false to prevent 'self is not defined' errors
const XTermComponents = dynamic(
  () => import('@/components/XTermComponents'),
  { ssr: false }
);

// Define connection status type
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface TerminalProps {
  assessmentId: string;
}

export default function Terminal({ assessmentId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Get badge variant based on connection status
  const getBadgeVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'disconnected':
      default:
        return 'destructive';
    }
  };

  // Get badge text based on connection status
  const getBadgeText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  // Render only the terminal container in SSR
  return (
    <div className="h-full flex flex-col bg-zinc-900 overflow-hidden">
      <div className="p-2 bg-zinc-800 text-zinc-300 text-sm flex justify-between items-center border-b border-zinc-700">
        <div className="flex items-center gap-4">
          <div>
            <span className="font-mono">Assessment ID: </span>
            <span className="font-mono">{assessmentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge
              variant={getBadgeVariant()}
              className="font-mono"
            >
              {getBadgeText()}
            </Badge>
          </div>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-mono bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
            onClick={() => {
              if (typeof window !== 'undefined') {
                // This will be handled by the client component
                window.dispatchEvent(new CustomEvent('terminal:clear'));
              }
            }}
          >
            Clear
          </Button>
        </div>
      </div>
      {/* Terminal container */}
      <div ref={terminalRef} className="flex-grow">
        {/* Dynamically loaded XTerm components */}
        <XTermComponents
          assessmentId={assessmentId}
          terminalRef={terminalRef}
          setConnectionStatus={setConnectionStatus}
        />
      </div>
    </div>
  );
}
