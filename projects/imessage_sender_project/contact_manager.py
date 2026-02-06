#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модуль управления контактами
Версия: 1.0.0
Автор: Михаил
"""

import os
import csv
import re
import pandas as pd
from typing import List, Dict, Optional, Union, Any


class ContactManager:
    """Класс для управления контактами и их импорта из различных источников"""
    
    def __init__(self, logger=None):
        """
        Инициализация менеджера контактов
        
        Args:
            logger: Объект логгера для записи событий
        """
        self.logger = logger
        self.contacts = []
        self.phone_pattern = re.compile(r'^\+?[0-9]{10,15}$')
    
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
    
    def clear(self) -> None:
        """Очистка списка контактов"""
        self.contacts = []
        self._log('info', "Список контактов очищен")
    
    def get_contacts(self) -> List[Dict[str, Any]]:
        """
        Получение списка контактов
        
        Returns:
            List[Dict[str, Any]]: Список контактов
        """
        return self.contacts
    
    def get_contact_count(self) -> int:
        """
        Получение количества загруженных контактов
        
        Returns:
            int: Количество контактов
        """
        return len(self.contacts)
    
    def validate_phone(self, phone: str) -> str:
        """
        Валидация и форматирование номера телефона
        
        Args:
            phone (str): Номер телефона для проверки
            
        Returns:
            str: Отформатированный номер телефона или пустая строка, если номер недействителен
        """
        # Удаление всех нецифровых символов, кроме + в начале
        if phone.startswith('+'):
            cleaned = '+' + ''.join(filter(str.isdigit, phone[1:]))
        else:
            cleaned = ''.join(filter(str.isdigit, phone))
        
        # Добавление + для России, если отсутствует 
        # Обработка номеров, начинающихся с 8 (заменяем на +7)
        if not cleaned.startswith('+') and cleaned.startswith('8') and len(cleaned) == 11:
            cleaned = '+7' + cleaned[1:]
        # Обработка номеров, начинающихся с 7
        elif not cleaned.startswith('+') and cleaned.startswith('7') and len(cleaned) == 11:
            cleaned = '+' + cleaned
        
        # Проверка по регулярному выражению
        if self.phone_pattern.match(cleaned):
            return cleaned
        
        self._log('warning', f"Недействительный номер телефона: {phone} -> {cleaned}")
        return ""
    
    def add_contact(self, contact_data: Dict[str, Any]) -> bool:
        """
        Добавление контакта в список
        
        Args:
            contact_data (Dict[str, Any]): Данные контакта
            
        Returns:
            bool: True если контакт успешно добавлен, иначе False
        """
        # Проверка наличия номера телефона
        if 'phone' not in contact_data or not contact_data['phone']:
            self._log('warning', "Попытка добавить контакт без номера телефона")
            return False
        
        # Валидация номера телефона
        phone = self.validate_phone(str(contact_data['phone']))
        if not phone:
            return False
        
        # Обновление номера телефона в данных контакта
        contact_data['phone'] = phone
        
        # Проверка на дубликат
        for contact in self.contacts:
            if contact.get('phone') == phone:
                self._log('warning', f"Дубликат номера телефона: {phone}")
                return False
        
        # Добавление контакта
        self.contacts.append(contact_data)
        return True
    
    def load_from_csv(self, file_path: str) -> int:
        """
        Загрузка контактов из CSV-файла
        
        Args:
            file_path (str): Путь к CSV-файлу
            
        Returns:
            int: Количество успешно загруженных контактов
        """
        if not os.path.isfile(file_path):
            self._log('error', f"Файл не найден: {file_path}")
            return 0
        
        try:
            # Сохраняем текущее количество контактов для подсчета новых
            initial_count = len(self.contacts)
            
            # Считываем образец для определения диалекта и наличия заголовков
            with open(file_path, 'r', encoding='utf-8') as csv_file:
                sample = csv_file.read(2048)
                csv_file.seek(0)
                dialect = csv.Sniffer().sniff(sample)
                has_header = csv.Sniffer().has_header(sample)
                
                # Читаем заголовки (если они есть)
                reader = csv.reader(csv_file, dialect)
                headers = next(reader, None) if has_header else None
                
                # Если заголовков нет, используем стандартные и возвращаемся к началу
                if not headers:
                    headers = ['phone', 'name']
                    csv_file.seek(0)
                    reader = csv.reader(csv_file, dialect)
                
                # Индекс столбца с номером телефона (учитываем BOM)
                clean_headers = [(h or '').lstrip('\ufeff').strip() for h in headers]
                phone_index = -1
                for i, header in enumerate(clean_headers):
                    if header.lower() in ['phone', 'телефон', 'мобильный', 'mobile', 'номер']:
                        phone_index = i
                        break
                
                if phone_index == -1:
                    self._log('error', f"Не удалось определить столбец с номером телефона. Доступные заголовки: {headers}")
                    return 0
                
                # Обработка строк
                for row in reader:
                    # Пропуск пустых строк
                    if not row or len(row) <= phone_index:
                        continue
                    
                    # Подготовка данных контакта
                    contact_data = {'phone': row[phone_index]}
                    
                    # Добавление остальных полей
                    for i, value in enumerate(row):
                        if i != phone_index and i < len(clean_headers):
                            key = clean_headers[i] or f"field_{i}"
                            contact_data[key] = value
                    
                    # Добавление контакта
                    self.add_contact(contact_data)

            # Подсчет новых контактов
            new_contacts = len(self.contacts) - initial_count
            self._log('info', f"Загружено {new_contacts} контактов из CSV-файла: {file_path}")
            return new_contacts
            
        except Exception as e:
            self._log('error', f"Ошибка загрузки контактов из CSV: {str(e)}")
            return 0
    
    def load_from_excel(self, file_path: str) -> int:
        """
        Загрузка контактов из Excel-файла
        
        Args:
            file_path (str): Путь к Excel-файлу
            
        Returns:
            int: Количество успешно загруженных контактов
        """
        if not os.path.isfile(file_path):
            self._log('error', f"Файл не найден: {file_path}")
            return 0
        
        try:
            # Сохраняем текущее количество контактов для подсчета новых
            initial_count = len(self.contacts)
            
            # Чтение Excel-файла как строк, чтобы не потерять формат номеров
            df = pd.read_excel(file_path, dtype=str)
            
            # Поиск столбца с телефоном
            phone_column = None
            for column in df.columns:
                if column.lower() in ['phone', 'телефон', 'мобильный', 'mobile', 'номер']:
                    phone_column = column
                    break
            
            if not phone_column:
                self._log('error', f"Не удалось определить столбец с номером телефона. Доступные столбцы: {df.columns.tolist()}")
                return 0
            
            # Обработка данных
            for _, row in df.iterrows():
                # Подготовка данных контакта
                contact_data = {'phone': str(row[phone_column])}
                
                # Добавление остальных полей
                for column in df.columns:
                    if column != phone_column:
                        contact_data[column] = row[column]
                
                # Добавление контакта
                self.add_contact(contact_data)
            
            # Подсчет новых контактов
            new_contacts = len(self.contacts) - initial_count
            self._log('info', f"Загружено {new_contacts} контактов из Excel-файла: {file_path}")
            return new_contacts
            
        except Exception as e:
            self._log('error', f"Ошибка загрузки контактов из Excel: {str(e)}")
            return 0
    
    def load_from_txt(self, file_path: str) -> int:
        """
        Загрузка контактов из текстового файла (по одному номеру в строке)
        
        Args:
            file_path (str): Путь к текстовому файлу
            
        Returns:
            int: Количество успешно загруженных контактов
        """
        if not os.path.isfile(file_path):
            self._log('error', f"Файл не найден: {file_path}")
            return 0
        
        try:
            # Сохраняем текущее количество контактов для подсчета новых
            initial_count = len(self.contacts)
            
            with open(file_path, 'r', encoding='utf-8') as txt_file:
                for line in txt_file:
                    # Пропуск пустых строк
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Добавление контакта
                    self.add_contact({'phone': line})
            
            # Подсчет новых контактов
            new_contacts = len(self.contacts) - initial_count
            self._log('info', f"Загружено {new_contacts} контактов из текстового файла: {file_path}")
            return new_contacts
            
        except Exception as e:
            self._log('error', f"Ошибка загрузки контактов из TXT: {str(e)}")
            return 0
    
    def load_from_file(self, file_path: str, file_type: Optional[str] = None) -> int:
        """
        Загрузка контактов из файла с автоопределением типа
        
        Args:
            file_path (str): Путь к файлу с контактами
            file_type (str, optional): Тип файла (csv, excel, txt). По умолчанию None (автоопределение).
            
        Returns:
            int: Количество успешно загруженных контактов
        """
        if not os.path.isfile(file_path):
            self._log('error', f"Файл не найден: {file_path}")
            return 0
        
        # Определение типа файла, если не указан явно
        if not file_type:
            _, ext = os.path.splitext(file_path)
            ext = ext.lower()
            
            if ext in ['.csv']:
                file_type = 'csv'
            elif ext in ['.xls', '.xlsx', '.xlsm']:
                file_type = 'excel'
            elif ext in ['.txt']:
                file_type = 'txt'
            else:
                self._log('error', f"Неподдерживаемый тип файла: {ext}")
                return 0
        
        # Загрузка контактов в зависимости от типа файла
        if file_type == 'csv':
            return self.load_from_csv(file_path)
        elif file_type == 'excel':
            return self.load_from_excel(file_path)
        elif file_type == 'txt':
            return self.load_from_txt(file_path)
        else:
            self._log('error', f"Неподдерживаемый тип файла: {file_type}")
            return 0
    
    def export_to_csv(self, file_path: str) -> bool:
        """
        Экспорт контактов в CSV-файл
        
        Args:
            file_path (str): Путь для сохранения CSV-файла
            
        Returns:
            bool: True в случае успешного экспорта, иначе False
        """
        if not self.contacts:
            self._log('warning', "Нет контактов для экспорта")
            return False
        
        try:
            # Создаем директорию, если не существует
            directory = os.path.dirname(file_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            # Определение всех возможных столбцов
            headers = set()
            for contact in self.contacts:
                headers.update(contact.keys())
            
            # Сортировка заголовков (телефон первым)
            headers = sorted(list(headers), key=lambda x: 0 if x == 'phone' else 1)
            
            # Запись в CSV
            with open(file_path, 'w', encoding='utf-8', newline='') as csv_file:
                writer = csv.DictWriter(csv_file, fieldnames=headers)
                writer.writeheader()
                
                for contact in self.contacts:
                    writer.writerow(contact)
            
            self._log('info', f"Экспортировано {len(self.contacts)} контактов в CSV-файл: {file_path}")
            return True
            
        except Exception as e:
            self._log('error', f"Ошибка экспорта контактов в CSV: {str(e)}")
            return False


# Для тестирования
if __name__ == "__main__":
    import logging
    
    # Настройка логгера
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger('contact_manager_test')
    
    # Создание менеджера контактов
    cm = ContactManager(logger)
    
    # Тестовые данные
    test_data = [
        {'phone': '+79161234567', 'name': 'Иван', 'company': 'ООО Тест'},
        {'phone': '89162345678', 'name': 'Мария', 'company': 'ИП Петров'},
        {'phone': '7(916)345-67-89', 'name': 'Петр', 'company': 'ЗАО Инновации'}
    ]
    
    # Добавление контактов
    for contact in test_data:
        cm.add_contact(contact)
    
    # Вывод результатов
    logger.info(f"Добавлено контактов: {cm.get_contact_count()}")
    for contact in cm.get_contacts():
        logger.info(f"Контакт: {contact}")
