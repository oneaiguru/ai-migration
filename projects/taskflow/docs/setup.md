# Setup and Deployment Guide

This document explains how to install, configure, deploy and develop TaskFlow.ai.

## 1. Installation Guide

### System Requirements
- Python 3.8+
- Git
- Optional: Docker and Docker Compose

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow-ai.git
   cd taskflow-ai
   ```
2. *(Optional)* create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -e .[dev]
   ```
4. Run the setup script:
   ```bash
   python scripts/setup.py
   ```
5. Copy and edit the example environment file:
   ```bash
   cp .env.example .env
   # edit .env with your values
   ```

### Docker Setup
1. Build the container image:
   ```bash
   docker build -t taskflow:latest .
   ```
2. Start the development stack:
   ```bash
   docker compose up --build
   ```

### Production Deployment
- Set `ENV=production` in your environment file.
- Use the Docker image with your secrets mounted:
   ```bash
   docker run -d \
     --env-file .env \
     -p 8000:8000 \
     taskflow:latest
   ```
- Configure persistent volumes for `/data`.

## 2. Configuration Guide

### Environment Variables
All components read settings from the environment or `.env` file. See
[configuration.md](configuration.md) for defaults. Important variables include:
- `TELEGRAM_TOKEN` – Telegram bot token
- `AUTHORIZED_USERS` – comma-separated list of user IDs
- `WEB_USER` and `WEB_PASSWORD` – dashboard credentials
- `API_KEY` – key for external services

### Authentication Setup
- Create a Telegram bot via [@BotFather](https://t.me/BotFather) and place the
  token in `TELEGRAM_TOKEN`.
- Set `WEB_USER` and `WEB_PASSWORD` for the web interface.

### Git Integration
TaskFlow.ai relies on Git for synchronization. Commit your changes with the
appropriate tags and push frequently:
```bash
git commit -m "[PENDING-L4] implement feature"
git push
```

### Template Configuration
Templates live in `templates/`. Manage them through the web dashboard or CLI.

## 3. Usage Documentation

### Web Interface Guide
Start the results viewer:
```bash
./tools/run.sh webui
```
Open `http://localhost:8000` and log in with your dashboard credentials.

### API Documentation
Run the FastAPI server and visit `/docs` for interactive API docs:
```bash
./tools/run.sh server
```
Example request using `curl`:
```bash
curl -X POST -u $WEB_USER:$WEB_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo task"}' \
  http://localhost:8000/api/tasks
```

### Mobile Interface Guide
Open `mobile-form/index.html` on your phone to create tasks offline.

### CLI Usage
Common commands:
```bash
./tools/run.sh cli list          # list tasks
./tools/run.sh cli execute 1     # execute task 1
```

## 4. Troubleshooting

### Common Issues and Solutions
- **Setup script fails** – ensure Python and Git are installed and in your PATH.
- **Bot cannot start** – verify `TELEGRAM_TOKEN` and `AUTHORIZED_USERS`.
- **Web server not accessible** – check `WEB_HOST` and `WEB_PORT`.

### Log Analysis Guide
Logs are written to `taskflow.log`. Review errors and stack traces to diagnose
problems. Use `docker logs` if running in containers.

### Performance Optimization
- Run the server in production mode with `ENV=production`.
- Use a persistent database and enable caching for heavy API calls.

### Backup and Recovery
- Regularly back up the `tasks.json` file or database.
- Export templates with `./tools/run.sh cli templates export`.

## 5. Development Guide

### Code Structure
- `bot/` – Telegram bot implementation
- `cli/` – command line interface
- `core/` – core library and docs
- `web/` and `webui/` – web server and dashboard

### Adding New Features
1. Create a task with the mobile form or bot.
2. Implement the feature in a new Git branch.
3. Open a pull request once tests pass.

### Testing Procedures
Run the following before committing:
```bash
flake8 bot/
bash -n tools/*.sh
pytest
```

### Contribution Guidelines
- Follow commit message style `[AI-L4] scope: summary`.
- Open pull requests against `main` and await review.
- See `AGENTS.md` for more information.
