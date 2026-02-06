# CLAUDE.md - AI Detective Bot Guide

## Commands
- Run tests: `pytest`
- Run specific test: `pytest path/to/test_file.py::test_function_name`
- Run BDD tests: `behave`
- Database initialization: `python scripts/init_db.py`
- Deploy with Docker: `docker build -t sherlock-bot .` and `docker run sherlock-bot`
- Deploy with Docker Compose: `docker-compose up -d`

## Code Style Guidelines
- **Imports**: Group by (1) Python standard library, (2) third-party, (3) local imports. Alphabetize within groups.
- **Typing**: Use type hints for all functions/methods. Specify return types.
- **Naming**: snake_case for functions/variables, PascalCase for classes, UPPERCASE for constants.
- **Error handling**: Use custom exceptions (SherlockBotError hierarchy). Utilize try/except with specific exceptions.
- **Documentation**: Google-style docstrings with parameters and return values.
- **Architecture**: Follow repository pattern for database. Use dependency injection. Separate concerns clearly.
- **Logging**: Use structured logging with proper levels based on environment.

## Project Structure
This Telegram bot enables interactive detective stories with story progression, evidence collection, and character interactions. The codebase uses SQLAlchemy ORM, async/await patterns, and FSM for conversation flow.