package k8s

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

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
func NewClient(log logger.Logger, namespace string) (*Client, error) {
	client := &Client{
		log:       log,
		namespace: namespace,
	}

	client.log.Info("Initializing Kubernetes client", map[string]interface{}{"namespace": client.namespace})

	client.log.Debug("Attempting to load in-cluster config", nil)
	config, err := rest.InClusterConfig()
	if err != nil {
		client.log.Debug("Failed to load in-cluster config, trying kubeconfig", map[string]interface{}{"error": err.Error()})
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			kubeconfig = filepath.Join(os.Getenv("HOME"), ".kube", "config")
		}
		client.log.Debug("Using kubeconfig path", map[string]interface{}{"path": kubeconfig})
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			client.log.Error("Failed to load kubeconfig", err, map[string]interface{}{"path": kubeconfig})
			return nil, fmt.Errorf("failed to load kubeconfig: %w", err)
		}
	} else {
		client.log.Debug("Successfully loaded in-cluster config", map[string]interface{}{
			"host":     config.Host,
			"username": config.Username,
			"qps":      config.QPS,
			"burst":    config.Burst,
		})
	}

	client.log.Debug("Creating Kubernetes clientset", nil)
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		client.log.Error("Failed to create kubernetes client", err, nil)
		return nil, fmt.Errorf("failed to create kubernetes client: %w", err)
	}

	client.log.Debug("Testing kubernetes connection by listing pods", map[string]interface{}{"namespace": client.namespace})
	_, err = clientset.CoreV1().Pods(client.namespace).List(context.Background(), metav1.ListOptions{})
	if err != nil {
		sa, _ := os.ReadFile("/var/run/secrets/kubernetes.io/serviceaccount/token")
		client.log.Error("Failed to list pods (RBAC issue?)", err, map[string]interface{}{
			"namespace":      client.namespace,
			"serviceAccount": string(sa),
		})
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	client.log.Info("Kubernetes client initialized successfully", map[string]interface{}{"namespace": client.namespace})
	client.clientset = clientset

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
