import os
import glob
import platform
import subprocess
import soundfile as sf
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from backend.model import load_model
from backend.enhancer import read_audio_bytes, wav_to_base64, enhance_audio

app = FastAPI(
    title="Deep Learning Audio Enhancer API",
    description="High-fidelity AI speech denoising with U-Net & GRU bottleneck",
    version="1.0.0"
)

# Enable CORS for local React development and Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dl-audio-enhancer.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_cpu_info():
    try:
        if platform.system() == "Windows":
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
            name, _ = winreg.QueryValueEx(key, "ProcessorNameString")
            return name.strip()
        elif platform.system() == "Darwin":
            return subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"]).decode().strip()
        elif platform.system() == "Linux":
            with open("/proc/cpuinfo", "r") as f:
                for line in f:
                    if "model name" in line:
                        return line.split(":", 1)[1].strip()
    except Exception:
        pass
    return platform.processor() or "CPU"

# Initialize model on startup
CHECKPOINT_PATH = "audio_enhancer_model.pth"
model, device = load_model(CHECKPOINT_PATH)


@app.get("/api/health")
def health_check():
    import torch
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None (CPU Mode)"
    vram = f"{torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB" if torch.cuda.is_available() else "N/A"
    
    return {
        "status": "healthy",
        "device": str(device),
        "os": f"{platform.system()} {platform.release()}",
        "cpu": get_cpu_info(),
        "gpu": gpu_name,
        "vram": vram,
        "pytorch_version": torch.__version__,
        "model_loaded": model is not None
    }


@app.post("/api/enhance")
async def enhance_endpoint(
    file: UploadFile = File(...),
    strength: float = Form(1.05)
):
    try:
        contents = await file.read()
        if not contents or len(contents) < 100:
            raise HTTPException(status_code=400, detail="Uploaded file is empty or invalid.")
            
        # Decode and resample audio
        try:
            audio_data, sr = read_audio_bytes(contents)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Audio format decoding error: {str(e)}")

        if len(audio_data) < 1600:
            raise HTTPException(status_code=400, detail="Audio file is too short (minimum 0.1s required).")

        # Perform enhancement
        result = enhance_audio(audio_data, model, device, strength=strength)
        
        # Convert to Base64 WAV for web playback
        enhanced_b64 = wav_to_base64(result["enhanced_audio"], sr)
        noisy_b64 = wav_to_base64(result["input_audio"], sr)

        return JSONResponse({
            "success": True,
            "filename": file.filename,
            "enhanced_audio_base64": f"data:audio/wav;base64,{enhanced_b64}",
            "noisy_audio_base64": f"data:audio/wav;base64,{noisy_b64}",
            "metrics": result["metrics"]
        })

    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "detail": str(e)})


@app.get("/api/samples")
def list_demo_samples():
    """
    Returns list of ready-to-test demo samples.
    """
    samples = [
        {
            "id": "office",
            "name": "Office Keyboard & Chatter",
            "description": "Speech with background mechanical typing and office room noise",
            "noise_type": "Typing & Chatter"
        },
        {
            "id": "traffic",
            "name": "Street Traffic & Rumble",
            "description": "Speech recorded near vehicle traffic and low-frequency engine rumble",
            "noise_type": "Traffic & Rumble"
        },
        {
            "id": "fan",
            "name": "HVAC / Fan Hum",
            "description": "Continuous 50/60Hz electrical hum and ventilation fan hiss",
            "noise_type": "HVAC Fan"
        }
    ]
    return samples


@app.get("/api/samples/{sample_id}")
def get_sample_audio(sample_id: str, strength: float = 1.05):
    """
    Generates and returns demo audio mixture + enhanced output for immediate 1-click preview.
    Uses self-contained sample audio files in backend/sample_audio/.
    """
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_audio")
    sample_file = os.path.join(sample_dir, f"{sample_id}_sample.wav")
    
    if not os.path.exists(sample_file):
        candidates = glob.glob(os.path.join(sample_dir, "*.wav"))
        if candidates:
            sample_file = candidates[0]
        else:
            raise HTTPException(status_code=404, detail="Sample audio file not found on server.")
            
    noisy_data, sr = sf.read(sample_file, dtype="float32")
    if noisy_data.ndim > 1:
        noisy_data = noisy_data.mean(axis=1)
        
    result = enhance_audio(noisy_data.astype(np.float32), model, device, strength=strength)
    enhanced_b64 = wav_to_base64(result["enhanced_audio"], sr)
    noisy_b64 = wav_to_base64(result["input_audio"], sr)
    
    return {
        "success": True,
        "sample_id": sample_id,
        "enhanced_audio_base64": f"data:audio/wav;base64,{enhanced_b64}",
        "noisy_audio_base64": f"data:audio/wav;base64,{noisy_b64}",
        "metrics": result["metrics"]
    }


# Mount built React static files if present (for Render production)
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
