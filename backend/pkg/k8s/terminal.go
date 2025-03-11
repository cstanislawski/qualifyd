package k8s

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/apimachinery/pkg/util/yaml"
)

const (
	// TerminalLabelKey is the label key for identifying terminal pods
	TerminalLabelKey = "app.qualifyd.io/component"
	// TerminalLabelValue is the label value for identifying terminal pods
	TerminalLabelValue = "terminal"
	// AssessmentIDLabelKey is the label key for identifying the assessment ID
	AssessmentIDLabelKey = "app.qualifyd.io/assessment-id"
	// SessionIDLabelKey is the label key for identifying the session ID
	SessionIDLabelKey = "app.qualifyd.io/session-id"
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
	// DefaultTemplateType is the default terminal template type
	DefaultTemplateType = "default"
	// PodTTL is the time-to-live for terminal pods after last connection
	PodTTL = 2 * time.Hour
	// CreatedAtAnnotationKey is the key for the created-at annotation
	CreatedAtAnnotationKey = "created-at"
	// LastActivityAnnotationKey is the key for the last-activity annotation
	LastActivityAnnotationKey = "last-activity"
	// TTLAnnotationKey is the key for the TTL annotation
	TTLAnnotationKey = "ttl"
)

// TerminalPodConfig contains configuration for creating a terminal pod
type TerminalPodConfig struct {
	AssessmentID string
	SessionID    string
	Image        string
	Labels       map[string]string
	Annotations  map[string]string
	CPU          string
	Memory       string
	TemplateType string // Type of terminal template to use (e.g., "default", "kubernetes")
}

// GetTerminalPod retrieves a terminal pod by assessment ID and session ID
func (c *Client) GetTerminalPod(ctx context.Context, assessmentID, sessionID string) (*corev1.Pod, error) {
	// Define label selector to find the terminal pod for this assessment and session
	labelSelector := fmt.Sprintf("%s=%s,%s=%s,%s=%s",
		TerminalLabelKey, TerminalLabelValue,
		AssessmentIDLabelKey, assessmentID,
		SessionIDLabelKey, sessionID)

	pods, err := c.clientset.CoreV1().Pods(c.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list terminal pods: %w", err)
	}

	if len(pods.Items) == 0 {
		return nil, fmt.Errorf("no terminal pod found for assessment ID %s and session ID %s", assessmentID, sessionID)
	}

	// Return the first matching pod
	return &pods.Items[0], nil
}

// loadPodTemplate loads a pod template from the templates directory
func (c *Client) loadPodTemplate(templateType string) (*corev1.Pod, error) {
	templatesPath := os.Getenv("TERMINAL_TEMPLATES_PATH")
	if templatesPath == "" {
		templatesPath = "/app/templates" // Default path
	}

	templateFile := filepath.Join(templatesPath, templateType+".yaml")
	templateData, err := os.ReadFile(templateFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read template file %s: %w", templateFile, err)
	}

	var pod corev1.Pod
	if err := yaml.Unmarshal(templateData, &pod); err != nil {
		return nil, fmt.Errorf("failed to unmarshal template: %w", err)
	}

	return &pod, nil
}

