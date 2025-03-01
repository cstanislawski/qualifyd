/**
 * Qualifyd Terminal Functionality
 *
 * This script handles the terminal interface for technical assessments,
 * including WebSocket communication, command history, and terminal UI.
 */

class QualifydTerminal {
  constructor(options = {}) {
    console.log("Initializing QualifydTerminal with options:", options);

    // Default configuration
    this.config = {
      terminalId: 'terminal',
      promptTemplate: '<span class="terminal-prompt-user">candidate</span><span class="terminal-prompt-at">@</span><span class="terminal-prompt-host">qualifyd</span>:<span class="terminal-prompt-path">~</span><span class="terminal-prompt-symbol">$</span>',
      wsEndpoint: `/ws/terminal/${options.assessmentId || ''}`,
      historySize: 50,
      ...options
    };

    console.log("Terminal configuration:", this.config);

    // Terminal state
    this.history = [];
    this.historyIndex = -1;
    this.connected = false;
    this.socket = null;
    this.currentPath = '~';
    this.currentPrompt = this.config.promptTemplate;

    // DOM elements
    this.terminalElement = document.getElementById(this.config.terminalId);
    if (!this.terminalElement) {
      console.error(`Terminal element with ID '${this.config.terminalId}' not found!`);
      return;
    }

    this.terminalBody = this.terminalElement.querySelector('.terminal-body');
    if (!this.terminalBody) {
      console.error(`Terminal body element not found within terminal element!`);
      return;
    }

    // Initialize
    this.init();
  }

  /**
   * Initialize the terminal
   */
  init() {
    console.log("Initializing terminal...");
    this.createPromptLine();
    this.connectWebSocket();
    this.setupEventListeners();
    this.focusTerminal();

    // Add initial welcome message
    this.addOutput(`Welcome to Qualifyd Assessment Terminal
Connected to assessment environment.
Type 'help' for available commands.

`, 'terminal-output');
  }

  /**
   * Create a new prompt line in the terminal
   */
  createPromptLine() {
    console.log("Creating prompt line...");
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-prompt';
    promptLine.innerHTML = `${this.currentPrompt} `;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';
    input.autocapitalize = 'off';
    input.autocomplete = 'off';
    input.spellcheck = false;

    promptLine.appendChild(input);
    this.terminalBody.appendChild(promptLine);

    this.currentInput = input;
    this.currentInput.focus();
  }

