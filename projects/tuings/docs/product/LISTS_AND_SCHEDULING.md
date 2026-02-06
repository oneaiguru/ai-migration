# Lists and Scheduling in Things

**Source:** Official Things documentation
**Status:** ✅ REFERENCED (2.1-2.6 DONE)

---

## Overview

Things uses date-based lists to control when tasks come to your attention. These are the core organizational lists for the TUI.

### Implementation Status

| List | Feature | Status | Notes |
|------|---------|--------|-------|
| Today | Display tasks due today | ✅ DONE | Leaf 2.1 complete |
| Upcoming | Show future tasks (next 7 days + beyond) | ✅ DONE | Leaf 2.1 complete |
| Anytime | Active tasks with no date | ✅ DONE | Leaf 2.1 complete |
| Someday | Unplanned ideas / backlog | ✅ DONE | Leaf 2.1 complete |
| Inbox | Quick-capture staging | 🔲 TODO | Phase 4 candidate |
| Logbook | Archive of completed tasks | 🔲 TODO | Phase 4 candidate |

---

## Today & This Evening

**Purpose:** Show to-dos you want to complete today. These are your priorities.

**Display Rules:**
- Appears if start date, deadline, or repeating rule matches today
- Can be visually grouped by project/area
- Optional "This Evening" section for later-in-day tasks
- Calendar events can appear at top (if enabled)

**TUI Implementation:**
- ✅ Shows all tasks with `activationDate = today()`
- ✅ Can be reordered (custom priority)
- 🔲 TODO: "This Evening" section toggle (Phase 4)
- 🔲 TODO: Calendar integration (Phase 4)

---

## Upcoming

**Purpose:** Future-scheduled tasks you can't tackle right now but plan for specific days ahead.

**Display Rules:**
- Next 7 days shown separately at top
- Start date controls visibility (hibernation until date arrives)
- Projects/tasks with future start dates hidden from other lists until active
- Once start date arrives, task moves to **Today**

**TUI Implementation:**
- ✅ Shows tasks with `activationDate > today()`
- ✅ Grouped by date in UI
- 🔲 TODO: Date-based dragging to reschedule (Phase 3.3)
- 🔲 TODO: Project hibernation visualization (Phase 4)

---

## Anytime

**Purpose:** All active tasks with no specific start date. Can be tackled "at any time."

**Display Rules:**
- Contains only *active* to-dos (inverse of Upcoming/Someday)
- Tasks with deadlines stay here (even if deadline is in future)
- Today's tasks appear here with a marker/star
- Grouped by parent project/area structure
- Loose tasks (no parent) float at top
- Empty parent groups hidden

**TUI Implementation:**
- ✅ Shows tasks where `activationDate IS NULL OR activationDate <= today()`
- ✅ Grouped by parent project
- ✅ Loose tasks at top
- 🔲 TODO: Visual marker for Today tasks in Anytime (Phase 4)

---

## Someday

**Purpose:** Unplanned ideas, maybes, and backlog items. No commitment yet.

**Display Rules:**
- Neither active nor scheduled (different state from Upcoming)
- Intended for periodic review (monthly/quarterly)
- Not shown in Anytime or Upcoming
- Inactive projects hidden from sidebar
- Designed to be visually de-emphasized

**TUI Implementation:**
- ✅ Shows tasks with `someday = true` flag
- ✅ Separate visual treatment
- 🔲 TODO: Bulk review workflow (Phase 4)

---

## Inbox (Future)

**Purpose:** Temporary staging ground for unprocessed thoughts.

**Rules:**
- Quick capture via keyboard, mail, or external apps
- Not yet processed into proper to-do
- Moved out when assigned to list or date
- Should be reviewed regularly

**TUI Implementation:**
- 🔲 TODO: Display in Phase 4 (low priority)
- 🔲 TODO: Quick-add fallback location (Phase 3.1)

---

## Logbook (Future)

**Purpose:** Archive of completed/cancelled items (read-only).

**TUI Implementation:**
- 🔲 TODO: View completed tasks (Phase 4)
- 🔲 TODO: Browse history (Phase 4)

---

## Key Patterns for TUI

### Task State Model

```
Task State:
├─ Someday     (no activation date, someday=true)
├─ Upcoming    (activation_date > today)
├─ Today       (activation_date = today OR in-range deadline)
├─ Anytime     (activation_date ≤ today, someday=false)
└─ Completed   (status=done)
    └─ Logbook (archived view)
```

### Filtering Logic

- **Today:** `activationDate = today()`
- **Upcoming:** `activationDate > today()`
- **Anytime:** `(activationDate ≤ today() OR activationDate IS NULL) AND someday = false`
- **Someday:** `someday = true`
- **Inbox:** Not yet assigned

### Grouping

Default grouping for Anytime/Upcoming/Today:
1. Loose tasks (no parent project/area)
2. Grouped by direct parent (Project or Area)
3. Empty parents hidden

---

## Relevant Database Fields

```sql
-- Core scheduling
TMTask.activationDate       -- Start date (NULL = Anytime/Today filter applies)
TMTask.dueDate              -- Deadline
TMTask.repeatingRule        -- Recurrence pattern

-- Task state
TMTask.status               -- 0=open, 1=completed, 2=cancelled
TMTask.someday              -- Boolean flag for Someday list

-- Relationships
TMTask.project              -- Parent project (foreign key)
TMTask.area                 -- Parent area (foreign key)
```

---

## Next Session: Feature Parity Checklist

- [ ] Verify Anytime grouping matches product behavior
- [ ] Test edge cases (tasks with both date and deadline)
- [ ] Confirm repeating tasks appear correctly in Today
- [ ] Add Inbox as Phase 4 candidate
- [ ] Plan Logbook view for Phase 4

