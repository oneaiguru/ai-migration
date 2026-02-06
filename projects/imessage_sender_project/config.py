#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модуль конфигурации
Версия: 1.0.0
Автор: Михаил
"""

import os
import json
import configparser
from typing import Dict, Any, Optional, Union


class Config:
    """Класс для управления конфигурацией системы рассылки"""
    
    # Значения по умолчанию
    DEFAULT_CONFIG = {
        # Пути к директориям и файлам
        'log_path': 'logs',
        'templates_path': 'templates',
        'reports_path': 'reports',
        
        # Параметры рассылки
        'delay_min': 3.0,  # Минимальная задержка между отправками в секундах
        'delay_max': 7.0,  # Максимальная задержка между отправками в секундах
        'batch_size': 50,  # Размер пакета для обработки контактов
        'use_applescript': True,  # Использовать AppleScript для отправки
        
        # Параметры логирования
        'log_level': 'info',  # Уровень логирования (debug, info, warning, error, critical)
        'console_log': True,  # Выводить логи в консоль
        
        # Параметры шаблонов
        'date_format': '%d.%m.%Y',  # Формат даты
        'time_format': '%H:%M',     # Формат времени
    }
    
    def __init__(self, config_path=None):
        """
        Инициализация конфигурации
        
        Args:
            config_path (str, optional): Путь к файлу конфигурации. По умолчанию None.
        """
        # Копирование значений по умолчанию
        self.config = self.DEFAULT_CONFIG.copy()
        
        # Загрузка конфигурации из файла, если указан
        if config_path:
            self.load_from_file(config_path)
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Получение значения параметра конфигурации
        
        Args:
            key (str): Ключ параметра
            default (Any, optional): Значение по умолчанию, если параметр не найден. По умолчанию None.
            
        Returns:
            Any: Значение параметра
        """
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """
        Установка значения параметра конфигурации
        
        Args:
            key (str): Ключ параметра
            value (Any): Значение параметра
        """
        self.config[key] = value
    
    def update(self, config_dict: Dict[str, Any]) -> None:
        """
        Обновление нескольких параметров конфигурации
        
        Args:
            config_dict (Dict[str, Any]): Словарь с параметрами
        """
        self.config.update(config_dict)
    
    def reset(self) -> None:
        """Сброс конфигурации к значениям по умолчанию"""
        self.config = self.DEFAULT_CONFIG.copy()
    
    def load_from_file(self, file_path: str) -> bool:
        """
        Загрузка конфигурации из файла
        
        Args:
            file_path (str): Путь к файлу конфигурации
            
        Returns:
            bool: True в случае успешной загрузки, иначе False
        """
        if not os.path.isfile(file_path):
            print(f"Файл конфигурации не найден: {file_path}")
            return False
        
        try:
            # Определение типа файла по расширению
            _, ext = os.path.splitext(file_path)
            ext = ext.lower()
            
            if ext == '.json':
                # Загрузка из JSON
                with open(file_path, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                    self.update(config_data)
                    return True
                    
            elif ext in ['.ini', '.cfg', '.conf']:
                # Загрузка из INI/CFG (без интерполяции, чтобы поддерживать % в форматах даты/времени)
                config = configparser.RawConfigParser()
                config.read(file_path, encoding='utf-8')
                
                # Преобразование в словарь
                config_data = {}
                
                # Обработка DEFAULT-секции и остальных секций
                for section in ['DEFAULT'] + config.sections():
                    items = config[section].items()
                    for key, value in items:
                        config_key = f"{section}.{key}" if section not in ['DEFAULT', None] else key
                        
                        # Преобразование типов
                        if value.lower() in ['true', 'yes', 'on', '1']:
                            config_data[config_key] = True
                        elif value.lower() in ['false', 'no', 'off', '0']:
                            config_data[config_key] = False
                        elif value.isdigit():
                            config_data[config_key] = int(value)
                        elif self._is_float(value):
                            config_data[config_key] = float(value)
                        else:
                            config_data[config_key] = value
                
                self.update(config_data)
                return True
                
            else:
                print(f"Неподдерживаемый тип файла конфигурации: {ext}")
                return False
                
        except Exception as e:
            print(f"Ошибка загрузки конфигурации: {str(e)}")
            return False
    
    def save_to_file(self, file_path: str, format_type: str = None) -> bool:
        """
        Сохранение конфигурации в файл
        
        Args:
            file_path (str): Путь для сохранения файла
            format_type (str, optional): Формат файла ('json', 'ini'). По умолчанию None (определение по расширению).
            
        Returns:
            bool: True в случае успешного сохранения, иначе False
        """
        try:
            # Создаем директорию, если не существует
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            # Определение типа файла
            if not format_type:
                _, ext = os.path.splitext(file_path)
                format_type = ext.lower().lstrip('.')
                
                if not format_type:
                    format_type = 'json'
            
            if format_type in ['json']:
                # Сохранение в JSON
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(self.config, f, ensure_ascii=False, indent=2)
                return True
                
            elif format_type in ['ini', 'cfg', 'conf']:
                # Сохранение в INI/CFG без интерполяции, чтобы поддерживать %
                config = configparser.RawConfigParser()
                config['DEFAULT'] = {}
                
                # Группировка по секциям (параметры с точкой в имени)
                sections = {}
                
                for key, value in self.config.items():
                    # Если в ключе есть точка, считаем первую часть секцией
                    if '.' in key:
                        section, param = key.split('.', 1)
                        if section not in sections:
                            sections[section] = {}
                        sections[section][param] = str(value)
                    else:
                        config['DEFAULT'][key] = str(value)
                
                # Добавление секций
                for section, params in sections.items():
                    config[section] = params
                
                # Запись в файл
                with open(file_path, 'w', encoding='utf-8') as f:
                    config.write(f)
                    
                return True
                
            else:
                print(f"Неподдерживаемый формат файла: {format_type}")
                return False
                
        except Exception as e:
            print(f"Ошибка сохранения конфигурации: {str(e)}")
            return False
    
    def _is_float(self, value: str) -> bool:
        """
        Проверка, является ли строка числом с плавающей точкой
        
        Args:
            value (str): Проверяемая строка
            
        Returns:
            bool: True если строка является числом с плавающей точкой, иначе False
        """
        try:
            float(value)
            return True
        except ValueError:
            return False
    
    def export_as_dict(self) -> Dict[str, Any]:
        """
        Экспорт конфигурации в виде словаря
        
        Returns:
            Dict[str, Any]: Словарь с конфигурацией
        """
        return self.config.copy()
    
    def import_from_dict(self, config_dict: Dict[str, Any]) -> None:
        """
        Импорт конфигурации из словаря
        
        Args:
            config_dict (Dict[str, Any]): Словарь с конфигурацией
        """
        self.update(config_dict)
    
    def generate_default_config_file(self, file_path: str, format_type: str = 'json') -> bool:
        """
        Генерация файла конфигурации со значениями по умолчанию
        
        Args:
            file_path (str): Путь для сохранения файла
            format_type (str, optional): Формат файла ('json', 'ini'). По умолчанию 'json'.
            
        Returns:
            bool: True в случае успешной генерации, иначе False
        """
        # Сохранение текущей конфигурации
        current_config = self.config.copy()
        
        # Установка значений по умолчанию
        self.reset()
        
        # Сохранение в файл
        result = self.save_to_file(file_path, format_type)
        
        # Восстановление исходной конфигурации
        self.config = current_config
        
        return result


# Для тестирования
if __name__ == "__main__":
    # Создание конфигурации
    config = Config()
    
    # Печать параметров по умолчанию
    print("Параметры по умолчанию:")
    for key, value in config.export_as_dict().items():
        print(f"{key}: {value}")
    
    # Изменение параметров
    config.set('delay_min', 5.0)
    config.set('delay_max', 10.0)
    config.set('log_level', 'debug')
    
    # Создание тестовой директории
    os.makedirs('tests', exist_ok=True)
    
    # Сохранение в файлы разных форматов
    config.save_to_file('tests/config.json')
    config.save_to_file('tests/config.ini')
    
    # Сброс и загрузка из файла
    config.reset()
    config.load_from_file('tests/config.json')
    
    print("\nПараметры после загрузки из JSON:")
    for key, value in config.export_as_dict().items():
        if value != Config.DEFAULT_CONFIG.get(key):
            print(f"{key}: {value} (изменено)")
    
    # Генерация файла конфигурации по умолчанию
    config.generate_default_config_file('tests/default_config.json')
    
    print("\nФайлы конфигурации сохранены в директории 'tests'")
