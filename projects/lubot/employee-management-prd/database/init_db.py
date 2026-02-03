import os
import sys
from sqlalchemy import create_engine


# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)


from database.models import *
from config.settings import DATABASE_URL

from sqlalchemy.exc import OperationalError
import os
import subprocess

def init_db():
    alembic_config = "alembic.ini" if os.getenv('PROJECT_TYPE') == 'single' else "alembic_multi.ini"
    subprocess.run(["alembic", "-c", alembic_config, "upgrade", "head"])

if __name__ == "__main__":
    init_db()
