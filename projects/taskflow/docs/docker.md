# Docker Usage

This project can be containerized for both production and development.

## Building the Image

The project uses a multi-stage Dockerfile. Build the development or production
images as needed:

```bash
# Development image with hot reload
docker build -t taskflow:dev --target development .

# Optimized production image
docker build -t taskflow:latest --target production .
```

Both images expose port `8000` and store persistent data in `/data`.

## Running in Production

```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/data \
  --env-file .env \
  --name taskflow \
  taskflow:latest
```

## Development with Docker Compose

A `docker-compose.yml` file is provided for development. It uses the
`development` stage of the Dockerfile, mounts the project directory and enables
hot reloading.

```bash
docker compose up --build
```

## Environment Variables

Configuration is loaded from `.env`. The Dockerfile sets defaults so data files
reside in `/data` inside the container. Mount a volume at this location to keep
state between runs. Secrets for production should be supplied via environment
variables or Docker secrets rather than baking them into the image.

## Health Checks and Logs

Both the Dockerfile and compose configuration define health checks on
`/api/metrics`. Logs are printed to STDOUT and can be viewed with `docker logs`
or via the compose output.

## Data Persistence & Backups

Application state is stored under `/data`. In production mount this directory
from a durable volume. Regularly back up the volume or copy the JSON and
database files to external storage.

## Monitoring

The `/api/metrics` endpoint can be scraped by a monitoring system to observe
application health.
