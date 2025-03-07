package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/k8s"
	"github.com/cstanislawski/qualifyd/pkg/logger"
	"github.com/gorilla/websocket"
	"golang.org/x/crypto/ssh"
	corev1 "k8s.io/api/core/v1"
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

	// TerminalHub associated with this terminal
	hub *TerminalHub

	// Fixed terminal host (set when using fallback mode)
	terminalHost string
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

	// Kubernetes client for managing terminal pods
	K8sClient *k8s.Client

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
		hub:          hub,
	}

	hub.register <- terminal

	// Provision a terminal pod for the assessment
	err = terminal.provisionPod(r.Context())
	if err != nil {
		logger.Error("Failed to provision terminal pod", err, map[string]interface{}{
			"assessmentID": assessmentID,
		})

		// Send error message to client
		errorMsg := map[string]interface{}{
			"type":    "error",
			"message": fmt.Sprintf("Failed to provision terminal: %v", err),
		}
		errorJSON, _ := json.Marshal(errorMsg)
		terminal.send <- errorJSON

		// Wait a moment before unregistering to allow the error to be sent
		time.Sleep(1 * time.Second)

		hub.unregister <- terminal
		conn.Close()
		return
	}

	logger.Info("Attempting to connect to SSH server in pod", map[string]interface{}{
		"assessmentID": assessmentID,
	})

	if err := terminal.connectSSH(); err != nil {
		logger.Error("Failed to connect to SSH server in pod", err, map[string]interface{}{
			"assessmentID": assessmentID,
		})

		// Send error message to client
		errorMsg := map[string]interface{}{
			"type":    "error",
			"message": fmt.Sprintf("Failed to connect to terminal: %v", err),
		}
		errorJSON, _ := json.Marshal(errorMsg)
		terminal.send <- errorJSON

		// Wait a moment before unregistering to allow the error to be sent
		time.Sleep(1 * time.Second)

		hub.unregister <- terminal
		conn.Close()
		return
	}

	logger.Info("Successfully connected to SSH server in pod", map[string]interface{}{
		"assessmentID": assessmentID,
	})

	go terminal.readPump(hub)
	go terminal.writePump()

	logger.Info("Terminal connected", map[string]interface{}{
		"assessmentID": assessmentID,
	})
}

// provisionPod provisions a terminal pod for the assessment
func (t *Terminal) provisionPod(ctx context.Context) error {
	// Use the K8s client from the hub if available, otherwise try to create a new one
	var k8sClient *k8s.Client
	var err error

	// Attempt to use the hub's client first
	if t.hub != nil && t.hub.K8sClient != nil {
		k8sClient = t.hub.K8sClient
		logger.Info("Using existing Kubernetes client from hub", map[string]interface{}{
			"assessmentID": t.assessmentID,
		})
	} else {
		// Create a new Kubernetes client if the hub's client isn't available
		logger.Info("Hub Kubernetes client not available, attempting to create new client", map[string]interface{}{
			"assessmentID": t.assessmentID,
		})

		k8sClient, err = k8s.NewClient(ctx)
		if err != nil {
			// If we can't create a K8s client, attempt to use environment variables for a fixed host
			logger.Error("Failed to create Kubernetes client, attempting fallback to TERMINAL_HOST", err, map[string]interface{}{
				"assessmentID": t.assessmentID,
			})

			// If TERMINAL_HOST is set, use it instead of a dynamically provisioned pod
			if host := getEnv("TERMINAL_HOST", ""); host != "" {
				logger.Info("Using fixed terminal host", map[string]interface{}{
					"assessmentID": t.assessmentID,
					"host":         host,
				})
				// Set t.terminalHost to use in connectSSH instead of querying for the pod IP
				t.terminalHost = host
				return nil
			}

			return fmt.Errorf("failed to create Kubernetes client and no TERMINAL_HOST provided: %w", err)
		}
	}

	// Try to get existing pod first
	pod, err := k8sClient.GetTerminalPod(ctx, t.assessmentID)
	if err == nil {
		// Pod already exists
		logger.Info("Using existing terminal pod", map[string]interface{}{
			"assessmentID": t.assessmentID,
			"podName":      pod.Name,
		})
		return nil
	}

	// Log the error but continue to create a new pod
	logger.Info("No existing terminal pod found, creating new one", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"error":        err.Error(),
	})

	// Get terminal image from environment or use default
	terminalImage := getEnv("TERMINAL_IMAGE", k8s.DefaultTerminalImage)
	logger.Info("Using terminal image", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"image":        terminalImage,
	})

	// Create pod with retry mechanism
	var retries int = 3
	var retryDelay time.Duration = 2 * time.Second

	for i := 0; i < retries; i++ {
		// Create pod configuration
		config := &k8s.TerminalPodConfig{
			AssessmentID: t.assessmentID,
			Image:        terminalImage,
			CPU:          "100m",
			Memory:       "128Mi",
			Labels: map[string]string{
				"created-by": "qualifyd-backend",
			},
			Annotations: map[string]string{
				"description": "On-demand terminal pod for assessment",
			},
		}

		// Attempt to create the pod
		createdPod, err := k8sClient.CreateTerminalPod(ctx, config)
		if err == nil {
			logger.Info("Terminal pod created successfully", map[string]interface{}{
				"assessmentID": t.assessmentID,
				"podName":      createdPod.Name,
			})
			return nil
		}

		// Log the error
		logger.Error(fmt.Sprintf("Attempt %d/%d: Failed to create terminal pod", i+1, retries),
			err, map[string]interface{}{
				"assessmentID": t.assessmentID,
			})

		// If this isn't the last attempt, wait before retrying
		if i < retries-1 {
			logger.Info(fmt.Sprintf("Retrying in %v...", retryDelay), map[string]interface{}{
				"assessmentID": t.assessmentID,
			})
			time.Sleep(retryDelay)
			// Increase delay for next retry (exponential backoff)
			retryDelay *= 2
		}
	}

	return fmt.Errorf("failed to create terminal pod after %d attempts", retries)
}

