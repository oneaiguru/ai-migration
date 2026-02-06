from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
import undetected_chromedriver as uc
import pandas as pd
import time
import random
import re
import os
from datetime import datetime
import logging
import json
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("lemana_parser.log"),
        logging.StreamHandler()
    ]
)

def setup_driver():
    """Set up and return a configured Chrome WebDriver instance with enhanced anti-detection."""
    # Option 1: Enhanced Selenium WebDriver
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-blink-features")
    
    # Add diverse browser fingerprinting settings
    chrome_options.add_argument("--disable-features=IsolateOrigins,site-per-process")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--disable-gpu")
    
    # Add realistic window dimensions
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Add user-agent to appear more like a regular browser
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    
    try:
        # Try undetected-chromedriver first (Option 2 - more effective against detection)
        logging.info("Attempting to use undetected-chromedriver...")
        driver = uc.Chrome(options=chrome_options)
        logging.info("Successfully initialized undetected-chromedriver")
    except Exception as e:
        logging.warning(f"Failed to initialize undetected-chromedriver: {e}")
        logging.info("Falling back to standard chromedriver")
        
        # Create and return the standard WebDriver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Add additional settings to make automation less detectable
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})")
        driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['ru-RU', 'ru', 'en-US', 'en']})")
    
    return driver

def simulate_human_behavior(driver):
    """Simulate human-like behavior with mouse movements and scrolling."""
    try:
        # Random scrolls
        viewport_height = driver.execute_script("return window.innerHeight")
        page_height = driver.execute_script("return document.body.scrollHeight")
        
        # Initial scroll down in chunks (like a human reading)
        current_position = 0
        while current_position < page_height:
            # Random scroll amount (reading chunks)
            scroll_amount = random.randint(100, 300)
            current_position += scroll_amount
            driver.execute_script(f"window.scrollTo(0, {current_position})")
            
            # Random pause (reading time)
            time.sleep(random.uniform(0.5, 2.0))
            
            # Occasionally scroll back up a bit (like re-reading)
            if random.random() < 0.2:  # 20% chance
                scroll_back = random.randint(50, 150)
                current_position = max(0, current_position - scroll_back)
                driver.execute_script(f"window.scrollTo(0, {current_position})")
                time.sleep(random.uniform(0.5, 1.0))
        
        # Occasionally do some random mouse movements
        if random.random() < 0.7:  # 70% chance
            actions = ActionChains(driver)
            
            # Get viewport dimensions
            viewport_width = driver.execute_script("return window.innerWidth")
            
            # Find some elements to hover over (like a human might)
            elements = driver.find_elements(By.CSS_SELECTOR, "a, button, div[role='button'], .clickable")
            
            # If elements found, hover over a few of them randomly
            if elements:
                for _ in range(min(3, len(elements))):
                    elem = random.choice(elements)
                    try:
                        actions.move_to_element(elem).perform()
                        time.sleep(random.uniform(0.3, 1.0))
                    except:
                        # If element is not in viewport or not interactable, move to a random position
                        x = random.randint(100, viewport_width - 100)
                        y = random.randint(100, viewport_height - 100)
                        actions.move_by_offset(x, y).perform()
                        time.sleep(random.uniform(0.3, 0.7))
            else:
                # Move to random positions
                for _ in range(3):
                    x = random.randint(100, viewport_width - 100)
                    y = random.randint(100, viewport_height - 100)
                    actions.move_by_offset(x, y).perform()
                    time.sleep(random.uniform(0.3, 0.7))
        
        # Finally, scroll back to a reasonable position to start the data extraction
        random_position = random.randint(viewport_height, min(page_height - viewport_height, 1000))
        driver.execute_script(f"window.scrollTo(0, {random_position})")
        time.sleep(random.uniform(0.5, 1.5))
        
    except Exception as e:
        logging.warning(f"Error in human behavior simulation: {e}")
        # Continue anyway, this is just an enhancement

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

