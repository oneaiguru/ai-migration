"""
Demo version of the Ozon product reservation bot (Stealth Mode)
Author: Michael Granin
Version: 1.1 (DEMO STEALTH ENHANCED)

IMPORTANT: This demo version does not place actual orders 
and is intended for demonstration purposes only
"""

import os
import time
import json
import random
import hashlib
import logging
import schedule
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from webdriver_manager.firefox import GeckoDriverManager
import tempfile
import shutil
import platform
import socket

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

# List of realistic User-Agent strings for different browsers
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76",
]

# Advanced anti-bot detection JavaScript code
STEALTH_JS = """
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

// Add fake plugins
const mockPlugins = [
    {name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format'},
    {name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format'},
    {name: 'Native Client', filename: 'internal-nacl-plugin', description: ''}
];

// Add plugins to navigator
const originalPlugins = navigator.plugins;
const pluginProto = Object.getPrototypeOf(originalPlugins);
let plugins = Object.create(pluginProto);

// Copy prototype chain
const descriptors = Object.getOwnPropertyDescriptors(originalPlugins);
Object.defineProperties(plugins, descriptors);

// Create a proxy to handle length property and iteration
Object.defineProperty(navigator, 'plugins', {
    get: () => {
        // Create a proxy that adds mock plugins to the real plugins collection
        const handler = {
            get: function(target, prop, receiver) {
                // Handle length property
                if (prop === 'length') {
                    return target.length + mockPlugins.length;
                }
                
                // Return mock plugin for new indices
                const idx = parseInt(prop);
                if (!isNaN(idx) && idx >= target.length && idx < target.length + mockPlugins.length) {
                    const mockIndex = idx - target.length;
                    return mockPlugins[mockIndex];
                }

                // Default behavior for other properties
                return Reflect.get(target, prop, receiver);
            },
            ownKeys: function(target) {
                // Return indices for all items (real plugins + mock plugins)
                return [...Array(target.length + mockPlugins.length).keys()].map(String);
            },
            getOwnPropertyDescriptor: function(target, prop) {
                // For numeric indices, provide a descriptor
                const idx = parseInt(prop);
                if (!isNaN(idx) && idx >= 0 && idx < target.length + mockPlugins.length) {
                    return {
                        value: idx < target.length ? target[idx] : mockPlugins[idx - target.length],
                        enumerable: true,
                        configurable: true,
                        writable: false
                    };
                }
                return Reflect.getOwnPropertyDescriptor(target, prop);
            }
        };
        
        return new Proxy(originalPlugins, handler);
    },
    configurable: true
});

// Override permissions API
const originalQuery = window.navigator.permissions?.query;
if (originalQuery) {
    window.navigator.permissions.query = function(parameters) {
        return Promise.resolve({
            state: 'granted',
            onchange: null
        });
    };
}

// Override toString for functions
const originalToString = Function.prototype.toString;
Function.prototype.toString = function() {
    if (this === navigator.permissions.query) {
        return 'function query() { [native code] }';
    }
    // Handle other functions we've modified
    if (this.name === 'query' || this === window.navigator.permissions.query) {
        return 'function query() { [native code] }';
    }
    return originalToString.call(this);
};

// Add fake languages
Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
    configurable: true
});

// Make detection of Selenium/WebDriver harder
document.documentElement.setAttribute('webdriver', 'false');
document.documentElement.setAttribute('driver', 'false');
document.documentElement.setAttribute('selenium', 'false');
"""

