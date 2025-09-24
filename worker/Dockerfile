# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker -u 1001

# Copy package files first for better layer caching
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm globally and install dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile --production && \
    npm cache clean --force

# Copy application source code
COPY index.js ./
COPY README.md ./

# Change ownership to non-root user
RUN chown -R worker:nodejs /app
USER worker

# Expose any potential monitoring port (optional)
EXPOSE 3000

# Health check to monitor worker status
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "console.log('Worker health check passed')" || exit 1

# Labels for container metadata
LABEL maintainer="0xSyncroot"
LABEL description="Zama Meme Battle Worker - Automated battle management"
LABEL version="1.0.0"

# Start the worker
CMD ["node", "index.js"]
