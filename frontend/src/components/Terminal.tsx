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

interface TerminalProps {
  assessmentId: string;
}

export default function Terminal({ assessmentId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

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
              variant={isConnected ? "success" : "destructive"}
              className="font-mono"
            >
              {isConnected ? 'Connected' : 'Disconnected'}
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
          setIsConnected={setIsConnected}
        />
      </div>
    </div>
  );
}
