# Template Gallery

TaskFlow.ai includes a JSON-based template gallery for managing common prompts.
Templates can be organized into **categories** and tagged with an optional
`ai_level`. The gallery UI and API allow filtering templates by category,
searching by keywords, and exporting or importing template collections.

## Features

- **Categories**: Group templates under multiple labels such as `frontend` or
  `backend`.
- **Search**: Filter templates by text found in the ID, display name,
  description, or categories.
- **AI Level**: Optionally label templates with an `ai_level` for quick
  filtering of L4 or L5 prompts.

The default gallery file location is controlled by the `GALLERY_FILE`
configuration option (see [configuration.md](configuration.md)).

To browse templates locally, run the FastAPI server:

```bash
./tools/run.sh server
```

Then open `http://localhost:5000/templates` to search and filter the gallery.
