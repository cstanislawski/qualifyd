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
	"github.com/google/uuid"
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

// TerminalConfig represents the configuration for a terminal connection
type TerminalConfig struct {
	AssessmentID string `json:"assessmentId"`
	SessionID    string `json:"sessionId"`  // Session ID for reconnection
	NewSession   bool   `json:"newSession"` // Whether to force a new session
	TemplateType string `json:"templateType,omitempty"`
	CustomImage  string `json:"customImage,omitempty"`
	CustomCPU    string `json:"customCpu,omitempty"`
	CustomMemory string `json:"customMemory,omitempty"`
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

	// Configuration for this terminal
	config TerminalConfig

	// Pod name for activity updates
	podName string

	// Activity update ticker
	activityTicker *time.Ticker
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

	// Done channel for clean shutdown
	done chan struct{}
}

// NewTerminalHub creates a new terminal hub
func NewTerminalHub() *TerminalHub {
	return &TerminalHub{
		broadcast:  make(chan []byte),
		register:   make(chan *Terminal),
		unregister: make(chan *Terminal),
		terminals:  make(map[*Terminal]bool),
		done:       make(chan struct{}),
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

	// Parse query parameters
	sessionID := r.URL.Query().Get("sessionId")
	newSession := r.URL.Query().Get("newSession") == "true"
	templateType := r.URL.Query().Get("templateType")
	customImage := r.URL.Query().Get("customImage")
	customCPU := r.URL.Query().Get("customCpu")
	customMemory := r.URL.Query().Get("customMemory")

	// Generate a new session ID if needed
	if sessionID == "" || newSession {
		sessionID = generateSessionID()
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("Failed to upgrade connection", err, map[string]interface{}{
			"assessmentID": assessmentID,
			"sessionID":    sessionID,
			"clientIP":     clientIP,
		})
		return
	}

	terminal := &Terminal{
		conn:         conn,
		send:         make(chan []byte, 256),
		assessmentID: assessmentID,
		hub:          hub,
		config: TerminalConfig{
			AssessmentID: assessmentID,
			SessionID:    sessionID,
			NewSession:   newSession,
			TemplateType: templateType,
			CustomImage:  customImage,
			CustomCPU:    customCPU,
			CustomMemory: customMemory,
		},
	}

	hub.register <- terminal

	// Try to get existing pod first
	var pod *corev1.Pod
	if !newSession {
		pod, err = hub.K8sClient.GetTerminalPod(r.Context(), assessmentID, sessionID)
		if err != nil {
			logger.Info("No existing pod found, will create new one", map[string]interface{}{
				"assessmentID": assessmentID,
				"sessionID":    sessionID,
				"error":        err.Error(),
			})
		} else {
			logger.Info("Found existing pod", map[string]interface{}{
				"assessmentID": assessmentID,
				"sessionID":    sessionID,
				"podName":      pod.Name,
			})
			terminal.podName = pod.Name
		}
	}

	// Create new pod if needed
	if pod == nil {
		err = terminal.provisionPod(r.Context())
		if err != nil {
			logger.Error("Failed to provision terminal pod", err, map[string]interface{}{
				"assessmentID": assessmentID,
				"sessionID":    sessionID,
				"templateType": templateType,
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
	}

	// Start activity update ticker
	terminal.activityTicker = time.NewTicker(5 * time.Minute)
	go terminal.updateActivity()

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

		namespace := os.Getenv("K8S_NAMESPACE")
		if namespace == "" {
			namespace = "default"
		}
		k8sClient, err = k8s.NewClient(&logger.DefaultLogger{}, namespace)
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

	// Create pod configuration with template type and session ID
	config := &k8s.TerminalPodConfig{
		AssessmentID: t.config.AssessmentID,
		SessionID:    t.config.SessionID,
		TemplateType: t.config.TemplateType,
		Image:        t.config.CustomImage,
		CPU:          t.config.CustomCPU,
		Memory:       t.config.CustomMemory,
		Labels: map[string]string{
			"created-by": "qualifyd-backend",
		},
		Annotations: map[string]string{
			"description": "On-demand terminal pod for assessment",
		},
	}

	// Create the pod
	pod, err := k8sClient.CreateTerminalPod(ctx, config)
	if err != nil {
		return fmt.Errorf("failed to create terminal pod: %w", err)
	}

	t.podName = pod.Name
	return nil
}

// connectSSH establishes an SSH connection to the terminal pod or container
func (t *Terminal) connectSSH() error {
	var host string
	var err error

	// Get SSH connection details from environment variables with validation
	port := getEnv("TERMINAL_PORT", "22")
	user := getEnv("TERMINAL_USER", "candidate")
	password := getEnv("TERMINAL_PASSWORD", "password")

	// Validate SSH parameters
	if user == "" || password == "" {
		return fmt.Errorf("invalid SSH credentials: user or password is empty")
	}

	// If t.terminalHost is set, use it directly (fallback mode)
	if t.terminalHost != "" {
		host = t.terminalHost
		logger.Info("Using provided terminal host", map[string]interface{}{
			"assessmentID": t.assessmentID,
			"host":         host,
		})
	} else {
		// Get host from Kubernetes pod
		host, err = t.getTerminalPodIP()
		if err != nil {
			return fmt.Errorf("failed to get terminal pod IP: %w", err)
		}
	}

	if host == "" {
		return fmt.Errorf("no host available for SSH connection")
	}

	logger.Info("Connecting to terminal", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"host":         host,
		"user":         user,
		"port":         port,
	})

	// Configure SSH client with better security settings
	config := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // TODO: Use proper host key verification in production
		Timeout:         15 * time.Second,
		ClientVersion:   "SSH-2.0-QualifydBackend", // Custom client version for better logging
	}

	// Connect to SSH server with retries and proper cleanup
	addr := fmt.Sprintf("%s:%s", host, port)
	sshClient, err := t.connectWithRetries(addr, config)
	if err != nil {
		return fmt.Errorf("failed to establish SSH connection: %w", err)
	}
	t.sshClient = sshClient

	// Create and configure SSH session
	if err := t.setupSSHSession(); err != nil {
		t.closeSSH() // Clean up on failure
		return fmt.Errorf("failed to set up SSH session: %w", err)
	}

	logger.Info("SSH connection established successfully", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"host":         host,
	})

	return nil
}

// getTerminalPodIP gets the IP address of the terminal pod with retries
func (t *Terminal) getTerminalPodIP() (string, error) {
	// Create or get Kubernetes client
	k8sClient, err := t.getK8sClient()
	if err != nil {
		// Try fallback to TERMINAL_HOST
		if host := getEnv("TERMINAL_HOST", ""); host != "" {
			t.terminalHost = host
			logger.Info("K8s client failed, using TERMINAL_HOST", map[string]interface{}{
				"assessmentID": t.assessmentID,
				"host":         host,
			})
			return host, nil
		}
		return "", err
	}

	// Get terminal pod with retries
	var pod *corev1.Pod
	retries := 5
	retryDelay := 2 * time.Second

	for i := 0; i < retries; i++ {
		pod, err = k8sClient.GetTerminalPod(context.Background(), t.assessmentID, t.config.SessionID)
		if err == nil && pod.Status.PodIP != "" {
			return pod.Status.PodIP, nil
		}

		logger.Error(fmt.Sprintf("Attempt %d/%d: Failed to get terminal pod IP", i+1, retries),
			err, map[string]interface{}{
				"assessmentID": t.assessmentID,
				"sessionID":    t.config.SessionID,
			})

		if i < retries-1 {
			time.Sleep(retryDelay)
			retryDelay *= 2
		}
	}

	return "", fmt.Errorf("failed to get terminal pod IP after %d attempts", retries)
}

// connectWithRetries attempts to establish an SSH connection with retries
func (t *Terminal) connectWithRetries(addr string, config *ssh.ClientConfig) (*ssh.Client, error) {
	var sshClient *ssh.Client
	var err error
	retries := 5
	retryDelay := 2 * time.Second

	for i := 0; i < retries; i++ {
		logger.Info(fmt.Sprintf("SSH connection attempt %d/%d", i+1, retries), map[string]interface{}{
			"assessmentID": t.assessmentID,
			"address":      addr,
		})

		sshClient, err = ssh.Dial("tcp", addr, config)
		if err == nil {
			return sshClient, nil
		}

		logger.Error(fmt.Sprintf("Attempt %d/%d: Failed to dial SSH server", i+1, retries),
			err, map[string]interface{}{
				"assessmentID": t.assessmentID,
				"address":      addr,
			})

		if i < retries-1 {
			time.Sleep(retryDelay)
			retryDelay *= 2
		}
	}

	return nil, fmt.Errorf("failed to connect after %d attempts: %w", retries, err)
}

// setupSSHSession creates and configures an SSH session
func (t *Terminal) setupSSHSession() error {
	session, err := t.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	t.sshSession = session

	// Configure terminal modes for better compatibility
	modes := ssh.TerminalModes{
		ssh.ECHO:          1,     // Echo on
		ssh.IGNCR:         0,     // Don't ignore CR
		ssh.ICRNL:         1,     // Map CR to NL on input
		ssh.INLCR:         0,     // Don't map NL to CR
		ssh.ICANON:        1,     // Enable canonical mode
		ssh.ISIG:          1,     // Enable signals
		ssh.TTY_OP_ISPEED: 14400, // Input speed
		ssh.TTY_OP_OSPEED: 14400, // Output speed
	}

	// Request pseudo-terminal
	if err := session.RequestPty("xterm", 40, 120, modes); err != nil {
		return fmt.Errorf("failed to request pty: %w", err)
	}

	// Set up I/O pipes
	if err := t.setupPipes(); err != nil {
		return err
	}

	// Start shell
	if err := session.Shell(); err != nil {
		return fmt.Errorf("failed to start shell: %w", err)
	}

	return nil
}

// setupPipes sets up stdin, stdout, and stderr pipes for the SSH session
func (t *Terminal) setupPipes() error {
	var err error

	// Set up stdin
	t.stdin, err = t.sshSession.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdin pipe: %w", err)
	}

	// Set up stdout
	stdout, err := t.sshSession.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout pipe: %w", err)
	}
	go t.handleOutput(stdout)

	// Set up stderr
	stderr, err := t.sshSession.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get stderr pipe: %w", err)
	}
	go t.handleOutput(stderr)

	return nil
}

