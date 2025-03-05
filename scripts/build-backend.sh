#!/bin/bash
set -e

# Build the backend image
echo "Building backend image..."
docker build -t qualifyd-backend:dev ./backend

# Import the image into k3d
echo "Importing image into k3d..."
k3d image import qualifyd-backend:dev -c qualifyd-local

echo "Backend image built and imported successfully!"
