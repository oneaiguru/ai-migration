"""
Fixed Stealth Bot with Enhanced Anti-Detection Features
"""

import os
import time
import random
import logging
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.firefox import GeckoDriverManager
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create screenshots directory
os.makedirs("screenshots", exist_ok=True)

def test_ozon_enhanced_stealth():
    logger.info("Starting enhanced stealth test for Ozon.ru")
    temp_profile_dir = None
    
    try:
        # Create temporary directory for Firefox profile
        temp_profile_dir = tempfile.mkdtemp()
        logger.info(f"Created temporary profile directory: {temp_profile_dir}")
        
        # Set up Firefox options with advanced stealth settings
        options = FirefoxOptions()
        
        # Set User-Agent to look like a regular browser
        options.set_preference("general.useragent.override", 
                         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
        
        # Disable automation flags
        options.set_preference("dom.webdriver.enabled", False)
        options.set_preference("useAutomationExtension", False)
        
        # Disable notifications and other detectable features
        options.set_preference("dom.webnotifications.enabled", False)
        options.set_preference("media.volume_scale", "0.0")
        options.set_preference("browser.download.folderList", 2)
        options.set_preference("browser.download.manager.showWhenStarting", False)
        
        # Privacy and fingerprinting protection
        options.set_preference("privacy.resistFingerprinting", True)
        options.set_preference("webgl.disabled", True)
        options.set_preference("dom.enable_performance", False)
        
        # Use Russian locale
        options.set_preference("intl.accept_languages", "ru,en-US,en")
        
        # Initialize Firefox with enhanced stealth settings
        logger.info("Initializing Firefox with enhanced anti-detection measures")
        driver = webdriver.Firefox(
            service=FirefoxService(GeckoDriverManager().install()),
            options=options
        )
        
        # Set realistic window size
        driver.set_window_size(1920, 1080)
        
        # Execute anti-detection JavaScript
        driver.execute_script("""
            // Override WebDriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
                configurable: true
            });
            
            // Add browser properties that real browsers have
            window.navigator.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {
                    isInstalled: false,
                }
            };
            
            // Modify performance timing to look natural
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const navigationStart = timing.navigationStart;
                
                // Add random small variance to timing values
                const addJitter = (value) => {
                    const jitter = Math.floor(Math.random() * 50) - 25; // -25 to +25 ms
                    return value + jitter;
                };
                
                try {
                    Object.defineProperty(timing, 'domLoading', {
                        get: () => addJitter(timing.domLoading)
                    });
                    Object.defineProperty(timing, 'domInteractive', {
                        get: () => addJitter(timing.domInteractive)
                    });
                } catch (e) {
                    // Timing properties might be read-only in some browsers
                }
            }
            
            // Override permissions API
            if (window.navigator.permissions) {
                window.navigator.permissions.query = function(parameters) {
                    return Promise.resolve({
                        state: 'granted',
                        onchange: null
                    });
                };
            }
        """)
        
        logger.info("Browser initialized with enhanced anti-detection measures")
        
        # Visit Ozon.ru with human-like behavior
        logger.info("Visiting Ozon.ru...")
        driver.get("https://www.ozon.ru/")
        
        # Wait for page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Simulate human-like delays
        time.sleep(random.uniform(2, 4))
        
        # Simulate scrolling
        logger.info("Simulating human-like scrolling behavior")
        for _ in range(3):
            scroll_amount = random.randint(100, 500)
            driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
            time.sleep(random.uniform(0.7, 2.0))
        
        # Simulate mouse movement
        logger.info("Simulating human-like mouse movement")
        actions = ActionChains(driver)
        body = driver.find_element(By.TAG_NAME, "body")
        for _ in range(5):
            x = random.randint(100, 800)
            y = random.randint(100, 600)
            actions.move_to_element_with_offset(body, x, y).perform()
            time.sleep(random.uniform(0.3, 1.0))
        
        # Take screenshot
        timestamp = int(time.time())
        screenshot_path = f"screenshots/ozon_enhanced_test_{timestamp}.png"
        driver.save_screenshot(screenshot_path)
        logger.info(f"Screenshot saved to: {screenshot_path}")
        
        # Analyze page for bot detection
        page_source = driver.page_source.lower()
        bot_detected = any(term in page_source for term in [
            "captcha", "robot", "automated", "подтвердите, что вы не робот",
            "проверка безопасности", "автоматизированный доступ"
        ])
        
        if bot_detected:
            logger.info("❌ Bot detection triggered despite enhanced measures!")
        else:
            logger.info("✅ Success! No bot detection signals found with enhanced measures")
        
        # Save page HTML for analysis
        with open(f"page_content_{timestamp}.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        logger.info(f"Page content saved to page_content_{timestamp}.html")
        
        # Wait a moment before closing
        time.sleep(5)
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()
            logger.info("WebDriver closed")
        
        # Clean up temporary profile directory
        if temp_profile_dir and os.path.exists(temp_profile_dir):
            shutil.rmtree(temp_profile_dir)
            logger.info(f"Temporary profile directory removed: {temp_profile_dir}")

if __name__ == "__main__":
    test_ozon_enhanced_stealth()