// connectSSH establishes an SSH connection to the terminal pod or container
func (t *Terminal) connectSSH() error {
	var host string

	// If t.terminalHost is set, use it directly (fallback mode)
	if t.terminalHost != "" {
		host = t.terminalHost
		logger.Info("Using provided terminal host", map[string]interface{}{
			"assessmentID": t.assessmentID,
			"host":         host,
		})
	} else {
		// Otherwise, try to get the pod IP from Kubernetes
		// Create Kubernetes client
		var k8sClient *k8s.Client
		var err error

		// Use hub's client if available
		if t.hub != nil && t.hub.K8sClient != nil {
			k8sClient = t.hub.K8sClient
		} else {
			// Create a new client if needed
			k8sClient, err = k8s.NewClient(context.Background())
			if err != nil {
				// Try fallback to TERMINAL_HOST if K8s client creation fails
				if host := getEnv("TERMINAL_HOST", ""); host != "" {
					t.terminalHost = host
					logger.Info("Kubernetes client creation failed, falling back to TERMINAL_HOST", map[string]interface{}{
						"assessmentID": t.assessmentID,
						"host":         host,
					})
					host = t.terminalHost
				} else {
					return fmt.Errorf("failed to create Kubernetes client and no TERMINAL_HOST provided: %w", err)
				}
			}
		}

		// If we have a Kubernetes client and no fallback host is set, get the pod IP
		if k8sClient != nil && t.terminalHost == "" {
			// Get terminal pod with retries
			var pod *corev1.Pod
			var retries int = 5
			var retryDelay time.Duration = 2 * time.Second
			var podErr error

			for i := 0; i < retries; i++ {
				pod, podErr = k8sClient.GetTerminalPod(context.Background(), t.assessmentID)
				if podErr == nil {
					break
				}

				logger.Error(fmt.Sprintf("Attempt %d/%d: Failed to get terminal pod", i+1, retries),
					podErr, map[string]interface{}{
						"assessmentID": t.assessmentID,
					})

				// If this isn't the last attempt, wait before retrying
				if i < retries-1 {
					logger.Info(fmt.Sprintf("Retrying in %v...", retryDelay), nil)
					time.Sleep(retryDelay)
					retryDelay *= 2
				} else {
					// Try fallback to TERMINAL_HOST if pod retrieval fails
					if hostEnv := getEnv("TERMINAL_HOST", ""); hostEnv != "" {
						t.terminalHost = hostEnv
						logger.Info("Pod retrieval failed, falling back to TERMINAL_HOST", map[string]interface{}{
							"assessmentID": t.assessmentID,
							"host":         hostEnv,
						})
						host = t.terminalHost
					} else {
						return fmt.Errorf("failed to get terminal pod after %d attempts: %w", retries, podErr)
					}
				}
			}

			// Use the pod IP as the SSH host if we got a pod
			if pod != nil {
				host = pod.Status.PodIP
				if host == "" {
					return fmt.Errorf("terminal pod has no IP address")
				}
			}
		}
	}

	if host == "" {
		return fmt.Errorf("no host available for SSH connection")
	}

	logger.Info("Connecting to terminal", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"host":         host,
	})

	// Get SSH connection details from environment variables
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
		Timeout:         15 * time.Second, // Increased timeout for SSH connection
	}

	// Connect to SSH server with retries
	addr := fmt.Sprintf("%s:%s", host, port)
	var sshClient *ssh.Client
	var sshErr error
	retries := 5
	retryDelay := 2 * time.Second

	for i := 0; i < retries; i++ {
		logger.Info(fmt.Sprintf("SSH connection attempt %d/%d", i+1, retries), map[string]interface{}{
			"assessmentID": t.assessmentID,
			"address":      addr,
		})

		sshClient, sshErr = ssh.Dial("tcp", addr, config)
		if sshErr == nil {
			break
		}

		logger.Error(fmt.Sprintf("Attempt %d/%d: Failed to dial SSH server", i+1, retries),
			sshErr, map[string]interface{}{
				"assessmentID": t.assessmentID,
				"address":      addr,
			})

		// If this isn't the last attempt, wait before retrying
		if i < retries-1 {
			logger.Info(fmt.Sprintf("Retrying SSH connection in %v...", retryDelay), nil)
			time.Sleep(retryDelay)
			retryDelay *= 2
		} else {
			return fmt.Errorf("failed to dial SSH server after %d attempts: %w", retries, sshErr)
		}
	}

	t.sshClient = sshClient

	// Create a new SSH session
	session, err := sshClient.NewSession()
	if err != nil {
		t.sshClient.Close()
		return fmt.Errorf("failed to create SSH session: %w", err)
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
		return fmt.Errorf("failed to request pty: %w", err)
	}

	// Set up pipes for stdin, stdout, and stderr
	stdin, err := session.StdinPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stdin pipe: %w", err)
	}
	t.stdin = stdin

	stdout, err := session.StdoutPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stdout pipe: %w", err)
	}

	stderr, err := session.StderrPipe()
	if err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to get stderr pipe: %w", err)
	}

	// Start shell
	if err := session.Shell(); err != nil {
		session.Close()
		t.sshClient.Close()
		return fmt.Errorf("failed to start shell: %w", err)
	}

	// Handle stdout and stderr
	go t.handleOutput(stdout)
	go t.handleOutput(stderr)

	logger.Info("SSH connection established successfully", map[string]interface{}{
		"assessmentID": t.assessmentID,
	})

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

