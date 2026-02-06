"""
Бот для автоматического резерва товаров на Озон
Автор: Михаил Гранин
Версия: 1.0
"""

import os
import time
import json
import logging
import schedule
from datetime import datetime, timedelta
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

# Try to import telegram, but make it optional
try:
    import telegram
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ozon_bot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ozon_bot")

class OzonReservationBot:
    """
    Бот для автоматического резервирования товаров на Озон
    """
    
    def __init__(self, config_path="config.json"):
        """
        Инициализация бота
        :param config_path: путь к конфигурационному файлу
        """
        self.config = self._load_config(config_path)
        self.driver = None
        self.telegram_bot = None
        
        # Initialize Telegram bot only if available and configured
        if TELEGRAM_AVAILABLE and self.config.get("telegram_token") and self.config.get("telegram_chat_id"):
            try:
                self.telegram_bot = telegram.Bot(token=self.config["telegram_token"])
                self.telegram_chat_id = self.config["telegram_chat_id"]
            except Exception as e:
                logger.warning(f"Не удалось инициализировать Telegram бота: {e}")
                self.telegram_bot = None
        
        # Расчет времени остановки, если указана продолжительность работы
        self.stop_time = None  # kept for backward compatibility, store full datetime
        if self.config.get("schedule", {}).get("run_duration_hours"):
            run_duration = int(self.config.get("schedule", {}).get("run_duration_hours", 7))
            self.stop_time = datetime.now() + timedelta(hours=run_duration)
            logger.info(f"Бот будет работать до {self.stop_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    def _load_config(self, config_path):
        """
        Загрузка конфигурации из JSON-файла
        :param config_path: путь к конфигурационному файлу
        :return: словарь с конфигурацией
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as file:
                config = json.load(file)
            logger.info("Конфигурация успешно загружена")
            return config
        except Exception as e:
            logger.error(f"Ошибка при загрузке конфигурации: {e}")
            raise
    
    def _setup_driver(self):
        """
        Настройка драйвера Selenium
        :return: объект WebDriver
        """
        try:
            chrome_options = Options()
            
            # Добавление аргументов для работы в headless режиме, если требуется
            if self.config.get("headless", False):
                chrome_options.add_argument("--headless")
            
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            # Добавление user-agent для имитации реального пользователя
            chrome_options.add_argument(f"user-agent={self.config.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36')}")
            
            # Добавляем расширенные опции для совместимости с новыми версиями Chrome
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--ignore-certificate-errors")
            chrome_options.add_argument("--remote-debugging-port=9222")
            chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Используем встроенный механизм Selenium для автоматического определения драйвера
            logger.info("Используем встроенный менеджер Selenium для Chrome")
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(60)
            
            logger.info("Драйвер браузера успешно инициализирован")
            return driver
        except Exception as e:
            logger.error(f"Ошибка при настройке драйвера: {e}")
            raise
    
    def login(self):
        """
        Авторизация на сайте Озон
        :return: True в случае успешной авторизации, иначе False
        """
        try:
            logger.info("Начало процесса авторизации")
            self.driver.get("https://www.ozon.ru/")
            
            # Нажатие на кнопку входа
            login_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Войти')]"))
            )
            login_button.click()
            
            # Выбор способа входа (по почте/телефону)
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Войти по почте')]"))
            ).click()
            
            # Ввод email/телефона
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='email']"))
            )
            email_input.clear()
            email_input.send_keys(self.config["login"])
            
            # Нажатие "Продолжить"
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            ).click()
            
            # Ввод пароля
            password_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@name='password']"))
            )
            password_input.clear()
            password_input.send_keys(self.config["password"])
            
            # Нажатие "Войти"
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            ).click()
            
            # Проверка успешной авторизации (наличие имени пользователя или иконки профиля)
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'profileMenu')]"))
            )
            
            logger.info("Авторизация успешно выполнена")
            self._take_screenshot("login_success")
            return True
        except Exception as e:
            logger.error(f"Ошибка при авторизации: {e}")
            self._take_screenshot("login_error")
            self._send_notification(f"❌ Ошибка при авторизации на сайте Озон: {e}")
            return False
    
    def add_products_to_cart(self):
        """
        Добавление товаров в корзину из списка в конфигурации
        :return: количество добавленных товаров
        """
        added_count = 0
        
        try:
            logger.info("Начало процесса добавления товаров в корзину")
            
            # Очистка корзины перед добавлением новых товаров
            self._clear_cart()
            
            # Получение списка SKU из конфигурации
            sku_list = self.config.get("sku_list", [])
            
            if not sku_list:
                logger.warning("Список SKU пуст")
                return 0
            
            for sku in sku_list:
                try:
                    # Проверка времени остановки
                    if self.should_stop():
                        logger.info("Достигнуто время остановки, прерывание процесса добавления товаров")
                        break
                    
                    # Переход на страницу товара
                    self.driver.get(f"https://www.ozon.ru/product/{sku}")
                    
                    # Ожидание загрузки страницы
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'webAddToCart')]"))
                    )
                    
                    # Получение доступного количества
                    try:
                        quantity_element = self.driver.find_element(By.XPATH, "//span[contains(text(), 'Доступно для заказа')]/following-sibling::span")
                        available_quantity = int(''.join(filter(str.isdigit, quantity_element.text)))
                    except (NoSuchElementException, ValueError):
                        available_quantity = 1  # Если не удалось определить количество, берем 1
                    
                    logger.info(f"Доступно для заказа SKU {sku}: {available_quantity} шт.")
                    
                    # Кнопка "Добавить в корзину"
                    add_button = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.XPATH, "//div[contains(@data-widget, 'webAddToCart')]//button"))
                    )
                    
                    # Если нужно добавить больше 1 товара, используем выбор количества
                    if available_quantity > 1:
                        try:
                            # Сначала нажимаем на поле выбора количества
                            quantity_selector = self.driver.find_element(By.XPATH, "//div[contains(@data-widget, 'quantity')]//input")
                            quantity_selector.click()
                            
                            # Очищаем поле и вводим нужное значение
                            quantity_selector.clear()
                            quantity_selector.send_keys(str(available_quantity))
                            
                            # Нажимаем Enter для подтверждения
                            quantity_selector.send_keys(Keys.ENTER)
                            time.sleep(1)  # Ждем применения значения
                        except NoSuchElementException:
                            logger.warning(f"Не удалось найти селектор количества для SKU {sku}")
                    
                    # Нажатие кнопки добавления в корзину
                    add_button.click()
                    
                    # Ожидание успешного добавления
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Товар в корзине')]"))
                    )
                    
                    logger.info(f"Товар SKU {sku} успешно добавлен в корзину")
                    self._take_screenshot(f"add_to_cart_success_{sku}")
                    added_count += 1
                    
                except Exception as e:
                    logger.error(f"Ошибка при добавлении товара {sku} в корзину: {e}")
                    self._take_screenshot(f"add_to_cart_error_{sku}")
            
            logger.info(f"Завершено добавление товаров в корзину. Добавлено: {added_count} из {len(sku_list)}")
            return added_count
            
        except Exception as e:
            logger.error(f"Ошибка в процессе добавления товаров в корзину: {e}")
            self._take_screenshot("add_products_error")
            self._send_notification(f"❌ Ошибка при добавлении товаров в корзину: {e}")
            return added_count
    
    def _clear_cart(self):
        """
        Очистка корзины перед началом работы
        """
        try:
            logger.info("Очистка корзины")
            self.driver.get("https://www.ozon.ru/cart")
            
            # Ожидание загрузки страницы корзины
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'total')]"))
            )
            
            # Проверка наличия товаров в корзине
            try:
                empty_cart = self.driver.find_element(By.XPATH, "//h1[contains(text(), 'Корзина пуста')]")
                logger.info("Корзина уже пуста")
                return
            except NoSuchElementException:
                pass
            
            # Нажатие на кнопку "Удалить выбранные"
            try:
                # Сначала выбираем все товары
                select_all = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Выбрать все')]/parent::div//input"))
                )
                if not select_all.is_selected():
                    select_all.click()
                
                # Нажимаем на кнопку удаления
                delete_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Удалить выбранные')]/parent::button"))
                )
                delete_button.click()
                
                # Подтверждаем удаление
                confirm_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@role, 'dialog')]//button[contains(text(), 'Удалить')]"))
                )
                confirm_button.click()
                
                # Ожидаем, пока корзина очистится
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Корзина пуста')]"))
                )
                
                logger.info("Корзина успешно очищена")
                self._take_screenshot("clear_cart_success")
            except (TimeoutException, NoSuchElementException) as e:
                logger.warning(f"Не удалось очистить корзину: {e}")
                self._take_screenshot("clear_cart_error")
        except Exception as e:
            logger.error(f"Ошибка при очистке корзины: {e}")
            self._take_screenshot("clear_cart_error")
    
    def checkout(self):
        """
        Оформление заказа с выбором способа оплаты
        :return: True если заказ успешно оформлен, иначе False
        """
        try:
            logger.info("Начало процесса оформления заказа")
            
            # Проверка времени остановки
            if self.should_stop():
                logger.info("Достигнуто время остановки, прерывание процесса оформления заказа")
                return False
            
            # Переход в корзину
            self.driver.get("https://www.ozon.ru/cart")
            
            # Ожидание загрузки страницы корзины
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'total')]"))
            )
            
            # Проверка наличия товаров в корзине
            try:
                self.driver.find_element(By.XPATH, "//h1[contains(text(), 'Корзина пуста')]")
                logger.warning("Корзина пуста, нечего оформлять")
                return False
            except NoSuchElementException:
                pass
            
            # Нажатие кнопки "Перейти к оформлению"
            checkout_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Перейти к оформлению')]"))
            )
            checkout_button.click()
            
            # Ожидание загрузки страницы оформления
            WebDriverWait(self.driver, 15).until(
                EC.url_contains("/checkout")
            )
            
            # Выбор способа оплаты
            payment_method = self.config.get("payment_method", "Банковская карта")
            logger.info(f"Выбор способа оплаты: {payment_method}")
            
            # Нажатие на раздел способа оплаты
            payment_section = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(@data-widget, 'paymentMethod')]"))
            )
            payment_section.click()
            
            # Выбор конкретного метода оплаты
            payment_option = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{payment_method}')]/ancestor::div[contains(@role, 'button')]"))
            )
            payment_option.click()
            
            # Нажатие кнопки "Подтвердить"
            confirm_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Подтвердить')]"))
            )
            confirm_button.click()
            
            # Возврат на страницу оформления и ожидание загрузки
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@data-widget, 'orderButton')]"))
            )
            
            # Нажатие кнопки "Заказать"
            order_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Заказать')]"))
            )
            order_button.click()
            
            # Ожидание успешного оформления заказа (переход на страницу с номером заказа)
            WebDriverWait(self.driver, 20).until(
                EC.url_contains("/checkout/success")
            )
            
            # Получение номера заказа
            try:
                order_number_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Номер заказа')]/following-sibling::span"))
                )
                order_number = order_number_element.text.strip()
                logger.info(f"Заказ успешно оформлен. Номер заказа: {order_number}")
            except:
                order_number = "Не удалось получить"
                logger.info("Заказ успешно оформлен, но не удалось получить номер заказа")
            
            self._take_screenshot(f"success_order_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            
            # Отправка уведомления в Telegram
            self._send_notification(f"✅ Резервирование товаров успешно выполнено.\nНомер заказа: {order_number}")
            
            return True
        
        except Exception as e:
            logger.error(f"Ошибка при оформлении заказа: {e}")
            self._take_screenshot("checkout_error")
            
            # Отправка уведомления об ошибке
            self._send_notification(f"❌ Ошибка при резервировании товаров:\n{str(e)}")
            
            return False
    
    def _take_screenshot(self, filename):
        """
        Сохранение скриншота
        :param filename: имя файла скриншота
        """
        try:
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"screenshots/{filename}_{timestamp}.png"
            self.driver.save_screenshot(screenshot_path)
            logger.info(f"Скриншот сохранен: {screenshot_path}")
        except Exception as e:
            logger.error(f"Ошибка при сохранении скриншота: {e}")
    
    def _send_notification(self, message):
        """
        Отправка уведомления в Telegram
        :param message: текст сообщения
        """
        if TELEGRAM_AVAILABLE and self.telegram_bot and hasattr(self, 'telegram_chat_id'):
            try:
                self.telegram_bot.send_message(chat_id=self.telegram_chat_id, text=message)
                logger.info("Уведомление в Telegram отправлено")
            except Exception as e:
                logger.error(f"Ошибка при отправке уведомления в Telegram: {e}")
    
    def should_stop(self):
        """
        Проверка, не пора ли остановить работу бота (по времени)
        :return: True если пора остановить, иначе False
        """
        if self.stop_time is None:
            return False
        
        current_time = datetime.now()
        return current_time >= self.stop_time
    
    def run(self):
        """
        Основной метод запуска бота
        """
        try:
            logger.info("Запуск бота для резервирования товаров на Озон")
            
            # Инициализация драйвера
            self.driver = self._setup_driver()
            
            # Авторизация
            if not self.login():
                logger.error("Не удалось авторизоваться, прерывание работы")
                return False
            
            # Проверка времени остановки
            if self.should_stop():
                logger.info("Достигнуто время остановки после авторизации, завершение работы")
                return True
            
            # Добавление товаров в корзину
            added_count = self.add_products_to_cart()
            if added_count == 0:
                logger.warning("Не удалось добавить товары в корзину, прерывание работы")
                self._send_notification("⚠️ Не удалось добавить товары в корзину")
                return False
            
            # Проверка времени остановки
            if self.should_stop():
                logger.info("Достигнуто время остановки после добавления товаров, завершение работы")
                return True
            
            # Оформление заказа
            checkout_result = self.checkout()
            
            return checkout_result
            
        except Exception as e:
            logger.error(f"Ошибка в процессе работы бота: {e}")
            self._send_notification(f"❌ Критическая ошибка в работе бота: {str(e)}")
            return False
        finally:
            # Закрытие драйвера
            if self.driver:
                try:
                    self.driver.quit()
                    logger.info("Драйвер браузера закрыт")
                except:
                    pass

def schedule_job():
    """
    Функция для запуска бота по расписанию
    """
    try:
        bot = OzonReservationBot()
        result = bot.run()
        logger.info(f"Задача резервирования завершена с результатом: {'Успешно' if result else 'Ошибка'}")
    except Exception as e:
        logger.error(f"Ошибка при выполнении запланированной задачи: {e}")

def setup_schedule(config_path="config.json"):
    """
    Настройка расписания запуска бота
    :param config_path: путь к конфигурационному файлу
    """
    try:
        # Загрузка конфигурации
        with open(config_path, 'r', encoding='utf-8') as file:
            config = json.load(file)
        
        # Получение расписания из конфигурации
        schedule_config = config.get("schedule", {})
        
        # Настройка запуска по расписанию
        if schedule_config.get("enabled", False):
            # Ежедневное расписание
            if schedule_config.get("daily"):
                for time_str in schedule_config["daily"]:
                    schedule.every().day.at(time_str).do(schedule_job)
                    logger.info(f"Добавлено ежедневное расписание на {time_str}")
            
            # Еженедельное расписание
            days_mapping = {
                "monday": schedule.every().monday,
                "tuesday": schedule.every().tuesday,
                "wednesday": schedule.every().wednesday,
                "thursday": schedule.every().thursday,
                "friday": schedule.every().friday,
                "saturday": schedule.every().saturday,
                "sunday": schedule.every().sunday
            }
            
            for day, times in schedule_config.get("weekly", {}).items():
                day_schedule = days_mapping.get(day.lower())
                if day_schedule and times:
                    for time_str in times:
                        day_schedule.at(time_str).do(schedule_job)
                        logger.info(f"Добавлено еженедельное расписание на {day} в {time_str}")
            
            logger.info("Расписание настроено успешно")
            return True
        else:
            logger.info("Планировщик отключен в конфигурации")
            return False
            
    except Exception as e:
        logger.error(f"Ошибка при настройке расписания: {e}")
        return False

def main():
    """
    Точка входа в программу
    """
    try:
        # Проверка наличия конфигурационного файла
        config_path = "config.json"
        if not os.path.exists(config_path):
            logger.error(f"Конфигурационный файл {config_path} не найден")
            return
        
        # Проверка аргументов командной строки
        import sys
        args = sys.argv[1:]
        
        # Запуск разовой задачи
        if "run" in args:
            bot = OzonReservationBot(config_path)
            result = bot.run()
            logger.info(f"Задача резервирования выполнена с результатом: {'Успешно' if result else 'Ошибка'}")
            return
        
        # Настройка и запуск планировщика
        scheduler_enabled = setup_schedule(config_path)
        
        if scheduler_enabled:
            logger.info("Планировщик запущен. Нажмите Ctrl+C для остановки.")
            
            try:
                # Сразу запускаем задачу, если указан соответствующий аргумент
                if "start-now" in args:
                    logger.info("Запуск начальной задачи...")
                    schedule_job()
                
                # Бесконечный цикл проверки расписания
                while True:
                    schedule.run_pending()
                    time.sleep(1)
            except KeyboardInterrupt:
                logger.info("Планировщик остановлен пользователем")
        else:
            logger.info("Планировщик не запущен")
            
    except Exception as e:
        logger.error(f"Ошибка в основной функции: {e}")

if __name__ == "__main__":
    main()
