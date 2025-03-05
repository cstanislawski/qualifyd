#!/bin/bash
set -e

# Create k3d cluster if it doesn't exist
if ! k3d cluster list | grep -q "qualifyd-local"; then
    echo "Creating k3d cluster..."
    k3d cluster create --config k8s/local/k3d-config.yaml
else
    echo "Cluster already exists"
fi

# Add and update Helm repos
echo "Adding Helm repositories..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Create namespace for ingress-nginx
echo "Creating ingress-nginx namespace..."
kubectl create namespace ingress-nginx --dry-run=client -o yaml | kubectl apply -f -

# Check if TLS secret exists
if ! kubectl get secret -n ingress-nginx default-certificate &> /dev/null; then
    echo "Creating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /tmp/tls.key -out /tmp/tls.crt \
      -subj "/CN=*.localhost/O=qualifyd"

    echo "Creating TLS secret..."
    kubectl create secret tls default-certificate \
      --key /tmp/tls.key \
      --cert /tmp/tls.crt \
      -n ingress-nginx \
      --dry-run=client -o yaml | kubectl apply -f -

    # Cleanup temporary certificate files
    rm /tmp/tls.key /tmp/tls.crt
else
    echo "TLS secret already exists"
fi

# Install ingress-nginx using Helm
echo "Installing ingress-nginx using Helm..."
helm upgrade --install \
  ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --values k8s/local/values/ingress-nginx-values.yaml \
  --version 4.9.1

# Create application namespace
echo "Creating application namespace..."
kubectl create namespace qualifyd-dev --dry-run=client -o yaml | kubectl apply -f -

# Install PostgreSQL using Helm
echo "Installing PostgreSQL using Helm..."
helm upgrade --install \
  postgresql bitnami/postgresql \
  --namespace qualifyd-dev \
  --values k8s/local/values/postgresql-values.yaml \
  --version 13.2.24

# Install RabbitMQ using Helm
echo "Installing RabbitMQ using Helm..."
helm upgrade --install \
  rabbitmq bitnami/rabbitmq \
  --namespace qualifyd-dev \
  --values k8s/local/values/rabbitmq-values.yaml \
  --version 12.6.1

# Apply backend manifests
echo "Applying backend manifests..."
kubectl apply -f k8s/local/manifests/backend/

# Wait for ingress-nginx to be ready
echo "Waiting for ingress-nginx to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=postgresql \
  --timeout=120s

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=rabbitmq \
  --timeout=120s

echo "Local development environment is ready!"
echo
echo "PostgreSQL credentials:"
echo "  Host: postgresql.qualifyd-dev.svc.cluster.local"
echo "  Port: 5432"
echo "  Database: qualifyd"
echo "  Username: qualifyd"
echo "  Password: qualifyd"
echo
echo "RabbitMQ credentials:"
echo "  Host: rabbitmq.qualifyd-dev.svc.cluster.local"
echo "  AMQP Port: 5672"
echo "  Management Port: 15672"
echo "  Username: qualifyd"
echo "  Password: qualifyd"
echo
echo "Backend service:"
echo "  URL: https://api.localhost"
echo "  Config path: /app/config/config.yaml"
