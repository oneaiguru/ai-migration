# SanghaDesk - Complete Product Specification
## Community Inbox for Spiritual Teachers

---

# 1. PRODUCT DEFINITION

## Product Name
**SanghaDesk** (Sangha = spiritual community in Sanskrit)

## One-Line Pitch
"One inbox for all your student conversations — so you can focus on teaching, not managing messages."

## Target Customer Persona
**Primary**: Art of Living teachers (30,000+ globally)
- Age: 35-65
- Tech comfort: Low to moderate
- Pain: Overwhelmed by student DMs across platforms
- Need: Simple way to manage 1:1 conversations with students
- Language: Russian (Phase 1), then Russian-speaking countries, then English, then global

**Secondary**: Yoga instructors, meditation teachers, spiritual coaches, wellness practitioners

## Core Value Proposition
1. **Never miss a student message** — All Telegram DMs organized in one dashboard
2. **Team collaboration** — Multiple teachers/assistants can respond from one account
3. **Student context at a glance** — See conversation history, notes, tags instantly
4. **Zero technical setup** — Connect Telegram bot in 2 minutes

## Competitor Examples
1. **Intercom** — Too expensive, too complex for individual teachers
2. **Crisp** — Good but not optimized for spiritual community workflows
3. **Tidio** — Website-focused, not Telegram-native

## Differentiator
Built specifically for spiritual teachers managing student relationships via Telegram (dominant in Russia/CIS). Free tier generous enough for most teachers.

---

# 2. FEATURE MATRIX

| Feature | Priority | Complexity | Existing Code? | Phase |
|---------|----------|------------|----------------|-------|
| Telegram DM → Dashboard relay | P0 | Done | ✅ Yes | MVP |
| Dashboard → Student reply | P0 | Done | ✅ Yes | MVP |
| Conversation list view | P0 | Medium | ❌ Build | MVP |
| Individual conversation view | P0 | Medium | ❌ Build | MVP |
| User authentication (mock) | P0 | Low | ❌ Build | MVP |
| Multi-message types (photo/voice/video) | P0 | Done | ✅ Yes | MVP |
| Student profile sidebar | P1 | Medium | ❌ Build | MVP |
| Conversation search | P1 | Medium | ❌ Build | MVP |
| Conversation status (open/archived) | P1 | Low | ✅ Partial | MVP |
| Unread message indicators | P1 | Low | ❌ Build | MVP |
| Quick reply templates | P2 | Medium | ❌ Build | MVP |
| Student tags/labels | P2 | Medium | ❌ Build | MVP |
| Student notes | P2 | Low | ❌ Build | MVP |
| Dashboard analytics | P2 | Medium | ❌ Build | MVP |
| Team members (mock) | P2 | Medium | ❌ Build | MVP |
| Pricing page (mock checkout) | P2 | Low | ❌ Build | MVP |
| Settings page | P2 | Low | ❌ Build | MVP |
| Onboarding flow | P1 | Medium | ❌ Build | MVP |
| Landing page | P1 | Low | ❌ Build | MVP |
| Multi-language (RU/EN) | P1 | Medium | ❌ Build | MVP |
| Canned responses library | P3 | Medium | ❌ Build | V2 |
| Conversation assignment | P3 | Medium | ❌ Build | V2 |
| Webhook integrations | P3 | High | ❌ Build | V2 |
| Mobile responsive | P1 | Medium | ❌ Build | MVP |

---

# 3. USER JOURNEYS

## Journey 1: New Teacher Signup (Cold)

```
Landing Page (/)
    ↓ Click "Начать бесплатно" (Start Free)
Signup Page (/signup)
    ↓ Enter email, password, name
    ↓ Click "Создать аккаунт"
Onboarding Step 1 (/onboarding/connect)
    ↓ See instructions to create Telegram bot via @BotFather
    ↓ Paste bot token
    ↓ Click "Подключить бота"
Onboarding Step 2 (/onboarding/test)
    ↓ See "Send a test message to your bot"
    ↓ User sends DM to their bot from phone
    ↓ Message appears in dashboard (auto-refresh)
    ↓ Click "Готово!" (Done!)
Dashboard (/dashboard)
    ↓ Empty state with helpful tips
    ↓ "Share your bot link with students"
```

## Journey 2: Daily Teacher Workflow

```
Login (/login)
    ↓ Enter email/password
Dashboard (/dashboard)
    ↓ See conversation list (left sidebar)
    ↓ Unread conversations highlighted with badge
    ↓ Click on student "Мария К."
Conversation View (/dashboard?chat=uuid)
    ↓ See full message history (right panel)
    ↓ See student profile (right sidebar)
    ↓ Type reply in composer
    ↓ Click "Отправить" or press Enter
    ↓ Message sent, appears in thread
    ↓ Click another conversation
    ↓ Repeat...
Archive Conversation
    ↓ Click "Архивировать" button
    ↓ Conversation moves to Archived tab
Logout
    ↓ Click avatar → "Выйти"
```

## Journey 3: Upgrade Flow (Mock)

```
Dashboard (/dashboard)
    ↓ See "Free plan: 100 conversations/month"
    ↓ Click "Улучшить план"
Pricing Page (/pricing)
    ↓ See 3 tiers: Free, Pro, Team
    ↓ Click "Выбрать Pro"
Checkout (/checkout?plan=pro)
    ↓ See mock payment form
    ↓ Enter fake card details
    ↓ Click "Оплатить"
Success Page (/checkout/success)
    ↓ "Спасибо! Ваш план активирован."
    ↓ Click "Вернуться в панель"
Dashboard (/dashboard)
    ↓ Plan badge shows "Pro"
```

## Journey 4: Settings Management

```
Dashboard → Click gear icon
Settings (/settings)
    ↓ Tab: Profile (name, email, avatar)
    ↓ Tab: Bot (token, bot username, reconnect)
    ↓ Tab: Team (invite members - mock)
    ↓ Tab: Templates (quick replies)
    ↓ Tab: Billing (current plan, invoices - mock)
```

---

# 4. FULL PAGE-BY-PAGE SPECIFICATION

