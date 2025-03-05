#!/bin/bash
set -e

# Build the frontend image
echo "Building frontend image..."
docker build -t qualifyd-frontend:dev ./frontend

# Import the image into k3d
echo "Importing image into k3d..."
k3d image import qualifyd-frontend:dev -c qualifyd-local

echo "Frontend image built and imported successfully!"
