# Whisper Infinity Bot - Telegram Course Management Bot Memory

## Quick Start
- **Purpose**: Telegram bot for teacher registration, course management, and payment processing
- **Input**: Telegram messages and commands
- **Output**: Interactive bot responses, database operations, admin notifications

## Installation & Setup
```bash
# Install dependencies
pip install python-telegram-bot nest-asyncio

# Database setup (SQLite)
# - Creates database.db automatically
# - Initializes tables for teachers, courses, payments, admins

# Configuration
# Set telegram_bot_token in config.json
```

## Usage Examples
```bash
# Run the bot
python bot.py

# User commands (in Telegram):
/start                              # Welcome screen with login/register
/signup RUS0105 "John Doe"         # Request teacher account  
/login RUS0105 password            # Login to account
/register RUS0105 "Python Course"  # Request course registration
/pay RUS0105 "Python Course" 500   # Record payment

# Admin commands:
/pending_signups                   # List pending teacher signups
/approve_teacher RUS0105           # Approve teacher registration
/list_teachers                     # List all registered teachers
/approve_course RUS0105 "Course"   # Approve course registration
```

## Core Components
| File | Lines | Purpose |
|------|-------|---------|
| `bot.py` | 1-486 | Main bot logic and command handlers |
| `auth.py` | N/A | Teacher authentication and password management |
| `courses.py` | N/A | Course registration and approval system |
| `payments.py` | N/A | Payment recording and status management |
| `admin.py` | N/A | Admin privileges and teacher approval |
| `database.py` | N/A | Database connection and operations |
| `config.json` | 1-6 | Bot configuration (token, settings) |

## Bot Architecture
1. **Authentication Flow** - `bot.py:54-78, 187-220` - Login/logout system with inline keyboards
2. **Registration Process** - `bot.py:222-248` - Teacher signup with admin approval
3. **Course Management** - `bot.py:338-383` - Course registration and approval workflow  
4. **Payment Processing** - `bot.py:385-421` - Payment recording and approval system
5. **Admin Functions** - `bot.py:250-336` - Teacher and course approval, listings

## Configuration Options
- **telegram_bot_token**: Bot authentication token (`config.json:2`)
- **database_file**: SQLite database filename (`config.json:3`)
- **cooldown_days**: System cooldown period (`config.json:4`)
- **log_file**: System log filename (`config.json:5`)

## Database Schema (Inferred)
```sql
-- Teachers table
teachers (teacher_code, name, courses, password_hash)

-- Pending teachers (awaiting approval)
pending_teachers (teacher_code, name, telegram_user_id, status)

-- Admins table  
admins (teacher_code, admin_name, role)

-- Courses table
courses (teacher_code, course_name, status)

-- Payments table
payments (payment_id, teacher_code, course_name, amount, status)
```

## User Interface Flow
1. **Welcome Screen** - Interactive keyboard with Login/Register options
2. **Teacher Dashboard** - My Courses, Payments, Settings, Help buttons
3. **Command Processing** - Text-based commands for complex operations
4. **Admin Panel** - Approval workflows and system management

## Integration Examples
```python
# Use authentication module
from auth import authenticate_teacher, reset_teacher_password

# Verify teacher credentials
auth_result = authenticate_teacher("RUS0105", "password")
if auth_result["status"] == "success":
    print("Login successful")

# Use course management
from courses import register_course, approve_course

# Request course registration
result = register_course("RUS0105", "Advanced Python")
if result["status"] == "success":
    print("Course registration submitted for approval")
```

## Permission System
- **Regular Users**: Can signup, login, register courses, make payments
- **Admins**: Can approve teachers, courses, payments, view listings
- **SuperAdmins**: Can add new admins and perform all admin functions
- **Permission Checks**: `is_admin()`, `is_superadmin()` functions (`bot.py:252, 322`)

## Command Handlers
| Command | Function | Access Level |
|---------|----------|--------------|
| `/start` | Welcome interface | All users |
| `/signup` | Teacher registration | All users |
| `/login` | Authentication | All users |
| `/register` | Course registration | Teachers |
| `/pay` | Payment recording | Teachers |
| `/approve_teacher` | Approve signups | Admins |
| `/approve_course` | Approve courses | Admins |
| `/list_teachers` | View all teachers | Admins |
| `/addadmin` | Add new admin (logged-in SuperAdmin; args: `<code> <name> <role> <chat_id>`) | SuperAdmins |

## Common Issues
- **Bot token security**: Token exposed in config.json
  - Solution: Use environment variables for production
- **Database permissions**: SQLite file access issues
  - Solution: Ensure write permissions in bot directory
- **Command parsing**: Incorrect argument format
  - Solution: Robust input validation in handlers
- **Admin notifications**: Manual admin management
  - Solution: Automated notification system for approvals

## Performance Notes
- **Async Architecture**: Uses python-telegram-bot with asyncio
- **Database**: SQLite for simplicity, suitable for moderate load
- **Memory Usage**: Stores session data in context.user_data
- **Concurrent Users**: Handles multiple users with async handlers

## Security Features
- **Password Hashing**: Uses secure password hashing (auth.py)
- **Permission Levels**: Role-based access control
- **Admin Approval**: All teacher signups require approval
- **Course Approval**: All course registrations require approval
- **Payment Verification**: Manual payment approval process

## Workflow Automation
1. **Teacher Onboarding**: Signup → Admin Approval → Auto-generated Password
2. **Course Registration**: Request → Admin Review → Approval/Rejection
3. **Payment Processing**: Recording → Verification → Status Update
4. **Notification System**: Automatic admin notifications for actions

## Use Cases
- **Educational Institutions**: Teacher and course management
- **Training Organizations**: Course enrollment and payment tracking
- **Art of Living Russia**: Specific implementation for yoga/meditation courses
- **Multi-language Support**: Russian language interface elements

## Telegram Bot Features
- **Inline Keyboards**: Interactive button-based navigation
- **Command Handlers**: Text-based command processing
- **Session Management**: User state tracking across interactions
- **Markdown Support**: Formatted message responses
- **Callback Queries**: Button press handling and responses

## Integration with Other Tools
**Potential Media Pipeline Integration:**
1. **Course Content Creation**: Record lectures → FastWhisper → Transcription
2. **Video Analysis**: YouTube content → Screenshots → Course material
3. **Audio Processing**: Voice notes → Transcription → Course updates
4. **Automated Workflows**: Bot notifications → Media processing triggers