## PAGE: Landing Page
```
URL: /
PURPOSE: Convert visitors to signups. Communicate value prop clearly.
LANGUAGE: Russian (default), English toggle

COMPONENTS:
- Navbar:
  - Logo "SanghaDesk" (left)
  - Links: "Возможности", "Цены", "Войти" (right)
  - Language toggle: RU | EN
  - CTA button: "Начать бесплатно"

- Hero Section:
  - Headline: "Все сообщения учеников — в одном месте"
  - Subheadline: "Бесплатный инструмент для учителей, которые хотят быть ближе к своим ученикам"
  - CTA: "Начать бесплатно — за 2 минуты"
  - Secondary CTA: "Посмотреть демо"
  - Hero image: Dashboard mockup screenshot

- Social Proof:
  - "Более 500 учителей Art of Living уже используют"
  - 3 avatar circles + "+500"

- Features Section (3 cards):
  - Card 1: Icon + "Все сообщения в одном месте" + description
  - Card 2: Icon + "Отвечайте командой" + description
  - Card 3: Icon + "Никакой настройки" + description

- How It Works (3 steps):
  - Step 1: "Создайте бота в Telegram"
  - Step 2: "Подключите к SanghaDesk"
  - Step 3: "Начните общаться"

- Testimonial:
  - Quote from teacher
  - Name, photo, "Учитель Art of Living, Москва"

- Pricing Preview:
  - "Бесплатно для всех учителей"
  - "Pro для тех, кому нужно больше"
  - Link to /pricing

- Footer:
  - Logo
  - Links: О нас, Поддержка, Конфиденциальность
  - "Сделано с ❤️ для учителей"

STATES:
- Default: Full page render
- Mobile: Hamburger menu, stacked sections

ACTIONS:
- "Начать бесплатно" → /signup
- "Войти" → /login
- "Посмотреть демо" → Scroll to features or open video modal
- Language toggle → Switch all text RU↔EN

API CALLS: None (static page)
```

## PAGE: Signup
```
URL: /signup
PURPOSE: Create new teacher account

COMPONENTS:
- Centered card (max-width 400px)
- Logo at top
- Heading: "Создать аккаунт"
- Form:
  - Input: Имя (required)
  - Input: Email (required, email validation)
  - Input: Пароль (required, min 8 chars)
  - Checkbox: "Согласен с условиями использования"
  - Button: "Создать аккаунт" (primary, full-width)
- Divider: "или"
- Link: "Уже есть аккаунт? Войти"
- Footer: Back to home link

STATES:
- Default: Empty form
- Validating: Button shows spinner
- Error: Red border on invalid fields, error message below
- Success: Redirect to /onboarding/connect

ACTIONS:
- Submit → POST /api/auth/signup
- "Войти" link → /login

API CALLS:
- POST /api/auth/signup
```

## PAGE: Login
```
URL: /login
PURPOSE: Authenticate existing teacher

COMPONENTS:
- Centered card (max-width 400px)
- Logo at top
- Heading: "Войти"
- Form:
  - Input: Email
  - Input: Пароль
  - Link: "Забыли пароль?" (inactive in MVP)
  - Button: "Войти"
- Divider
- Link: "Нет аккаунта? Создать"

STATES:
- Default: Empty form
- Loading: Button spinner
- Error: "Неверный email или пароль"
- Success: Redirect to /dashboard

ACTIONS:
- Submit → POST /api/auth/login
- Create link → /signup

API CALLS:
- POST /api/auth/login
```

## PAGE: Onboarding - Connect Bot
```
URL: /onboarding/connect
PURPOSE: Guide teacher to create and connect Telegram bot

COMPONENTS:
- Progress indicator: Step 1 of 2
- Heading: "Подключите вашего Telegram-бота"
- Instructions card:
  1. "Откройте @BotFather в Telegram"
  2. "Отправьте /newbot"
  3. "Следуйте инструкциям, чтобы создать бота"
  4. "Скопируйте токен бота"
- Input: "Токен бота" (paste field)
- Button: "Подключить"
- Help link: "Нужна помощь? Смотрите видео-инструкцию"

STATES:
- Default: Instructions + empty input
- Validating: Spinner on button
- Error: "Неверный токен" or "Бот уже подключен к другому аккаунту"
- Success: Redirect to /onboarding/test

ACTIONS:
- Submit → POST /api/bot/connect

API CALLS:
- POST /api/bot/connect
```

## PAGE: Onboarding - Test Message
```
URL: /onboarding/test
PURPOSE: Verify bot connection works

COMPONENTS:
- Progress indicator: Step 2 of 2
- Heading: "Отправьте тестовое сообщение"
- Bot info card:
  - Bot username: @YourTeacherBot
  - Link: "Открыть в Telegram" (t.me/YourTeacherBot)
- Instructions: "Отправьте любое сообщение вашему боту"
- Live preview area:
  - Initially: "Ожидание сообщения..." with pulsing dot
  - On message: Show message preview card
- Button: "Готово! Перейти в панель" (disabled until message received)

STATES:
- Waiting: Pulsing animation, button disabled
- Message received: Show preview, enable button
- Timeout (60s): "Сообщение не получено. Попробуйте еще раз."

ACTIONS:
- Poll for messages
- "Готово" → /dashboard

API CALLS:
- GET /api/conversations (poll every 2s)
```

## PAGE: Dashboard (Main App)
```
URL: /dashboard
QUERY: ?chat=<conversation_id> (optional, selects conversation)
PURPOSE: Main workspace - view and respond to all conversations

LAYOUT: Three-column on desktop, responsive on mobile

COMPONENTS:

### Left Sidebar (Conversation List) - 280px
- Search input with icon
- Tabs: "Активные" | "Архив"
- Conversation list (scrollable):
  - Each item shows:
    - Avatar (first letter of name, colored)
    - Name (bold if unread)
    - Last message preview (truncated)
    - Timestamp (relative: "5 мин", "вчера")
    - Unread badge (blue dot)
  - Selected state: highlighted background
- Empty state: "Нет разговоров. Поделитесь ссылкой на бота с учениками!"

### Main Panel (Conversation View) - flex-grow
- Header:
  - Student name
  - Status badge (online/offline - mocked)
  - Actions: Archive button, More menu
- Message thread (scrollable, newest at bottom):
  - Student messages: left-aligned, gray bubble
  - Teacher messages: right-aligned, blue bubble
  - Each message shows:
    - Content (text, image, voice player, etc.)
    - Timestamp
    - Delivery status (sent/delivered - mocked)
  - Date separators: "Сегодня", "Вчера", "15 января"
- Composer (bottom):
  - Text input (multiline, grows)
  - Send button (or Enter to send)
  - Attachment button (future - disabled)
- Empty state (no chat selected): 
  - Illustration
  - "Выберите разговор слева"

### Right Sidebar (Student Profile) - 300px, collapsible
- Student info card:
  - Large avatar
  - Name
  - Username (@username)
  - Telegram ID
  - "С нами с: 15 января 2025"
- Tags section:
  - Tag chips (clickable to filter)
  - "+ Добавить тег"
- Notes section:
  - Textarea for private notes
  - Auto-save indicator
- Quick actions:
  - "Архивировать"
  - "Заблокировать" (marks as blocked)

### Top Navbar (persistent)
- Logo "SanghaDesk"
- Center: Plan badge "Free" or "Pro"
- Right:
  - Bell icon (notifications - future)
  - Settings gear icon
  - User avatar dropdown:
    - "Настройки"
    - "Помощь"
    - "Выйти"

STATES:
- Loading: Skeleton loaders for list and messages
- Empty (no conversations): Helpful empty state with CTA
- Empty (no selection): Prompt to select conversation
- Conversation selected: Full three-panel view
- Error: Toast notification

ACTIONS:
- Click conversation → Load messages, update URL
- Type + Send → POST /api/messages/send
- Archive → POST /api/conversations/:id/archive
- Add tag → POST /api/conversations/:id/tags
- Save notes → PATCH /api/conversations/:id/notes
- Search → Filter conversation list (client-side first, then API)

API CALLS:
- GET /api/conversations (list)
- GET /api/conversations/:id/messages
- POST /api/messages/send
- PATCH /api/conversations/:id
- WebSocket or polling for new messages

REAL-TIME:
- Poll GET /api/conversations every 5s (or WebSocket in production)
- Poll current conversation messages every 3s when active
```

