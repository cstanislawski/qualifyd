'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';

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
    <div className="h-full flex flex-col bg-gray-900 rounded-md overflow-hidden">
      <div className="p-2 bg-gray-800 text-white text-sm flex justify-between items-center">
        <div>
          <span className="font-bold">Assessment ID: </span>
          <span>{assessmentId}</span>
          <span className="ml-4">
            Status:
            <span className={`ml-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
            onClick={() => {
              if (typeof window !== 'undefined') {
                // This will be handled by the client component
                window.dispatchEvent(new CustomEvent('terminal:clear'));
              }
            }}
          >
            Clear
          </button>
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
