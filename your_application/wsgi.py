"""
Compatibility entry point for default Render command: 'gunicorn your_application.wsgi'.
Maps cleanly to FastAPI backend.main:app.
"""
from backend.main import app as application
