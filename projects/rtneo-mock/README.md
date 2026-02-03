# Read This First

Before doing any work, review everything in this repository and confirm it runs locally on macOS without extra setup.

1) Clone or pull the repo on macOS (no dependencies required for existing files).  
2) Read every document in this order:  
   - `PRD-Forecast-UI-Implementation.md`  
   - `Quick-Start-Guide.md`  
   - `Visual-Comparison-Guide.md`  
   - `forecast-ui-specification.jsx`  
   - `task/Прогноз объемов на КП.pdf`
3) Open and inspect all images:  
   - `task/Screenshot 2025-11-20 at 19.55.20.png`  
   - `task/Screenshot 2025-11-20 at 20.25.10.png`
4) Use the native macOS `open <file>` command to view any of the above (e.g., `open PRD-Forecast-UI-Implementation.md` or `open task/Прогноз объемов на КП.pdf`). No additional tooling is needed.
5) Only start implementation after completing steps 2–4 so you work with full context. Keep any future changes runnable on macOS localhost with the simplest possible setup.

## Disp documentation bundle

The heavy `disp/` docs bundle is not included in this import. If you need those assets, pull them from the original source repo; otherwise focus on the included spec, quick start, and UI reference files above.

## Quick local viewer (port 3333)

If you want to browse the included docs in a rendered view:

1) From this directory (`projects/rtneo-mock`): `python3 -m http.server 3333`  
2) Open `http://localhost:3333/viewer.html?file=README.md` for the entry page.  
3) You can swap the `file=` param for any file in this folder, e.g.:  
   - `http://localhost:3333/viewer.html?file=PRD-Forecast-UI-Implementation.md`  
   - `http://localhost:3333/viewer.html?file=Quick-Start-Guide.md`  
4) The viewer uses a CDN for Markdown rendering; you need internet access for that page only. Images resolve relative to each doc.
