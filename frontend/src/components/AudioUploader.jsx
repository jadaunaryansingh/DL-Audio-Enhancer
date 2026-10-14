import React, { useState, useRef } from 'react';
import { Upload, Mic, Sliders, Play, FileAudio, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AudioUploader({
  onEnhanceFile,
  onLoadPreset,
  isProcessing,
  strength,
  setStrength
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes("audio") || file.name.match(/\.(wav|mp3|ogg|m4a|flac|webm)$/i)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onEnhanceFile(selectedFile, strength);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
      {/* Upload Zone */}
      <div
        id="drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)'}`,
          background: dragActive ? 'rgba(6, 182, 212, 0.08)' : 'rgba(15, 23, 42, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '44px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          marginBottom: '28px',
          boxShadow: dragActive ? '0 0 25px rgba(6, 182, 212, 0.2)' : 'none'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="audio-file-input"
          accept="audio/*,.wav,.mp3,.ogg,.m4a,.flac,.webm"
          style={{ display: 'none' }}
          onChange={handleChange}
        />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: 'var(--accent-cyan)'
        }}>
          {selectedFile ? <FileAudio size={32} /> : <Upload size={30} />}
        </div>

        {selectedFile ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>{selectedFile.name}</p>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '6px' }}>
              Drag & Drop your noisy audio file here
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Supports WAV, MP3, FLAC, OGG, WebM (up to 50 MB)
            </p>
          </div>
        )}
      </div>

      {/* Denoising Strength Slider */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-cyan)" />
            <label htmlFor="strength-slider" style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              Denoising Aggressiveness
            </label>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)'
          }}>
            {strength.toFixed(2)}x ({strength < 1.0 ? 'Gentle' : strength > 1.2 ? 'Heavy' : 'Balanced'})
          </span>
        </div>
        <input
          type="range"
          id="strength-slider"
          min="0.7"
          max="1.4"
          step="0.05"
          value={strength}
          onChange={(e) => setStrength(parseFloat(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Gentle (Soft Hiss)</span>
          <span>Optimal (Voice Focus)</span>
          <span>Aggressive (Heavy Rumble)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          id="enhance-button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!selectedFile || isProcessing}
          style={{ minWidth: '220px', height: '52px' }}
        >
          {isProcessing ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <span>Processing Spectral U-Net...</span>
            </>
          ) : (
            <>
              <Play size={18} fill="#FFFFFF" />
              <span>Denoise Audio Now</span>
            </>
          )}
        </button>
      </div>

      {/* Instant Demo Presets */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Or try instant 1-click test presets
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="preset-office-btn"
            className="btn-secondary"
            onClick={() => onLoadPreset('office')}
            disabled={isProcessing}
          >
            <span>⌨️ Office Typing & Chatter</span>
          </button>
          <button
            id="preset-fan-btn"
            className="btn-secondary"
            onClick={() => onLoadPreset('fan')}
            disabled={isProcessing}
          >
            <span>🌀 HVAC Fan Hum</span>
          </button>
          <button
            id="preset-traffic-btn"
            className="btn-secondary"
            onClick={() => onLoadPreset('traffic')}
            disabled={isProcessing}
          >
            <span>🚗 Road Traffic Rumble</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
