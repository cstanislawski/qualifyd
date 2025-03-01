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
    // Helper function to send a command to the server
    const sendCommand = (cmd: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          // Explicitly format the command
          const commandToSend = cmd + '\n';
          console.log('Sending command:', JSON.stringify(commandToSend));
          socket.send(commandToSend);
        } catch (e) {
          console.error('Error sending command:', e);
          term.writeln(`\r\nError sending command: ${e}`);
        }
      } else {
        console.error('WebSocket not connected');
        term.writeln('\r\nError: Terminal connection lost. Please refresh the page.');
      }
    };

    // Handle keyboard input from terminal
    term.onData((data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Handle special keys and normal input differently
        if (data === '\r') {
          // Enter key - send the entire buffer to the server
          if (inputBuffer.length > 0) {
            // Store the current command before clearing the buffer
            const commandToSend = inputBuffer;

            // Echo a newline locally
            term.write('\r\n');

            // Send the command to the server - use the stored command, not the potentially cleared buffer
            console.log('Sending command:', commandToSend);
            sendCommand(commandToSend);

            // Now clear the buffer
            setInputBuffer('');
            setCursorPosition(0);
          } else {
            // Empty buffer, just send a newline
            term.write('\r\n');
            sendCommand('');
          }
        } else if (data === '\x03') {
          // Ctrl+C - send SIGINT signal
          socket.send(JSON.stringify({ type: 'signal', signal: 'SIGINT' }));
          // Echo ^C locally
          term.write('^C\r\n');
          setInputBuffer('');
          setCursorPosition(0);
        } else if (data === '\x04') {
          // Ctrl+D - send EOF
          socket.send('\x04');
        } else if (data === '\t') {
          // Tab - send directly for tab completion
          socket.send('\t');
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
