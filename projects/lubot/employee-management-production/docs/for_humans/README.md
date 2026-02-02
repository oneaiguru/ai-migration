# For Humans – Quick Reference Guides

This folder collects straight-talk explainers for topics the AI agents know well but that might be new for human collaborators. Everything here sticks to plain language, actionable tips, and copy/pastable patterns.

## ARIA & ID Wiring Cheat Sheet

Accessible forms hinge on giving every control a stable identity and telling assistive technology where to find the label, hint, and error copy.

### What You Must Do
- **Give every control an `id`.** Example: `employee-email`.
- **Point the label at the control.** `<label htmlFor="employee-email">Email</label>` (our `FormField` wrapper does this for you).
- **Wire the label with `aria-labelledby`.** Custom inputs (TipTap, combo boxes, etc.) should receive `aria-labelledby="employee-email-label"`.
- **Hook up hints and errors with `aria-describedby`.** Collect the IDs of helper text (hint + error) and pass them as a space-separated string.
- **Flip `aria-invalid="true"` when validation fails.** This is how screen readers announce the field is in error.
- **Overlays need titles.** Radix dialogs/sheets must provide either a visible title or a VisuallyHidden one and expose it through `aria-labelledby`.

### ASCII Map (Screen Reader Walkthrough)
```
                +--------------------+
                |  <label htmlFor=>  |  ← Screen reader reads the label
                +---------+----------+
                          |
                          v
+-------------------------+---------------------------+
| <input id="employee-email"                          |
|        aria-labelledby="employee-email-label"       |  ← Focus, keyboard nav, switch control
|        aria-describedby="employee-email-hint        |
|                            employee-email-error"    |  ← Screen reader announces hint/error
|        aria-invalid="true">                         |
+-----------------+-----------------+------------------+
                  |                 |
                  |                 v
                  |       +---------------------------+
                  |       | <span id="employee-email- |
                  |       |  hint">… guidance …</span> |
                  |       +---------------------------+
                  v
+-----------------+-----------------+
| <span id="employee-email-error"   |
|        role="alert">… error …</span>|
+-----------------+-----------------+
```
- **Screen readers (JAWS, NVDA, VoiceOver)** use `aria-labelledby` for the label and `aria-describedby` for hint/error text.
- **Braille displays** show the same strings because they map ARIA attributes to tactile output.
- **Keyboard and switch users** rely on the `label`/`id` pairing so focus jumps correctly.

### Helper to Reuse
`src/wrappers/form/FormField.tsx` exposes `formFieldAriaProps`. Call it with a stable `controlId` and pass the returned props to your input/editor. It produces the correct `id`, `labelId`, `aria-describedby`, and `aria-invalid` values for you.

Keep this doc updated whenever we introduce new accessibility patterns so everyone stays aligned.
