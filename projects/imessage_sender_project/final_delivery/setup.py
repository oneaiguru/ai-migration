#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
iMessage рассылка - скрипт установки
Версия: 1.0.0
Автор: Михаил
"""

import os
import sys
import subprocess
import argparse
import shutil
from pathlib import Path

# Основные директории
APP_NAME = "imessage_sender"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INSTALL_DIR = os.path.expanduser(f"~/Applications/{APP_NAME}")
DEFAULT_DATA_DIR = os.path.expanduser(f"~/.{APP_NAME}")


def create_directory(path):
    """Создание директории, если она не существует"""
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except Exception as e:
        print(f"Ошибка создания директории {path}: {str(e)}")
        return False


def check_python_version():
    """Проверка версии Python"""
    required_version = (3, 7)
    current_version = sys.version_info
    
    if current_version < required_version:
        print(f"Ошибка: требуется Python {required_version[0]}.{required_version[1]} или выше")
        print(f"Текущая версия: {current_version[0]}.{current_version[1]}.{current_version[2]}")
        return False
    
    print(f"Python {current_version[0]}.{current_version[1]}.{current_version[2]} OK")
    return True


def check_system():
    """Проверка системы на совместимость"""
    # Проверка, что система macOS
    if sys.platform != 'darwin':
        print(f"Ошибка: приложение поддерживается только на macOS")
        print(f"Текущая система: {sys.platform}")
        return False
    
    # Проверка наличия Messages.app
    messages_path = "/Applications/Messages.app"
    if not os.path.exists(messages_path):
        print(f"Предупреждение: не найдено приложение Messages.app в {messages_path}")
        print("Для работы рассылки требуется установленное приложение Messages")
        return False
    
    print("Системные проверки пройдены")
    return True


def install_dependencies():
    """Установка зависимостей из файла requirements.txt"""
    requirements_path = os.path.join(CURRENT_DIR, "requirements.txt")
    
    if not os.path.exists(requirements_path):
        print(f"Ошибка: файл requirements.txt не найден в {requirements_path}")
        return False
    
    print("Установка зависимостей...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", requirements_path],
            check=True,
            capture_output=True,
            text=True
        )
        print("Зависимости успешно установлены")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Ошибка установки зависимостей:")
        print(e.stderr)
        return False


def copy_files(source_dir, target_dir, exclude_patterns=None):
    """
    Копирование файлов с исключениями
    
    Args:
        source_dir (str): Исходная директория
        target_dir (str): Целевая директория
        exclude_patterns (list, optional): Шаблоны файлов для исключения
    
    Returns:
        bool: True в случае успешного копирования
    """
    if exclude_patterns is None:
        exclude_patterns = []
    
    try:
        for item in os.listdir(source_dir):
            # Проверка исключений
            if any(pattern in item for pattern in exclude_patterns):
                continue
            
            source_item = os.path.join(source_dir, item)
            target_item = os.path.join(target_dir, item)
            
            if os.path.isdir(source_item):
                # Рекурсивное копирование директории
                os.makedirs(target_item, exist_ok=True)
                copy_files(source_item, target_item, exclude_patterns)
            else:
                # Копирование файла
                shutil.copy2(source_item, target_item)
        
        return True
    except Exception as e:
        print(f"Ошибка копирования файлов: {str(e)}")
        return False


def create_data_directories(data_dir):
    """Создание структуры директорий для данных"""
    directories = [
        "logs",        # Логи
        "templates",   # Шаблоны сообщений
        "contacts",    # Файлы с контактами
        "reports",     # Отчеты
        "media"        # Медиафайлы
    ]
    
    for directory in directories:
        dir_path = os.path.join(data_dir, directory)
        create_directory(dir_path)
        print(f"Создана директория: {dir_path}")
    
    return True


def create_sample_files(data_dir):
    """Создание примеров файлов для работы"""
    # Пример шаблона сообщения
    template_path = os.path.join(data_dir, "templates", "sample_template.txt")
    with open(template_path, "w", encoding="utf-8") as f:
        f.write("""Здравствуйте, {{ name }}!

Напоминаем Вам о {{ event }} от {{ date }}.

