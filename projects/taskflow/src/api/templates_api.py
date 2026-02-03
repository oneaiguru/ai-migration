from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends
from utils import NotFoundError, ValidationError
from src.utils.validation import validate_template_name
from pydantic import BaseModel

from src.services.template_service import TemplateService


# ---------------------------------------------------------------------------


def create_templates_router(service: TemplateService, authenticate):
    """Return an APIRouter for managing templates."""

    router = APIRouter(prefix="/api/templates", tags=["templates"])

    class TemplateCreate(BaseModel):
        name: str
        display_name: str = ""
        description: str = ""
        prompt: str
        version: str = "1.0"
        categories: List[str] = []
        ai_level: str = ""

    class TemplateUpdate(BaseModel):
        display_name: Optional[str] = None
        description: Optional[str] = None
        prompt: Optional[str] = None
        version: Optional[str] = None
        categories: Optional[List[str]] = None
        ai_level: Optional[str] = None

    class ImportPayload(BaseModel):
        templates: Dict[str, Dict[str, Any]]

    # ------------------------------------------------------------------
    @router.get("/")
    def list_templates(
        query: Optional[str] = None,
        category: Optional[str] = None,
        source: Optional[str] = None,
    ) -> Dict[str, Any]:
        templates = service.search_templates(query=query, category=category)
        if source:
            templates = [t for t in templates if t.source == source]
        return {
            "templates": [
                {"name": t.name, "source": t.source, **t.to_dict()} for t in templates
            ]
        }

    # ------------------------------------------------------------------
    @router.get("/{name}")
    def get_template(name: str) -> Dict[str, Any]:
        tpl = service.get_template(name)
        if not tpl:
            raise NotFoundError("Template not found")
        return {"name": tpl.name, "source": tpl.source, **tpl.to_dict()}

    # ------------------------------------------------------------------
    @router.post("/", status_code=201)
    def create_template(
        payload: TemplateCreate, _user: str = Depends(authenticate)
    ) -> Dict[str, str]:
        errors = validate_template_name(payload.name)
        if errors:
            raise ValidationError("; ".join(errors))
        if service.get_template(payload.name):
            raise ValidationError("Template already exists")
        if not service.validate_template(payload.prompt):
            raise ValidationError("Template must contain placeholders")
        service.add_template(payload.name, payload.dict(exclude={"name"}))
        return {"message": "Template created", "name": payload.name}

    # ------------------------------------------------------------------
    @router.put("/{name}")
    def update_template(
        name: str, payload: TemplateUpdate, _user: str = Depends(authenticate)
    ) -> Dict[str, Any]:
        tpl = service.get_template(name)
        if not tpl:
            raise NotFoundError("Template not found")
        data = tpl.to_dict()
        for field, value in payload.dict(exclude_none=True).items():
            data[field] = value
        if not service.validate_template(data.get("prompt", "")):
            raise ValidationError("Template must contain placeholders")
        service.add_template(name, data)
        tpl = service.get_template(name)
        return {"name": tpl.name, "source": tpl.source, **tpl.to_dict()}

    # ------------------------------------------------------------------
    @router.delete("/{name}")
    def delete_template(
        name: str, _user: str = Depends(authenticate)
    ) -> Dict[str, str]:
        if not service.delete_template(name):
            raise NotFoundError("Template not found")
        return {"message": "Template deleted"}

    # ------------------------------------------------------------------
    @router.post("/import")
    def import_templates(
        payload: ImportPayload, _user: str = Depends(authenticate)
    ) -> Dict[str, int]:
        count = service.import_templates(payload.templates)
        return {"imported": count}

    # ------------------------------------------------------------------
    @router.get("/export")
    def export_templates(_user: str = Depends(authenticate)) -> Dict[str, Any]:
        return {"templates": service.export_templates()}

    # ------------------------------------------------------------------
    @router.get("/stats")
    def template_stats() -> Dict[str, Any]:
        categories: Dict[str, int] = {}
        for cat in service.get_categories():
            categories[cat] = len(service.search_templates(category=cat))
        return {
            "total": len(service.list_templates()),
            "by_category": categories,
        }

    return router


__all__ = ["create_templates_router"]
