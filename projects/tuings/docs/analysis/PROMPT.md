# Project: Things TUI Clone

## Objective

The main goal is to create a terminal-based, text-user-interface (TUI) application that replicates the user experience of the "Things" to-do manager by Cultured Code, specifically for macOS. The application should be built with a focus on keyboard shortcuts and a tag-based workflow.

## Project Root

All work should be done in the `~/ai/projects/uahis` directory.

## Initial Codebase

My draft code is located at `/Users/m/Documents/_move\ back/downloads\ files/tmpfold/uahis`. Please analyze this code, understand its documentation, and improve it to a level where it can be used as a foundation for the Things TUI clone. The first pull request should be this improved version of the `uahis` code.

## Core Features

The primary focus is to replicate the Mac app experience. Mobile-specific features, synchronization, licensing, and calendar integration can be ignored for now. The most critical features are:

1.  **Tagging System:** This is the highest priority. The application should allow users to:
    *   Create and manage tags.
    *   Assign tags to to-dos using keyboard shortcuts.
    *   Filter lists by tags using keyboard shortcuts.
    *   The tag manager should be a hideable panel.

2.  **Scheduling:** Implement the scheduling system with the following lists:
    *   Today & This Evening
    *   Upcoming
    *   Anytime
    *   Someday

3.  **Core Components:**
    *   Projects and Areas
    *   Headings within projects
    *   Checklists within to-dos
    *   Quick Find
    *   Keyboard Shortcuts (as detailed in the documentation)
    *   Things URL Scheme (`things:///`)

## Development Approach

-   **Technology Stack:** TypeScript with Blessed TUI library and Cucumber.js for BDD.
-   **Database:** The application reads from a SQLite database that is compatible with the Things 3 database format (better-sqlite3 for read operations). Write operations use the Things URL scheme instead of direct database writes to maintain compatibility with the official Things app.
-   **User Acceptance Testing (UAT):** BDD framework using Cucumber.js with `.feature` files and step definitions. The `ThingsTUITestable` class provides testing hooks for simulating user interactions and verifying TUI state.
-   **BDD:** Full BDD approach with `.feature` files in `features/` and step definitions in `features/step_definitions/common.steps.ts`. Phase 3+ follows strict RED→GREEN→REFACTOR cycle.
-   **Configuration:** Use simple configuration files (e.g., TOML, YAML, or even Markdown) for things like custom keyboard shortcuts.

## Documentation

The following documents on the Desktop provide detailed information about the features and functionality of Things. Please refer to them for a complete understanding of the user experience to be replicated.

### Key Features
- [Whats_new_in__the_all-new_Things.md](./Whats_new_in__the_all-new_Things.md)
- [Using_Tags.md](./Using_Tags.md)
- [Scheduling_To-Dos_in_Things.md](./Scheduling_To-Dos_in_Things.md)
- [Searching_and_Navigating_with_Quick_Find.md](./Searching_and_Navigating_with_Quick_Find.md)
- [Writing_Notes_in_Things.md](./Writing_Notes_in_Things.md)
- [Creating_Repeating_To-Dos.md](./Creating_Repeating_To-Dos.md)
- [Keyboard_Shortcuts_for_Mac.md](./Keyboard_Shortcuts_for_Mac.md)
- [Markdown_Guide.md](./Markdown_Guide.md)
- [Things_URL_Scheme.md](./Things_URL_Scheme.md)

### Database and Exporting
- [Exporting_Your_Data.md](./Exporting_Your_Data.md)
- [Things_AppleScript_Guide.md](./Things_AppleScript_Guide.md)
- [Things3AppleScriptGuide.pdf](./Things3AppleScriptGuide.pdf)

### User Experience and Workflow
- [An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md](./An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md)
- [Gather_it_all_in_one_place.md](./Gather_it_all_in_one_place.md)
- [How_to_Deal_with_Waiting_To-Dos.md](./How_to_Deal_with_Waiting_To-Dos.md)
- [How_to_Prioritize_To-Dos_in_Things.md](./How_to_Prioritize_To-Dos_in_Things.md)
- [Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md](./Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md)

### Screenshots
The desktop also contains several screenshots that provide visual reference for the UI and UX of the Things app.

## Final Notes

-   You have the freedom to make architectural and design decisions as long as they align with the goal of replicating the Things user experience.
-   You can use the Desktop as a scratchpad, but it's better to structure your work in the `~/ai/projects/uahis` monorepo.
-   Focus on a single-window TUI with hideable panels for now.
-   The `uahis` draft code is just an initial idea, and you are not strictly bound to it.

This prompt file should serve as the primary source of truth for the project requirements.