// closeConnection properly closes the terminal connection
func (t *Terminal) closeConnection() {
	t.mu.Lock()
	defer t.mu.Unlock()

	// Close SSH session if it exists
	t.closeSSH()

	// Try to deprovision the pod
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Use the Kubernetes client from the hub if available
	var k8sClient *k8s.Client
	var err error

	if t.hub != nil && t.hub.K8sClient != nil {
		k8sClient = t.hub.K8sClient
	} else {
		// Create Kubernetes client
		k8sClient, err = k8s.NewClient(ctx)
		if err != nil {
			logger.Error("Failed to create Kubernetes client for deprovision", err, map[string]interface{}{
				"assessmentID": t.assessmentID,
			})
			return
		}
	}

	// Delete the pod
	err = k8sClient.DeleteTerminalPod(ctx, t.assessmentID)
	if err != nil {
		logger.Error("Failed to delete terminal pod", err, map[string]interface{}{
			"assessmentID": t.assessmentID,
		})
		return
	}

	logger.Info("Terminal pod deprovisioned", map[string]interface{}{
		"assessmentID": t.assessmentID,
	})
}

// handleOutput handles the output from the SSH session
func (t *Terminal) handleOutput(pipe io.Reader) {
	buf := make([]byte, 1024)
	for {
		n, err := pipe.Read(buf)
		if err != nil {
			if err != io.EOF {
				logger.Error("Error reading from pipe", err, nil)
			}
			break
		}
		if n > 0 {
			t.send <- buf[:n]
		}
	}
}