  /**
   * Add output text to the terminal
   */
  addOutput(text, className = '') {
    console.log("Adding output:", text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    const output = document.createElement('div');
    output.className = `terminal-output ${className}`;
    output.textContent = text;

    // Insert before the last prompt line
    this.terminalBody.insertBefore(output, this.terminalBody.lastChild);
    this.scrollToBottom();
  }

  /**
   * Process a command entered by the user
   */
  processCommand(command) {
    if (!command.trim()) return;

    console.log("Processing command:", command);

    // Add to history
    this.history.unshift(command);
    if (this.history.length > this.config.historySize) {
      this.history.pop();
    }
    this.historyIndex = -1;

    // Disable the current input and create a new one
    this.currentInput.disabled = true;

    // Send command to server via WebSocket
    if (this.connected) {
      console.log("Sending command to WebSocket:", command);
      this.socket.send(JSON.stringify({
        type: 'command',
        command: command
      }));
    } else {
      console.warn("WebSocket not connected, using fallback handler");
      // Fallback for when WebSocket is not connected
      this.handleOfflineCommand(command);
    }
  }

  /**
   * Handle commands when offline (fallback)
   */
  handleOfflineCommand(command) {
    const cmd = command.trim().toLowerCase();

    if (cmd === 'help') {
      this.addOutput(`
Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  connect  - Attempt to reconnect to the assessment environment

Note: The terminal is currently in offline mode. Some commands may not work.
`);
    } else if (cmd === 'clear') {
      this.clearTerminal();
    } else if (cmd === 'connect') {
      this.addOutput('Attempting to reconnect...', 'terminal-output-warning');
      this.connectWebSocket();
    } else {
      this.addOutput(`Command not found: ${command}`, 'terminal-output-error');
    }

    this.createPromptLine();
  }

  /**
   * Clear the terminal
   */
  clearTerminal() {
    console.log("Clearing terminal...");
    // Remove all children except the last prompt line
    while (this.terminalBody.childNodes.length > 1) {
      this.terminalBody.removeChild(this.terminalBody.firstChild);
    }
  }

  /**
   * Connect to the WebSocket server
   */
  connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${this.config.wsEndpoint}`;

      console.log("Connecting to WebSocket:", wsUrl);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("WebSocket connection established");
        this.connected = true;
        this.addOutput('Connected to assessment environment.', 'terminal-output-success');
      };

      this.socket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data.substring(0, 50) + (event.data.length > 50 ? '...' : ''));
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'output') {
            this.addOutput(data.text, data.class || '');
            this.createPromptLine();
          } else if (data.type === 'path_update') {
            this.updatePath(data.path);
          } else if (data.type === 'error') {
            this.addOutput(data.message, 'terminal-output-error');
            this.createPromptLine();
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          this.addOutput(event.data);
          this.createPromptLine();
        }
      };

      this.socket.onclose = (event) => {
        console.warn("WebSocket connection closed:", event.code, event.reason);
        this.connected = false;
        this.addOutput('Disconnected from assessment environment. Type "connect" to reconnect.', 'terminal-output-warning');
        this.createPromptLine();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
        this.addOutput('Error connecting to assessment environment.', 'terminal-output-error');
        this.createPromptLine();
      };
    } catch (e) {
      console.error('Error setting up WebSocket:', e);
      this.addOutput('Failed to connect to assessment environment.', 'terminal-output-error');
      this.createPromptLine();
    }
  }

  /**
   * Update the current path in the prompt
   */
  updatePath(path) {
    console.log("Updating path to:", path);
    this.currentPath = path;
    this.currentPrompt = this.config.promptTemplate.replace('<span class="terminal-prompt-path">~</span>', `<span class="terminal-prompt-path">${path}</span>`);
  }

  /**
   * Set up event listeners for the terminal
   */
  setupEventListeners() {
    console.log("Setting up event listeners...");
    // Click anywhere in terminal to focus the input
    this.terminalBody.addEventListener('click', () => {
      this.focusTerminal();
    });

    // Global keydown event for terminal navigation
    document.addEventListener('keydown', (e) => {
      // Only handle if we're focused on the terminal
      if (document.activeElement !== this.currentInput) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        const command = this.currentInput.value;
        this.processCommand(command);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTabCompletion();
      } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        this.handleCtrlC();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        this.clearTerminal();
        this.createPromptLine();
      }
    });
  }

  /**
   * Navigate through command history
   */
  navigateHistory(direction) {
    const newIndex = this.historyIndex + direction;

    if (newIndex >= -1 && newIndex < this.history.length) {
      this.historyIndex = newIndex;

      if (this.historyIndex === -1) {
        this.currentInput.value = '';
      } else {
        this.currentInput.value = this.history[this.historyIndex];
      }

      // Move cursor to end of input
      setTimeout(() => {
        this.currentInput.selectionStart = this.currentInput.selectionEnd = this.currentInput.value.length;
      }, 0);
    }
  }

  /**
   * Handle tab completion (placeholder - would be implemented with server-side support)
   */
  handleTabCompletion() {
    if (this.connected) {
      this.socket.send(JSON.stringify({
        type: 'tab_completion',
        text: this.currentInput.value
      }));
    }
  }

  /**
   * Handle Ctrl+C key combination
   */
  handleCtrlC() {
    console.log("Ctrl+C pressed");
    this.addOutput('^C');
    this.createPromptLine();

    if (this.connected) {
      this.socket.send(JSON.stringify({
        type: 'signal',
        signal: 'SIGINT'
      }));
    }
  }

  /**
   * Focus the current input field
   */
  focusTerminal() {
    if (this.currentInput) {
      this.currentInput.focus();
    }
  }

  /**
   * Scroll the terminal to the bottom
   */
  scrollToBottom() {
    this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
  }
}

/**
 * Timer functionality for assessments
 */
class AssessmentTimer {
  constructor(options = {}) {
    console.log("Initializing AssessmentTimer with options:", options);

    this.config = {
      elementId: 'assessment-timer',
      durationMinutes: 60,
      warningThresholdMinutes: 10,
      dangerThresholdMinutes: 5,
      onComplete: null,
      ...options
    };

    this.timerElement = document.getElementById(this.config.elementId);
    if (!this.timerElement) {
      console.error(`Timer element with ID '${this.config.elementId}' not found!`);
      return;
    }

    this.remainingSeconds = this.config.durationMinutes * 60;
    this.interval = null;

    this.init();
  }

  init() {
    console.log("Initializing timer...");
    this.updateDisplay();
    this.start();
  }

  start() {
    console.log("Starting timer...");
    this.interval = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        console.log("Timer completed");
        this.stop();
        if (typeof this.config.onComplete === 'function') {
          this.config.onComplete();
        }
      }

      this.updateDisplay();
    }, 1000);
  }

  stop() {
    console.log("Stopping timer...");
    clearInterval(this.interval);
  }

  updateDisplay() {
    if (!this.timerElement) return;

    const hours = Math.floor(this.remainingSeconds / 3600);
    const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
    const seconds = this.remainingSeconds % 60;

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.timerElement.textContent = formattedTime;

    // Update classes based on remaining time
    this.timerElement.classList.remove('warning', 'danger');

    const remainingMinutes = this.remainingSeconds / 60;
    if (remainingMinutes <= this.config.dangerThresholdMinutes) {
      this.timerElement.classList.add('danger');
    } else if (remainingMinutes <= this.config.warningThresholdMinutes) {
      this.timerElement.classList.add('warning');
    }
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded, initializing terminal...");

  // Get assessment ID from the page
  const assessmentId = document.body.dataset.assessmentId;
  console.log("Assessment ID from data attribute:", assessmentId);

  if (!assessmentId) {
    console.error("No assessment ID found in data-assessment-id attribute on body tag!");
    // Try to extract from URL as fallback
    const urlMatch = window.location.pathname.match(/\/terminal\/([^\/]+)/);
    if (urlMatch && urlMatch[1]) {
      console.log("Extracted assessment ID from URL:", urlMatch[1]);
      document.body.dataset.assessmentId = urlMatch[1];
    }
  }

  // Initialize terminal
  const terminal = new QualifydTerminal({
    assessmentId: document.body.dataset.assessmentId
  });

  // Initialize timer
  const timer = new AssessmentTimer({
    durationMinutes: parseInt(document.body.dataset.assessmentDuration || '60', 10),
    onComplete: function() {
      console.log("Timer complete callback triggered");
      terminal.addOutput('\nTime is up! Your assessment has ended.', 'terminal-output-error');

      // Show submission dialog
      const submitDialog = document.getElementById('submit-dialog');
      if (submitDialog) {
        submitDialog.classList.remove('hidden');
      }
    }
  });

  // Handle submit button
  const submitButton = document.getElementById('submit-assessment');
  if (submitButton) {
    submitButton.addEventListener('click', function() {
      const confirmSubmit = confirm('Are you sure you want to submit your assessment? This action cannot be undone.');
      if (confirmSubmit) {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting...';

        // Submit the assessment
        fetch(`/api/assessments/${document.body.dataset.assessmentId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = `/candidate/assessments/${document.body.dataset.assessmentId}/submitted`;
          } else {
            alert('Failed to submit assessment: ' + (data.message || 'Unknown error'));
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Assessment';
          }
        })
        .catch(error => {
          console.error('Error submitting assessment:', error);
          alert('An error occurred while submitting your assessment. Please try again.');
          submitButton.disabled = false;
          submitButton.innerHTML = 'Submit Assessment';
        });
      }
    });
  }
});
