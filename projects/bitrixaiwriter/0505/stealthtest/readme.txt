# Ozon Anti-Bot Detection Testing

This repository contains two minimal test scripts to evaluate whether Ozon's anti-bot detection systems can be bypassed using:
1. Undetected-chromedriver
2. Playwright with stealth plugins

## Overview

Both scripts attempt to:
- Open Ozon.ru
- Navigate to the login page
- Verify if anti-bot detection or CAPTCHA appears
- Take screenshots at each step
- Log detailed results

The scripts focus only on detecting if the automation is identified, without implementing actual login or product operations.

## Requirements

### Global Requirements
- Python 3.8+
- Chrome browser (for undetected-chromedriver)
- Required browsers will be automatically installed by Playwright

## Setup Instructions

### Option 1: Undetected-ChromeDriver

1. Create a virtual environment:
   ```bash
   python -m venv venv_undetected
   source venv_undetected/bin/activate  # On Windows: venv_undetected\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r undetected_chromedriver_requirements.txt
   ```

3. Run the test:
   ```bash
   python undetected_chromedriver_test.py
   ```

   Optional flags:
   - `--headless`: Run in headless mode (may be less effective at bypassing detection)

### Option 2: Playwright with Stealth Plugins

1. Create a virtual environment:
   ```bash
   python -m venv venv_playwright
   source venv_playwright/bin/activate  # On Windows: venv_playwright\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r playwright_stealth_requirements.txt
   ```

3. Install browser binaries:
   ```bash
   playwright install
   ```

4. Run the test:
   ```bash
   python playwright_stealth_test.py
   ```

   Optional flags:
   - `--headless`: Run in headless mode (may be less effective at bypassing detection)
   - `--browser`: Specify browser engine (chromium, firefox, webkit)

## Output

Both scripts will:
- Save screenshots to the `screenshots/` directory
- Output logs to the console and to log files
- Provide a final verdict on whether bot detection was triggered
- Report detailed metrics on the test execution

## Success Criteria

The scripts will report success if:
- The main page opens without triggering anti-bot detection
- Navigation to the login screen succeeds without triggering anti-bot detection
- No CAPTCHAs or challenges appear
- The navigation behavior appears to be the same as for a regular user

## Troubleshooting

### Undetected-ChromeDriver

- Make sure you have the latest Chrome browser installed
- If you encounter issues with the driver, try removing the `.local-browsers` directory in your home folder to force a new download
- Consider using non-headless mode for better evasion of detection

### Playwright

- Ensure you've installed the browser binaries using `playwright install`
- If detection occurs, try different browser engines (--browser=firefox or --browser=webkit)
- Use non-headless mode for better evasion of detection

## Advanced Configuration

- Both scripts can be extended to include proxy support for better evasion
- Additional human-like behavior patterns can be implemented
- User-Agent rotation and fingerprint manipulation can be enhanced

## Legal Notice

These scripts are for testing and educational purposes only. Always ensure you comply with the website's terms of service and robots.txt directives.
