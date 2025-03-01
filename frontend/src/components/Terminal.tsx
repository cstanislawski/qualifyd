'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  assessmentId: string;
}

export default function Terminal({ assessmentId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inputBuffer, setInputBuffer] = useState('');

  useEffect(() => {
    // Skip initialization during SSR
    if (typeof window === 'undefined') return;

    // Initialize terminal
    if (!terminalRef.current) return;

    // Create terminal instance
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#202124',
        foreground: '#f8f9fa',
        cursor: '#f8f9fa',
      },
    });
    xtermRef.current = term;

    // Set up addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    // Render terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect directly to the backend WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Get WebSocket host from environment variable or fallback to the API host
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;

    // Connect directly to the Go backend WebSocket endpoint
    const socket = new WebSocket(`${protocol}//${wsHost}/ws/terminal/${assessmentId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      term.writeln('Connected to terminal.');
      term.writeln('Type any command and press Enter to execute...');
      term.writeln('');
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onclose = () => {
      setIsConnected(false);
      term.writeln('Disconnected from terminal.');
    };

    socket.onerror = (error) => {
      setIsConnected(false);
      term.writeln(`Error connecting to terminal server. Please try again later.`);
      console.error('WebSocket error:', error);
    };

    // Handle keyboard input from terminal
    term.onData((data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Local echo - show what user is typing
        term.write(data);

        // Check for Enter key (carriage return)
        if (data === '\r') {
          // Send the command to the server
          socket.send(inputBuffer + '\n');
          // Clear the buffer after sending
          setInputBuffer('');
        } else if (data === '\x7F') {
          // Handle backspace - remove last character from buffer
          // and handle the terminal display (move cursor back and clear character)
          if (inputBuffer.length > 0) {
            setInputBuffer(prev => prev.slice(0, -1));
            // Move cursor back, clear character, move cursor back again
            term.write('\b \b');
          }
        } else {
          // Add character to buffer
          setInputBuffer(prev => prev + data);
        }
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();

      // Send terminal size to server
      if (socket && socket.readyState === WebSocket.OPEN) {
        const dimensions = { cols: term.cols, rows: term.rows };
        socket.send(JSON.stringify({ type: 'resize', dimensions }));
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial resize
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [assessmentId, inputBuffer]);

  const handleConnect = () => {
    // Skip if not in browser
    if (typeof window === 'undefined') return;

    if (!isConnected && xtermRef.current) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      const socket = new WebSocket(`${protocol}//${wsHost}/ws/terminal/${assessmentId}`);
      socketRef.current = socket;

      const term = xtermRef.current;

      socket.onopen = () => {
        setIsConnected(true);
        term.writeln('Connected to terminal.');
        term.writeln('Type any command and press Enter to execute...');
        term.writeln('');
      };

      socket.onmessage = (event) => {
        term.write(event.data);
      };

      socket.onclose = () => {
        setIsConnected(false);
        term.writeln('Disconnected from terminal.');
      };

      socket.onerror = (error) => {
        setIsConnected(false);
        term.writeln(`Error connecting to terminal server. Please try again later.`);
        console.error('WebSocket error:', error);
      };
    }
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      setIsConnected(false);
    }
  };

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
          {isConnected ? (
            <button
              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          ) : (
            <button
              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
              onClick={handleConnect}
            >
              Connect
            </button>
          )}
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
            onClick={() => {
              if (xtermRef.current) {
                xtermRef.current.clear();
              }
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-grow" />
    </div>
  );
}
