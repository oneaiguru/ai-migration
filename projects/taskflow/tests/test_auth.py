from pathlib import Path

import pytest
from utils import AuthenticationError
from fastapi.security import HTTPBasicCredentials

from auth import AuthManager


@pytest.fixture
def auth(tmp_path):
    user_file = tmp_path / "users.json"
    manager = AuthManager(str(user_file), rate_limit=2, window=60)
    manager.user_manager.add_user("user", "pass")
    return manager


def test_verify_user(auth):
    assert auth.user_manager.verify_user("user", "pass")
    assert not auth.user_manager.verify_user("user", "wrong")


def test_rate_limit(auth):
    credentials = HTTPBasicCredentials(username="user", password="wrong")
    with pytest.raises(AuthenticationError):
        auth._authenticate_basic(credentials)
    with pytest.raises(AuthenticationError):
        auth._authenticate_basic(credentials)
