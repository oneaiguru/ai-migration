# Define variables
PROJECT_ROOT := $(shell pwd)
SINGLE_ALCHEM := alembic.ini
MULTI_ALCHEM := alembic_multi.ini

# Define default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  migrate-single          Run migrations for single chatbot setup"
	@echo "  migrate-multi           Run migrations for multi chatbot setup"
	@echo "  revision-single          Create a new migration for single chatbot setup"
	@echo "  revision-multi           Create a new migration for multi chatbot setup"
	@echo "  reset-single-db         Drop and recreate single chatbot database"
	@echo "  reset-multi-db          Drop and recreate multi chatbot database"
	@echo "  init-single-db          Initialize single chatbot database"
	@echo "  init-multi-db           Initialize multi chatbot database"
	@echo "  drop-single-db          Drop single chatbot database"
	@echo "  drop-multi-db           Drop multi chatbot database"
	@echo "  create-backup           Create a timestamped backup of the project"
	@echo "  run                     Run the chatbot application"
	@echo "  help                    Show this help message"

# Migration targets
.PHONY: migrate-single
migrate-single:
	@echo "Running migrations for single chatbot setup..."
	alembic -c $(SINGLE_ALCHEM) upgrade head

.PHONY: migrate-multi
migrate-multi:
	@echo "Running migrations for multi chatbot setup..."
	alembic -c $(MULTI_ALCHEM) upgrade head

# Revision targets
.PHONY: revision-single
revision-single:
	@echo "Creating new migration for single chatbot setup..."
	alembic -c $(SINGLE_ALCHEM) revision --autogenerate -m "$(msg)"

.PHONY: revision-multi
revision-multi:
	@echo "Creating new migration for multi chatbot setup..."
	alembic -c $(MULTI_ALCHEM) revision --autogenerate -m "$(msg)"

# Database reset targets
.PHONY: reset-single-db
reset-single-db: drop-single-db init-single-db
	@echo "Single chatbot database has been reset."

.PHONY: reset-multi-db
reset-multi-db: drop-multi-db init-multi-db
	@echo "Multi chatbot database has been reset."

# Initialize database targets
.PHONY: init-single-db
init-single-db:
	@echo "Initializing single chatbot database..."
	python database/init_db.py PROJECT_TYPE=single

.PHONY: init-multi-db
init-multi-db:
	@echo "Initializing multi chatbot database..."
	python database/init_db.py PROJECT_TYPE=multi

# Drop database targets
.PHONY: drop-single-db
drop-single-db:
	@echo "Dropping single chatbot database..."
	psql -U postgres -c "DROP DATABASE IF EXISTS single_chatbot_db;"

.PHONY: drop-multi-db
drop-multi-db:
	@echo "Dropping multi chatbot database..."
	psql -U postgres -c "DROP DATABASE IF EXISTS multi_chatbot_db;"

# Backup target
.PHONY: create-backup
create-backup:
	@echo "Creating a backup of the project..."
	python backupdbmigr.py

# Run the application
.PHONY: run
run:
	@echo "Running the chatbot application..."
	python main.py
