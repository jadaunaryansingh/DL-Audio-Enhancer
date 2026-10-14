import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Sparkles, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export default function AudioCompare({ noisyAudioUrl, enhancedAudioUrl, metrics, filename }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('enhanced'); // 'enhanced' or 'noisy'
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);

  const audioRef = useRef(null);

  // Switch between clean and noisy smoothly while keeping current playback position!
  const toggleTrack = () => {
    const nextTrack = currentTrack === 'enhanced' ? 'noisy' : 'enhanced';
    const wasPlaying = isPlaying;
    const pos = audioRef.current ? audioRef.current.currentTime : 0;
    
    setCurrentTrack(nextTrack);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = pos;
        if (wasPlaying) {
          audioRef.current.play();
        }
      }
    }, 50);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeSrc = currentTrack === 'enhanced' ? enhancedAudioUrl : noisyAudioUrl;

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '32px', marginBottom: '32px' }}>
      <audio
        ref={audioRef}
        src={activeSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header & A/B Track Pill */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
            Interactive A/B Audio Comparison
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Toggle in real time between raw noisy audio and studio-cleaned AI output.
          </p>
        </div>

        {/* Toggle Switch */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            id="switch-noisy-btn"
            onClick={() => {
              if (currentTrack !== 'noisy') toggleTrack();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: currentTrack === 'noisy' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: currentTrack === 'noisy' ? 'var(--accent-rose)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={14} />
            <span>Raw Input (Noisy)</span>
          </button>

          <button
            id="switch-enhanced-btn"
            onClick={() => {
              if (currentTrack !== 'enhanced') toggleTrack();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: currentTrack === 'enhanced' ? 'linear-gradient(135deg, #06B6D4, #8B5CF6)' : 'transparent',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: currentTrack === 'enhanced' ? '0 0 16px rgba(6, 182, 212, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={14} />
            <span>AI Cleaned (Enhanced)</span>
          </button>
        </div>
      </div>

      {/* Visualizer & Playing Indicator Box */}
      <div style={{
        background: currentTrack === 'enhanced' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(244, 63, 94, 0.05)',
        border: `1px solid ${currentTrack === 'enhanced' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '24px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: currentTrack === 'enhanced' ? 'var(--accent-cyan)' : 'var(--accent-rose)',
              boxShadow: `0 0 12px ${currentTrack === 'enhanced' ? 'var(--accent-cyan)' : 'var(--accent-rose)'}`
            }}></span>
            <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Currently Playing: {currentTrack === 'enhanced' ? 'AI Speech Restored (Gain Matched)' : 'Original Background Noisy Track'}
            </span>
          </div>

          <button
            id="quick-toggle-track-btn"
            className="btn-secondary"
            onClick={toggleTrack}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <ArrowRightLeft size={14} />
            <span>Switch to {currentTrack === 'enhanced' ? 'Noisy' : 'Enhanced'}</span>
          </button>
        </div>

        {/* Scrubber & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            style={{
              accentColor: currentTrack === 'enhanced' ? 'var(--accent-cyan)' : 'var(--accent-rose)'
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Media Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Main Play / Pause Button */}
          <button
            id="play-pause-btn"
            onClick={handlePlayPause}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            {isPlaying ? <Pause size={24} fill="#FFFFFF" /> : <Play size={24} fill="#FFFFFF" style={{ marginLeft: '3px' }} />}
          </button>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="var(--text-muted)" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: '85px' }}
            />
          </div>
        </div>

        {/* Download Cleaned Audio Button */}
        <a
          id="download-enhanced-btn"
          href={enhancedAudioUrl}
          download={filename ? `enhanced_${filename}.wav` : "auraclear_enhanced_speech.wav"}
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <Download size={18} />
          <span>Download Enhanced WAV</span>
        </a>
      </div>
    </div>
  );
}
