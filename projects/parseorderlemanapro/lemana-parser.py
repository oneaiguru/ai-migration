"""
Lemana PRO Data Extractor using AdsPower

This script extracts order data from Lemana PRO using AdsPower anti-detect browser.
It handles browser fingerprinting protection and prevents detection.
"""

import time
import requests
import json
import os
import random
import re
import pandas as pd
from datetime import datetime
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("lemana_adspower.log"),
        logging.StreamHandler()
    ]
)

# Configuration settings
ADSPOWER_API_URL = "http://local.adspower.net:50325"  # Default AdsPower API URL
USER_ID = "your_adspower_profile_id"  # Replace with your AdsPower profile ID
INPUT_FILE = "order_urls.txt"
OUTPUT_DIR = "results"

def get_adspower_browser(user_id):
    """Start an AdsPower browser and connect to it with Selenium."""
    logging.info(f"Starting AdsPower browser for profile {user_id}")
    
    # API endpoint to start the browser
    start_url = f"{ADSPOWER_API_URL}/api/v1/browser/start?user_id={user_id}"
    
    try:
        # Make API request to start browser
        response = requests.get(start_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") != 0:
            error_msg = f"Failed to start AdsPower browser: {data.get('msg')}"
            logging.error(error_msg)
            raise Exception(error_msg)
        
        # Get the debugger address for Selenium
        debug_address = data.get("data", {}).get("ws", {}).get("selenium")
        driver_path = data.get("data", {}).get("webdriver")
        if not debug_address:
            error_msg = "AdsPower response missing Selenium websocket address"
            logging.error(error_msg)
            raise Exception(error_msg)
        
        logging.info(f"Browser started with debug address: {debug_address}")
        if driver_path:
            logging.info(f"Using AdsPower-provided chromedriver: {driver_path}")
        
        # Connect to browser using Selenium
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", debug_address)
        
        # Create driver
        if driver_path:
            service = Service(driver_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            driver = webdriver.Chrome(options=chrome_options)
        
        return driver, user_id
    
    except requests.RequestException as e:
        logging.error(f"Network error starting AdsPower browser: {e}")
        raise
    except Exception as e:
        logging.error(f"Error starting AdsPower browser: {e}")
        raise

def close_adspower_browser(user_id):
    """Close an AdsPower browser via API."""
    logging.info(f"Closing AdsPower browser for profile {user_id}")
    
    # API endpoint to close the browser
    close_url = f"{ADSPOWER_API_URL}/api/v1/browser/stop?user_id={user_id}"
    
    try:
        response = requests.get(close_url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") != 0:
            logging.warning(f"Failed to close browser: {data.get('msg')}")
        else:
            logging.info("Browser closed successfully")
        
    except requests.RequestException as e:
        logging.error(f"Network error closing AdsPower browser: {e}")
    except Exception as e:
        logging.error(f"Error closing browser: {e}")

def simulate_human_behavior(driver):
    """Simulate realistic human browsing behavior."""
    try:
        # Random initial wait (like a human would wait for page to settle)
        time.sleep(random.uniform(3.0, 5.0))
        
        # Get viewport dimensions (safely)
        try:
            viewport_height = driver.execute_script("return window.innerHeight") or 900
            viewport_width = driver.execute_script("return window.innerWidth") or 1600
        except:
            viewport_height = 900
            viewport_width = 1600
        
        # Scroll to random positions (safely)
        try:
            # Get document height safely
            body_height = driver.execute_script("return document.body ? document.body.scrollHeight : 1000") or 1000
            
            # Initial scroll down to see content
            driver.execute_script(f"window.scrollTo(0, 300)")
            time.sleep(random.uniform(1.0, 2.0))
            
            # More scrolling with pauses
            for _ in range(random.randint(3, 5)):
                scroll_position = random.randint(300, min(body_height - 200, 1000))
                driver.execute_script(f"window.scrollTo(0, {scroll_position})")
                time.sleep(random.uniform(1.0, 3.0))
                
                # Occasionally scroll back up slightly (like a human re-reading)
                if random.random() < 0.3:
                    scroll_back = random.randint(50, 150)
                    new_position = max(0, scroll_position - scroll_back)
                    driver.execute_script(f"window.scrollTo(0, {new_position})")
                    time.sleep(random.uniform(0.5, 1.5))
        except Exception as e:
            logging.debug(f"Error during scrolling: {e}")
            
        # Longer pause as if reading content
        time.sleep(random.uniform(2.0, 4.0))
        
    except Exception as e:
        logging.warning(f"Error in human behavior simulation: {e}")

def extract_number(text):
    """Extract a number from text, removing spaces and non-numeric characters."""
    if not text:
        return None
    
    # Remove currency symbols and spaces
    cleaned = re.sub(r'[^\d.,]', '', text.replace(' ', ''))
    
    # Replace comma with dot for decimal point
    cleaned = cleaned.replace(',', '.')
    
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None

def is_vpn_block_page(driver):
    """Check if the current page is a VPN block page."""
    try:
        # Check for the VPN error message text
        vpn_indicators = [
            "Сайт может не работать с VPN",
            "Рекомендуем отключить VPN",
            "Site may not work with VPN",
            "не работать с VPN"
        ]
        
        page_text = driver.page_source
        for indicator in vpn_indicators:
            if indicator in page_text:
                return True
                
        # Check if we got redirected to a different domain
        if "auth.lemanapro.ru" in driver.current_url:
            return True
            
        # Check for an unusual page title that might indicate a block
        if driver.title in ["Server error", "Ошибка", "Доступ ограничен"]:
            return True
            
        return False
    except Exception as e:
        logging.error(f"Error checking for VPN block: {e}")
        # If we can't determine, assume it's not blocked to continue trying
        return False

def extract_order_data(driver, url):
    """Extract order data from the page using various strategies."""
    logging.info(f"Extracting data from: {url}")
    products = []
    
    try:
        # Navigate to the URL
        driver.get(url)
        
        # Wait for page to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Simulate human behavior
        simulate_human_behavior(driver)
        
        # Save screenshot and source for debugging
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create results directory if it doesn't exist
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            
        screenshot_file = os.path.join(OUTPUT_DIR, f"screenshot_{timestamp}.png")
        driver.save_screenshot(screenshot_file)
        logging.info(f"Saved screenshot to {screenshot_file}")
        
        source_file = os.path.join(OUTPUT_DIR, f"source_{timestamp}.html")
        with open(source_file, 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        logging.info(f"Saved page source to {source_file}")
        
        # Check if we're on the VPN error page
        if is_vpn_block_page(driver):
            logging.error("Detected VPN block page. Cannot proceed with extraction.")
            print("\n" + "="*80)
            print("ОШИБКА: Сайт блокирует доступ")
            print("="*80)
            print("Сайт обнаружил автоматический доступ или VPN и показывает страницу блокировки.")
            print("Возможные причины:")
            print("1. Необходимо выполнить вход в аккаунт вручную")
            print("2. Нужно использовать другой профиль AdsPower")
            print("3. Используйте российский прокси если вы находитесь за пределами России")
            print("="*80 + "\n")
            return products
        
        # EXTRACTION STRATEGY 1: Look for product containers
        logging.info("Searching for product containers...")
        container_selectors = [
            ".order-item", ".product-item", ".product-card", ".product", ".item", ".goods-item",
            "[class*='product']", "[class*='item']", "[class*='goods']", "[class*='order']", "[class*='cart']",
            "div[id*='product']", "div[id*='item']", "div[id*='goods']", "div[id*='order']",
            "tr", "td", ".list-item"  # Add more general selectors
        ]
        
        product_containers = []
        seen_container_ids = set()
        for selector in container_selectors:
            try:
                containers = driver.find_elements(By.CSS_SELECTOR, selector)
                if containers:
                    new_containers = []
                    for element in containers:
                        element_id = element.id
                        if element_id in seen_container_ids:
                            continue
                        seen_container_ids.add(element_id)
                        new_containers.append(element)
                    if new_containers:
                        product_containers.extend(new_containers)
                        logging.info(f"Found {len(new_containers)} unique product containers with selector: {selector}")
            except Exception as e:
                logging.debug(f"Error finding containers with selector {selector}: {e}")
        
        # Process found container elements
        if product_containers:
            for container in product_containers:
                try:
                    container_text = container.text
                    if not container_text or len(container_text) < 10:
                        continue
                        
                    # Look for article numbers using Russian indicators
                    article_match = re.search(r'(?:арт|арт\.|артикул|код)[:\s\.]*(\d+)', container_text, re.IGNORECASE)
                    if not article_match:
                        continue
                        
                    article_number = article_match.group(1)
                    
                    # Look for prices
                    price = None
                    price_matches = re.findall(r'(\d[\d\s]+)[.,]?\d*\s*(?:₽|руб)', container_text)
                    if price_matches:
                        prices = [extract_number(p) for p in price_matches]
                        prices = [p for p in prices if p]
                        if prices:
                            price = max(prices)
                    
                    # Look for quantity
                    quantity = 1
                    qty_match = re.search(r'(\d+)\s*(?:шт|штук|штука|штуки)', container_text, re.IGNORECASE)
                    if qty_match:
                        try:
                            quantity = int(qty_match.group(1))
                        except:
                            pass
                    
                    products.append({
                        'article': article_number,
                        'price': price,
                        'quantity': quantity,
                        'url': url
                    })
                    
                    logging.info(f"Found product: Article={article_number}, Price={price}, Quantity={quantity}")
                except Exception as e:
                    logging.debug(f"Error processing container: {e}")
                    continue
        
        # EXTRACTION STRATEGY 2: Text extraction from full page
        if not products:
            logging.info("No products found with container strategy. Trying text extraction...")
            
            # Get all text on the page
            page_text = driver.find_element(By.TAG_NAME, "body").text
            
            # Find all potential article numbers
            article_patterns = [
                r'(?:арт|арт\.|артикул|код)[:\s\.]*(\d+)',  # Standard format
                r'(?:артикул|код товара)[:\s\.]*(\d+)',     # Alternate format
                r'(?:товар|продукт)[:\s\.]*(?:№|номер|#)[:\s\.]*(\d+)'  # Product number format
            ]
            
            all_articles = []
            for pattern in article_patterns:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                all_articles.extend(matches)
            
            # Remove duplicates
            all_articles = list(dict.fromkeys(all_articles))
            
            # Find all potential prices
            price_patterns = [
                r'(\d[\d\s]*[.,]?\d*)\s*(?:₽|руб)',  # Standard price format
                r'цена[:\s]*(\d[\d\s]*[.,]?\d*)\s*(?:₽|руб)',  # With "цена" prefix
                r'стоимость[:\s]*(\d[\d\s]*[.,]?\d*)\s*(?:₽|руб)'  # With "стоимость" prefix
            ]
            
            all_prices = []
            for pattern in price_patterns:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                all_prices.extend(matches)
            
            logging.info(f"Text extraction: Found {len(all_articles)} article numbers and {len(all_prices)} prices")
            
            # Create products from found data
            if all_articles:
                for i, article in enumerate(all_articles):
                    product = {
                        'article': article.strip(),
                        'url': url,
                        'quantity': 1
                    }
                    
                    # Try to match price
                    if i < len(all_prices):
                        product['price'] = extract_number(all_prices[i])
                    else:
                        product['price'] = None
                    
                    products.append(product)
        
        # Log final product count
        logging.info(f"Found total of {len(products)} products from {url}")
        
    except Exception as e:
        logging.error(f"Error processing {url}: {e}")
    
    return products

def main():
    """Main function to extract data from order URLs using AdsPower."""
    print("\n" + "="*80)
    print("LEMANA PRO ADSPOWER EXTRACTOR")
    print("="*80)
    print("This script uses AdsPower to extract order data from Lemana PRO.")
    print("Make sure you have already logged into your Lemana account in the AdsPower profile.")
    print("="*80 + "\n")
    
    # Create output directory if it doesn't exist
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    # Read URLs from file
    if not os.path.exists(INPUT_FILE):
        logging.error(f"Input file {INPUT_FILE} not found")
        print(f"Error: File {INPUT_FILE} not found.")
        print("Please create this file with one URL per line.")
        return
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    if not urls:
        logging.error("No URLs found in input file")
        print("No URLs found in the input file. Please add your order URLs.")
        return
    
    logging.info(f"Found {len(urls)} URLs to process")
    print(f"Found {len(urls)} URLs to process.")
    
    # Ask for AdsPower profile ID if not set
    global USER_ID
    if USER_ID == "your_adspower_profile_id":
        USER_ID = input("Enter your AdsPower profile ID: ")
        if not USER_ID:
            print("Profile ID is required. Exiting...")
            return
    
    # Ask for confirmation
    confirmation = input("Do you want to proceed? (yes/no): ")
    if confirmation.lower() not in ["yes", "y", "да"]:
        print("Operation cancelled.")
        return
    
    # Start AdsPower browser
    driver = None
    browser_user_id = None
    try:
        driver, browser_user_id = get_adspower_browser(USER_ID)
        all_products = []
        
        # Process each URL
        for i, url in enumerate(urls):
            print(f"\nProcessing URL {i+1}/{len(urls)}: {url}")
            
            # Extract products from this URL
            products = extract_order_data(driver, url)
            all_products.extend(products)
            
            # Report progress
            print(f"Found {len(products)} products in this URL.")
            
            # Save intermediate results
            if all_products:
                intermediate_file = os.path.join(OUTPUT_DIR, f"intermediate_results_{i+1}.xlsx")
                pd.DataFrame(all_products).to_excel(intermediate_file, index=False)
                logging.info(f"Saved intermediate results to {intermediate_file}")
            
            # Add a random delay between requests to appear more natural
            if i < len(urls) - 1:
                delay = random.uniform(30, 60)
                print(f"Waiting {delay:.1f} seconds before next URL...")
                time.sleep(delay)
        
        # Save final results
        if all_products:
            output_file = os.path.join(OUTPUT_DIR, f"lemana_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
            df = pd.DataFrame(all_products)
            
            # Calculate total price
            if 'price' in df.columns and 'quantity' in df.columns:
                df['total_price'] = df['price'] * df['quantity']
            
            # Save to Excel
            df.to_excel(output_file, index=False)
            logging.info(f"Results saved to {output_file}")
            
            # Print summary
            total_items = df['quantity'].sum() if 'quantity' in df.columns else len(df)
            total_cost = df['total_price'].sum() if 'total_price' in df.columns else (df['price'].sum() if 'price' in df.columns else 0)
            
            print("\n" + "="*80)
            print("ОБРАБОТКА ЗАВЕРШЕНА УСПЕШНО")
            print("="*80)
            print(f"Найдено {len(df)} уникальных товаров")
            print(f"Общее количество: {total_items} шт.")
            print(f"Общая стоимость: {total_cost:.2f} ₽")
            print(f"Результаты сохранены в файл: {output_file}")
            print("="*80 + "\n")
        else:
            logging.warning("No products found.")
            print("\n" + "="*80)
            print("ОБРАБОТКА ЗАВЕРШЕНА БЕЗ РЕЗУЛЬТАТОВ")
            print("="*80)
            print("Не удалось найти информацию о товарах.")
            print("Пожалуйста, убедитесь, что вы вошли в свой аккаунт Lemana PRO в профиле AdsPower.")
            print("="*80 + "\n")
    
    except Exception as e:
        logging.error(f"Error in main execution: {e}")
        print(f"\nПроизошла ошибка: {e}")
    
    finally:
        # Close the browser
        if browser_user_id:
            try:
                close_adspower_browser(browser_user_id)
                print("Browser closed successfully.")
            except Exception as e:
                logging.error(f"Error closing browser: {e}")
                print(f"Error closing browser: {e}")
        
        print("\nScript execution complete.")

if __name__ == "__main__":
    main()
