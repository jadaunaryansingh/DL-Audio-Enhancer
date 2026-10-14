import React from 'react';
import { TrendingUp, VolumeX, Zap, CheckCircle, Radio } from 'lucide-react';

export default function MetricsCard({ metrics }) {
  if (!metrics) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} color="var(--accent-cyan)" />
        <span>Objective Denoising Telemetry</span>
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Metric 1: SNR Boost */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            <Zap size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SNR Improvement
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginBottom: '4px' }}>
            +{metrics.snr_boost_db} dB
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Boosted from {metrics.estimated_input_snr} dB to {metrics.estimated_output_snr} dB
          </p>
        </div>

        {/* Metric 2: Noise Energy Removed */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', marginBottom: '8px' }}>
            <VolumeX size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Noise Power Removed
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginBottom: '4px' }}>
            {metrics.noise_removed_pct}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Acoustic noise energy eliminated
          </p>
        </div>

        {/* Metric 3: Volume Match (AGC) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-violet)', marginBottom: '8px' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Voice Volume Match
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginBottom: '4px' }}>
            100%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Automatic Gain Control (RMS normalized)
          </p>
        </div>

        {/* Metric 4: Latency */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', marginBottom: '8px' }}>
            <Radio size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inference Latency
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginBottom: '4px' }}>
            {metrics.latency_ms} ms
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Duration: {metrics.duration_sec}s @ {metrics.sample_rate / 1000} kHz
          </p>
        </div>
      </div>
    </div>
  );
}
