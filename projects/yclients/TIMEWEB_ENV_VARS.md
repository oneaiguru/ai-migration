# TimeWeb Environment Variables Reference

**Instructions for Pavel:**
1. Navigate to TimeWeb Dashboard → Your Application → Environment Variables
2. For each variable below, copy the entire value (including the URL/key)
3. Paste into the corresponding field in TimeWeb web UI
4. Click "Save" or "Deploy"

---

## 🔴 CRITICAL - Must Be Updated in TimeWeb

### 1. SUPABASE_URL
```
https://rlcquyttvqclcxeeghtz.supabase.co
```
**Purpose**: Supabase database connection endpoint

**Project ID**: `rlcquyttvqclcxeeghtz`

**Current Status**: ✅ CORRECT

---

### 2. SUPABASE_KEY
```
<SUPABASE_SERVICE_ROLE_KEY>
```
**Purpose**: Supabase service role key for database access (fill with real key in TimeWeb UI)

**Current Status**: ⚠️ UPDATE REQUIRED (set the actual key during deployment)

---

### 3. PARSE_URLS
```
https://b1280372.yclients.com/company/1168982/booking,https://b861100.yclients.com/company/123456/booking
```
**Purpose**: Comma-separated list of YClients booking URLs to parse

**Format**: Multiple URLs separated by commas (no spaces)

**Examples**:
- Single URL: `https://b1280372.yclients.com/company/1168982/booking`
- Multiple URLs: `https://b1280372.yclients.com/company/1168982/booking,https://b861100.yclients.com/company/123456/booking`

**Current Status**: ⚠️ UPDATE REQUIRED - Please provide list of venues to parse

---

## 🟢 OPTIONAL (Already Configured or Defaults Are Fine)

### 4. API_KEY
```
yclients_parser_secure_key_2024
```
**Purpose**: API authentication key for `/data` and `/parse` endpoints

**Default**: `yclients_parser_api_key`

**Current Value in TW**: `yclients_parser_secure_key_2024` ✅

---

### 5. API_HOST
```
0.0.0.0
```
**Purpose**: API server binding address

**Default**: `0.0.0.0` (all interfaces)

**Current Value in TW**: `0.0.0.0` ✅

---

### 6. API_PORT
```
8000
```
**Purpose**: API server port

**Default**: `8000`

**Current Value in TW**: `8000` ✅

---

### 7. PARSE_INTERVAL
```
600
```
**Purpose**: Parsing interval in seconds (10 minutes)

**Default**: `600` (10 minutes)

**Current Value in TW**: `600` ✅

---

## Summary Table

| Variable | Status | Needs Update | Value |
|----------|--------|------|-------|
| SUPABASE_URL | ⚠️ | YES | `https://zojouvfuvdgniqbmbegs.supabase.co` |
| SUPABASE_KEY | ⚠️ | YES | Service role key (see above) |
| PARSE_URLS | ⚠️ | YES | Comma-separated venue URLs |
| API_KEY | ✅ | NO | `yclients_parser_secure_key_2024` |
| API_HOST | ✅ | NO | `0.0.0.0` |
| API_PORT | ✅ | NO | `8000` |
| PARSE_INTERVAL | ✅ | NO | `600` |

---

## 📝 Steps to Deploy

1. **Update SUPABASE_URL** in TimeWeb dashboard
2. **Update SUPABASE_KEY** in TimeWeb dashboard
3. **Update PARSE_URLS** with your venue list
4. **Leave the rest as-is** (API_* and PARSE_INTERVAL already configured)
5. **Click "Перезапустить деплой"** (Restart deployment) in TimeWeb
6. **Monitor logs** for "Запуск непрерывного парсинга" (Starting continuous parsing)

---

## ✅ Verification

After deployment, check logs for:
```
✅ API-сервер запущен на 0.0.0.0:8000
✅ Запуск непрерывного парсинга с интервалом 600 секунд
```

Then every 10 minutes you should see:
```
✅ Парсинг завершен: X записей сохранено
✅ Ожидание 600 секунд до следующей итерации
```

---

## 🔗 Related Documentation

- **TIMEWEB_DEPLOYMENT_GUIDE.md** - Full deployment instructions
- **config/settings.py:98-99** - Supabase configuration (default values)
- **config/settings.py:22** - PARSE_INTERVAL definition
- **src/main.py:37-38** - API_HOST and API_PORT defaults
