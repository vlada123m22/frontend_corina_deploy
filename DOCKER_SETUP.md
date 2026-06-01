# Docker Setup Guide

## Overview
This project is containerized with Docker using:
- **Frontend**: React app built and served through Nginx
- **Nginx**: Reverse proxy that masks the backend address and handles API routing
- **Environment Variables**: Dynamic configuration for backend address

## Architecture

```
User Request
    ↓
Nginx (Port 80)
    ↓
/api/* → Proxied to Backend (strips /api prefix)
/      → React Frontend (SPA fallback)
```

## Quick Start with Docker Compose

### 1. Prerequisites
- Docker Desktop installed
- Docker Compose installed

### 2. Configuration

#### Development Setup (with Docker Compose)
The `.env` file is already configured for local Docker Compose:
```env
BACKEND_HOST=backend:8081
```

#### Production Setup
To deploy to production, update `.env` with your actual backend address:
```env
BACKEND_HOST=your-production-api.com:8081
```

### 3. Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build
```

Access the app at: `http://localhost`

## Building and Running Individual Services

### Build the Docker image
```bash
docker build -t hackathon-frontend:latest .
```

### Run the container
```bash
# With environment variable from .env
docker run -p 80:80 --env-file .env hackathon-frontend:latest

# With inline environment variable
docker run -p 80:80 -e BACKEND_HOST=api.example.com:8081 hackathon-frontend:latest
```

## How Environment Variables Work

1. **Dockerfile** sets `ENV BACKEND_HOST=backend:8081` as default
2. **nginx.conf.template** uses `${BACKEND_HOST}` as placeholder
3. **Entrypoint script** uses `envsubst` to substitute the actual value into nginx config
4. **Environment variables** can be overridden by:
   - `.env` file (via docker-compose)
   - `-e BACKEND_HOST=...` (via docker run)
   - Environment variables in orchestration platform (Kubernetes, etc.)

## Nginx Configuration Details

The nginx reverse proxy is configured to:
- Listen on port 80
- Route `/api/*` requests to the backend (stripping the `/api` prefix)
- Serve React frontend files with SPA fallback (try_files)
- Forward necessary headers (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)

**Current configuration**: `nginx.conf.template` strips `/api` prefix before forwarding

Example:
```
Client: GET /api/teams
  ↓
Nginx: GET http://backend:8081/teams
```

## Frontend API Usage

In your React components, make API calls to `/api`:
```javascript
fetch('/api/teams')
  .then(res => res.json())
  .then(data => console.log(data))
```

The nginx reverse proxy will forward this to `http://backend:8081/teams`.

## Development vs Production

### Development (with npm start)
- Uses `setupProxy.js` for local proxy
- Backend hardcoded to `http://localhost:8081`
- Run: `npm start`

### Production (with Docker)
- Uses nginx reverse proxy
- Backend configurable via `BACKEND_HOST` environment variable
- Build: `docker build -t my-app .`
- Run: `docker run -p 80:80 -e BACKEND_HOST=api.example.com:8081 my-app`

## Troubleshooting

### Backend connection fails
1. Verify `BACKEND_HOST` is correctly set
2. Check backend service is running and accessible
3. Review nginx logs: `docker-compose logs frontend`

### API requests returning 502 Bad Gateway
1. Ensure backend is running
2. Check the backend URL in `BACKEND_HOST`
3. Verify network connectivity between containers (if using docker-compose)

### Environment variables not being substituted
1. Check `.env` file syntax
2. Restart the container after changing environment
3. Verify `envsubst` has the variable: `docker exec <container> env`

## Files Modified/Created

- **Dockerfile**: Updated entrypoint script with proper variable escaping
- **.env**: Contains environment variables for docker-compose
- **.env.example**: Template showing available configuration
- **.dockerignore**: Optimizes build by excluding unnecessary files
- **docker-compose.yml**: Orchestrates frontend and backend services
- **nginx.conf.template**: Nginx configuration with environment variable placeholder

## Next Steps

1. Update the `backend` service in `docker-compose.yml` with your actual backend configuration
2. Test locally with `docker-compose up`
3. Push to your Docker registry when ready
4. Deploy to production with updated `BACKEND_HOST`
