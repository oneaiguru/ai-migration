FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application
COPY src/ src/
COPY scripts/ scripts/
COPY data/ data/

# Health check (using Python instead of curl - not available in slim image)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run with uvicorn
CMD ["uvicorn", "scripts.api_app:app", "--host", "0.0.0.0", "--port", "8000"]
