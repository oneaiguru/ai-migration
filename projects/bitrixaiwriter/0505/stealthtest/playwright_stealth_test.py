#!/usr/bin/env python3
"""
Ozon Anti-Bot Detection Test Script using Playwright with Stealth Plugins
This script attempts to open Ozon.ru and navigate to the login page
to determine if the anti-bot detection system identifies automation.
"""

import os
import time
import logging
import argparse
import random
import asyncio
from datetime import datetime
from pathlib import Path

# Import Playwright and Stealth
import playwright
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("playwright_stealth_test.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create screenshots directory if it doesn't exist
SCREENSHOTS_DIR = Path("screenshots/playwright_stealth")
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

class OzonBotDetectionTest:
    """Class to test Ozon.ru anti-bot detection using Playwright with stealth"""
    
    def __init__(self, headless=False, browser_type="chromium"):
        """Initialize the test with options"""
        self.headless = headless
        self.browser_type = browser_type  # chromium, firefox, or webkit
        self.browser = None
        self.context = None
        self.page = None
        self.results = {
            "main_page_accessible": False,
            "login_page_accessible": False,
            "captcha_detected": False,
            "anti_bot_message_detected": False,
            "screenshots": []
        }
    
    async def take_screenshot(self, name):
        """Take screenshot and save it to the screenshots directory"""
        if not self.page:
            logger.warning("Cannot take screenshot: Page not initialized")
            return None
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{name}.png"
        filepath = SCREENSHOTS_DIR / filename
        
        try:
            await self.page.screenshot(path=str(filepath))
            logger.info(f"Screenshot saved: {filepath}")
            self.results["screenshots"].append(str(filepath))
            return filepath
        except Exception as e:
            logger.error(f"Failed to take screenshot: {e}")
            return None
    
    async def simulate_human_behavior(self):
        """Simulate human-like behavior to evade bot detection"""
        if not self.page:
            return
            
        # Random wait time before actions
        await asyncio.sleep(random.uniform(1.5, 3.5))
        
        # Random scrolling
        scroll_amount = random.randint(100, 300)
        await self.page.evaluate(f"window.scrollBy(0, {scroll_amount});")
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # More scrolling with different timing
        scroll_amount = random.randint(200, 500)
        await self.page.evaluate(f"window.scrollBy(0, {scroll_amount});")
        await asyncio.sleep(random.uniform(1.0, 2.0))
        
        # Move mouse to a random position (more human-like)
        page_width = await self.page.evaluate("document.body.clientWidth")
        page_height = await self.page.evaluate("document.body.clientHeight")
        x = random.randint(0, page_width - 100)
        y = random.randint(0, page_height - 100)
        await self.page.mouse.move(x, y)
    
    async def check_for_bot_detection(self):
        """Check if the page contains anti-bot detection messages or captcha"""
        if not self.page:
            return False
            
        page_content = await self.page.content()
        page_content = page_content.lower()
        
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
            if indicator in page_content:
                logger.warning(f"Bot detection indicator found: '{indicator}'")
                self.results["anti_bot_message_detected"] = True
                return True
        
        # Look for common captcha elements
        captcha_selectors = [
            "iframe[src*='captcha']",
            "iframe[src*='recaptcha']",
            "div[class*='captcha']",
            "div[class*='g-recaptcha']",
            "iframe[title*='reCAPTCHA']",
            "iframe[title*='captcha']"
        ]
        
        for selector in captcha_selectors:
            element = await self.page.query_selector(selector)
            if element:
                logger.warning(f"Captcha element found: {selector}")
                self.results["captcha_detected"] = True
                return True
        
        return False
    
    async def visit_main_page(self):
        """Visit Ozon.ru main page and check for detection"""
        logger.info("Visiting Ozon.ru main page...")
        
        try:
            # Open main page
            await self.page.goto("https://www.ozon.ru/", wait_until="domcontentloaded")
            
            # Wait for page to load more completely
            await self.page.wait_for_selector("body", timeout=10000)
            
            # Take screenshot
            await self.take_screenshot("main_page")
            
            # Check for bot detection
            if await self.check_for_bot_detection():
                logger.warning("Bot detection found on main page")
                return False
            
            # Simulate human behavior
            await self.simulate_human_behavior()
            
            logger.info("Successfully accessed main page")
            self.results["main_page_accessible"] = True
            return True
            
        except Exception as e:
            logger.error(f"Error accessing main page: {e}")
            await self.take_screenshot("main_page_error")
            return False
    
    async def navigate_to_login(self):
        """Navigate to the login page and check for detection"""
        logger.info("Navigating to login page...")
        
        try:
            # Look for login link - attempt different selectors (may need adjustment)
            login_selectors = [
                "a[href*='login']",
                "div[class*='login']",
                "button:has-text('Войти')",  # Russian: "Log in"
                "a:has-text('Войти')",       # Russian: "Log in"
                "span:has-text('Войти')"     # Russian: "Log in"
            ]
            
            login_element = None
            for selector in login_selectors:
                try:
                    login_element = await self.page.wait_for_selector(selector, timeout=3000)
                    if login_element:
                        break
                except:
                    continue
            
            if not login_element:
                logger.warning("Could not find login element")
                await self.take_screenshot("login_button_not_found")
                return False
            
            # Simulate human behavior before clicking
            await self.simulate_human_behavior()
            
            # Click the login button
            await login_element.click()
            
            # Wait for login page to load
            try:
                # First try to wait for a change in URL
                await self.page.wait_for_url(lambda url: "login" in url or "auth" in url, timeout=5000)
            except:
                # If URL doesn't change, look for password input as fallback
                await self.page.wait_for_selector("input[type='password']", timeout=5000)
            
            # Take screenshot
            await self.take_screenshot("login_page")
            
            # Check for bot detection
            if await self.check_for_bot_detection():
                logger.warning("Bot detection found on login page")
                return False
                
            logger.info("Successfully accessed login page")
            self.results["login_page_accessible"] = True
            return True
            
        except playwright.errors.TimeoutError:
            logger.error("Timeout waiting for login page to load")
            await self.take_screenshot("login_page_timeout")
            return False
        except Exception as e:
            logger.error(f"Error navigating to login page: {e}")
            await self.take_screenshot("login_page_error")
            return False
    
    async def run_test(self):
        """Run the complete test suite"""
        logger.info(f"Starting Ozon anti-bot detection test with Playwright ({self.browser_type}) + stealth...")
        
        start_time = time.time()
        
        async with async_playwright() as p:
            try:
                # Select browser based on type
                if self.browser_type == "firefox":
                    browser_module = p.firefox
                elif self.browser_type == "webkit":
                    browser_module = p.webkit
                else:
                    browser_module = p.chromium
                
                # Launch browser with custom settings for fingerprinting protection
                self.browser = await browser_module.launch(headless=self.headless)
                
                # Create a new browser context with specific options
                self.context = await self.browser.new_context(
                    viewport={'width': 1366, 'height': 768},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    locale="ru-RU",  # Russian locale for Ozon
                    geolocation={"longitude": 37.6156, "latitude": 55.7522},  # Moscow coordinates
                    permissions=["geolocation"],
                    is_mobile=False
                )
                
                # Create a new page
                self.page = await self.context.new_page()
                
                # Apply stealth plugin
                await stealth_async(self.page)
                
                # Visit main page
                main_page_success = await self.visit_main_page()
                
                # Navigate to login page if main page was successful
                if main_page_success:
                    login_page_success = await self.navigate_to_login()
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
                
            except Exception as e:
                logger.error(f"Test failed with error: {e}")
                return self.results
            finally:
                # Always clean up the browser
                if self.browser:
                    await self.browser.close()
                    logger.info("Browser closed")

async def main_async():
    """Async main function to run the test"""
    parser = argparse.ArgumentParser(description="Test Ozon.ru anti-bot detection using Playwright with stealth")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], default="chromium", 
                        help="Browser engine to use (default: chromium)")
    args = parser.parse_args()
    
    test = OzonBotDetectionTest(headless=args.headless, browser_type=args.browser)
    results = await test.run_test()
    
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

def main():
    """Main function to run the async test"""
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
