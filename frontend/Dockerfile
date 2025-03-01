FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
# Define the build argument
ARG NEXT_PUBLIC_WS_HOST
# Use the build argument value or a default value if not provided
ENV NEXT_PUBLIC_WS_HOST=${NEXT_PUBLIC_WS_HOST:-localhost:8080}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the correct permissions
USER nextjs

# Expose port
EXPOSE 3000

# Define the run-time environment variable
# This will be overridden by any environment variables passed at container start time
ENV NEXT_PUBLIC_WS_HOST=localhost:8080

# Command to run the application
CMD ["node", "server.js"]
