#!/bin/bash
set -e

echo "Starting port-forward in background..."
kubectl port-forward svc/poc-backend -n qualifyd-dev 8080:80 &
PF_PID=$!
sleep 2

echo "Testing health endpoint..."
HEALTH=$(curl -s http://localhost:8080/health)
[[ "$HEALTH" == "OK" ]] || { echo "Health check failed"; exit 1; }

echo "Testing pods endpoint..."
PODS=$(curl -s http://localhost:8080/pods)
[[ $(echo "$PODS" | jq '. | length') -gt 0 ]] || { echo "No pods found"; exit 1; }

kill $PF_PID
echo "All tests passed!"