def handle_authentication(driver, url):
    """
    Handles the authentication process if needed.
    Returns True if authentication is successful, False otherwise.
    """
    # Check if we're on the login page by looking for login-related elements
    login_indicators = [
        "auth.lemanapro.ru" in driver.current_url,
        len(driver.find_elements(By.XPATH, "//button[contains(text(), 'Получить код')]")) > 0,
        len(driver.find_elements(By.XPATH, "//div[contains(text(), 'Вход или регистрация')]")) > 0,
        len(driver.find_elements(By.XPATH, "//*[contains(text(), 'Вход или регистрация')]")) > 0,
        len(driver.find_elements(By.XPATH, "//input[contains(@placeholder, 'телефона')]")) > 0
    ]
    
    if any(login_indicators):
        logging.info("Authentication required - detected login page")
        
        # Display clear instructions to the user
        print("\n" + "="*80)
        print("АУТЕНТИФИКАЦИЯ ТРЕБУЕТСЯ")
        print("="*80)
        print("Пожалуйста, войдите в свою учетную запись Лемана ПРО в открывшемся окне браузера.")
        print("Вам потребуется:")
        print("1. Ввести номер телефона")
        print("2. Нажать 'Получить код' для получения SMS-кода")
        print("3. Ввести SMS-код, отправленный на ваш телефон")
        print("4. Завершить процесс входа")
        print("\nСкрипт будет ждать до 5 минут, пока вы не войдете в систему.")
        print("Не закрывайте окно браузера!")
        print("="*80 + "\n")
        
        # Give user time to notice and start authenticating
        time.sleep(5)

        # Screenshot for debugging
        try:
            screenshot_file = f"auth_page_screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            driver.save_screenshot(screenshot_file)
            logging.info(f"Saved auth page screenshot to {screenshot_file}")
        except Exception as e:
            logging.warning(f"Failed to save auth screenshot: {e}")
        
        # Wait for redirect after successful login (it shouldn't contain login indicators anymore)
        try:
            # Check every second if we're still on auth page or redirected
            start_time = time.time()
            auth_timeout = 300  # 5 minutes
            
            while time.time() - start_time < auth_timeout:
                # Re-check login indicators
                current_login_indicators = [
                    "auth.lemanapro.ru" in driver.current_url,
                    len(driver.find_elements(By.XPATH, "//button[contains(text(), 'Получить код')]")) > 0,
                    len(driver.find_elements(By.XPATH, "//div[contains(text(), 'Вход или регистрация')]")) > 0,
                    len(driver.find_elements(By.XPATH, "//*[contains(text(), 'Вход или регистрация')]")) > 0,
                    len(driver.find_elements(By.XPATH, "//input[contains(@placeholder, 'телефона')]")) > 0
                ]
                
                if not any(current_login_indicators):
                    logging.info("Authentication successful - redirected to non-auth page")
                    
                    # Additional wait to ensure full page load after authentication
                    time.sleep(3)
                    
                    # Navigate back to the target URL
                    driver.get(url)
                    
                    # Wait for the page to load
                    WebDriverWait(driver, 20).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                    
                    # Final check that we're not redirected back to auth
                    if "auth.lemanapro.ru" in driver.current_url:
                        logging.error("Still on authentication page after login attempt")
                        return False
                        
                    return True
                
                # Wait a bit before checking again
                time.sleep(1)
                
            logging.error("Authentication timeout - user did not complete login within 5 minutes")
            return False
            
        except Exception as e:
            logging.error(f"Authentication wait timeout or error: {e}")
            return False
    
    return True  # No authentication needed or already authenticated