## PAGE: Settings
```
URL: /settings
PURPOSE: Manage account, bot, team, billing

COMPONENTS:
- Left tabs navigation:
  - Профиль
  - Бот
  - Команда
  - Шаблоны
  - Оплата

### Tab: Профиль
- Avatar upload
- Input: Имя
- Input: Email (readonly in MVP)
- Input: Телефон (optional)
- Button: "Сохранить"

### Tab: Бот
- Current bot info:
  - Username: @YourBot
  - Status: Подключен ✓
  - Connected since: date
- Button: "Переподключить бота"
- Danger zone: "Отключить бота"

### Tab: Команда (Mock for MVP)
- Team members list (show current user only)
- Invite input + button (shows "Coming soon" toast)

### Tab: Шаблоны (Quick Replies)
- List of saved templates
- Each: text preview + edit/delete buttons
- "Добавить шаблон" button
- Modal for create/edit:
  - Input: Название (shortcut)
  - Textarea: Текст сообщения
  - Save/Cancel

### Tab: Оплата
- Current plan card: "Free" or "Pro"
- Features included
- "Улучшить план" button → /pricing
- Invoices list (mock): empty or sample entries

STATES:
- Loading: Spinner
- Saving: Button spinner
- Saved: Success toast
- Error: Error toast

API CALLS:
- GET /api/user/profile
- PATCH /api/user/profile
- GET /api/bot/status
- POST /api/bot/reconnect
- GET /api/templates
- POST/PATCH/DELETE /api/templates/:id
```

## PAGE: Pricing
```
URL: /pricing
PURPOSE: Show plans, drive upgrades

COMPONENTS:
- Heading: "Простые и понятные цены"
- Subheading: "Начните бесплатно. Улучшите, когда будете готовы."

- Three pricing cards:

Card 1: FREE
- Price: "0 ₽ / навсегда"
- Features:
  - ✓ До 100 разговоров/месяц
  - ✓ 1 Telegram-бот
  - ✓ Базовые шаблоны
  - ✓ 30 дней истории
- Button: "Текущий план" (disabled if on free) or "Начать бесплатно"

Card 2: PRO (highlighted)
- Badge: "Популярный"
- Price: "990 ₽ / месяц"
- Features:
  - ✓ Безлимитные разговоры
  - ✓ До 3 Telegram-ботов
  - ✓ Неограниченные шаблоны
  - ✓ Вся история сообщений
  - ✓ Приоритетная поддержка
- Button: "Выбрать Pro"

Card 3: TEAM
- Price: "2 990 ₽ / месяц"
- Features:
  - ✓ Всё из Pro
  - ✓ До 5 членов команды
  - ✓ Назначение разговоров
  - ✓ Аналитика команды
  - ✓ API доступ
- Button: "Выбрать Team"

- FAQ section below cards

STATES:
- Default: All cards visible
- Logged in: Current plan highlighted

ACTIONS:
- "Выбрать X" → /checkout?plan=X

API CALLS: None (reads from frontend state)
```

## PAGE: Checkout (Mock)
```
URL: /checkout?plan=pro|team
PURPOSE: Simulate payment flow (100% mocked)

COMPONENTS:
- Left: Order summary
  - Plan name
  - Price
  - Billing period
- Right: Payment form (FAKE)
  - Input: Номер карты (accepts any 16 digits)
  - Input: MM/YY (accepts any)
  - Input: CVV (accepts any 3 digits)
  - Checkbox: "Сохранить карту"
  - Button: "Оплатить 990 ₽"

STATES:
- Default: Form ready
- Processing: 2s fake delay with spinner
- Success: Redirect to /checkout/success
- Error: Never happens (always succeeds)

ACTIONS:
- Submit → Fake 2s delay → Update user plan in DB → Redirect

API CALLS:
- POST /api/billing/checkout (mock - just updates plan)
```

## PAGE: Checkout Success
```
URL: /checkout/success
PURPOSE: Confirm successful "payment"

COMPONENTS:
- Success icon (checkmark)
- Heading: "Оплата прошла успешно!"
- Subheading: "Ваш план Pro активирован"
- Receipt summary (mock)
- Button: "Перейти в панель"

ACTIONS:
- Button → /dashboard

API CALLS: None
```

---

# 5. COMPLETE API SPECIFICATION

## Authentication APIs

### POST /api/auth/signup
```
PURPOSE: Create new user account
REQUEST BODY: {
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, 8-100 chars)"
}
RESPONSE 201: {
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "plan": "free",
    "created_at": "ISO8601"
  },
  "session_token": "string"
}
ERRORS:
  400: { "error": "validation_error", "message": "Invalid email format" }
  409: { "error": "email_exists", "message": "Email already registered" }
MOCK BEHAVIOR: 
  - Always succeeds with valid input
  - Creates user in SQLite
  - Returns mock session token (uuid)
```

### POST /api/auth/login
```
PURPOSE: Authenticate existing user
REQUEST BODY: {
  "email": "string",
  "password": "string"
}
RESPONSE 200: {
  "user": { ... },
  "session_token": "string"
}
ERRORS:
  401: { "error": "invalid_credentials", "message": "Invalid email or password" }
MOCK BEHAVIOR:
  - Check email/password against SQLite
  - Return session token on success
```

### POST /api/auth/logout
```
PURPOSE: End user session
REQUEST HEADERS: Authorization: Bearer <token>
RESPONSE 200: { "success": true }
MOCK BEHAVIOR: Delete session from memory/DB
```

