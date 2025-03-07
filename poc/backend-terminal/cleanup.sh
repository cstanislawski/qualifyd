#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "Cleaning up POC resources..."
kubectl delete -f backend.yaml --ignore-not-found
kubectl delete -f terminal.yaml --ignore-not-found

echo "Removing Docker image..."
docker rmi poc-backend:latest 2>/dev/null || true

echo "Cleanup complete!"
