import os
import sys
import time
import subprocess
import urllib.request
import shutil
import argparse

AZURE_BASE = "https://dns3public.blob.core.windows.net/dns3archive"

FAST_DATASET = [
    {
        "name": "DNS Challenge Dev/Test Set (Real Speech & Noise Audio)",
        "blob": "datasets/datasets.dev_testset.tar.bz2",
        "archive_size_mb": 159.4,
        "extract_check_dir": "DNS-Challenge/datasets/dev_testset"
    }
]

FULL_DATASETS = [
    {
        "name": "Noise Dataset (Wideband Noise)",
        "blob": "datasets/datasets.noise.tar.bz2",
        "archive_size_mb": 14270.0,
        "extract_check_dir": "DNS-Challenge/datasets/noise"
    },
    {
        "name": "Clean Speech Dataset (Wideband Read Speech)",
        "blob": "datasets/datasets.clean.read_speech.tar.bz2",
        "archive_size_mb": 38290.0,
        "extract_check_dir": "DNS-Challenge/datasets/clean/read_speech"
    }
]

def format_bytes(size):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} PB"

def download_file(url, target_path):
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    part_path = target_path + ".part"
    
    downloaded = 0
    if os.path.exists(part_path):
        downloaded = os.path.getsize(part_path)
        
    req = urllib.request.Request(url)
    if downloaded > 0:
        req.add_header("Range", f"bytes={downloaded}-")
        print(f"Resuming download from {format_bytes(downloaded)}...")
        
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content_length = resp.headers.get("Content-Length")
            status = resp.getcode()
            
            if status == 206 and content_length:
                total_size = int(content_length) + downloaded
            elif content_length:
                total_size = int(content_length)
                downloaded = 0
            else:
                total_size = None
                
            mode = "ab" if downloaded > 0 else "wb"
            chunk_size = 1024 * 1024  # 1 MB buffer
            last_print = time.time()
            start_time = time.time()
            bytes_this_session = 0
            
            with open(part_path, mode) as f:
                while True:
                    chunk = resp.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    bytes_this_session += len(chunk)
                    
                    now = time.time()
                    if now - last_print >= 1.0:
                        elapsed = now - start_time + 1e-4
                        speed = bytes_this_session / elapsed
                        if total_size:
                            pct = (downloaded / total_size) * 100
                            remaining = (total_size - downloaded) / (speed + 1e-4)
                            eta_m, eta_s = divmod(int(remaining), 60)
                            print(f"\r  Progress: {pct:5.1f}% | {format_bytes(downloaded)} / {format_bytes(total_size)} | Speed: {speed/(1024**2):5.1f} MB/s | ETA: {eta_m:02d}m {eta_s:02d}s", end="", flush=True)
                        else:
                            print(f"\r  Downloaded: {format_bytes(downloaded)} | Speed: {speed/(1024**2):5.1f} MB/s", end="", flush=True)
                        last_print = now
                        
            print()
            if os.path.exists(target_path):
                os.remove(target_path)
            os.rename(part_path, target_path)
            print(f"  Saved archive: {target_path}")
            return True
    except Exception as e:
        print(f"\n  Download paused/interrupted: {e}")
        print("  (Run again anytime to resume where it left off).")
        return False

def extract_archive(archive_path, target_dir):
    print(f"Extracting {archive_path} -> {target_dir}...")
    os.makedirs(target_dir, exist_ok=True)
    cmd = ["tar.exe", "-xjf", archive_path, "-C", target_dir]
    start = time.time()
    try:
        subprocess.run(cmd, check=True)
        print(f"Extraction completed in {time.time() - start:.1f}s!")
        return True
    except Exception as e:
        print(f"Error during extraction with tar.exe: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Download Microsoft DNS Challenge audio data.")
    parser.add_argument("--fast", action="store_true", help="Download the quick 159 MB real DNS test dataset (recommended for slow connections).")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dns_dir = os.path.join(base_dir, "DNS-Challenge")
    archives_dir = os.path.join(dns_dir, "archives")
    os.makedirs(archives_dir, exist_ok=True)
    
    # If not specified via flag, check FAST env var
    use_fast = args.fast or os.environ.get("DNS_FAST", "").lower() in ["1", "true"]

    selected_datasets = FAST_DATASET if use_fast else FULL_DATASETS

    print("=" * 65)
    print("      MICROSOFT DNS CHALLENGE DATASET DOWNLOADER      ")
    print("=" * 65)
    mode_str = "FAST MODE (~159 MB - Real DNS Audio)" if use_fast else "FULL DATASET (~53 GB Archive / ~85 GB Unpacked)"
    print(f"Selected Mode: {mode_str}")
    print("Target Destination: DNS-Challenge/datasets/")
    print("=" * 65)
    
    for item in selected_datasets:
        print(f"\n[{item['name']}]")
        check_path = os.path.join(base_dir, item["extract_check_dir"])
        
        if os.path.exists(check_path) and len(os.listdir(check_path)) > 5:
            print(f"Dataset already extracted at: {check_path}")
            continue
            
        url = f"{AZURE_BASE}/{item['blob']}"
        filename = item['blob'].split('/')[-1]
        archive_path = os.path.join(archives_dir, filename)
        
        # 1. Download
        if not os.path.exists(archive_path):
            size_str = f"{item['archive_size_mb']:.1f} MB" if item['archive_size_mb'] < 1000 else f"{item['archive_size_mb']/1024:.1f} GB"
            print(f"Downloading {filename} (~{size_str})...")
            success = download_file(url, archive_path)
            if not success:
                print(f"Stopping. You can rerun this script later to resume {filename}.")
                sys.exit(1)
        else:
            print(f"Archive already downloaded: {archive_path}")
            
        # 2. Extract
        success = extract_archive(archive_path, dns_dir)
        if success:
            print(f"Successfully extracted {item['name']} into {dns_dir}!")
            try:
                os.remove(archive_path)
                print(f"Removed archive {filename} to reclaim disk space.")
            except Exception:
                pass

    print("\n" + "=" * 65)
    print("DATASET DOWNLOAD & EXTRACTION COMPLETE!")
    print("=" * 65)

if __name__ == "__main__":
    main()