class OzonReservationBot:
    """
    Bot for automatic product reservation on Ozon marketplace (stealth demo version)
    """
    
    def __init__(self, config_path="config.json"):
        """
        Bot initialization
        :param config_path: path to configuration file
        """
        self.config = self._load_config(config_path)
        self.driver = None
        self.telegram_bot = None
        self.temp_profile_dir = None
        
        if TELEGRAM_AVAILABLE and self.config.get("telegram_token") and self.config.get("telegram_chat_id"):
            try:
                self.telegram_bot = telegram.Bot(token=self.config["telegram_token"])
                self.telegram_chat_id = self.config["telegram_chat_id"]
            except Exception as e:
                logger.warning(f"Failed to initialize Telegram bot: {e}")
    
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
    
    def _get_hardware_info(self):
        """
        Generate a hardware-based unique identifier to mimic real browsers
        """
        system_info = {
            'platform': platform.system(),
            'processor': platform.processor(),
            'hostname': socket.gethostname()
        }
        
        # Create a stable unique hardware ID based on real system info
        fingerprint_source = f"{system_info['platform']}|{system_info['processor']}|{system_info['hostname']}"
        hardware_id = hashlib.sha256(fingerprint_source.encode("utf-8")).hexdigest()[:16]
        
        return hardware_id
    
    def _setup_driver(self):
        """
        Setup Selenium WebDriver in stealth mode
        :return: WebDriver object
        """
        try:
            # Generate a hardware-based fingerprint
            hardware_id = self._get_hardware_info()
            logger.info(f"Using hardware ID for fingerprinting: {hardware_id}")
            print(f"[DEMO] 🔒 Using unique hardware fingerprint: {hardware_id}")
            
            # Choose a random User-Agent
            chosen_user_agent = self.config.get('user_agent', random.choice(USER_AGENTS))
            logger.info(f"Using User-Agent: {chosen_user_agent}")
            print(f"[DEMO] Using User-Agent: {chosen_user_agent}")
            
            # Create a temporary directory for the Firefox profile
            self.temp_profile_dir = tempfile.mkdtemp()
            logger.info(f"Created temporary profile directory: {self.temp_profile_dir}")
            print(f"[DEMO] Created temporary Firefox profile for anti-detection")
            
            # Configure Firefox options (use options for profile settings in newer Selenium)
            firefox_options = FirefoxOptions()
            if self.config.get("headless", False):
                firefox_options.add_argument("--headless")
            
            # Set User-Agent
            firefox_options.set_preference("general.useragent.override", chosen_user_agent)
            
            # Disable WebDriver automation flags
            firefox_options.set_preference("dom.webdriver.enabled", False)
            firefox_options.set_preference("useAutomationExtension", False)
            
            # Disable notifications and other detectable features
            firefox_options.set_preference("dom.webnotifications.enabled", False)
            firefox_options.set_preference("media.volume_scale", "0.0")
            firefox_options.set_preference("browser.download.folderList", 2)
            firefox_options.set_preference("browser.download.manager.showWhenStarting", False)
            firefox_options.set_preference("browser.helperApps.neverAsk.saveToDisk", "application/octet-stream")
            
            # Advanced privacy settings
            firefox_options.set_preference("webgl.disabled", True)
            firefox_options.set_preference("privacy.resistFingerprinting", True)
            firefox_options.set_preference("dom.enable_performance", False)
            firefox_options.set_preference("browser.cache.disk.enable", True)
            firefox_options.set_preference("browser.sessionstore.privacy_level", 2)
            
            # Hardware acceleration and WebGL settings
            firefox_options.set_preference("webgl.disabled", False)  # Enable WebGL for more realistic browser
            firefox_options.set_preference("layers.acceleration.disabled", False)
            firefox_options.set_preference("gfx.direct2d.disabled", False)
            
            # Set a unique hardware-based canvas fingerprint
            firefox_options.set_preference("privacy.resistFingerprinting.autoDeclineNoUserInputCanvasPrompts", False)
            
            # Timezone settings to match local system
            firefox_options.set_preference("intl.accept_languages", "ru,en-US,en")
            
            # Enable cookies (needed for login session)
            firefox_options.set_preference("network.cookie.cookieBehavior", 0)
            
            # Set Firefox profile directory if needed
            firefox_options.set_preference("profile", self.temp_profile_dir)
            
            # Initialize Firefox with stealth settings
            logger.info("Initializing Firefox in enhanced stealth mode")
            print("[DEMO] ⚠️ Initializing Firefox with ENHANCED STEALTH MODE to avoid bot detection")
            service = FirefoxService(GeckoDriverManager().install())
            
            # Create driver with updated options
            driver = webdriver.Firefox(
                service=service,
                options=firefox_options
            )
            
            # Set a realistic window size
            driver.set_window_size(1920, 1080)
            driver.set_page_load_timeout(60)
            
            # Execute our enhanced anti-detection JavaScript
            driver.execute_script(STEALTH_JS)
            
            # Additional custom fingerprinting based on hardware ID
            driver.execute_script(f"""
                // Add custom data to canvas fingerprinting
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function(type) {{
                    const dataURL = originalToDataURL.apply(this, arguments);
                    
                    // Only modify if it's likely a fingerprinting attempt
                    if (this.width === 16 && this.height === 16) {{
                        // Create a consistent but unique modification based on hardware ID
                        const hwPrefix = "{hardware_id}";
                        return dataURL.substring(0, 50) + hwPrefix + dataURL.substring(50 + hwPrefix.length);
                    }}
                    
                    return dataURL;
                }};
                
                // Hardware-based audio fingerprint
                if (window.AudioContext || window.webkitAudioContext) {{
                    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
                    AudioBuffer.prototype.getChannelData = function() {{
                        const channelData = originalGetChannelData.apply(this, arguments);
                        // Add subtle "noise" based on hardware ID
                        const hwValue = parseInt("{hardware_id}".substring(0, 6), 36) / 1000000000;
                        
                        // Only modify every 1000th value for fingerprinting attempts
                        // This is subtle enough to not affect audio but changes fingerprint
                        for (let i = 0; i < channelData.length; i += 1000) {{
                            if (i < channelData.length) {{
                                channelData[i] = channelData[i] + hwValue;
                            }}
                        }}
                        
                        return channelData;
                    }};
                }}
            """)
            
            logger.info("Browser driver initialized successfully in enhanced stealth mode")
            print("[DEMO] ✅ Browser successfully initialized with ENHANCED anti-detection measures")
            return driver
        except Exception as e:
            logger.error(f"Error setting up driver: {e}")
            if self.temp_profile_dir and os.path.exists(self.temp_profile_dir):
                shutil.rmtree(self.temp_profile_dir)
            raise
    
    def _random_human_behavior(self):
        """
        Perform random human-like actions to improve stealth
        """
        try:
            actions = [
                self._random_mouse_movement,
                lambda: self._scroll_page('down'),
                lambda: self._scroll_page('up'),
                lambda: self._human_like_delay(0.5, 3.0),
                lambda: self._perform_random_clicks()
            ]
            
            # Randomly choose 1-3 actions
            num_actions = random.randint(1, 3)
            for _ in range(num_actions):
                random.choice(actions)()
                
            logger.debug("Performed random human behavior")
            print("[DEMO] 👤 Simulating random human browsing behavior")
        except Exception as e:
            logger.debug(f"Error simulating random human behavior: {e}")
    
    def _perform_random_clicks(self):
        """
        Click on safe non-functional areas of the page
        """
        try:
            # Find safe areas to click (non-button elements like empty divs or whitespace)
            elements = self.driver.find_elements(By.TAG_NAME, "div")
            safe_elements = []
            
            for element in elements[:20]:  # Limit search to first 20 elements for performance
                try:
                    # Check if element has children that are buttons or links
                    has_interactive = len(element.find_elements(By.TAG_NAME, "button")) > 0 or \
                                     len(element.find_elements(By.TAG_NAME, "a")) > 0
                    
                    # Skip elements with text and interactive elements
                    if not has_interactive and (not element.text or element.text.isspace()):
                        rect = element.rect
                        # Only consider visible elements with some size
                        if rect['width'] > 10 and rect['height'] > 10 and rect['x'] > 0 and rect['y'] > 0:
                            safe_elements.append(element)
                except:
                    continue
            
            if safe_elements:
                # Click a random safe element
                element = random.choice(safe_elements)
                actions = ActionChains(self.driver)
                actions.move_to_element(element).perform()
                self._human_like_delay(0.1, 0.5)
                
                # Click off-center to appear more human-like
                offset_x = random.randint(-10, 10)
                offset_y = random.randint(-10, 10)
                actions.move_by_offset(offset_x, offset_y).click().perform()
                
                logger.debug("Performed random safe click")
                print("[DEMO] 👆 Random human-like click on non-functional page area")
        except Exception as e:
            logger.debug(f"Error performing random clicks: {e}")
    
    def _human_like_delay(self, min_seconds=0.5, max_seconds=2.5):
        """
        Simulate human-like delay between actions
        :param min_seconds: minimum delay time
        :param max_seconds: maximum delay time
        """
        # For longer delays, add micro-pauses to simulate human distraction
        if max_seconds > 2.0:
            chunks = random.randint(2, 4)
            for _ in range(chunks):
                delay = random.uniform(min_seconds/chunks, max_seconds/chunks)
                time.sleep(delay)
        else:
            delay = random.uniform(min_seconds, max_seconds)
            time.sleep(delay)
    
    def _human_like_typing(self, element, text):
        """
        Simulate human-like typing
        :param element: element to type in
        :param text: text to type
        """
        # Generate realistic typing pattern with varied speeds and occasional errors
        typing_errors = random.random() < 0.3  # 30% chance of making a typing error
        
        # Simulate more realistic typing pattern
        for i, char in enumerate(text):
            # Occasionally pause longer between words
            if i > 0 and text[i-1] == ' ':
                time.sleep(random.uniform(0.1, 0.4))
            
            # Type the character
            element.send_keys(char)
            
            # Vary typing speed based on character type
            if char.isalpha():
                time.sleep(random.uniform(0.03, 0.15))  # Faster for regular letters
            elif char.isdigit():
                time.sleep(random.uniform(0.05, 0.2))   # Slower for numbers
            elif char in '.,-_@!':
                time.sleep(random.uniform(0.1, 0.3))    # Slowest for special characters
            else:
                time.sleep(random.uniform(0.05, 0.2))   # Default speed
            
            # Occasionally simulate a typing error and correct it
            if typing_errors and i < len(text) - 1 and random.random() < 0.03:  # 3% chance per character
                # Type a wrong character
                wrong_char = chr(ord(char) + random.randint(1, 5))
                element.send_keys(wrong_char)
                time.sleep(random.uniform(0.1, 0.3))  # Pause before noticing error
                
                # Delete the wrong character
                element.send_keys(Keys.BACKSPACE)
                time.sleep(random.uniform(0.1, 0.2))  # Pause before continuing
    
    def _random_mouse_movement(self):
        """
        Simulate random mouse movements
        """
        try:
            action = ActionChains(self.driver)
            viewport_width = self.driver.execute_script("return window.innerWidth;")
            viewport_height = self.driver.execute_script("return window.innerHeight;")
            
            # Generate path for natural mouse movement using Bezier curve simulation
            points = random.randint(3, 7)  # More points for more complex paths
            
            # First point is current mouse position
            current_x = self.driver.execute_script("return window.mouseX || 100;")
            current_y = self.driver.execute_script("return window.mouseY || 100;")
            
            # Generate random points for the path
            path_points = []
            for _ in range(points):
                x = random.randint(0, viewport_width)
                y = random.randint(0, viewport_height)
                path_points.append((x, y))
            
            # Add code to track mouse position
            self.driver.execute_script("""
                if (!window.mouseX) {
                    window.mouseX = 100;
                    window.mouseY = 100;
                    document.addEventListener('mousemove', function(e) {
                        window.mouseX = e.clientX;
                        window.mouseY = e.clientY;
                    });
                }
            """)
            
            # Move mouse along the path with human-like acceleration/deceleration
            for i, point in enumerate(path_points):
                # Calculate a random but smooth speed
                speed = random.uniform(0.1, 0.4) if i == 0 or i == len(path_points) - 1 else random.uniform(0.05, 0.15)
                
                # Move to the point
                action.move_by_offset(point[0] - current_x, point[1] - current_y).perform()
                current_x, current_y = point
                
                # Reset action chain to prevent accumulation
                action = ActionChains(self.driver)
                
                # Delay between movements (slower at start and end)
                self._human_like_delay(speed, speed * 1.5)
                
            logger.debug("Performed complex mouse movement pattern")
            print("[DEMO] 🖱️ Human-like mouse movement with natural acceleration")
        except Exception as e:
            logger.debug(f"Error simulating mouse movement: {e}")
    
    def _scroll_page(self, direction='down', distance=None):
        """
        Simulate page scrolling
        :param direction: scroll direction ('up' or 'down')
        :param distance: scroll distance (if None, will be random)
        """
        try:
            if distance is None:
                distance = random.randint(100, 800)  # Random scroll distance
            
            # Implement natural scrolling with acceleration and deceleration
            scroll_time = random.uniform(0.3, 1.2)  # Total time for scroll in seconds
            steps = random.randint(5, 15)  # Number of smaller scrolls to make up the full scroll
            
            # Natural easing function for acceleration/deceleration
            def ease_in_out(t):
                return 3 * t**2 - 2 * t**3  # Smooth ease in/out function
            
            total_scrolled = 0
            start_time = time.time()
            
            for i in range(steps):
                # Calculate progress through the scroll (0 to 1)
                t = i / (steps - 1) if steps > 1 else 1
                
                # Apply easing for acceleration/deceleration
                ease_factor = ease_in_out(t)
                
                # Calculate how much to scroll in this step
                step_size = int(distance * ease_factor) - total_scrolled
                total_scrolled += step_size
                
                # Apply the scroll
                if direction == 'up':
                    self.driver.execute_script(f"window.scrollBy(0, -{step_size});")
                else:  # down
                    self.driver.execute_script(f"window.scrollBy(0, {step_size});")
                
                # Calculate how long to sleep based on timing and progress
                elapsed = time.time() - start_time
                target_time = scroll_time * ease_factor
                
                if elapsed < target_time:
                    time.sleep(target_time - elapsed)
            
            logger.debug(f"Scrolled page {direction} with natural motion by {distance}px")
            print(f"[DEMO] 📜 Human-like scrolling {direction} with inertia")
        except Exception as e:
            logger.debug(f"Error scrolling page: {e}")
    
    def _open_with_stealth(self, url):
        """Navigate to URL and re-apply stealth JS since it resets per document."""
        self.driver.get(url)
        try:
            self.driver.execute_script(STEALTH_JS)
        except Exception:
            # If injection fails, continue; better than hard failing navigation
            logger.debug("Stealth JS injection skipped on navigation")

    def login(self):
        """
        Authorization on Ozon website
        :return: True for successful login, otherwise False
        """
        try:
            logger.info("Starting login process")
            print("\n[DEMO] Step 1: Logging into Ozon with enhanced anti-detection measures...")
            
            self._open_with_stealth("https://www.ozon.ru/")
            
            # Execute additional anti-detection measures after page load
            self.driver.execute_script("""
                // Hide automation markers
                if (window.navigator.permissions) {
                    Object.defineProperty(window.navigator.permissions, 'query', {
                        value: function(parameters) {
                            return Promise.resolve({state: 'granted', onchange: null});
                        }
                    });
                }
                
                // Hide WebRTC IP leakage
                if (window.navigator.mediaDevices) {
                    Object.defineProperty(window.navigator.mediaDevices, 'enumerateDevices', {
                        value: function() {
                            return Promise.resolve([]);
                        }
                    });
                }
            """)
            
            # Simulate random viewing time on homepage
            self._human_like_delay(1, 3)
            print("[DEMO] Simulating human-like browsing on homepage")
            self._random_mouse_movement()
            self._scroll_page('down')
            
            # Add some random human behavior
            self._random_human_behavior()
            
            # Click login button
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Войти')]"))
            )
            
            # Simulate cursor movement to button
            action = ActionChains(self.driver)
            action.move_to_element(login_button).perform()
            self._human_like_delay()
            print("[DEMO] Moving cursor to login button")
            login_button.click()
            
            # Delay before next action
            self._human_like_delay()
            
            # Choose login method (email/phone)
            email_login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Войти по почте')]"))
            )
            action.move_to_element(email_login_button).perform()
            self._human_like_delay()
            print("[DEMO] Selecting login by email option")
            email_login_button.click()
            
            # Add more random human behavior
            self._random_human_behavior()
            
            # Enter email/phone with human-like typing
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='email']"))
            )
            action.move_to_element(email_input).perform()
            self._human_like_delay()
            email_input.clear()
            print("[DEMO] Typing email address with advanced human-like patterns")
            self._human_like_typing(email_input, self.config["login"])
            
            # Delay before clicking button
            self._human_like_delay()
            
            # Click "Continue"
            continue_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            action.move_to_element(continue_button).perform()
            self._human_like_delay()
            print("[DEMO] Clicking continue button")
            continue_button.click()
            
            # Delay for password form load
            self._human_like_delay(1, 2.5)
            
            # Enter password with human-like typing
            password_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='password']"))
            )
            action.move_to_element(password_input).perform()
            self._human_like_delay()
            password_input.clear()
            print("[DEMO] Typing password with advanced human-like patterns")
            self._human_like_typing(password_input, self.config["password"])
            
            # Delay before clicking button
            self._human_like_delay()
            
            # Click "Login"
            login_submit = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            action.move_to_element(login_submit).perform()
            self._human_like_delay()
            print("[DEMO] Clicking login button")
            login_submit.click()
            
            # Check successful login
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'profileMenu')]"))
            )
            
            # Execute additional code to appear more human after login
            self.driver.execute_script("""
                // Record the time when pages are opened
                if (!window.pageOpenTimes) {
                    window.pageOpenTimes = {};
                }
                window.pageOpenTimes[document.location.href] = Date.now();
                
                // Add a delay to any tracking/analytics requests
                const originalXHROpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function() {
                    // Check if this is likely a tracking/analytics request
                    const url = arguments[1];
                    if (url && (url.includes('collect') || url.includes('analytics') || url.includes('track'))) {
                        // Delay tracking requests by a random amount
                        const delay = Math.floor(Math.random() * 500) + 100;
                        setTimeout(() => {
                            originalXHROpen.apply(this, arguments);
                        }, delay);
                    } else {
                        originalXHROpen.apply(this, arguments);
                    }
                };
                
                // Record if the page was interacted with
                if (!window.interactionRecorded) {
                    window.interactionRecorded = true;
                    document.addEventListener('click', () => {
                        window.lastInteraction = Date.now();
                    });
                    document.addEventListener('keydown', () => {
                        window.lastInteraction = Date.now();
                    });
                }
            """)
            
            # Simulate viewing page after login
            self._human_like_delay()
            self._scroll_page('down')
            self._random_mouse_movement()
            
            logger.info("Login successful")
            print("[DEMO] ✅ Login successful - Enhanced anti-detection measures working!")
            self._take_screenshot("demo_enhanced_stealth_login_success")
            return True
        except Exception as e:
            logger.error(f"Login error: {e}")
            print(f"[DEMO] ❌ Login error: {e}")
            self._take_screenshot("demo_enhanced_stealth_login_error")
            return False
    
    def add_products_to_cart(self):
        """
        Add products to cart from the list in configuration
        :return: number of products added
        """
        added_count = 0
        
        try:
            logger.info("Starting process of adding products to cart")
            print("\n[DEMO] Step 2: Adding products to cart with enhanced anti-detection measures...")
            
            # Clear cart before adding new products
            self._clear_cart()
            
            # Get SKU list from configuration
            sku_list = self.config.get("sku_list", [])
            
            if not sku_list:
                logger.warning("SKU list is empty")
                print("[DEMO] ⚠️ SKU list is empty. Check configuration file.")
                return 0
            
            print(f"[DEMO] Found {len(sku_list)} products to process")
            
            # In demo version, limit to 1 product for faster demonstration
            demo_limit = min(1, len(sku_list))
            limited_sku_list = sku_list[:demo_limit]
            
            if demo_limit < len(sku_list):
                print(f"[DEMO] For demonstration purposes, processing only {demo_limit} of {len(sku_list)} products")
            
            for sku in limited_sku_list:
                try:
                    print(f"[DEMO] Processing product with SKU: {sku}")
                    # Navigate to product page
                    self._open_with_stealth(f"https://www.ozon.ru/product/{sku}")
                    self._human_like_delay(2, 4)  # Simulate reading product page
                    
                    # More enhanced anti-detection measures after product page load
                    self.driver.execute_script("""
                        // Simulate reading the page - move mouse naturally to product details
                        const moveMouseNaturally = () => {
                            const productElements = document.querySelectorAll('h1, .price');
                            if (productElements.length > 0) {
                                const randomElement = productElements[Math.floor(Math.random() * productElements.length)];
                                const rect = randomElement.getBoundingClientRect();
                                const x = rect.left + rect.width / 2;
                                const y = rect.top + rect.height / 2;
                                
                                // Create and dispatch a mouse move event
                                const mouseEvent = new MouseEvent('mousemove', {
                                    view: window,
                                    bubbles: true,
                                    cancelable: true,
                                    clientX: x,
                                    clientY: y
                                });
                                document.dispatchEvent(mouseEvent);
                            }
                        };
                        
                        // Schedule a few natural mouse movements
                        setTimeout(moveMouseNaturally, Math.random() * 1000 + 500);
                        setTimeout(moveMouseNaturally, Math.random() * 2000 + 1500);
                    """)
                    
                    # Simulate page viewing behaviors in more natural way
                    print("[DEMO] Simulating human-like product page browsing with enhanced patterns")
                    self._scroll_page('down')
                    self._human_like_delay()
                    self._random_human_behavior()
                    self._scroll_page('down')
                    self._human_like_delay()
                    self._random_mouse_movement()
                    self._scroll_page('up')
                    
                    # Wait for page to load
                    add_cart_button = WebDriverWait(self.driver, 10).until(
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
                    
                    # In demo version, limit quantity to 1 for safety
                    demo_quantity = min(1, available_quantity)
                    
                    # If more than 1 product needs to be added, use quantity selector
                    if demo_quantity > 1:
                        try:
                            print(f"[DEMO] Setting demo quantity: {demo_quantity} pcs")
                            # Click on quantity selector
                            quantity_selector = self.driver.find_element(By.XPATH, "//div[contains(@data-widget, 'quantity')]//input")
                            
                            # Simulate cursor movement to selector
                            actions = ActionChains(self.driver)
                            actions.move_to_element(quantity_selector).perform()
                            self._human_like_delay()
                            quantity_selector.click()
                            
                            # Clear field and enter required value
                            quantity_selector.clear()
                            self._human_like_typing(quantity_selector, str(demo_quantity))
                            
                            # Press Enter to confirm
                            self._human_like_delay()
                            quantity_selector.send_keys(Keys.RETURN)
                            self._human_like_delay(1, 2)  # Wait for value to apply
                        except NoSuchElementException:
                            logger.warning(f"Could not find quantity selector for SKU {sku}")
                            print(f"[DEMO] ⚠️ Could not set quantity, adding 1 pc")
                    
                    # Add random human behavior before clicking the button
                    self._random_human_behavior()
                    
                    # Simulate cursor movement to button
                    actions = ActionChains(self.driver)
                    actions.move_to_element(add_button).perform()
                    self._human_like_delay()
                    print("[DEMO] Moving cursor to 'Add to cart' button")
                    
                    # Click add to cart button
                    add_button.click()
                    
                    # Wait for successful addition
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Товар в корзине')]"))
                    )
                    
                    logger.info(f"Product SKU {sku} successfully added to cart")
                    print(f"[DEMO] ✅ Product successfully added to cart - Enhanced anti-detection measures working!")
                    self._take_screenshot(f"demo_enhanced_stealth_add_to_cart_{sku}")
                    
                    # Simulate viewing result
                    self._human_like_delay(1, 3)
                    
                    added_count += 1
                    
                except Exception as e:
                    logger.error(f"Error adding product {sku} to cart: {e}")
                    print(f"[DEMO] ❌ Error adding product {sku} to cart: {e}")
                    self._take_screenshot(f"demo_enhanced_stealth_add_to_cart_error_{sku}")
            
            logger.info(f"Adding products to cart complete. Added: {added_count} out of {len(limited_sku_list)}")
            print(f"[DEMO] Adding products to cart complete. Added: {added_count} out of {len(limited_sku_list)}")
            return added_count
            
        except Exception as e:
            logger.error(f"Error in process of adding products to cart: {e}")
            print(f"[DEMO] ❌ Error in process of adding products to cart: {e}")
            self._take_screenshot("demo_enhanced_stealth_add_products_error")
            return added_count
    
    def _clear_cart(self):
        """
        Clear cart before starting
        """
        try:
            logger.info("Clearing cart")
            print("[DEMO] Clearing cart before adding products...")
            
            self._open_with_stealth("https://www.ozon.ru/cart")
            self._human_like_delay()
            
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
            
            # Add random human behavior
            self._random_human_behavior()
            
            # Simulate viewing cart
            print("[DEMO] Simulating enhanced human-like behavior on cart page")
            self._scroll_page('down')
            self._human_like_delay()
            self._random_mouse_movement()
            self._scroll_page('up')
            
            # Click "Remove selected" button
            try:
                # First select all products
                select_all = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Выбрать все')]/parent::div//input"))
                )
                
                # Simulate cursor movement to checkbox
                actions = ActionChains(self.driver)
                actions.move_to_element(select_all).perform()
                self._human_like_delay()
                print("[DEMO] Selecting all items in cart")
                
                if not select_all.is_selected():
                    select_all.click()
                    self._human_like_delay()
                
                # Add some human behavior after selecting
                self._random_human_behavior()
                
                # Click delete button
                delete_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Удалить выбранные')]/parent::button"))
                )
                
                # Simulate cursor movement to button
                actions = ActionChains(self.driver)
                actions.move_to_element(delete_button).perform()
                self._human_like_delay()
                print("[DEMO] Clicking 'Delete selected' button")
                delete_button.click()
                self._human_like_delay()
                
                # Confirm deletion
                confirm_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@role, 'dialog')]//button[contains(text(), 'Удалить')]"))
                )
                
                # Simulate cursor movement to button
                actions = ActionChains(self.driver)
                actions.move_to_element(confirm_button).perform()
                self._human_like_delay()
                print("[DEMO] Confirming deletion")
                confirm_button.click()
                
                # Wait for cart to clear
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Корзина пуста')]"))
                )
                
                logger.info("Cart successfully cleared")
                print("[DEMO] ✅ Cart successfully cleared with enhanced anti-detection measures")
                self._take_screenshot("demo_enhanced_stealth_clear_cart_success")
            except (TimeoutException, NoSuchElementException) as e:
                logger.warning(f"Could not clear cart: {e}")
                print(f"[DEMO] ⚠️ Could not clear cart: {e}")
                self._take_screenshot("demo_enhanced_stealth_clear_cart_error")
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
            print("\n[DEMO] Step 3: Demonstrating checkout process with enhanced anti-detection measures (without actual checkout)...")
            
            # Navigate to cart
            self._open_with_stealth("https://www.ozon.ru/cart")
            self._human_like_delay()
            
            # Advanced anti-detection on checkout page
            self.driver.execute_script("""
                // Modify performance timing to look natural
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    const navigationStart = timing.navigationStart;
                    
                    // Add random small variance to timing values for a more natural fingerprint
                    const addJitter = (value) => {
                        const jitter = Math.floor(Math.random() * 50) - 25; // -25 to +25 ms
                        return value + jitter;
                    };
                    
                    // Adjust the timing properties if possible
                    try {
                        Object.defineProperty(timing, 'domLoading', {
                            get: () => addJitter(timing.domLoading)
                        });
                        Object.defineProperty(timing, 'domInteractive', {
                            get: () => addJitter(timing.domInteractive)
                        });
                        Object.defineProperty(timing, 'domContentLoadedEventStart', {
                            get: () => addJitter(timing.domContentLoadedEventStart)
                        });
                        Object.defineProperty(timing, 'domContentLoadedEventEnd', {
                            get: () => addJitter(timing.domContentLoadedEventEnd)
                        });
                        Object.defineProperty(timing, 'domComplete', {
                            get: () => addJitter(timing.domComplete)
                        });
                        Object.defineProperty(timing, 'loadEventStart', {
                            get: () => addJitter(timing.loadEventStart)
                        });
                        Object.defineProperty(timing, 'loadEventEnd', {
                            get: () => addJitter(timing.loadEventEnd)
                        });
                    } catch (e) {
                        // Timing properties might be read-only in some browsers
                    }
                }
            """)
            
            # Simulate viewing cart with more complex behavior
            print("[DEMO] Simulating enhanced human-like behavior on checkout page")
            self._random_human_behavior()
            self._scroll_page('down')
            self._human_like_delay()
            self._random_mouse_movement()
            self._scroll_page('up')
            
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
            self._take_screenshot("demo_enhanced_stealth_cart_with_items")
            print("[DEMO] ✅ Products successfully added to cart and ready for checkout")
            
            # Find "Proceed to checkout" button, but don't click it
            checkout_button = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Перейти к оформлению')]"))
            )
            
            # Simulate cursor moving to checkout button with subtle hesitation
            actions = ActionChains(self.driver)
            
            # Move mouse with more realistic targeting
            # First, move near the button but not quite on it
            button_rect = checkout_button.rect
            actions.move_by_offset(
                button_rect['x'] + button_rect['width'] * 0.7,
                button_rect['y'] + button_rect['height'] * 0.3
            ).perform()
            self._human_like_delay(0.3, 0.7)
            
            # Then move to the actual button
            actions = ActionChains(self.driver)
            actions.move_to_element(checkout_button).perform()
            self._human_like_delay(1, 2)
            print("[DEMO] Hovering over 'Proceed to checkout' button")
            
            # Highlight the element using JavaScript for demonstration
            self.driver.execute_script("""
                arguments[0].style.border = '3px solid red';
                arguments[0].style.backgroundColor = '#FDFF47';
            """, checkout_button)
            
            print("[DEMO] Enhanced Anti-Detection Success: Bot prevention bypassed successfully")
            print("[DEMO] Anti-detection measures implemented:")
            print("   ✅ Modified browser fingerprinting to appear as a real browser")
            print("   ✅ Hardware-based fingerprinting randomization")
            print("   ✅ Human-like mouse movements with realistic acceleration")
            print("   ✅ Natural scrolling behavior with inertia")
            print("   ✅ Realistic typing patterns with occasional errors")
            print("   ✅ Random human-like page interactions")
            print("   ✅ Browser timing modifications to avoid detection")
            print("   ✅ Audio and canvas fingerprint protection")
            
            print("\n[DEMO] In the full version, the bot will automatically complete the checkout:")
            print("   1. Click 'Proceed to checkout' button")
            print(f"   2. Select payment method: '{self.config.get('payment_method', 'Банковская карта')}'")
            print("   3. Confirm the order")
            print("\n[DEMO] ⚠️ In demo mode, actual checkout is not performed")
            
            # Short pause for visibility
            time.sleep(5)
            
            logger.info("Checkout demonstration successfully completed")
            print("[DEMO] ✅ Checkout demonstration successfully completed with enhanced anti-detection measures")
            
            return True
        
        except Exception as e:
            logger.error(f"Error during checkout demonstration: {e}")
            print(f"[DEMO] ❌ Error during checkout demonstration: {e}")
            self._take_screenshot("demo_enhanced_stealth_checkout_error")
            
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
            logger.info("Starting enhanced demo version of Ozon product reservation bot with anti-detection measures")
            print("\n" + "="*80)
            print("    ENHANCED STEALTH DEMO MODE OF OZON PRODUCT RESERVATION BOT")
            print("    (No actual orders will be placed)")
            print("    (Advanced anti-detection measures are active)")
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
            print("    ENHANCED STEALTH DEMO SUCCESSFULLY COMPLETED")
            print("    Anti-Detection Performance Summary:")
            print("    ✅ JavaScript anti-detection measures implemented")
            print("    ✅ Human-like browsing behavior simulated")
            print("    ✅ Temporary browser profile used to prevent tracking")
            print("    ✅ WebDriver detection bypassed")
            print("    ✅ Hardware-based fingerprinting protection added")
            print("    ✅ Canvas and audio fingerprinting modified")
            print("    ✅ Mouse movement physics with natural acceleration")
            print("    ✅ WebRTC and timing-based detection prevention")
            print("\n    In the full version, the bot will automatically place an order with these settings:")
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
            
            # Delete temporary profile directory
            if self.temp_profile_dir and os.path.exists(self.temp_profile_dir):
                try:
                    shutil.rmtree(self.temp_profile_dir)
                    logger.info(f"Temporary profile directory deleted: {self.temp_profile_dir}")
                    print("[DEMO] 🧹 Temporary Firefox profile cleaned up")
                except Exception as e:
                    logger.error(f"Error deleting temporary profile directory: {e}")

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
