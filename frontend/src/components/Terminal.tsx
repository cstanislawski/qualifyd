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
  const [fontSize, setFontSize] = useState(12); // Default font size is now 12px

  // Font size control handlers
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 20)); // Max font size 20px
    window.dispatchEvent(new CustomEvent('terminal:fontSizeChange', { detail: fontSize + 1 }));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 8)); // Min font size 8px
    window.dispatchEvent(new CustomEvent('terminal:fontSizeChange', { detail: fontSize - 1 }));
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
              variant={isConnected ? "success" : "destructive"}
              className="font-mono"
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Font size controls */}
          <div className="flex items-center border border-zinc-700 rounded-md overflow-hidden">
            <div className="px-2 py-1 bg-zinc-800 flex items-center">
              <span className="text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <text x="6" y="16" fontSize="14" fontWeight="bold">aA</text>
                </svg>
              </span>
            </div>
            <button
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              onClick={decreaseFontSize}
              title="Decrease font size"
            >
              <span className="text-xs font-bold">-</span>
            </button>
            <div className="px-2 py-1 bg-zinc-900 text-zinc-300">
              <span className="text-xs">{fontSize}px</span>
            </div>
            <button
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              onClick={increaseFontSize}
              title="Increase font size"
            >
              <span className="text-xs font-bold">+</span>
            </button>
          </div>
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
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}
