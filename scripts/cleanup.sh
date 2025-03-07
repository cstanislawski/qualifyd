#!/bin/bash
set -e

echo "Checking for existing cluster..."
if k3d cluster list | grep -q "qualifyd-local"; then
    echo "Found existing cluster 'qualifyd-local'. Deleting..."
    k3d cluster delete qualifyd-local
    echo "Cluster deleted successfully!"
else
    echo "No existing cluster found."
fi

# Clean up any leftover Docker resources
echo "Cleaning up Docker resources..."
docker volume rm -f k3d-qualifyd-local-images 2>/dev/null || true
docker network rm k3d-qualifyd-local 2>/dev/null || true

echo "Cleanup complete!"
