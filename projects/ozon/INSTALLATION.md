# Инструкция по установке и использованию бота для резервирования товаров Озон

## Оглавление

1. [Системные требования](#системные-требования)
2. [Установка](#установка)
   - [Установка на Windows](#установка-на-windows)
   - [Установка на macOS и Linux](#установка-на-macos-и-linux)
3. [Настройка](#настройка)
   - [Конфигурация](#конфигурация)
   - [Настройка Telegram-уведомлений](#настройка-telegram-уведомлений)
4. [Использование](#использование)
   - [Запуск демо-режима](#запуск-демо-режима)
   - [Запуск полной версии](#запуск-полной-версии)
   - [Запуск в режиме планировщика](#запуск-в-режиме-планировщика)
5. [Планирование заданий](#планирование-заданий)
   - [Windows](#планирование-заданий-на-windows)
   - [macOS и Linux](#планирование-заданий-на-macos-и-linux)
6. [Установка на сервере](#установка-на-сервере)
   - [Selectel Windows Server](#установка-на-selectel-windows-server)
7. [Устранение неполадок](#устранение-неполадок)

## Системные требования

- **Python 3.8** или выше
- **Chrome / Chromium** браузер
- **Доступ в интернет**
- **Учетная запись Озон** с сохраненными платежными данными

## Установка

### Установка на Windows

1. Скачайте файл `windows-install-updated.txt` и переименуйте его в `install.bat`
2. Запустите `install.bat` от имени администратора
3. Следуйте инструкциям установщика
4. После установки будет создана директория `C:\OzonBot` с необходимыми файлами и ярлыками на рабочем столе

### Установка на macOS и Linux

1. Создайте рабочую директорию:
   ```bash
   mkdir -p ~/ozon-bot
   cd ~/ozon-bot
   ```

2. Установите необходимые пакеты:
   ```bash
   pip install selenium webdriver-manager schedule python-telegram-bot
   ```

3. Скопируйте файлы бота в рабочую директорию:
   ```bash
   cp /path/to/ozon_bot_updated.py ~/ozon-bot/
   cp /path/to/ozon_bot_demo.py ~/ozon-bot/
   cp /path/to/config-updated.json ~/ozon-bot/config.json
   cp /path/to/run_bot.sh ~/ozon-bot/
   cp /path/to/run_demo.sh ~/ozon-bot/
   ```

4. Создайте директорию для скриншотов:
   ```bash
   mkdir -p ~/ozon-bot/screenshots
   ```

5. Сделайте скрипты исполняемыми:
   ```bash
   chmod +x ~/ozon-bot/run_bot.sh
   chmod +x ~/ozon-bot/run_demo.sh
   ```

## Настройка

### Конфигурация

Отредактируйте файл `config.json` и укажите следующие параметры:

```json
{
    "login": "ваш_логин@почта.ru",
    "password": "ваш_пароль",
    "headless": false,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
    "sku_list": [
        "1760282452",
        "1750193957",
        "709868368",
        "1908331943"
    ],
    "payment_method": "Банковская карта",
    "telegram_token": "",
    "telegram_chat_id": "",
    "schedule": {
        "enabled": true,
        "daily": [
            "15:00"
        ],
        "run_duration_hours": 7
    }
}
```

Параметры конфигурации:
- `login` - логин от аккаунта Озон (email или телефон)
- `password` - пароль от аккаунта Озон
- `headless` - режим работы браузера (true - без интерфейса, false - с видимым интерфейсом)
- `user_agent` - используемый User-Agent для браузера
- `sku_list` - список SKU товаров для резервирования
- `payment_method` - метод оплаты (Банковская карта, Юмани, и т.д.)
- `telegram_token` - токен Telegram-бота для отправки уведомлений
- `telegram_chat_id` - ID чата для отправки уведомлений
- `schedule` - настройки планировщика:
  - `enabled` - включение/выключение планировщика
  - `daily` - список времен для ежедневного запуска
  - `run_duration_hours` - продолжительность работы бота в часах при запуске по расписанию

### Настройка Telegram-уведомлений

Для получения уведомлений о статусе резервирования в Telegram:

1. Создайте нового бота через [BotFather](https://t.me/BotFather)
2. Получите токен бота и укажите его в параметре `telegram_token`
3. Напишите своему боту любое сообщение
4. Получите ID чата, выполнив запрос:
   ```
   https://api.telegram.org/bot<ваш_токен>/getUpdates
   ```
5. Укажите полученный chat_id в параметре `telegram_chat_id`

## Использование

### Запуск демо-режима

Демо-режим позволяет проверить работу бота без оформления реальных заказов.

**Windows:**
1. Откройте терминал в директории `C:\OzonBot`
2. Запустите команду:
   ```bash
   python ozon_bot_demo.py
   ```

**macOS и Linux:**
1. В терминале перейдите в директорию бота:
   ```bash
   cd ~/ozon-bot
   ```
2. Запустите скрипт демо-режима:
   ```bash
   ./run_demo.sh
   ```

### Запуск полной версии

**Windows:**
1. Откройте терминал в директории `C:\OzonBot`
2. Запустите команду:
   ```bash
   python ozon_bot_updated.py run
   ```

**macOS и Linux:**
1. В терминале перейдите в директорию бота:
   ```bash
   cd ~/ozon-bot
   ```
2. Запустите скрипт полной версии:
   ```bash
   ./run_bot.sh
   ```

### Запуск в режиме планировщика

Этот режим позволяет боту работать по расписанию, указанному в конфигурации.

**Windows:**
1. Создайте задачу в Планировщике заданий, которая запускает `python ozon_bot_updated.py` в каталоге `C:\OzonBot` (см. инструкции ниже)

**macOS и Linux:**
1. В терминале перейдите в директорию бота:
   ```bash
   cd ~/ozon-bot
   ```
2. Запустите бота в режиме планировщика:
   ```bash
   python ozon_bot_updated.py
   ```

## Планирование заданий

### Планирование заданий на Windows

1. Откройте "Планировщик заданий" (Task Scheduler) и нажмите "Создать задачу..." (Create Task...).
2. На вкладке "Общие" (General) введите:
   - Имя (Name): OzonBot
   - Выберите опцию "Выполнять независимо от пользовательского входа" (Run whether user is logged on or not)
   - Выберите опцию "Выполнять с наивысшими привилегиями" (Run with highest privileges)
3. На вкладке "Триггеры" (Triggers) нажмите "Создать..." (New...):
   - Начало задачи (Begin the task): По расписанию (On a schedule)
   - Ежедневно (Daily)
   - Начать в (Start): 15:00:00
4. На вкладке "Действия" (Actions) нажмите "Создать..." (New...):
   - Действие (Action): Запустить программу (Start a program)
   - Программа или сценарий (Program/script): путь к `python.exe` (например `C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Python\\Python310\\python.exe`)
   - Аргументы: `C:\\OzonBot\\ozon_bot_updated.py`
   - Рабочая папка: `C:\\OzonBot`
5. Сохраните задачу и убедитесь, что указан нужный пользователь и расписание.

### Планирование заданий на macOS и Linux

**Использование cron (Linux):**

1. Откройте crontab для редактирования:
   ```bash
   crontab -e
   ```
2. Добавьте строку для запуска бота в 15:00 каждый день:
   ```
   0 15 * * * cd ~/ozon-bot && python ozon_bot_updated.py
   ```

**Использование launchd (macOS):**

1. Создайте файл `com.user.ozonbot.plist` в директории `~/Library/LaunchAgents/`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.user.ozonbot</string>
       <key>Program</key>
       <string>/usr/bin/python3</string>
       <key>ProgramArguments</key>
       <array>
           <string>/usr/bin/python3</string>
           <string>~/ozon-bot/ozon_bot_updated.py</string>
       </array>
       <key>WorkingDirectory</key>
       <string>~/ozon-bot</string>
       <key>StartCalendarInterval</key>
       <dict>
           <key>Hour</key>
           <integer>15</integer>
           <key>Minute</key>
           <integer>0</integer>
       </dict>
   </dict>
   </plist>
   ```

2. Загрузите задачу:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.user.ozonbot.plist
   ```

## Установка на сервере

### Установка на Selectel Windows Server

1. Подключитесь к серверу через RDP
2. Скачайте файл `windows-install-updated.txt` и переименуйте его в `install.bat`
3. Запустите `install.bat` от имени администратора
4. Следуйте инструкциям установщика
5. Проверьте, что сервер настроен на автозапуск задачи в планировщике заданий

Более детальную инструкцию по установке на Selectel Windows Server см. в файле `windows-install-updated.txt` (переименуйте в `install.bat` перед запуском).

## Устранение неполадок

1. **Бот не запускается:**
   - Проверьте правильность установки Python и необходимых библиотек
   - Убедитесь, что Chrome/Chromium установлен в системе
   - Проверьте журнал ошибок в файле `ozon_bot.log`

2. **Не удается авторизоваться:**
   - Проверьте правильность логина и пароля в файле `config.json`
   - Убедитесь, что ваш аккаунт Озон не требует двухфакторной аутентификации
   - Попробуйте войти в аккаунт вручную, чтобы убедиться в его работоспособности

3. **Не удается добавить товары в корзину:**
   - Проверьте правильность указанных SKU в файле `config.json`
   - Убедитесь, что товары доступны для заказа

4. **Не работают Telegram-уведомления:**
   - Проверьте правильность указанного токена и ID чата
   - Убедитесь, что вы отправили боту хотя бы одно сообщение перед использованием

5. **Ошибки при работе браузера:**
   - При запущенном в режиме headless=false, проверьте ошибки на экране
   - Проверьте журнал ошибок и скриншоты в директории `screenshots`
