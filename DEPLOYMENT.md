# Deploying AuraClear AI to Render

This project is configured for **1-Click Free Tier Deployment** on [Render](https://render.com).

The FastAPI backend automatically serves the built React frontend as static assets, allowing you to deploy both frontend and backend together as a **single, unified Web Service** (no cross-origin CORS issues, 100% free tier eligible).

---

## Deployment Option 1: Automatic Blueprint (Recommended)

1. Push this repository to **GitHub** or **GitLab**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AuraClear AI"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. Open the [Render Dashboard](https://dashboard.render.com).
3. Click **"New +"** in the top right corner and select **"Blueprint"**.
4. Connect your GitHub repository.
5. Render will automatically detect [`render.yaml`](file:///c:/Users/ARYAN%20SINGH%20JADAUN/Documents/Projects@Me/DL%20Audio%20enhancer/render.yaml) and configure:
   - **Environment**: Python 3.11.9 + Node.js 20.12.0
   - **Build Command**: `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Click **"Apply"** and wait ~2–3 minutes for the build to finish. Your app will be live with a free `https://<app-name>.onrender.com` SSL domain!

---

## Deployment Option 2: Manual Web Service

1. On the Render Dashboard, click **"New +"** -> **"Web Service"**.
2. Connect your repository.
3. Configure the following fields:
   - **Name**: `auraclear-audio-enhancer`
   - **Region**: Any (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`
4. Click **"Create Web Service"**.

---

## Local Development

To run locally in development mode:

### 1. Start the FastAPI Backend
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Vite React Frontend (with Hot Reload)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser. All `/api` requests will proxy to the FastAPI server.