// getK8sClient gets or creates a Kubernetes client
func (t *Terminal) getK8sClient() (*k8s.Client, error) {
	if t.hub != nil && t.hub.K8sClient != nil {
		return t.hub.K8sClient, nil
	}

	namespace := os.Getenv("K8S_NAMESPACE")
	if namespace == "" {
		namespace = "default"
	}

	client, err := k8s.NewClient(&logger.DefaultLogger{}, namespace)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kubernetes client: %w", err)
	}

	return client, nil
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
		namespace := os.Getenv("K8S_NAMESPACE")
		if namespace == "" {
			namespace = "default"
		}
		k8sClient, err = k8s.NewClient(&logger.DefaultLogger{}, namespace)
		if err != nil {
			logger.Error("Failed to create Kubernetes client for deprovision", err, map[string]interface{}{
				"assessmentID": t.assessmentID,
				"sessionID":    t.config.SessionID,
			})
			return
		}
	}

	// Delete the pod
	err = k8sClient.DeleteTerminalPod(ctx, t.assessmentID, t.config.SessionID)
	if err != nil {
		logger.Error("Failed to delete terminal pod", err, map[string]interface{}{
			"assessmentID": t.assessmentID,
			"sessionID":    t.config.SessionID,
		})
		return
	}

	logger.Info("Terminal pod deprovisioned", map[string]interface{}{
		"assessmentID": t.assessmentID,
		"sessionID":    t.config.SessionID,
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

// updateActivity periodically updates the pod's last activity timestamp
func (t *Terminal) updateActivity() {
	defer t.activityTicker.Stop()

	for {
		select {
		case <-t.activityTicker.C:
			if t.podName != "" {
				ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				if err := t.hub.K8sClient.UpdatePodActivity(ctx, t.podName); err != nil {
					logger.Error("Failed to update pod activity", err, map[string]interface{}{
						"assessmentID": t.assessmentID,
						"sessionID":    t.config.SessionID,
						"podName":      t.podName,
					})
				}
				cancel()
			}
		case <-t.hub.done: // Add a done channel to TerminalHub for clean shutdown
			return
		}
	}
}

// generateSessionID generates a unique session ID
func generateSessionID() string {
	// Use a UUID v4 for session ID
	return uuid.New().String()
}