### GET /api/auth/me
```
PURPOSE: Get current user info
REQUEST HEADERS: Authorization: Bearer <token>
RESPONSE 200: {
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "plan": "free|pro|team",
    "bot_connected": true,
    "bot_username": "@TeacherBot",
    "created_at": "ISO8601"
  }
}
ERRORS:
  401: { "error": "unauthorized" }
```

## Bot Connection APIs

### POST /api/bot/connect
```
PURPOSE: Connect Telegram bot to account
REQUEST BODY: {
  "bot_token": "string (Telegram bot token format)"
}
RESPONSE 200: {
  "bot_username": "@TeacherBot",
  "bot_id": 123456789,
  "connected_at": "ISO8601"
}
ERRORS:
  400: { "error": "invalid_token", "message": "Invalid bot token format" }
  409: { "error": "bot_already_connected", "message": "This bot is connected to another account" }
MOCK BEHAVIOR:
  - Validate token format (numbers:alphanumeric)
  - Store in SQLite
  - Return mock bot info
  - Start mock message polling for this bot
```

### GET /api/bot/status
```
PURPOSE: Check bot connection status
RESPONSE 200: {
  "connected": true,
  "bot_username": "@TeacherBot",
  "last_poll": "ISO8601"
}
```

### POST /api/bot/disconnect
```
PURPOSE: Disconnect bot from account
RESPONSE 200: { "success": true }
```

## Conversation APIs

### GET /api/conversations
```
PURPOSE: List all conversations for current user
QUERY PARAMS:
  - status: "open" | "archived" (default: "open")
  - search: "string" (optional, search by name)
  - limit: number (default: 50)
  - offset: number (default: 0)
RESPONSE 200: {
  "conversations": [
    {
      "id": "uuid",
      "participant_user_id": 123456,
      "participant_name": "Мария Козлова",
      "participant_username": "@masha_k",
      "status": "open",
      "unread_count": 3,
      "last_message": {
        "content": "Спасибо за урок!",
        "type": "text",
        "sent_at": "ISO8601",
        "is_from_participant": true
      },
      "tags": ["новичок", "курс-1"],
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "total": 150,
  "has_more": true
}
MOCK BEHAVIOR: Return seeded conversations from SQLite
```

### GET /api/conversations/:id
```
PURPOSE: Get single conversation details
RESPONSE 200: {
  "conversation": {
    "id": "uuid",
    "participant_user_id": 123456,
    "participant_name": "Мария Козлова",
    "participant_username": "@masha_k",
    "status": "open",
    "tags": ["новичок"],
    "notes": "Начала в январе, делает хорошие успехи",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
ERRORS:
  404: { "error": "not_found" }
```

### GET /api/conversations/:id/messages
```
PURPOSE: Get messages in conversation
QUERY PARAMS:
  - limit: number (default: 50)
  - before: "message_id" (for pagination)
RESPONSE 200: {
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "type": "text|photo|voice|video|document|sticker",
      "content": "string (text content or caption)",
      "media_url": "string (for media types, mock URL)",
      "is_from_participant": true,
      "sent_at": "ISO8601",
      "delivered_at": "ISO8601"
    }
  ],
  "has_more": false
}
```

### POST /api/conversations/:id/messages
```
PURPOSE: Send message to participant
REQUEST BODY: {
  "type": "text",
  "content": "string (message text)"
}
RESPONSE 201: {
  "message": {
    "id": "uuid",
    "type": "text",
    "content": "Привет! Как ваша практика?",
    "is_from_participant": false,
    "sent_at": "ISO8601"
  }
}
ERRORS:
  400: { "error": "empty_message" }
  404: { "error": "conversation_not_found" }
MOCK BEHAVIOR:
  - Save message to SQLite
  - In real: would relay to Telegram
  - Return immediately (async delivery)
```

### PATCH /api/conversations/:id
```
PURPOSE: Update conversation (status, tags, notes)
REQUEST BODY: {
  "status": "open|archived|blocked",
  "tags": ["tag1", "tag2"],
  "notes": "string"
}
RESPONSE 200: { "conversation": { ... } }
```

### POST /api/conversations/:id/archive
```
PURPOSE: Archive conversation
RESPONSE 200: { "success": true }
```

### POST /api/conversations/:id/unarchive
```
PURPOSE: Restore archived conversation
RESPONSE 200: { "success": true }
```

## Template APIs

### GET /api/templates
```
RESPONSE 200: {
  "templates": [
    {
      "id": "uuid",
      "shortcut": "welcome",
      "content": "Добро пожаловать! Рад видеть вас...",
      "created_at": "ISO8601"
    }
  ]
}
```

### POST /api/templates
```
REQUEST BODY: {
  "shortcut": "string",
  "content": "string"
}
RESPONSE 201: { "template": { ... } }
```

### PATCH /api/templates/:id
```
REQUEST BODY: { "shortcut": "string", "content": "string" }
RESPONSE 200: { "template": { ... } }
```

### DELETE /api/templates/:id
```
RESPONSE 200: { "success": true }
```

## User/Settings APIs

### GET /api/user/profile
```
RESPONSE 200: {
  "profile": {
    "id": "uuid",
    "name": "Анна Учитель",
    "email": "anna@example.com",
    "phone": "+7 999 123-45-67",
    "avatar_url": null,
    "created_at": "ISO8601"
  }
}
```

### PATCH /api/user/profile
```
REQUEST BODY: {
  "name": "string",
  "phone": "string"
}
RESPONSE 200: { "profile": { ... } }
```

## Billing APIs (All Mocked)

### GET /api/billing/plan
```
RESPONSE 200: {
  "plan": "free|pro|team",
  "conversations_used": 45,
  "conversations_limit": 100,
  "period_end": "ISO8601"
}
```

### POST /api/billing/checkout
```
PURPOSE: Process fake payment
REQUEST BODY: {
  "plan": "pro|team",
  "card_number": "string",
  "expiry": "string",
  "cvv": "string"
}
RESPONSE 200: {
  "success": true,
  "plan": "pro",
  "receipt_id": "mock-receipt-123"
}
MOCK BEHAVIOR:
  - Always succeed after 2s delay
  - Update user plan in SQLite
```

## Analytics API (Simple)

### GET /api/analytics/overview
```
RESPONSE 200: {
  "total_conversations": 156,
  "active_conversations": 23,
  "messages_sent_today": 47,
  "messages_received_today": 89,
  "avg_response_time_minutes": 12
}
```

---

# 6. DATABASE SCHEMA

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  plan_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions table (simple token auth)
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Bot connections table
CREATE TABLE bot_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_token TEXT NOT NULL,
  bot_username TEXT,
  bot_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  connected_at INTEGER NOT NULL,
  last_poll_at INTEGER
);

