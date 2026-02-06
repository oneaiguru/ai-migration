# PR-23 — MyTKO Site Gallery (Preset + Manual)

## Goal
Upgrade the MyTKO demo (port 5174) with a thumbnail-style “Site gallery” so reviewers can flip through curated presets visually while still being able to override the `site_id` and date window manually.

## References
- UI entry point: `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx`
- Store: `ui/mytko-forecast-demo/src/stores/forecastStore.ts`
- Curated presets: `ui/mytko-forecast-demo/src/constants/demoSites.ts` (must stay in sync with `docs/Notes/demo_site_catalog.md`)
- Demo data primer: `docs/System/Demo_Data.md`

## Requirements
1. **Gallery component** — create `ui/mytko-forecast-demo/src/components/SiteGallery.tsx`
   - Consume the preset metadata from `src/constants/demoSites.ts` (site ID, label, district/address snippet, default range, optional WAPE/fill snippets if present).
   - Render Ant Design `Card` components inside a `Row gutter={16}` grid:
     - Desktop: `Col span={6}` (4 cards per row)
     - Tablets: `Col span={12}`
     - Mobile: `Col span={24}`
     - Use `style={{ minHeight: 170 }}` to keep heights aligned.
   - Card body: site ID, secondary line with district/address (truncate long text), a simple fill-range bar (Ant `Progress` in “line” mode is fine), and the preset’s WAPE (e.g., “WAPE 5.5%”).
   - Clicking a card:
     - Calls into the store to set the preset (site ID + recommended window).
     - Highlights the active card (e.g., `type="primary"` or custom border class).
2. **Forecast page layout**
   - Insert the gallery above the form with a section header such as “Галерея площадок”.
   - Move the Select/Input/RangePicker block into a bordered `Card` or `div` titled “Ручной выбор site_id”.
   - Behaviour:
     - Selecting a gallery card sets the store site ID, updates `store.setPresetRange`, syncs the Select to that site, and updates both `dateRange` state and `dialogRange`.
     - The manual controls work exactly as today. Once the user changes the Select to “Custom site…” or edits the input, the gallery highlight should clear (or at least no card remains active).
3. **Store / hook tweaks**
   - `forecastStore.setPresetRange` already returns the preset; extend it or add a helper (`selectPreset(siteId)`) so components can easily update both the ID and the date window while receiving preset metadata for highlighting.
4. **Docs**
   - Update `docs/System/Demo_Data.md` to mention the new gallery (include a screenshot placeholder if possible) and reiterate that the preset data comes from `docs/Notes/demo_site_catalog.md`.
5. **Accessibility / Responsiveness**
   - Cards should be keyboard focusable (`role="button"` or Ant `Card` click handlers).
   - Use Ant Design responsive props (`xs={24} sm={12} lg={6}`) to satisfy the layout requirement.

## Validation
```bash
cd ui/mytko-forecast-demo && npm run build
cd /Users/m/git/clients/rtneo/forecastingrepo && bash scripts/dev/start_stack.sh
curl -fsS http://127.0.0.1:8000/api/metrics | jq .
# Open http://127.0.0.1:5174
#   - Click each gallery card and confirm the Select, RangePicker, WAPE card, and table update.
#   - Switch to “Custom site…” and verify the gallery deselects but manual input still works.
bash scripts/dev/stop_stack.sh
```

## Acceptance
- Gallery cards use the curated preset data, highlight the active selection, and drive the underlying MobX store.
- Manual overrides remain fully functional (Select/Input/RangePicker + dialog history flow).
- No regressions to the WAPE card or `ContainerHistoryDialog`.
- `docs/System/Demo_Data.md` references the gallery/preset source, and `docs/SESSION_HANDOFF.md` captures the work + validation commands.
