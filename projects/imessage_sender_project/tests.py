#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модульные тесты
Версия: 1.0.0
Автор: Михаил
"""

import os
import sys
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Добавляем путь к модулям в PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Импорт тестируемых модулей
from config import Config
from contact_manager import ContactManager
from logger import Logger
from message_template import MessageTemplate


class TestConfig(unittest.TestCase):
    """Тесты для модуля конфигурации"""
    
    def setUp(self):
        """Настройка окружения перед каждым тестом"""
        self.config = Config()
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Очистка после каждого теста"""
        shutil.rmtree(self.temp_dir)
    
    def test_default_values(self):
        """Тест значений по умолчанию"""
        # Проверка нескольких основных параметров
        self.assertEqual(self.config.get('log_path'), 'logs')
        self.assertEqual(self.config.get('delay_min'), 3.0)
        self.assertEqual(self.config.get('delay_max'), 7.0)
        self.assertTrue(self.config.get('use_applescript'))
    
    def test_get_set_values(self):
        """Тест получения и установки значений"""
        # Установка новых значений
        self.config.set('log_path', 'test_logs')
        self.config.set('delay_min', 5.0)
        self.config.set('new_param', 'test_value')
        
        # Проверка установленных значений
        self.assertEqual(self.config.get('log_path'), 'test_logs')
        self.assertEqual(self.config.get('delay_min'), 5.0)
        self.assertEqual(self.config.get('new_param'), 'test_value')
        
        # Проверка значения по умолчанию для несуществующего параметра
        self.assertIsNone(self.config.get('non_existent_param'))
        self.assertEqual(self.config.get('non_existent_param', 'default'), 'default')
    
    def test_update_config(self):
        """Тест обновления нескольких параметров"""
        update_dict = {
            'log_path': 'new_logs',
            'delay_min': 10.0,
            'delay_max': 15.0,
            'new_param': 'new_value'
        }
        
        self.config.update(update_dict)
        
        # Проверка обновленных значений
        self.assertEqual(self.config.get('log_path'), 'new_logs')
        self.assertEqual(self.config.get('delay_min'), 10.0)
        self.assertEqual(self.config.get('delay_max'), 15.0)
        self.assertEqual(self.config.get('new_param'), 'new_value')
    
    def test_reset_config(self):
        """Тест сброса конфигурации к значениям по умолчанию"""
        # Изменение нескольких параметров
        self.config.set('log_path', 'test_logs')
        self.config.set('delay_min', 5.0)
        self.config.set('new_param', 'test_value')
        
        # Сброс конфигурации
        self.config.reset()
        
        # Проверка восстановления значений по умолчанию
        self.assertEqual(self.config.get('log_path'), 'logs')
        self.assertEqual(self.config.get('delay_min'), 3.0)
        
        # Проверка удаления добавленного параметра
        self.assertIsNone(self.config.get('new_param'))
    
    def test_save_load_json(self):
        """Тест сохранения и загрузки конфигурации в формате JSON"""
        # Изменение нескольких параметров
        self.config.set('log_path', 'test_logs')
        self.config.set('delay_min', 5.0)
        self.config.set('new_param', 'test_value')
        
        # Сохранение в JSON
        json_path = os.path.join(self.temp_dir, 'config.json')
        self.assertTrue(self.config.save_to_file(json_path))
        
        # Создание новой конфигурации и загрузка из JSON
        new_config = Config()
        self.assertTrue(new_config.load_from_file(json_path))
        
        # Проверка загруженных значений
        self.assertEqual(new_config.get('log_path'), 'test_logs')
        self.assertEqual(new_config.get('delay_min'), 5.0)
        self.assertEqual(new_config.get('new_param'), 'test_value')
    
    def test_save_load_ini(self):
        """Тест сохранения и загрузки конфигурации в формате INI"""
        # Изменение нескольких параметров
        self.config.set('log_path', 'test_logs')
        self.config.set('delay_min', 5.0)
        self.config.set('new_param', 'test_value')
        
        # Сохранение в INI
        ini_path = os.path.join(self.temp_dir, 'config.ini')
        self.assertTrue(self.config.save_to_file(ini_path))
        
        # Создание новой конфигурации и загрузка из INI
        new_config = Config()
        self.assertTrue(new_config.load_from_file(ini_path))
        
        # Проверка загруженных значений
        self.assertEqual(new_config.get('log_path'), 'test_logs')
        self.assertEqual(new_config.get('delay_min'), 5.0)
        self.assertEqual(new_config.get('new_param'), 'test_value')