CREATE UNIQUE INDEX idx_bot_connections_user ON bot_connections(user_id) WHERE is_active = 1;
CREATE UNIQUE INDEX idx_bot_connections_token ON bot_connections(bot_token);

-- Conversations table (extends existing schema)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_connection_id TEXT NOT NULL REFERENCES bot_connections(id),
  participant_user_id INTEGER NOT NULL,
  participant_name TEXT NOT NULL,
  participant_username TEXT,
  topic_thread_id INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived', 'blocked')),
  unread_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT, -- JSON array stored as text
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_conversations_user_status ON conversations(user_id, status);
CREATE UNIQUE INDEX idx_conversations_participant ON conversations(user_id, participant_user_id);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'photo', 'voice', 'video', 'document', 'sticker', 'unknown')),
  content TEXT,
  media_url TEXT,
  is_from_participant INTEGER NOT NULL, -- 1 = from student, 0 = from teacher
  telegram_message_id INTEGER,
  sent_at INTEGER NOT NULL,
  delivered_at INTEGER
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at DESC);

-- Templates table
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shortcut TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_templates_user ON templates(user_id);

-- Relay logs (from existing code)
CREATE TABLE relay_logs (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  direction TEXT NOT NULL CHECK (direction IN ('participant_to_organizers', 'organizers_to_participant')),
  kind TEXT NOT NULL,
  from_chat_id INTEGER NOT NULL,
  from_message_id INTEGER NOT NULL,
  to_chat_id INTEGER,
  to_message_id INTEGER,
  created_at INTEGER NOT NULL,
  ok INTEGER NOT NULL CHECK (ok IN (0, 1)),
  error_code TEXT,
  error_message TEXT
);

-- Analytics (simple daily aggregates)
CREATE TABLE daily_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL, -- YYYY-MM-DD
  conversations_new INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

---

# 7. MOCK DATA STRATEGY

## Seed Data Overview
Create realistic demo data for:
- 3 demo user accounts
- 15+ conversations per user
- 50+ messages across conversations
- Various conversation states
- Multiple message types

## Demo Users

```javascript
const DEMO_USERS = [
  {
    id: "user-demo-001",
    name: "Демо Учитель",
    email: "demo@sanghadesk.ru",
    password: "demo1234", // hash this
    plan: "pro"
  },
  {
    id: "user-demo-002", 
    name: "Анна Тестова",
    email: "anna@test.ru",
    password: "test1234",
    plan: "free"
  },
  {
    id: "user-demo-003",
    name: "Иван Преподаватель",
    email: "ivan@test.ru", 
    password: "test1234",
    plan: "team"
  }
];
```

## Demo Conversations (Russian Names)

```javascript
const DEMO_PARTICIPANTS = [
  { name: "Мария Козлова", username: "masha_k", tags: ["новичок", "курс-1"] },
  { name: "Александр Петров", username: "alex_p", tags: ["продвинутый"] },
  { name: "Елена Сидорова", username: null, tags: ["вопросы"] },
  { name: "Дмитрий Иванов", username: "dima_i", tags: ["курс-2"] },
  { name: "Ольга Смирнова", username: "olga_s", tags: ["новичок"] },
  { name: "Сергей Николаев", username: "sergey_n", tags: [] },
  { name: "Наталья Федорова", username: "natasha_f", tags: ["ретрит"] },
  { name: "Андрей Морозов", username: null, tags: ["курс-1"] },
  { name: "Татьяна Волкова", username: "tanya_v", tags: ["продвинутый", "ретрит"] },
  { name: "Игорь Кузнецов", username: "igor_k", tags: ["новичок"] },
  { name: "Анастасия Новикова", username: "nastya_n", tags: [] },
  { name: "Павел Соколов", username: "pavel_s", tags: ["курс-2"] },
  { name: "Виктория Лебедева", username: "vika_l", tags: ["вопросы"] },
  { name: "Михаил Козлов", username: null, tags: ["новичок"] },
  { name: "Екатерина Попова", username: "katya_p", tags: ["ретрит", "продвинутый"] }
];
```

## Sample Message Threads

```javascript
const SAMPLE_THREADS = [
  // Thread 1: New student asking about course
  {
    participant: "Мария Козлова",
    messages: [
      { from: "participant", text: "Здравствуйте! Подскажите, когда начинается следующий курс?" },
      { from: "teacher", text: "Добрый день, Мария! Следующий курс начинается 15 февраля. Вам интересен базовый или продвинутый уровень?" },
      { from: "participant", text: "Базовый, я только начинаю" },
      { from: "teacher", text: "Отлично! Базовый курс проходит по субботам с 10:00 до 12:00. Стоимость 5000₽ за 4 занятия. Записать вас?" },
      { from: "participant", text: "Да, запишите пожалуйста! Спасибо!" },
      { from: "teacher", text: "Записала! Жду вас 15 февраля в 9:45 по адресу ул. Мира, 15. Напишите, если будут вопросы 🙏" }
    ]
  },
  // Thread 2: Practice question
  {
    participant: "Александр Петров",
    messages: [
      { from: "participant", text: "Добрый вечер! Никак не могу сконцентрироваться на дыхании, мысли постоянно убегают" },
      { from: "teacher", text: "Добрый вечер, Александр! Это абсолютно нормально, особенно в начале практики. Сколько минут вы обычно практикуете?" },
      { from: "participant", text: "Пытаюсь 20 минут, но обычно сдаюсь через 5" },
      { from: "teacher", text: "Попробуйте начать с 5-7 минут и постепенно увеличивать. Когда замечаете, что мысли ушли — просто мягко возвращайте внимание к дыханию. Каждое возвращение — это и есть тренировка." },
      { from: "participant", text: "Понял, попробую так. Спасибо за совет!" }
    ]
  },
  // Thread 3: Photo message example
  {
    participant: "Наталья Федорова",
    messages: [
      { from: "participant", text: "Посмотрите, какой закат сегодня был на ретрите! 🌅", type: "photo" },
      { from: "teacher", text: "Невероятная красота! Природа — лучший учитель присутствия. Как вам ретрит?" },
      { from: "participant", text: "Потрясающе! Столько инсайтов. Обязательно приеду еще" }
    ]
  }
];
```

## Seed Script Pseudocode