С уважением,
{{ company }}
{{ phone }}""")
    print(f"Создан пример шаблона: {template_path}")
    
    # Пример файла с контактами
    contacts_path = os.path.join(data_dir, "contacts", "sample_contacts.csv")
    with open(contacts_path, "w", encoding="utf-8") as f:
        f.write("phone,name,company,event\n")
        f.write("+79161234567,Иван Иванов,ООО Компания,важном событии\n")
        f.write("+79162345678,Мария Петрова,ИП Сидоров,встрече\n")
        f.write("+79163456789,Петр Николаев,ЗАО Инновации,презентации\n")
    print(f"Создан пример файла с контактами: {contacts_path}")
    
    # Пример конфигурации
    config_path = os.path.join(data_dir, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        f.write("""{
  "log_path": "logs",
  "templates_path": "templates",
  "reports_path": "reports",
  "delay_min": 3.0,
  "delay_max": 7.0,
  "batch_size": 50,
  "use_applescript": true,
  "log_level": "info",
  "console_log": true,
  "date_format": "%d.%m.%Y",
  "time_format": "%H:%M"
}""")
    print(f"Создан пример файла конфигурации: {config_path}")
    
    return True


def create_desktop_shortcut(install_dir, app_name=APP_NAME):
    """Создание ярлыка на рабочем столе"""
    desktop_path = os.path.expanduser("~/Desktop")
    shortcut_path = os.path.join(desktop_path, f"{app_name}.command")
    
    with open(shortcut_path, "w") as f:
        f.write(f"""#!/bin/bash
cd "{install_dir}"
python3 gui.py
""")
    
    # Установка прав на исполнение
    os.chmod(shortcut_path, 0o755)
    
    print(f"Создан ярлык на рабочем столе: {shortcut_path}")
    return True


def create_launch_script(install_dir, data_dir, app_name=APP_NAME):
    """Создание скрипта запуска"""
    script_path = os.path.join(install_dir, f"start_{app_name}.command")
    
    with open(script_path, "w") as f:
        f.write(f"""#!/bin/bash
cd "{install_dir}"
export PYTHONPATH="{install_dir}"
export DATA_DIR="{data_dir}"
python3 gui.py
""")
    
    # Установка прав на исполнение
    os.chmod(script_path, 0o755)
    
    print(f"Создан скрипт запуска: {script_path}")
    return True


def main():
    """Основная функция установки"""
    parser = argparse.ArgumentParser(description='Установка системы рассылки iMessage')
    parser.add_argument('--install-dir', default=DEFAULT_INSTALL_DIR, help='Директория для установки приложения')
    parser.add_argument('--data-dir', default=DEFAULT_DATA_DIR, help='Директория для данных приложения')
    parser.add_argument('--no-dependencies', action='store_true', help='Пропустить установку зависимостей')
    parser.add_argument('--no-desktop-shortcut', action='store_true', help='Не создавать ярлык на рабочем столе')
    
    args = parser.parse_args()
    
    install_dir = args.install_dir
    data_dir = args.data_dir
    
    print("=" * 50)
    print(f"Установка системы рассылки iMessage")
    print("=" * 50)
    print(f"Директория установки: {install_dir}")
    print(f"Директория данных: {data_dir}")
    print("-" * 50)
    
    # Проверка системы и версии Python
    if not check_python_version() or not check_system():
        sys.exit(1)
    
    # Создание директорий
    print("Создание директорий...")
    if not create_directory(install_dir) or not create_directory(data_dir):
        sys.exit(1)
    
    # Установка зависимостей
    if not args.no_dependencies:
        if not install_dependencies():
            sys.exit(1)
    else:
        print("Установка зависимостей пропущена")
    
    # Копирование файлов
    print("Копирование файлов приложения...")
    exclude_patterns = [
        "__pycache__", 
        ".git", 
        ".vscode", 
        ".idea", 
        "setup.py", 
        "tests"
    ]
    if not copy_files(CURRENT_DIR, install_dir, exclude_patterns):
        sys.exit(1)
    
    # Создание структуры директорий для данных
    print("Создание структуры директорий для данных...")
    if not create_data_directories(data_dir):
        sys.exit(1)
    
    # Создание примеров файлов
    print("Создание примеров файлов...")
    if not create_sample_files(data_dir):
        sys.exit(1)
    
    # Создание скрипта запуска
    print("Создание скрипта запуска...")
    if not create_launch_script(install_dir, data_dir):
        sys.exit(1)
    
    # Создание ярлыка на рабочем столе
    if not args.no_desktop_shortcut:
        print("Создание ярлыка на рабочем столе...")
        if not create_desktop_shortcut(install_dir):
            print("Предупреждение: не удалось создать ярлык на рабочем столе")
    
    print("=" * 50)
    print(f"Установка успешно завершена!")
    print(f"Для запуска приложения используйте скрипт:")
    print(f"  {os.path.join(install_dir, f'start_{APP_NAME}.command')}")
    print("=" * 50)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
