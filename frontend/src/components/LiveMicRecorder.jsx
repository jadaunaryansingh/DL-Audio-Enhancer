import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';

// Encode AudioBuffer to standard 16-bit PCM WAV Blob
function audioBufferToWav(buffer, targetRate = 16000) {
  // Downmix to mono
  let mono;
  if (buffer.numberOfChannels === 1) {
    mono = buffer.getChannelData(0);
  } else {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    mono = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }
  }

  // Resample if needed
  let samples = mono;
  if (buffer.sampleRate !== targetRate) {
    const ratio = buffer.sampleRate / targetRate;
    const newLen = Math.round(mono.length / ratio);
    samples = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) {
      const origIdx = Math.floor(i * ratio);
      samples[i] = mono[Math.min(origIdx, mono.length - 1)];
    }
  }

  // Build WAV container
  const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true);  // Linear quantization
  view.setUint16(22, 1, true);  // Mono channel
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true); // Byte rate
  view.setUint16(32, 2, true);  // Block align
  view.setUint16(34, 16, true); // 16 bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export default function LiveMicRecorder({ onEnhanceFile, isProcessing, strength }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const rawBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer, 16000);
          setRecordedBlob(wavBlob);
          audioCtx.close();
        } catch (e) {
          console.warn('Browser WAV conversion fallback to rawBlob:', e);
          const fallbackBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setRecordedBlob(fallbackBlob);
        }
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      alert("Microphone access denied or not available. Please allow microphone permissions in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDenoiseVoice = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], "live_recording.wav", { type: "audio/wav" });
      onEnhanceFile(file, strength);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', marginBottom: '32px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        margin: '0 auto 20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isRecording ? 'rgba(244, 63, 94, 0.15)' : 'rgba(6, 182, 212, 0.12)',
        border: `2px solid ${isRecording ? 'var(--accent-rose)' : 'var(--accent-cyan)'}`,
        boxShadow: isRecording ? '0 0 35px var(--accent-rose)' : '0 0 20px rgba(6, 182, 212, 0.25)',
        transition: 'all 0.3s ease'
      }}>
        <Mic size={36} color={isRecording ? 'var(--accent-rose)' : 'var(--accent-cyan)'} />
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
        {isRecording ? 'Listening to your microphone...' : 'Real-Time Microphone Denoising'}
      </h3>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
        Record a few seconds of your voice with background ambient noise to test AI voice isolation.
      </p>

      {/* Timer & Live Status */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.6rem',
        fontWeight: 700,
        color: isRecording ? 'var(--accent-rose)' : '#FFFFFF',
        marginBottom: '24px'
      }}>
        00:{recordTime < 10 ? `0${recordTime}` : recordTime} / 00:30
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!isRecording ? (
          <button
            id="start-record-btn"
            className="btn-primary"
            onClick={startRecording}
            disabled={isProcessing}
            style={{
              background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
              boxShadow: '0 4px 20px rgba(244, 63, 94, 0.4)'
            }}
          >
            <Mic size={18} />
            <span>{hasRecorded ? 'Record Again' : 'Start Recording'}</span>
          </button>
        ) : (
          <button
            id="stop-record-btn"
            className="btn-secondary"
            onClick={stopRecording}
            style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
          >
            <Square size={18} fill="currentColor" />
            <span>Stop Recording</span>
          </button>
        )}

        {hasRecorded && !isRecording && (
          <button
            id="enhance-mic-btn"
            className="btn-primary"
            onClick={handleDenoiseVoice}
            disabled={isProcessing}
          >
            <Sparkles size={18} />
            <span>Denoise My Voice</span>
          </button>
        )}
      </div>
    </div>
  );
}
