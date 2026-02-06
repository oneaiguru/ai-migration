import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
import os
import sys

# Добавляем путь к директории с исходным кодом
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Импортируем модуль с ботом
from ozon_bot_updated import OzonReservationBot, setup_schedule, schedule_job

# Создаем мок для telegram.Bot
telegram_bot_mock = MagicMock(name='telegram.Bot')

# Мок для импорта telegram
sys.modules['telegram'] = MagicMock()
sys.modules['telegram'].Bot = telegram_bot_mock

class TestOzonReservationBot(unittest.TestCase):
    """
    Модульные тесты для бота резервирования товаров на Озон
    """
    
    def setUp(self):
        """
        Подготовка к выполнению тестов
        """
        # Создаём тестовую конфигурацию
        self.test_config = {
            "login": "test@example.com",
            "password": "test_password",
            "headless": True,
            "user_agent": "Test User Agent",
            "sku_list": ["12345678", "87654321"],
            "payment_method": "Тестовый способ оплаты",
            "telegram_token": "test_token",
            "telegram_chat_id": "test_chat_id",
            "schedule": {
                "enabled": True,
                "daily": ["10:00", "15:00"],
                "run_duration_hours": 7
            }
        }
        
        # Создаём мок для файла конфигурации
        self.config_mock = mock_open(read_data=json.dumps(self.test_config))
        
    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    @patch('json.load')
    def test_load_config(self, mock_json_load, mock_open_file):
        """
        Тест загрузки конфигурации
        """
        # Настройка мока
        mock_json_load.return_value = self.test_config
        
        # Создание экземпляра бота с замоканной загрузкой конфигурации
        with patch.object(OzonReservationBot, '_setup_driver', return_value=None):
            bot = OzonReservationBot()
            
        # Проверка, что конфигурация загружена корректно
        self.assertEqual(bot.config, self.test_config)
        mock_open_file.assert_called_once_with("config.json", 'r', encoding='utf-8')
        mock_json_load.assert_called_once()
    
    @patch.object(OzonReservationBot, '_load_config')
    @patch.object(OzonReservationBot, '_setup_driver')
    def test_driver_setup(self, mock_setup_driver, mock_load_config):
        """
        Тест настройки драйвера
        """
        # Настройка моков
        mock_load_config.return_value = self.test_config
        mock_driver = MagicMock()
        mock_setup_driver.return_value = mock_driver
        
        # Создание экземпляра бота
        bot = OzonReservationBot()
        
        # Запуск метода для тестирования
        bot.driver = bot._setup_driver()
        
        # Проверка, что драйвер настроен корректно
        self.assertEqual(bot.driver, mock_driver)
        mock_setup_driver.assert_called_once()
    
    @patch.object(OzonReservationBot, '_load_config')
    @patch.object(OzonReservationBot, '_setup_driver')
    @patch.object(OzonReservationBot, 'login')
    @patch.object(OzonReservationBot, 'add_products_to_cart')
    @patch.object(OzonReservationBot, 'checkout')
    def test_run_success(self, mock_checkout, mock_add_products, mock_login, 
                        mock_setup_driver, mock_load_config):
        """
        Тест успешного выполнения полного цикла работы бота
        """
        # Настройка моков
        mock_load_config.return_value = self.test_config
        mock_driver = MagicMock()
        mock_setup_driver.return_value = mock_driver
        mock_login.return_value = True
        mock_add_products.return_value = 2  # 2 добавленных товара
        mock_checkout.return_value = True
        
        # Создание экземпляра бота
        bot = OzonReservationBot()
        
        # Запуск метода для тестирования
        result = bot.run()
        
        # Проверки
        self.assertTrue(result)
        mock_login.assert_called_once()
        mock_add_products.assert_called_once()
        mock_checkout.assert_called_once()
        self.assertEqual(mock_driver.quit.call_count, 1)
    
    @patch.object(OzonReservationBot, '_load_config')
    @patch.object(OzonReservationBot, '_setup_driver')
    @patch.object(OzonReservationBot, 'login')
    def test_run_login_failure(self, mock_login, 
                              mock_setup_driver, mock_load_config):
        """
        Тест обработки ошибки авторизации
        """
        # Настройка моков
        mock_load_config.return_value = self.test_config
        mock_driver = MagicMock()
        mock_setup_driver.return_value = mock_driver
        mock_login.return_value = False  # Авторизация не удалась
        
        # Создание экземпляра бота
        bot = OzonReservationBot()
        
        # Запуск метода для тестирования
        result = bot.run()
        
        # Проверки
        self.assertFalse(result)
        mock_login.assert_called_once()
        self.assertEqual(mock_driver.quit.call_count, 1)
    
    @patch.object(OzonReservationBot, '_load_config')
    @patch.object(OzonReservationBot, '_setup_driver')
    @patch.object(OzonReservationBot, 'login')
    @patch.object(OzonReservationBot, 'add_products_to_cart')
    @patch.object(OzonReservationBot, '_send_notification')
    def test_run_no_products(self, mock_send_notification, mock_add_products, 
                             mock_login, mock_setup_driver, mock_load_config):
        """
        Тест обработки ситуации с отсутствием товаров для добавления
        """
        # Настройка моков
        mock_load_config.return_value = self.test_config
        mock_driver = MagicMock()
        mock_setup_driver.return_value = mock_driver
        mock_login.return_value = True
        mock_add_products.return_value = 0  # Нет добавленных товаров
        
        # Создание экземпляра бота с настройкой телеграм-бота
        bot = OzonReservationBot()
        bot.telegram_bot = MagicMock()
        
        # Запуск метода для тестирования
        result = bot.run()
        
        # Проверки
        self.assertFalse(result)
        mock_login.assert_called_once()
        mock_add_products.assert_called_once()
        mock_send_notification.assert_called_once()
        self.assertEqual(mock_driver.quit.call_count, 1)
    
    @patch('schedule.every')
    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    @patch('json.load')
    def test_setup_schedule(self, mock_json_load, mock_open_file, mock_schedule_every):
        """
        Тест настройки расписания
        """
        # Настройка моков
        mock_json_load.return_value = self.test_config
        mock_day = MagicMock()
        mock_schedule_every.return_value.day = mock_day
        
        # Вызов функции для тестирования
        result = setup_schedule()
        
        # Проверки
        self.assertTrue(result)
        mock_open_file.assert_called_once_with("config.json", 'r', encoding='utf-8')
        mock_json_load.assert_called_once()
        self.assertEqual(mock_day.at.call_count, 2)  # Два ежедневных расписания
    
    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    @patch('json.load')
    def test_setup_schedule_disabled(self, mock_json_load, mock_open_file):
        """
        Тест обработки отключенного расписания
        """
        # Создаём копию конфигурации с отключенным расписанием
        disabled_config = self.test_config.copy()
        disabled_config["schedule"]["enabled"] = False
        
        # Настройка моков
        mock_json_load.return_value = disabled_config
        
        # Вызов функции для тестирования
        result = setup_schedule()
        
        # Проверки
        self.assertFalse(result)
        mock_open_file.assert_called_once_with("config.json", 'r', encoding='utf-8')
        mock_json_load.assert_called_once()
    
    @patch('ozon_bot_updated.OzonReservationBot')
    def test_schedule_job(self, mock_bot_class):
        """
        Тест выполнения запланированной задачи
        """
        # Настройка моков
        mock_bot = MagicMock()
        mock_bot_class.return_value = mock_bot
        mock_bot.run.return_value = True
        
        # Вызов функции для тестирования
        schedule_job()
        
        # Проверки
        mock_bot_class.assert_called_once()
        mock_bot.run.assert_called_once()
    
    def test_should_stop(self):
        """
        Тест функции should_stop
        """
        # Создание экземпляра бота с замоканной загрузкой конфигурации
        with patch.object(OzonReservationBot, '_load_config', return_value=self.test_config):
            with patch.object(OzonReservationBot, '_setup_driver', return_value=None):
                bot = OzonReservationBot()
                
        # Проверка, когда stop_time не установлено
        bot.stop_time = None
        self.assertFalse(bot.should_stop())
        
        # Проверка при установленном времени остановки в будущем
        from datetime import datetime, timedelta
        future_time = datetime.now() + timedelta(hours=1)
        bot.stop_time = future_time
        self.assertFalse(bot.should_stop())
        
        # Проверка при установленном времени остановки в прошлом
        past_time = datetime.now() - timedelta(hours=1)
        bot.stop_time = past_time
        self.assertTrue(bot.should_stop())

if __name__ == '__main__':
    unittest.main()
