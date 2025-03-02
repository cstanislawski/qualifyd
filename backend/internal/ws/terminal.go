package ws

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/logger"
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

		case terminal := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.terminals[terminal]; ok {
				delete(h.terminals, terminal)
				close(terminal.send)
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
					logger.Info("Terminal disconnected (buffer full)", map[string]interface{}{"assessmentID": terminal.assessmentID})
				}
			}
			h.mu.Unlock()
		}
	}
}

// ServeTerminalWs handles WebSocket connections for terminals
func ServeTerminalWs(hub *TerminalHub, w http.ResponseWriter, r *http.Request, assessmentID string) {
	clientIP := r.RemoteAddr
	logger.Info("Frontend: Initiating a connection to environment", map[string]interface{}{
		"assessmentID": assessmentID,
		"clientIP":     clientIP,
	})

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("Failed to upgrade connection", err, map[string]interface{}{
			"assessmentID": assessmentID,
			"clientIP":     clientIP,
		})
		return
	}

	terminal := &Terminal{
		conn:         conn,
		send:         make(chan []byte, 256),
		assessmentID: assessmentID,
	}

	hub.register <- terminal

	logger.Info("Attempting to connect to SSH server", map[string]interface{}{
		"assessmentID": assessmentID,
	})

	if err := terminal.connectSSH(); err != nil {
		logger.Error("Failed to connect to SSH server", err, map[string]interface{}{
			"assessmentID": assessmentID,
		})
		hub.unregister <- terminal
		conn.Close()
		return
	}

	logger.Info("Successfully connected to SSH server", map[string]interface{}{
		"assessmentID": assessmentID,
	})

	go terminal.readPump(hub)
	go terminal.writePump()

	logger.Info("Terminal connected", map[string]interface{}{
		"assessmentID": assessmentID,
	})
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
	// ECHO: echo input characters (turned on because we're sending raw keystrokes now)
	// ICRNL: translate CR to NL on input (for proper command execution)
	// ISIG: enable signals (Ctrl+C, etc.)
	// ICANON: enable canonical mode (line-by-line input processing)
	modes := ssh.TerminalModes{
		ssh.ECHO:          1, // Echo on - we're now passing raw keystrokes directly
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
					logger.Error("Error reading from stdout", err, nil)
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
					logger.Error("Error reading from stderr", err, nil)
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
		logger.Info("Closing SSH connection", map[string]interface{}{
			"assessmentID": t.assessmentID,
		})
		t.closeSSH()
		hub.unregister <- t
		t.conn.Close()
		logger.Info("Terminal disconnected", map[string]interface{}{
			"assessmentID": t.assessmentID,
		})
	}()

	t.conn.SetReadLimit(maxMessageSize)
	t.conn.SetReadDeadline(time.Now().Add(pongWait))
	t.conn.SetPongHandler(func(string) error {
		// Debug log removed to reduce noise - protocol-level pongs don't need to be logged
		t.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := t.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Error("WebSocket error", err, map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
			} else {
				logger.Info("WebSocket closed", map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
			}
			break
		}

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

		if err := json.Unmarshal(message, &cmd); err == nil {
			// Handle the message based on its type
			switch cmd.Type {
			case "ping":
				logger.Debug("Received ping from client (connection keepalive)")

			case "data":
				// Direct data mode - send raw keystrokes straight to the TTY
				if len(cmd.Data) > 0 && t.stdin != nil {
					bytes := make([]byte, len(cmd.Data))
					for i, code := range cmd.Data {
						bytes[i] = byte(code)
					}
					if _, err := t.stdin.Write(bytes); err != nil {
						logger.Error("Error writing data to terminal", err, map[string]interface{}{
							"assessmentID": t.assessmentID,
						})
					}
				}

			case "resize":
				// Window size has changed - update the PTY size
				if t.sshSession != nil {
					width := cmd.Dimensions.Cols
					height := cmd.Dimensions.Rows
					if width > 0 && height > 0 {
						logger.Info("Resizing terminal", map[string]interface{}{
							"width":        width,
							"height":       height,
							"assessmentID": t.assessmentID,
						})
						err := t.sshSession.WindowChange(height, width)
						if err != nil {
							logger.Error("Failed to resize terminal", err, map[string]interface{}{
								"assessmentID": t.assessmentID,
							})
						}
					}
				}

			case "command":
				// For backward compatibility, handle command messages
				command := cmd.Command
				logger.Info("Executing command in terminal", map[string]interface{}{
					"assessmentID": t.assessmentID,
				})

				// Make sure it ends with a newline for proper execution
				if len(command) > 0 && t.stdin != nil {
					// Normalize line endings
					command = strings.TrimSuffix(command, "\r")
					command = strings.TrimSuffix(command, "\n")
					finalCommand := command + "\n"
					if _, err := t.stdin.Write([]byte(finalCommand)); err != nil {
						logger.Error("Error executing command in terminal", err, map[string]interface{}{
							"assessmentID": t.assessmentID,
						})
					}
				} else if t.stdin != nil {
					// Empty command, just send a newline
					if _, err := t.stdin.Write([]byte("\n")); err != nil {
						logger.Error("Error sending newline to terminal", err, map[string]interface{}{
							"assessmentID": t.assessmentID,
						})
					}
				}

			case "signal":
				if cmd.Signal == "SIGINT" && t.stdin != nil {
					// Send Ctrl+C to the terminal
					logger.Info("Sending SIGINT to terminal", map[string]interface{}{
						"assessmentID": t.assessmentID,
					})
					if _, err := t.stdin.Write([]byte{3}); err != nil {
						logger.Error("Error sending SIGINT to terminal", err, map[string]interface{}{
							"assessmentID": t.assessmentID,
						})
					}
				}
			}
		} else {
			// Handle as a plain text command for backward compatibility
			if t.stdin != nil {
				command := string(message)
				if !strings.HasSuffix(command, "\n") {
					command += "\n"
				}
				if _, err := t.stdin.Write([]byte(command)); err != nil {
					logger.Error("Error sending text command to terminal", err, map[string]interface{}{
						"assessmentID": t.assessmentID,
					})
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
		logger.Info("Closed WebSocket writer", map[string]interface{}{
			"assessmentID": t.assessmentID,
		})
	}()

	for {
		select {
		case message, ok := <-t.send:
			t.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				logger.Info("Hub closed channel", map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
				t.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := t.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				logger.Error("Error getting next writer", err, map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(t.send)
			for i := 0; i < n; i++ {
				w.Write(<-t.send)
			}

			if err := w.Close(); err != nil {
				logger.Error("Error closing writer", err, map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
				return
			}
		case <-ticker.C:
			t.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := t.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				logger.Error("Error sending ping", err, map[string]interface{}{
					"assessmentID": t.assessmentID,
				})
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
