'use client';
import { useState, useEffect, useCallback } from 'react';
import { initDuplex, stopDuplex } from '@/lib/duplex';

const WarningIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FemaleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px auto', display: 'block' }}>
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v6M9 18h6" />
  </svg>
);

const MaleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px auto', display: 'block' }}>
    <circle cx="10" cy="14" r="6" />
    <path d="M14 10l6-6M14 4h6v6" />
  </svg>
);

export default function DuplexToggle({ isDuplex, onToggle, voiceGender, onVoiceGenderChange, onDuplexStateChange }) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    if (typeof window !== 'undefined' && speechSynthesis) {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => { if (speechSynthesis) speechSynthesis.onvoiceschanged = null; };
  }, []);

  const currentGender = voiceGender || 'female';

  const handleToggle = useCallback(async () => {
    setError(null);

    if (isDuplex) {
      // Turn off — use parent handler
      onToggle();
      return;
    }

    // Turn on — MUST be inside click handler (user gesture)
    setIsLoading(true);

    const success = await initDuplex({
      onSpeechStart: () => onDuplexStateChange?.('speech_start'),
      onSpeechEnd:   (audio) => onDuplexStateChange?.('speech_end', audio),
      onVADMisfire:  () => {},
      onError: (msg) => {
        setError(msg);
        setIsLoading(false);
      },
    });

    setIsLoading(false);
    if (success) {
      onToggle(); // Tell parent duplex is on
    }
  }, [isDuplex, onToggle, onDuplexStateChange]);

  return (
    <div className={`duplex-card ${isDuplex ? 'on' : ''} ${error ? 'error' : ''}`} id="duplex-toggle">
      <div className="duplex-header">
        <div className="duplex-title">
          <span>FULL DUPLEX</span>
          {isDuplex && <span className="duplex-live-dot" />}
        </div>
      </div>

      <p className="duplex-desc">
        {isDuplex
          ? <>Always listening. <strong>Speak anytime</strong>, interrupt freely.
          JARVIS adapts mid-sentence.</>
          : <>Like a phone call — speak anytime, interrupt freely.
          <em>Hold mic 2s</em> when off.</>
        }
      </p>

      {error && (
        <div className="duplex-error">
          <span className="duplex-error-icon" style={{ display: 'flex', alignItems: 'center' }}><WarningIcon size={14} /></span>
          <span className="duplex-error-text">{error}</span>
        </div>
      )}

      <div className="toggle-switch" onClick={handleToggle} role="button" tabIndex={0}>
        <div className={`toggle-track ${isDuplex ? 'on' : ''} ${isLoading ? 'loading' : ''}`}>
          <div className="toggle-thumb" />
        </div>
        <span className="toggle-label">
          {isLoading ? 'STARTING...' : isDuplex ? 'ON' : 'OFF'}
        </span>
      </div>

      {!isDuplex && !error && (
        <p className="duplex-hint">
          First time? Browser will ask for mic permission — click Allow.
        </p>
      )}

      {/* Voice Agent Gender Selection */}
      <div className="voice-gender-section">
        <div className="voice-gender-label">VOICE AGENT</div>
        <div className="voice-gender-subtitle">Indian Neutral English Accent</div>
        <div className="voice-gender-options">
          <button
            className={`voice-gender-btn ${currentGender === 'female' ? 'active' : ''}`}
            onClick={() => onVoiceGenderChange('female')}
            id="voice-female-btn"
          >
            <div className="voice-gender-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}><FemaleIcon size={18} /></div>
            <div className="voice-gender-name">Female</div>
            <div className="voice-gender-desc">Soft & Natural</div>
          </button>
          <button
            className={`voice-gender-btn ${currentGender === 'male' ? 'active' : ''}`}
            onClick={() => onVoiceGenderChange('male')}
            id="voice-male-btn"
          >
            <div className="voice-gender-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}><MaleIcon size={18} /></div>
            <div className="voice-gender-name">Male</div>
            <div className="voice-gender-desc">Calm & Clear</div>
          </button>
        </div>
      </div>
    </div>
  );
}
