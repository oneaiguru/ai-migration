# Phase 9 – Real UI Visual Spec Capture (UAT Agent)

## Goal
Capture visual/interaction specs from the real product UI that the docs don’t fully specify.

## What to collect (per chart)
- Colors (hex) for all series, target/dashed lines, areas, axes
- Line widths, dash patterns, area opacity; bar spacing/rounded corners
- Axis labels/units/caps (e.g., punctuality 80–100 %, coverage 70–100 %)
- Tooltip content and order; legend placement and toggle behavior
- Default height/width, responsive breakpoints, container padding
- Localization examples (date/number formats in Russian)
- Zoom/pan behavior and reset (if present)
- Export behavior (are charts captured in PDFs/Excel? resolution?)
- Empty/sparse/large dataset states; error states
- Accessibility (ARIA titles/descriptions; keyboard focus path)

## Targets
- Legacy WFM Employees + Reports (see unified UAT brief on Desktop)
- Parity demo + trimmed build for cross-checking

## Outputs
- Markdown per chart with screenshots and measured values
- Summary table mapping findings → component props