```javascript
function seedDatabase() {
  // 1. Create demo users
  for (user of DEMO_USERS) {
    insertUser(user);
    insertBotConnection(user.id, "mock-bot-token-" + user.id);
  }
  
  // 2. For primary demo user, create conversations
  const demoUser = DEMO_USERS[0];
  
  for (let i = 0; i < DEMO_PARTICIPANTS.length; i++) {
    const participant = DEMO_PARTICIPANTS[i];
    const conversationId = createConversation({
      userId: demoUser.id,
      participant: participant,
      status: i < 12 ? 'open' : 'archived',
      unreadCount: i < 3 ? Math.floor(Math.random() * 5) : 0
    });
    
    // Add messages from sample threads or generate
    const threadTemplate = SAMPLE_THREADS[i % SAMPLE_THREADS.length];
    for (msg of threadTemplate.messages) {
      insertMessage(conversationId, msg);
    }
  }
  
  // 3. Create some templates
  insertTemplates(demoUser.id, [
    { shortcut: "welcome", content: "Добро пожаловать! Рада видеть вас на нашем курсе. Если будут вопросы — пишите!" },
    { shortcut: "schedule", content: "Занятия проходят каждую субботу с 10:00 до 12:00 по адресу ул. Мира, 15." },
    { shortcut: "thanks", content: "Благодарю за сообщение! Отвечу в ближайшее время 🙏" }
  ]);
}
```

---

# 8. UI/UX SPECIFICATIONS

## Color Scheme

```css
:root {
  /* Primary - Calming blue */
  --primary-50: #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-500: #3B82F6;
  --primary-600: #2563EB;
  --primary-700: #1D4ED8;
  
  /* Secondary - Warm sage green (spiritual/calm) */
  --secondary-50: #F0FDF4;
  --secondary-500: #22C55E;
  --secondary-600: #16A34A;
  
  /* Neutral */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Accent */
  --accent-orange: #F97316;
  --accent-purple: #8B5CF6;
  
  /* Status */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
}
```

## Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

## Component Specifications

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white;
  @apply px-4 py-2 rounded-lg font-medium;
  @apply transition-colors duration-150;
  @apply focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-white border border-gray-300 text-gray-700;
  @apply hover:bg-gray-50;
  @apply px-4 py-2 rounded-lg font-medium;
}

/* Ghost Button */
.btn-ghost {
  @apply bg-transparent hover:bg-gray-100 text-gray-600;
  @apply px-3 py-2 rounded-lg;
}
```

### Input Fields
```css
.input {
  @apply w-full px-3 py-2 rounded-lg border border-gray-300;
  @apply focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
  @apply placeholder-gray-400 text-gray-900;
}

.input-error {
  @apply border-error focus:ring-error;
}
```

### Cards
```css
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
  @apply p-6;
}

.card-hover {
  @apply hover:shadow-md transition-shadow duration-200;
}
```

### Message Bubbles
```css
/* Student message */
.bubble-student {
  @apply bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md;
  @apply px-4 py-2 max-w-[80%];
}

/* Teacher message */
.bubble-teacher {
  @apply bg-primary-600 text-white rounded-2xl rounded-br-md;
  @apply px-4 py-2 max-w-[80%];
}
```

## Responsive Breakpoints

```css
/* Mobile first */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

## Dashboard Layout Specifics

```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────────────┐
│ Navbar (h-16)                                               │
├────────────┬─────────────────────────────┬──────────────────┤
│ Sidebar    │ Main Content                │ Profile Panel    │
│ (w-80)     │ (flex-1)                    │ (w-80)           │
│            │                             │                  │
│ Conv List  │ Messages                    │ Student Info     │
│            │                             │                  │
│            │                             │                  │
│            ├─────────────────────────────┤                  │
│            │ Composer (h-20)             │                  │
└────────────┴─────────────────────────────┴──────────────────┘

Tablet (768-1023px):
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────────┬────────────────────────────┤
│ Sidebar    │ Main Content               │
│ (w-64)     │ (flex-1)                   │
│            │                            │
│            │ Profile = slide-over panel │
└────────────┴────────────────────────────┘

Mobile (<768px):
┌─────────────────────┐
│ Navbar              │
├─────────────────────┤
│ Full-width view     │
│                     │
│ Toggle: List ↔ Chat │
└─────────────────────┘
```

## Loading States

- **Skeleton loaders**: Gray pulsing rectangles for content areas
- **Button spinners**: Small white spinner replacing text
- **Full page**: Centered logo + spinner
- **Inline**: Small spinner next to action

## Empty States

Each empty state includes:
1. Illustrative icon or image
2. Heading explaining the state
3. Helpful subtext
4. CTA button when applicable

Examples:
- No conversations: "Ваш inbox пуст. Поделитесь ссылкой на бота с учениками!"
- No search results: "Ничего не найдено. Попробуйте другой запрос."
- No messages selected: "Выберите разговор из списка слева"

## Error States

- **Form errors**: Red border + message below field
- **Toast notifications**: Bottom-right, auto-dismiss after 5s
- **Full page errors**: Centered message + retry button
- **Network errors**: Banner at top "Нет соединения. Проверьте интернет."

---

# 9. FILE STRUCTURE

