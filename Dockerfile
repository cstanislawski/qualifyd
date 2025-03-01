# Build stage
FROM golang:1.24-alpine AS builder

# Install required dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o qualifyd ./cmd/server

# Final stage
FROM alpine:3.18

# Install necessary packages
RUN apk add --no-cache ca-certificates tzdata bash

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/qualifyd .

# Copy UI templates and static files
COPY ui/ ./ui/

# Set environment variables
ENV PORT=8080
ENV GIN_MODE=release

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["./qualifyd"]
