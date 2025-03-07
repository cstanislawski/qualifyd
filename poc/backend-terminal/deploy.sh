#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "Building POC backend Docker image..."
docker build -t poc-backend:latest .

echo "Loading image into k3d cluster..."
k3d image import poc-backend:latest -c qualifyd-local

echo "Applying Kubernetes manifests..."
kubectl apply -f terminal.yaml
kubectl apply -f backend.yaml

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=Available deployment/terminal-poc -n qualifyd-dev --timeout=60s
kubectl wait --for=condition=Available deployment/poc-backend -n qualifyd-dev --timeout=60s

echo "POC backend deployed successfully!"
echo "You can access the backend at: http://localhost/api/pods (through ingress)"
echo "Or use: kubectl port-forward svc/poc-backend -n qualifyd-dev 8080:80"
