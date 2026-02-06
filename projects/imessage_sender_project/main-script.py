#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - основной модуль системы
Версия: 1.0.0
Автор: Михаил
"""

import os
import sys
import time
import random
import argparse
from datetime import datetime

# Импорт внутренних модулей
from contact_manager import ContactManager
from message_template import MessageTemplate
from imessage_sender import iMessageSender
from logger import Logger
from config import Config

class iMessageBulkSender:
    """Основной класс для управления рассылкой iMessage"""
    
    def __init__(self, config_path=None):
        """
        Инициализация системы рассылки
        
        Args:
            config_path (str, optional): Путь к файлу конфигурации. По умолчанию None.
        """
        # Инициализация конфигурации
        self.config = Config(config_path)
        
        # Инициализация логгера
        self.logger = Logger(
            log_path=self.config.get('log_path'),
            log_level=self.config.get('log_level'),
            console=self.config.get('console_log', True)
        )
        self.logger.info("Инициализация системы рассылки iMessage")
        
        # Инициализация менеджера контактов
        self.contact_manager = ContactManager(logger=self.logger)
        
        # Инициализация шаблонизатора сообщений
        self.message_template = MessageTemplate(logger=self.logger)
        self._apply_template_formats()
        
        # Инициализация отправщика iMessage
        self.sender = iMessageSender(
            logger=self.logger,
            use_applescript=self.config.get('use_applescript', True)
        )
        
        # Статистика отправки
        self.stats = {
            'total': 0,
            'sent': 0,
            'failed': 0,
            'start_time': None,
            'end_time': None,
        }

    def _apply_template_formats(self):
        """Применяет форматы даты/времени из конфига с валидацией."""
        default_date_format = self.message_template.date_format
        default_time_format = self.message_template.time_format

        raw_date_format = self.config.get('date_format', default_date_format)
        raw_time_format = self.config.get('time_format', default_time_format)

        def _set_format(attr_name, raw_value, fallback):
            value = fallback if raw_value is None else str(raw_value)
            try:
                datetime.now().strftime(value)
                setattr(self.message_template, attr_name, value)
            except Exception:
                self.logger.warning(
                    f"Некорректный формат {attr_name}: {value}, используется значение по умолчанию"
                )
                setattr(self.message_template, attr_name, fallback)

        _set_format('date_format', raw_date_format, default_date_format)
        _set_format('time_format', raw_time_format, default_time_format)
    
    def load_contacts(self, file_path, file_type=None):
        """
        Загрузка контактов из файла
        
        Args:
            file_path (str): Путь к файлу с контактами
            file_type (str, optional): Тип файла (csv, excel, txt). По умолчанию None (автоопределение).
            
        Returns:
            bool: True в случае успешной загрузки, иначе False
        """
        self.logger.info(f"Загрузка контактов из файла: {file_path}")
        try:
            count = self.contact_manager.load_from_file(file_path, file_type)
            self.logger.info(f"Загружено {count} контактов")
            return count > 0
        except Exception as e:
            self.logger.error(f"Ошибка загрузки контактов: {str(e)}")
            return False
    
    def load_template(self, template_path):
        """
        Загрузка шаблона сообщения из файла
        
        Args:
            template_path (str): Путь к файлу шаблона
            
        Returns:
            bool: True в случае успешной загрузки, иначе False
        """
        self.logger.info(f"Загрузка шаблона из файла: {template_path}")
        try:
            result = self.message_template.load_from_file(template_path)
            self.logger.info(f"Шаблон успешно загружен")
            return result
        except Exception as e:
            self.logger.error(f"Ошибка загрузки шаблона: {str(e)}")
            return False
    
    def add_media(self, media_path):
        """
        Добавление медиафайла к сообщению
        
        Args:
            media_path (str): Путь к медиафайлу
            
        Returns:
            bool: True в случае успешного добавления, иначе False
        """
        self.logger.info(f"Добавление медиафайла: {media_path}")
        try:
            result = self.sender.add_media(media_path)
            if result:
                self.logger.info(f"Медиафайл успешно добавлен")
            else:
                self.logger.warning(f"Медиафайл не поддерживается")
            return result
        except Exception as e:
            self.logger.error(f"Ошибка добавления медиафайла: {str(e)}")
            return False
    
    def send_bulk(self, delay_min=None, delay_max=None, limit=None):
        """
        Запуск массовой рассылки сообщений
        
        Args:
            delay_min (float, optional): Минимальная задержка между отправками в секундах
            delay_max (float, optional): Максимальная задержка между отправками в секундах
            limit (int, optional): Ограничение количества отправляемых сообщений
            
        Returns:
            dict: Статистика отправки
        """
        # Установка параметров из конфига, если не указаны явно, с приведением типов и проверкой границ
        default_delay_min = self.config.get('delay_min', 3)
        default_delay_max = self.config.get('delay_max', 7)

        delay_min = default_delay_min if delay_min is None else delay_min
        delay_max = default_delay_max if delay_max is None else delay_max

        try:
            delay_min = float(delay_min)
            delay_max = float(delay_max)
        except (TypeError, ValueError):
            self.logger.warning("Некорректные значения задержек, используются значения по умолчанию")
            delay_min = float(default_delay_min)
            delay_max = float(default_delay_max)

        if delay_min < 0 or delay_max < 0:
            self.logger.warning("Задержки не могут быть отрицательными, отрицательные значения заменены на 0")
            delay_min = max(delay_min, 0.0)
            delay_max = max(delay_max, 0.0)

        if delay_min > delay_max:
            self.logger.warning(
                f"Минимальная задержка ({delay_min}) больше максимальной ({delay_max}), значения поменяны местами"
            )
            delay_min, delay_max = delay_max, delay_min
        
        # Проверка наличия контактов
        contacts = self.contact_manager.get_contacts()
        if not contacts:
            self.logger.error("Нет загруженных контактов для рассылки")
            return self.stats
        
        # Применение лимита, если указан
        if limit and limit > 0:
            contacts = contacts[:limit]
            self.logger.info(f"Установлен лимит рассылки: {limit} контактов")
        
        # Инициализация статистики
        self.stats['total'] = len(contacts)
        self.stats['sent'] = 0
        self.stats['failed'] = 0
        self.stats['start_time'] = datetime.now()
        
        self.logger.info(f"Начало рассылки на {len(contacts)} контактов")
        
        # Выполнение рассылки
        for i, contact in enumerate(contacts, 1):
            phone = contact.get('phone')
            if not phone:
                self.logger.warning(f"Контакт #{i} не имеет номера телефона, пропускаем")
                self.stats['failed'] += 1
                continue
            
            # Применение шаблона для персонализации сообщения
            message = self.message_template.render(contact)
            
            # Отправка сообщения
            self.logger.info(f"Отправка сообщения на номер {phone} ({i}/{len(contacts)})")
            result = self.sender.send(phone, message)
            
            # Обновление статистики
            if result:
                self.stats['sent'] += 1
            else:
                self.stats['failed'] += 1
            
            # Пауза между отправками (кроме последнего сообщения)
            if i < len(contacts):
                delay = random.uniform(delay_min, delay_max)
                self.logger.debug(f"Пауза {delay:.2f} секунд...")
                time.sleep(delay)
        
        # Завершение статистики
        self.stats['end_time'] = datetime.now()
        duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
        
        # Вывод итоговой статистики
        self.logger.info(f"Рассылка завершена за {duration:.1f} сек.")
        self.logger.info(f"Всего: {self.stats['total']}, Отправлено: {self.stats['sent']}, Не отправлено: {self.stats['failed']}")
        
        return self.stats
    
    def generate_report(self, report_path=None):
        """
        Генерация отчета о рассылке
        
        Args:
            report_path (str, optional): Путь для сохранения отчета. По умолчанию None.
            
        Returns:
            str: Путь к сгенерированному отчету или None в случае ошибки
        """
        if not report_path:
            report_path = os.path.join(
                self.config.get('reports_path', 'reports'),
                f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            )
        
        self.logger.info(f"Генерация отчета: {report_path}")
        
        try:
            # Создаем директорию для отчетов, если она не существует
            report_dir = os.path.dirname(report_path)
            if report_dir:
                os.makedirs(report_dir, exist_ok=True)
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(f"Отчет о рассылке iMessage\n")
                f.write(f"{'='*50}\n\n")
                
                # Основная информация
                if self.stats['start_time'] and self.stats['end_time']:
                    f.write(f"Дата и время начала: {self.stats['start_time']}\n")
                    f.write(f"Дата и время окончания: {self.stats['end_time']}\n")
                    duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
                    f.write(f"Длительность: {duration:.1f} секунд\n\n")
                
                # Статистика отправки
                f.write(f"Статистика отправки:\n")
                f.write(f"Всего контактов: {self.stats['total']}\n")
                f.write(f"Успешно отправлено: {self.stats['sent']}\n")
                f.write(f"Не удалось отправить: {self.stats['failed']}\n")
                
                if self.stats['total'] > 0:
                    success_rate = (self.stats['sent'] / self.stats['total']) * 100
                    f.write(f"Процент успешных отправок: {success_rate:.1f}%\n\n")
                
                # Получение подробной информации из логов
                f.write(f"Подробная информация доступна в лог-файле: {self.logger.log_file}\n")
            
            self.logger.info(f"Отчет успешно сгенерирован: {report_path}")
            return report_path
            
        except Exception as e:
            self.logger.error(f"Ошибка генерации отчета: {str(e)}")
            return None

def main():
    """Основная функция для запуска с командной строки"""
    parser = argparse.ArgumentParser(description='Система рассылки iMessage')
    parser.add_argument('-c', '--config', help='Путь к файлу конфигурации')
    parser.add_argument('-f', '--file', required=True, help='Путь к файлу с контактами')
    parser.add_argument('-t', '--template', required=True, help='Путь к файлу шаблона сообщения')
    parser.add_argument('-m', '--media', help='Путь к медиафайлу (изображение, видео)')
    parser.add_argument('--min-delay', type=float, help='Минимальная задержка между отправками в секундах')
    parser.add_argument('--max-delay', type=float, help='Максимальная задержка между отправками в секундах')
    parser.add_argument('-l', '--limit', type=int, help='Ограничение количества отправляемых сообщений')
    parser.add_argument('-r', '--report', help='Путь для сохранения отчета о рассылке')
    
    args = parser.parse_args()
    
    # Инициализация системы рассылки
    bulk_sender = iMessageBulkSender(config_path=args.config)
    
    # Загрузка контактов
    if not bulk_sender.load_contacts(args.file):
        print("Ошибка: Не удалось загрузить контакты. Проверьте файл и формат.")
        return 1
    
    # Загрузка шаблона сообщения
    if not bulk_sender.load_template(args.template):
        print("Ошибка: Не удалось загрузить шаблон сообщения. Проверьте файл.")
        return 1
    
    # Добавление медиафайла, если указан
    if args.media and not bulk_sender.add_media(args.media):
        print("Предупреждение: Не удалось добавить медиафайл. Рассылка будет выполнена без него.")
    
    # Запуск рассылки
    stats = bulk_sender.send_bulk(
        delay_min=args.min_delay,
        delay_max=args.max_delay,
        limit=args.limit
    )
    
    # Генерация отчета
    bulk_sender.generate_report(args.report)
    
    # Вывод итоговой статистики
    print(f"\nРассылка завершена!")
    print(f"Всего контактов: {stats['total']}")
    print(f"Успешно отправлено: {stats['sent']}")
    print(f"Не удалось отправить: {stats['failed']}")
    
    if stats['sent'] == 0 and stats['total'] > 0:
        print("Ошибка: Ни одно сообщение не было отправлено успешно.")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())
