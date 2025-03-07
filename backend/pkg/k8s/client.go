package k8s

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/cstanislawski/qualifyd/pkg/logger"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// Client is a wrapper around the Kubernetes clientset
type Client struct {
	clientset *kubernetes.Clientset
	namespace string
	log       logger.Logger
}

// ClientOption is a functional option for configuring the Kubernetes client
type ClientOption func(*Client)

// WithNamespace sets the namespace for the Kubernetes client
func WithNamespace(namespace string) ClientOption {
	return func(c *Client) {
		c.namespace = namespace
	}
}

// WithLogger sets the logger for the Kubernetes client
func WithLogger(log logger.Logger) ClientOption {
	return func(c *Client) {
		c.log = log
	}
}

// NewClient creates a new Kubernetes client
func NewClient(ctx context.Context, opts ...ClientOption) (*Client, error) {
	// Default configuration
	client := &Client{
		namespace: getEnvOrDefault("K8S_NAMESPACE", "qualifyd-dev"),
		log:       &logger.DefaultLogger{},
	}

	// Apply options
	for _, opt := range opts {
		opt(client)
	}

	// Print startup message to both log and stdout
	initMsg := fmt.Sprintf("Initializing Kubernetes client, namespace: %s", client.namespace)
	client.log.Info(initMsg, nil)
	fmt.Println(initMsg)

	// Try to load in-cluster config first
	var config *rest.Config
	var err error

	config, err = rest.InClusterConfig()
	if err != nil {
		errorMsg := fmt.Sprintf("Failed to load in-cluster config: %v", err)
		client.log.Info(errorMsg, nil)
		fmt.Println(errorMsg)

		// If in-cluster config fails, try local kubeconfig
		kubeconfig := getEnvOrDefault("KUBECONFIG", filepath.Join(homeDir(), ".kube", "config"))
		kubeconfigMsg := fmt.Sprintf("Using kubeconfig file: %s", kubeconfig)
		client.log.Info(kubeconfigMsg, nil)
		fmt.Println(kubeconfigMsg)

		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			errorMsg := fmt.Sprintf("Failed to create kubernetes client using kubeconfig: %v", err)
			client.log.Error(errorMsg, err, nil)
			fmt.Println(errorMsg)
			return nil, fmt.Errorf(errorMsg)
		}
	} else {
		successMsg := "Successfully loaded in-cluster config"
		client.log.Info(successMsg, nil)
		fmt.Println(successMsg)
	}

	// Disable rate limiting
	config.QPS = 100
	config.Burst = 100

	// Set reasonable timeouts
	config.Timeout = time.Second * 30

	// Create clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		errorMsg := fmt.Sprintf("Failed to create kubernetes clientset: %v", err)
		client.log.Error(errorMsg, err, nil)
		fmt.Println(errorMsg)
		return nil, fmt.Errorf(errorMsg)
	}
	client.clientset = clientset

	// Test the connection by listing pods
	infoMsg := "Testing kubernetes connection by listing pods..."
	client.log.Info(infoMsg, nil)
	fmt.Println(infoMsg)

	_, err = clientset.CoreV1().Pods(client.namespace).List(ctx, metav1.ListOptions{Limit: 1})
	if err != nil {
		errorMsg := fmt.Sprintf("Kubernetes client connected but failed to list pods (RBAC issue?): %v", err)
		client.log.Error(errorMsg, err, nil)
		fmt.Println(errorMsg)

		// Print service account information
		sa := getEnvOrDefault("KUBERNETES_SERVICE_ACCOUNT", "default")
		saMsg := fmt.Sprintf("Current service account: %s", sa)
		client.log.Info(saMsg, nil)
		fmt.Println(saMsg)

		// Check environment for debugging
		fmt.Println("Environment variables:")
		for _, env := range os.Environ() {
			fmt.Println(env)
		}

		return nil, fmt.Errorf(errorMsg)
	}

	successMsg := fmt.Sprintf("Kubernetes client initialized successfully, namespace: %s", client.namespace)
	client.log.Info(successMsg, nil)
	fmt.Println(successMsg)

	return client, nil
}

// homeDir returns the user's home directory
func homeDir() string {
	if h := os.Getenv("HOME"); h != "" {
		return h
	}
	return os.Getenv("USERPROFILE") // Windows
}

// getEnvOrDefault returns the value of an environment variable or a default value
func getEnvOrDefault(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
