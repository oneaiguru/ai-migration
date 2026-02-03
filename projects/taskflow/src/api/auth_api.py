from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from src.auth import AuthManager


def create_auth_router(auth: AuthManager) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["auth"])

    class LoginPayload(BaseModel):
        username: str
        password: str

    @router.post("/login")
    def login(payload: LoginPayload) -> dict[str, str]:
        token = auth.login_token(payload.username, payload.password)
        return {"token": token}

    @router.post("/logout")
    def logout() -> dict[str, str]:
        # Stateless JWT logout - nothing to do
        return {"message": "Logged out"}

    @router.get("/me")
    def me(user: str = Depends(auth.token_dependency())) -> dict[str, str]:
        return auth.get_user_info(user)

    return router
