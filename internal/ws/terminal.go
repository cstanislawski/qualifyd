package ws

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"golang.org/x/crypto/ssh"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 8192
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for now (can be restricted in production)
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Terminal represents a connection to a terminal instance
type Terminal struct {
	// The WebSocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// Assessment ID associated with this terminal
	assessmentID string

	// SSH client connection to the terminal container
	sshClient *ssh.Client

	// SSH session for the terminal
	sshSession *ssh.Session

	// Stdin pipe to the SSH session
	stdin io.WriteCloser

	// Mutex for terminal operations
	mu sync.Mutex
}

// TerminalHub maintains the set of active terminal connections
type TerminalHub struct {
	// Registered terminals
	terminals map[*Terminal]bool

	// Inbound messages from the terminals
	broadcast chan []byte

	// Register requests from the terminals
	register chan *Terminal

	// Unregister requests from terminals
	unregister chan *Terminal

	// Mutex for terminals map
	mu sync.Mutex
}

// NewTerminalHub creates a new terminal hub
func NewTerminalHub() *TerminalHub {
	return &TerminalHub{
		broadcast:  make(chan []byte),
		register:   make(chan *Terminal),
		unregister: make(chan *Terminal),
		terminals:  make(map[*Terminal]bool),
	}
}

// Run starts the terminal hub
func (h *TerminalHub) Run() {
	for {
		select {
		case terminal := <-h.register:
			h.mu.Lock()
			h.terminals[terminal] = true
			h.mu.Unlock()
			log.Printf("Terminal connected for assessment %s", terminal.assessmentID)

		case terminal := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.terminals[terminal]; ok {
				delete(h.terminals, terminal)
				close(terminal.send)
				log.Printf("Terminal disconnected for assessment %s", terminal.assessmentID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			for terminal := range h.terminals {
				select {
				case terminal.send <- message:
				default:
					close(terminal.send)
					delete(h.terminals, terminal)
					log.Printf("Terminal disconnected (buffer full) for assessment %s", terminal.assessmentID)
				}
			}
			h.mu.Unlock()
		}
	}
}

// ServeTerminalWs handles WebSocket connections for terminals
func ServeTerminalWs(hub *TerminalHub, w http.ResponseWriter, r *http.Request, assessmentID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	terminal := &Terminal{
		conn:         conn,
		send:         make(chan []byte, 256),
		assessmentID: assessmentID,
	}

	// Connect to the SSH server in the terminal container
	err = terminal.connectSSH()
	if err != nil {
		log.Printf("Failed to connect to SSH server: %v", err)
		conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("Error connecting to terminal: %v", err)))
		conn.Close()
		return
	}

	hub.register <- terminal

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go terminal.writePump()
	go terminal.readPump(hub)
}

// connectSSH establishes an SSH connection to the terminal container
func (t *Terminal) connectSSH() error {
	// Get SSH connection details from environment variables
	host := getEnv("TERMINAL_HOST", "terminal")
	port := getEnv("TERMINAL_PORT", "22")
	user := getEnv("TERMINAL_USER", "candidate")
	password := getEnv("TERMINAL_PASSWORD", "password")

	// Configure SSH client
	config := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         5 * time.Second,
	}

	// Connect to SSH server
	addr := fmt.Sprintf("%s:%s", host, port)
	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return fmt.Errorf("failed to dial SSH server: %v", err)
	}
	t.sshClient = client

	// Create a new SSH session
	session, err := client.NewSession()
	if err != nil {
		t.sshClient.Close()
		return fmt.Errorf("failed to create SSH session: %v", err)
	}
	t.sshSession = session

	// Set up terminal modes
	// ECHO: echo input characters (turned off because we're echoing locally in the frontend)
	// ICRNL: translate CR to NL on input (for proper command execution)
	// ISIG: enable signals (Ctrl+C, etc.)
	// ICANON: enable canonical mode (line-by-line input processing)
	modes := ssh.TerminalModes{
		ssh.ECHO:          0, // Echo off - we're handling echo in the frontend
		ssh.IGNCR:         0, // Don't ignore CR on input
		ssh.ICRNL:         1, // Map CR to NL on input
		ssh.INLCR:         0, // Don't map NL to CR on input
		ssh.ICANON:        1, // Enable canonical mode
		ssh.ISIG:          1, // Enable signals
		ssh.TTY_OP_ISPEED: 14400,
		ssh.TTY_OP_OSPEED: 14400,
	}

	// Request pseudo-terminal with a larger initial size
	if err := session.RequestPty("xterm", 40, 120, modes); err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to request pty: %v", err)
	}

	// Set up pipes for stdin, stdout, and stderr
	stdin, err := session.StdinPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stdin pipe: %v", err)
	}
	t.stdin = stdin

	stdout, err := session.StdoutPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stdout pipe: %v", err)
	}

	stderr, err := session.StderrPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stderr pipe: %v", err)
	}

	// Start the shell
	if err := session.Shell(); err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to start shell: %v", err)
	}

	// Handle stdout and stderr in separate goroutines
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("Error reading from stdout: %v", err)
				}
				break
			}
			if n > 0 {
				t.send <- buf[:n]
			}
		}
	}()

	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stderr.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("Error reading from stderr: %v", err)
				}
				break
			}
			if n > 0 {
				t.send <- buf[:n]
			}
		}
	}()

	return nil
}

