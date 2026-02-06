#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - модуль отправки iMessage
Версия: 1.0.0
Автор: Михаил
"""

import os
import sqlite3
import time
import tempfile
import subprocess
import uuid
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime


class iMessageSender:
    """Класс для отправки iMessage сообщений через Messages.app на macOS"""
    
    def __init__(self, logger=None, use_applescript=True):
        """
        Инициализация отправщика iMessage
        
        Args:
            logger: Объект логгера для записи событий
            use_applescript (bool): Использовать AppleScript для отправки (True) или SQLite API (False)
        """
        self.logger = logger
        self.use_applescript = use_applescript
        self.media_files = []
        
        # Префикс для временных файлов
        self.temp_prefix = "imessage_sender_"
        
        # Пути к базе данных сообщений и скрипту AppleScript
        self.chat_db_path = os.path.expanduser("~/Library/Messages/chat.db")
        self.script_path = self._create_send_script()

        # SQLite API пока не реализован — мягко откатываемся на AppleScript
        if not self.use_applescript:
            self._log('warning', "Режим SQLite API еще не реализован, переключение на AppleScript")
            self.use_applescript = True
        
        # Проверка наличия базы данных сообщений
        if not self.use_applescript and not os.path.exists(self.chat_db_path):
            self._log('warning', f"База данных сообщений не найдена: {self.chat_db_path}")
            self._log('info', "Переключение на использование AppleScript")
            self.use_applescript = True
    
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
    
    def _create_send_script(self) -> str:
        """
        Создание временного файла с AppleScript для отправки сообщений
        
        Returns:
            str: Путь к созданному файлу скрипта
        """
        # Создаем временный файл для скрипта
        fd, script_path = tempfile.mkstemp(suffix='.scpt', prefix=self.temp_prefix)
        os.close(fd)
        
        # AppleScript для отправки сообщения с поддержкой вложений
        script_content = '''on run argv
    if (count of argv) < 2 then
        error "Target phone and message text are required"
    end if
    
    set targetPhone to item 1 of argv
    set messageText to item 2 of argv
    set hasAttachment to (count of argv) >= 3
    
    if hasAttachment then
        set attachmentPath to item 3 of argv
    end if
    
    tell application "Messages"
        -- Получаем сервис iMessage
        set targetService to 1st service whose service type = iMessage
        
        -- Определяем получателя
        set targetBuddy to buddy targetPhone of targetService
        
        -- Отправляем сообщение
        send messageText to targetBuddy
        
        -- Прикрепляем вложение отдельно, если оно передано
        if hasAttachment then
            set theAttachment to POSIX file attachmentPath
            send theAttachment to targetBuddy
        end if
    end tell
end run'''
        
        # Записываем скрипт в файл
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
            
        self._log('debug', f"Создан файл скрипта для отправки сообщений: {script_path}")
        return script_path
    
    def _escape_message(self, message: str) -> str:
        """
        Экранирование специальных символов в сообщении для AppleScript
        
        Args:
            message (str): Исходное сообщение
            
        Returns:
            str: Экранированное сообщение
        """
        # Важно сначала экранировать обратные слеши, потом кавычки
        return message.replace('\\', '\\\\').replace('"', '\\"')
    
    def _execute_applescript(self, script_args: List[str]) -> Tuple[bool, Optional[str]]:
        """
        Выполнение AppleScript с указанными аргументами
        
        Args:
            script_args (List[str]): Список аргументов для скрипта
            
        Returns:
            Tuple[bool, Optional[str]]: Успешность выполнения и вывод скрипта (или ошибка)
        """
        # Формируем команду для запуска osascript
        cmd = ["osascript", self.script_path] + script_args
        
        # Запуск команды
        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ожидание завершения процесса
            stdout, stderr = process.communicate()
            
            # Проверка результата
            if process.returncode == 0:
                return True, stdout.strip()
            else:
                return False, stderr.strip()
            
        except Exception as e:
            self._log('error', f"Ошибка выполнения AppleScript: {str(e)}")
            return False, str(e)
    
    def send(self, phone: str, message: str) -> bool:
        """
        Отправка сообщения на указанный номер телефона
        
        Args:
            phone (str): Номер телефона получателя
            message (str): Текст сообщения
            
        Returns:
            bool: True в случае успешной отправки, иначе False
        """
        # Отправка через AppleScript
        if self.use_applescript:
            if not self.media_files:
                # Обычное сообщение без вложений
                success, output = self._execute_applescript([phone, message])
            else:
                # Сообщение с вложением (пока поддерживается только одно вложение)
                success, output = self._execute_applescript([phone, message, self.media_files[0]])
                
            if success:
                self._log('info', f"Сообщение успешно отправлено на {phone}")
            else:
                self._log('error', f"Ошибка отправки сообщения на {phone}: {output}")
            
            return success
        else:
            # SQLite API не готов — переключаемся на AppleScript и пробуем снова
            self._log('warning', "Режим SQLite API еще не реализован, используется AppleScript")
            self.use_applescript = True
            return self.send(phone, message)
    
    def check_status(self, message_id: str) -> Dict[str, Any]:
        """
        Проверка статуса отправленного сообщения
        
        Args:
            message_id (str): Идентификатор сообщения
            
        Returns:
            Dict[str, Any]: Статус сообщения (delivered, read, error)
        """
        # Пока реализации нет
        self._log('warning', "Функция проверки статуса сообщения не реализована")
        return {'status': 'unknown'}
    
    def add_media(self, media_path: str) -> bool:
        """
        Добавление медиафайла к сообщению
        
        Args:
            media_path (str): Путь к медиафайлу
            
        Returns:
            bool: True в случае успешного добавления, иначе False
        """
        if not os.path.exists(media_path):
            self._log('error', f"Медиафайл не найден: {media_path}")
            return False
        
        # Проверка типа файла
        _, ext = os.path.splitext(media_path)
        ext = ext.lower()
        
        # Список поддерживаемых расширений
        supported_extensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp',  # Изображения
            '.mp4', '.mov', '.m4v',                    # Видео
            '.pdf', '.doc', '.docx', '.txt',           # Документы
            '.mp3', '.m4a', '.wav',                    # Аудио
        ]
        
        if ext not in supported_extensions:
            self._log('warning', f"Неподдерживаемый тип медиафайла: {ext}")
            return False
        
        # Добавление файла в список
        self.media_files.append(os.path.abspath(media_path))
        self._log('info', f"Медиафайл добавлен: {media_path}")
        
        return True
    
    def clear_media(self) -> None:
        """Очистка списка медиафайлов"""
        self.media_files = []
        self._log('info', "Список медиафайлов очищен")
    
    def get_account_info(self) -> Dict[str, Any]:
        """
        Получение информации о текущем аккаунте iMessage
        
        Returns:
            Dict[str, Any]: Информация об аккаунте или пустой словарь в случае ошибки
        """
        try:
            # AppleScript для получения информации о аккаунте
            script = '''
            tell application "Messages"
                set accountInfo to {}
                repeat with i from 1 to count of services
                    set thisService to service i
                    if service type of thisService is iMessage then
                        set end of accountInfo to {name:name of thisService, status:status of thisService, enabled:enabled of thisService}
                    end if
                end repeat
                return accountInfo
            end tell
            '''
            
            # Выполнение скрипта
            process = subprocess.Popen(
                ["osascript", "-e", script],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate()
            
            if process.returncode == 0 and stdout.strip():
                # Парсинг результата (формат может отличаться)
                result = {}
                for line in stdout.strip().split(', '):
                    key_value = line.split(':')
                    if len(key_value) == 2:
                        key, value = key_value
                        result[key.strip()] = value.strip()
                
                return result
            else:
                self._log('error', f"Ошибка получения информации о аккаунте: {stderr}")
                return {}
        
        except Exception as e:
            self._log('error', f"Ошибка при выполнении скрипта: {str(e)}")
            return {}
    
    def is_phone_registered(self, phone: str) -> bool:
        """
        Проверка, зарегистрирован ли номер телефона в iMessage
        
        Args:
            phone (str): Номер телефона для проверки
            
        Returns:
            bool: True если номер зарегистрирован в iMessage, иначе False
        """
        try:
            # AppleScript для проверки регистрации в iMessage
            script = f'''
            tell application "Messages"
                set targetService to 1st service whose service type = iMessage
                set targetBuddy to buddy "{phone}" of targetService
                return enabled of targetBuddy
            end tell
            '''
            
            # Выполнение скрипта
            process = subprocess.Popen(
                ["osascript", "-e", script],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate()
            
            # Если нет ошибок и результат "true", то телефон зарегистрирован
            if process.returncode == 0 and stdout.strip().lower() == "true":
                self._log('info', f"Номер {phone} зарегистрирован в iMessage")
                return True
            else:
                self._log('info', f"Номер {phone} не зарегистрирован в iMessage или ошибка проверки")
                return False
        
        except Exception as e:
            self._log('error', f"Ошибка проверки регистрации номера: {str(e)}")
            return False
    
    def cleanup(self) -> None:
        """Очистка временных файлов и ресурсов"""
        # Удаление временного файла скрипта
        if os.path.exists(self.script_path):
            try:
                os.remove(self.script_path)
                self._log('debug', f"Удален временный файл скрипта: {self.script_path}")
            except Exception as e:
                self._log('warning', f"Не удалось удалить временный файл: {str(e)}")
        
        # Очистка списка медиафайлов
        self.clear_media()


# Для тестирования
if __name__ == "__main__":
    import logging
    
    # Настройка логгера
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger('imessage_sender_test')
    
    # Создание отправщика
    sender = iMessageSender(logger)
    
    # Получение информации о аккаунте
    account_info = sender.get_account_info()
    logger.info(f"Информация о аккаунте: {account_info}")
    
    # Тестовый телефон (заменить на реальный для проверки)
    test_phone = "+79161234567"
    
    # Проверка регистрации
    is_registered = sender.is_phone_registered(test_phone)
    logger.info(f"Номер {test_phone} зарегистрирован в iMessage: {is_registered}")
    
    # Отправка тестового сообщения (закомментировано)
    # sender.send(test_phone, "Это тестовое сообщение от iMessageSender.")
    
    # Очистка ресурсов
    sender.cleanup()
