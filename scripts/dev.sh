#!/bin/bash
set -e

# Function to check if a host entry exists
check_host_entry() {
    local host=$1
    if grep -q "127.0.0.1.*$host" /etc/hosts; then
        return 0
    else
        return 1
    fi
}

# Function to add a host entry (requires sudo)
add_host_entry() {
    local host=$1
    echo "Adding $host to /etc/hosts (requires sudo)..."
    echo "127.0.0.1 $host" | sudo tee -a /etc/hosts > /dev/null
}

# Check and add required host entries
required_hosts=("api.localhost" "app.localhost")
for host in "${required_hosts[@]}"; do
    if ! check_host_entry "$host"; then
        add_host_entry "$host"
    fi
done

# Setup local environment
echo "Setting up local environment..."
./scripts/setup-local.sh

# Build and load backend image
echo "Building and loading backend image..."
./scripts/build-backend.sh

# Build and load frontend image
echo "Building and loading frontend image..."
./scripts/build-frontend.sh

# Apply backend manifests
echo "Applying backend manifests..."
kubectl apply -f k8s/local/manifests/backend/

# Apply frontend manifests
echo "Applying frontend manifests..."
kubectl apply -f k8s/local/manifests/frontend/

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app=backend \
  --timeout=120s

# Wait for frontend to be ready
echo "Waiting for frontend to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app=frontend \
  --timeout=120s

echo
echo "Development environment is ready!"
echo
echo "You can access:"
echo "  - Frontend: https://app.localhost"
echo "  - Backend API: https://api.localhost"
echo "  - RabbitMQ Management: http://localhost:15672"
echo "    Username: qualifyd"
echo "    Password: qualifyd"
echo
echo "To view logs:"
echo "  Backend:  kubectl logs -f -n qualifyd-dev -l app=backend"
echo "  Frontend: kubectl logs -f -n qualifyd-dev -l app=frontend"
echo
echo "To rebuild and redeploy:"
echo "  ./scripts/redeploy.sh"
