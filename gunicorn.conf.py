import os

# Render automatically sets PORT
port = os.environ.get("PORT", "10000")
bind = f"0.0.0.0:{port}"
workers = 1
threads = 4
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
wsgi_app = "backend.main:app"
