#!/bin/bash
# reset_auth.sh - Скрипт для сброса и настройки аутентификации

echo "==================================================="
echo "Сброс и настройка аутентификации middleware"
echo "==================================================="

# Переменные
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"
NGROK_URL="https://3128-166-1-160-232.ngrok-free.app"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для печати секции
print_section() {
  echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Функция для проверки результата операции
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    exit 1
  fi
}

# 1. Остановка сервера, если он запущен
print_section "Остановка сервера"

# Останавливаем middleware если он запущен
if pgrep -f "node $MIDDLEWARE_DIR/src/server.js" > /dev/null; then
  echo "Останавливаем middleware..."
  pkill -f "node $MIDDLEWARE_DIR/src/server.js"
  sleep 2
  check_result "Остановка middleware"
else
  echo "Middleware не запущен"
fi

# 2. Удаление существующих токенов
print_section "Удаление существующих токенов"

if [ -f "$MIDDLEWARE_DIR/tokens.json" ]; then
  echo "Удаляем файл tokens.json..."
  rm "$MIDDLEWARE_DIR/tokens.json"
  check_result "Удаление tokens.json"
else
  echo "Файл tokens.json не найден"
fi

# 3. Создание нового файла tokens.json с минимальной структурой
print_section "Создание базового файла tokens.json"

cat > "$MIDDLEWARE_DIR/tokens.json" << EOF
{
  "salesforce": {},
  "quickbooks": {}
}
EOF
check_result "Создание базового файла tokens.json"

# 4. Обновление .env файла для поддержки sandbox
print_section "Обновление .env файла"

# Проверяем SF_LOGIN_URL в .env файле
grep -q "SF_LOGIN_URL" "$MIDDLEWARE_DIR/.env"
if [ $? -eq 0 ]; then
  # Обновляем URL если уже существует
  sed -i.bak "s|SF_LOGIN_URL=.*|SF_LOGIN_URL=https://test.salesforce.com|g" "$MIDDLEWARE_DIR/.env"
else
  # Добавляем URL если не существует
  echo "SF_LOGIN_URL=https://test.salesforce.com" >> "$MIDDLEWARE_DIR/.env"
fi
check_result "Обновление SF_LOGIN_URL в .env"

# 5. Перезапуск middleware
print_section "Перезапуск middleware"

cd "$MIDDLEWARE_DIR"
npm start > middleware.log 2>&1 &
SERVER_PID=$!
echo "Сервер запущен с PID: $SERVER_PID"
sleep 5

# Проверяем, запустился ли сервер
if ps -p $SERVER_PID > /dev/null; then
  echo "Сервер успешно запущен"
else
  echo "Ошибка запуска сервера. Проверьте middleware.log"
  exit 1
fi
check_result "Запуск middleware"

# 6. Открываем браузер для аутентификации
print_section "Открытие страницы аутентификации"

echo "Открываем страницу аутентификации Salesforce..."
open "$NGROK_URL/auth/salesforce"
sleep 3

echo "Открываем страницу аутентификации QuickBooks..."
open "$NGROK_URL/auth/quickbooks"
sleep 3

check_result "Открытие страниц аутентификации"

# 7. Инструкции
print_section "Инструкции по аутентификации"

echo -e "${GREEN}==================================================="
echo "Для аутентификации:"
echo "==================================================${NC}"
echo ""
echo "1. В открывшемся окне браузера аутентифицируйтесь в Salesforce:"
echo "   - Логин: olga.rybak@atocomm2023.eu.sanboxsf"
echo "   - Разрешите доступ приложения к Salesforce"
echo ""
echo "2. Затем аутентифицируйтесь в QuickBooks:"
echo "   - Войдите в свой аккаунт QuickBooks"
echo "   - Разрешите доступ приложения к QuickBooks"
echo ""
echo "3. Проверьте логи middleware на наличие ошибок:"
echo "   tail -f $MIDDLEWARE_DIR/middleware.log"
echo ""
echo "4. Проверьте файл tokens.json после аутентификации:"
echo "   cat $MIDDLEWARE_DIR/tokens.json"
echo ""
echo -e "${YELLOW}Примечание: После успешной аутентификации, можно переходить к тестированию интеграции.${NC}"
echo ""

# Открываем логи сервера
tail -f "$MIDDLEWARE_DIR/middleware.log"