# Souz-Pribor Text Rewriter

A system for automating the rewriting of product descriptions for the Souz-Pribor online store using Claude AI.

## Features

- Export product data from Bitrix CMS
- Generate unique descriptions using Claude AI
- Check uniqueness of generated texts
- Upload new descriptions back to Bitrix
- Web interface for monitoring and manual editing
- Command-line interface for automation

## Requirements

- PHP 8.0 or higher
- Access to Bitrix API
- Access to Claude API (Anthropic)
- Composer for dependency management

## Installation

1. Clone the repository:

```bash
git clone https://github.com/granin/text-rewriter.git
cd text-rewriter
```

2. Install dependencies:

```bash
composer install
```

3. Create necessary directories:

```bash
mkdir -p logs output
chmod 755 logs output
```

4. Copy and edit configuration file:

```bash
cp config/config.example.json config/config.json
nano config/config.json
```

## Configuration

Edit `config/config.json` with your settings:

```json
{
    "bitrix": {
        "endpoint": "https://www.souz-pribor.ru/rest",
        "login": "your_username",
        "password": "your_password",
        "timeout": 30
    },
    "claude": {
        "api_key": "your_claude_api_key",
        "model": "claude-3-sonnet-20240229",
        "temperature": 0.7,
        "max_tokens": 1000,
        "top_p": 0.9
    },
    "uniqueness": {
        "threshold": 70,
        "use_external_api": true,
        "text_database": "output/text_database.txt",
        "retry_attempts": 3
    },
    "batch_size": 10,
    "log_file": "logs/rewrite.log",
    "save_history": true,
    "output_dir": "output",
    "debug": false
}
```

## Usage

### Command Line Interface

Process products (with optional filter and limit):

```bash
php src/cli.php --action=process [--filter=<json>] [--limit=<number>] [--verbose]
```

Test on a single product:

```bash
php src/cli.php --action=test --product-id=<id> [--verbose]
```

Export products from Bitrix:

```bash
php src/cli.php --action=export [--filter=<json>] [--verbose]
```

Import products to Bitrix:

```bash
php src/cli.php --action=import --file=<path> [--verbose]
```

### Web Interface

Access the web interface at:

```
http://your-server/path-to-system/web/admin/
```

## Testing

Run the test suite:

```bash
composer test
```

Generate test coverage report:

```bash
composer test-coverage
```

## Project Structure

```
├── config/               - Configuration files
├── logs/                 - Log files
├── output/               - Output files and database
├── src/                  - Source code
│   ├── Api/              - API integration classes
│   │   ├── BitrixApiClient.php
│   │   └── ClaudeApiClient.php
│   ├── Core/             - Core components
│   │   ├── PromptGenerator.php
│   │   ├── TextRewriteController.php
│   │   └── UniquenessChecker.php
│   └── cli.php           - CLI entry point
├── tests/                - Test suite
│   └── Unit/             - Unit tests
└── web/                  - Web interface
    └── admin/            - Admin panel
        └── index.html    - Main admin page
```

## Support

For technical support, contact:

- Email: support@granin.com
- Telegram: @granin
