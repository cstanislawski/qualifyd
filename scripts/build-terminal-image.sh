#!/bin/bash
set -e

# Script to build the terminal image and load it into the local Kubernetes cluster

# Directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Project root directory (parent of script directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Build the terminal image
echo "Building terminal image..."
docker build -t qualifyd-terminal:dev -f ${PROJECT_ROOT}/k8s/local/manifests/terminal/Dockerfile ${PROJECT_ROOT}

# Load the image into the local Kubernetes cluster
echo "Loading image into local Kubernetes cluster..."
k3d image import qualifyd-terminal:dev -c qualifyd-local

echo "Terminal image built and loaded successfully."