def wait_for_dynamic_content(driver):
    """
    Enhanced wait for dynamic content to load on the page.
    Monitors DOM changes to determine when page has stabilized.
    """
    try:
        # Wait for initial page load
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Initial waiting period for JavaScript to start rendering
        time.sleep(3)
        
        # Check for skeleton loaders (original approach)
        start_time = time.time()
        skeleton_loaders_gone = False
        
        while time.time() - start_time < 15 and not skeleton_loaders_gone:
            try:
                # Check if skeleton loaders are present
                skeleton_loaders = driver.find_elements(By.CSS_SELECTOR, ".s1gs42o8_customer-view, [class*='skeleton'], [class*='loading'], [class*='placeholder']")
                if not skeleton_loaders:
                    skeleton_loaders_gone = True
                    logging.info("Skeleton loaders not found, content should be loaded")
                    break
                    
                # Check if the skeleton loaders are hidden or have zero size
                visible_loaders = 0
                for loader in skeleton_loaders:
                    if loader.is_displayed() and loader.size['height'] > 0 and loader.size['width'] > 0:
                        visible_loaders += 1
                
                if visible_loaders == 0:
                    skeleton_loaders_gone = True
                    logging.info("Skeleton loaders are hidden, content should be loaded")
                    break
                    
                time.sleep(1)
            except Exception as e:
                logging.debug(f"Error checking skeleton loaders: {e}")
                time.sleep(1)
        
        # New approach: monitor DOM stability
        old_page = driver.page_source
        time.sleep(2)
        new_page = driver.page_source
        attempts = 0
        
        while old_page != new_page and attempts < 5:
            old_page = new_page
            time.sleep(2)
            new_page = driver.page_source
            attempts += 1
        
        logging.info(f"Page stabilized after {attempts} DOM stability checks")
        
        # Check if AJAX requests are still ongoing by looking at network activity
        # This is an approximation since we can't directly access browser's network panel
        try:
            # Look for loading indicators or spinners that might indicate ongoing requests
            loading_indicators = driver.find_elements(By.CSS_SELECTOR, 
                "[class*='loading'], [class*='spinner'], [class*='progress'], .fa-spinner, .fa-circle-notch, .fa-refresh")
            
            visible_indicators = 0
            for indicator in loading_indicators:
                if indicator.is_displayed():
                    visible_indicators += 1
            
            if visible_indicators > 0:
                logging.info(f"Found {visible_indicators} visible loading indicators, waiting longer")
                time.sleep(5)  # Additional wait time
        except Exception as e:
            logging.debug(f"Error checking loading indicators: {e}")
        
        # Final wait to ensure JavaScript finishes rendering
        time.sleep(3)
        
        return True
    except Exception as e:
        logging.error(f"Error waiting for dynamic content: {e}")
        return False

def extract_order_data_from_text(page_text, url):
    """
    Extract order data using regex patterns from the full page text.
    This is a fallback method when DOM-based extraction fails.
    """
    products = []
    
    # Extract article numbers with various Russian prefixes
    article_patterns = [
        r'(?:арт|арт\.|артикул|код)[:\s\.]*(\d+)',  # Standard format
        r'(?:артикул|код товара)[:\s\.]*(\d+)',     # Alternate format
        r'(?:товар|продукт)[:\s\.]*(?:№|номер|#)[:\s\.]*(\d+)'  # Product number format
    ]
    
    all_articles = []
    for pattern in article_patterns:
        matches = re.findall(pattern, page_text, re.IGNORECASE)
        all_articles.extend(matches)
    
    # Remove duplicates while preserving order
    all_articles = list(dict.fromkeys(all_articles))
    
    # Extract prices with ruble sign
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
    
    # Extract quantity patterns - "X шт" or similar
    quantity_patterns = [
        r'(\d+)\s*(?:шт|штук|штука|штуки)',
        r'количество[:\s]*(\d+)'
    ]
    
    all_quantities = []
    for pattern in quantity_patterns:
        matches = re.findall(pattern, page_text, re.IGNORECASE)
        all_quantities.extend(matches)
    
    # Create products from found data
    if all_articles:
        # Try to associate articles with prices and quantities
        # This is a heuristic approach that works on the assumption that they appear in sequence
        for i, article in enumerate(all_articles):
            product = {
                'article': article.strip(),
                'url': url
            }
            
            # Try to match price
            if i < len(all_prices):
                product['price'] = extract_number(all_prices[i])
            else:
                product['price'] = None
                
            # Try to match quantity
            if i < len(all_quantities):
                try:
                    product['quantity'] = int(all_quantities[i])
                except:
                    product['quantity'] = 1
            else:
                product['quantity'] = 1
                
            products.append(product)
    
    return products

