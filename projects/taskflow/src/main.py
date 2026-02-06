import logging
import os
from typing import Dict

from fastapi import FastAPI, Request, Depends, Form
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from src.auth import AuthManager

from src.api.auth_api import create_auth_router

from utils import register_exception_handlers, AuthenticationError


from src.api.tasks_api import create_tasks_router
from src.api.templates_api import create_templates_router
from src.services.template_service import TemplateService

from config_manager import get_config
from task_tracker import TaskTracker
from path_utils import repo_path


config = get_config()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("web_server.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

HOST = config.web_host
PORT = config.web_port
USERNAME = config.web_user
PASSWORD = config.web_password
TASKS_FILE = config.tasks_file

TEMPLATE_DIR = os.path.join(
    os.path.dirname(__file__), "..", "core", "specs", "templates"
)
GALLERY_FILE = str(repo_path("templates", "gallery.json"))

app = FastAPI(title="TaskFlow API")
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "taskflow-secret"))

app.mount("/static", StaticFiles(directory=repo_path("web", "static")), name="static")

auth_manager = AuthManager(str(repo_path("users.json")))
if not auth_manager.user_manager.users:
    auth_manager.user_manager.add_user(USERNAME, PASSWORD)
security = auth_manager.security
tracker = TaskTracker(TASKS_FILE)
template_service = TemplateService(
    template_dir=TEMPLATE_DIR,
    db_file=GALLERY_FILE,
)
app.add_middleware(BaseHTTPMiddleware, dispatch=auth_manager.middleware())


authenticate = auth_manager.dependency()
app.include_router(create_auth_router(auth_manager))
app.include_router(create_tasks_router(tracker, auth_dependency=authenticate))
app.include_router(create_templates_router(template_service, authenticate))


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    try:
        auth_manager.require_login(request)
    except AuthenticationError:
        return RedirectResponse("/login")
    return FileResponse(repo_path("web", "static", "index.html"))


@app.get("/login", response_class=HTMLResponse)
async def login_page():
    return FileResponse(repo_path("web", "static", "login.html"))


@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    auth_manager.login(request, username, password)
    return RedirectResponse("/", status_code=302)


@app.post("/logout")
async def logout(request: Request):
    auth_manager.logout(request)
    return RedirectResponse("/login", status_code=302)


@app.get("/api/metrics")
async def metrics(_user: str = Depends(authenticate)):
    tasks = tracker.all_tasks().values()
    counts: Dict[str, int] = {}
    for t in tasks:
        counts[t.status] = counts.get(t.status, 0) + 1
    return {"total": len(tasks), "counts": counts}


def main() -> None:
    """Run the FastAPI server."""
    import uvicorn

    logger.info("Starting FastAPI server on %s:%s", HOST, PORT)
    uvicorn.run(app, host=HOST, port=PORT)


if __name__ == "__main__":
    main()
