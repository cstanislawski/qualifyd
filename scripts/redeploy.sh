#!/bin/bash
set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -b, --backend   Rebuild and redeploy backend only"
    echo "  -f, --frontend  Rebuild and redeploy frontend only"
    echo "  -h, --help      Show this help message"
    echo
    echo "If no options are provided, both services will be redeployed."
}

# Initialize flags
deploy_backend=false
deploy_frontend=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--backend)
            deploy_backend=true
            shift
            ;;
        -f|--frontend)
            deploy_frontend=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# If no specific service was selected, deploy both
if [[ $deploy_backend == false && $deploy_frontend == false ]]; then
    deploy_backend=true
    deploy_frontend=true
fi

redeploy_backend() {
    echo "Rebuilding and redeploying backend..."
    ./scripts/build-backend.sh
    kubectl rollout restart -n qualifyd-dev deployment/backend
    echo "Waiting for backend to be ready..."
    kubectl wait --namespace qualifyd-dev \
        --for=condition=ready pod \
        --selector=app=backend \
        --timeout=120s
    echo "Backend redeployed successfully!"
}

redeploy_frontend() {
    echo "Rebuilding and redeploying frontend..."
    ./scripts/build-frontend.sh
    kubectl rollout restart -n qualifyd-dev deployment/frontend
    echo "Waiting for frontend to be ready..."
    kubectl wait --namespace qualifyd-dev \
        --for=condition=ready pod \
        --selector=app=frontend \
        --timeout=120s
    echo "Frontend redeployed successfully!"
}

# Deploy selected services
if [[ $deploy_backend == true ]]; then
    redeploy_backend
fi

if [[ $deploy_frontend == true ]]; then
    redeploy_frontend
fi

echo "Redeployment complete!"
