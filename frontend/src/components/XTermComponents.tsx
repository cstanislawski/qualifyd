'use client';

import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface XTermComponentsProps {
  assessmentId: string;
  terminalRef: MutableRefObject<HTMLDivElement | null>;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
}

export default function XTermComponents({
  assessmentId,
  terminalRef,
  setIsConnected
}: XTermComponentsProps) {
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Define connectWebSocket as a useCallback to avoid dependency issues
  const connectWebSocket = useCallback((term: XTerm) => {
    // Connect directly to the backend WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${wsHost}/ws/terminal/${assessmentId}`;
    console.log(`Connecting to WebSocket at: ${wsUrl}`);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      term.writeln('Connected to terminal.');
      term.writeln('Type commands and press Enter to execute them.');
      term.writeln('');

      // Test the connection by sending a ping
      try {
        socket.send(JSON.stringify({ type: 'ping' }));
        console.log('Ping sent to server');
      } catch (e) {
        console.error('Error sending ping:', e);
      }

      // Set up the data handler after socket is connected
      setupTerminalDataHandler(term, socket);
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
  }, [assessmentId, setIsConnected]);

  const setupTerminalDataHandler = (term: XTerm, socket: WebSocket) => {
    // Handle keyboard input from terminal - send each keystroke directly to the server
    term.onData((data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          // Send the raw data directly to the server
          socket.send(JSON.stringify({
            type: 'data',
            data: Array.from(data).map(c => c.charCodeAt(0))
          }));
        } catch (e) {
          console.error('Error sending data to server:', e);
        }
      } else {
        console.error('WebSocket not connected');
      }
    });
  };

  useEffect(() => {
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
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    // Render terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to WebSocket
    connectWebSocket(term);

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit();

        // Send terminal size to server
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && term) {
          const dimensions = { cols: term.cols, rows: term.rows };
          socketRef.current.send(JSON.stringify({ type: 'resize', dimensions }));
        }
      }
    };

    // Handle clear command
    const handleClear = () => {
      if (term) {
        term.clear();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('terminal:clear', handleClear);

    // Initial resize
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('terminal:clear', handleClear);
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (term) {
        term.dispose();
      }
    };
  }, [assessmentId, terminalRef, connectWebSocket]);

  return null; // This component only handles logic, rendering is done by the parent
}
