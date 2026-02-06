#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модуль шаблонизации сообщений
Версия: 1.0.0
Автор: Михаил
"""

import os
import re
import json
from typing import Dict, Any, Optional
from datetime import datetime


class MessageTemplate:
    """Класс для работы с шаблонами сообщений и персонализации"""
    
    def __init__(self, logger=None):
        """
        Инициализация шаблонизатора сообщений
        
        Args:
            logger: Объект логгера для записи событий
        """
        self.logger = logger
        self.template = ""
        self.date_format = "%d.%m.%Y"
        self.time_format = "%H:%M"
        
        # Регулярное выражение для поиска переменных в шаблоне {{ var }} или {{var}} (поддерживает Unicode)
        self.var_pattern = re.compile(r'\{\{\s*([\w\.]+)\s*\}\}', re.UNICODE)
    
    def _log(self, level: str, message: str) -> None:
        """
        Запись сообщения в лог, если логгер предоставлен
        
        Args:
            level (str): Уровень логирования (info, warning, error, debug)
            message (str): Сообщение для записи
        """
        if self.logger:
            if hasattr(self.logger, level):
                getattr(self.logger, level)(message)
            else:
                # Если указанный уровень не поддерживается, используем info
                self.logger.info(message)
    
    def set_template(self, template_text: str) -> bool:
        """
        Установка шаблона сообщения
        
        Args:
            template_text (str): Текст шаблона
            
        Returns:
            bool: True в случае успешной установки
        """
        if not template_text:
            self._log('error', "Пустой шаблон сообщения")
            return False
        
        self.template = template_text
        
        # Анализ переменных в шаблоне
        variables = self.var_pattern.findall(template_text)
        if variables:
            self._log('info', f"Шаблон установлен. Найдены переменные: {', '.join(variables)}")
        else:
            self._log('info', "Шаблон установлен без персонализации (нет переменных)")
        
        return True
    
    def get_template(self) -> str:
        """
        Получение текущего шаблона
        
        Returns:
            str: Текст шаблона
        """
        return self.template
    
    def get_template_variables(self) -> list:
        """
        Получение списка переменных из текущего шаблона
        
        Returns:
            list: Список имен переменных
        """
        if not self.template:
            return []
        
        return list(set(self.var_pattern.findall(self.template)))
    
    def load_from_file(self, file_path: str) -> bool:
        """
        Загрузка шаблона из файла
        
        Args:
            file_path (str): Путь к файлу шаблона
            
        Returns:
            bool: True в случае успешной загрузки, иначе False
        """
        if not os.path.isfile(file_path):
            self._log('error', f"Файл шаблона не найден: {file_path}")
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                template_text = f.read()
                return self.set_template(template_text)
                
        except Exception as e:
            self._log('error', f"Ошибка загрузки шаблона из файла: {str(e)}")
            return False
    
    def save_to_file(self, file_path: str) -> bool:
        """
        Сохранение шаблона в файл
        
        Args:
            file_path (str): Путь для сохранения шаблона
            
        Returns:
            bool: True в случае успешного сохранения, иначе False
        """
        if not self.template:
            self._log('error', "Нет шаблона для сохранения")
            return False
        
        try:
            # Создаем директорию, если не существует
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(self.template)
            
            self._log('info', f"Шаблон успешно сохранен в файл: {file_path}")
            return True
            
        except Exception as e:
            self._log('error', f"Ошибка сохранения шаблона в файл: {str(e)}")
            return False
    
    def _get_nested_value(self, data: Dict[str, Any], key: str) -> Any:
        """
        Получение вложенных значений из словаря по указанному пути (например, "user.name")
        
        Args:
            data (Dict[str, Any]): Словарь с данными
            key (str): Ключ или путь к значению
            
        Returns:
            Any: Значение или None, если не найдено
        """
        parts = key.split('.')
        current = data
        
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        
        return current
    
    def _process_special_variables(self, variable: str) -> Optional[str]:
        """
        Обработка специальных переменных, таких как дата, время и т.д.
        
        Args:
            variable (str): Имя переменной
            
        Returns:
            Optional[str]: Значение переменной или None, если переменная не специальная
        """
        now = datetime.now()
        
        # Дата и время
        if variable == 'date':
            return now.strftime(self.date_format)
        elif variable == 'time':
            return now.strftime(self.time_format)
        elif variable == 'datetime':
            return now.strftime(f"{self.date_format} {self.time_format}")
        elif variable == 'year':
            return str(now.year)
        elif variable == 'month':
            return str(now.month)
        elif variable == 'day':
            return str(now.day)
        elif variable == 'hour':
            return str(now.hour)
        elif variable == 'minute':
            return str(now.minute)
        
        # Не специальная переменная
        return None
    
    def render(self, context: Dict[str, Any] = None) -> str:
        """
        Рендеринг персонализированного сообщения на основе шаблона и контекста
        
        Args:
            context (Dict[str, Any], optional): Контекст с данными для подстановки. По умолчанию None.
            
        Returns:
            str: Персонализированный текст сообщения
        """
        if not self.template:
            self._log('error', "Шаблон не установлен")
            return ""
        
        # Если контекст не предоставлен, используем пустой словарь
        if context is None:
            context = {}
        
        # Копия шаблона для подстановки
        result = self.template
        
        # Поиск и замена переменных
        for match in self.var_pattern.finditer(self.template):
            var_name = match.group(1)
            placeholder = match.group(0)  # Полное совпадение {{ var }}
            
            # Проверка на специальную переменную
            special_value = self._process_special_variables(var_name)
            if special_value is not None:
                # Замена специальной переменной
                result = result.replace(placeholder, special_value)
                continue
            
            # Поиск значения в контексте
            value = self._get_nested_value(context, var_name)
            
            if value is not None:
                # Преобразование в строку, если не строка
                value_str = str(value)
                
                # Замена переменной значением
                result = result.replace(placeholder, value_str)
            else:
                # Если значение не найдено, оставляем плейсхолдер
                self._log('warning', f"Переменная '{var_name}' не найдена в контексте")
        
        return result
    
    def create_template_example(self) -> str:
        """
        Создание примера шаблона с основными переменными
        
        Returns:
            str: Пример шаблона
        """
        example = """Здравствуйте, {{ name }}!

