"""
YCLIENTS Parser - Основной модуль парсинга данных с платформы YCLIENTS.
"""
import asyncio
import logging
import time
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

from playwright.async_api import async_playwright, Browser, BrowserContext, Page, TimeoutError
import re

from src.browser.browser_manager import BrowserManager
from src.browser.proxy_manager import ProxyManager
from src.database.db_manager import DatabaseManager
from src.parser.production_data_extractor import ProductionDataExtractor
from src.parser.yclients_real_selectors import YCLIENTS_REAL_SELECTORS
from config.settings import PARSE_INTERVAL, MAX_RETRIES, TIMEOUT, USER_AGENTS, PAGE_LOAD_TIMEOUT
from config.venue_pricing import (
    get_venue_price,
    get_tariff_name_for_time,
    extract_venue_id,
    get_pricing_config,
    get_universal_price,
    auto_build_pricing_rules,
    get_price_from_service_name,
)


logger = logging.getLogger(__name__)


class YClientsParser:
    """
    Основной класс для парсинга данных с YCLIENTS.
    Использует Playwright для работы с веб-страницами и эмуляции поведения пользователя.
    """

    def __init__(self, urls: List[str], db_manager: DatabaseManager):
        """
        Инициализация парсера.
        
        Args:
            urls: Список URL-адресов для парсинга
            db_manager: Экземпляр менеджера базы данных
        """
        self.urls = urls
        self.db_manager = db_manager
        self.browser_manager = BrowserManager()
        self.proxy_manager = ProxyManager()
        # Используем production-ready экстрактор данных
        self.data_extractor = ProductionDataExtractor()
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.current_proxy = None
        self.retry_count = 0
        self.last_parsed_urls = {}  # Для отслеживания успешно обработанных URL
        self.captured_api_data = []  # Shared list for API responses captured during page navigation
        self.captured_api_requests = []  # Captured API request bodies/headers for replay
        self.scraped_providers = []  # HTML-scraped provider/court names for 100% business value
        self.service_catalog = {}  # Service price catalog by tariff/duration (venue-agnostic)
        self.current_venue_id = 'default'  # Current venue ID for pricing lookup
        self.auto_detected_rules = None  # Auto-detected pricing rules from catalog

    async def initialize(self) -> None:
        """Инициализация браузера и контекста."""
        try:
            logger.info("Инициализация браузера")
            
            # Получаем прокси для текущей сессии
            self.current_proxy = self.proxy_manager.get_next_proxy()
            
            # Инициализируем браузер с настройками стелс-режима
            self.browser, self.context = await self.browser_manager.initialize_browser(
                proxy=self.current_proxy
            )
            
            logger.info("Браузер успешно инициализирован")
        except Exception as e:
            logger.error(f"Ошибка инициализации браузера: {str(e)}")
            raise

    async def close(self) -> None:
        """Закрытие браузера и освобождение ресурсов."""
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            logger.info("Браузер и контекст закрыты")
        except Exception as e:
            logger.error(f"Ошибка при закрытии браузера: {str(e)}")

    async def navigate_to_url(self, url: str) -> bool:
        """
        Переход по URL с обработкой ошибок и повторными попытками.
        
        Args:
            url: URL страницы для загрузки
            
        Returns:
            bool: True если переход успешен, False в противном случае
        """
        try:
            # Создаем новую страницу в текущем контексте
            self.page = await self.context.new_page()
            
            # Устанавливаем случайный юзер-агент из списка доступных
            user_agent = self.browser_manager.get_random_user_agent()
            await self.page.set_extra_http_headers({"User-Agent": user_agent})

            # ========== API REQUEST LOGGING AND CAPTURE FOR SPA ==========
            # Clear previously captured data for new page
            self.captured_api_data = []
            self.captured_api_requests = []

            async def capture_and_log_request(request):
                """Capture request payloads for critical APIs to enable replay."""
                url = request.url
                if any(keyword in url for keyword in ['search-timeslots', 'search-services', 'search-staff', 'search-dates']):
                    try:
                        body_text = request.post_data
                        body_json = None
                        if body_text:
                            try:
                                body_json = json.loads(body_text)
                            except Exception:
                                body_json = None
                        logger.info(f"🌐 [API-REQ] {request.method} {url} body={str(body_text)[:200] if body_text else 'None'}")
                        self.captured_api_requests.append({
                            'url': url,
                            'method': request.method,
                            'body': body_text,
                            'body_json': body_json,
                            'headers': dict(request.headers),
                            'timestamp': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.debug(f"Could not capture API request: {e}")

            async def capture_and_log_api(response):
                """Capture API responses AND log them for debugging"""
                url = response.url

                # Log ALL API calls for debugging
                if any(keyword in url for keyword in ['api', 'booking', 'slot', 'availability', 'time', 'service', 'calendar', 'ajax', 'data']):
                    logger.info(f"🌐 [API-CALL] {response.status} {response.request.method} {url}")

                    # Try to capture and log response data
                    try:
                        if response.status == 200:
                            content_type = response.headers.get('content-type', '')

                            if 'application/json' in content_type:
                                data = await response.json()
                                logger.info(f"🌐 [API-DATA] JSON response keys: {list(data.keys()) if isinstance(data, dict) else 'array'}")

                                # Log sample data
                                if isinstance(data, list) and len(data) > 0:
                                    logger.info(f"🌐 [API-SAMPLE] First item: {str(data[0])[:200]}")
                                elif isinstance(data, dict):
                                    logger.info(f"🌐 [API-SAMPLE] Data: {str(data)[:200]}")

                                # Захватываем ВСЕ API для корреляции данных
                                # search-timeslots: время бронирования (datetime, time)
                                # search-services: цены и названия услуг (price_min, price_max, service_name)
                                # search-staff: имена мастеров/кортов (staff_name)
                                # search-dates: доступные даты
                                if any(keyword in url for keyword in [
                                    'search-timeslots',   # Время бронирования
                                    'search-services',    # Цены и названия услуг
                                    'search-staff',       # Провайдеры/корты
                                    'search-dates',       # Доступные даты
                                ]):
                                    # Identify API type
                                    api_type = 'UNKNOWN'
                                    if 'search-timeslots' in url:
                                        api_type = 'TIMESLOTS'
                                    elif 'search-services' in url:
                                        api_type = 'SERVICES'
                                    elif 'search-staff' in url:
                                        api_type = 'STAFF'
                                    elif 'search-dates' in url:
                                        api_type = 'DATES'

                                    logger.info(f"🌐 [API-CAPTURE] ✅ Captured {api_type} from: {url}")

                                    # Log data structure details
                                    if isinstance(data, dict) and 'data' in data:
                                        items = data['data'] if isinstance(data['data'], list) else [data['data']]
                                        logger.info(f"🌐 [API-CAPTURE] {api_type} has {len(items)} items")
                                        if items and len(items) > 0:
                                            first_item = items[0]
                                            if isinstance(first_item, dict) and 'attributes' in first_item:
                                                attrs = first_item['attributes']
                                                logger.info(f"🌐 [API-CAPTURE] {api_type} first item keys: {list(attrs.keys())}")

                                    self.captured_api_data.append({
                                        'api_url': url,
                                        'data': data,
                                        'timestamp': datetime.now().isoformat()
                                    })
                    except Exception as e:
                        logger.debug(f"Could not parse API response: {e}")

            # Attach request listener
            self.page.on('request', capture_and_log_request)
            # Attach listener to page
            self.page.on('response', capture_and_log_api)
            logger.info("🌐 [INIT] Network request listener attached (with capture)")
            # ========== END API REQUEST LOGGING AND CAPTURE ==========

            # Эмуляция поведения пользователя: случайные задержки перед навигацией
            await asyncio.sleep(self.browser_manager.get_random_delay(1, 3))
            
            logger.info(f"Переход по URL: {url}")
            
            # Устанавливаем таймаут загрузки страницы
            response = await self.page.goto(
                url, 
                timeout=PAGE_LOAD_TIMEOUT,
                wait_until="networkidle"
            )
            
            if not response or response.status >= 400:
                logger.error(f"Неудачный запрос к {url}, статус: {response.status if response else 'unknown'}")
                return False
            
            # Ждем полной загрузки страницы и динамического контента
            await self.page.wait_for_load_state("networkidle")

            # Эмуляция случайного скроллинга страницы
            await self.browser_manager.emulate_human_scrolling(self.page)

            # ========== HTML PROVIDER SCRAPING FOR 100% BUSINESS VALUE ==========
            # Scrape provider/court names from HTML (APIs don't have them!)
            await self.scrape_provider_names_from_html()
            # ========== END HTML PROVIDER SCRAPING ==========

            return True
            
        except TimeoutError:
            logger.error(f"Таймаут при загрузке страницы: {url}")
            return False
        except Exception as e:
            logger.error(f"Ошибка при навигации на {url}: {str(e)}")
            return False

    async def scrape_provider_names_from_html(self) -> None:
        """
        Scrape provider/court names from HTML page.
        CRITICAL FOR 100% BUSINESS VALUE - APIs don't have service_name/provider fields!

        Strategy:
        - Find all service/court name elements in DOM
        - Extract text + associated data-id/service-id attributes
        - Store for later correlation with API data
        """
        try:
            logger.info("🏷️  [HTML-SCRAPE] Starting provider name extraction from HTML")

            # Clear previous scraped data
            self.scraped_providers = []

            # Wait a bit for dynamic content to fully render
            await asyncio.sleep(1)

            # Execute JavaScript to find all provider/court/service name elements
            providers = await self.page.evaluate('''() => {
                const results = [];

                // Try multiple selector strategies
                const selectors = [
                    // YClients common patterns
                    '.service-name',
                    '.service-title',
                    '.service-card .title',
                    '.service-item .name',
                    '.staff-name',
                    '.staff-title',
                    '.court-name',
                    '.booking-service-name',
                    '[data-service-name]',
                    '[data-court-name]',
                    '[data-service-title]',
                    // Generic patterns
                    '.service h3',
                    '.service h4',
                    '.card-title',
                    '.item-title',
                    // Try data attributes
                    '[data-service-id]',
                    '[data-staff-id]',
                    '[data-id][class*="service"]',
                    '[data-id][class*="court"]'
                ];

                for (const selector of selectors) {
                    try {
                        const elements = document.querySelectorAll(selector);
                        for (const el of elements) {
                            const text = el.textContent?.trim();
                            if (text && text.length > 0 && text.length < 200) {
                                const id = el.dataset.serviceId || el.dataset.staffId ||
                                           el.dataset.id || el.dataset.courtId ||
                                           el.getAttribute('data-service-id') ||
                                           el.getAttribute('data-id');

                                // Only add if we haven't seen this text yet
                                if (!results.some(r => r.name === text)) {
                                    results.push({
                                        name: text,
                                        id: id || null,
                                        selector: selector,
                                        className: el.className
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        // Selector failed, continue
                    }
                }

                return results;
            }''')

            self.scraped_providers = providers

            if providers:
                logger.info(f"🏷️  [HTML-SCRAPE] Found {len(providers)} provider/court names:")
                for provider in providers[:5]:  # Log first 5
                    logger.info(f"   - {provider.get('name')} (id: {provider.get('id')}, selector: {provider.get('selector')})")
                if len(providers) > 5:
                    logger.info(f"   ... and {len(providers) - 5} more")
            else:
                logger.warning("🏷️  [HTML-SCRAPE] No provider names found in HTML (may need manual selector inspection)")

        except Exception as e:
            logger.error(f"🏷️  [HTML-SCRAPE] Error scraping providers: {e}")
            self.scraped_providers = []

    async def handle_select_services_start_page(self, page: Page) -> bool:
        """
        Handle pages that start at select-services (like Lunda b1280372).
        Navigates: select-services -> click service -> click button -> select-master
        Returns True if successfully navigated to select-master.
        """
        try:
            logger.info("🛒 [SELECT-SERVICES] Detected select-services start page")

            # Step 0: Capture full service catalog for later tariff lookup
            self.service_catalog = await self.capture_service_catalog(page)
            logger.info(f"🛒 [SELECT-SERVICES] Captured {len(self.service_catalog)} tariffs")

            # NEW: Auto-detect pricing rules from catalog
            self.auto_detected_rules = auto_build_pricing_rules(self.service_catalog)

            # Step 1: Click first service card (simple approach for SPA)
            try:
                await page.wait_for_selector('ui-kit-simple-cell', state='visible', timeout=15000)
                service_card = page.locator('ui-kit-simple-cell').first
                await service_card.scroll_into_view_if_needed()
                await service_card.click(timeout=10000)
                logger.info("🛒 [SELECT-SERVICES] Clicked first service card")
                await page.wait_for_timeout(3000)  # Let SPA update
            except Exception as e:
                logger.warning(f"🛒 [SELECT-SERVICES] Service card click failed: {e}")
                return False

            # Step 2: Navigate to select-master via button (no expect_navigation)
            try:
                if 'select-master' in page.url:
                    logger.info("🛒 [SELECT-SERVICES] Already at select-master")
                    return True

                button = page.get_by_role('button', name='Выбрать специалиста')
                if await button.is_visible(timeout=5000):
                    await button.click()
                    logger.info("🛒 [SELECT-SERVICES] Clicked 'Выбрать специалиста'")
                else:
                    continue_btn = page.get_by_role('button', name='Продолжить')
                    if await continue_btn.is_visible(timeout=3000):
                        await continue_btn.click()
                        logger.info("🛒 [SELECT-SERVICES] Clicked 'Продолжить'")
                    else:
                        logger.warning("🛒 [SELECT-SERVICES] No navigation button found")
                        return False

                await page.wait_for_url('**/personal/select-master**', timeout=20000)
                logger.info(f"🛒 [SELECT-SERVICES] Navigated to: {page.url}")

            except Exception as e:
                logger.warning(f"🛒 [SELECT-SERVICES] Navigation failed: {e}")
                if 'select-master' in page.url:
                    return True
                return False

            # Verify we reached select-master
            if 'select-master' in page.url:
                logger.info(f"✅ [SELECT-SERVICES] Successfully navigated to select-master: {page.url}")
                return True
            else:
                logger.warning(f"🛒 [SELECT-SERVICES] Did not reach select-master, current URL: {page.url}")
                return False

        except Exception as e:
            logger.error(f"🛒 [SELECT-SERVICES] Navigation failed: {e}")
            return False

    async def capture_service_catalog(self, page: Page) -> Dict[str, Dict[int, str]]:
        """
        Capture all services from select-services start page (works for any venue).
        Returns: {'Оптимальный': {60: '6 000 ₽', 90: '9 000 ₽', 120: '12 000 ₽'}, ...}
        """
        logger.info("📋 [CATALOG] Capturing service catalog from start page")
        catalog: Dict[str, Dict[int, str]] = {}

        try:
            await page.wait_for_selector('ui-kit-simple-cell', timeout=10000)
            services = await page.locator('ui-kit-simple-cell').all()
            logger.info(f"📋 [CATALOG] Found {len(services)} service cards")

            for idx, service in enumerate(services):
                try:
                    # Extract using correct selectors found in debug output
                    name = await service.locator('.title-block__title').text_content()
                    price_el = await service.locator('.price-range').text_content()
                    duration_el = await service.locator('.comment__seance-length').text_content()

                    # Clean up whitespace
                    if name:
                        name = name.strip()
                    if price_el:
                        price = price_el.strip()
                    else:
                        price = None
                    if duration_el:
                        duration_el = duration_el.strip()

                    logger.info(f"📋 [CATALOG] Card #{idx}: name={name}, price={price}, duration={duration_el}")

                    if name and price:
                        lower_name = name.lower()
                        is_one_hour = ('1 час' in lower_name) and ('1,5' not in lower_name) and ('1.5' not in lower_name)
                        if not is_one_hour:
                            logger.info(f"📋 [CATALOG] Skipping non-1h card #{idx}: {name}")
                            continue

                        tariff = 'Оптимальный'
                        if 'прайм' in lower_name:
                            tariff = 'Прайм-тайм'
                        elif 'смешан' in lower_name:
                            tariff = 'Смешанный'

                        duration_mins = 60
                        if duration_el:
                            lower_duration = duration_el.lower()
                            if '1 ч 30' in lower_duration or '1,5' in lower_duration or '90' in lower_duration:
                                duration_mins = 90
                            elif '2 ч' in lower_duration or '120' in lower_duration:
                                duration_mins = 120

                        if tariff not in catalog:
                            catalog[tariff] = {}

                        # Store all duration prices for each tariff
                        if duration_mins and duration_mins not in catalog[tariff]:
                            catalog[tariff][duration_mins] = price.strip()
                            logger.info(f"📋 [CATALOG] Catalog: {tariff} {duration_mins}min = {price.strip()}")
                    else:
                        logger.warning(f"📋 [CATALOG-DEBUG] Card #{idx} missing data: name={name}, price={price}")

                except Exception as e:
                    logger.debug(f"📋 [CATALOG] Failed to parse service #{idx}: {e}")
                    continue

            logger.info(f"📋 [CATALOG] Catalog complete: {len(catalog)} tariffs captured")
            return catalog

        except Exception as e:
            logger.error(f"📋 [CATALOG] Failed to capture catalog: {e}")
            return {}

    def get_venue_price_for_time(
        self,
        time_str: str,
        catalog: Optional[Dict[str, Dict[int, str]]] = None,
        fallback_price: Optional[str] = None,
        duration: int = 60,
        venue_id: Optional[str] = None
    ) -> str:
        """
        Look up correct price based on venue, time slot, and catalog.
        Uses venue_pricing config to handle different pricing strategies.

        Args:
            time_str: Time like "22:00" or "07:00"
            catalog: Service catalog from capture_service_catalog()
            fallback_price: Price to use if config/catalog lookup fails
            duration: Booking duration in minutes (default 60)
            venue_id: Venue ID for config lookup (uses self.current_venue_id if None)

        Returns:
            Price string like "6 500 ₽"
        """
        if venue_id is None:
            venue_id = self.current_venue_id

        return get_venue_price(
            venue_id=venue_id,
            time_str=time_str,
            catalog=catalog or self.service_catalog,
            fallback_price=fallback_price,
            duration=duration
        )

    async def handle_service_selection_page(self, url: str) -> List[str]:
        """
        Обработка страницы выбора услуг для получения прямых ссылок на бронирование.
        Решает проблему редиректа с URL типа record-type?o=
        
        Args:
            url: URL страницы выбора услуг
            
        Returns:
            List[str]: Список прямых URL для бронирования конкретных услуг
        """
        logger.info(f"Обработка страницы выбора услуг: {url}")
        direct_urls = []
        
        try:
            # Переходим на страницу выбора услуг
            navigation_success = await self.navigate_to_url(url)
            if not navigation_success:
                logger.error(f"Не удалось загрузить страницу выбора услуг: {url}")
                return []
            
            # Ждем загрузки списка услуг
            try:
                await self.page.wait_for_selector('.service-item, .service-option, .record__service', timeout=10000)
            except Exception:
                logger.warning("Не удалось дождаться загрузки списка услуг")
                return []
            
            # Получаем все доступные услуги
            service_selectors = [
                '.service-item', '.service-option', '.record__service',
                '.ycwidget-service', '.booking-service-item'
            ]
            
            service_elements = []
            for selector in service_selectors:
                elements = await self.page.query_selector_all(selector)
                if elements:
                    service_elements = elements
                    logger.info(f"Найдено {len(elements)} услуг с селектором: {selector}")
                    break
            
            if not service_elements:
                logger.warning("Не найдены элементы услуг на странице")
                return []
            
            # Для каждой услуги получаем прямую ссылку
            for i, service_element in enumerate(service_elements[:5]):  # Ограничиваем количество для безопасности
                try:
                    # Пробуем найти ссылку внутри элемента
                    link_element = await service_element.query_selector('a')
                    if link_element:
                        href = await link_element.get_attribute('href')
                        if href:
                            if href.startswith('/'):
                                # Преобразуем относительную ссылку в абсолютную
                                base_url = '/'.join(url.split('/')[:3])
                                direct_url = base_url + href
                            else:
                                direct_url = href
                            
                            if 'record' in direct_url and direct_url not in direct_urls:
                                direct_urls.append(direct_url)
                                logger.info(f"Найдена прямая ссылка: {direct_url}")
                                continue
                    
                    # Если ссылки нет, пробуем кликнуть на элемент
                    logger.info(f"Кликаем на услугу {i+1}")
                    await service_element.click()
                    await asyncio.sleep(2)  # Ждем навигации
                    
                    # Получаем URL после клика
                    current_url = self.page.url
                    if 'record' in current_url and current_url != url and current_url not in direct_urls:
                        direct_urls.append(current_url)
                        logger.info(f"Получена ссылка после клика: {current_url}")
                    
                    # Возвращаемся на страницу выбора услуг
                    await self.page.go_back()
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.warning(f"Ошибка при обработке услуги {i+1}: {str(e)}")
                    continue
            
            logger.info(f"Получено {len(direct_urls)} прямых ссылок для бронирования")
            return direct_urls
            
        except Exception as e:
            logger.error(f"Ошибка при обработке страницы выбора услуг: {str(e)}")
            return []

    async def check_for_antibot(self) -> bool:
        """
        Проверка наличия антибот-защиты и её обход, если возможно.
        
        Returns:
            bool: True если защиты нет или она успешно обойдена, False в противном случае
        """
        try:
            # Проверка на наличие капчи или других форм защиты
            captcha_exists = await self.page.query_selector(".captcha, .recaptcha, .hcaptcha")
            if captcha_exists:
                logger.warning("Обнаружена CAPTCHA, попытка обхода...")
                # Здесь могла бы быть реализация обхода капчи
                # В данной реализации просто закрываем страницу и меняем прокси
                return False
            
            # Проверка на блокировку IP
            blocked_ip = await self.page.query_selector(".blocked, .access-denied, .error-403")
            if blocked_ip:
                logger.warning("IP заблокирован, смена прокси")
                return False
                
            # Другие проверки на антибот-защиту...
            
            return True
        except Exception as e:
            logger.error(f"Ошибка при проверке антибот-защиты: {str(e)}")
            return False

    async def scrape_select_master_page(self, page: Page) -> List[Dict[str, Any]]:
        """
        Scrape ALL courts with times and prices from select-master page.
        This page shows all courts with their available time slots.
        Returns list of booking records.
        """
        results = []

        try:
            logger.info("🏟️ [SELECT-MASTER] Scraping courts from select-master page")

            # Wait for court cards to load
            await page.wait_for_selector('ui-kit-simple-cell', timeout=10000)

            # Wait for times to render (they appear dynamically)
            try:
                await page.wait_for_function('''() => {
                    const timeElements = Array.from(document.querySelectorAll('*')).filter(el =>
                        /^\\d{1,2}:\\d{2}$/.test(el.textContent?.trim())
                    );
                    return timeElements.length > 0;
                }''', timeout=5000)
            except:
                logger.warning("⏰ [SELECT-MASTER] Timeout waiting for times to render")

            async def capture_courts_for_current_state():
                return await page.evaluate('''() => {
                    const courts = [];

                    // Find all court blocks (they have images with alt="Корт №X")
                    const courtImages = document.querySelectorAll('img[alt^="Корт"]');

                    courtImages.forEach(img => {
                        const courtName = img.alt;  // "Корт №1", "Корт №2", etc.

                        // Navigate UP until we find a container that has time elements
                        let container = img.parentElement;

                        for (let i = 0; i < 20 && container; i++) {
                            // Look for ANY child elements with JUST time pattern (HH:MM)
                            const allElements = container.querySelectorAll('*');
                            const timeElements = Array.from(allElements).filter(el => {
                                const text = el.textContent.trim();
                                // Match HH:MM where element is mostly just the time (not longer text)
                                return /^\\d{1,2}:\\d{2}$/.test(text) && el.textContent.length < 10;
                            });

                            if (timeElements.length > 0) {
                                // Found container with times for this court
                                // Price appears as "6,000 ₽" or "6 000 ₽" (space or comma) - find LONGEST match
                                const allPrices = container.textContent.match(/\\d[\\d\\s,]*\\s*₽/g);
                                let price = null;
                                if (allPrices && allPrices.length > 0) {
                                    // Get longest match (6 000 vs 0) then trim
                                    price = allPrices.reduce((a, b) => a.length > b.length ? a : b).trim();
                                }

                                const times = timeElements.map(el => el.textContent.trim());

                                const dateMatch = container.textContent.match(/(завтра|сегодня|[а-я]{2},\\s*\\d+\\s*[а-я]+):/i);
                                const dateHint = dateMatch ? dateMatch[1] : 'завтра';

                                courts.push({
                                    provider: courtName,
                                    price: price,
                                    times: times,
                                    dateHint: dateHint
                                });
                                break;
                            }
                            container = container.parentElement;
                        }
                    });

                    // Shadow DOM search: check for any open shadow roots containing time patterns
                    const walkShadow = (root) => {
                        const courts = [];
                        const timeRegex = /^\\d{1,2}:\\d{2}$/;
                        const priceRegex = /\\d[\\d\\s,]*\\s*₽/g;
                        const traverse = (node) => {
                            if (node.shadowRoot) {
                                const imgs = node.shadowRoot.querySelectorAll('img[alt^="Корт"]');
                                imgs.forEach(img => {
                                    let container = img.parentElement;
                                    for (let i = 0; i < 20 && container; i++) {
                                        const allElements = container.querySelectorAll('*');
                                        const timeElements = Array.from(allElements).filter(el => {
                                            const text = el.textContent.trim();
                                            return timeRegex.test(text) && el.textContent.length < 10;
                                        });
                                        if (timeElements.length > 0) {
                                            const allPrices = container.textContent.match(priceRegex);
                                            let price = null;
                                            if (allPrices && allPrices.length > 0) {
                                                price = allPrices.reduce((a, b) => a.length > b.length ? a : b).trim();
                                            }
                                            const times = timeElements.map(el => el.textContent.trim());
                                            const dateMatch = container.textContent.match(/(завтра|сегодня|[а-я]{2},\\s*\\d+\\s*[а-я]+):/i);
                                            const dateHint = dateMatch ? dateMatch[1] : 'завтра';
                                            courts.push({
                                                provider: img.alt,
                                                price,
                                                times,
                                                dateHint
                                            });
                                            break;
                                        }
                                        container = container.parentElement;
                                    }
                                });
                                Array.from(node.shadowRoot.children).forEach(traverse);
                            }
                            Array.from(node.children).forEach(traverse);
                        };
                        traverse(root);
                        return courts;
                    };
                    const shadowCourts = walkShadow(document);
                    if (shadowCourts.length > 0) {
                        courts.push(...shadowCourts);
                    }

                    return { courts: courts };
                }''')

            # Collect API-derived data for brute-force timeslot fetch
            services_api = []
            staff_api = []
            dates_api = []
            for item in self.captured_api_data:
                api_url = item.get('api_url', '')
                data = item.get('data', {})
                if 'search-services' in api_url and isinstance(data, dict) and 'data' in data:
                    svc_items = data['data'] if isinstance(data['data'], list) else [data['data']]
                    services_api.extend(svc_items)
                elif 'search-staff' in api_url and isinstance(data, dict) and 'data' in data:
                    st_items = data['data'] if isinstance(data['data'], list) else [data['data']]
                    staff_api.extend(st_items)
                elif 'search-dates' in api_url and isinstance(data, dict) and 'data' in data:
                    dt_items = data['data'] if isinstance(data['data'], list) else [data['data']]
                    dates_api.extend(dt_items)

            # Attempt to iterate visible date tabs to load additional time slots
            all_courts = []
            date_locator = page.locator('.calendar-day:not(.disabled), [class*=\"calendar\"] [role=\"button\"]')
            date_count = await date_locator.count()
            if date_count > 0:
                logger.info(f"🏟️ [SELECT-MASTER] Cycling {date_count} date tabs for full slot coverage")
                for i in range(date_count):  # Iterate through ALL visible date tabs
                    try:
                        date_el = date_locator.nth(i)
                        await date_el.click()
                        await page.wait_for_timeout(800)
                        try:
                            await page.wait_for_load_state('networkidle', timeout=5000)
                        except Exception:
                            pass
                        court_data = await capture_courts_for_current_state()
                        all_courts.extend(court_data.get('courts', []))
                    except Exception as e:
                        logger.warning(f"🏟️ [SELECT-MASTER] Date tab {i} click failed: {e}")
                # Try navigating further using right-arrow controls to surface later dates (for evening slots)
                arrow_candidates = [
                    '[class*=\"arrow\"][class*=\"right\"]',
                    '[aria-label*=\"Следующ\"]',
                    'button:has-text(\"›\")',
                    'button:has-text(\"→\")'
                ]
                for step in range(12):
                    try:
                        arrow = None
                        for sel in arrow_candidates:
                            locator = page.locator(sel)
                            if await locator.count() > 0:
                                arrow = locator.first
                                break
                        if not arrow:
                            break
                        await arrow.click()
                        await page.wait_for_timeout(800)
                        # Also try keyboard navigation to advance weeks when arrows are static
                        try:
                            await page.keyboard.press('ArrowRight')
                            await page.wait_for_timeout(400)
                            await page.keyboard.press('ArrowRight')
                        except Exception:
                            pass
                        try:
                            await page.wait_for_load_state('networkidle', timeout=5000)
                        except Exception:
                            pass
                        court_data = await capture_courts_for_current_state()
                        all_courts.extend(court_data.get('courts', []))
                    except Exception as e:
                        logger.warning(f"🏟️ [SELECT-MASTER] Arrow step {step} failed: {e}")
                        break
            else:
                court_data = await capture_courts_for_current_state()
                all_courts = court_data.get('courts', [])

            # Try brute-forcing timeslots API across captured dates/staff/services to surface evening slots
            try:
                # Build service candidates from captured services (prefer 60-min, under 8k)
                service_entries = []
                for svc in services_api:
                    attrs = svc.get('attributes') if isinstance(svc, dict) and 'attributes' in svc else (svc if isinstance(svc, dict) else None)
                    svc_id = svc.get('id') if isinstance(svc, dict) else None
                    if not svc_id and isinstance(attrs, dict):
                        svc_id = attrs.get('id')
                    duration_val = attrs.get('duration') if isinstance(attrs, dict) else None
                    duration_min = None
                    if duration_val:
                        duration_min = int(duration_val / 60) if duration_val > 180 else int(duration_val)
                    price_min = attrs.get('price_min') if isinstance(attrs, dict) else None
                    price_max = attrs.get('price_max') if isinstance(attrs, dict) else None
                    if svc_id:
                        if isinstance(svc_id, str) and svc_id.isdigit():
                            svc_id = int(svc_id)
                        service_entries.append((svc_id, duration_min, price_min, price_max))

                service_ids: List[int] = []
                for svc_id, dur_min, pmin, pmax in service_entries:
                    if dur_min and dur_min != 60:
                        continue  # skip 1.5h/2h services
                    if pmin and pmin > 8000:
                        continue  # skip obviously longer/expensive services
                    service_ids.append(svc_id)
                # Deduplicate while preserving order
                seen_services = set()
                service_ids = [s for s in service_ids if not (s in seen_services or seen_services.add(s))]
                if not service_ids:
                    service_ids = [24071793]  # fallback known service id
                service_ids = service_ids[:4]  # cap to the first 4 relevant services to reduce churn
                logger.info(f"🏟️ [SELECT-MASTER] Service candidates (id, dur_min, price_min): {service_entries}")

                staff_entries = []
                for st in staff_api:
                    attrs = st.get('attributes') if isinstance(st, dict) and 'attributes' in st else (st if isinstance(st, dict) else None)
                    staff_id = st.get('id') if isinstance(st, dict) else None
                    if not staff_id and isinstance(attrs, dict):
                        staff_id = attrs.get('id')
                    staff_name = None
                    if isinstance(attrs, dict):
                        staff_name = attrs.get('staff_name') or attrs.get('name')
                    elif isinstance(st, dict):
                        staff_name = st.get('staff_name') or st.get('name')
                    if isinstance(staff_id, str) and staff_id.isdigit():
                        staff_id = int(staff_id)
                    if staff_id:
                        staff_entries.append((staff_id, staff_name))
                # Limit staff list to reduce call volume, but include "all staff" fallback
                staff_entries = staff_entries[:6]
                staff_entries = [(None, 'Корт API')] + staff_entries
                logger.info(f"🏟️ [SELECT-MASTER] Staff candidates: {len(staff_entries)}")

                date_entries = []
                for dt in dates_api:
                    attrs = dt.get('attributes') if isinstance(dt, dict) and 'attributes' in dt else (dt if isinstance(dt, dict) else None)
                    date_val = attrs.get('date') if isinstance(attrs, dict) else None
                    is_bookable = attrs.get('is_bookable', True) if isinstance(attrs, dict) else True
                    if date_val and is_bookable:
                        try:
                            parsed_date = datetime.strptime(date_val, "%Y-%m-%d")
                            if parsed_date > datetime.now() + timedelta(days=120):
                                continue
                        except Exception:
                            pass
                        date_entries.append(date_val)
                # Deduplicate and use all unique dates
                seen_dates = set()
                uniq_dates = []
                for d in date_entries:
                    if d not in seen_dates:
                        uniq_dates.append(d)
                        seen_dates.add(d)
                date_entries = uniq_dates  # Use ALL unique dates (no cap)
                # Fallback: generate next 180 days (6 months) if nothing bookable
                # Will stop early when 90 consecutive days with no slots are found
                if not date_entries:
                    date_entries = [(datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 181)]
                logger.info(f"🏟️ [SELECT-MASTER] Date candidates (first 5 of {len(date_entries)}): {date_entries[:5]}")

                template_body = None
                template_headers = None
                for req in getattr(self, 'captured_api_requests', []):
                    if 'search-timeslots' in req.get('url', '') and isinstance(req.get('body_json'), dict):
                        template_body = req.get('body_json')
                        template_headers = req.get('headers')
                        break
                if template_body:
                    logger.info(f"🏟️ [SELECT-MASTER] Using captured timeslot payload keys: {list(template_body.keys())}")
                sanitized_timeslot_headers = {}
                referrer_header = None
                if template_headers:
                    referrer_header = template_headers.get('referer') or template_headers.get('referrer')
                    forbidden_headers = {
                        'content-length', 'content-encoding', 'accept-encoding',
                        'host', 'authority', 'connection', 'upgrade', 'origin',
                        'referer', 'user-agent', 'cookie', 'pragma', 'cache-control',
                        'te', 'trailer', 'transfer-encoding'
                    }
                    for h_key, h_val in template_headers.items():
                        if not h_val:
                            continue
                        key_lower = h_key.lower()
                        if h_key.startswith(':') or key_lower in forbidden_headers:
                            continue
                        sanitized_timeslot_headers[h_key] = h_val
                    if sanitized_timeslot_headers:
                        header_keys_preview = list(sanitized_timeslot_headers.keys())[:6]
                        logger.info(f"🏟️ [SELECT-MASTER] Captured timeslot headers ({len(sanitized_timeslot_headers)}): {header_keys_preview}")

                blocked_services = set()

                async def fetch_timeslots(service_id_val, staff_id_val, date_str_val, log_payload=False):
                    try:
                        nonlocal blocked_services
                        if service_id_val in blocked_services:
                            return []
                        payload_primary = {
                            "context": {"location_id": 1168982},
                            "filter": {
                                "date": date_str_val,
                                "records": [{
                                    "staff_id": staff_id_val,
                                    "attendance_service_items": [{"type": "service", "id": service_id_val}]
                                }]
                            }
                        }
                        if template_body:
                            try:
                                payload = json.loads(json.dumps(template_body))
                            except Exception:
                                payload = template_body.copy()
                            # Ensure core keys exist
                            if 'context' not in payload:
                                payload['context'] = {"location_id": 1168982}
                            if 'filter' not in payload or not isinstance(payload['filter'], dict):
                                payload['filter'] = {}
                            # Normalize date if template already had it; otherwise keep None to mimic captured call
                            if 'date' in payload['filter']:
                                payload['filter']['date'] = date_str_val
                            # Normalize records
                            records = payload['filter'].get('records')
                            if not isinstance(records, list) or len(records) == 0:
                                records = [{}]
                            record = records[0] if isinstance(records[0], dict) else {}
                            if staff_id_val is not None:
                                record['staff_id'] = staff_id_val
                            else:
                                record['staff_id'] = None
                            items = record.get('attendance_service_items')
                            if not isinstance(items, list) or len(items) == 0 or not isinstance(items[0], dict):
                                items = [{"type": "service", "id": service_id_val}]
                            else:
                                items[0]['id'] = service_id_val
                                if 'type' not in items[0]:
                                    items[0]['type'] = 'service'
                                if 'duration' in items[0] and items[0].get('duration'):
                                    try:
                                        items[0]['duration'] = 3600
                                    except Exception:
                                        pass
                            record['attendance_service_items'] = items
                            payload['filter']['records'] = [record]
                            payload_primary = payload
                        if log_payload:
                            logger.info(f"🏟️ [BRUTE] Payload -> svc={service_id_val}, staff={staff_id_val}, date={date_str_val}: {str(payload_primary)[:200]}")

                        async def send_payload(payload_obj):
                            content_type_header = None
                            accept_header = None
                            if sanitized_timeslot_headers:
                                content_type_header = sanitized_timeslot_headers.get('content-type') or sanitized_timeslot_headers.get('Content-Type')
                                accept_header = sanitized_timeslot_headers.get('accept') or sanitized_timeslot_headers.get('Accept')
                            headers = {
                                "Content-Type": content_type_header or "application/vnd.api+json",
                                "Accept": accept_header or "application/json"
                            }
                            if sanitized_timeslot_headers:
                                for h_key, h_val in sanitized_timeslot_headers.items():
                                    key_lower = h_key.lower()
                                    if key_lower in ['content-type', 'accept']:
                                        continue
                                    headers[h_key] = h_val
                            if log_payload:
                                auth_val = headers.get('authorization') or headers.get('Authorization') or ''
                                logger.info(f"🏟️ [BRUTE] Headers → ct={headers.get('Content-Type')}, accept={headers.get('Accept')}, auth_len={len(auth_val)}")
                            return await page.evaluate('''async ({payload, headers, referrer}) => {
                                try {
                                    const options = {
                                        method: "POST",
                                        headers: headers,
                                        body: JSON.stringify(payload),
                                        credentials: "include"
                                    };
                                    if (referrer) {
                                        options.referrer = referrer;
                                    }
                                    const resp = await fetch("https://platform.yclients.com/api/v1/b2c/booking/availability/search-timeslots", options);
                                    let data = null;
                                    try { data = await resp.json(); } catch (e) { data = null; }
                                    return { status: resp.status, data };
                                } catch (e) {
                                    return { status: 0, data: null };
                                }
                            }''', {"payload": payload_obj, "headers": headers, "referrer": referrer_header})

                        def extract_slots(resp_obj):
                            if not resp_obj or not isinstance(resp_obj, dict):
                                return []
                            data = resp_obj.get('data')
                            if not data:
                                return []
                            items = data['data'] if isinstance(data, dict) and 'data' in data else data
                            if not isinstance(items, list):
                                items = [items]
                            slots = []
                            for i in items:
                                if isinstance(i, dict):
                                    slots.append(i.get('attributes') or i)
                            return slots

                        resp_primary = await send_payload(payload_primary)
                        status_primary = resp_primary.get('status') if isinstance(resp_primary, dict) else None
                        slots_primary = extract_slots(resp_primary)

                        if log_payload:
                            logger.info(f"🏟️ [BRUTE] Primary status={status_primary if status_primary is not None else 'n/a'}, slots={len(slots_primary)}")

                        # Attempt a template-without-date copy to mimic original call if primary empty
                        if not slots_primary and template_body:
                            try:
                                payload_no_date = json.loads(json.dumps(template_body))
                            except Exception:
                                payload_no_date = template_body.copy()
                            if isinstance(payload_no_date, dict):
                                filt = payload_no_date.get('filter') if isinstance(payload_no_date.get('filter'), dict) else {}
                                if isinstance(filt, dict):
                                    if 'date' in filt:
                                        filt['date'] = None
                                    recs = filt.get('records')
                                    if isinstance(recs, list) and len(recs) > 0 and isinstance(recs[0], dict):
                                        if service_id_val:
                                            items = recs[0].get('attendance_service_items')
                                            if isinstance(items, list) and len(items) > 0 and isinstance(items[0], dict):
                                                items[0]['id'] = service_id_val
                                            recs[0]['attendance_service_items'] = items or [{"type": "service", "id": service_id_val}]
                                        if staff_id_val is not None:
                                            recs[0]['staff_id'] = staff_id_val
                                    payload_no_date['filter'] = filt
                                resp_no_date = await send_payload(payload_no_date)
                                slots_no_date = extract_slots(resp_no_date)
                                if slots_no_date:
                                    if log_payload:
                                        sample_times = [s.get('time') or s.get('datetime') for s in slots_no_date[:3]]
                                        logger.info(f"🏟️ [BRUTE] Template-no-date status={resp_no_date.get('status') if isinstance(resp_no_date, dict) else 'n/a'} slots {len(slots_no_date)} for svc={service_id_val}, staff={staff_id_val}")
                                    slots_primary = slots_no_date

                        if not slots_primary:
                            payload_fallback = {
                                "services": [service_id_val],
                                "staff_ids": [staff_id_val] if staff_id_val is not None else [],
                                "date": date_str_val,
                                "company_id": 1168982
                            }
                            resp_fallback = await send_payload(payload_fallback)
                            status_fallback = resp_fallback.get('status') if isinstance(resp_fallback, dict) else None
                            slots_fallback = extract_slots(resp_fallback)
                            if slots_fallback and log_payload:
                                sample_times = [s.get('time') or s.get('datetime') for s in slots_fallback[:3]]
                                logger.info(f"🏟️ [BRUTE] Fallback status={resp_fallback.get('status') if isinstance(resp_fallback, dict) else 'n/a'} slots {len(slots_fallback)} for svc={service_id_val}, staff={staff_id_val}, date={date_str_val}: {sample_times}")
                            if status_primary == 404 and (status_fallback == 404 or status_fallback is None):
                                blocked_services.add(service_id_val)
                            return slots_fallback or []

                        if slots_primary and log_payload:
                            sample_times = [s.get('time') or s.get('datetime') for s in slots_primary[:3]]
                            logger.info(f"🏟️ [BRUTE] Got {len(slots_primary)} slots for svc={service_id_val}, staff={staff_id_val}, date={date_str_val}: {sample_times}")
                        elif slots_primary:
                            sample_times = [s.get('time') or s.get('datetime') for s in slots_primary[:2]]
                            logger.info(f"🏟️ [BRUTE] Slots {len(slots_primary)} for svc={service_id_val}, staff={staff_id_val}, date={date_str_val}: {sample_times}")
                        return slots_primary or []
                    except Exception:
                        return []

                max_brute_slots = 1000  # 16 dates × 8 slots × 3 durations = ~384 base + buffer
                total_brute_slots = 0
                consecutive_empty_dates = 0  # Track consecutive dates with no slots (across ALL services/staff)

                if service_ids and date_entries:
                    logger.info(f"🏟️ [SELECT-MASTER] Brute-forcing timeslots via API for {len(date_entries)} dates x {len(service_ids)} services x {len(staff_entries)} staff (will stop after 90 empty days)")
                    should_break = False
                    # IMPORTANT: Iterate by DATE first to correctly track consecutive empty days
                    for date_str in date_entries:
                        if should_break:
                            break
                        slots_found_for_date = False  # Track if this date had ANY slots (from any service/staff)
                        for service_id_val in service_ids:
                            if should_break:
                                break
                            for staff_id_val, staff_name_val in staff_entries:
                                should_log = (date_str == date_entries[0] and service_id_val == service_ids[0] and staff_id_val == staff_entries[0][0])
                                slots = await fetch_timeslots(service_id_val, staff_id_val, date_str, log_payload=should_log)
                                if slots:
                                    slots_found_for_date = True  # Mark that this DATE has slots
                                    times = []
                                    price_by_time = {}
                                    for slot in slots:
                                        t = slot.get('time') or slot.get('datetime')
                                        if t:
                                            time_part = t.split('T')[1][:5] if 'T' in t else t
                                            times.append(time_part)
                                            slot_price = slot.get('price') or slot.get('price_min') or slot.get('price_max')
                                            if slot_price is not None and time_part not in price_by_time:
                                                price_by_time[time_part] = slot_price
                                    if times:
                                        all_courts.append({
                                            'provider': staff_name_val or (f'Корт API-{staff_id_val}' if staff_id_val else 'Корт API'),
                                            'price': next(iter(price_by_time.values())) if price_by_time else None,
                                            'price_by_time': price_by_time,
                                            'times': times,
                                            'dateHint': date_str
                                        })
                                        total_brute_slots += len(times)
                                        if total_brute_slots >= max_brute_slots:
                                            logger.info(f"🏟️ [SELECT-MASTER] Brute-force cap reached ({total_brute_slots} slots), stopping early")
                                            should_break = True
                                            break
                        # Track consecutive empty dates AFTER checking ALL services/staff for this date
                        if not slots_found_for_date:
                            consecutive_empty_dates += 1
                            if consecutive_empty_dates % 10 == 0 or consecutive_empty_dates >= 85:  # Log every 10 days or near threshold
                                logger.info(f"🏟️ [SELECT-MASTER] No slots on {date_str} ({consecutive_empty_dates}/90 consecutive empty days)")
                        else:
                            consecutive_empty_dates = 0  # Reset counter when ANY slot found for this date
                        # Stop if 90 consecutive days with no slots from ANY source
                        if consecutive_empty_dates >= 90:
                            logger.info(f"🏟️ [SELECT-MASTER] 90 consecutive days with no slots found (across all services/staff), stopping")
                            should_break = True
            except Exception as e:
                logger.warning(f"🏟️ [SELECT-MASTER] Brute-force timeslot fetch failed: {e}")

            logger.info(f"🏟️ [SELECT-MASTER] Found {len(all_courts)} courts across dates")

            # Convert to booking records
            from datetime import datetime, timedelta

            seen_slots = set()
            for court in all_courts:
                provider = court.get('provider', 'Unknown')
                price = court.get('price') or 'Цена не найдена'
                price_by_time = court.get('price_by_time') if isinstance(court.get('price_by_time'), dict) else {}
                times = court.get('times', [])
                date_hint = court.get('dateHint', 'завтра')

                venue_id = extract_venue_id(page.url)
                self.current_venue_id = venue_id
                logger.info(
                    f"🔍 [PRICE-DEBUG] venue_id={venue_id}, catalog_present={bool(self.service_catalog)}, "
                    f"court_price={court.get('price')}, time_example={times[0] if times else None}, "
                    f"api_price_example={next(iter(price_by_time.items())) if price_by_time else None}"
                )

                # Parse date from hint
                today = datetime.now()
                if 'завтра' in date_hint.lower():
                    booking_date = (today + timedelta(days=1)).strftime('%Y-%m-%d')
                elif 'сегодня' in date_hint.lower():
                    booking_date = today.strftime('%Y-%m-%d')
                elif re.match(r'^\\d{4}-\\d{2}-\\d{2}$', date_hint):
                    booking_date = date_hint
                else:
                    # Try to parse "пт, 19 дек" format
                    booking_date = (today + timedelta(days=2)).strftime('%Y-%m-%d')  # Default fallback

                for time_slot in times:
                    # Normalize time format
                    time_parts = time_slot.split(':')
                    normalized_time = f"{time_parts[0].zfill(2)}:{time_parts[1]}:00"
                    fallback_price_for_slot = price_by_time.get(time_slot) or price

                    # Determine price per slot using universal pricing (explicit config → auto-detect → API)
                    # Note: service_name not available in this code path (would need API to include it)
                    logger.info(f"🔍 [DEBUG] Universal pricing: venue={venue_id}, time_slot={time_slot}")
                    slot_price = get_universal_price(
                        venue_id=venue_id,
                        time_str=time_slot,
                        catalog=self.service_catalog,
                        fallback_price=fallback_price_for_slot,
                        auto_detected_rules=self.auto_detected_rules,
                        service_name=None  # Not available in this context
                    )
                    logger.info(f"🔍 [DEBUG] Using price: {slot_price}")

                    # Determine tariff name for richer service label
                    tariff_name = get_tariff_name_for_time(venue_id, time_slot)

                    # Generate records for each duration
                    for duration_mins in [60, 90, 120]:
                        # Get duration-specific price from catalog if available
                        if self.service_catalog and tariff_name:
                            catalog_tariff = self.service_catalog.get(tariff_name, {})
                            if duration_mins not in catalog_tariff:
                                continue  # Skip if this duration not available
                            duration_price = catalog_tariff[duration_mins]
                        else:
                            # No catalog, only create 60-min record
                            if duration_mins != 60:
                                continue
                            duration_price = slot_price

                        # Duration-aware service name
                        duration_display = f'{duration_mins} мин' if duration_mins != 60 else '1 час'
                        service_name = f'Падел-корт, {duration_display} - тариф «{tariff_name}»' if tariff_name else f'Падел-корт, {duration_display}'

                        record = {
                            'url': page.url,
                            'date': booking_date,
                            'time': normalized_time,
                            'price': duration_price,
                            'provider': provider,
                            'service_name': service_name,
                            'duration': duration_mins,
                            'available': True,
                            'extracted_at': datetime.now().isoformat()
                        }

                        # Include duration in dedup key
                        dedup_key = (booking_date, normalized_time, provider, duration_mins)
                        if dedup_key in seen_slots:
                            logger.info(f"⚠️ [SELECT-MASTER] Skipping duplicate slot {dedup_key}")
                            continue
                        seen_slots.add(dedup_key)
                        results.append(record)
                    logger.info(f"✅ [SELECT-MASTER] Record: {provider} @ {booking_date} {normalized_time} - {slot_price}")

            logger.info(f"🏟️ [SELECT-MASTER] Extracted {len(results)} booking records")
            return results

        except Exception as e:
            logger.error(f"🏟️ [SELECT-MASTER] Scraping failed: {e}")
            return results

    async def extract_via_api_interception(self, page: Page, url: str) -> List[Dict]:
        """
        Extract booking data by capturing API responses instead of DOM scraping.
        This works for SPA (Single Page Applications) like YClients that load data via JavaScript.

        Args:
            page: Playwright page object
            url: URL to navigate and extract from

        Returns:
            List of extracted booking records
        """
        logger.info("🌐 [API-MODE] Starting API-based extraction")

        try:
            # Use data that was ALREADY captured during page load by the main listener
            # Page is already loaded, wait for any pending API calls to complete
            await page.wait_for_timeout(2000)
            await page.wait_for_load_state('networkidle', timeout=10000)

            # Check if we already have captured data from navigation
            initial_count = len(self.captured_api_data)
            logger.info(f"🌐 [API-MODE] Already captured {initial_count} API responses during page load")

            # Try to interact with page to trigger MORE API calls (if needed)
            # Click any visible date elements to load time slots
            try:
                dates = await page.locator('.calendar-day:not(.disabled)').all()
                if dates and len(dates) > 0:
                    logger.info(f"🌐 [API-MODE] Found {len(dates)} dates, clicking first to trigger more APIs")
                    await dates[0].click(force=True)
                    await page.wait_for_timeout(2000)
                    await page.wait_for_load_state('networkidle')
            except:
                pass

            # Try clicking service items if on menu page
            try:
                services = await page.locator('[class*="service"], [class*="item"]').all()
                if services and len(services) > 0:
                    logger.info(f"🌐 [API-MODE] Found {len(services)} services, clicking first to trigger more APIs")
                    await services[0].click(force=True)
                    await page.wait_for_timeout(2000)
                    await page.wait_for_load_state('networkidle')
            except:
                pass

            # Check how many responses we have now (including new ones from clicks)
            total_captured = len(self.captured_api_data)
            logger.info(f"🌐 [API-MODE] Total captured API responses: {total_captured} ({total_captured - initial_count} new from interactions)")

            # Process ALL captured API data
            if self.captured_api_data:
                dom_enrichment = {}
                try:
                    dom_enrichment = await self.enrich_captured_data_with_dom(page, url, self.captured_api_data)
                except Exception as e:
                    logger.warning(f"🌐 [API-MODE] DOM enrichment skipped: {e}")

                return self.parse_api_responses(self.captured_api_data, dom_enrichment)
            else:
                logger.warning("🌐 [API-MODE] No API data captured")
                return []

        except Exception as e:
            logger.error(f"🌐 [API-MODE] Error: {str(e)}")
            return []

    def parse_api_responses(self, captured_data: List[Dict], dom_enrichment: Optional[Dict] = None) -> List[Dict]:
        """
        Parse captured API responses into booking records.
        This method tries different response structures based on common API patterns.

        Args:
            captured_data: List of captured API responses with metadata
            dom_enrichment: Optional mapping of slot tokens to providers/prices collected via DOM

        Returns:
            List of parsed booking records
        """
        logger.info(f"🌐 [API-PARSE] Processing {len(captured_data)} API responses")

        results = []
        dom_enrichment = dom_enrichment or {}
        token_provider_map = dom_enrichment.get('providers', {})
        token_price_map = dom_enrichment.get('prices', {})

        # PHASE 1: Separate data by API type for correlation
        services_data = []  # From search-services (has prices, service names)
        staff_data = []     # From search-staff (has provider/court names)
        timeslots_data = [] # From search-timeslots (has dates/times)
        dates_data = []     # From search-dates (has available dates)

        logger.info(f"🔗 [CORRELATION] Step 1: Separating {len(captured_data)} APIs by type")

        # Log all captured API URLs for debugging
        for item in captured_data:
            api_url = item['api_url']
            logger.info(f"🔗 [CORRELATION] Captured API: {api_url}")

        for item in captured_data:
            api_url = item['api_url']
            data = item['data']

            try:
                # Extract items from JSON API format
                items = []
                if isinstance(data, dict) and 'data' in data:
                    items = data['data'] if isinstance(data['data'], list) else [data['data']]
                elif isinstance(data, list):
                    items = data

                # Categorize by API type
                if 'search-services' in api_url:
                    for service in items:
                        if isinstance(service, dict) and 'attributes' in service:
                            services_data.append(service['attributes'])
                        elif isinstance(service, dict):
                            services_data.append(service)
                    logger.info(f"🔗 [CORRELATION] Found {len(items)} services from {api_url}")

                elif 'search-staff' in api_url:
                    for staff in items:
                        if isinstance(staff, dict) and 'attributes' in staff:
                            staff_data.append(staff['attributes'])
                        elif isinstance(staff, dict):
                            staff_data.append(staff)
                    logger.info(f"🔗 [CORRELATION] Found {len(items)} staff from {api_url}")

                elif 'search-timeslots' in api_url:
                    for slot in items:
                        slot_attrs = None
                        if isinstance(slot, dict) and 'attributes' in slot:
                            slot_attrs = slot['attributes']
                        elif isinstance(slot, dict):
                            slot_attrs = slot

                        if isinstance(slot_attrs, dict):
                            token = self.build_slot_token(slot_attrs)
                            if token:
                                slot_attrs['_slot_token'] = token
                        if slot_attrs:
                            timeslots_data.append(slot_attrs)
                    logger.info(f"🔗 [CORRELATION] Found {len(items)} timeslots from {api_url}")

                elif 'search-dates' in api_url:
                    for date in items:
                        if isinstance(date, dict) and 'attributes' in date:
                            dates_data.append(date['attributes'])
                        elif isinstance(date, dict):
                            dates_data.append(date)
                    logger.info(f"🔗 [CORRELATION] Found {len(items)} dates from {api_url}")

            except Exception as e:
                logger.warning(f"🔗 [CORRELATION] Failed to categorize {api_url}: {e}")

        # PHASE 2: Correlate data from different APIs
        logger.info(f"🔗 [CORRELATION] Step 2: Merging data - Services:{len(services_data)}, Staff:{len(staff_data)}, Slots:{len(timeslots_data)}")

        # Strategy: Apply service/staff data to all timeslots from same page load
        # Assumption: 1 service + N timeslots = service applies to all slots
        base_service = services_data[0] if services_data else {}
        base_staff = staff_data[0] if staff_data else {}

        if base_service:
            logger.info(f"🔗 [CORRELATION] Base service: {base_service.get('service_name', 'N/A')}, price: {base_service.get('price_min', 'N/A')}")
        if base_staff:
            logger.info(f"🔗 [CORRELATION] Base staff: {base_staff.get('staff_name', 'N/A')}")

        # Deduplication: Track seen records by (date, time, provider) composite key
        seen_records = set()

        # Merge timeslots with service/staff data + HTML-scraped providers
        for slot_data in timeslots_data:
            merged = {
                **slot_data,      # datetime, time, is_bookable
                **base_service,   # price_min, price_max, service_name, duration
                **base_staff      # staff_name
            }

            slot_token = slot_data.get('_slot_token')
            if slot_token:
                if slot_token in token_provider_map:
                    merged['provider'] = token_provider_map[slot_token]
                    logger.info(f"🏷️  [CORRELATION] Provider from DOM map for token {slot_token}: {merged['provider']}")
                if slot_token in token_price_map:
                    merged['price'] = token_price_map[slot_token]
                    logger.info(f"💰 [CORRELATION] Price from DOM map for token {slot_token}: {merged['price']}")

            # ========== PHASE 2.5: MERGE HTML-SCRAPED PROVIDERS FOR 100% VALUE ==========
            # APIs don't have service_name, so use HTML-scraped data!
            service_id = merged.get('id') or base_service.get('id')
            provider_name = None

            if service_id and self.scraped_providers:
                # Try to match by ID
                for provider in self.scraped_providers:
                    if provider.get('id') == str(service_id):
                        provider_name = provider.get('name')
                        logger.info(f"🏷️  [CORRELATION] Matched provider by ID: {provider_name}")
                        break

            # Fallback: If no ID match, use first scraped provider (better than nothing)
            if not provider_name and self.scraped_providers:
                provider_name = self.scraped_providers[0].get('name')
                logger.info(f"🏷️  [CORRELATION] Using first scraped provider (no ID match): {provider_name}")

            # Add provider to merged data
            if provider_name:
                merged['provider'] = provider_name
            # ========== END HTML-SCRAPED PROVIDERS MERGE ==========

            logger.info(f"🔗 [CORRELATION] Merged slot: time={merged.get('time')}, price={merged.get('price_min')}, provider={merged.get('provider', 'N/A')}")
            result = self.parse_booking_from_api(merged, 'correlated-api')
            if result:
                # Deduplication check using (date, time, provider) composite key
                dedup_key = (result.get('date'), result.get('time'), result.get('provider'))

                # Only add if unique AND has date+time (provider can be None/fallback)
                if dedup_key not in seen_records and result.get('date') and result.get('time'):
                    results.append(result)
                    seen_records.add(dedup_key)
                    logger.info(f"✅ [DEDUP] Added unique record: date={dedup_key[0]}, time={dedup_key[1]}, provider={dedup_key[2]}")
                else:
                    if dedup_key in seen_records:
                        logger.warning(f"⚠️ [DEDUP] Skipped duplicate: {dedup_key}")
                    else:
                        logger.warning(f"⚠️ [DEDUP] Skipped incomplete record (missing key fields): {dedup_key}")

        # If we have results from correlation, return them
        if results:
            logger.info(f"🔗 [CORRELATION] Successfully correlated {len(results)} records")
            return results

        # PHASE 3: Fallback to old logic if correlation produced no results
        logger.info(f"🔗 [CORRELATION] No correlated results, falling back to direct parsing")

        for item in captured_data:
            api_url = item['api_url']
            data = item['data']

            logger.info(f"🌐 [API-PARSE] Processing response from: {api_url}")

            try:
                # Try different response structures
                # Structure 1: YClients JSON API format {data: [{type, id, attributes: {...}}]}
                if isinstance(data, dict) and 'data' in data:
                    items = data['data']
                    if isinstance(items, list):
                        logger.info(f"🔍 [API-PARSE] Found {len(items)} items in data array for {api_url}")
                        for idx, booking in enumerate(items):
                            # Check if this is JSON API format with attributes
                            if isinstance(booking, dict) and 'attributes' in booking:
                                # Extract the actual data from attributes
                                booking_data = booking['attributes']
                                # Also include type and id for context
                                booking_data['_type'] = booking.get('type')
                                booking_data['_id'] = booking.get('id')
                                logger.info(f"🔍 [API-PARSE] Item {idx+1}: type={booking.get('type')}, attributes keys={list(booking_data.keys())}")
                                result = self.parse_booking_from_api(booking_data, api_url)
                            else:
                                # Standard format
                                logger.info(f"🔍 [API-PARSE] Item {idx+1}: standard format, keys={list(booking.keys()) if isinstance(booking, dict) else 'not dict'}")
                                result = self.parse_booking_from_api(booking, api_url)
                            if result:
                                results.append(result)
                                logger.info(f"✅ [API-PARSE] Successfully added item {idx+1}")
                            else:
                                logger.warning(f"⚠️ [API-PARSE] Item {idx+1} returned None (filtered out)")

                # Structure 2: {result: {slots: [...]}}
                elif isinstance(data, dict) and 'result' in data:
                    result_data = data['result']
                    if isinstance(result_data, dict) and 'slots' in result_data:
                        for booking in result_data['slots']:
                            result = self.parse_booking_from_api(booking, api_url)
                            if result:
                                results.append(result)
                    elif isinstance(result_data, list):
                        for booking in result_data:
                            result = self.parse_booking_from_api(booking, api_url)
                            if result:
                                results.append(result)

                # Structure 3: [{time, price, available}] - direct array
                elif isinstance(data, list):
                    for booking in data:
                        result = self.parse_booking_from_api(booking, api_url)
                        if result:
                            results.append(result)

                # Structure 4: Direct object
                elif isinstance(data, dict):
                    result = self.parse_booking_from_api(data, api_url)
                    if result:
                        results.append(result)

            except Exception as e:
                logger.warning(f"🌐 [API-PARSE] Failed to parse response structure: {e}")

        logger.info(f"🌐 [API-PARSE] Extracted {len(results)} booking records from API")
        return results


    def build_slot_token(self, slot_data: Dict[str, Any]) -> Optional[str]:
        """
        Build YClients 'o' token (dYYDDMMHHMM) from slot date/time.
        Example: 2025-12-17 07:00 -> d2517120700
        """
        try:
            dt_obj = None
            datetime_str = slot_data.get('datetime')
            if datetime_str:
                try:
                    dt_obj = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                except Exception:
                    pass

            if not dt_obj:
                date_str = slot_data.get('date') or slot_data.get('booking_date')
                time_str = slot_data.get('time') or slot_data.get('slot_time')
                if date_str and time_str:
                    cleaned_time = time_str.strip()
                    if ':' not in cleaned_time and len(cleaned_time) in (3, 4):
                        cleaned_time = cleaned_time.zfill(4)
                        cleaned_time = f"{cleaned_time[:2]}:{cleaned_time[2:]}"
                    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
                        try:
                            dt_obj = datetime.strptime(f"{date_str} {cleaned_time}", fmt)
                            break
                        except Exception:
                            continue

            if not dt_obj:
                return None

            token = f"d{dt_obj.year % 100:02d}{dt_obj.day:02d}{dt_obj.month:02d}{dt_obj.hour:02d}{dt_obj.minute:02d}"
            return token
        except Exception as e:
            logger.debug(f"Failed to build slot token from {slot_data}: {e}")
            return None

    def build_step_url(self, base_url: str, step: str, token: str) -> str:
        """Construct step URL (select-master/select-services) with the given token."""
        try:
            clean_url = base_url.split('?')[0]
            if '/personal/' in clean_url:
                prefix, _ = clean_url.split('/personal/', 1)
                return f"{prefix}/personal/{step}?o={token}"
            return f"{clean_url}?o={token}"
        except Exception:
            return f"{base_url}?o={token}"

    async def enrich_captured_data_with_dom(self, page: Page, base_url: str, captured_data: List[Dict]) -> Dict[str, Dict[str, str]]:
        """
        Use captured timeslot tokens to load select-master/select-services pages
        and scrape provider names and prices. This fills gaps for venues where
        APIs omit provider.
        """
        enrichment: Dict[str, Dict[str, str]] = {"providers": {}, "prices": {}}
        tokens = []

        try:
            for item in captured_data:
                api_url = item.get('api_url', '')
                data = item.get('data')
                if 'search-timeslots' not in api_url:
                    continue

                items = []
                if isinstance(data, dict) and 'data' in data:
                    items = data['data'] if isinstance(data['data'], list) else [data['data']]
                elif isinstance(data, list):
                    items = data
                elif isinstance(data, dict):
                    items = [data]

                for slot in items:
                    slot_attrs = slot.get('attributes') if isinstance(slot, dict) and 'attributes' in slot else slot
                    if isinstance(slot_attrs, dict):
                        token = self.build_slot_token(slot_attrs)
                        if token:
                            tokens.append(token)

            unique_tokens = list(dict.fromkeys(tokens))[:5]
            logger.info(f"🌐 [DOM-ENRICH] Tokens to enrich: {unique_tokens}")

            for token in unique_tokens:
                try:
                    provider, price = await self.fetch_provider_and_price_for_token(page, base_url, token)
                    if provider:
                        enrichment["providers"][token] = provider
                    if price:
                        enrichment["prices"][token] = price
                except Exception as e:
                    logger.debug(f"🌐 [DOM-ENRICH] Token {token} failed: {e}")

        except Exception as e:
            logger.warning(f"🌐 [DOM-ENRICH] Failed to build enrichment: {e}")

        return enrichment

    async def fetch_provider_and_price_for_token(self, page: Page, base_url: str, token: str) -> Tuple[Optional[str], Optional[str]]:
        """Load select-master/select-services for a token and scrape provider/price."""
        provider = None
        price = None

        try:
            master_url = self.build_step_url(base_url, "select-master", token)
            logger.info(f"🌐 [DOM-ENRICH] Loading master page for token {token}: {master_url}")
            await page.goto(master_url, wait_until="networkidle", timeout=PAGE_LOAD_TIMEOUT)
            await page.wait_for_timeout(500)
            provider = await self.extract_provider_from_master_page(page)
        except Exception as e:
            logger.debug(f"🌐 [DOM-ENRICH] Master page load failed for {token}: {e}")

        try:
            services_url = self.build_step_url(base_url, "select-services", token)
            logger.info(f"🌐 [DOM-ENRICH] Loading services page for token {token}: {services_url}")
            await page.goto(services_url, wait_until="networkidle", timeout=PAGE_LOAD_TIMEOUT)
            await page.wait_for_timeout(500)

            provider_from_services = await self.extract_provider_from_services_page(page)
            if provider_from_services and not provider:
                provider = provider_from_services

            price = await self.extract_price_from_services_page(page)
        except Exception as e:
            logger.debug(f"🌐 [DOM-ENRICH] Services page load failed for {token}: {e}")

        return provider, price

    async def extract_provider_from_master_page(self, page: Page) -> Optional[str]:
        """Scrape provider/court name from select-master page."""
        selectors = [
            "ui-kit-simple-cell .title-block__title",
            ".title-block__title",
            "p.category-title",
            ".category-title",
            "ui-kit-simple-cell"
        ]
        for selector in selectors:
            try:
                el = await page.query_selector(selector)
                if el:
                    text = await el.text_content()
                    if text and text.strip():
                        return text.strip()
            except Exception:
                continue
        return None

    async def extract_provider_from_services_page(self, page: Page) -> Optional[str]:
        """Scrape provider/court name from select-services page (category titles)."""
        selectors = [
            "p.category-title",
            ".category-title",
            ".title-block__title"
        ]
        for selector in selectors:
            try:
                el = await page.query_selector(selector)
                if el:
                    text = await el.text_content()
                    if text and text.strip():
                        return text.strip()
            except Exception:
                continue
        return None

    async def extract_price_from_services_page(self, page: Page) -> Optional[str]:
        """Scrape first price from select-services page using known selectors."""
        service_item_selector = YCLIENTS_REAL_SELECTORS["service_page"]["service_items"]
        price_selectors = YCLIENTS_REAL_SELECTORS["time_slots"]["price_elements"]

        try:
            cards = await page.query_selector_all(service_item_selector)
        except Exception:
            cards = []

        for card in cards:
            for selector in price_selectors:
                try:
                    price_el = await card.query_selector(selector)
                    if price_el:
                        price_text = await price_el.text_content()
                        if price_text and price_text.strip():
                            return price_text.strip()
                except Exception:
                    continue

        try:
            fallback = page.get_by_text(re.compile(r"\d+[\s ]*\d*\s*₽"))
            if await fallback.count() > 0:
                text = await fallback.nth(0).text_content()
                if text and text.strip():
                    return text.strip()
        except Exception:
            pass

        return None

    def parse_booking_from_api(self, booking_obj: Dict, api_url: str) -> Optional[Dict]:
        """
        Parse individual booking object from API response.
        Tries common field names used in booking APIs.

        Args:
            booking_obj: Dictionary containing booking data
            api_url: Source API URL for reference

        Returns:
            Parsed booking dict or None if insufficient data
        """
        try:
            # YClients предоставляет поле 'time' напрямую - ИСПОЛЬЗУЕМ ЕГО!
            # Ответ API: {'datetime': '2025-10-02T08:00:00+03:00', 'time': '8:00', 'is_bookable': True}

            # Получаем time напрямую из YClients (наиболее надежный способ)
            result_time = booking_obj.get('time')
            result_date = None

            # Получаем дату из поля datetime
            datetime_str = booking_obj.get('datetime', '')
            if datetime_str and 'T' in datetime_str:
                try:
                    result_date = datetime_str.split('T')[0]  # "2025-10-02"
                    # Если time не предоставлен напрямую, парсим из datetime
                    if not result_time:
                        time_part = datetime_str.split('T')[1] if len(datetime_str.split('T')) > 1 else ''
                        result_time = time_part.split('+')[0].split('-')[0][:5]  # "08:00"
                    logger.info(f"[PARSE-DEBUG] datetime={datetime_str} -> date={result_date}, time={result_time}")
                except Exception as e:
                    logger.error(f"[PARSE-DEBUG] Failed to parse datetime '{datetime_str}': {e}")

            # Резервные варианты для отсутствующих полей
            if not result_date:
                result_date = booking_obj.get('date') or booking_obj.get('booking_date')
            if not result_time:
                result_time = booking_obj.get('slot_time') or booking_obj.get('start_time')

            logger.info(f"[DIRECT-USE] Final values: date={result_date}, time={result_time}")

            result = {
                'url': api_url,
                'date': result_date,
                'time': result_time,
                'price': self._get_price_with_catalog_lookup(
                    result_time,
                    booking_obj.get('price') or
                    booking_obj.get('cost') or
                    booking_obj.get('amount') or
                    booking_obj.get('price_min') or
                    booking_obj.get('price_max'),
                    url=api_url
                ),
                'provider': (booking_obj.get('provider') or
                            booking_obj.get('master') or
                            booking_obj.get('staff') or
                            booking_obj.get('staff_name') or
                            booking_obj.get('service_name')),
                'duration': booking_obj.get('duration', 60),
                'available': booking_obj.get('available') or booking_obj.get('is_bookable', True),
                'service_name': (booking_obj.get('service_name') or
                                booking_obj.get('service') or
                                booking_obj.get('title')),
                'booking_type': booking_obj.get('_type'),  # From JSON API format
                'extracted_at': datetime.now().isoformat()
            }

            # DEBUG: Log what we actually parsed
            logger.info(f"🔍 [DEBUG] Parsed result: date={result.get('date')}, time={result.get('time')}, datetime_str={datetime_str[:30] if datetime_str else 'None'}")

            # Only return if we have required fields (BOTH date AND time)
            if result['date'] and result['time']:
                logger.info(f"✅ [API-PARSE] Parsed booking: date={result['date']}, time={result['time']}, price={result['price']}, type={result.get('booking_type')}")
                return result
            else:
                logger.warning(f"⚠️ [API-PARSE] Skipping object without date/time: {str(booking_obj)[:150]}")

        except Exception as e:
            logger.warning(f"❌ [API-PARSE] Failed to parse booking object: {e} | Data: {str(booking_obj)[:150]}")

        return None

    def _get_price_with_catalog_lookup(self, time_str: str, fallback_price, url: Optional[str] = None) -> str:
        """Prefer catalog pricing when available; fallback to API/DOM values."""
        if time_str:
            venue_id = extract_venue_id(url) if url else self.current_venue_id
            catalog_price = self.get_venue_price_for_time(
                time_str,
                catalog=self.service_catalog,
                fallback_price=fallback_price,
                venue_id=venue_id
            )
            if catalog_price and catalog_price != "Цена не найдена":
                logger.info(f"💰 [CATALOG] Using catalog price for {time_str}: {catalog_price}")
                return catalog_price
        return fallback_price

    async def detect_and_handle_page_type(self, page: Page, original_url: str, current_url: str) -> List[Dict]:
        """
        Smart detection of YClients page type and routing to appropriate handler.

        Handles:
        - City/branch selection pages (redirected multi-location venues)
        - Menu pages (/personal/menu)
        - Time selection pages (/personal/select-time - mid-flow)
        - Standard record-type flow
        """
        try:
            page_title = await page.title()
            logger.info(f"🔍 [DETECTION] Page title: {page_title}")

            # Check for city/branch selection redirect
            if '/select-city' in current_url or '/select-branch' in current_url:
                logger.warning(f"⚠️ [DETECTION] Redirected to city/branch selection page")
                return await self.handle_multi_location_redirect(page, original_url)

            # Check if on menu page
            elif '/personal/menu' in current_url:
                logger.info(f"✅ [DETECTION] Menu page detected")
                return await self.handle_menu_page(page, current_url)

            # Check if already at time selection (mid-flow URL)
            elif '/personal/select-time' in current_url:
                logger.info(f"✅ [DETECTION] Time selection page (mid-flow entry)")
                return await self.handle_time_selection_page(page, current_url)

            # Standard flow (record-type or similar)
            else:
                logger.info(f"✅ [DETECTION] Standard booking flow page")
                return await self.navigate_yclients_flow(page, original_url)

        except Exception as e:
            logger.error(f"❌ [DETECTION] Error in page type detection: {str(e)}")
            # Fallback to standard flow
            return await self.navigate_yclients_flow(page, original_url)

    async def handle_multi_location_redirect(self, page: Page, original_url: str) -> List[Dict]:
        """
        Handle pages that redirect to city/branch selection.
        Try to select first available location and continue.
        """
        logger.info("🏢 [MULTI-LOC] Attempting to handle multi-location redirect")

        try:
            # Wait for page to fully load
            await page.wait_for_timeout(3000)

            # CRITICAL FIX: Use div with hasText filter to find location cards
            # Based on Playwright exploration findings - branch selection uses nested divs
            try:
                # Look for location names in the page
                location_patterns = [
                    'Lunda Padel',
                    'Padel',
                    'филиал',  # Branch in Russian
                ]

                for pattern in location_patterns:
                    try:
                        # Find clickable divs containing location names
                        locations = await page.locator(f'div[cursor="pointer"]:has-text("{pattern}")').all()

                        # Alternative: Find any clickable generic elements with location text
                        if not locations:
                            locations = await page.locator(f'generic[cursor="pointer"]:has-text("{pattern}")').all()

                        # Fallback: Use JavaScript to find clickable elements with text content
                        if not locations:
                            locations = await page.evaluate(f'''() => {{
                                const pattern = "{pattern}";
                                const clickable = [];
                                const allDivs = document.querySelectorAll('div, generic');

                                allDivs.forEach(div => {{
                                    const style = window.getComputedStyle(div);
                                    const text = div.textContent || '';

                                    if (text.includes(pattern) &&
                                        style.cursor === 'pointer' &&
                                        div.offsetHeight > 0) {{
                                        clickable.push(div);
                                    }}
                                }});

                                return clickable;
                            }}''')

                            if locations and len(locations) > 0:
                                logger.info(f"🏢 [MULTI-LOC] Found {len(locations)} clickable locations via JS with pattern '{pattern}'")
                                # Click first one using JavaScript
                                await page.evaluate('(el) => el.click()', locations[0])
                                await page.wait_for_load_state('networkidle', timeout=10000)

                                new_url = page.url
                                logger.info(f"🏢 [MULTI-LOC] After JS click, new URL: {new_url}")
                                return await self.detect_and_handle_page_type(page, original_url, new_url)

                        if locations and len(locations) > 0:
                            logger.info(f"🏢 [MULTI-LOC] Found {len(locations)} clickable locations with pattern '{pattern}'")

                            # Click first available location
                            first_location = locations[0]
                            location_text = await first_location.text_content()
                            logger.info(f"🏢 [MULTI-LOC] Clicking first location: {location_text[:100]}")

                            await first_location.click(force=True, timeout=5000)
                            await page.wait_for_load_state('networkidle', timeout=10000)

                            new_url = page.url
                            logger.info(f"🏢 [MULTI-LOC] After click, new URL: {new_url}")
                            return await self.detect_and_handle_page_type(page, original_url, new_url)

                    except Exception as e:
                        logger.debug(f"🏢 [MULTI-LOC] Pattern '{pattern}' search failed: {e}")
                        continue

            except Exception as e:
                logger.warning(f"🏢 [MULTI-LOC] Advanced location search failed: {e}")

            # Fallback to old selectors
            branch_selectors = [
                'div[cursor="pointer"]',    # Generic clickable divs
                'ui-kit-simple-cell',       # YClients UI cells
                'a[href*="/company/"]',     # Links to specific company pages
                'a[href*="record-type"]',   # Direct booking links
            ]

            for selector in branch_selectors:
                try:
                    elements = await page.locator(selector).all()
                    if elements and len(elements) > 0:
                        logger.info(f"🏢 [MULTI-LOC] Found {len(elements)} elements with selector: {selector}")

                        # Click first location (use force for Angular components)
                        first_element = elements[0]
                        element_text = await first_element.text_content()
                        logger.info(f"🏢 [MULTI-LOC] Clicking first location: {element_text[:50]}")

                        await first_element.click(force=True, timeout=5000)
                        await page.wait_for_load_state('networkidle', timeout=10000)

                        # Now recursively detect the new page type
                        new_url = page.url
                        logger.info(f"🏢 [MULTI-LOC] After click, new URL: {new_url}")
                        return await self.detect_and_handle_page_type(page, original_url, new_url)

                except Exception as e:
                    logger.debug(f"🏢 [MULTI-LOC] Selector {selector} failed: {e}")
                    continue

            # If no location links found, cannot proceed
            logger.warning(f"⚠️ [MULTI-LOC] No location links found, cannot select branch")
            logger.info(f"🏢 [MULTI-LOC] Page HTML snippet: {(await page.content())[:500]}")
            return []

        except Exception as e:
            logger.error(f"❌ [MULTI-LOC] Error handling multi-location: {str(e)}")
            return []

    async def handle_menu_page(self, page: Page, url: str) -> List[Dict]:
        """
        Handle /personal/menu pages where services are listed but as menu items.
        Extract available services and navigate to each.
        """
        logger.info("📋 [MENU] Extracting services from menu page")

        results = []
        try:
            # Menu pages typically have service cards/cells
            # Try to find clickable service elements
            service_selectors = [
                'ui-kit-simple-cell',
                '[class*="service"]',
                'a[href*="select-time"]',
                '.menu-item',
            ]

            for selector in service_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    services = await page.locator(selector).all()

                    if services:
                        logger.info(f"📋 [MENU] Found {len(services)} services with selector: {selector}")

                        # Click on first few services to get their booking flows
                        for i, service in enumerate(services[:3]):  # Limit to 3 services
                            try:
                                service_text = await service.text_content()
                                logger.info(f"📋 [MENU] Clicking service {i+1}: {service_text[:30]}")

                                await service.click()
                                await page.wait_for_load_state('networkidle', timeout=5000)

                                # Now we should be in booking flow - detect and continue
                                current_url = page.url
                                service_results = await self.detect_and_handle_page_type(page, url, current_url)
                                results.extend(service_results)

                                # Go back to menu
                                await page.go_back()
                                await page.wait_for_load_state('networkidle', timeout=5000)

                            except Exception as e:
                                logger.warning(f"⚠️ [MENU] Failed to process service {i+1}: {e}")
                                continue

                        break  # Found services, stop trying other selectors

                except Exception as e:
                    logger.debug(f"📋 [MENU] Selector {selector} failed: {e}")
                    continue

            return results

        except Exception as e:
            logger.error(f"❌ [MENU] Error handling menu page: {str(e)}")
            return []

    async def handle_time_selection_page(self, page: Page, url: str) -> List[Dict]:
        """
        Handle pages that start directly at time selection (/personal/select-time).
        CRITICAL FIX: Now navigates full flow TIME → COURT → SERVICE to capture ALL data.

        Real YClients flow (confirmed from Playwright exploration):
        1. TIME selection (this page) - capture dates/times
        2. COURT selection - capture court names (DOM scrape)
        3. SERVICE selection - capture prices (DOM scrape)
        """
        logger.info("⏰ [TIME-PAGE] Starting FULL flow navigation (TIME → COURT → SERVICE)")

        results = []
        scraped_data = {'dates': [], 'times': [], 'courts': [], 'services': []}

        try:
            # --- FAST PATH: real DOM selectors (validated 2025-11-09) ---
            try:
                time_slot_selector = YCLIENTS_REAL_SELECTORS["time_slots"]["slots"]
                service_item_selector = YCLIENTS_REAL_SELECTORS["service_page"]["service_items"]
                service_name_selector = YCLIENTS_REAL_SELECTORS["service_page"]["service_names"]
                price_selector = YCLIENTS_REAL_SELECTORS["time_slots"]["price_elements"][0]
                provider_selector = "p.category-title, .category-title"

                await page.wait_for_selector(time_slot_selector, timeout=8000)
                slots = await page.query_selector_all(time_slot_selector)
                logger.info(f"⏰ [FAST-PATH] Found {len(slots)} time slots with real selectors")

                if slots:
                    # Use current day if we can't read month from UI; ensures non-empty date for filters
                    selected_date = datetime.now().strftime('%Y-%m-%d')

                    for slot_idx in range(len(slots)):  # Process all slots
                        try:
                            # Re-query slots each iteration to avoid stale handles after navigation
                            current_slots = await page.query_selector_all(time_slot_selector)
                            if slot_idx >= len(current_slots):
                                break
                            slot = current_slots[slot_idx]

                            # Extract time text safely
                            time_value = await self.data_extractor.find_time_in_slot(slot)
                            if not time_value:
                                time_text = await slot.text_content()
                                time_value = time_text.strip() if time_text else ''

                            logger.info(f"⏰ [FAST-PATH] Clicking slot {slot_idx+1}: {time_value}")
                            await slot.click(force=True, timeout=5000)
                            await page.wait_for_timeout(800)

                            # Try "Continue" button if visible
                            try:
                                cont_btn = page.get_by_role('button', name='Продолжить')
                                if await cont_btn.is_visible(timeout=2000):
                                    await cont_btn.click()
                                    await page.wait_for_load_state('networkidle', timeout=10000)
                                    logger.info("🎯 [FAST-PATH] Clicked Продолжить")
                            except Exception as e:
                                logger.debug(f"ℹ️ [FAST-PATH] Continue button not clicked: {e}")

                            # If still on select-time, go directly to select-services
                            current_url = page.url
                            if 'select-services' not in current_url:
                                service_url = current_url.replace('select-time', 'select-services')
                                await page.goto(service_url, wait_until="networkidle", timeout=PAGE_LOAD_TIMEOUT)
                                await page.wait_for_timeout(800)
                                logger.info(f"🛣️ [FAST-PATH] Navigated directly to services: {page.url}")

                            # Provider from category title on services page
                            provider = "Unknown"
                            try:
                                provider_el = await page.query_selector(provider_selector)
                                if provider_el:
                                    provider_text = await provider_el.text_content()
                                    if provider_text and provider_text.strip():
                                        provider = provider_text.strip()
                                        logger.info(f"🏟️ [FAST-PATH] Provider: {provider}")
                            except Exception as e:
                                logger.debug(f"ℹ️ [FAST-PATH] Provider lookup failed: {e}")

                            # Collect service cards with prices
                            service_cards = await page.query_selector_all(service_item_selector)
                            logger.info(f"💰 [FAST-PATH] Found {len(service_cards)} service cards")

                            for card_idx, card in enumerate(service_cards):
                                try:
                                    name_el = await card.query_selector(service_name_selector)
                                    price_el = await card.query_selector(price_selector)

                                    name_text = await name_el.text_content() if name_el else None
                                    price_text = await price_el.text_content() if price_el else None

                                    if price_text:
                                        price_clean = price_text.strip()
                                        # Generate records for each duration
                                        for duration_mins in [60, 90, 120]:
                                            # Get duration-specific price from catalog if available
                                            tariff_name = name_text.strip() if name_text else None
                                            if self.service_catalog and tariff_name:
                                                catalog_tariff = self.service_catalog.get(tariff_name, {})
                                                if duration_mins not in catalog_tariff:
                                                    continue  # Skip if this duration not available
                                                duration_price = catalog_tariff[duration_mins]
                                            else:
                                                # No catalog, only create 60-min record
                                                if duration_mins != 60:
                                                    continue
                                                duration_price = price_clean

                                            result = {
                                                'url': page.url,
                                                'date': selected_date,
                                                'time': time_value,
                                                'provider': provider,
                                                'price': duration_price,
                                                'service_name': name_text.strip() if name_text else 'Unknown Service',
                                                'duration': duration_mins,
                                                'available': True,
                                                'extracted_at': datetime.now().isoformat()
                                            }
                                            results.append(result)
                                            logger.info(f"✅ [FAST-PATH] Record: {selected_date} {time_value} {duration_mins}min → {provider} → {duration_price}")
                                except Exception as e:
                                    logger.warning(f"⚠️ [FAST-PATH] Failed to parse service {card_idx+1}: {e}")

                            # Return to time page for potential next slot
                            await page.goto(url, wait_until="networkidle", timeout=PAGE_LOAD_TIMEOUT)
                            await page.wait_for_timeout(800)

                        except Exception as e:
                            logger.warning(f"⚠️ [FAST-PATH] Failed to process slot {slot_idx+1}: {e}")
                            continue

                    if results:
                        logger.info(f"✅ [FAST-PATH] Extracted {len(results)} records via real selectors")
                        return results
            except Exception as e:
                logger.debug(f"ℹ️ [FAST-PATH] Real-selector flow skipped: {e}")

            # Wait for time selection elements
            await page.wait_for_timeout(2000)  # Let page fully load

            # Check if page shows "No free time" message with "Go to nearest date" button
            try:
                nearest_date_btn = page.get_by_role('button', name=re.compile(r'Перейти.*ближайшей.*дате'))
                if await nearest_date_btn.is_visible(timeout=2000):
                    logger.info("⏰ [TIME-PAGE] Found 'Go to nearest date' button, clicking...")
                    await nearest_date_btn.click(force=True)
                    await page.wait_for_timeout(3000)  # Wait for time slots to appear

                    # Time slots should now be visible - proceed to click one
                    try:
                        # Look for time slots (format: "9:00", "22:00", etc.)
                        time_slots = await page.get_by_text(re.compile(r'^\d{1,2}:\d{2}$')).all()
                        if not time_slots:
                            raise Exception("No time slots found")
                        time_slot = time_slots[0]
                        time_text = await time_slot.text_content()
                        logger.info(f"⏰ [TIME-PAGE] Clicking time slot: {time_text}")

                        await time_slot.click(force=True)
                        await page.wait_for_timeout(1500)

                        # Click Продолжить button
                        continue_btn = page.get_by_role('button', name='Продолжить')
                        if await continue_btn.is_visible(timeout=2000):
                            logger.info("🎯 Clicking Продолжить")
                            await continue_btn.click(force=True)
                            await page.wait_for_load_state('networkidle', timeout=10000)

                            # Should now be on select-services page
                            if 'select-services' in page.url:
                                logger.info("✅ [FLOW-A] On service page - scraping prices")

                                # Get provider (court name) - try multiple page structures
                                provider = 'Unknown'
                                provider_selectors = [
                                    'p.label.category-title',       # Structure A (b861100 - <p class="label category-title">)
                                    'p',                             # Structure A fallback (any paragraph)
                                    'div.header_title',             # Structure B (b1009933 - TK Raketion)
                                    'div.title-block__title',       # Structure C (alternative)
                                    'h1.category-title',            # Structure D (fallback)
                                    '.service-category-title',      # Structure E (fallback)
                                ]

                                for selector in provider_selectors:
                                    try:
                                        provider_el = page.locator(selector).first
                                        provider_text = await provider_el.text_content(timeout=2000)
                                        if provider_text and provider_text.strip():
                                            provider = provider_text.strip()
                                            logger.info(f"🏟️ Provider found with selector '{selector}': {provider}")
                                            break
                                    except Exception:
                                        continue

                                if provider == 'Unknown':
                                    logger.warning(f"⚠️ Failed to get provider: No matching selector found")

                                # Get prices (text with ₽ symbol)
                                try:
                                    price_elements = await page.get_by_text(re.compile(r'\d+[,\s]*\d*\s*₽')).all()
                                    logger.info(f"💰 Found {len(price_elements)} prices")

                                    # Get date (from button click - it's the suggested date)
                                    from datetime import timedelta
                                    suggested_date = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')

                                    for price_el in price_elements:
                                        price_text = await price_el.text_content()
                                        price_clean = price_text.strip()

                                        # Generate records for each duration
                                        for duration_mins in [60, 90, 120]:
                                            # No catalog in this context, only create 60-min record
                                            if duration_mins != 60:
                                                continue

                                            result = {
                                                'url': page.url,
                                                'date': suggested_date,
                                                'time': time_text.strip(),
                                                'provider': provider,
                                                'price': price_clean,
                                                'service_name': 'Court Rental',
                                                'duration': duration_mins,
                                                'available': True,
                                                'extracted_at': datetime.now().isoformat()
                                            }
                                            results.append(result)
                                        logger.info(f"✅ [PRODUCTION-PROOF] PRICE CAPTURED: {price_clean}")
                                        logger.info(f"✅ [PRODUCTION-PROOF] Full record: date={suggested_date}, time={time_text.strip()}, provider={provider}, price={price_clean}")

                                    # Return early with results!
                                    if results:
                                        logger.info(f"✅ [TIME-PAGE] Extracted {len(results)} records from nearest date")
                                        return results

                                except Exception as e:
                                    logger.error(f"❌ Failed to scrape prices: {e}")
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to process nearest date: {e}")
            except:
                pass  # Button not found, continue with date selection

            # Check if time slots are already visible (after clicking nearest date button)
            try:
                # Wait a bit for DOM to update after clicking button
                await page.wait_for_timeout(1000)

                # Try to find time slots using pattern matching
                # Time slots contain text like "9:00", "10:30" etc.
                # Use partial match since elements may have whitespace
                time_slot_candidates = await page.get_by_text(re.compile(r'\d{1,2}:\d{2}')).all()

                # Filter to only actual time slots (not other elements with colons)
                time_slots = []
                for candidate in time_slot_candidates:
                    text = await candidate.text_content()
                    text_clean = text.strip() if text else ''
                    # Check if it matches time format (HH:MM)
                    if re.match(r'^\d{1,2}:\d{2}$', text_clean):
                        time_slots.append(candidate)

                if len(time_slots) > 0:
                    logger.info(f"⏰ [TIME-PAGE] Time slots already visible, found {len(time_slots)} slots")
                    logger.info("⏰ [TIME-PAGE] Extracting directly without clicking dates...")

                    # Get the current date (shown on page)
                    try:
                        # Try to find selected/highlighted date
                        selected_date_text = await page.locator('.calendar-day.selected, .calendar-day.active, [class*="selected"][class*="date"]').first.text_content()
                        parsed_date = self.parse_date(selected_date_text)
                    except:
                        parsed_date = datetime.now().strftime('%Y-%m-%d')

                    logger.info(f"⏰ [TIME-PAGE] Current date: {parsed_date}")

                    # Process each visible time slot
                    for slot_idx, slot in enumerate(time_slots):  # Process all time slots
                        try:
                            time_text = await slot.text_content()
                            time_clean = time_text.strip() if time_text else ''
                            logger.info(f"⏰ [STEP-2] Clicking time slot: {time_clean}")

                            await slot.click(force=True, timeout=5000)
                            await page.wait_for_timeout(1500)

                            # Check for "Продолжить" button
                            try:
                                continue_btn = page.get_by_role('button', name='Продолжить')
                                if await continue_btn.is_visible(timeout=2000):
                                    logger.info(f"🎯 [STEP-2] Clicking 'Продолжить' to next page")
                                    await continue_btn.click()
                                    await page.wait_for_load_state('networkidle', timeout=10000)

                                    current_url = page.url
                                    logger.info(f"🔍 [STEP-2] Landed on: {current_url}")

                                    # Check if we're on service page
                                    if 'select-services' in current_url:
                                        logger.info(f"✅ [FLOW-A] Direct service page - scraping prices")

                                        # Get provider/court name
                                        provider_name = 'Unknown'
                                        try:
                                            provider_el = await page.locator('p.label.category-title').first
                                            provider_name = await provider_el.text_content()
                                            provider_name = provider_name.strip() if provider_name else 'Unknown'
                                            logger.info(f"🏟️ [FLOW-A] Provider: {provider_name}")
                                        except Exception as e:
                                            logger.warning(f"⚠️ [FLOW-A] Failed to get provider: {e}")

                                        # Get all prices
                                        try:
                                            price_elements = await page.get_by_text(re.compile(r'\d+[,\s]*\d*\s*₽')).all()
                                            logger.info(f"💰 [FLOW-A] Found {len(price_elements)} prices")

                                            for idx, price_el in enumerate(price_elements):
                                                try:
                                                    price_text = await price_el.text_content()
                                                    price_clean = price_text.strip() if price_text else None

                                                    if price_clean:
                                                        # Generate records for each duration
                                                        for duration_mins in [60, 90, 120]:
                                                            # No catalog in this context, only create 60-min record
                                                            if duration_mins != 60:
                                                                continue

                                                            result = {
                                                                'url': page.url,
                                                                'date': parsed_date,
                                                                'time': time_clean,
                                                                'provider': provider_name,
                                                                'price': price_clean,
                                                                'service_name': 'Unknown Service',
                                                                'duration': duration_mins,
                                                                'available': True,
                                                                'extracted_at': datetime.now().isoformat()
                                                            }
                                                            results.append(result)
                                                        logger.info(f"✅ [FLOW-A] Scraped: {parsed_date} {time_clean} → {provider_name} → {price_clean}")
                                                except Exception as e:
                                                    logger.warning(f"⚠️ [FLOW-A] Failed to extract price {idx+1}: {e}")

                                        except Exception as e:
                                            logger.error(f"❌ [FLOW-A] Failed to get prices: {e}")

                                        # Go back to time selection
                                        await page.go_back()
                                        await page.wait_for_timeout(1000)

                            except Exception as e:
                                logger.warning(f"⚠️ [STEP-2] No 'Продолжить' button: {e}")

                        except Exception as e:
                            logger.warning(f"⚠️ [STEP-2] Failed to process time slot {slot_idx+1}: {e}")
                            continue

                    # If we got results, return them
                    if results:
                        logger.info(f"✅ [TIME-PAGE] Extracted {len(results)} records from visible time slots")
                        return results

            except:
                pass  # Time slots not visible, continue with date iteration

            # STEP 1: Extract dates from DOM
            date_selectors = [
                '.calendar-day:not(.disabled)',
                '[class*="date"]',
                '[data-date]',
            ]

            dates_found = []
            for selector in date_selectors:
                try:
                    dates = await page.locator(selector).all()
                    if dates and len(dates) > 0:
                        dates_found = dates
                        logger.info(f"⏰ [TIME-PAGE] Found {len(dates)} dates with selector: {selector}")
                        break
                except:
                    continue

            if not dates_found:
                logger.warning("⚠️ [TIME-PAGE] No dates found on time selection page")
                return []

            # STEP 2: Navigate through dates → times → courts → services
            for date_idx, date in enumerate(dates_found):  # Process all available dates
                try:
                    date_text = await date.text_content()
                    parsed_date = self.parse_date(date_text)
                    logger.info(f"⏰ [STEP-1] Processing date {date_idx+1}: {date_text[:20]} → {parsed_date}")

                    # Scroll into view and click date to load time slots
                    await date.scroll_into_view_if_needed()
                    await page.wait_for_timeout(500)
                    await date.click(force=True, timeout=5000)
                    await page.wait_for_timeout(2000)  # Give time for slots to load

                    # Extract time slots for this date
                    time_slots = []
                    time_slot_selectors = [
                        '[data-time]',
                        'button[class*="time"]',
                        '.time-slot',
                        'div[class*="slot"]',
                    ]

                    for selector in time_slot_selectors:
                        try:
                            slots = await page.locator(selector).all()
                            if slots:
                                time_slots = slots
                                logger.info(f"⏰ [STEP-1] Found {len(time_slots)} time slots with selector: {selector}")
                                break
                        except:
                            continue

                    # Fallback: search for time patterns
                    if not time_slots:
                        time_slots = await page.get_by_text(re.compile(r'\d{1,2}:\d{2}')).all()
                        if time_slots:
                            logger.info(f"⏰ [STEP-1] Found {len(time_slots)} time slots via text pattern")

                    # Navigate through each time slot
                    for slot_idx, slot in enumerate(time_slots):  # Process all time slots
                        try:
                            time_text = await slot.text_content()
                            time_clean = time_text.strip() if time_text else ''
                            logger.info(f"⏰ [STEP-2] Clicking time slot: {time_clean}")

                            # Click time slot
                            await slot.click(force=True, timeout=5000)
                            await page.wait_for_timeout(1500)

                            # Check for "Продолжить" button to go to next step
                            try:
                                continue_btn = page.get_by_role('button', name='Продолжить')
                                if await continue_btn.is_visible(timeout=2000):
                                    logger.info(f"🎯 [STEP-2] Clicking 'Продолжить' to next page")
                                    await continue_btn.click()
                                    await page.wait_for_load_state('networkidle', timeout=10000)

                                    # CHECK: Which page did we land on?
                                    current_url = page.url
                                    logger.info(f"🔍 [STEP-2] Landed on: {current_url}")

                                    # FLOW A: Direct to SERVICE page (no court selection!)
                                    if 'select-services' in current_url:
                                        logger.info(f"✅ [FLOW-A] Direct service page detected - scraping prices")

                                        # Get provider/court name from <p class="label category-title">
                                        provider_name = 'Unknown'
                                        try:
                                            provider_el = await page.locator('p.label.category-title').first
                                            provider_name = await provider_el.text_content()
                                            provider_name = provider_name.strip() if provider_name else 'Unknown'
                                            logger.info(f"🏟️ [FLOW-A] Provider: {provider_name}")
                                        except Exception as e:
                                            logger.warning(f"⚠️ [FLOW-A] Failed to get provider: {e}")

                                        # Get all prices from page (they contain ₽ symbol)
                                        try:
                                            price_elements = await page.get_by_text(re.compile(r'\d+[,\s]*\d*\s*₽')).all()
                                            logger.info(f"💰 [FLOW-A] Found {len(price_elements)} prices")

                                            for idx, price_el in enumerate(price_elements):
                                                try:
                                                    price_text = await price_el.text_content()
                                                    price_clean = price_text.strip() if price_text else None

                                                    if price_clean:
                                                        # Try to get service name (text before price)
                                                        service_name = 'Unknown Service'
                                                        try:
                                                            # Get parent element and extract service text
                                                            parent = await price_el.locator('xpath=ancestor::*[contains(text(), "аренда")]').first
                                                            service_text = await parent.text_content()
                                                            if service_text and 'аренда' in service_text:
                                                                service_name = service_text.split('\n')[0].strip()
                                                        except:
                                                            pass

                                                        # Generate records for each duration
                                                        for duration_mins in [60, 90, 120]:
                                                            # No catalog in this context, only create 60-min record
                                                            if duration_mins != 60:
                                                                continue

                                                            result = {
                                                                'url': page.url,
                                                                'date': parsed_date,
                                                                'time': time_clean,
                                                                'provider': provider_name,
                                                                'price': price_clean,
                                                                'service_name': service_name,
                                                                'duration': duration_mins,
                                                                'available': True,
                                                                'extracted_at': datetime.now().isoformat()
                                                            }
                                                            results.append(result)
                                                        logger.info(f"✅ [FLOW-A] Scraped: {parsed_date} {time_clean} → {provider_name} → {price_clean}")
                                                except Exception as e:
                                                    logger.warning(f"⚠️ [FLOW-A] Failed to extract price {idx+1}: {e}")

                                        except Exception as e:
                                            logger.error(f"❌ [FLOW-A] Failed to get prices: {e}")

                                        # Go back to time selection
                                        await page.go_back()
                                        await page.wait_for_timeout(1000)
                                        continue  # Skip court navigation logic

                                    # FLOW B: Court selection page (original multi-step flow)
                                    # STEP 3: Now on court selection page - SCRAPE COURT NAMES
                                    logger.info(f"🏟️ [STEP-3] On court selection page, scraping court names")

                                    court_selectors = [
                                        'ui-kit-simple-cell',
                                        '[class*="court"]',
                                        '[class*="staff"]',
                                        '.service-item',
                                    ]

                                    courts_found = []
                                    for selector in court_selectors:
                                        try:
                                            courts = await page.locator(selector).all()
                                            if courts and len(courts) > 0:
                                                courts_found = courts
                                                logger.info(f"🏟️ [STEP-3] Found {len(courts)} courts with selector: {selector}")
                                                break
                                        except:
                                            continue

                                    if not courts_found:
                                        logger.warning(f"⚠️ [STEP-3] No courts found on page")
                                        # Go back and continue with next time slot
                                        await page.go_back()
                                        await page.wait_for_timeout(1000)
                                        continue

                                    # Navigate through courts
                                    for court_idx, court in enumerate(courts_found[:3]):  # Limit to 3 courts
                                        try:
                                            # Extract court name BEFORE clicking
                                            court_name = 'Unknown'
                                            try:
                                                court_name_el = await court.locator('ui-kit-headline').first
                                                court_name = await court_name_el.text_content()
                                                court_name = court_name.strip() if court_name else 'Unknown'
                                            except:
                                                court_name = await court.text_content()
                                                court_name = court_name[:50].strip() if court_name else 'Unknown'

                                            logger.info(f"🏟️ [STEP-4] Clicking court: {court_name}")

                                            # Click court
                                            await court.click(force=True, timeout=5000)
                                            await page.wait_for_timeout(1500)

                                            # Click "Продолжить" to go to service/price page
                                            continue_btn2 = page.get_by_role('button', name='Продолжить')
                                            if await continue_btn2.is_visible(timeout=2000):
                                                logger.info(f"🎯 [STEP-4] Clicking 'Продолжить' to service/price page")
                                                await continue_btn2.click()
                                                await page.wait_for_load_state('networkidle', timeout=10000)

                                                # STEP 4: Now on service/price page - SCRAPE PRICES
                                                logger.info(f"💰 [STEP-5] On service/price page, scraping prices")

                                                # Extract service items with prices
                                                service_selectors = [
                                                    'ui-kit-simple-cell',
                                                    '[class*="service"]',
                                                    '.price-item',
                                                ]

                                                services_found = []
                                                for selector in service_selectors:
                                                    try:
                                                        services = await page.locator(selector).all()
                                                        if services and len(services) > 0:
                                                            services_found = services
                                                            logger.info(f"💰 [STEP-5] Found {len(services)} services with selector: {selector}")
                                                            break
                                                    except:
                                                        continue

                                                for svc_idx, service in enumerate(services_found):
                                                    try:
                                                        # Extract service name
                                                        service_name = 'Unknown Service'
                                                        try:
                                                            name_el = await service.locator('ui-kit-headline').first
                                                            service_name = await name_el.text_content()
                                                            service_name = service_name.strip() if service_name else 'Unknown Service'
                                                        except:
                                                            pass

                                                        # Extract price
                                                        price = 'Не найдена'
                                                        try:
                                                            price_el = await service.locator('ui-kit-title').first
                                                            price = await price_el.text_content()
                                                            price = self.clean_price(price) if price else 'Не найдена'
                                                        except:
                                                            pass

                                                        # Extract duration
                                                        duration = 60
                                                        try:
                                                            duration_el = await service.locator('ui-kit-body').first
                                                            duration_text = await duration_el.text_content()
                                                            duration = self.parse_duration(duration_text) if duration_text else 60
                                                        except:
                                                            pass

                                                        # Create complete booking record with ALL data
                                                        result = {
                                                            'url': page.url,
                                                            'date': parsed_date,
                                                            'time': time_clean,
                                                            'provider': court_name,
                                                            'price': price,
                                                            'service_name': service_name,
                                                            'duration': duration,
                                                            'available': True,
                                                            'extracted_at': datetime.now().isoformat()
                                                        }
                                                        results.append(result)
                                                        logger.info(f"✅ [STEP-5] Scraped complete record: date={parsed_date}, time={time_clean}, court={court_name}, price={price}")

                                                    except Exception as e:
                                                        logger.warning(f"⚠️ [STEP-5] Failed to extract service {svc_idx+1}: {e}")

                                                # Go back to court selection
                                                await page.go_back()
                                                await page.wait_for_timeout(1000)

                                        except Exception as e:
                                            logger.warning(f"⚠️ [STEP-4] Failed to process court {court_idx+1}: {e}")
                                            continue

                                    # Go back to time selection
                                    await page.go_back()
                                    await page.wait_for_timeout(1000)

                            except Exception as e:
                                logger.warning(f"⚠️ [STEP-2] No 'Продолжить' button or navigation failed: {e}")

                        except Exception as e:
                            logger.warning(f"⚠️ [STEP-2] Failed to process time slot {slot_idx+1}: {e}")
                            continue

                except Exception as e:
                    logger.warning(f"⚠️ [STEP-1] Failed to process date {date_idx+1}: {e}")
                    continue

            logger.info(f"✅ [TIME-PAGE] Complete flow navigation finished: {len(results)} records extracted")
            return results

        except Exception as e:
            logger.error(f"❌ [TIME-PAGE] Error handling time selection page: {str(e)}")
            return []

    async def navigate_yclients_flow(self, page: Page, url: str) -> List[Dict]:
        """
        Navigate through YClients 4-step booking flow.
        Step 1: Service selection (record-type)
        Step 2: Court selection (select-master)
        Step 3: Date/time selection (select-time)
        Step 4: Service packages with prices (select-services)
        """
        results = []
        logger.info(f"🔍 [DEBUG] Starting 4-step YClients navigation for {url}")

        try:
            # Step 1: Load and select service type
            logger.info(f"🔍 [DEBUG] Step 1: Loading page and waiting for ui-kit-simple-cell")
            await page.goto(url, wait_until='networkidle')
            await page.wait_for_selector('ui-kit-simple-cell', timeout=10000)
            logger.info(f"🔍 [DEBUG] Step 1: Page loaded, title: {await page.title()}")
            
            # Click on "Индивидуальные услуги" or first available service
            service_links = await page.get_by_role('link').all()
            logger.info(f"🔍 [DEBUG] Step 1: Found {len(service_links)} service links")
            service_clicked = False
            for link in service_links:
                text = await link.text_content()
                if 'Индивидуальные' in text or 'услуги' in text.lower():
                    logger.info(f"🔍 [DEBUG] Step 1: Clicking service link: {text[:50]}")
                    await link.click()
                    service_clicked = True
                    break

            if not service_clicked:
                logger.warning(f"⚠️ [DEBUG] Step 1: No matching service link found, trying first link")
                if service_links:
                    await service_links[0].click()

            # Step 2: Select courts
            logger.info(f"🔍 [DEBUG] Step 2: Waiting for select-master page")
            await page.wait_for_url('**/personal/select-master**')
            await page.wait_for_selector('ui-kit-simple-cell')
            logger.info(f"🔍 [DEBUG] Step 2: On select-master page")

            courts = await page.locator('ui-kit-simple-cell').all()
            logger.info(f"🔍 [DEBUG] Step 2: Found {len(courts)} courts")
            for i, court in enumerate(courts[:3]):  # Limit to first 3 courts for testing
                court_name = await court.locator('ui-kit-headline').text_content()
                logger.info(f"🔍 [DEBUG] Step 2: Processing court {i+1}/3: {court_name[:50]}")
                await court.click()

                # Continue to date selection
                continue_btn = page.get_by_role('button', { 'name': 'Продолжить' })
                if await continue_btn.is_visible():
                    logger.info(f"🔍 [DEBUG] Step 2: Clicking 'Продолжить' button")
                    await continue_btn.click()

                # Step 3: Select dates and times
                logger.info(f"🔍 [DEBUG] Step 3: Waiting for select-time page")
                await page.wait_for_url('**/personal/select-time**')
                logger.info(f"🔍 [DEBUG] Step 3: Extracting time slots for {court_name[:30]}")
                before_count = len(results)
                await self.extract_time_slots_with_prices(page, court_name, results)
                after_count = len(results)
                logger.info(f"🔍 [DEBUG] Step 3: Extracted {after_count - before_count} slots for this court")

                # Go back to court selection
                await page.go_back()
                await page.wait_for_selector('ui-kit-simple-cell')

        except Exception as e:
            logger.error(f"❌ [DEBUG] Error in 4-step navigation: {str(e)}")
            logger.error(f"❌ [DEBUG] Current URL: {page.url}")
            logger.error(f"❌ [DEBUG] Page title: {await page.title()}")

        logger.info(f"🔍 [DEBUG] Navigation complete: extracted {len(results)} total results")
        if not results:
            logger.warning(f"⚠️ [DEBUG] ZERO results extracted! This needs investigation.")

        return results

    async def extract_time_slots_with_prices(self, page: Page, court_name: str, results: List[Dict]):
        """Extract time slots and navigate to get prices."""
        logger.info(f"🔍 [DEBUG] extract_time_slots_with_prices: Starting for court {court_name[:30]}")

        try:
            # Get available dates
            dates = await page.locator('.calendar-day:not(.disabled)').all()
            logger.info(f"🔍 [DEBUG] Found {len(dates)} available dates")

            for date_idx, date in enumerate(dates):  # Process all available dates
                date_text = await date.text_content()
                logger.info(f"🔍 [DEBUG] Processing date {date_idx+1}/2: {date_text[:20]}")
                await date.click()
                await page.wait_for_timeout(1000)

                # Get time slots
                time_slots = await page.locator('[data-time]').all()
                if not time_slots:
                    # Try alternative selector
                    logger.warning(f"⚠️ [DEBUG] No [data-time] slots found, trying text regex")
                    time_slots = await page.get_by_text(re.compile(r'\d{1,2}:\d{2}')).all()

                logger.info(f"🔍 [DEBUG] Found {len(time_slots)} time slots for this date")

                for slot_idx, slot in enumerate(time_slots):  # Process all time slots
                    time_text = await slot.text_content()
                    logger.info(f"🔍 [DEBUG] Processing time slot {slot_idx+1}/3: {time_text[:10]}")
                    await slot.click()

                    # Continue to services/prices
                    continue_btn = page.get_by_role('button', { 'name': 'Продолжить' })
                    if await continue_btn.is_visible():
                        await continue_btn.click()

                        # Step 4: Extract prices from service packages
                        logger.info(f"🔍 [DEBUG] Step 4: Waiting for select-services page")
                        await page.wait_for_url('**/personal/select-services**')
                        await page.wait_for_selector('ui-kit-simple-cell')
                        logger.info(f"🔍 [DEBUG] Step 4: On select-services page")

                        services = await page.locator('ui-kit-simple-cell').all()
                        logger.info(f"🔍 [DEBUG] Step 4: Found {len(services)} services")
                        for svc_idx, service in enumerate(services):
                            try:
                                name = await service.locator('ui-kit-headline').text_content()
                                price = await service.locator('ui-kit-title').text_content()
                                duration = await service.locator('ui-kit-body').text_content()

                                # Clean and structure data
                                result = {
                                    'url': page.url,
                                    'court_name': court_name.strip() if court_name else '',
                                    'date': self.parse_date(date_text),
                                    'time': time_text.strip() if time_text else '',
                                    'service_name': name.strip() if name else '',
                                    'price': self.clean_price(price),
                                    'duration': self.parse_duration(duration),
                                    'venue_name': self.extract_venue_name(page.url),
                                    'extracted_at': datetime.now().isoformat()
                                }
                                results.append(result)
                                logger.info(f"🔍 [DEBUG] Step 4: Extracted service {svc_idx+1}: {name[:30]} - {price}")
                            except Exception as e:
                                logger.warning(f"⚠️ [DEBUG] Failed to extract service {svc_idx+1}: {e}")

                        # Go back to time selection
                        await page.go_back()
                        await page.wait_for_timeout(1000)
        except Exception as e:
            logger.error(f"❌ [DEBUG] Error extracting time slots with prices: {str(e)}")
            logger.error(f"❌ [DEBUG] Current URL when error occurred: {page.url}")

    def clean_price(self, price_text: str) -> str:
        """Clean price text: '6,000 ₽' -> '6000 ₽'"""
        if not price_text:
            return "Цена не указана"
        # Remove spaces and commas from numbers
        cleaned = re.sub(r'(\d),(\d)', r'\1\2', price_text)
        cleaned = re.sub(r'(\d)\s+(\d)', r'\1\2', cleaned)
        cleaned = cleaned.strip()
        return cleaned if '₽' in cleaned or 'руб' in cleaned else f"{cleaned} ₽"

    def parse_duration(self, duration_text: str) -> int:
        """Parse duration: '1 ч 30 мин' -> 90"""
        if not duration_text:
            return 60
        
        total_minutes = 0
        # Extract hours
        hour_match = re.search(r'(\d+)\s*ч', duration_text)
        if hour_match:
            total_minutes += int(hour_match.group(1)) * 60
        
        # Extract minutes
        min_match = re.search(r'(\d+)\s*мин', duration_text)
        if min_match:
            total_minutes += int(min_match.group(1))
        
        return total_minutes if total_minutes > 0 else 60

    def parse_date(self, date_text: str) -> str:
        """Parse date from calendar text to ISO format."""
        # For now, return current date. Can be enhanced with proper date parsing
        # Russian month mapping
        months = {
            'январ': '01', 'феврал': '02', 'март': '03', 'апрел': '04',
            'май': '05', 'май': '05', 'июн': '06', 'июл': '07',
            'август': '08', 'сентябр': '09', 'октябр': '10',
            'ноябр': '11', 'декабр': '12'
        }
        
        try:
            # Try to extract day and month
            day_match = re.search(r'(\d{1,2})', date_text)
            if day_match:
                day = day_match.group(1).zfill(2)
                # Find month
                for month_name, month_num in months.items():
                    if month_name in date_text.lower():
                        year = datetime.now().year
                        return f"{year}-{month_num}-{day}"
        except:
            pass
        
        return datetime.now().strftime('%Y-%m-%d')

    def extract_venue_name(self, url: str) -> str:
        """Extract venue name from URL or page content."""
        # This is a placeholder - actual implementation would extract from page
        if 'n1165596' in url:
            return 'Нагатинская'
        elif 'n1308467' in url:
            return 'Корты-Сетки'
        elif 'b861100' in url:
            return 'Padel Friends'
        elif 'b1009933' in url:
            return 'ТК Ракетлон'
        elif 'b918666' in url:
            return 'Padel A33'
        return 'Unknown Venue'

    async def extract_available_dates(self) -> List[Dict[str, Any]]:
        """
        Извлечение доступных дат бронирования.
        
        Returns:
            List[Dict[str, Any]]: Список доступных дат
        """
        logger.info("Извлечение доступных дат бронирования")
        try:
            # Ожидаем загрузки календаря
            await self.page.wait_for_selector(YCLIENTS_REAL_SELECTORS["calendar"]["calendar_container"], timeout=TIMEOUT)
            
            # Получаем элементы доступных дат
            date_elements = await self.page.query_selector_all(YCLIENTS_REAL_SELECTORS["calendar"]["available_dates"])
            
            # Извлечение данных из элементов
            available_dates = []
            for date_element in date_elements:
                # Получаем атрибуты, текст и другие данные элемента
                date_text = await date_element.text_content()
                date_attr = await date_element.get_attribute("data-date")
                
                if date_text and date_attr:
                    available_dates.append({
                        "date": date_attr,
                        "display_text": date_text.strip()
                    })
            
            logger.info(f"Найдено {len(available_dates)} доступных дат")
            return available_dates
        except Exception as e:
            logger.error(f"Ошибка при извлечении доступных дат: {str(e)}")
            return []

    async def extract_time_slots(self, date: str) -> List[Dict[str, Any]]:
        """
        Извлечение доступных временных слотов для выбранной даты.
        
        Args:
            date: Дата для выбора
            
        Returns:
            List[Dict[str, Any]]: Список доступных временных слотов
        """
        logger.info(f"Извлечение временных слотов для даты: {date}")
        try:
            # Выбираем дату в календаре
            date_selector = YCLIENTS_REAL_SELECTORS["calendar"]["date_selector"].format(date=date)
            date_element = await self.page.query_selector(date_selector)
            
            if not date_element:
                logger.warning(f"Элемент даты {date} не найден")
                return []
                
            # Кликаем на дату для загрузки доступных слотов
            await date_element.click()
            await asyncio.sleep(2)  # Ожидание загрузки слотов
            
            # Ждем появления контейнера со слотами
            await self.page.wait_for_selector(YCLIENTS_REAL_SELECTORS["time_slots"]["container"], timeout=TIMEOUT)
            
            # Получаем элементы доступных временных слотов
            slot_elements = await self.page.query_selector_all(YCLIENTS_REAL_SELECTORS["time_slots"]["slots"])
            
            time_slots = []
            for slot_element in slot_elements:
                # Определяем, является ли дата выходным днем
                date_obj = datetime.strptime(date, "%Y-%m-%d")
                is_weekend = date_obj.weekday() >= 5  # 5 и 6 - суббота и воскресенье
                
                # Используем исправленный экстрактор данных для получения всех полей
                slot_data = await self.data_extractor.extract_slot_data_fixed(
                    slot_element
                )
                
                # Добавляем дату, если её нет
                if "date" not in slot_data:
                    slot_data["date"] = date
                    
                time_slots.append(slot_data)
            
            logger.info(f"Найдено {len(time_slots)} временных слотов для даты {date}")
            return time_slots
            
        except Exception as e:
            logger.error(f"Ошибка при извлечении временных слотов для даты {date}: {str(e)}")
            return []

    async def parse_url(self, url: str) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Парсинг данных с одного URL.
        Обновлен для обработки страниц выбора услуг (record-type).
        
        Args:
            url: URL для парсинга
            
        Returns:
            Tuple[bool, List[Dict[str, Any]]]: Статус успеха и список извлеченных данных
        """
        logger.info(f"Начало парсинга URL: {url}")
        all_data = []
        success = False
        
        try:
            # Проверяем, является ли это страницей выбора услуг
            if 'record-type' in url or 'select-service' in url:
                logger.info("Обнаружена страница выбора услуг, получаем прямые ссылки")
                # Получаем прямые ссылки на услуги
                direct_urls = await self.handle_service_selection_page(url)
                
                if not direct_urls:
                    logger.warning("Не получены прямые ссылки, попробуем парсить страницу как есть")
                    # Fallback: парсим страницу как обычно
                    success, all_data = await self.parse_service_url(url)
                else:
                    # Парсим каждую услугу отдельно
                    for service_url in direct_urls:
                        logger.info(f"Парсинг услуги: {service_url}")
                        service_success, service_data = await self.parse_service_url(service_url)
                        if service_success:
                            all_data.extend(service_data)
                            success = True
                        
                        # Небольшая пауза между запросами
                        await asyncio.sleep(2)
            else:
                # Обычный парсинг прямой ссылки
                success, all_data = await self.parse_service_url(url)
            
            if success:
                self.last_parsed_urls[url] = datetime.now()
                logger.info(f"Парсинг URL: {url} завершен успешно, получено {len(all_data)} записей")
            else:
                logger.error(f"Парсинг URL: {url} завершен неудачно")
            
            return success, all_data
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге URL {url}: {str(e)}")
            return False, []

    async def parse_service_url(self, url: str) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Парсинг данных с прямого URL услуги.
        Обновлен для использования 4-шагового навигационного потока YClients.
        
        Args:
            url: URL для парсинга
            
        Returns:
            Tuple[bool, List[Dict[str, Any]]]: Статус успеха и список извлеченных данных
        """
        logger.info(f"Парсинг прямой ссылки услуги: {url}")
        all_data = []
        
        try:
            # Навигация на страницу
            navigation_success = await self.navigate_to_url(url)
            if not navigation_success:
                logger.error(f"Не удалось загрузить страницу: {url}")
                return False, []
                
            # Проверка на антибот-защиту
            if not await self.check_for_antibot():
                logger.warning("Обнаружена защита от ботов, смена прокси и перезапуск")
                return False, []
            
            # Проверяем, является ли это YClients URL
            if self.is_yclients_url(url):
                logger.info("🎯 YClients URL detected, checking page type...")

                # SMART DETECTION: Check what page we actually landed on after navigation
                await self.page.wait_for_load_state('networkidle', timeout=5000)
                current_url = self.page.url
                logger.info(f"🔍 [DETECTION] Current URL after load: {current_url}")

                # NEW: Handle select-services start pages (like Lunda b1280372)
                if 'select-services' in current_url:
                    token_part = current_url.split('?o=')[1] if '?o=' in current_url else ''
                    # If no service token yet (just ?o= or ?o=empty), navigate to select-master
                    if not token_part or token_part == '' or len(token_part) < 5:
                        logger.info("🛒 [FLOW] Detected select-services start page, navigating to select-master")
                        # Capture catalog BEFORE navigation (ensures catalog populated)
                        self.service_catalog = await self.capture_service_catalog(self.page)
                        logger.info(f"🛒 [CATALOG] Pre-captured {len(self.service_catalog)} tariffs")

                        # NEW: Auto-detect pricing rules from catalog
                        self.auto_detected_rules = auto_build_pricing_rules(self.service_catalog)
                        nav_success = await self.handle_select_services_start_page(self.page)
                        if nav_success and 'select-master' in self.page.url:
                            # Scrape directly from select-master
                            master_results = await self.scrape_select_master_page(self.page)
                            if master_results:
                                logger.info(f"✅ [FLOW] Got {len(master_results)} records from select-master")
                                return True, master_results

                # Try API interception first (best for SPAs), fallback to DOM scraping
                try:
                    logger.info("🌐 [STRATEGY] Attempting API-based extraction first...")
                    all_data = await self.extract_via_api_interception(self.page, url)

                    # Check data QUALITY, not just quantity
                    if all_data and len(all_data) > 0:
                        # Count records with real provider names (not "Не указан" or "Unknown")
                        bad_provider_values = ['Не указан', 'Unknown', '', None]
                        good_records = [r for r in all_data if r.get('provider') not in bad_provider_values]
                        quality_pct = (len(good_records) / len(all_data) * 100) if all_data else 0

                        logger.info(f"🌐 [STRATEGY] API mode returned {len(all_data)} records, {len(good_records)} with real providers ({quality_pct:.1f}% quality)")

                        # If data quality is poor (less than 50% have real providers), fall back to DOM
                        if quality_pct < 50:
                            logger.warning(f"⚠️ [STRATEGY] API data quality too low ({quality_pct:.1f}%), falling back to DOM scraping")
                            all_data = await self.detect_and_handle_page_type(self.page, url, current_url)
                        else:
                            logger.info(f"✅ [STRATEGY] API mode succeeded with good quality: {len(good_records)} good records")
                    else:
                        # Fallback to DOM scraping
                        logger.info("⚠️ [STRATEGY] API mode returned 0 records, falling back to DOM scraping")
                        all_data = await self.detect_and_handle_page_type(self.page, url, current_url)
                except Exception as e:
                    logger.error(f"❌ [STRATEGY] API mode failed: {e}, falling back to DOM scraping")
                    all_data = await self.detect_and_handle_page_type(self.page, url, current_url)
            else:
                logger.info("📄 Используем стандартное извлечение данных")
                # Извлечение доступных дат (старый метод для других сайтов)
                available_dates = await self.extract_available_dates()
                if not available_dates:
                    logger.warning("Не найдены доступные даты")
                    return False, []
                    
                # Для каждой доступной даты извлекаем временные слоты
                for date_info in available_dates:
                    date = date_info["date"]
                    
                    # Извлечение временных слотов
                    time_slots = await self.extract_time_slots(date)
                    
                    # Добавляем данные в общий список
                    all_data.extend(time_slots)
                    
                    # Имитация поведения пользователя: случайная задержка между запросами
                    await asyncio.sleep(self.browser_manager.get_random_delay(1, 3))
            
            success = len(all_data) > 0
            if success:
                self.last_parsed_urls[url] = datetime.now()
                logger.info(f"Парсинг URL: {url} завершен успешно, получено {len(all_data)} записей")
            else:
                logger.warning(f"Парсинг URL: {url} завершен, но данные не извлечены")
                
            return success, all_data
        
        except Exception as e:
            logger.error(f"Ошибка при парсинге прямой ссылки {url}: {str(e)}")
            return False, []
    
    def is_yclients_url(self, url: str) -> bool:
        """Проверяет, является ли URL страницей YClients."""
        yclients_indicators = [
            'yclients.com',
            'record-type',
            'personal/',
            'select-time',
            'select-master'
        ]
        return any(indicator in url for indicator in yclients_indicators)

    async def parse_all_urls(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Парсинг данных со всех URL.
        
        Returns:
            Dict[str, List[Dict[str, Any]]]: Словарь с данными для каждого URL
        """
        logger.info("Начало парсинга всех URL")
        results = {}
        
        try:
            await self.initialize()
            
            for url in self.urls:
                retry_count = 0
                success = False
                data = []
                
                # Делаем несколько попыток парсинга с разными прокси
                while not success and retry_count < MAX_RETRIES:
                    success, data = await self.parse_url(url)
                    
                    if not success:
                        retry_count += 1
                        logger.warning(f"Попытка {retry_count}/{MAX_RETRIES} для {url} не удалась, смена прокси")
                        
                        # Закрываем текущий контекст и браузер
                        await self.close()
                        
                        # Меняем прокси и инициализируем новый браузер
                        self.current_proxy = self.proxy_manager.get_next_proxy()
                        self.browser, self.context = await self.browser_manager.initialize_browser(
                            proxy=self.current_proxy
                        )
                    else:
                        # Если успешно, сохраняем данные
                        results[url] = data
                
                # Если все попытки неудачны, записываем пустой список
                if not success:
                    logger.error(f"Не удалось обработать URL {url} после {MAX_RETRIES} попыток")
                    results[url] = []
                
            logger.info(f"Парсинг всех URL завершен, обработано {len(results)} URL")
        
        except Exception as e:
            logger.error(f"Критическая ошибка при парсинге URL: {str(e)}")
        finally:
            await self.close()
        
        return results

    async def run_single_iteration(self) -> None:
        """Выполнение одной итерации парсинга всех URL."""
        logger.info("Начало итерации парсинга")
        start_time = time.time()
        
        try:
            # Получаем данные со всех URL
            results = await self.parse_all_urls()
            
            # Сохраняем полученные данные в базу данных
            for url, data in results.items():
                if data:
                    logger.info(f"Сохранение {len(data)} записей для URL {url}")
                    await self.db_manager.save_booking_data(url, data)
                else:
                    logger.warning(f"Нет данных для сохранения для URL {url}")
            
        except Exception as e:
            logger.error(f"Ошибка при выполнении итерации парсинга: {str(e)}")
        
        elapsed_time = time.time() - start_time
        logger.info(f"Итерация парсинга завершена за {elapsed_time:.2f} секунд")

    async def run_continuous(self) -> None:
        """Непрерывный парсинг с заданным интервалом."""
        logger.info(f"Запуск непрерывного парсинга с интервалом {PARSE_INTERVAL} секунд")
        
        while True:
            try:
                await self.run_single_iteration()
                logger.info(f"Ожидание {PARSE_INTERVAL} секунд до следующей итерации")
                await asyncio.sleep(PARSE_INTERVAL)
            
            except KeyboardInterrupt:
                logger.info("Получен сигнал остановки, завершение работы")
                break
            
            except Exception as e:
                logger.error(f"Непредвиденная ошибка в цикле парсинга: {str(e)}")
                # Небольшая пауза перед следующей попыткой в случае ошибки
                await asyncio.sleep(10)


async def main():
    """Пример использования парсера."""
    from src.database.db_manager import DatabaseManager
    
    # Пример URL для парсинга
    urls = [
        "https://yclients.com/company/111111/booking",
        "https://yclients.com/company/222222/booking"
    ]
    
    # Инициализация менеджера базы данных
    db_manager = DatabaseManager()
    await db_manager.initialize()
    
    # Инициализация парсера
    parser = YClientsParser(urls, db_manager)
    
    # Запуск одной итерации парсинга
    await parser.run_single_iteration()
    
    # Закрытие соединения с базой данных
    await db_manager.close()


if __name__ == "__main__":
    # Настройка логирования
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Запуск основной функции
    asyncio.run(main())
