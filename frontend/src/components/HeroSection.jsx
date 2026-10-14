import React, { useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, Zap, AudioWaveform } from 'lucide-react';

export default function HeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 48;
      const barWidth = width / bars - 4;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 4);
        const norm = i / bars;
        // Dual harmonic wave
        const wave = Math.sin(norm * Math.PI * 4 + phase) * Math.cos(norm * Math.PI * 2 - phase * 0.5);
        const h = Math.max(8, Math.abs(wave) * (height * 0.75) + Math.sin(phase + i) * 6);
        const y = (height - h) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(0.5, '#3B82F6');
        grad.addColorStop(1, '#8B5CF6');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 3);
        ctx.fill();
      }

      phase += 0.035;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section style={{
      textAlign: 'center',
      padding: '48px 20px 24px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Pill Badge */}
      <div style={{ display: 'inline-flex', marginBottom: '18px' }}>
        <div className="badge-tech badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }}>
          <Sparkles size={14} />
          <span>Microsoft DNS Challenge Trained U-Net</span>
        </div>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: '16px',
        maxWidth: '920px',
        margin: '0 auto 16px auto'
      }}>
        Eliminate Noise. <span className="gradient-text">Restore Voice.</span><br />
        Pure Studio Clarity in Real-Time.
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.18rem)',
        color: 'var(--text-secondary)',
        maxWidth: '680px',
        margin: '0 auto 32px auto',
        lineHeight: 1.6
      }}>
        Trained on 5,000+ clean human speech recordings with intelligent Automatic Gain Control.
        Cancels fans, AC hum, road traffic, and keyboard clicks without muffling speech.
      </p>

      {/* Decorative Canvas Visualizer */}
      <div style={{
        maxWidth: '740px',
        margin: '0 auto 20px auto',
        padding: '16px 20px',
        background: 'rgba(15, 23, 42, 0.45)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 0 35px -10px rgba(6, 182, 212, 0.15)'
      }}>
        <canvas
          ref={canvasRef}
          width={680}
          height={64}
          style={{ width: '100%', height: '54px', display: 'block' }}
        />
      </div>
    </section>
  );
}
