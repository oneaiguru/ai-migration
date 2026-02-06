# UI Wrapper Guidelines

This directory hosts the shared UI facades (e.g. Radix-based dialogs) that replace bespoke overlays in
`src/components/`. A few conventions prevent downstream surprises:

## Dialogs & Overlays
- Always provide an accessible heading for `DialogContent`. When the visual design hides it, set
  `titleHidden`/`descriptionHidden` on `Dialog`/`Overlay` so the wrapper renders Radix's
  `VisuallyHidden` elements automatically (requires `@radix-ui/react-visually-hidden`).
- If you rely on bespoke headers inside the overlay body, keep `ariaLabelledBy`/`ariaDescribedBy`
  pointing at those elements so assistive tech announces the same copy users see.

## Dependency hygiene
- When promoting components from `migration-prep/` into the main source tree, double-check that their
dependencies live in `package.json`. Missing packages (for example `@radix-ui/react-dialog`) will cause
Rollup/Vite to fail at build time.

Keep this README in sync as new wrappers adopt Radix primitives or additional accessibility constraints.