class TestContactManager(unittest.TestCase):
    """Тесты для модуля управления контактами"""
    
    def setUp(self):
        """Настройка окружения перед каждым тестом"""
        self.logger = MagicMock()
        self.contact_manager = ContactManager(logger=self.logger)
        self.temp_dir = tempfile.mkdtemp()
        
        # Создание тестовых файлов с контактами
        self.create_test_files()
    
    def tearDown(self):
        """Очистка после каждого теста"""
        shutil.rmtree(self.temp_dir)
    
    def create_test_files(self):
        """Создание тестовых файлов с контактами"""
        # CSV файл
        self.csv_path = os.path.join(self.temp_dir, 'contacts.csv')
        with open(self.csv_path, 'w', encoding='utf-8') as f:
            f.write("phone,name,company\n")
            f.write("+79161234567,Иван,ООО Тест\n")
            f.write("+79162345678,Мария,ИП Петров\n")
            f.write("+79163456789,Петр,ЗАО Инновации\n")
        
        # TXT файл
        self.txt_path = os.path.join(self.temp_dir, 'contacts.txt')
        with open(self.txt_path, 'w', encoding='utf-8') as f:
            f.write("+79161234567\n")
            f.write("+79162345678\n")
            f.write("+79163456789\n")
    
    def test_validate_phone(self):
        """Тест валидации номеров телефонов"""
        # Корректные номера
        self.assertEqual(self.contact_manager.validate_phone("+79161234567"), "+79161234567")
        self.assertEqual(self.contact_manager.validate_phone("89161234567"), "+79161234567")
        self.assertEqual(self.contact_manager.validate_phone("7 916 123-45-67"), "+79161234567")
        
        # Некорректные номера
        self.assertEqual(self.contact_manager.validate_phone("123"), "")
        self.assertEqual(self.contact_manager.validate_phone("not a phone"), "")
    
    def test_add_contact(self):
        """Тест добавления контактов"""
        # Добавление корректного контакта
        self.assertTrue(self.contact_manager.add_contact({'phone': '+79161234567', 'name': 'Иван'}))
        
        # Проверка наличия контакта
        self.assertEqual(len(self.contact_manager.get_contacts()), 1)
        self.assertEqual(self.contact_manager.get_contacts()[0]['phone'], '+79161234567')
        self.assertEqual(self.contact_manager.get_contacts()[0]['name'], 'Иван')
        
        # Добавление контакта без номера
        self.assertFalse(self.contact_manager.add_contact({'name': 'Мария'}))
        
        # Добавление контакта с некорректным номером
        self.assertFalse(self.contact_manager.add_contact({'phone': '123', 'name': 'Петр'}))
        
        # Проверка количества контактов (должен остаться только один)
        self.assertEqual(len(self.contact_manager.get_contacts()), 1)
        
        # Добавление дубликата (не должен добавляться)
        self.assertFalse(self.contact_manager.add_contact({'phone': '+79161234567', 'name': 'Другой Иван'}))
        
        # Проверка, что дубликат не добавился
        self.assertEqual(len(self.contact_manager.get_contacts()), 1)
        self.assertEqual(self.contact_manager.get_contacts()[0]['name'], 'Иван')  # Имя не изменилось
    
    def test_load_from_csv(self):
        """Тест загрузки контактов из CSV-файла"""
        # Загрузка из CSV
        count = self.contact_manager.load_from_csv(self.csv_path)
        
        # Проверка количества загруженных контактов
        self.assertEqual(count, 3)
        self.assertEqual(len(self.contact_manager.get_contacts()), 3)
        
        # Проверка данных первого контакта
        first_contact = self.contact_manager.get_contacts()[0]
        self.assertEqual(first_contact['phone'], '+79161234567')
        self.assertEqual(first_contact['name'], 'Иван')
        self.assertEqual(first_contact['company'], 'ООО Тест')
    
    def test_load_from_txt(self):
        """Тест загрузки контактов из TXT-файла"""
        # Загрузка из TXT
        count = self.contact_manager.load_from_txt(self.txt_path)
        
        # Проверка количества загруженных контактов
        self.assertEqual(count, 3)
        self.assertEqual(len(self.contact_manager.get_contacts()), 3)
        
        # Проверка данных первого контакта (только номер)
        first_contact = self.contact_manager.get_contacts()[0]
        self.assertEqual(first_contact['phone'], '+79161234567')
    
    def test_load_from_file(self):
        """Тест автоопределения типа файла и загрузки контактов"""
        # Загрузка из CSV
        count = self.contact_manager.load_from_file(self.csv_path)
        self.assertEqual(count, 3)
        
        # Очистка контактов
        self.contact_manager.clear()
        
        # Загрузка из TXT
        count = self.contact_manager.load_from_file(self.txt_path)
        self.assertEqual(count, 3)
        
        # Загрузка из несуществующего файла
        count = self.contact_manager.load_from_file('non_existent_file.csv')
        self.assertEqual(count, 0)
    
    def test_export_to_csv(self):
        """Тест экспорта контактов в CSV-файл"""
        # Добавление контактов
        self.contact_manager.add_contact({'phone': '+79161234567', 'name': 'Иван', 'company': 'ООО Тест'})
        self.contact_manager.add_contact({'phone': '+79162345678', 'name': 'Мария', 'company': 'ИП Петров'})
        
        # Экспорт в CSV
        export_path = os.path.join(self.temp_dir, 'export.csv')
        self.assertTrue(self.contact_manager.export_to_csv(export_path))
        
        # Создание нового менеджера и загрузка экспортированных контактов
        new_manager = ContactManager(logger=self.logger)
        count = new_manager.load_from_csv(export_path)
        
        # Проверка количества загруженных контактов
        self.assertEqual(count, 2)
        
        # Проверка данных первого контакта
        first_contact = new_manager.get_contacts()[0]
        self.assertEqual(first_contact['phone'], '+79161234567')
        self.assertEqual(first_contact['name'], 'Иван')
        self.assertEqual(first_contact['company'], 'ООО Тест')


