#!/bin/bash
set -e

# Create k3d cluster if it doesn't exist
if ! k3d cluster list | grep -q "qualifyd-local"; then
    echo "Creating k3d cluster..."
    k3d cluster create --config k8s/local/k3d-config.yaml
else
    echo "Cluster already exists"
fi

helm_release_exists() {
    local release=$1
    local namespace=$2
    if helm status "$release" -n "$namespace" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

helm_repo_exists() {
    local repo=$1
    if ! helm repo list | grep -q "$repo"; then
        return 0
    else
        return 1
    fi
}

if ! helm_repo_exists "ingress-nginx"; then
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
fi

if ! helm_repo_exists "bitnami"; then
    helm repo add bitnami https://charts.bitnami.com/bitnami
fi

helm repo update

if ! helm_release_exists "ingress-nginx" "ingress-nginx"; then
    echo "Installing ingress-nginx using Helm..."
    helm upgrade --install \
      ingress-nginx ingress-nginx/ingress-nginx \
      --namespace ingress-nginx \
      --create-namespace \
      --values k8s/local/values/ingress-nginx-values.yaml \
      --version 4.9.1 \
      --set controller.extraArgs.default-ssl-certificate=ingress-nginx/qualifyd-tls
else
    echo "ingress-nginx is already installed"
fi

if ! kubectl get secret -n ingress-nginx qualifyd-tls &> /dev/null; then
    echo "Creating TLS secret from existing certificates..."
    kubectl create secret tls qualifyd-tls \
      --key /Users/cms/certs/qualifyd/qualifyd.test.key \
      --cert /Users/cms/certs/qualifyd/qualifyd.test.crt \
      -n ingress-nginx
else
    echo "TLS secret already exists"
fi

echo "Creating application namespace..."
kubectl create namespace qualifyd-dev

if ! helm_release_exists "postgresql" "qualifyd-dev"; then
    echo "Installing PostgreSQL using Helm..."
    helm upgrade --install \
      postgresql bitnami/postgresql \
      --namespace qualifyd-dev \
      --values k8s/local/values/postgresql-values.yaml \
      --version 13.2.24
else
    echo "PostgreSQL is already installed"
fi

if ! helm_release_exists "rabbitmq" "qualifyd-dev"; then
    echo "Installing RabbitMQ using Helm..."
    helm upgrade --install \
      rabbitmq bitnami/rabbitmq \
      --namespace qualifyd-dev \
      --values k8s/local/values/rabbitmq-values.yaml \
      --version 12.6.1
else
    echo "RabbitMQ is already installed"
fi

echo "Waiting for ingress-nginx to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "Waiting for PostgreSQL to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=postgresql \
  --timeout=120s

echo "Waiting for RabbitMQ to be ready..."
kubectl wait --namespace qualifyd-dev \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=rabbitmq \
  --timeout=120s

echo "Local development environment is ready!"
