
**Проблема**: QuickBooks выдает ошибку "redirect_uri query parameter value is invalid"

---


### 1️⃣ В QuickBooks Developer Portal:

1. **Зайдите на**: https://developer.intuit.com
2. **Выберите ваше приложение** (должно быть "Middleware" или похожее)
3. **Перейдите в "Keys & OAuth"** или вкладка "Keys"
4. **В секции "Redirect URIs" ДОБАВЬТЕ этот ТОЧНЫЙ URL**:
   ```
   https://sqint.atocomm.eu/auth/quickbooks/callback
   ```
   ⚠️ **ВАЖНО**: URL должен быть ТОЧНО такой, включая https:// и /callback

5. **Сохраните изменения** (Save)
6. **Подождите 2-3 минуты** пока изменения применятся
7. **Попробуйте снова**: https://sqint.atocomm.eu/auth/quickbooks

---

### 2️⃣ В Salesforce (если тоже не работает):

1. **Войдите**: https://customer-inspiration-2543.my.salesforce.com
   - Login: olga.rybak@atocomm2023.eu
   - Password: 0mj3DqPv28Dp2

2. **Перейдите**: Setup → Apps → App Manager

3. **Найдите Connected App** или создайте новый

4. **Edit → OAuth Settings → Callback URL добавьте**:
   ```
   https://sqint.atocomm.eu/auth/salesforce/callback
   ```

5. **Save**

---

##  ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ:

### Проверьте в QuickBooks Developer:
- Приложение должно быть в **Production** режиме (не Sandbox)
- Если Sandbox, нужно создать новое Production приложение

### Создание нового Production приложения:
1. Create App → Choose "Production"
2. Получите новые Client ID и Secret
3. Обновите на сервере:
   ```bash
   ssh roman@pve.atocomm.eu -p2323
   cd /opt/qb-integration
   nano .env
   # Измените QB_CLIENT_ID и QB_CLIENT_SECRET
   # Перезапустите сервер:
   pkill -f node
   sudo node src/server.js
   ```

---

##  ПРОВЕРКА ЧТО ВСЕ ПРАВИЛЬНО:

После добавления Redirect URIs:

1. **QuickBooks OAuth**: https://sqint.atocomm.eu/auth/quickbooks
   - Должен открыться QuickBooks login

2. **Salesforce OAuth**: https://sqint.atocomm.eu/auth/salesforce  
   - Должен открыться Salesforce login

---

## 📞 КОРОТКАЯ ИНСТРУКЦИЯ:

**Роман, сделайте только это:**

1. QuickBooks Developer → Keys → Redirect URIs → Добавьте:
   ```
   https://sqint.atocomm.eu/auth/quickbooks/callback
   ```

2. Подождите 2-3 минуты

3. Попробуйте снова авторизоваться

**Сервер работает правильно. Проблема только в настройках Redirect URI в QuickBooks.**

---

## ⚠️ ЧАСТЫЕ ОШИБКИ:

- ❌ http:// вместо https://
- ❌ Забыли /callback в конце
- ❌ Лишний / в конце
- ❌ Пробелы в URL

✅ **ПРАВИЛЬНО**: `https://sqint.atocomm.eu/auth/quickbooks/callback`

---

**После исправления OAuth заработает и интеграция будет полностью функциональна!**