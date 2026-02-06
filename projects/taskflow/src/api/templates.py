from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from config import config
from utils import AuthenticationError
from src.services.template_service import TemplateService
from .templates_api import create_templates_router

_security = HTTPBasic()
_service = TemplateService()


def _authenticate(credentials: HTTPBasicCredentials = Depends(_security)) -> str:
    if credentials.username != config.web_user or credentials.password != config.web_password:
        raise AuthenticationError("Invalid credentials")
    return credentials.username


router = create_templates_router(_service, _authenticate)

__all__ = ["router"]
