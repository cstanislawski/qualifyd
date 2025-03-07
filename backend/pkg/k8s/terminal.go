package k8s

import (
	"context"
	"fmt"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
)

const (
	// TerminalLabelKey is the label key for identifying terminal pods
	TerminalLabelKey = "app.qualifyd.io/component"
	// TerminalLabelValue is the label value for identifying terminal pods
	TerminalLabelValue = "terminal"
	// AssessmentIDLabelKey is the label key for identifying the assessment ID
	AssessmentIDLabelKey = "app.qualifyd.io/assessment-id"
	// TerminalPodNamePrefix is the prefix for terminal pod names
	TerminalPodNamePrefix = "terminal"
	// DefaultTerminalImage is the default image to use for terminal pods
	DefaultTerminalImage = "qualifyd-terminal:dev"
	// TerminalContainerName is the name of the terminal container
	TerminalContainerName = "terminal"
	// DefaultSSHPort is the default SSH port
	DefaultSSHPort = 22
	// PodReadyTimeout is the timeout for waiting for a pod to be ready
	PodReadyTimeout = 60 * time.Second
	// PodPollingInterval is the polling interval for checking pod status
	PodPollingInterval = 2 * time.Second
)

// TerminalPodConfig contains configuration for creating a terminal pod
type TerminalPodConfig struct {
	AssessmentID string
	Image        string
	Labels       map[string]string
	Annotations  map[string]string
	CPU          string
	Memory       string
}

// GetTerminalPod retrieves a terminal pod by assessment ID
func (c *Client) GetTerminalPod(ctx context.Context, assessmentID string) (*corev1.Pod, error) {
	// Define label selector to find the terminal pod for this assessment
	labelSelector := fmt.Sprintf("%s=%s,%s=%s",
		TerminalLabelKey, TerminalLabelValue,
		AssessmentIDLabelKey, assessmentID)

	pods, err := c.clientset.CoreV1().Pods(c.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list terminal pods: %w", err)
	}

	if len(pods.Items) == 0 {
		return nil, fmt.Errorf("no terminal pod found for assessment ID %s", assessmentID)
	}

	// Return the first matching pod
	return &pods.Items[0], nil
}

// CreateTerminalPod creates a new terminal pod
func (c *Client) CreateTerminalPod(ctx context.Context, config *TerminalPodConfig) (*corev1.Pod, error) {
	if config.AssessmentID == "" {
		return nil, fmt.Errorf("assessment ID is required")
	}

	// Set default image if not provided
	if config.Image == "" {
		config.Image = DefaultTerminalImage
	}

	// Default resource requests if not specified
	cpuRequest := "100m"
	memoryRequest := "128Mi"
	if config.CPU != "" {
		cpuRequest = config.CPU
	}
	if config.Memory != "" {
		memoryRequest = config.Memory
	}

	// Create labels map with required labels
	labels := map[string]string{
		TerminalLabelKey:     TerminalLabelValue,
		AssessmentIDLabelKey: config.AssessmentID,
	}

	// Merge additional labels if provided
	for k, v := range config.Labels {
		labels[k] = v
	}

	// Create pod
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: fmt.Sprintf("%s-%s-", TerminalPodNamePrefix, config.AssessmentID),
			Namespace:    c.namespace,
			Labels:       labels,
			Annotations:  config.Annotations,
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:            TerminalContainerName,
					Image:           config.Image,
					ImagePullPolicy: corev1.PullIfNotPresent, // For local development
					Ports: []corev1.ContainerPort{
						{
							Name:          "ssh",
							ContainerPort: DefaultSSHPort,
							Protocol:      corev1.ProtocolTCP,
						},
					},
					Resources: corev1.ResourceRequirements{
						Requests: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse(cpuRequest),
							corev1.ResourceMemory: resource.MustParse(memoryRequest),
						},
						Limits: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse(cpuRequest),
							corev1.ResourceMemory: resource.MustParse(memoryRequest),
						},
					},
					SecurityContext: &corev1.SecurityContext{
						RunAsNonRoot: &[]bool{true}[0],
						Privileged:   &[]bool{false}[0],
					},
				},
			},
			RestartPolicy: corev1.RestartPolicyNever,
		},
	}

	c.log.Info("Creating terminal pod", map[string]interface{}{
		"assessmentID": config.AssessmentID,
		"namespace":    c.namespace,
	})

	// Create the pod
	created, err := c.clientset.CoreV1().Pods(c.namespace).Create(ctx, pod, metav1.CreateOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to create terminal pod: %w", err)
	}

	c.log.Info("Terminal pod created", map[string]interface{}{
		"assessmentID": config.AssessmentID,
		"podName":      created.Name,
		"namespace":    c.namespace,
	})

	// Wait for the pod to be ready
	if err := c.waitForPodReady(ctx, created.Name); err != nil {
		// Don't delete the pod if it's not ready; let it be investigated
		return nil, fmt.Errorf("terminal pod not ready: %w", err)
	}

	// Get the latest pod state
	return c.clientset.CoreV1().Pods(c.namespace).Get(ctx, created.Name, metav1.GetOptions{})
}

