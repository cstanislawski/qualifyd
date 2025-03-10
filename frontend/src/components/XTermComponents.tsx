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
  const loadingAnimationRef = useRef<number | null>(null);
  const podReadyRef = useRef<boolean>(false);

  // Define connectWebSocket as a useCallback to avoid dependency issues
  const connectWebSocket = useCallback((term: XTerm) => {
    console.log('WebSocket connection attempt starting...');

    // Always use the same domain as the page for WebSocket connections
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect directly to the backend terminal endpoint using the correct path
    const wsUrl = `${protocol}//${window.location.host}/ws/terminal/${assessmentId}`;

    console.log('Environment:', process.env.NEXT_PUBLIC_APP_ENV);
    console.log('Page Protocol:', window.location.protocol);
    console.log('Using WebSocket protocol:', protocol);
    console.log('Using WebSocket URL:', wsUrl);
    console.log('Assessment ID:', assessmentId);

    // Start loading animation
    let dots = 1;
    const animateLoading = () => {
      if (!podReadyRef.current) {
        const dotsString = '.'.repeat(dots);
        term.write('\r\x1B[2K'); // Clear the current line
        term.write(`\rProvisioning your environment${dotsString.padEnd(3, ' ')}`);
        dots = (dots % 3) + 1;
        loadingAnimationRef.current = window.setTimeout(animateLoading, 500);
      }
    };
    animateLoading();

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket onopen event fired');
        setIsConnected(true);

        // WebSocket is connected, but we need to wait for data to confirm pod is ready
        // We'll keep the loading animation running until we get real data
      };

      socket.onmessage = (event) => {
        console.log('Received message from server:', event.data);

        // If this is the first message, clear the loading animation and show welcome message
        if (!podReadyRef.current) {
          podReadyRef.current = true;

          // Clear loading animation
          if (loadingAnimationRef.current) {
            clearTimeout(loadingAnimationRef.current);
            loadingAnimationRef.current = null;
          }

          // Clear the current line
          term.write('\r\x1B[2K');

          // Write welcome message
          term.writeln('Connected to terminal.');
          term.writeln('Type commands and press Enter to execute them.');
          term.writeln('');

          // Set up the data handler after pod is ready
          setupTerminalDataHandler(term, socket);
        }

        term.write(event.data);
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);

        // Clear loading animation if it's still running
        if (loadingAnimationRef.current) {
          clearTimeout(loadingAnimationRef.current);
          loadingAnimationRef.current = null;
        }

        term.writeln('\r\nDisconnected from terminal.');
        podReadyRef.current = false;
      };

      socket.onerror = (error) => {
        console.error('WebSocket error occurred:', error);
        setIsConnected(false);

        // Clear loading animation if it's still running
        if (loadingAnimationRef.current) {
          clearTimeout(loadingAnimationRef.current);
          loadingAnimationRef.current = null;
        }

        term.writeln(`\r\nError connecting to terminal server. Please try again later.`);
        podReadyRef.current = false;
      };
    } catch (error) {
      console.error('Error creating WebSocket instance:', error);

      // Clear loading animation if it's still running
      if (loadingAnimationRef.current) {
        clearTimeout(loadingAnimationRef.current);
        loadingAnimationRef.current = null;
      }

      term.writeln(`\r\nFailed to create WebSocket connection: ${error.message}`);
    }
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
        background: '#18181b', // zinc-950 equivalent
        foreground: '#e4e4e7', // zinc-200 equivalent
        cursor: '#a1a1aa',     // zinc-400 equivalent
        selectionBackground: '#3f3f46', // zinc-700 equivalent
        black: '#09090b',      // zinc-950 darker
        red: '#ef4444',        // red-500
        green: '#22c55e',      // green-500
        yellow: '#eab308',     // yellow-500
        blue: '#3b82f6',       // blue-500
        magenta: '#d946ef',    // fuchsia-500
        cyan: '#06b6d4',       // cyan-500
        white: '#f4f4f5',      // zinc-100
        brightBlack: '#27272a', // zinc-800
        brightRed: '#f87171',  // red-400
        brightGreen: '#4ade80',// green-400
        brightYellow: '#facc15',// yellow-400
        brightBlue: '#60a5fa', // blue-400
        brightMagenta: '#e879f9',// fuchsia-400
        brightCyan: '#22d3ee', // cyan-400
        brightWhite: '#fafafa', // zinc-50
      },
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 14,
      letterSpacing: 0,
      lineHeight: 1.2,
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
