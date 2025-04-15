#!/bin/bash
set -e

# Define the path for the kubeconfig under the user's home directory
KUBECONFIG_PATH="$HOME/.kube/qualifyd-homeserver-config"

# Ensure KUBECONFIG is set for subsequent helm/kubectl commands
if [ -f "$KUBECONFIG_PATH" ]; then
    export KUBECONFIG="$KUBECONFIG_PATH"
    echo "KUBECONFIG set to $KUBECONFIG_PATH for cleanup."
else
    echo "Warning: Kubeconfig file $KUBECONFIG_PATH not found. Cannot perform cluster cleanup." >&2
    # Optionally exit here if cleanup requires the config
    # exit 1
fi

# Uninstall Helm releases if KUBECONFIG is set
if [ -n "$KUBECONFIG" ] && [ -f "$KUBECONFIG" ]; then
    echo "Uninstalling Helm releases..."
    helm uninstall rabbitmq -n qualifyd-dev --ignore-not-found || echo "Failed to uninstall rabbitmq or already uninstalled."
    helm uninstall postgresql -n qualifyd-dev --ignore-not-found || echo "Failed to uninstall postgresql or already uninstalled."
    helm uninstall ingress-nginx -n ingress-nginx --ignore-not-found || echo "Failed to uninstall ingress-nginx or already uninstalled."

    # Uninstall local-path-provisioner
    LPP_MANIFEST_URL="https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.31/deploy/local-path-storage.yaml"
    echo "Uninstalling local-path-provisioner using $LPP_MANIFEST_URL..."
    kubectl delete -f "$LPP_MANIFEST_URL" --ignore-not-found=true || echo "Failed to uninstall local-path-provisioner or already uninstalled."

    echo "Deleting application namespace..."
    kubectl delete namespace qualifyd-dev --ignore-not-found || echo "Failed to delete namespace qualifyd-dev or already deleted."
    kubectl delete namespace ingress-nginx --ignore-not-found || echo "Failed to delete namespace ingress-nginx or already deleted."

    echo "Deleting TLS secret..."
    kubectl delete secret qualifyd-tls -n ingress-nginx --ignore-not-found || echo "Failed to delete TLS secret or already deleted."
else
    echo "Skipping Helm/kubectl cleanup as KUBECONFIG is not set or file not found."
fi

echo "Cleanup complete!"
