# Things Documentation Index

## Core Features (Essential for TUI Implementation)
- [Using Tags](Core_Features/Using_Tags.md) - Tag creation, filtering, shortcuts
- [Scheduling To-Dos](Core_Features/Scheduling_To-Dos_in_Things.md) - List types and date handling
- [Keyboard Shortcuts](Core_Features/Keyboard_Shortcuts_for_Mac.md) - Complete shortcut reference
- [Quick Find](Core_Features/Searching_and_Navigating_with_Quick_Find.md) - Search functionality
- [Writing Notes](Core_Features/Writing_Notes_in_Things.md) - Notes and markdown
- [Repeating Items](Core_Features/Creating_Repeating_To-Dos.md) - Recurring tasks
- [What's New](Core_Features/Whats_new_in__the_all-new_Things.md) - Feature overview

## Data Export & Integration
- [Exporting Data](Data_Export/Exporting_Your_Data.md) - Official export procedures
- [AppleScript Guide](Data_Export/Things_AppleScript_Guide.md) - Automation via AppleScript
- [URL Scheme](Data_Export/Things_URL_Scheme.md) - things:// protocol

## Reference
- [Markdown Guide](Reference/Markdown_Guide.md) - Markdown formatting
- [AppleScript Guide PDF](Reference/Things3AppleScriptGuide.pdf) - Full reference manual

## User Experience
- [List Overview](User_Experience/An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md)
- [Prioritization](User_Experience/How_to_Prioritize_To-Dos_in_Things.md)
- [Gathering Tasks](User_Experience/Gather_it_all_in_one_place.md)
- [Stuck Tasks](User_Experience/Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md)

---

## Quick Start: Database Access

### SQLite Database Location
```
~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/
ThingsData-xxxxx/Things Database.thingsdatabase/main.sqlite
```

### Key Tables
- **TMTask** - Individual to-dos (title, notes, dates, status)
- **TMProject** - Projects (organized collections)
- **TMArea** - Areas (top-level organization)
- **TMTag** - Tags (hierarchical labels)
- **TMChecklistItem** - Checklist items within tasks

### Sample Query
```sql
SELECT title, activationDate FROM TMTask 
WHERE activationDate = date('now') 
ORDER BY title;
```

---

See DOCUMENTATION_PLAN.md for detailed analysis and implementation strategy.
