import json
import os
import time
import hashlib
import base64
import hmac
from dataclasses import dataclass
from typing import Dict, Optional, Callable

try:  # pragma: no cover - optional dependency
    import bcrypt  # type: ignore
except Exception:  # pragma: no cover - fallback if unavailable
    bcrypt = None

from fastapi import Depends, HTTPException, Request
from utils import AuthenticationError, ValidationError
from fastapi.security import HTTPBasic, HTTPBasicCredentials


@dataclass
class User:
    username: str
    salt: str
    password_hash: str
    role: str = "user"


class UserManager:
    """Manage users stored in a JSON file."""

    def __init__(self, path: str) -> None:
        self.path = path
        self.users: Dict[str, User] = {}
        self._load()

    def _load(self) -> None:
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.users = {
                        u["username"]: User(**u) for u in data.get("users", [])
                    }
            except (OSError, json.JSONDecodeError):
                self.users = {}

    def _save(self) -> None:
        data = {"users": [user.__dict__ for user in self.users.values()]}
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(data, f)

    @staticmethod
    def _hash_password(password: str, salt: str) -> str:
        if bcrypt:
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
            return hashed.decode("utf-8")
        return hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
        ).hex()

    def add_user(self, username: str, password: str, role: str = "user") -> None:
        if username in self.users:
            raise ValueError("User already exists")
        salt = os.urandom(16).hex()
        pwd_hash = self._hash_password(password, salt)
        self.users[username] = User(username, salt, pwd_hash, role=role)
        self._save()

    def verify_user(self, username: str, password: str) -> bool:
        user = self.users.get(username)
        if not user:
            return False
        if bcrypt and user.password_hash.startswith("$2b$"):
            return bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8"))
        return self._hash_password(password, user.salt) == user.password_hash


class AuthManager:
    """Simple authentication manager with rate limiting and JWT sessions."""

    def __init__(
        self,
        user_file: str,
        rate_limit: int = 5,
        window: int = 900,
        secret_key: Optional[str] = None,
        token_expiration: int = 3600,
    ) -> None:
        self.user_manager = UserManager(user_file)
        self.rate_limit = rate_limit
        self.window = window
        self.attempts: Dict[str, list[float]] = {}
        self.security = HTTPBasic()
        self.secret_key = secret_key or os.getenv("TOKEN_SECRET", "taskflow-secret")
        self.token_expiration = token_expiration

    def check_rate_limit(self, key: str) -> None:
        now = time.time()
        attempts = self.attempts.setdefault(key, [])
        attempts[:] = [t for t in attempts if now - t < self.window]
        if len(attempts) >= self.rate_limit:
            raise ValidationError("Too many login attempts", status_code=429)
        attempts.append(now)

    def authenticate_basic(
        self, credentials: HTTPBasicCredentials = Depends(lambda: None)
    ) -> str:
        """Validate HTTP Basic credentials."""
        # The lambda above is replaced when creating the dependency
        raise NotImplementedError

    def _authenticate_basic(self, credentials: HTTPBasicCredentials) -> str:
        self.check_rate_limit(credentials.username)
        if not self.user_manager.verify_user(
            credentials.username, credentials.password
        ):
            raise AuthenticationError("Invalid credentials")
        return credentials.username

    def dependency(self):
        def dep(credentials: HTTPBasicCredentials = Depends(self.security)) -> str:
            return self._authenticate_basic(credentials)

        return dep

    def _create_token(self, username: str, role: str) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        payload = {
            "sub": username,
            "role": role,
            "exp": int(time.time()) + self.token_expiration,
        }
        parts = [
            base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b"=").decode(),
            base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=").decode(),
        ]
        signing_input = ".".join(parts).encode()
        signature = hmac.new(self.secret_key.encode(), signing_input, hashlib.sha256).digest()
        parts.append(base64.urlsafe_b64encode(signature).rstrip(b"=").decode())
        return ".".join(parts)

    def _verify_token(self, token: str) -> dict:
        try:
            header_b64, payload_b64, signature_b64 = token.split(".")
        except ValueError as exc:  # pragma: no cover - malformed token
            raise HTTPException(status_code=401, detail="Invalid token") from exc
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(self.secret_key.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(signature_b64 + "==")
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise HTTPException(status_code=401, detail="Invalid token")
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "==").decode())
        if payload.get("exp", 0) < int(time.time()):
            raise HTTPException(status_code=401, detail="Token expired")
        return payload

    def token_dependency(self) -> Callable:
        def dep(request: Request) -> str:
            token = request.headers.get("Authorization", "")
            if token.startswith("Bearer "):
                token = token[7:]
            else:
                raise HTTPException(status_code=401, detail="Invalid token")
            payload = self._verify_token(token)
            return payload["sub"]

        return dep

    def middleware(self) -> Callable:
        async def _middleware(request: Request, call_next):
            token = request.headers.get("Authorization", "")
            if token.startswith("Bearer "):
                token = token[7:]
                try:
                    payload = self._verify_token(token)
                    request.state.user = payload["sub"]
                    request.state.role = payload.get("role", "user")
                except HTTPException:
                    request.state.user = None
                    request.state.role = None
            else:
                request.state.user = None
                request.state.role = None
            response = await call_next(request)
            return response

        return _middleware

    def login_token(self, username: str, password: str) -> str:
        self.check_rate_limit(username)
        if not self.user_manager.verify_user(username, password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        role = self.user_manager.users[username].role
        return self._create_token(username, role)

    def get_user_info(self, username: str) -> dict:
        user = self.user_manager.users.get(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"username": user.username, "role": user.role}

    def login(self, request: Request, username: str, password: str) -> str:
        self.check_rate_limit(username)
        if not self.user_manager.verify_user(username, password):
            raise AuthenticationError("Invalid credentials")
        request.session["user"] = username
        return username

    def logout(self, request: Request) -> None:
        request.session.pop("user", None)

    def require_login(self, request: Request) -> str:
        user = request.session.get("user")
        if not user:
            raise AuthenticationError("Not authenticated")
        return user


