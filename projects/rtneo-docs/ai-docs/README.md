# AI Docs (Staged)

This folder aggregates external product docs and PRO messages for internal search and review.

Structure
- product_docs/disp/ … product docs (Markdown) from the “disp” package
- product_docs/src/ … component/module readmes (Markdown) from the “src” bundle
- product_docs/html/ … saved-for-web docs (Markdown) from the HTML bundle
- pro_messages/ … architect messages (PRO1..3)

Notes
- Files are staged for internal review only; not part of public delivery.
- Use ripgrep to search: `rg -n "Отчет по весу|Прогноз загрузки" ai-docs/product_docs`
