# Backend Terminal POC

Simple proof of concept that demonstrates:
1. Running a terminal pod in Kubernetes
2. Backend service that can list and monitor terminal pods
3. Basic RBAC setup for pod access

## Quick Start

```bash
# Deploy everything
./deploy.sh

# Run tests
./test.sh

# Clean up when done
./cleanup.sh
```

## Components

- `terminal.yaml`: Terminal pod deployment and service
- `backend.yaml`: Backend service deployment with RBAC
- `main.go`: Simple Go service that lists terminal pods
- `deploy.sh`: Builds and deploys everything
- `test.sh`: Verifies the setup works
- `cleanup.sh`: Removes all POC resources

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /pods`: Lists terminal pods with their status