def parse_order_page(driver, url):
    """Parse a single order page and return product information with enhanced methods."""
    logging.info(f"Processing: {url}")
    products = []
    
    try:
        # Navigate to the URL
        driver.get(url)
        
        # Wait for the page to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check if authentication is needed
        if not handle_authentication(driver, url):
            logging.error("Authentication failed, skipping URL")
            return products
        
        # Simulate human behavior
        simulate_human_behavior(driver)
            
        # Wait for dynamic content to load
        wait_for_dynamic_content(driver)
        
        # Check if we're on an order details page
        if not any(x in driver.current_url for x in ["orders-details", "receipt-details", "order"]):
            logging.warning(f"Not on an order details page: {driver.current_url}")
            return products
        
        # Take a screenshot for debugging
        try:
            screenshot_file = f"page_screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            driver.save_screenshot(screenshot_file)
            logging.info(f"Saved page screenshot to {screenshot_file}")
        except Exception as e:
            logging.warning(f"Failed to save screenshot: {e}")
        
        # Save page source for debugging
        try:
            page_source_file = f"page_source_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            with open(page_source_file, 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
            logging.info(f"Saved page source to {page_source_file}")
        except Exception as e:
            logging.warning(f"Failed to save page source: {e}")
        
        # EXTRACTION STRATEGY 1: Look for product blocks using various selectors
        product_containers = []
        container_selectors = [
            ".order-item", ".product-item", ".product-card", ".product", ".item", ".goods-item",
            "[class*='product'], [class*='item'], [class*='goods'], [class*='order'], [class*='cart']",
            "div[id*='product'], div[id*='item'], div[id*='goods'], div[id*='order']"
        ]
        
        for selector in container_selectors:
            try:
                containers = driver.find_elements(By.CSS_SELECTOR, selector)
                if containers:
                    product_containers.extend(containers)
                    logging.info(f"Found {len(containers)} potential product containers with selector: {selector}")
            except Exception as e:
                logging.debug(f"Error finding containers with selector {selector}: {e}")
        
        # Remove duplicates (containers that might have been found by multiple selectors)
        unique_containers = []
        for container in product_containers:
            if container not in unique_containers:
                unique_containers.append(container)
        
        product_containers = unique_containers
        logging.info(f"Found {len(product_containers)} unique product containers")
        
        if product_containers:
            for container in product_containers:
                try:
                    container_text = container.text
                    if not container_text or len(container_text) < 10:
                        continue
                        
                    # Look for article numbers
                    article_match = re.search(r'(?:арт|арт\.|артикул|код)[:\s\.]*(\d+)', container_text, re.IGNORECASE)
                    if not article_match:
                        continue
                        
                    article_number = article_match.group(1)
                    
                    # Look for prices
                    price = None
                    price_matches = re.findall(r'(\d[\d\s]+)[.,]?\d*\s*₽', container_text)
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
                    
                    logging.info(f"Strategy 1: Found product - Article={article_number}, Price={price}, Quantity={quantity}")
                except Exception as e:
                    logging.debug(f"Error processing container in Strategy 1: {e}")
                    continue
        
        # EXTRACTION STRATEGY 2: Try to look for article numbers directly
        if not products:
            logging.info("Strategy 1 found no products. Trying Strategy 2...")
            article_elements = []
            
            # Different article detection methods
            article_xpaths = [
                "//div[contains(text(), 'Арт.')]", 
                "//*[contains(text(), 'Арт.')]",
                "//div[contains(text(), 'Артикул')]", 
                "//*[contains(text(), 'Артикул')]",
                "//div[contains(text(), 'Код товара')]", 
                "//*[contains(text(), 'Код товара')]"
            ]
            
            for xpath in article_xpaths:
                try:
                    elements = driver.find_elements(By.XPATH, xpath)
                    if elements:
                        article_elements.extend(elements)
                        logging.info(f"Found {len(elements)} potential article elements with xpath: {xpath}")
                except Exception as e:
                    logging.debug(f"Error finding article elements with xpath {xpath}: {e}")
            
            # Process found article elements
            if article_elements:
                logging.info(f"Processing {len(article_elements)} article elements in Strategy 2")
                
                for art_elem in article_elements:
                    try:
                        # Extract article number using regex
                        article_text = art_elem.text
                        article_match = re.search(r'(?:арт|арт\.|артикул|код)[:\s\.]*(\d+)', article_text, re.IGNORECASE)
                        if not article_match:
                            continue
                        
                        article_number = article_match.group(1)
                        logging.info(f"Found article number: {article_number}")
                        
                        # Look for the product container - it should contain both the article number and price
                        # Walk up the DOM tree to find price information
                        product_container = art_elem
                        container_found = False
                        price_text = ""
                        
                        # Walk up to 5 levels up
                        for _ in range(5):
                            try:
                                parent = product_container.find_element(By.XPATH, "./..")
                                if parent.tag_name == 'body':
                                    break
                                    
                                parent_text = parent.text
                                if "₽" in parent_text or "руб" in parent_text:  # If parent contains price info
                                    product_container = parent
                                    container_found = True
                                    price_text = parent_text
                                    logging.info(f"Found container for article {article_number} by walking up DOM")
                                    break
                                    
                                product_container = parent
                            except Exception as e:
                                logging.debug(f"Error finding parent: {e}")
                                break
                        
                        # If no container with price found walking up, look sideways
                        if not container_found:
                            try:
                                # Look for price elements near the article element
                                nearby_xpath = (
                                    f"./following::*[contains(text(), '₽')][1] | "
                                    f"./following::*[contains(text(), 'руб')][1] | "
                                    f"./preceding::*[contains(text(), '₽')][1] | "
                                    f"./preceding::*[contains(text(), 'руб')][1]"
                                )
                                
                                price_elements = art_elem.find_elements(By.XPATH, nearby_xpath)
                                
                                if price_elements:
                                    price_text = price_elements[0].text
                                    container_found = True
                                    logging.info(f"Found price element near article {article_number}")
                            except Exception as e:
                                logging.debug(f"Error looking for nearby price: {e}")
                        
                        # Extract price from container or nearby text
                        price = None
                        if container_found or price_text:
                            text_to_search = price_text or product_container.text
                            price_matches = re.findall(r'(\d[\d\s]+)[.,]?\d*\s*(?:₽|руб)', text_to_search)
                            if price_matches:
                                prices = [extract_number(p) for p in price_matches]
                                prices = [p for p in prices if p]
                                if prices:
                                    price = max(prices)
                        
                        # Extract quantity
                        quantity = 1
                        text_to_search = product_container.text if container_found else art_elem.text
                        qty_match = re.search(r'(\d+)\s*(?:шт|штук|штука|штуки)', text_to_search, re.IGNORECASE)
                        if qty_match:
                            try:
                                quantity = int(qty_match.group(1))
                            except:
                                pass
                        
                        # Add to products list
                        products.append({
                            'article': article_number,
                            'price': price,
                            'quantity': quantity,
                            'url': url
                        })
                        
                        logging.info(f"Strategy 2: Extracted product - Article={article_number}, Price={price}, Quantity={quantity}")
                    
                    except Exception as e:
                        logging.error(f"Error processing article element in Strategy 2: {e}")
                        continue
        
        # EXTRACTION STRATEGY 3: Fall back to page text extraction if still no products
        if not products:
            logging.info("No products found with DOM strategies. Falling back to text extraction...")
            
            # Get the full page text
            page_text = driver.find_element(By.TAG_NAME, "body").text
            
            # Use text-based extraction
            text_products = extract_order_data_from_text(page_text, url)
            
            if text_products:
                products.extend(text_products)
                logging.info(f"Text extraction strategy found {len(text_products)} products")
        
        # EXTRACTION STRATEGY 4: Try JavaScript extraction as last resort
        if not products:
            logging.info("Trying JavaScript data extraction as last resort...")
            
            try:
                # Look for JSON data in the page that might contain product information
                scripts = driver.find_elements(By.TAG_NAME, "script")
                
                js_data_found = False
                for script in scripts:
                    try:
                        script_text = script.get_attribute("textContent") or script.get_attribute("innerHTML") or ""
                        
                        # Look for data patterns that might contain product info
                        json_patterns = [
                            r'(?:products|items|goods|orderItems|cart)\s*[:=]\s*(\[.*?\])',
                            r'(?:order|orderData|cartData)\s*[:=]\s*({.*?})'
                        ]
                        
                        for pattern in json_patterns:
                            matches = re.findall(pattern, script_text)
                            for match in matches:
                                try:
                                    data = json.loads(match)
                                    if isinstance(data, list) and len(data) > 0:
                                        for item in data:
                                            if isinstance(item, dict):
                                                # Look for article/sku/code in various formats
                                                article = None
                                                for key in ['article', 'артикул', 'sku', 'code', 'id', 'productId']:
                                                    if key in item and item[key]:
                                                        article = str(item[key])
                                                        break
                                                
                                                if not article:
                                                    continue
                                                    
                                                # Look for price in various formats
                                                price = None
                                                for key in ['price', 'цена', 'amount', 'sum', 'total']:
                                                    if key in item and item[key]:
                                                        try:
                                                            price = float(item[key])
                                                            break
                                                        except:
                                                            pass
                                                
                                                # Look for quantity
                                                quantity = 1
                                                for key in ['quantity', 'количество', 'count', 'qty']:
                                                    if key in item and item[key]:
                                                        try:
                                                            quantity = int(item[key])
                                                            break
                                                        except:
                                                            pass
                                                
                                                products.append({
                                                    'article': article,
                                                    'price': price,
                                                    'quantity': quantity,
                                                    'url': url
                                                })
                                                
                                                js_data_found = True
                                                logging.info(f"JS extraction: Found product - Article={article}, Price={price}, Quantity={quantity}")
                                    
                                    elif isinstance(data, dict):
                                        # Check if it's a single product or has items/products array
                                        product_arrays = None
                                        for key in ['items', 'products', 'goods', 'orderItems', 'positions']:
                                            if key in data and isinstance(data[key], list):
                                                product_arrays = data[key]
                                                break
                                        
                                        if product_arrays:
                                            for item in product_arrays:
                                                if isinstance(item, dict):
                                                    article = None
                                                    for key in ['article', 'артикул', 'sku', 'code', 'id', 'productId']:
                                                        if key in item and item[key]:
                                                            article = str(item[key])
                                                            break
                                                    
                                                    if not article:
                                                        continue
                                                        
                                                    # Look for price
                                                    price = None
                                                    for key in ['price', 'цена', 'amount', 'sum', 'total']:
                                                        if key in item and item[key]:
                                                            try:
                                                                price = float(item[key])
                                                                break
                                                            except:
                                                                pass
                                                    
                                                    # Look for quantity
                                                    quantity = 1
                                                    for key in ['quantity', 'количество', 'count', 'qty']:
                                                        if key in item and item[key]:
                                                            try:
                                                                quantity = int(item[key])
                                                                break
                                                            except:
                                                                pass
                                                    
                                                    products.append({
                                                        'article': article,
                                                        'price': price,
                                                        'quantity': quantity,
                                                        'url': url
                                                    })
                                                    
                                                    js_data_found = True
                                                    logging.info(f"JS extraction: Found product - Article={article}, Price={price}, Quantity={quantity}")
                                except Exception as e:
                                    logging.debug(f"Failed to parse JSON match: {e}")
                                    continue
                                    
                        if js_data_found:
                            break
                    except Exception as e:
                        continue
                        
                if js_data_found:
                    logging.info(f"JavaScript extraction found {len(products)} products")
                else:
                    logging.warning("No product data found in JavaScript")
                    
            except Exception as e:
                logging.error(f"Error in JavaScript extraction: {e}")
        
        # Log final product count for this URL
        logging.info(f"Found total of {len(products)} products from {url}")
        
    except Exception as e:
        logging.error(f"Error processing {url}: {e}")
    
    return products


