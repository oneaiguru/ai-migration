# 

#  "Где креды менять ?"

** В файле `/opt/qb-integration/.env` на вашем сервере.

------

##  ТОЧНЫЕ КОМАНДЫ 

### 1. Подключитесь к серверу:

```bash
ssh roman@pve.atocomm.eu -p2323
# Пароль: $SSH_PASS
```

### 2. Откройте файл конфигурации:

```bash
nano /opt/qb-integration/.env
```

### 3. Измените эти строки на production креды:

```bash
# ИЗМЕНИТЕ ЭТИ 3 СТРОКИ:
QB_CLIENT_ID=YOUR_QB_CLIENT_ID          # ← Сюда ваш production Client ID
QB_CLIENT_SECRET=YOUR_QB_CLIENT_SECRET  # ← Сюда ваш production Client Secret  
QB_ENVIRONMENT=sandbox                  # ← Измените на: production
```

### 4. Сохраните файл:

```bash
# В nano: Ctrl+X → Y → Enter
```

### 5. Запустите полный сервер (не simple-server!):

```bash
cd /opt/qb-integration
node src/server.js
```

------

## 📋 ПОЛУЧЕНИЕ PRODUCTION КРЕДОВ

### В QuickBooks Developer Portal:

1. Откройте приложение **"Middleware"** (не SF Integration)

2. Завершите Compliance (EULA/Privacy URLs)

3. Получите approval

4. Скопируйте 

   Production Keys

   :

   - Client ID
   - Client Secret

------

## ✅ ПРОВЕРКА

После изменения `.env` и запуска `node src/server.js`:

```bash
# Проверьте что API работает:
curl https://sqint.atocomm.eu/api/health
```

**ВАЖНО:** Используйте `node src/server.js` (полное приложение), а не `simple-server.js` (тестовый заглушка)!

------

##  ИТОГО

**ФАЙЛ:** `/opt/qb-integration/.env`
 **ПОЛЯ:** `QB_CLIENT_ID`, `QB_CLIENT_SECRET`, `QB_ENVIRONMENT`
 **ЗАПУСК:** `node src/server.js`

