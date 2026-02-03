"""Run the TaskFlow FastAPI application."""

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    status,
)
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pydantic import BaseModel
from typing import Optional, List, get_type_hints

from src.config import config



import logging


from auth import AuthManager


from src.api import tasks_router, templates_router
from src.api.tasks_api import RateLimiter
from utils.logging_config import setup_logging, web_logger
from path_utils import repo_path



setup_logging(level=getattr(logging, config.log_level.upper(), logging.INFO))

app = FastAPI(title="TaskFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
try:
    templates = Jinja2Templates(directory=repo_path("templates"))
except AssertionError:
    templates = None

security = HTTPBasic()
USERNAME = config.web_user
PASSWORD = config.web_password

def authenticate(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    """Simple HTTP Basic authentication."""
    if credentials.username != USERNAME or credentials.password != PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Work around Pydantic forward ref evaluation issues
RateLimiter.__call__.__annotations__ = get_type_hints(
    RateLimiter.__call__, RateLimiter.__call__.__globals__, None
)

app.include_router(tasks_router)
app.include_router(templates_router)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    """Serve the dashboard page."""
    if templates:
        return templates.TemplateResponse("dashboard.html", {"request": request})
    return HTMLResponse("Dashboard", status_code=200)


@app.get("/templates", response_class=HTMLResponse)
async def templates_page(request: Request) -> HTMLResponse:
    """Serve the templates gallery page."""
    if templates:
        return templates.TemplateResponse("templates.html", {"request": request})
    return HTMLResponse("Templates", status_code=200)


def main() -> None:
    """Entry point for running the server."""
    import uvicorn

    try:
        config.validate()
    except Exception as exc:  # pragma: no cover - validation rarely fails
        web_logger.error("Invalid configuration: %s", exc)
        raise SystemExit(1) from exc

    web_logger.info("Starting TaskFlow web server")
    uvicorn.run(app, host=config.web_host, port=config.web_port)


if __name__ == "__main__":
    main()
