# YClients – Browser Agent Handoff (Supabase setup)

## Why
We need fresh Supabase creds and schema on the new test project before final Lunda pricing verification (see `docs/tasks/yclients_plan_async_painting_galaxy.md` for the full completion plan). Code is already imported (`projects/yclients/`); we are blocked on DB access to run the parser and export the CSV.

## What to do (browser agent)
1) Log into the fresh Supabase test account (provided earlier in `/Users/m/Desktop/agentmodeyclients.md.tex`).  
2) Create the new project (any name), free plan OK.  
3) In **API Keys**, copy and return (full strings):  
   - `SUPABASE_URL`  
   - `SUPABASE_KEY` (service_role)  
   - `ANON_KEY` (anon/public)  
   - `PROJECT_ID` (for reference)  
   - `DB_PASSWORD` (Postgres) if prompted/set during project creation  
   Screenshot reminder: copy the entire service_role key even if truncated in the UI (see attached screenshot note).  
4) In **SQL editor**, run this schema (matches our parser):
   ```sql
   -- URL list for parsing
   create table if not exists urls (
     id serial primary key,
     url text unique not null,
     title text,
     description text,
     created_at timestamptz default now(),
     updated_at timestamptz default now(),
     is_active boolean default true
   );

   -- Booking data (core fields + extra_data JSONB)
   create table if not exists booking_data (
     id serial primary key,
     url_id integer references urls(id),
     date date not null,
     time time not null,
     price text,
     provider text,
     seat_number text,
     extra_data jsonb,
     created_at timestamptz default now(),
     updated_at timestamptz default now(),
     unique(url_id, date, time, seat_number)
   );

   -- Helpful index for date filtering
   create index if not exists booking_data_url_id_date_idx
     on booking_data(url_id, date);
   ```
5) RLS: turn OFF for these two tables (or add permissive policies for inserts/selects), otherwise parser writes will fail.
6) Return a single message with: creds, confirmation that SQL ran, and whether RLS is disabled. If any step failed, describe what you saw.

## What we will do after creds arrive
- Populate `projects/yclients/.env` locally (not committed) with the provided values.
- Add Lunda URL into `urls` (via DB Manager).
- Run parser once for Lunda and export `lunda_export.csv`.
- Verify tariffs vs browser findings (6,000 / 6,250 / 6,500 ₽ and multi-duration prices) per plan `docs/tasks/yclients_plan_async_painting_galaxy.md`.

## Reference files
- Plan: `docs/tasks/yclients_plan_async_painting_galaxy.md`
- Creds prompt: `/Users/m/Desktop/agentmodeyclients.md.tex`
- Screenshot context: browser agent was copying service_role in Supabase UI (ensure full key captured).
