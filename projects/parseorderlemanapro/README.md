# Lemana PRO Order Parsers

Two working Selenium scripts for extracting order line items from Lemana PRO. Both read order URLs from `order_urls.txt` and save results to Excel while keeping screenshots and HTML dumps for debugging.

## Contents
- `enhanced-lemana-parser.py`: Uses undetected-chromedriver (fallback to stock ChromeDriver) with login prompts and multiple extraction strategies.
- `lemana-parser.py`: Connects to an AdsPower profile via its local API and scrapes through the attached Selenium session.
- `order_urls.txt`: Sample list of order or receipt detail URLs to process. Replace with your own.
- `requirements.txt`: Python dependencies.
- `.gitignore`: Keeps log/screenshot/output artifacts out of git.

## Setup
1) Install Python 3.10+ and Chrome/Chromium.  
2) Install dependencies: `pip install -r requirements.txt` (requires `openpyxl` for Excel writes).  
3) For AdsPower mode, ensure the local AdsPower API is running and you have a profile ID.

## Running the enhanced parser (no AdsPower)
1) Update `order_urls.txt` with target Lemana order/receipt URLs (one per line).  
2) Run `python enhanced-lemana-parser.py`.  
3) When the browser opens, complete the SMS login if prompted; the script waits up to 5 minutes and then processes each URL, writing `lemana_results_<timestamp>.xlsx` plus checkpoints/intermediate files.

## Running with AdsPower
1) Ensure AdsPower is running locally (`http://local.adspower.net:50325` by default).  
2) Set your AdsPower profile ID in `USER_ID` inside `lemana-parser.py` (or supply it when prompted).  
3) Run `python lemana-parser.py`. It attaches to the AdsPower profile, visits each URL from `order_urls.txt`, and saves results and artifacts under `results/`. The script now uses the chromedriver path returned by AdsPower to avoid version mismatches.

## Output notes
- Both scripts emit screenshots and page sources for debugging; these are git-ignored.  
- Logs (`lemana_parser.log`, `lemana_adspower.log`, etc.) and Excel outputs accumulate alongside the scripts.  
- Extraction logic combines DOM scraping, regex on full page text, and JSON/script tag parsing to cope with layout changes.