def main():
    """Main function to parse orders and save results to Excel."""
    print("\n" + "="*80)
    print("LEMANA PRO PARSER - ENHANCED VERSION")
    print("="*80)
    print("Этот скрипт анализирует историю заказов из Леман ПРО и сохраняет информацию о товарах.")
    print("Разработан для личного использования и аналитики.")
    print("="*80 + "\n")
    
    # File paths
    input_file = "order_urls.txt"  # File containing order URLs
    output_file = f"lemana_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        logging.warning(f"Input file {input_file} not found. Creating a sample file.")
        
        # Create a sample file with the URLs from the example
        with open(input_file, 'w', encoding='utf-8') as f:
            f.write("https://spb.lemanapro.ru/lk/history/orders-details/250367250714/\n")
            f.write("https://spb.lemanapro.ru/lk/history/receipt-details/0680483037120241230/\n")
        
        logging.info(f"Created sample input file with example URLs. Please edit {input_file} to add your actual URLs.")
    
    # Read order URLs from the input file
    with open(input_file, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    if not urls:
        logging.error(f"No URLs found in {input_file}. Please add URLs to the file.")
        return
    
    logging.info(f"Found {len(urls)} URLs to process")
    
    # Initialize the WebDriver
    driver = setup_driver()
    
    try:
        all_products = []
        
        # First, navigate to the main page to handle authentication
        logging.info("Opening main page to handle authentication...")
        driver.get("https://spb.lemanapro.ru/lk/history/")
        
        # Wait for the page to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Check if authentication is needed
        auth_success = handle_authentication(driver, "https://spb.lemanapro.ru/lk/history/")
        
        if not auth_success:
            logging.error("Authentication failed. Please run the script again and complete the login process.")
            return
            
        # Give plenty of time for the session to establish
        logging.info("Authentication successful. Waiting for session to establish...")
        time.sleep(10)
        
        # Verify we're logged in by checking for specific elements on the history page
        logged_in = False
        try:
            # Try to find elements that would only be visible when logged in
            profile_elements = driver.find_elements(By.XPATH, 
                "//*[contains(text(), 'Мои покупки')] | " +
                "//*[contains(text(), 'профиль')] | " +
                "//*[contains(@class, 'profile')] | " +
                "//*[contains(@class, 'user')] | " +
                "//a[contains(@href, 'personal')]")
            
            if profile_elements:
                logging.info("Successfully verified login - found user profile elements")
                logged_in = True
            else:
                # Take a screenshot to see what's on the page
                try:
                    screenshot_file = f"login_verification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                    driver.save_screenshot(screenshot_file)
                    logging.info(f"Saved login verification screenshot to {screenshot_file}")
                except Exception as e:
                    logging.warning(f"Failed to save login verification screenshot: {e}")
                
                logging.warning("Could not verify login status - no profile elements found")
        except Exception as e:
            logging.error(f"Error verifying login status: {e}")
        
        if not logged_in:
            # Explicitly ask user if they are logged in
            print("\n" + "="*80)
            print("ПРОВЕРКА ВХОДА В СИСТЕМУ")
            print("="*80)
            print("Не удалось автоматически определить, вошли ли вы в систему.")
            print("Проверьте окно браузера. Если вы видите страницу личного кабинета или")
            print("историю заказов, значит вы вошли в систему успешно.")
            print("\nВы успешно вошли в свой аккаунт?")
            confirmation = input("Введите 'да' для продолжения или что-либо другое для выхода: ")
            
            if confirmation.lower() not in ['да', 'da', 'yes', 'y']:
                logging.error("User indicated login was not successful. Exiting.")
                return
            
            logging.info("User confirmed successful login")
        
        # Process each URL
        for i, url in enumerate(urls):
            # Check if we've already processed this URL in a previous run
            url_hash = hashlib.sha256(url.encode('utf-8')).hexdigest()[:12]
            checkpoint_file = f"checkpoint_{url_hash}.xlsx"
            if os.path.exists(checkpoint_file):
                logging.info(f"Found checkpoint for URL {i+1}: {url}")
                try:
                    checkpoint_data = pd.read_excel(checkpoint_file)
                    url_values = set(checkpoint_data['url'].dropna().unique()) if 'url' in checkpoint_data.columns else set()
                    if url_values and url_values != {url}:
                        logging.warning(f"Checkpoint {checkpoint_file} URL mismatch. Expected {url}, found {url_values}. Reprocessing.")
                    else:
                        checkpoint_products = checkpoint_data.to_dict('records')
                        all_products.extend(checkpoint_products)
                        logging.info(f"Loaded {len(checkpoint_products)} products from checkpoint")
                        continue
                except Exception as e:
                    logging.warning(f"Error loading checkpoint: {e}. Will reprocess URL.")
            
            # Parse the order page
            products = parse_order_page(driver, url)
            
            # Save checkpoint for this URL
            if products:
                pd.DataFrame(products).to_excel(checkpoint_file, index=False)
                logging.info(f"Saved checkpoint for URL {i+1} ({url_hash})")
            
            all_products.extend(products)
            
            # Log progress
            logging.info(f"Processed {i+1}/{len(urls)} URLs. Found {len(products)} products in this URL.")
            logging.info(f"Total products so far: {len(all_products)}")
            
            # Save intermediate results
            if all_products:
                intermediate_file = f"intermediate_{output_file}"
                pd.DataFrame(all_products).to_excel(intermediate_file, index=False)
                logging.info(f"Saved intermediate results to {intermediate_file}")
            
            # Add a delay between requests (55-65 seconds), with some randomness for non-robot behavior
            if i < len(urls) - 1:  # Skip delay after the last URL
                delay = random.uniform(45, 70)
                logging.info(f"Waiting {delay:.2f} seconds before the next request...")
                time.sleep(delay)
        
        # Save final results to Excel
        if all_products:
            # Create a nicer formatted DataFrame
            df = pd.DataFrame(all_products)
            
            # Add total price column if not present
            if 'unit_price' in df.columns:
                df['total_price'] = df.apply(
                    lambda row: row['price'] if pd.isna(row['unit_price']) else row['unit_price'] * row['quantity'], 
                    axis=1
                )
            else:
                df['total_price'] = df['price'] * df['quantity']
            
            # Reorder columns for better readability
            all_columns = ['article', 'quantity', 'unit_price', 'price', 'total_price', 'url']
            df_columns = [col for col in all_columns if col in df.columns] + [col for col in df.columns if col not in all_columns]
            df = df[df_columns]
            
            # Save to Excel
            df.to_excel(output_file, index=False)
            logging.info(f"Results saved to {output_file}")
            
            # Print summary
            total_items = df['quantity'].sum()
            total_cost = df['total_price'].sum() if 'total_price' in df.columns else df['price'].sum()
            logging.info(f"Summary: {len(df)} unique products, {total_items} total items, total cost: {total_cost:.2f} ₽")
            
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
            print("Возможные причины:")
            print("1. Сайт обновил свою структуру или защиту от ботов")
            print("2. Проблема с авторизацией на сайте")
            print("3. URLs не содержат информацию о заказах")
            print("="*80 + "\n")
    
    except Exception as e:
        logging.error(f"Error in main execution: {e}")
        
        print("\n" + "="*80)
        print("ОШИБКА ВЫПОЛНЕНИЯ")
        print("="*80)
        print(f"Произошла ошибка: {e}")
        print("Проверьте файл журнала lemana_parser.log для получения дополнительной информации.")
        print("="*80 + "\n")
    
    finally:
        # Ask user before closing browser
        try:
            print("\nЗакрыть браузер? (Если вы хотите проверить содержимое страницы, выберите 'нет')")
            close_confirm = input("Введите 'да' для закрытия браузера или что-либо другое, чтобы оставить его открытым: ")
            
            if close_confirm.lower() in ['да', 'da', 'yes', 'y']:
                # Close the WebDriver
                driver.quit()
                logging.info("Browser closed. Parser execution complete.")
            else:
                logging.info("Browser left open for inspection. Please close it manually when done.")
                print("\nБраузер оставлен открытым. Пожалуйста, закройте его вручную, когда закончите.")
        except:
            # If there's any error in the confirmation, close the browser
            driver.quit()
            logging.info("Browser closed due to error in confirmation. Parser execution complete.")


if __name__ == "__main__":
    main()
