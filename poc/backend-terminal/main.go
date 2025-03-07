package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type PodInfo struct {
	Name       string `json:"name"`
	Phase      string `json:"phase"`
	IP         string `json:"ip"`
	Conditions []struct {
		Type   string `json:"type"`
		Status string `json:"status"`
	} `json:"conditions"`
}

func main() {
	// Initialize Kubernetes client
	clientset, err := getKubernetesClient()
	if err != nil {
		log.Fatalf("Error initializing Kubernetes client: %v", err)
	}

	// Define HTTP handlers
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
	})

	http.HandleFunc("/pods", func(w http.ResponseWriter, r *http.Request) {
		pods, err := clientset.CoreV1().Pods("qualifyd-dev").List(r.Context(), metav1.ListOptions{
			LabelSelector: "app=terminal-poc",
		})
		if err != nil {
			log.Printf("Error listing pods: %v", err)
			http.Error(w, "Failed to list pods", http.StatusInternalServerError)
			return
		}

		var podInfos []PodInfo
		for _, pod := range pods.Items {
			info := PodInfo{
				Name:  pod.Name,
				Phase: string(pod.Status.Phase),
				IP:    pod.Status.PodIP,
			}
			for _, condition := range pod.Status.Conditions {
				info.Conditions = append(info.Conditions, struct {
					Type   string `json:"type"`
					Status string `json:"status"`
				}{
					Type:   string(condition.Type),
					Status: string(condition.Status),
				})
			}
			podInfos = append(podInfos, info)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(podInfos)
	})

	// Start HTTP server
	port := "8080"
	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func getKubernetesClient() (*kubernetes.Clientset, error) {
	// Try in-cluster config first
	config, err := rest.InClusterConfig()
	if err != nil {
		// Fall back to kubeconfig
		home := os.Getenv("HOME")
		kubeconfig := filepath.Join(home, ".kube", "config")
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("failed to create k8s config: %v", err)
		}
	}

	// Create clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create k8s clientset: %v", err)
	}

	return clientset, nil
}
