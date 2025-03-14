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
# Removed hardcoded value to let Kubernetes deployment config set it
ENV NEXT_PUBLIC_WS_HOST=${NEXT_PUBLIC_WS_HOST}
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

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
# Removed hardcoded value to let Kubernetes deployment config set it

# Command to run the application
CMD ["node", "server.js"]
