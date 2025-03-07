FROM ubuntu:24.04

# Install necessary packages
RUN apt-get update && apt-get install -y \
    openssh-server \
    sudo \
    curl \
    wget \
    vim \
    nano \
    git \
    iputils-ping \
    net-tools \
    dnsutils \
    iproute2 \
    procps \
    htop \
    jq \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for assessments
RUN useradd -m -s /bin/bash candidate && \
    echo "candidate:password" | chpasswd && \
    adduser candidate sudo && \
    echo "candidate ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/candidate

# Configure SSH
RUN mkdir /var/run/sshd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Set up working directory for assessments
WORKDIR /home/candidate/assessment
RUN chown -R candidate:candidate /home/candidate/assessment

# Add a healthcheck script for Kubernetes readiness
COPY <<EOF /healthcheck.sh
#!/bin/bash
# Simple healthcheck that verifies SSH is running
if ps aux | grep -q "[s]shd"; then
  exit 0
else
  exit 1
fi
EOF

RUN chmod +x /healthcheck.sh

# Set user to non-root for security
USER candidate

# Add a welcome message
RUN echo "echo 'Welcome to the Qualifyd Assessment Environment'" >> /home/candidate/.bashrc

# Switch back to root to start SSH service
USER root

# Expose SSH port
EXPOSE 22

# Start SSH server
CMD ["/usr/sbin/sshd", "-D"]