```
/sanghadesk
├── /frontend
│   ├── /public
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── /images
│   │       ├── hero-dashboard.png
│   │       ├── empty-inbox.svg
│   │       └── onboarding-bot.svg
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── /layout
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── /landing
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── Testimonial.tsx
│   │   │   │   └── PricingPreview.tsx
│   │   │   ├── /auth
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── /onboarding
│   │   │   │   ├── ConnectBotStep.tsx
│   │   │   │   ├── TestMessageStep.tsx
│   │   │   │   └── ProgressIndicator.tsx
│   │   │   ├── /dashboard
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   ├── ConversationItem.tsx
│   │   │   │   ├── ConversationSearch.tsx
│   │   │   │   ├── MessageThread.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageComposer.tsx
│   │   │   │   ├── StudentProfile.tsx
│   │   │   │   ├── TagManager.tsx
│   │   │   │   ├── NotesEditor.tsx
│   │   │   │   └── EmptyStates.tsx
│   │   │   ├── /settings
│   │   │   │   ├── ProfileSettings.tsx
│   │   │   │   ├── BotSettings.tsx
│   │   │   │   ├── TeamSettings.tsx
│   │   │   │   ├── TemplateSettings.tsx
│   │   │   │   └── BillingSettings.tsx
│   │   │   └── /pricing
│   │   │       ├── PricingCard.tsx
│   │   │       ├── CheckoutForm.tsx
│   │   │       └── SuccessMessage.tsx
│   │   ├── /pages
│   │   │   ├── index.tsx (Landing)
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── /onboarding
│   │   │   │   ├── connect.tsx
│   │   │   │   └── test.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── /checkout
│   │   │   │   ├── index.tsx
│   │   │   │   └── success.tsx
│   │   │   └── _app.tsx
│   │   ├── /hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useConversations.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── usePolling.ts
│   │   │   └── useToast.ts
│   │   ├── /lib
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── storage.ts
│   │   │   └── utils.ts
│   │   ├── /contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── /types
│   │   │   └── index.ts
│   │   ├── /styles
│   │   │   └── globals.css
│   │   └── /i18n
│   │       ├── ru.json
│   │       └── en.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── /backend
│   ├── /src
│   │   ├── index.ts (entry point)
│   │   ├── app.ts (Express app setup)
│   │   ├── config.ts
│   │   ├── /routes
│   │   │   ├── auth.ts
│   │   │   ├── bot.ts
│   │   │   ├── conversations.ts
│   │   │   ├── messages.ts
│   │   │   ├── templates.ts
│   │   │   ├── user.ts
│   │   │   ├── billing.ts
│   │   │   └── analytics.ts
│   │   ├── /middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── /services
│   │   │   ├── authService.ts
│   │   │   ├── conversationService.ts
│   │   │   ├── messageService.ts
│   │   │   └── telegramService.ts
│   │   ├── /db
│   │   │   ├── sqlite.ts
│   │   │   ├── schema.sql
│   │   │   ├── seed.sql
│   │   │   ├── userRepo.ts
│   │   │   ├── conversationRepo.ts
│   │   │   ├── messageRepo.ts
│   │   │   └── templateRepo.ts
│   │   ├── /telegram
│   │   │   ├── bot.ts (from existing code)
│   │   │   ├── handlers.ts
│   │   │   └── relay.ts (from existing code)
│   │   └── /utils
│   │       ├── logger.ts
│   │       └── helpers.ts
│   ├── tsconfig.json
│   └── package.json
│
├── /shared
│   └── types.ts (from existing code, extended)
│
├── /data
│   └── sanghadesk.sqlite (created at runtime)
│
├── docker-compose.yml
├── .env.example
├── README.md
└── package.json (root, for scripts)
```

---

# 10. IMPLEMENTATION SEQUENCE

## Phase 1: Foundation (2-3 hours)

```
1. Initialize project structure
   - Create all folders
   - Set up root package.json with workspace scripts
   
2. Backend foundation
   - Copy and adapt existing types.ts to shared/
   - Set up Express app with CORS
   - Implement SQLite connection with new schema
   - Create seed.sql with demo data
   
3. Authentication system
   - POST /api/auth/signup
   - POST /api/auth/login
   - GET /api/auth/me
   - Auth middleware
   
4. Frontend foundation
   - Next.js setup with TypeScript
   - Tailwind configuration
   - Global styles with color scheme
   - AuthContext and basic hooks
```

## Phase 2: Core Dashboard (3-4 hours)

```
5. Backend: Conversation APIs
   - GET /api/conversations
   - GET /api/conversations/:id
   - GET /api/conversations/:id/messages
   - PATCH /api/conversations/:id
   
6. Frontend: Auth pages
   - Login page
   - Signup page
   - AuthGuard component
   
7. Frontend: Dashboard layout
   - DashboardLayout component
   - Navbar with user dropdown
   - Left sidebar structure
   
8. Frontend: Conversation list
   - ConversationList component
   - ConversationItem component
   - Search functionality
   - Tabs (Active/Archived)
   
9. Frontend: Message view
   - MessageThread component
   - MessageBubble component
   - Scroll to bottom behavior
   - Date separators
```

## Phase 3: Messaging (2-3 hours)

```
10. Backend: Send message API
    - POST /api/conversations/:id/messages
    - Integrate with existing Telegram relay code
    
11. Frontend: Message composer
    - MessageComposer component
    - Send on Enter
    - Loading state
    
12. Polling system
    - usePolling hook
    - Auto-refresh conversation list
    - Auto-refresh messages in active chat
    
13. Frontend: Student profile sidebar
    - StudentProfile component
    - Tags display and edit
    - Notes editor with auto-save
```

## Phase 4: Onboarding & Bot Connection (2 hours)

```
14. Backend: Bot APIs
    - POST /api/bot/connect
    - GET /api/bot/status
    - Mock bot validation
    
15. Frontend: Onboarding flow
    - ConnectBotStep page
    - TestMessageStep page with polling
    - Progress indicator
    
16. Integrate existing Telegram bot code
    - Adapt handlers_private.ts
    - Connect to dashboard message storage
```

## Phase 5: Landing & Polish (2 hours)

```
17. Landing page
    - Hero section
    - Features section
    - How it works
    - Footer
    
18. Settings pages
    - Profile settings
    - Bot settings
    - Template management
    
19. Pricing & Mock checkout
    - Pricing page with 3 tiers
    - Mock checkout form
    - Success page
```

## Phase 6: I18n & Final Polish (1 hour)

```
20. Internationalization
    - Set up i18n structure
    - Russian translations (primary)
    - English translations
    - Language switcher
    
21. Final polish
    - Empty states
    - Loading skeletons
    - Error handling
    - Responsive testing
```

---

# 11. MOCK PAYMENT FLOW

## Pricing Tiers

| Tier | Price (RU) | Price (EN) | Conversations | Bots | History | Team |
|------|------------|------------|---------------|------|---------|------|
| Free | 0 ₽ | $0 | 100/month | 1 | 30 days | 1 |
| Pro | 990 ₽/мес | $9.90/mo | Unlimited | 3 | Unlimited | 1 |
| Team | 2990 ₽/мес | $29/mo | Unlimited | 10 | Unlimited | 5 |

## Checkout Flow (100% Fake)

1. User clicks "Выбрать Pro" on /pricing
2. Redirect to /checkout?plan=pro
3. Show form with:
   - Plan summary card
   - Fake card input (any 16 digits accepted)
   - Fake expiry (any MM/YY)
   - Fake CVV (any 3 digits)
4. On submit:
   - Show 2-second spinner
   - Call POST /api/billing/checkout
   - Backend updates user.plan in SQLite
   - Redirect to /checkout/success
5. Success page shows:
   - Checkmark animation
   - "Ваш план Pro активирован!"
   - Mock receipt number

## Dashboard Plan Display

- Navbar shows badge: "Free" or "Pro" or "Team"
- Settings > Billing shows:
  - Current plan card
  - Mock "conversations used" counter
  - Upgrade/downgrade buttons

---

# 12. INTEGRATION WITH EXISTING CODE

## Files to Use Directly

```
FROM: tgorgbot/shared/types.ts
TO: sanghadesk/shared/types.ts
ACTION: Copy and extend with new types (User, Session, Template, etc.)

FROM: tgorgbot/backend/src/db/sqlite.ts
TO: sanghadesk/backend/src/db/sqlite.ts
ACTION: Copy directly, update schema path

FROM: tgorgbot/backend/src/logger.ts
TO: sanghadesk/backend/src/utils/logger.ts
ACTION: Copy directly

FROM: tgorgbot/backend/src/telegram/retry.ts
TO: sanghadesk/backend/src/telegram/retry.ts
ACTION: Copy directly
```

