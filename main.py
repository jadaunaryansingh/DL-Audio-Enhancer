"""
Root-level entry point forwarding to the FastAPI application.
Ensures seamless deployment whether Render runs from repository root or backend/ directory.
"""
from backend.main import app

__all__ = ["app"]