// DeleteTerminalPod deletes a terminal pod by assessment ID
func (c *Client) DeleteTerminalPod(ctx context.Context, assessmentID string) error {
	// Get the pod first
	pod, err := c.GetTerminalPod(ctx, assessmentID)
	if err != nil {
		return err
	}

	// Delete policy - delete immediately
	gracePeriodSeconds := int64(0)
	deletePolicy := metav1.DeletePropagationForeground

	c.log.Info("Deleting terminal pod", map[string]interface{}{
		"assessmentID": assessmentID,
		"podName":      pod.Name,
		"namespace":    c.namespace,
	})

	// Delete the pod
	err = c.clientset.CoreV1().Pods(c.namespace).Delete(ctx, pod.Name, metav1.DeleteOptions{
		GracePeriodSeconds: &gracePeriodSeconds,
		PropagationPolicy:  &deletePolicy,
	})
	if err != nil {
		return fmt.Errorf("failed to delete terminal pod: %w", err)
	}

	c.log.Info("Terminal pod deleted", map[string]interface{}{
		"assessmentID": assessmentID,
		"podName":      pod.Name,
		"namespace":    c.namespace,
	})

	return nil
}

// GetPodIP returns the pod IP address
func (c *Client) GetPodIP(ctx context.Context, podName string) (string, error) {
	pod, err := c.clientset.CoreV1().Pods(c.namespace).Get(ctx, podName, metav1.GetOptions{})
	if err != nil {
		return "", fmt.Errorf("failed to get pod: %w", err)
	}

	if pod.Status.PodIP == "" {
		return "", fmt.Errorf("pod has no IP address")
	}

	return pod.Status.PodIP, nil
}

// waitForPodReady waits for a pod to be in the ready state
func (c *Client) waitForPodReady(ctx context.Context, podName string) error {
	c.log.Info("Waiting for pod to be ready", map[string]interface{}{
		"podName":   podName,
		"namespace": c.namespace,
		"timeout":   PodReadyTimeout.String(),
	})

	return wait.PollImmediate(PodPollingInterval, PodReadyTimeout, func() (bool, error) {
		pod, err := c.clientset.CoreV1().Pods(c.namespace).Get(ctx, podName, metav1.GetOptions{})
		if err != nil {
			return false, err
		}

		// Check if pod is ready
		for _, condition := range pod.Status.Conditions {
			if condition.Type == corev1.PodReady && condition.Status == corev1.ConditionTrue {
				c.log.Info("Pod is ready", map[string]interface{}{
					"podName":   podName,
					"namespace": c.namespace,
				})
				return true, nil
			}
		}

		c.log.Info("Pod not ready yet", map[string]interface{}{
			"podName":   podName,
			"namespace": c.namespace,
			"status":    pod.Status.Phase,
		})

		return false, nil
	})
}
