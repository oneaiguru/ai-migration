# Plan: Fix admin auth, notifications, and DB init

## Objectives
- Enforce real authentication/authorization for `/addadmin` so only logged-in SuperAdmins can create admins.
- Deliver signup notifications to actual Telegram chat IDs instead of teacher codes.
- Initialize the database on bot startup to avoid missing-table errors on fresh deploys.

## Proposed changes
1) Secure the admin-creation flow
- In `bot.py`, require the caller to be logged in and `is_superadmin(...)` before `/addadmin` runs; remove the raw `superadmin_code` argument from the command usage and update help text/errors.
- Parse `/addadmin` args as new admin code, name, role, and Telegram chat ID; pass the actor’s code (from session) into `add_admin` instead of trusting user-supplied codes.
- Update `admin.py:add_admin` to accept `actor_code` and `admin_chat_id`, validate role, and reject if the actor is not a SuperAdmin.

2) Store and use admin chat IDs for notifications
- Extend the `admins` table schema to include `admin_chat_id`; add a lightweight migration/`ALTER TABLE` guard so existing DBs keep working.
- Write `admin_chat_id` when creating admins; tighten insert validation/uniqueness errors as needed.
- Update `notify_admins_about_signup` to fetch `admin_chat_id`, skip rows without it, and log/send failures clearly.
- Adjust admin listing/help/usage text to reflect the new chat ID argument so operators know what to provide.

3) Ensure DB is initialized on startup
- Import and call `initialize_database()` inside `main()` before building the Telegram application so tables exist before handling commands; log success/failure.

## Validation
- Run `python database.py` (or a fresh start of `bot.py`) to confirm migrations/table creation succeed on an empty DB.
- Start the bot and trigger `/signup` to verify admin notifications reach the configured chat IDs.
- Exercise `/addadmin` as a logged-in SuperAdmin to confirm the auth gate and new admin insertion (with chat ID) work.