// CreateTerminalPod creates a new terminal pod
func (c *Client) CreateTerminalPod(ctx context.Context, config *TerminalPodConfig) (*corev1.Pod, error) {
	if config.AssessmentID == "" {
		return nil, fmt.Errorf("assessment ID is required")
	}
	if config.SessionID == "" {
		return nil, fmt.Errorf("session ID is required")
	}

	// Load the appropriate template
	templateType := config.TemplateType
	if templateType == "" {
		templateType = DefaultTemplateType
	}

	template, err := c.loadPodTemplate(templateType)
	if err != nil {
		c.log.Error("Failed to load pod template", err, map[string]interface{}{
			"templateType": templateType,
		})
		return nil, fmt.Errorf("failed to load pod template: %w", err)
	}

	// Create a copy of the template
	pod := template.DeepCopy()

	// Set the pod name with assessment ID and session ID
	pod.ObjectMeta.Name = ""
	pod.ObjectMeta.GenerateName = fmt.Sprintf("%s-%s-%s-", TerminalPodNamePrefix, config.AssessmentID, config.SessionID)
	pod.ObjectMeta.Namespace = c.namespace

	// Set a simpler hostname that only uses the assessment ID
	pod.Spec.Hostname = fmt.Sprintf("terminal-%s", config.AssessmentID)

	// Set required labels
	if pod.ObjectMeta.Labels == nil {
		pod.ObjectMeta.Labels = make(map[string]string)
	}
	pod.ObjectMeta.Labels[TerminalLabelKey] = TerminalLabelValue
	pod.ObjectMeta.Labels[AssessmentIDLabelKey] = config.AssessmentID
	pod.ObjectMeta.Labels[SessionIDLabelKey] = config.SessionID

	// Set TTL annotation for cleanup
	if pod.ObjectMeta.Annotations == nil {
		pod.ObjectMeta.Annotations = make(map[string]string)
	}
	pod.ObjectMeta.Annotations["qualifyd.io/last-activity"] = time.Now().Format(time.RFC3339)
	pod.ObjectMeta.Annotations["qualifyd.io/ttl"] = PodTTL.String()

	// Merge additional labels if provided
	for k, v := range config.Labels {
		pod.ObjectMeta.Labels[k] = v
	}

	// Merge additional annotations if provided
	for k, v := range config.Annotations {
		pod.ObjectMeta.Annotations[k] = v
	}

	// Set the image if provided
	if config.Image != "" {
		pod.Spec.Containers[0].Image = config.Image
	} else if templateImage := os.Getenv("TERMINAL_IMAGE"); templateImage != "" {
		pod.Spec.Containers[0].Image = templateImage
	}

	// Set the resources if provided
	if config.CPU != "" || config.Memory != "" {
		if config.CPU != "" {
			pod.Spec.Containers[0].Resources.Requests[corev1.ResourceCPU] = resource.MustParse(config.CPU)
			pod.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU] = resource.MustParse(config.CPU)
		}
		if config.Memory != "" {
			pod.Spec.Containers[0].Resources.Requests[corev1.ResourceMemory] = resource.MustParse(config.Memory)
			pod.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory] = resource.MustParse(config.Memory)
		}
	}

	// Create the pod
	created, err := c.clientset.CoreV1().Pods(c.namespace).Create(ctx, pod, metav1.CreateOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to create terminal pod: %w", err)
	}

	c.log.Info("Terminal pod created", map[string]interface{}{
		"podName":      created.Name,
		"namespace":    c.namespace,
		"assessmentID": config.AssessmentID,
		"sessionID":    config.SessionID,
	})

	// Wait for the pod to be ready
	if err := c.WaitForPodReady(ctx, created.Name); err != nil {
		// Don't delete the pod if it's not ready; let it be investigated
		return nil, fmt.Errorf("terminal pod not ready: %w", err)
	}

	return created, nil
}

// UpdatePodActivity updates the last activity timestamp for a pod
func (c *Client) UpdatePodActivity(ctx context.Context, podName string) error {
	pod, err := c.clientset.CoreV1().Pods(c.namespace).Get(ctx, podName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get pod: %w", err)
	}

	// Update last activity timestamp
	if pod.ObjectMeta.Annotations == nil {
		pod.ObjectMeta.Annotations = make(map[string]string)
	}
	pod.ObjectMeta.Annotations["qualifyd.io/last-activity"] = time.Now().Format(time.RFC3339)

	_, err = c.clientset.CoreV1().Pods(c.namespace).Update(ctx, pod, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to update pod: %w", err)
	}

	return nil
}

// DeleteTerminalPod deletes a terminal pod by assessment ID and session ID
func (c *Client) DeleteTerminalPod(ctx context.Context, assessmentID, sessionID string) error {
	// Get the pod first
	pod, err := c.GetTerminalPod(ctx, assessmentID, sessionID)
	if err != nil {
		return err
	}

	// Delete policy - delete immediately
	gracePeriodSeconds := int64(0)
	deletePolicy := metav1.DeletePropagationForeground

	c.log.Info("Deleting terminal pod", map[string]interface{}{
		"assessmentID": assessmentID,
		"sessionID":    sessionID,
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
		"sessionID":    sessionID,
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

// WaitForPodReady waits for a pod to be in the ready state
func (c *Client) WaitForPodReady(ctx context.Context, podName string) error {
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

// ListTerminalPods retrieves all terminal pods for a given assessment ID
func (c *Client) ListTerminalPods(ctx context.Context, assessmentID string) ([]corev1.Pod, error) {
	// Define label selector to find terminal pods for this assessment
	labelSelector := fmt.Sprintf("%s=%s,%s=%s",
		TerminalLabelKey, TerminalLabelValue,
		AssessmentIDLabelKey, assessmentID)

	pods, err := c.clientset.CoreV1().Pods(c.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list terminal pods: %w", err)
	}

	return pods.Items, nil
}
