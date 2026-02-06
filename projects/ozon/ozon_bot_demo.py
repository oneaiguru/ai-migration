"""
Demo version of the Ozon product reservation bot
Author: Michael Granin
Version: 1.0 (DEMO)

IMPORTANT: This demo version does not place actual orders 
and is intended for demonstration purposes only
"""

import os
import time
import json
import logging
import schedule
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
try:
    import telegram
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ozon_bot_demo.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ozon_bot_demo")

class OzonReservationBot:
    """
    Bot for automatic product reservation on Ozon marketplace (demo version)
    """
    
    def __init__(self, config_path="config.json"):
        """
        Bot initialization
        :param config_path: path to configuration file
        """
        self.config = self._load_config(config_path)
        self.driver = None
        self.telegram_bot = None
        if TELEGRAM_AVAILABLE and self.config.get("telegram_token") and self.config.get("telegram_chat_id"):
            self.telegram_bot = telegram.Bot(token=self.config["telegram_token"])
            self.telegram_chat_id = self.config["telegram_chat_id"]
    
    def _load_config(self, config_path):
        """
        Load configuration from JSON file
        :param config_path: path to configuration file
        :return: dictionary with configuration
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as file:
                config = json.load(file)
            logger.info("Configuration loaded successfully")
            return config
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            raise
    
    def _setup_driver(self):
        """
        Setup Selenium WebDriver
        :return: WebDriver object
        """
        try:
            chrome_options = Options()
            
            # In headless mode for Claude Code
            if self.config.get("headless", True):
                chrome_options.add_argument("--headless")
            
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1366,768")
            
            # Add user-agent to simulate a real user
            chrome_options.add_argument(f"user-agent={self.config.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36')}")
            
            # Added Selenium 4.10+ mechanism to bypass driver version checks
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--ignore-certificate-errors")
            chrome_options.add_argument("--remote-debugging-port=9222")
            chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Using Selenium's built-in manager with automatic discovery
            logger.info("Using Selenium's built-in Chrome manager")
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(60)
            
            logger.info("Browser driver initialized successfully")
            return driver
        except Exception as e:
            logger.error(f"Error setting up driver: {e}")
            raise
    
    def login(self):
        """
        Authorization on Ozon website
        :return: True for successful login, otherwise False
        """
        try:
            logger.info("Starting login process")
            print("\n[DEMO] Step 1: Logging into Ozon...")
            
            self.driver.get("https://www.ozon.ru/")
            
            # Click login button
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Войти')]"))
            )
            login_button.click()
            
            # Choose login method (email/phone)
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Войти по почте')]"))
            ).click()
            
            # Enter email/phone
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='email']"))
            )
            email_input.clear()
            email_input.send_keys(self.config["login"])
            
            # Click "Continue"
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            ).click()
            
            # Enter password
            password_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='password']"))
            )
            password_input.clear()
            password_input.send_keys(self.config["password"])
            
            # Click "Login"
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            ).click()
            
            # Check successful login
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'profileMenu')]"))
            )
            
            logger.info("Login successful")
            print("[DEMO] ✅ Login successful")
            self._take_screenshot("demo_login_success")
            return True
        except Exception as e:
            logger.error(f"Login error: {e}")
            print(f"[DEMO] ❌ Login error: {e}")
            self._take_screenshot("demo_login_error")
            return False
    
    def add_products_to_cart(self):
        """
        Add products to cart from the list in configuration
        :return: number of products added
        """
        added_count = 0
        
        try:
            logger.info("Starting process of adding products to cart")
            print("\n[DEMO] Step 2: Adding products to cart...")
            
            # Clear cart before adding new products
            self._clear_cart()
            
            # Get SKU list from configuration
            sku_list = self.config.get("sku_list", [])
            
            if not sku_list:
                logger.warning("SKU list is empty")
                print("[DEMO] ⚠️ SKU list is empty. Check configuration file.")
                return 0
            
            print(f"[DEMO] Found {len(sku_list)} products to process")
            
            # In demo version, limit to 2 products for faster demonstration
            demo_limit = min(2, len(sku_list))
            limited_sku_list = sku_list[:demo_limit]
            
            if demo_limit < len(sku_list):
                print(f"[DEMO] For demonstration purposes, processing only {demo_limit} of {len(sku_list)} products")
            
            for sku in limited_sku_list:
                try:
                    print(f"[DEMO] Processing product with SKU: {sku}")
                    # Navigate to product page
                    self.driver.get(f"https://www.ozon.ru/product/{sku}")
                    
                    # Wait for page to load
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'webAddToCart')]"))
                    )
                    
                    # Get available quantity
                    try:
                        quantity_element = self.driver.find_element(By.XPATH, "//span[contains(text(), 'Доступно для заказа')]/following-sibling::span")
                        available_quantity = int(''.join(filter(str.isdigit, quantity_element.text)))
                    except (NoSuchElementException, ValueError):
                        available_quantity = 1  # If quantity can't be determined, use 1
                    
                    logger.info(f"Available for order SKU {sku}: {available_quantity} pcs")
                    print(f"[DEMO] Available for order: {available_quantity} pcs")
                    
                    # "Add to cart" button
                    add_button = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.XPATH, "//div[contains(@data-widget, 'webAddToCart')]//button"))
                    )
                    
                    # In demo version, limit quantity to 2 for safety
                    demo_quantity = min(2, available_quantity)
                    
                    # If more than 1 product needs to be added, use quantity selector
                    if demo_quantity > 1:
                        try:
                            print(f"[DEMO] Setting demo quantity: {demo_quantity} pcs")
                            # Click on quantity selector
                            quantity_selector = self.driver.find_element(By.XPATH, "//div[contains(@data-widget, 'quantity')]//input")
                            quantity_selector.click()
                            
                            # Clear field and enter required value
                            quantity_selector.clear()
                            quantity_selector.send_keys(str(demo_quantity))
                            
                            # Press Enter to confirm
                            quantity_selector.send_keys(Keys.ENTER)
                            time.sleep(1)  # Wait for value to apply
                        except NoSuchElementException:
                            logger.warning(f"Could not find quantity selector for SKU {sku}")
                            print(f"[DEMO] ⚠️ Could not set quantity, adding 1 pc")
                    
                    # Short pause for visibility
                    time.sleep(1)
                    
                    # Click add to cart button
                    add_button.click()
                    
                    # Wait for successful addition
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Товар в корзине')]"))
                    )
                    
                    logger.info(f"Product SKU {sku} successfully added to cart")
                    print(f"[DEMO] ✅ Product successfully added to cart")
                    self._take_screenshot(f"demo_add_to_cart_{sku}")
                    
                    # Short pause for visibility
                    time.sleep(2)
                    
                    added_count += 1
                    
                except Exception as e:
                    logger.error(f"Error adding product {sku} to cart: {e}")
                    print(f"[DEMO] ❌ Error adding product {sku} to cart: {e}")
                    self._take_screenshot(f"demo_add_to_cart_error_{sku}")
            
            logger.info(f"Adding products to cart complete. Added: {added_count} out of {len(limited_sku_list)}")
            print(f"[DEMO] Adding products to cart complete. Added: {added_count} out of {len(limited_sku_list)}")
            return added_count
            
        except Exception as e:
            logger.error(f"Error in process of adding products to cart: {e}")
            print(f"[DEMO] ❌ Error in process of adding products to cart: {e}")
            self._take_screenshot("demo_add_products_error")
            return added_count
    
    def _clear_cart(self):
        """
        Clear cart before starting
        """
        try:
            logger.info("Clearing cart")
            print("[DEMO] Clearing cart before adding products...")
            
            self.driver.get("https://www.ozon.ru/cart")
            
            # Wait for cart page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'total')]"))
            )
            
            # Check if cart is already empty
            try:
                empty_cart = self.driver.find_element(By.XPATH, "//h1[contains(text(), 'Корзина пуста')]")
                logger.info("Cart is already empty")
                print("[DEMO] ✅ Cart is already empty")
                return
            except NoSuchElementException:
                pass
            
            # Click "Remove selected" button
            try:
                # First select all products
                select_all = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Выбрать все')]/parent::div//input"))
                )
                if not select_all.is_selected():
                    select_all.click()
                
                # Short pause for visibility
                time.sleep(1)
                
                # Click delete button
                delete_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Удалить выбранные')]/parent::button"))
                )
                delete_button.click()
                
                # Short pause for visibility
                time.sleep(1)
                
                # Confirm deletion
                confirm_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@role, 'dialog')]//button[contains(text(), 'Удалить')]"))
                )
                confirm_button.click()
                
                # Wait for cart to clear
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Корзина пуста')]"))
                )
                
                logger.info("Cart successfully cleared")
                print("[DEMO] ✅ Cart successfully cleared")
                self._take_screenshot("demo_clear_cart_success")
            except (TimeoutException, NoSuchElementException) as e:
                logger.warning(f"Could not clear cart: {e}")
                print(f"[DEMO] ⚠️ Could not clear cart: {e}")
                self._take_screenshot("demo_clear_cart_error")
        except Exception as e:
            logger.error(f"Error clearing cart: {e}")
            print(f"[DEMO] ❌ Error clearing cart: {e}")
    
    def checkout(self):
        """
        Demonstration of checkout process (without actual checkout)
        :return: True for successful demonstration
        """
        try:
            logger.info("Starting checkout demonstration")
            print("\n[DEMO] Step 3: Demonstrating checkout process (without actual checkout)...")
            
            # Navigate to cart
            self.driver.get("https://www.ozon.ru/cart")
            
            # Wait for cart page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'total')]"))
            )
            
            # Check if cart is empty
            try:
                self.driver.find_element(By.XPATH, "//h1[contains(text(), 'Корзина пуста')]")
                logger.warning("Cart is empty, nothing to checkout")
                print("[DEMO] ⚠️ Cart is empty, nothing to checkout")
                return False
            except NoSuchElementException:
                pass
            
            # Demo screenshot of cart with items
            self._take_screenshot("demo_cart_with_items")
            print("[DEMO] ✅ Products successfully added to cart and ready for checkout")
            
            # Find "Proceed to checkout" button, but don't click it
            checkout_button = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Перейти к оформлению')]"))
            )
            
            # Highlight the element using JavaScript for demonstration
            self.driver.execute_script("""
                arguments[0].style.border = '3px solid red';
                arguments[0].style.backgroundColor = '#FDFF47';
            """, checkout_button)
            
            print("[DEMO] In the full version, the bot will automatically complete the checkout:")
            print("   1. Click 'Proceed to checkout' button")
            print(f"   2. Select payment method: '{self.config.get('payment_method', 'Банковская карта')}'")
            print("   3. Confirm the order")
            print("\n[DEMO] ⚠️ In demo mode, actual checkout is not performed")
            
            # Short pause for visibility
            time.sleep(5)
            
            logger.info("Checkout demonstration successfully completed")
            print("[DEMO] ✅ Checkout demonstration successfully completed")
            
            return True
        
        except Exception as e:
            logger.error(f"Error during checkout demonstration: {e}")
            print(f"[DEMO] ❌ Error during checkout demonstration: {e}")
            self._take_screenshot("demo_checkout_error")
            
            return False
    
    def _take_screenshot(self, filename):
        """
        Save screenshot
        :param filename: screenshot filename
        """
        try:
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"screenshots/{filename}_{timestamp}.png"
            self.driver.save_screenshot(screenshot_path)
            logger.info(f"Screenshot saved: {screenshot_path}")
            print(f"[DEMO] 📸 Screenshot saved: {screenshot_path}")
        except Exception as e:
            logger.error(f"Error saving screenshot: {e}")
            print(f"[DEMO] ❌ Error saving screenshot: {e}")
    
    def _send_notification(self, message):
        """
        Send notification to Telegram
        :param message: message text
        """
        if TELEGRAM_AVAILABLE and self.telegram_bot and self.telegram_chat_id:
            try:
                self.telegram_bot.send_message(chat_id=self.telegram_chat_id, text=message)
                logger.info("Telegram notification sent")
                print("[DEMO] 📱 Telegram notification sent")
            except Exception as e:
                logger.error(f"Error sending Telegram notification: {e}")
                print(f"[DEMO] ❌ Error sending Telegram notification: {e}")
    
    def run(self):
        """
        Main bot execution method (demo version)
        """
        try:
            logger.info("Starting demo version of Ozon product reservation bot")
            print("\n" + "="*80)
            print("    DEMO MODE OF OZON PRODUCT RESERVATION BOT")
            print("    (No actual orders will be placed)")
            print("="*80 + "\n")
            
            # Initialize driver
            self.driver = self._setup_driver()
            
            # Login
            if not self.login():
                logger.error("Failed to login, aborting demonstration")
                print("\n[DEMO] ❌ Failed to login, demonstration aborted")
                return False
            
            # Add products to cart
            added_count = self.add_products_to_cart()
            if added_count == 0:
                logger.warning("Could not add products to cart, aborting demonstration")
                print("\n[DEMO] ⚠️ Could not add products to cart, demonstration aborted")
                return False
            
            # Demonstration of checkout (without actual checkout)
            checkout_result = self.checkout()
            
            print("\n" + "="*80)
            print("    DEMONSTRATION SUCCESSFULLY COMPLETED")
            print("    In the full version, the bot will automatically place an order with these settings:")
            print(f"    - Processing up to {len(self.config.get('sku_list', []))} SKU products")
            print(f"    - Payment method: {self.config.get('payment_method', 'Банковская карта')}")
            print(f"    - Schedule: {'Enabled' if self.config.get('schedule', {}).get('enabled', False) else 'Disabled'}")
            if self.config.get('schedule', {}).get('enabled', False) and self.config.get('schedule', {}).get('daily'):
                print(f"    - Daily run at: {', '.join(self.config.get('schedule', {}).get('daily', []))}")
            print("="*80 + "\n")
            
            return checkout_result
            
        except Exception as e:
            logger.error(f"Error in demo version of bot: {e}")
            print(f"\n[DEMO] ❌ Critical error in demo version of bot: {str(e)}")
            return False
        finally:
            # Close driver with a short delay to see the result
            if self.driver:
                try:
                    print("\n[DEMO] Closing browser in 10 seconds...")
                    time.sleep(10)
                    self.driver.quit()
                    logger.info("Browser driver closed")
                    print("[DEMO] Browser driver closed")
                except:
                    pass

def main():
    """
    Entry point
    """
    try:
        # Check for config file
        config_path = "config.json"
        if not os.path.exists(config_path):
            print(f"[DEMO] ❌ Configuration file {config_path} not found")
            print("[DEMO] Create a config.json file based on config.example.json and enter your credentials")
            return
        
        # Run demonstration
        bot = OzonReservationBot(config_path)
        result = bot.run()
        logger.info(f"Demonstration completed with result: {'Success' if result else 'Error'}")
            
    except Exception as e:
        logger.error(f"Error in main function: {e}")
        print(f"[DEMO] ❌ Critical error: {e}")
        print("[DEMO] Check system requirements and configuration file correctness")

if __name__ == "__main__":
    main()