// readPump pumps messages from the WebSocket connection to the hub.
func (t *Terminal) readPump(hub *TerminalHub) {
	defer func() {
		t.closeSSH()
		hub.unregister <- t
		t.conn.Close()
	}()

	t.conn.SetReadLimit(maxMessageSize)
	t.conn.SetReadDeadline(time.Now().Add(pongWait))
	t.conn.SetPongHandler(func(string) error { t.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := t.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// Log the raw message bytes to debug encoding issues
		log.Printf("Raw message bytes: %v", message)

		// Debug log to see what we're receiving as string
		log.Printf("Received message as string: %q", string(message))

		// Parse the message as JSON
		var cmd struct {
			Type       string `json:"type"`
			Command    string `json:"command"`
			Signal     string `json:"signal"`
			Key        string `json:"key"`
			Data       []int  `json:"data"`
			Dimensions struct {
				Cols int `json:"cols"`
				Rows int `json:"rows"`
			} `json:"dimensions"`
		}

		// Default to treating the message as a command
		command := string(message)

		// Try to parse as JSON, but continue if it fails
		// This allows for both JSON and plain text commands
		if err := json.Unmarshal(message, &cmd); err == nil {
			if cmd.Type == "ping" {
				// This is a ping message to test connectivity
				log.Printf("Received ping from client, sending pong response")

				// Respond with a pong message
				pongResponse := []byte(`{"type":"pong"}`)
				t.conn.WriteMessage(websocket.TextMessage, pongResponse)
				continue
			} else if cmd.Type == "command" {
				command = cmd.Command
				log.Printf("Parsed command from JSON: %q", command)
			} else if cmd.Type == "signal" && cmd.Signal == "SIGINT" {
				// Send Ctrl+C to the terminal
				log.Printf("Sending SIGINT to terminal")
				t.stdin.Write([]byte{3})
				continue
			} else if cmd.Type == "resize" {
				// Window size has changed - update the PTY size
				if t.sshSession != nil {
					width := cmd.Dimensions.Cols
					height := cmd.Dimensions.Rows

					if width > 0 && height > 0 {
						log.Printf("Resizing terminal to %dx%d", width, height)
						err := t.sshSession.WindowChange(height, width)
						if err != nil {
							log.Printf("Failed to resize terminal: %v", err)
						}
					}
				}
				continue
			} else if cmd.Type == "special" {
				// Handle special keys
				log.Printf("Received special key: %s", cmd.Key)
				switch cmd.Key {
				case "tab":
					t.stdin.Write([]byte{9}) // Tab character
				case "up_arrow":
					t.stdin.Write([]byte{27, 91, 65}) // ESC [ A
				case "down_arrow":
					t.stdin.Write([]byte{27, 91, 66}) // ESC [ B
				default:
					log.Printf("Unknown special key: %s", cmd.Key)
				}
				continue
			} else if cmd.Type == "control" {
				// Handle raw control characters
				log.Printf("Received control data: %v", cmd.Data)
				if len(cmd.Data) > 0 {
					bytes := make([]byte, len(cmd.Data))
					for i, code := range cmd.Data {
						bytes[i] = byte(code)
					}
					t.stdin.Write(bytes)
				}
				continue
			}
		}

		// Debug log to see what we're receiving
		log.Printf("Final command to execute: %q", command)

		// Send the command to the SSH session
		if t.stdin != nil {
			// Process the command to ensure it's properly formatted for execution
			// Make sure it ends with a newline for proper execution
			if len(command) > 0 {
				// Normalize line endings
				command = strings.TrimSuffix(command, "\r")
				command = strings.TrimSuffix(command, "\n")

				// Always ensure we end with a newline for execution
				finalCommand := command + "\n"

				log.Printf("Sending to SSH: %q", finalCommand)

				bytesWritten, err := t.stdin.Write([]byte(finalCommand))
				if err != nil {
					log.Printf("Error writing to SSH stdin: %v", err)
				} else {
					log.Printf("Successfully wrote %d bytes to SSH stdin", bytesWritten)
				}
			} else {
				// Empty command, just send a newline
				bytesWritten, err := t.stdin.Write([]byte("\n"))
				if err != nil {
					log.Printf("Error writing empty command to SSH stdin: %v", err)
				} else {
					log.Printf("Successfully wrote %d bytes (empty command) to SSH stdin", bytesWritten)
				}
			}
		}
	}
}

// writePump pumps messages from the hub to the WebSocket connection.
func (t *Terminal) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		t.conn.Close()
	}()

	for {
		select {
		case message, ok := <-t.send:
			t.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				t.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := t.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(t.send)
			for i := 0; i < n; i++ {
				w.Write(<-t.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			t.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := t.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// closeSSH closes the SSH session and client
func (t *Terminal) closeSSH() {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.stdin != nil {
		t.stdin.Close()
		t.stdin = nil
	}

	if t.sshSession != nil {
		t.sshSession.Close()
		t.sshSession = nil
	}

	if t.sshClient != nil {
		t.sshClient.Close()
		t.sshClient = nil
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
