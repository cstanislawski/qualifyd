#!/bin/bash
set -e

# Define the path for the fetched kubeconfig under the user's home directory
KUBECONFIG_DIR="$HOME/.kube"
KUBECONFIG_NAME="qualifyd-homeserver-config"
KUBECONFIG_PATH="$KUBECONFIG_DIR/$KUBECONFIG_NAME"
HOMESERVER="root@homeserver"

# Ensure the .kube directory exists
mkdir -p "$KUBECONFIG_DIR"

# Fetch kubeconfig from homeserver /etc/kubernetes/admin.conf
echo "Fetching kubeconfig from $HOMESERVER:/etc/kubernetes/admin.conf..."
if ssh "$HOMESERVER" "cat /etc/kubernetes/admin.conf" > "$KUBECONFIG_PATH"; then
    echo "Kubeconfig saved locally to $KUBECONFIG_PATH"
else
    echo "Failed to fetch kubeconfig from $HOMESERVER. Ensure the cluster is running and accessible." >&2
    exit 1
fi

export KUBECONFIG="$KUBECONFIG_PATH"

# --- Proceed with setting up Helm charts and namespaces ---

# Set context to use the fetched config (optional, as KUBECONFIG is set)
# Might need adjustment based on actual context name in admin.conf
# context_name=$(kubectl config view -o jsonpath='{.current-context}')
# echo "Ensuring kubectl context is set to '$context_name'..."
# kubectl config use-context "$context_name"

# Install local-path-provisioner if not already installed
LPP_NAMESPACE="local-path-storage"
LPP_DEPLOYMENT="local-path-provisioner"
LPP_MANIFEST_URL="https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.31/deploy/local-path-storage.yaml"

echo "Checking if local-path-provisioner is installed..."
if ! kubectl get namespace "$LPP_NAMESPACE" &> /dev/null; then
    echo "Installing local-path-provisioner from $LPP_MANIFEST_URL..."
    kubectl apply -f "$LPP_MANIFEST_URL"
    echo "Waiting for local-path-provisioner deployment to be ready..."
    kubectl wait --namespace "$LPP_NAMESPACE" \
      --for=condition=available deployment/"$LPP_DEPLOYMENT" \
      --timeout=120s
    echo "local-path-provisioner installed successfully."
else
    echo "local-path-provisioner already installed."
    # Ensure it's ready even if already installed
    echo "Ensuring local-path-provisioner deployment is ready..."
    kubectl wait --namespace "$LPP_NAMESPACE" \
      --for=condition=available deployment/"$LPP_DEPLOYMENT" \
      --timeout=120s --ignore-not-found=true # Ignore not found if it was somehow deleted manually
fi

# Ensure 'local-path' is the default storage class
echo "Setting 'local-path' as the default storage class..."
# Remove default annotation from any other storage classes first
kubectl get sc --no-headers -o custom-columns=":metadata.name" | while read -r sc_name; do
    if [[ "$sc_name" != "local-path" ]]; then
        echo "Removing default annotation from StorageClass '$sc_name' (if set)..."
        kubectl patch sc "$sc_name" -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}' --ignore-not-found=true
    fi
done
# Set local-path as default
kubectl patch sc local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
echo "'local-path' is now the default storage class."

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

echo "Local development environment setup using homeserver cluster is ready!"
