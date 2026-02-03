# Stage 1: install base dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: development image with hot reload
FROM python:3.11-slim AS development
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=development

# Copy installed packages from builder and install dev extras
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
COPY requirements-dev.txt .
RUN pip install --user --no-cache-dir -r requirements-dev.txt

COPY . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost:8000/api/metrics || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Stage 3: production runtime
FROM python:3.11-slim AS production
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=production \
    TASKS_FILE=/data/tasks.json \
    GALLERY_FILE=/data/gallery.json \
    DB_PATH=/data/taskflow.db \
    LOG_LEVEL=INFO

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Add non-root user
RUN addgroup --system app && adduser --system --ingroup app appuser
USER appuser

COPY . .

VOLUME ["/data"]
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost:8000/api/metrics || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
