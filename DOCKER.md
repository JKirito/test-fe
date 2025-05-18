# Docker Setup for Einstein Frontend

This document provides instructions for using Docker with the Einstein Frontend application.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Docker Configuration Files

The project includes the following Docker-related files:

- `Dockerfile`: Multi-stage build file for both development and production environments
- `.dockerignore`: Specifies files and directories to exclude from the Docker build
- `docker-compose.yml`: Defines services for development and production

## Development Environment

To start the application in development mode:

```bash
docker-compose up app-dev
```

This will:
- Build the Docker image using the development target
- Start a container with the application running on port 3000
- Mount your local directory to enable hot reloading
- Forward port 3000 to your host machine

You can access the application at http://localhost:3000

## Production Environment

To build and run the production version:

```bash
docker-compose up app-prod
```

This will:
- Build the Docker image using the production target
- Create an optimized production build
- Serve the static files using Nginx on port 80

You can access the production build at http://localhost

## Building Docker Images Manually

If you prefer to build the images manually:

### Development Image

```bash
docker build --target development -t einstein-frontend:dev .
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules einstein-frontend:dev
```

### Production Image

```bash
docker build --target production -t einstein-frontend:prod .
docker run -p 80:80 einstein-frontend:prod
```

## Environment Variables

To use environment variables with Docker:

1. Create a `.env` file in the project root
2. Add your environment variables to this file
3. Update the `docker-compose.yml` file to include:

```yaml
services:
  app-dev:
    env_file:
      - .env
```

## Troubleshooting

### Node Modules Issues

If you encounter issues with node modules, you can rebuild the container:

```bash
docker-compose down
docker-compose build --no-cache app-dev
docker-compose up app-dev
```

### Port Conflicts

If port 3000 or 80 is already in use, you can modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Maps container port 3000 to host port 3001
```
