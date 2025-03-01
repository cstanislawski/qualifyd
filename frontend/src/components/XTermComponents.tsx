'use client';

import { useEffect, useRef, useState, MutableRefObject, Dispatch, SetStateAction, useCallback } from 'react';
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
  const [inputBuffer, setInputBuffer] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Define connectWebSocket as a useCallback to avoid dependency issues
  const connectWebSocket = useCallback((term: XTerm) => {
    // Connect directly to the backend WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const socket = new WebSocket(`${protocol}//${wsHost}/ws/terminal/${assessmentId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      term.writeln('Connected to terminal.');
      term.writeln('Type commands and press Enter to execute them.');
      term.writeln('');

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
    // Handle keyboard input from terminal
    term.onData((data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Handle special keys and normal input differently
        if (data === '\r') {
          // Enter key - send the entire buffer to the server
          if (inputBuffer.length > 0) {
            // Echo a newline locally
            term.write('\r\n');

            // Send the command to the server
            socket.send(inputBuffer + '\r');
            setInputBuffer('');
            setCursorPosition(0);
          } else {
            // Empty buffer, just send a newline
            term.write('\r\n');
            socket.send('\r');
          }
        } else if (data === '\x7F') {
          // Backspace key
          if (cursorPosition > 0) {
            // Remove the character before the cursor
            const newBuffer = inputBuffer.substring(0, cursorPosition - 1) +
                              inputBuffer.substring(cursorPosition);
            setInputBuffer(newBuffer);
            setCursorPosition(prevPos => Math.max(0, prevPos - 1));

            // Echo the backspace (move cursor back, clear character, move cursor back again)
            term.write('\b \b');
          }
        } else if (data === '\u001b[A') {
          // Up arrow - could implement history here
          // For now, just pass to server
          socket.send(data);
        } else if (data === '\u001b[B') {
          // Down arrow - could implement history here
          // For now, just pass to server
          socket.send(data);
        } else if (data === '\u001b[C') {
          // Right arrow - move cursor right if possible
          if (cursorPosition < inputBuffer.length) {
            setCursorPosition(prevPos => prevPos + 1);
            term.write(data); // Echo the cursor movement
          }
        } else if (data === '\u001b[D') {
          // Left arrow - move cursor left if possible
          if (cursorPosition > 0) {
            setCursorPosition(prevPos => prevPos - 1);
            term.write(data); // Echo the cursor movement
          }
        } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
          // Printable character - add to buffer at cursor position
          const newBuffer = inputBuffer.substring(0, cursorPosition) +
                           data +
                           inputBuffer.substring(cursorPosition);
          setInputBuffer(newBuffer);
          setCursorPosition(prevPos => prevPos + 1);

          // Echo the character
          term.write(data);
        } else {
          // Other control characters - pass directly to the server
          socket.send(data);
        }
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
