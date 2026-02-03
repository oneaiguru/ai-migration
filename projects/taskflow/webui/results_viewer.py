import sys
from pathlib import Path
from typing import List

# Ensure the repository root is on the Python path when executed directly
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from fastapi import FastAPI, Request
from utils import register_exception_handlers, NotFoundError
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from path_utils import repo_path

app = FastAPI()
register_exception_handlers(app)
app.mount("/static", StaticFiles(directory=repo_path("webui", "static")), name="static")
templates = Jinja2Templates(directory=repo_path("webui", "templates"))

OUTPUT_DIR = repo_path("outputs")


def list_tasks() -> List[str]:
    if not OUTPUT_DIR.is_dir():
        return []
    return [d.name for d in OUTPUT_DIR.iterdir() if d.is_dir()]


@app.get("/api/tasks")
async def api_tasks() -> List[str]:
    return list_tasks()


@app.get("/api/task/{task_id}")
async def api_task_files(task_id: str) -> List[str]:
    task_path = OUTPUT_DIR / task_id
    if not task_path.is_dir():
        raise NotFoundError("Task not found")
    return [p.name for p in task_path.iterdir()]


@app.get("/api/task/{task_id}/{filename:path}")
async def api_task_file(task_id: str, filename: str) -> FileResponse:
    task_path = OUTPUT_DIR / task_id
    file_path = task_path / filename
    if not file_path.exists():
        raise NotFoundError("File not found")
    return FileResponse(file_path)


@app.get("/")
async def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
