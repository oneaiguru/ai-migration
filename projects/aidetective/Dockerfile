# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create media and data directories
RUN mkdir -p /app/media/evidence /app/media/characters /app/media/locations /app/logs /app/data

# Create volume for database
VOLUME /app/data

# Default runtime configuration (overridable)
ENV DATABASE_URL=sqlite+aiosqlite:///app/data/sherlock.db \
    MEDIA_DIR=/app/media

# Run init (only if DB file absent) then start the bot
CMD ["sh", "-c", "DB_PATH=${DATABASE_URL#sqlite+aiosqlite:///}; if [ ! -f \"$DB_PATH\" ]; then python scripts/init_db.py; fi; python main.py"]