## Files to Adapt

```
FROM: tgorgbot/backend/src/db/schema.sql
ACTION: Merge with new schema (users, sessions, templates tables added)

FROM: tgorgbot/backend/src/db/conversations_repo.ts
ACTION: Adapt to include user_id filter, add new queries for dashboard

FROM: tgorgbot/backend/src/db/message_log_repo.ts
ACTION: Adapt to work with messages table instead of relay_logs

FROM: tgorgbot/backend/src/domain/conversations.ts
ACTION: Adapt getOrCreateConversation to use user context

FROM: tgorgbot/backend/src/telegram/handlers_private.ts
ACTION: Integrate with dashboard message storage, add user lookup

FROM: tgorgbot/backend/src/telegram/bot.ts
ACTION: Wrap to support multiple bot instances (one per user)
```

## Files to Ignore

```
- tgorgbot/docker-compose.yml (create new one)
- tgorgbot/backend/Dockerfile (create new one)
- tgorgbot/docs/* (internal docs, not needed)
- tgorgbot/backend/src/telegram/handlers_organizer_group.ts (forum feature not in MVP)
- tgorgbot/backend/src/telegram/handlers_start.ts (replace with dashboard-aware version)
```

## Core Integration Pattern

The existing Telegram relay code becomes the "engine":

```typescript
// In sanghadesk/backend/src/services/telegramService.ts

import { createBot } from '../telegram/bot';
import { ConversationsRepo } from '../db/conversationRepo';
import { MessageRepo } from '../db/messageRepo';

class TelegramService {
  private bots: Map<string, Bot> = new Map();
  
  async connectBot(userId: string, botToken: string) {
    // Validate token format
    // Create bot instance using existing createBot logic
    // Register handlers that write to dashboard DB
    // Store in map for user
  }
  
  async handleIncomingMessage(userId: string, message: TelegramMessage) {
    // Create/get conversation in dashboard DB
    // Store message in messages table
    // Existing relay logic writes to relay_logs
  }
  
  async sendMessage(userId: string, conversationId: string, content: string) {
    // Get bot for user
    // Get conversation
    // Use existing copyMessage or sendMessage from telegram_api.ts
  }
}
```

---

# 13. SINGLE-PROMPT CODING INSTRUCTION

Copy and paste this to your coding agent:

---

**BUILD SANGHADESK - A COMMUNITY INBOX FOR SPIRITUAL TEACHERS**

You are building a complete micro-SaaS called SanghaDesk. It's a Telegram inbox dashboard for teachers (primarily Art of Living teachers in Russia) to manage student conversations.

**CRITICAL CONSTRAINTS:**
- 100% local - no external APIs except structure
- SQLite database (file-based)
- Mock authentication (no OAuth)
- Mock payments (fake Stripe-like UI)
- Single command startup: `npm run dev`
- Tech stack: Next.js frontend + Express backend + TypeScript

**EXISTING CODE:**
I have working Telegram bot relay code in `/tgorgbot`. Key files to integrate:
- `shared/types.ts` - Base types for conversations, messages
- `backend/src/db/*` - SQLite setup and repos
- `backend/src/telegram/*` - Bot handlers and relay logic
- `backend/src/domain/*` - Conversation and message services

**WHAT TO BUILD:**

1. **Auth System** (mock):
   - Signup/login pages
   - Session tokens in SQLite
   - AuthContext in React

2. **Dashboard** (main app):
   - Left: Conversation list with search
   - Center: Message thread view
   - Right: Student profile sidebar
   - Real-time polling for new messages

3. **Onboarding**:
   - Step 1: Enter Telegram bot token
   - Step 2: Send test message verification

4. **Landing Page**:
   - Hero, features, social proof
   - Russian as primary language

5. **Settings**:
   - Profile, bot connection, templates

6. **Pricing** (mock):
   - 3 tiers: Free/Pro/Team
   - Fake checkout that just updates DB

**DATABASE:**
Extend the existing schema with: users, sessions, bot_connections, templates, messages tables. Keep conversations and relay_logs.

**IMPLEMENTATION ORDER:**
1. Project structure + backend foundation
2. Auth APIs + auth pages
3. Dashboard layout + conversation list
4. Message thread + composer
5. Polling for real-time updates
6. Bot connection + onboarding
7. Landing page
8. Settings + templates
9. Pricing + mock checkout
10. Russian translations

**START NOW:**
Create the project structure first, then implement backend auth routes, then move to frontend. Use the existing telegram relay code as the messaging engine. All UI in Russian with English fallback.

**UI SPECS:**
- Primary color: #3B82F6 (blue)
- Font: Inter
- Use Tailwind CSS
- Mobile responsive

The complete spec with all API schemas, database schema, and component details is attached. Follow it exactly.

---

# APPENDIX: QUICK REFERENCE

## Key Russian UI Strings

```json
{
  "app_name": "SanghaDesk",
  "tagline": "Все сообщения учеников — в одном месте",
  "login": "Войти",
  "signup": "Создать аккаунт",
  "logout": "Выйти",
  "dashboard": "Панель",
  "settings": "Настройки",
  "conversations": "Разговоры",
  "active": "Активные",
  "archived": "Архив",
  "search_placeholder": "Поиск...",
  "send": "Отправить",
  "save": "Сохранить",
  "cancel": "Отмена",
  "archive": "Архивировать",
  "unarchive": "Восстановить",
  "tags": "Теги",
  "notes": "Заметки",
  "add_tag": "Добавить тег",
  "no_conversations": "Нет разговоров",
  "select_conversation": "Выберите разговор",
  "pricing": "Цены",
  "free": "Бесплатно",
  "pro": "Pro",
  "team": "Команда",
  "upgrade": "Улучшить план",
  "current_plan": "Текущий план",
  "connect_bot": "Подключить бота",
  "bot_token": "Токен бота",
  "test_message": "Тестовое сообщение",
  "waiting": "Ожидание...",
  "success": "Успешно!",
  "error": "Ошибка",
  "try_again": "Попробовать снова"
}
```

## Environment Variables

```env
# Backend
PORT=3001
DATABASE_PATH=./data/sanghadesk.sqlite
JWT_SECRET=local-dev-secret-key
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## NPM Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "seed": "cd backend && npm run seed"
  }
}
```

---

**END OF SPECIFICATION**

This document contains everything needed to build SanghaDesk. No clarifying questions should be necessary. Execute in order.