Напоминаем Вам о {{ event }} от {{ date }}.

С уважением,
{{ company }}
{{ phone }}"""
        
        return example
    
    def render_template_preview(self, context: Dict[str, Any] = None) -> str:
        """
        Создание предварительного просмотра шаблона с примерными данными
        
        Args:
            context (Dict[str, Any], optional): Дополнительный контекст. По умолчанию None.
            
        Returns:
            str: Предварительный просмотр текста сообщения
        """
        if not self.template:
            return "Шаблон не установлен"
        
        # Создаем контекст с примерными данными
        preview_context = {
            'name': 'Иван Иванов',
            'company': 'ООО "Компания"',
            'phone': '+7 (999) 123-45-67',
            'event': 'важное событие',
            'product': 'Наш Продукт',
            'price': '1000 руб.',
            'discount': '20%',
            'promocode': 'WELCOME2023',
            'link': 'https://example.com'
        }
        
        # Добавляем пользовательский контекст, если предоставлен
        if context:
            preview_context.update(context)
        
        # Рендерим шаблон
        return self.render(preview_context)


# Для тестирования
if __name__ == "__main__":
    import logging
    
    # Настройка логгера
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger('template_test')
    
    # Создание шаблонизатора
    template = MessageTemplate(logger)
    
    # Установка примера шаблона
    template_text = """Здравствуйте, {{ name }}!

Напоминаем Вам о нашем предложении {{ product }} со скидкой {{ discount }} до {{ date }}.
Ваш персональный промокод: {{ promocode }}

С уважением,
{{ company }}
{{ phone }}"""
    
    template.set_template(template_text)
    
    # Просмотр переменных в шаблоне
    logger.info(f"Переменные в шаблоне: {template.get_template_variables()}")
    
    # Тестовый контекст
    context = {
        'name': 'Иван',
        'product': 'Премиум-пакет',
        'discount': '25%',
        'promocode': 'IVAN25',
        'company': 'ООО "Наша Компания"',
        'phone': '+7 (916) 123-45-67'
    }
    
    # Рендеринг сообщения
    message = template.render(context)
    logger.info(f"Результат:\n{message}")
