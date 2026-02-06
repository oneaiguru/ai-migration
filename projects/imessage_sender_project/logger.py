#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модуль логирования
Версия: 1.0.0
Автор: Михаил
"""

import os
import sys
import logging
import json
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Dict, Any, Optional, List, Union


class Logger:
    """Класс для логирования событий и формирования отчетов"""
    
    # Соответствие строковых уровней логирования числовым
    LEVELS = {
        'debug': logging.DEBUG,
        'info': logging.INFO,
        'warning': logging.WARNING,
        'error': logging.ERROR,
        'critical': logging.CRITICAL
    }
    
    def __init__(self, log_path=None, log_level='info', console=True, max_size=10*1024*1024, backup_count=5):
        """
        Инициализация логгера
        
        Args:
            log_path (str, optional): Путь к файлу лога или директории. По умолчанию None.
            log_level (str, optional): Уровень логирования ('debug', 'info', 'warning', 'error', 'critical'). 
                                      По умолчанию 'info'.
            console (bool, optional): Выводить ли сообщения в консоль. По умолчанию True.
            max_size (int, optional): Максимальный размер файла лога в байтах. По умолчанию 10MB.
            backup_count (int, optional): Количество файлов ротации. По умолчанию 5.
        """
        # Определение пути к файлу лога
        if log_path:
            log_path = os.path.expanduser(log_path)
            # Если указана директория, создаем файл лога внутри неё
            if os.path.isdir(log_path):
                os.makedirs(log_path, exist_ok=True)
                self.log_file = os.path.join(log_path, f"imessage_sender_{datetime.now().strftime('%Y%m%d')}.log")
            else:
                _, ext = os.path.splitext(log_path)
                if ext:
                    parent_dir = os.path.dirname(log_path)
                    if parent_dir:
                        os.makedirs(parent_dir, exist_ok=True)
                    self.log_file = log_path
                else:
                    os.makedirs(log_path, exist_ok=True)
                    self.log_file = os.path.join(log_path, f"imessage_sender_{datetime.now().strftime('%Y%m%d')}.log")
        else:
            # По умолчанию создаем файл лога в директории logs
            log_dir = 'logs'
            os.makedirs(log_dir, exist_ok=True)
            self.log_file = os.path.join(log_dir, f"imessage_sender_{datetime.now().strftime('%Y%m%d')}.log")
        
        # Преобразование строкового уровня логирования в числовой
        numeric_level = self.LEVELS.get(log_level.lower(), logging.INFO)
        
        # Создание логгера
        self.logger = logging.getLogger('imessage_sender')
        self.logger.setLevel(numeric_level)
        
        # Очистка существующих обработчиков
        self.logger.handlers = []
        
        # Формат сообщений
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
        
        # Обработчик для файла с ротацией
        file_handler = RotatingFileHandler(
            self.log_file, 
            maxBytes=max_size, 
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        # Обработчик для консоли, если включено
        if console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(numeric_level)
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
        
        # Журнал сообщений для формирования отчетов
        self.message_log = []
        
        # Логирование начала сессии
        self.logger.info(f"{'='*50}")
        self.logger.info(f"Старт сессии логирования iMessage рассылки")
        self.logger.info(f"Файл лога: {self.log_file}")
        self.logger.info(f"Уровень логирования: {log_level}")
        self.logger.info(f"{'='*50}")
    
    def _log_message(self, level: str, message: str) -> None:
        """
        Запись сообщения в лог и сохранение в журнале
        
        Args:
            level (str): Уровень логирования
            message (str): Сообщение для записи
        """
        # Запись в логгер
        log_method = getattr(self.logger, level)
        log_method(message)
        
        # Сохранение в журнал сообщений
        self.message_log.append({
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message
        })
    
    def debug(self, message: str) -> None:
        """
        Запись отладочного сообщения
        
        Args:
            message (str): Сообщение для записи
        """
        self._log_message('debug', message)
    
    def info(self, message: str) -> None:
        """
        Запись информационного сообщения
        
        Args:
            message (str): Сообщение для записи
        """
        self._log_message('info', message)
    
    def warning(self, message: str) -> None:
        """
        Запись предупреждения
        
        Args:
            message (str): Сообщение для записи
        """
        self._log_message('warning', message)
    
    def error(self, message: str) -> None:
        """
        Запись сообщения об ошибке
        
        Args:
            message (str): Сообщение для записи
        """
        self._log_message('error', message)
    
    def critical(self, message: str) -> None:
        """
        Запись критического сообщения
        
        Args:
            message (str): Сообщение для записи
        """
        self._log_message('critical', message)
    
    def log_event(self, event_type: str, details: Dict[str, Any] = None) -> None:
        """
        Запись структурированного события
        
        Args:
            event_type (str): Тип события
            details (Dict[str, Any], optional): Детали события. По умолчанию None.
        """
        if details is None:
            details = {}
        
        event_data = {
            'event_type': event_type,
            'timestamp': datetime.now().isoformat(),
            **details
        }
        
        # Преобразование в JSON-строку
        event_json = json.dumps(event_data, ensure_ascii=False)
        
        # Логирование события
        self.info(f"EVENT: {event_json}")
    
    def log_message_sent(self, phone: str, message: str, status: str, details: Dict[str, Any] = None) -> None:
        """
        Запись события отправки сообщения
        
        Args:
            phone (str): Номер телефона получателя
            message (str): Текст сообщения (может быть сокращен)
            status (str): Статус отправки ('success', 'error')
            details (Dict[str, Any], optional): Дополнительные детали. По умолчанию None.
        """
        if details is None:
            details = {}
        
        # Сокращение текста сообщения для лога
        max_message_length = 100
        short_message = message if len(message) <= max_message_length else message[:max_message_length] + "..."
        
        # Подготовка деталей события
        event_details = {
            'phone': phone,
            'message': short_message,
            'status': status,
            **details
        }
        
        # Запись события
        self.log_event('message_sent', event_details)
    
    def get_log_entries(self, level: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Получение записей из журнала сообщений с возможностью фильтрации
        
        Args:
            level (str, optional): Уровень логирования для фильтрации. По умолчанию None (все уровни).
            limit (int, optional): Ограничение количества записей. По умолчанию None (все записи).
            
        Returns:
            List[Dict[str, Any]]: Отфильтрованные записи журнала
        """
        # Фильтрация по уровню
        if level:
            filtered_log = [entry for entry in self.message_log if entry['level'] == level]
        else:
            filtered_log = self.message_log
        
        # Применение ограничения количества
        if limit is not None and limit > 0:
            filtered_log = filtered_log[-limit:]
        
        return filtered_log
    
    def export_log(self, output_path: str, format_type: str = 'txt') -> bool:
        """
        Экспорт журнала сообщений в файл
        
        Args:
            output_path (str): Путь для сохранения файла
            format_type (str, optional): Формат файла ('txt', 'json', 'csv'). По умолчанию 'txt'.
            
        Returns:
            bool: True в случае успешного экспорта, иначе False
        """
        try:
            # Создаем директорию, если не существует
            directory = os.path.dirname(output_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            # Экспорт в зависимости от формата
            if format_type.lower() == 'json':
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(self.message_log, f, ensure_ascii=False, indent=2)
            
            elif format_type.lower() == 'csv':
                import csv
                with open(output_path, 'w', encoding='utf-8', newline='') as f:
                    writer = csv.writer(f)
                    # Запись заголовков
                    writer.writerow(['timestamp', 'level', 'message'])
                    # Запись данных
                    for entry in self.message_log:
                        writer.writerow([entry['timestamp'], entry['level'], entry['message']])
            
            else:  # txt по умолчанию
                with open(output_path, 'w', encoding='utf-8') as f:
                    for entry in self.message_log:
                        f.write(f"{entry['timestamp']} [{entry['level'].upper()}] {entry['message']}\n")
            
            self.info(f"Журнал успешно экспортирован в {output_path}")
            return True
            
        except Exception as e:
            self.error(f"Ошибка экспорта журнала: {str(e)}")
            return False
    
    def generate_report(self, output_path: Optional[str] = None, format_type: str = 'txt') -> Optional[str]:
        """
        Генерация отчета на основе журнала сообщений
        
        Args:
            output_path (str, optional): Путь для сохранения отчета. По умолчанию None (автогенерация).
            format_type (str, optional): Формат отчета ('txt', 'json', 'html'). По умолчанию 'txt'.
            
        Returns:
            Optional[str]: Путь к сгенерированному отчету или None в случае ошибки
        """
        # Если путь не указан, генерируем автоматически
        if not output_path:
            # Определение директории для отчетов
            report_dir = 'reports'
            os.makedirs(report_dir, exist_ok=True)
            
            # Генерация имени файла
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = os.path.join(report_dir, f"report_{timestamp}.{format_type}")
        else:
            directory = os.path.dirname(output_path)
            if directory:
                os.makedirs(directory, exist_ok=True)
        
        try:
            # Подсчет статистики
            total = len(self.message_log)
            
            level_counts = {}
            for level in self.LEVELS.keys():
                level_counts[level] = len([e for e in self.message_log if e['level'] == level])
            
            # События отправки сообщений
            sent_events = [e for e in self.message_log if 'EVENT: ' in e['message'] and '"event_type": "message_sent"' in e['message']]
            
            # Экспорт в зависимости от формата
            if format_type.lower() == 'json':
                report_data = {
                    'generated_at': datetime.now().isoformat(),
                    'log_file': self.log_file,
                    'statistics': {
                        'total_entries': total,
                        'by_level': level_counts,
                        'sent_messages': len(sent_events)
                    },
                    'entries': self.message_log
                }
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(report_data, f, ensure_ascii=False, indent=2)
            
            elif format_type.lower() == 'html':
                # Простой HTML-шаблон для отчета
                html_template = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Отчет о рассылке iMessage</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .stats { margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
        .log-entry { border-bottom: 1px solid #eee; padding: 5px 0; }
        .log-entry.debug { color: #6c757d; }
        .log-entry.info { color: #0d6efd; }
        .log-entry.warning { color: #ffc107; }
        .log-entry.error { color: #dc3545; }
        .log-entry.critical { color: #721c24; background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>Отчет о рассылке iMessage</h1>
    <p>Сгенерирован: {generated_at}</p>
    <p>Файл лога: {log_file}</p>
    
    <div class="stats">
        <h2>Статистика</h2>
        <p>Всего записей: {total}</p>
        <p>По уровням:</p>
        <ul>
            {level_stats}
        </ul>
        <p>Отправлено сообщений: {sent_count}</p>
    </div>
    
    <h2>Журнал событий</h2>
    {log_entries}
</body>
</html>"""
                
                # Подготовка данных для шаблона
                level_stats = "".join([f"<li>{level}: {count}</li>" for level, count in level_counts.items() if count > 0])
                
                log_entries = ""
                for entry in self.message_log:
                    log_entries += f'<div class="log-entry {entry["level"]}">{entry["timestamp"]} [{entry["level"].upper()}] {entry["message"]}</div>\n'
                
                # Заполнение шаблона
                html_content = html_template.format(
                    generated_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    log_file=self.log_file,
                    total=total,
                    level_stats=level_stats,
                    sent_count=len(sent_events),
                    log_entries=log_entries
                )
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
            
            else:  # txt по умолчанию
                with open(output_path, 'w', encoding='utf-8') as f:
                    # Заголовок отчета
                    f.write(f"ОТЧЕТ О РАССЫЛКЕ iMESSAGE\n")
                    f.write(f"{'='*50}\n\n")
                    
                    f.write(f"Дата и время генерации: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Файл лога: {self.log_file}\n\n")
                    
                    # Статистика
                    f.write(f"СТАТИСТИКА\n")
                    f.write(f"{'-'*50}\n")
                    f.write(f"Всего записей: {total}\n")
                    
                    f.write(f"По уровням:\n")
                    for level, count in level_counts.items():
                        if count > 0:
                            f.write(f"  {level}: {count}\n")
                    
                    f.write(f"Отправлено сообщений: {len(sent_events)}\n\n")
                    
                    # Журнал сообщений
                    f.write(f"ЖУРНАЛ СОБЫТИЙ\n")
                    f.write(f"{'-'*50}\n")
                    
                    for entry in self.message_log:
                        f.write(f"{entry['timestamp']} [{entry['level'].upper()}] {entry['message']}\n")
            
            self.info(f"Отчет успешно сгенерирован: {output_path}")
            return output_path
            
        except Exception as e:
            self.error(f"Ошибка генерации отчета: {str(e)}")
            return None


# Для тестирования
if __name__ == "__main__":
    # Создание логгера
    logger = Logger(log_level='debug')
    
    # Тестовые сообщения
    logger.debug("Это отладочное сообщение")
    logger.info("Это информационное сообщение")
    logger.warning("Это предупреждение")
    logger.error("Это сообщение об ошибке")
    
    # Структурированное событие
    logger.log_event("test_event", {
        'source': 'test',
        'value': 123,
        'status': 'ok'
    })
    
    # Событие отправки сообщения
    logger.log_message_sent(
        phone="+79161234567",
        message="Привет! Это тестовое сообщение для проверки логирования.",
        status="success",
        details={
            'message_id': 'msg123',
            'delivery_status': 'delivered'
        }
    )
    
    # Генерация отчетов в разных форматах
    logger.generate_report(format_type='txt')
    logger.generate_report(format_type='json')
    logger.generate_report(format_type='html')
    
    print(f"Логи сохранены в файл: {logger.log_file}")
