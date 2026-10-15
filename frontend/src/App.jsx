import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AudioUploader from './components/AudioUploader';
import LiveMicRecorder from './components/LiveMicRecorder';
import AudioCompare from './components/AudioCompare';
import MetricsCard from './components/MetricsCard';
import { Upload, Mic, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'mic'
  const [isProcessing, setIsProcessing] = useState(false);
  const [strength, setStrength] = useState(1.05);
  const [healthInfo, setHealthInfo] = useState(null);

  // Audio Results State
  const [noisyAudioUrl, setNoisyAudioUrl] = useState(null);
  const [enhancedAudioUrl, setEnhancedAudioUrl] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [currentFilename, setCurrentFilename] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch API Health & Hardware Diagnostics
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealthInfo(data))
      .catch(err => {
        console.warn('API health check error:', err);
        setHealthInfo({ gpu: 'Offline (Checking backend...)', status: 'pending' });
      });
  }, []);

  // Handle Audio File Enhancement
  const handleEnhanceFile = async (file, strengthValue) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('strength', strengthValue.toString());

      const res = await fetch(`${API_BASE_URL}/api/enhance`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setNoisyAudioUrl(data.noisy_audio_base64);
        setEnhancedAudioUrl(data.enhanced_audio_base64);
        setMetrics(data.metrics);
        setCurrentFilename(data.filename || file.name);

        // Smooth scroll to comparison section
        setTimeout(() => {
          document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error(data.detail || 'Enhancement failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing audio. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Preset Sample Load
  const handleLoadPreset = async (presetId) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/samples/${presetId}?strength=${strength}`);
      if (!res.ok) {
        throw new Error(`Failed to load preset sample: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setNoisyAudioUrl(data.noisy_audio_base64);
        setEnhancedAudioUrl(data.enhanced_audio_base64);
        setMetrics(data.metrics);
        setCurrentFilename(`preset_${presetId}`);

        setTimeout(() => {
          document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar healthInfo={healthInfo} />

      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px 60px 20px' }}>
        <HeroSection />

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FECDD3'
          }}>
            <AlertCircle size={20} color="var(--accent-rose)" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Mode Selector Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            id="tab-upload"
            className="btn-secondary"
            onClick={() => setActiveTab('upload')}
            style={{
              background: activeTab === 'upload' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: activeTab === 'upload' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: activeTab === 'upload' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'upload' ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none'
            }}
          >
            <Upload size={16} />
            <span>Upload Audio File</span>
          </button>

          <button
            id="tab-mic"
            className="btn-secondary"
            onClick={() => setActiveTab('mic')}
            style={{
              background: activeTab === 'mic' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: activeTab === 'mic' ? 'var(--accent-rose)' : 'var(--border-subtle)',
              color: activeTab === 'mic' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'mic' ? '0 0 16px rgba(244, 63, 94, 0.25)' : 'none'
            }}
          >
            <Mic size={16} />
            <span>Live Microphone Record</span>
          </button>
        </div>

        {/* Tab 1: File Uploader */}
        {activeTab === 'upload' && (
          <AudioUploader
            onEnhanceFile={handleEnhanceFile}
            onLoadPreset={handleLoadPreset}
            isProcessing={isProcessing}
            strength={strength}
            setStrength={setStrength}
          />
        )}

        {/* Tab 2: Live Mic Recorder */}
        {activeTab === 'mic' && (
          <LiveMicRecorder
            onEnhanceFile={handleEnhanceFile}
            isProcessing={isProcessing}
            strength={strength}
          />
        )}

        {/* Comparison & Metrics Section */}
        {enhancedAudioUrl && (
          <div id="comparison-section">
            <AudioCompare
              noisyAudioUrl={noisyAudioUrl}
              enhancedAudioUrl={enhancedAudioUrl}
              metrics={metrics}
              filename={currentFilename}
            />

            <MetricsCard metrics={metrics} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        background: 'rgba(7, 9, 14, 0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>AuraClear AI • Deep Learning Speech Enhancement</span>
          <span>•</span>
          <span>PyTorch U-Net with Skip Connections</span>
          <span>•</span>
          <span>Deployable on Render</span>
        </div>
      </footer>
    </div>
  );
}
