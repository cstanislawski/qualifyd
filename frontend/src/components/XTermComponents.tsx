'use client';

import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction, useCallback, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { ConnectionStatus } from './Terminal';

interface XTermComponentsProps {
  assessmentId: string;
  terminalRef: MutableRefObject<HTMLDivElement | null>;
  setConnectionStatus: Dispatch<SetStateAction<ConnectionStatus>>;
}

export default function XTermComponents({
  assessmentId,
  terminalRef,
  setConnectionStatus
}: XTermComponentsProps) {
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const loadingAnimationRef = useRef<number | null>(null);
  const podReadyRef = useRef<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get stored session ID on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem(`terminal_session_${assessmentId}`);
      if (storedSessionId) {
        console.log(`Retrieved existing session ID for assessment ${assessmentId}: ${storedSessionId}`);
        setSessionId(storedSessionId);
      }
    }
  }, [assessmentId]);

  // Store session ID when it changes
  useEffect(() => {
    if (sessionId && typeof window !== 'undefined') {
      console.log(`Storing session ID for assessment ${assessmentId}: ${sessionId}`);
      localStorage.setItem(`terminal_session_${assessmentId}`, sessionId);
    }
  }, [assessmentId, sessionId]);

  // Define connectWebSocket as a useCallback to avoid dependency issues
  const connectWebSocket = useCallback((term: XTerm) => {
    console.log('WebSocket connection attempt starting...');

    // Set the status to connecting
    setConnectionStatus('connecting');

    // Always use the same domain as the page for WebSocket connections
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const apiHost = host.replace('app.', 'api.');

    // Construct the WebSocket URL with session ID if available
    let wsUrl = `${protocol}//${apiHost}/ws/terminal/${assessmentId}`;

    // Add session ID if we have one (for reconnection)
    if (sessionId) {
      wsUrl += `?sessionId=${sessionId}`;
      console.log(`Reconnecting to existing session: ${sessionId}`);
    } else {
      console.log('Creating new terminal session');
    }

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

        // Different message for new vs. reconnection
        const message = sessionId
          ? `Reconnecting to your environment${dotsString}`
          : `Provisioning your environment${dotsString}`;

        term.write(`\r${message}`);
        dots = (dots % 3) + 1;
        loadingAnimationRef.current = window.setTimeout(animateLoading, 500);
      }
    };
    // Start the animation immediately
    animateLoading();

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket onopen event fired');
        // Explicitly set status to connecting when WebSocket opens
        setConnectionStatus('connecting');
      };

      socket.onmessage = (event) => {
        console.log('Received message from server:', event.data);

        // First try to parse as JSON
        let isControlMessage = false;
        try {
          const messageData = JSON.parse(event.data);

          // Handle different message types
          if (messageData.type === 'session' && messageData.sessionId) {
            // Store the session ID for reconnection
            setSessionId(messageData.sessionId);
            console.log(`Received session ID from server: ${messageData.sessionId}`);
            isControlMessage = true;
          } else if (messageData.type === 'status') {
            // Handle status updates
            console.log(`Status update: ${messageData.status} - ${messageData.message}`);

            // Only stop the loading animation if we're not in a waiting/provisioning state
            if (messageData.status !== 'waiting' && messageData.status !== 'provisioning') {
              if (loadingAnimationRef.current) {
                clearTimeout(loadingAnimationRef.current);
                loadingAnimationRef.current = null;
              }

              // Clear the current line and display the status message
              term.write('\r\x1B[2K');
              term.write(`\r${messageData.message}`);
            }

            // Update connection status based on backend status
            if (messageData.status === 'provisioning' || messageData.status === 'waiting') {
              // Keep the connection status as 'connecting' during provisioning and waiting
              setConnectionStatus('connecting');
            } else if (messageData.status === 'ready') {
              // Still connecting to SSH when pod is ready
              setConnectionStatus('connecting');
            }

            isControlMessage = true;
          } else if (messageData.type === 'error') {
            // Handle error messages
            console.error(`Server error: ${messageData.message}`);

            // Clear loading animation
            if (loadingAnimationRef.current) {
              clearTimeout(loadingAnimationRef.current);
              loadingAnimationRef.current = null;
            }

            // Display error message
            term.write('\r\x1B[2K'); // Clear current line
            term.writeln(`\r\n\x1b[31mError: ${messageData.message}\x1b[0m`);
            term.writeln('Please try again later or contact support if the issue persists.');

            setConnectionStatus('disconnected');
            podReadyRef.current = false;
            isControlMessage = true;
          }
        } catch {
          // Not a JSON message, will be treated as terminal output
        }

        // If it's a control message, don't process further
        if (isControlMessage) {
          return;
        }

        // If this is the first data message (not control), initialize the terminal
        if (!podReadyRef.current) {
          podReadyRef.current = true;

          // Set status to connected after the pod is ready
          setConnectionStatus('connected');

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

        // Write data to the terminal
        term.write(event.data);
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnectionStatus('disconnected');

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
        setConnectionStatus('disconnected');

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
      setConnectionStatus('disconnected');

      // Clear loading animation if it's still running
      if (loadingAnimationRef.current) {
        clearTimeout(loadingAnimationRef.current);
        loadingAnimationRef.current = null;
      }

      term.writeln(`\r\nFailed to create WebSocket connection: ${error.message}`);
    }
  }, [assessmentId, setConnectionStatus, sessionId]);

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
