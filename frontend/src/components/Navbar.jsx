import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Sparkles, Volume2 } from 'lucide-react';

export default function Navbar({ healthInfo }) {
  return (
    <header className="navbar-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'relative',
      zIndex: 10,
      backdropFilter: 'blur(12px)',
      background: 'rgba(7, 9, 14, 0.75)'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px -2px rgba(6, 182, 212, 0.5)'
        }}>
          <Volume2 size={24} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
              Aura<span style={{ color: 'var(--accent-cyan)' }}>Clear</span>
            </span>
            <span className="badge-tech badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>AI</span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
            PyTorch Deep Learning Speech Restorer
          </p>
        </div>
      </div>

      {/* Hardware / Engine Status Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div className="badge-tech badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
            display: 'inline-block'
          }}></span>
          <span>{healthInfo?.gpu?.includes('None') ? 'CPU Engine' : (healthInfo?.gpu || 'Model Online')}</span>
        </div>

        <div className="badge-tech badge-violet" style={{ display: 'none', md: 'inline-flex' }}>
          <Cpu size={13} />
          <span>U-Net + Bi-GRU</span>
        </div>
      </div>
    </header>
  );
}
