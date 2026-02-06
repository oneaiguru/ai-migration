# Ozon Product Reservation Bot

## Description
This bot is designed for automatic product reservation on the Ozon marketplace. It performs the following actions:
1. Login to Ozon account
2. Scan and add specified products to cart
3. Complete checkout with a selected payment method
4. Send notifications about the results (optional)

## Installation
1. Make sure you have Python 3.8 or higher installed
2. Clone the repository or download the source code
3. Install dependencies:
```
pip install -r requirements.txt
```
4. Copy `config-updated.json` to `config.json` and configure the parameters

## Configuration
Open the `config.json` file and fill in the following parameters:
- `login` - your login (email or phone) for Ozon
- `password` - your password
- `headless` - run in background mode without displaying browser (true/false)
- `user_agent` - User-Agent string to simulate a real browser
- `sku_list` - list of product SKUs to reserve
- `payment_method` - preferred payment method
- `telegram_token` - Telegram bot token for notifications (optional)
- `telegram_chat_id` - Telegram chat ID for notifications (optional)
- `schedule` - automatic launch schedule settings

## Usage
### One-time run
```
python ozon_bot_updated.py run
```

### Run on schedule
```
python ozon_bot_updated.py
```

### Run on schedule with immediate first run
```
python ozon_bot_updated.py start-now
```

### Demo run (no checkout)
```
python ozon_bot_demo.py
```

### Stealth demo (advanced anti-detection, Firefox)
```
python ozon_bot_demo_stealth.py
```

## Logging
All bot actions and errors are logged to the corresponding `*.log` files and output to the console.
Screenshots of critical moments are saved to the `screenshots` folder.

## Telegram Notifications Setup (optional)
1. Create a bot via @BotFather in Telegram and get a token
2. Add the bot to a chat and get the chat ID
3. Enter this data in the configuration file

## System Requirements
- Python 3.8 or higher
- Google Chrome or Chromium
- Internet access and access to ozon.ru
- 512 MB RAM (minimum)

## Troubleshooting
- **Authorization error**: check your login and password
- **CAPTCHA on login**: try running the bot in non-headless mode (headless: false)
- **Products not added to cart**: check SKU correctness
- **Chrome launch error**: install Chrome or update chromedriver

## Additional Information
The bot uses Selenium for browser automation. For reliable operation, it's recommended to run it on a dedicated server or VPS.