class TestMessageTemplate(unittest.TestCase):
    """Тесты для модуля шаблонизации сообщений"""
    
    def setUp(self):
        """Настройка окружения перед каждым тестом"""
        self.logger = MagicMock()
        self.template = MessageTemplate(logger=self.logger)
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Очистка после каждого теста"""
        shutil.rmtree(self.temp_dir)
    
    def test_set_get_template(self):
        """Тест установки и получения шаблона"""
        # Установка шаблона
        template_text = "Привет, {{ name }}! Ваш заказ {{ order_id }} готов."
        self.assertTrue(self.template.set_template(template_text))
        
        # Проверка получения шаблона
        self.assertEqual(self.template.get_template(), template_text)
        
        # Установка пустого шаблона (должна завершиться неудачей)
        self.assertFalse(self.template.set_template(""))
    
    def test_get_template_variables(self):
        """Тест получения списка переменных из шаблона"""
        # Установка шаблона с переменными
        template_text = "Привет, {{ name }}! Ваш заказ {{ order_id }} на сумму {{ amount }} готов."
        self.template.set_template(template_text)
        
        # Получение списка переменных
        variables = self.template.get_template_variables()
        
        # Проверка наличия всех переменных
        self.assertEqual(len(variables), 3)
        self.assertIn('name', variables)
        self.assertIn('order_id', variables)
        self.assertIn('amount', variables)
        
        # Получение списка переменных без установленного шаблона
        self.template.set_template("")  # Сбрасываем шаблон
        self.assertEqual(self.template.get_template_variables(), [])
    
    def test_render_template(self):
        """Тест рендеринга шаблона с контекстом"""
        # Установка шаблона
        template_text = "Привет, {{ name }}! Ваш заказ {{ order_id }} на сумму {{ amount }} готов."
        self.template.set_template(template_text)
        
        # Контекст с данными
        context = {
            'name': 'Иван',
            'order_id': '12345',
            'amount': '1000 руб.'
        }
        
        # Рендеринг шаблона
        rendered = self.template.render(context)
        
        # Проверка результата
        expected = "Привет, Иван! Ваш заказ 12345 на сумму 1000 руб. готов."
        self.assertEqual(rendered, expected)
        
        # Рендеринг с неполным контекстом
        incomplete_context = {
            'name': 'Иван',
            'order_id': '12345'
        }
        
        rendered_incomplete = self.template.render(incomplete_context)
        expected_incomplete = "Привет, Иван! Ваш заказ 12345 на сумму {{ amount }} готов."
        self.assertEqual(rendered_incomplete, expected_incomplete)
        
        # Рендеринг без контекста
        rendered_empty = self.template.render()
        expected_empty = "Привет, {{ name }}! Ваш заказ {{ order_id }} на сумму {{ amount }} готов."
        self.assertEqual(rendered_empty, expected_empty)
        
        # Рендеринг без шаблона
        self.template.set_template("")  # Сбрасываем шаблон
        self.assertEqual(self.template.render(context), "")
    
    def test_special_variables(self):
        """Тест специальных переменных (дата, время и т.д.)"""
        # Установка шаблона со специальными переменными
        template_text = "Дата: {{ date }}, Время: {{ time }}, Год: {{ year }}"
        self.template.set_template(template_text)
        
        # Рендеринг шаблона
        rendered = self.template.render()
        
        # Проверка наличия специальных переменных
        import re
        date_pattern = r'Дата: \d{2}\.\d{2}\.\d{4}'
        time_pattern = r'Время: \d{2}:\d{2}'
        year_pattern = r'Год: \d{4}'
        
        self.assertTrue(re.match(date_pattern, rendered))
        self.assertTrue(re.search(time_pattern, rendered))
        self.assertTrue(re.search(year_pattern, rendered))
    
    def test_load_save_template(self):
        """Тест загрузки и сохранения шаблона в файл"""
        # Установка шаблона
        template_text = "Привет, {{ name }}! Ваш заказ {{ order_id }} готов."
        self.template.set_template(template_text)
        
        # Сохранение в файл
        template_path = os.path.join(self.temp_dir, 'template.txt')
        self.assertTrue(self.template.save_to_file(template_path))
        
        # Создание нового объекта шаблона
        new_template = MessageTemplate(logger=self.logger)
        
        # Загрузка из файла
        self.assertTrue(new_template.load_from_file(template_path))
        
        # Проверка загруженного шаблона
        self.assertEqual(new_template.get_template(), template_text)
        
        # Загрузка из несуществующего файла
        self.assertFalse(new_template.load_from_file('non_existent_file.txt'))


class TestLogger(unittest.TestCase):
    """Тесты для модуля логирования"""
    
    def setUp(self):
        """Настройка окружения перед каждым тестом"""
        self.temp_dir = tempfile.mkdtemp()
        self.log_path = os.path.join(self.temp_dir, 'test.log')
    
    def tearDown(self):
        """Очистка после каждого теста"""
        shutil.rmtree(self.temp_dir)
    
    def test_logger_initialization(self):
        """Тест инициализации логгера"""
        # Создание логгера с указанием пути
        logger = Logger(log_path=self.log_path, console=False)
        
        # Проверка создания файла лога
        self.assertTrue(os.path.exists(self.log_path))
        
        # Проверка установки пути к файлу лога
        self.assertEqual(logger.log_file, self.log_path)
    
    def test_logging_levels(self):
        """Тест уровней логирования"""
        # Создание логгера
        logger = Logger(log_path=self.log_path, console=False)
        
        # Логирование сообщений разных уровней
        logger.debug("Debug message")
        logger.info("Info message")
        logger.warning("Warning message")
        logger.error("Error message")
        logger.critical("Critical message")
        
        # Проверка наличия записей в журнале сообщений
        self.assertEqual(len(logger.message_log), 5)
        
        # Проверка уровней записей
        self.assertEqual(logger.message_log[0]['level'], 'debug')
        self.assertEqual(logger.message_log[1]['level'], 'info')
        self.assertEqual(logger.message_log[2]['level'], 'warning')
        self.assertEqual(logger.message_log[3]['level'], 'error')
        self.assertEqual(logger.message_log[4]['level'], 'critical')
        
        # Проверка сообщений
        self.assertEqual(logger.message_log[0]['message'], 'Debug message')
        self.assertEqual(logger.message_log[1]['message'], 'Info message')
        self.assertEqual(logger.message_log[2]['message'], 'Warning message')
        self.assertEqual(logger.message_log[3]['message'], 'Error message')
        self.assertEqual(logger.message_log[4]['message'], 'Critical message')
    
    def test_log_event(self):
        """Тест логирования структурированных событий"""
        # Создание логгера
        logger = Logger(log_path=self.log_path, console=False)
        
        # Логирование события
        logger.log_event("test_event", {
            'source': 'test',
            'value': 123,
            'status': 'ok'
        })
        
        # Проверка наличия записи в журнале
        self.assertEqual(len(logger.message_log), 1)
        
        # Проверка сообщения (должно содержать EVENT: и JSON)
        message = logger.message_log[0]['message']
        self.assertTrue(message.startswith('EVENT:'))
        self.assertIn('test_event', message)
        self.assertIn('source', message)
        self.assertIn('value', message)
        self.assertIn('status', message)
    
    def test_log_message_sent(self):
        """Тест логирования отправки сообщения"""
        # Создание логгера
        logger = Logger(log_path=self.log_path, console=False)
        
        # Логирование отправки сообщения
        logger.log_message_sent(
            phone="+79161234567",
            message="Привет! Это тестовое сообщение.",
            status="success",
            details={
                'message_id': 'msg123',
                'delivery_status': 'delivered'
            }
        )
        
        # Проверка наличия записи в журнале
        self.assertEqual(len(logger.message_log), 1)
        
        # Проверка сообщения
        message = logger.message_log[0]['message']
        self.assertTrue(message.startswith('EVENT:'))
        self.assertIn('message_sent', message)
        self.assertIn('+79161234567', message)
        self.assertIn('success', message)
        self.assertIn('msg123', message)
        self.assertIn('delivered', message)
    
    def test_get_log_entries(self):
        """Тест получения записей из журнала сообщений"""
        # Создание логгера
        logger = Logger(log_path=self.log_path, console=False)
        
        # Логирование сообщений разных уровней
        logger.debug("Debug message")
        logger.info("Info message 1")
        logger.info("Info message 2")
        logger.warning("Warning message")
        logger.error("Error message")
        
        # Получение всех записей
        all_entries = logger.get_log_entries()
        self.assertEqual(len(all_entries), 5)
        
        # Получение записей уровня info
        info_entries = logger.get_log_entries(level='info')
        self.assertEqual(len(info_entries), 2)
        self.assertEqual(info_entries[0]['message'], 'Info message 1')
        self.assertEqual(info_entries[1]['message'], 'Info message 2')
        
        # Получение записей с ограничением количества
        limited_entries = logger.get_log_entries(limit=2)
        self.assertEqual(len(limited_entries), 2)
        self.assertEqual(limited_entries[0]['message'], 'Warning message')
        self.assertEqual(limited_entries[1]['message'], 'Error message')
    
    def test_export_log(self):
        """Тест экспорта журнала сообщений в файл"""
        # Создание логгера
        logger = Logger(log_path=self.log_path, console=False)
        
        # Логирование сообщений
        logger.info("Info message 1")
        logger.warning("Warning message")
        logger.error("Error message")
        
        # Экспорт в TXT
        txt_path = os.path.join(self.temp_dir, 'export.txt')
        self.assertTrue(logger.export_log(txt_path, 'txt'))
        self.assertTrue(os.path.exists(txt_path))
        
        # Экспорт в JSON
        json_path = os.path.join(self.temp_dir, 'export.json')
        self.assertTrue(logger.export_log(json_path, 'json'))
        self.assertTrue(os.path.exists(json_path))
        
        # Экспорт в CSV
        csv_path = os.path.join(self.temp_dir, 'export.csv')
        self.assertTrue(logger.export_log(csv_path, 'csv'))
        self.assertTrue(os.path.exists(csv_path))


if __name__ == '__main__':
    unittest.main()
