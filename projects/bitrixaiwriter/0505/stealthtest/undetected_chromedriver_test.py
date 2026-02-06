#!/usr/bin/env python3
"""
Ozon Anti-Bot Detection Test Script using Undetected-ChromeDriver
This script attempts to open Ozon.ru and navigate to the login page
to determine if the anti-bot detection system identifies automation.
"""

import os
import time
import logging
import argparse
import random
from datetime import datetime
from pathlib import Path

# Import undetected-chromedriver
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("undetected_chromedriver_test.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create screenshots directory if it doesn't exist
SCREENSHOTS_DIR = Path("screenshots/undetected_chromedriver")
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

class OzonBotDetectionTest:
    """Class to test Ozon.ru anti-bot detection using undetected-chromedriver"""
    
    def __init__(self, headless=False):
        """Initialize the test with options"""
        self.headless = headless
        self.driver = None
        self.results = {
            "main_page_accessible": False,
            "login_page_accessible": False,
            "captcha_detected": False,
            "anti_bot_message_detected": False,
            "screenshots": []
        }
    
    def setup_driver(self):
        """Set up undetected-chromedriver with stealth settings"""
        logger.info("Setting up undetected-chromedriver...")
        
        options = uc.ChromeOptions()
        
        # Configure options for stealth
        options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Additional performance improvements
        options.add_argument("--disable-popup-blocking")
        options.add_argument("--disable-notifications")
        
        # Privacy settings
        options.add_argument("--incognito")
        
        # Handle headless mode if needed
        if self.headless:
            options.add_argument("--headless")
            options.add_argument("--window-size=1920,1080")
        
        # Create driver with configured options
        try:
            self.driver = uc.Chrome(options=options, use_subprocess=True)
            # Set a reasonable window size if not headless
            if not self.headless:
                self.driver.set_window_size(1366, 768)
            logger.info("Driver setup successful")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize driver: {e}")
            return False
    
    def take_screenshot(self, name):
        """Take screenshot and save it to the screenshots directory"""
        if not self.driver:
            logger.warning("Cannot take screenshot: Driver not initialized")
            return None
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{name}.png"
        filepath = SCREENSHOTS_DIR / filename
        
        try:
            self.driver.save_screenshot(str(filepath))
            logger.info(f"Screenshot saved: {filepath}")
            self.results["screenshots"].append(str(filepath))
            return filepath
        except Exception as e:
            logger.error(f"Failed to take screenshot: {e}")
            return None
    
    def simulate_human_behavior(self):
        """Simulate human-like behavior to evade bot detection"""
        # Random wait time before actions
        time.sleep(random.uniform(1.5, 3.5))
        
        # Random scrolling
        scroll_amount = random.randint(100, 300)
        self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
        time.sleep(random.uniform(0.5, 1.5))
        
        # More scrolling with different timing
        scroll_amount = random.randint(200, 500)
        self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
        time.sleep(random.uniform(1.0, 2.0))
    
    def check_for_bot_detection(self):
        """Check if the page contains anti-bot detection messages or captcha"""
        page_source = self.driver.page_source.lower()
        
        # Common indicators of bot detection pages
        bot_detection_indicators = [
            "bot detected", 
            "automated access", 
            "captcha",
            "robot",
            "human verification",
            "подтвердите, что вы не робот",  # Russian: "Confirm you're not a robot"
            "автоматизированный доступ",     # Russian: "Automated access"
            "проверка безопасности"          # Russian: "Security check"
        ]
        
        # Check for any bot detection indicators in the page source
        for indicator in bot_detection_indicators:
            if indicator in page_source:
                logger.warning(f"Bot detection indicator found: '{indicator}'")
                self.results["anti_bot_message_detected"] = True
                return True
        
        # Look for common captcha elements
        captcha_elements = [
            "//iframe[contains(@src, 'captcha')]",
            "//iframe[contains(@src, 'recaptcha')]",
            "//div[contains(@class, 'captcha')]",
            "//div[contains(@class, 'g-recaptcha')]",
            "//iframe[contains(@title, 'reCAPTCHA')]",
            "//iframe[contains(@title, 'captcha')]"
        ]
        
        for xpath in captcha_elements:
            try:
                element = self.driver.find_elements(By.XPATH, xpath)
                if element:
                    logger.warning(f"Captcha element found: {xpath}")
                    self.results["captcha_detected"] = True
                    return True
            except:
                pass
        
        return False
    
    def visit_main_page(self):
        """Visit Ozon.ru main page and check for detection"""
        logger.info("Visiting Ozon.ru main page...")
        
        try:
            # Open main page
            self.driver.get("https://www.ozon.ru/")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Take screenshot
            self.take_screenshot("main_page")
            
            # Check for bot detection
            if self.check_for_bot_detection():
                logger.warning("Bot detection found on main page")
                return False
            
            # Simulate human behavior
            self.simulate_human_behavior()
            
            logger.info("Successfully accessed main page")
            self.results["main_page_accessible"] = True
            return True
            
        except Exception as e:
            logger.error(f"Error accessing main page: {e}")
            self.take_screenshot("main_page_error")
            return False
    
    def navigate_to_login(self):
        """Navigate to the login page and check for detection"""
        logger.info("Navigating to login page...")
        
        try:
            # Look for login link - attempt different selectors (may need adjustment)
            login_selectors = [
                "//a[contains(@href, 'login')]",
                "//div[contains(@class, 'login')]",
                "//button[contains(text(), 'Войти')]",  # Russian: "Log in"
                "//a[contains(text(), 'Войти')]",       # Russian: "Log in"
                "//span[contains(text(), 'Войти')]"     # Russian: "Log in"
            ]
            
            login_element = None
            for selector in login_selectors:
                try:
                    login_element = WebDriverWait(self.driver, 3).until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    if login_element:
                        break
                except:
                    continue
            
            if not login_element:
                logger.warning("Could not find login element")
                self.take_screenshot("login_button_not_found")
                return False
            
            # Simulate human behavior before clicking
            self.simulate_human_behavior()
            
            # Click the login button
            login_element.click()
            
            # Wait for login page to load
            WebDriverWait(self.driver, 10).until(
                EC.url_contains("login") or
                EC.url_contains("auth") or
                EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
            )
            
            # Take screenshot
            self.take_screenshot("login_page")
            
            # Check for bot detection
            if self.check_for_bot_detection():
                logger.warning("Bot detection found on login page")
                return False
                
            logger.info("Successfully accessed login page")
            self.results["login_page_accessible"] = True
            return True
            
        except TimeoutException:
            logger.error("Timeout waiting for login page to load")
            self.take_screenshot("login_page_timeout")
            return False
        except Exception as e:
            logger.error(f"Error navigating to login page: {e}")
            self.take_screenshot("login_page_error")
            return False
    
    def run_test(self):
        """Run the complete test suite"""
        logger.info("Starting Ozon anti-bot detection test with undetected-chromedriver...")
        
        start_time = time.time()
        
        # Setup the driver
        if not self.setup_driver():
            logger.error("Failed to set up the driver. Aborting test.")
            return self.results
        
        try:
            # Visit main page
            main_page_success = self.visit_main_page()
            
            # Navigate to login page if main page was successful
            if main_page_success:
                login_page_success = self.navigate_to_login()
            else:
                login_page_success = False
                
            # Record test completion time
            test_duration = time.time() - start_time
            self.results["test_duration"] = f"{test_duration:.2f} seconds"
            
            # Print summary
            logger.info("Test completed. Summary:")
            logger.info(f"Main page accessible: {self.results['main_page_accessible']}")
            logger.info(f"Login page accessible: {self.results['login_page_accessible']}")
            logger.info(f"Captcha detected: {self.results['captcha_detected']}")
            logger.info(f"Anti-bot message detected: {self.results['anti_bot_message_detected']}")
            logger.info(f"Test duration: {self.results['test_duration']}")
            
            return self.results
            
        finally:
            # Always clean up the driver
            if self.driver:
                self.driver.quit()
                logger.info("Driver closed")

def main():
    """Main function to run the test"""
    parser = argparse.ArgumentParser(description="Test Ozon.ru anti-bot detection using undetected-chromedriver")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    args = parser.parse_args()
    
    test = OzonBotDetectionTest(headless=args.headless)
    results = test.run_test()
    
    # Print final verdict
    if results["captcha_detected"] or results["anti_bot_message_detected"]:
        print("\n❌ RESULT: Bot was DETECTED")
    elif results["main_page_accessible"] and results["login_page_accessible"]:
        print("\n✅ RESULT: Bot was NOT detected")
    else:
        print("\n⚠️ RESULT: Test INCONCLUSIVE (could not access all pages)")
    
    # Print screenshots location
    if results["screenshots"]:
        print(f"\nScreenshots saved to: {SCREENSHOTS_DIR}")

if __name__ == "__main__":
    main()
