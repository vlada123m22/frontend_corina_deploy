# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - Nginx server
FROM nginx:alpine

# Install envsubst for template variable substitution
RUN apk add --no-cache gettext

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create nginx entrypoint script to substitute environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst "\$BACKEND_HOST" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Set default environment variables (can be overridden at runtime)
ENV BACKEND_HOST=backend:8081

# Run nginx with environment substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
